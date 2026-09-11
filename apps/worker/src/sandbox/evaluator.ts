import mongoose from 'mongoose';
import { DockerSandbox } from './dockerRunner';
import {
  JudgeJobPayload,
  JudgeExecutionResult,
  ISampleRunResponse,
  ISampleCaseResult,
  Verdict,
  Verdicts,
  diffOutput,
} from '@entropy-oj/shared';

export interface ITestCaseModel {
  _id?: any;
  problem?: any;
  input: string;
  output: string;
  isSample?: boolean;
  order?: number;
}

export async function evaluateSubmission(
  job: JudgeJobPayload,
  testCases: ITestCaseModel[]
): Promise<JudgeExecutionResult> {
  const { submissionId, code, language, timeLimitMs, memoryLimitKb } = job;
  const sandbox = await DockerSandbox.create();

  try {
    // 1. Prepare source code file
    await sandbox.prepareSourceFile(code, language);

    // 2. Compilation Step (Decision R4)
    const compileRes = await sandbox.compile(language, 10000);
    if (!compileRes.success) {
      return {
        submissionId,
        verdict: Verdicts.COMPILATION_ERROR,
        compileOutput: compileRes.compileOutput || 'Compilation failed with errors',
        executionTime: 0,
        memoryUsed: 0,
        totalTestCases: testCases.length,
        passedTestCases: 0,
      };
    }

    let maxTimeMs = 0;
    let maxMemoryKb = 0;
    let passedCount = 0;

    // 3. Sequential Test Case Execution with Fail-Fast (Decision R1)
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const testCaseNumber = i + 1;

      const runRes = await sandbox.runTestCase(
        tc.input,
        language,
        timeLimitMs,
        memoryLimitKb
      );

      const metrics = runRes.metrics;
      maxTimeMs = Math.max(maxTimeMs, metrics.cpuTimeMs);
      maxMemoryKb = Math.max(maxMemoryKb, metrics.maxRssKb);

      // Check Container OOM Kill (Docker killed container with exit 137 / SIGKILL)
      if (runRes.isOomKilled || metrics.exitCode === 137 || metrics.processExitStatus === 137) {
        return {
          submissionId,
          verdict: Verdicts.MEMORY_LIMIT_EXCEEDED,
          executionTime: maxTimeMs,
          memoryUsed: Math.max(maxMemoryKb, memoryLimitKb),
          failedTestCaseNumber: testCaseNumber,
          totalTestCases: testCases.length,
          passedTestCases: passedCount,
        };
      }

      // Check Time Limit Exceeded (Decision R3: CPU time, hard wall timeout, or sleeping code wall limit)
      if (
        runRes.timedOut ||
        metrics.cpuTimeMs > timeLimitMs ||
        metrics.wallTimeSec * 1000 > timeLimitMs * 1.5
      ) {
        return {
          submissionId,
          verdict: Verdicts.TIME_LIMIT_EXCEEDED,
          executionTime: Math.max(maxTimeMs, timeLimitMs),
          memoryUsed: maxMemoryKb,
          failedTestCaseNumber: testCaseNumber,
          totalTestCases: testCases.length,
          passedTestCases: passedCount,
        };
      }

      // Check Memory Limit Exceeded
      if (metrics.maxRssKb > memoryLimitKb) {
        return {
          submissionId,
          verdict: Verdicts.MEMORY_LIMIT_EXCEEDED,
          executionTime: maxTimeMs,
          memoryUsed: maxMemoryKb,
          failedTestCaseNumber: testCaseNumber,
          totalTestCases: testCases.length,
          passedTestCases: passedCount,
        };
      }

      // Check Runtime Error (non-zero process exit or abnormal signal)
      if (metrics.exitCode !== 0 || metrics.processExitStatus !== 0) {
        const runtimeErrOutput = runRes.stderr?.trim()
          ? runRes.stderr.slice(0, 16384).trim()
          : `Process exited with code ${metrics.exitCode || metrics.processExitStatus}`;

        return {
          submissionId,
          verdict: Verdicts.RUNTIME_ERROR,
          compileOutput: runtimeErrOutput,
          executionTime: maxTimeMs,
          memoryUsed: maxMemoryKb,
          failedTestCaseNumber: testCaseNumber,
          totalTestCases: testCases.length,
          passedTestCases: passedCount,
        };
      }

      // Sentinel Check: If container produced no metrics, no output, and no exit status, treat as INTERNAL_ERROR
      if (
        metrics.wallTimeSec === 0 &&
        metrics.cpuTimeMs === 0 &&
        metrics.maxRssKb === 0 &&
        !runRes.actualOutput &&
        !runRes.stderr &&
        tc.output.trim().length > 0
      ) {
        return {
          submissionId,
          verdict: Verdicts.INTERNAL_ERROR,
          compileOutput: `Judge sandbox produced no execution metrics for test case ${testCaseNumber}.`,
          executionTime: 0,
          memoryUsed: 0,
          failedTestCaseNumber: testCaseNumber,
          totalTestCases: testCases.length,
          passedTestCases: passedCount,
        };
      }

      // Check Output Correctness with Whitespace-tolerant diff (Decision R2)
      const diff = diffOutput(runRes.actualOutput, tc.output);
      if (!diff.isMatch) {
        return {
          submissionId,
          verdict: Verdicts.WRONG_ANSWER,
          executionTime: maxTimeMs,
          memoryUsed: maxMemoryKb,
          failedTestCaseNumber: testCaseNumber,
          totalTestCases: testCases.length,
          passedTestCases: passedCount,
        };
      }

      passedCount++;
    }

    // All test cases passed!
    return {
      submissionId,
      verdict: Verdicts.ACCEPTED,
      executionTime: maxTimeMs,
      memoryUsed: maxMemoryKb,
      totalTestCases: testCases.length,
      passedTestCases: passedCount,
    };
  } catch (error: any) {
    console.error(`[Evaluator] Error evaluating submission ${submissionId}:`, error);
    return {
      submissionId,
      verdict: Verdicts.INTERNAL_ERROR,
      compileOutput: `Internal judge execution error: ${error.message || 'Unknown failure'}`,
      executionTime: 0,
      memoryUsed: 0,
      totalTestCases: testCases.length,
      passedTestCases: 0,
    };
  } finally {
    await sandbox.cleanup();
  }
}

export async function evaluateSampleRun(
  job: JudgeJobPayload,
  sampleCases: ITestCaseModel[]
): Promise<ISampleRunResponse> {
  const { code, language, timeLimitMs, memoryLimitKb } = job;
  const sandbox = await DockerSandbox.create();

  try {
    await sandbox.prepareSourceFile(code, language);
    const compileRes = await sandbox.compile(language, 10000);
    if (!compileRes.success) {
      return {
        verdict: Verdicts.COMPILATION_ERROR,
        totalCases: sampleCases.length,
        passedCases: 0,
        compileOutput: compileRes.compileOutput || 'Compilation failed with errors',
        sampleResults: [],
      };
    }

    const sampleResults: ISampleCaseResult[] = [];
    let passedCount = 0;
    let overallVerdict: Verdict = Verdicts.ACCEPTED;

    for (let i = 0; i < sampleCases.length; i++) {
      const sc = sampleCases[i];
      const caseIndex = i + 1;

      const runRes = await sandbox.runTestCase(
        sc.input,
        language,
        timeLimitMs,
        memoryLimitKb
      );

      const diff = diffOutput(runRes.actualOutput, sc.output);
      let caseVerdict: Verdict = Verdicts.ACCEPTED;

      if (runRes.timedOut || runRes.metrics.cpuTimeMs > timeLimitMs) {
        caseVerdict = Verdicts.TIME_LIMIT_EXCEEDED;
      } else if (runRes.metrics.maxRssKb > memoryLimitKb) {
        caseVerdict = Verdicts.MEMORY_LIMIT_EXCEEDED;
      } else if (runRes.metrics.exitCode !== 0 || runRes.metrics.processExitStatus !== 0) {
        caseVerdict = Verdicts.RUNTIME_ERROR;
      } else if (!diff.isMatch) {
        caseVerdict = Verdicts.WRONG_ANSWER;
      }

      const passed = caseVerdict === Verdicts.ACCEPTED;
      if (passed) {
        passedCount++;
      } else if (overallVerdict === Verdicts.ACCEPTED) {
        overallVerdict = caseVerdict;
      }

      sampleResults.push({
        caseIndex,
        input: sc.input,
        expectedOutput: sc.output,
        actualOutput: runRes.actualOutput,
        passed,
        verdict: caseVerdict,
        executionTimeMs: runRes.metrics.cpuTimeMs,
        memoryUsedKb: runRes.metrics.maxRssKb,
        error: runRes.stderr || undefined,
      });
    }

    return {
      verdict: overallVerdict,
      totalCases: sampleCases.length,
      passedCases: passedCount,
      sampleResults,
    };
  } finally {
    await sandbox.cleanup();
  }
}

