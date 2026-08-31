import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Solution } from '../models/Solution';
import { Problem } from '../models/Problem';
import { AuthRequest } from '../middlewares/auth.middleware';
import { enqueueSubmission } from '../queues/submission.queue';
import { DockerSandbox } from '../sandbox/dockerRunner';
import {
  CreateSubmissionInput,
  RunSampleInput,
  Verdicts,
  ISubmissionResponse,
  ISubmissionHistoryItem,
  ISampleRunResponse,
  ISampleCaseResult,
  diffOutput,
} from '@anti-oj/shared';

export async function createSubmission(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  let createdSolutionId: mongoose.Types.ObjectId | null = null;
  let targetProblemId: mongoose.Types.ObjectId | null = null;

  try {
    const { problemId, language, code } = req.body as CreateSubmissionInput;
    const userId = req.userId!;

    // Validate problem existence
    let problemQuery: Record<string, unknown>;
    if (mongoose.Types.ObjectId.isValid(problemId)) {
      problemQuery = { $or: [{ _id: problemId }, { problemCode: problemId.toLowerCase() }] };
    } else {
      problemQuery = { problemCode: problemId.toLowerCase() };
    }

    const problem = await Problem.findOne(problemQuery);
    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
      return;
    }

    targetProblemId = problem._id as mongoose.Types.ObjectId;

    // Check for pending submissions to prevent spamming
    const existingPending = await Solution.findOne({
      user: userId,
      problem: problem._id,
      verdict: Verdicts.PENDING,
    });

    if (existingPending) {
      res.status(429).json({
        success: false,
        error: 'You already have an evaluation in progress for this problem. Please wait.',
      });
      return;
    }

    // Create Solution record in Pending state
    const solution = await Solution.create({
      user: userId,
      problem: problem._id,
      code,
      language,
      verdict: Verdicts.PENDING,
      submittedAt: new Date(),
    });

    createdSolutionId = solution._id as mongoose.Types.ObjectId;

    // Increment problem totalSubmissions counter
    await Problem.findByIdAndUpdate(problem._id, { $inc: { totalSubmissions: 1 } });

    // Enqueue submission to BullMQ worker queue
    try {
      await enqueueSubmission({
        submissionId: solution._id.toString(),
        problemId: problem._id.toString(),
        userId,
        code,
        language,
        timeLimitMs: problem.timeLimitMs,
        memoryLimitKb: problem.memoryLimitKb,
      });
    } catch (queueErr) {
      // Compensating rollback if enqueueing fails
      console.error('[Submission] Enqueue failed. Rolling back database records...', queueErr);
      await Solution.findByIdAndDelete(solution._id);
      await Problem.findByIdAndUpdate(problem._id, { $inc: { totalSubmissions: -1 } });
      throw queueErr;
    }

    const response: ISubmissionResponse = {
      submissionId: solution._id.toString(),
      status: Verdicts.PENDING,
      verdict: solution.verdict,
      problemId: problem._id.toString(),
      problemCode: problem.problemCode,
      problemName: problem.name,
      language: solution.language,
      submittedAt: solution.submittedAt,
    };

    res.status(201).json({
      success: true,
      message: 'Submission queued for evaluation',
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Live Sample Runner: Executes code against problem sample cases using sandboxed runner
 */
export async function runSampleCases(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  let sandbox: DockerSandbox | null = null;
  try {
    const { problemId, language, code } = req.body as RunSampleInput;

    let problemQuery: Record<string, unknown>;
    if (mongoose.Types.ObjectId.isValid(problemId)) {
      problemQuery = { $or: [{ _id: problemId }, { problemCode: problemId.toLowerCase() }] };
    } else {
      problemQuery = { problemCode: problemId.toLowerCase() };
    }

    const problem = await Problem.findOne(problemQuery);
    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
      return;
    }

    const sampleCases = problem.sampleCases || [];
    if (sampleCases.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          verdict: Verdicts.ACCEPTED,
          totalCases: 0,
          passedCases: 0,
          sampleResults: [],
        },
      });
      return;
    }

    sandbox = await DockerSandbox.create();
    await sandbox.prepareSourceFile(code, language);

    // Compilation step
    const compileRes = await sandbox.compile(language, 10000);
    if (!compileRes.success) {
      const sampleResults: ISampleCaseResult[] = sampleCases.map((sc, i) => ({
        caseIndex: i + 1,
        input: sc.input,
        expectedOutput: sc.output,
        actualOutput: compileRes.compileOutput || 'Compilation error',
        passed: false,
        verdict: Verdicts.COMPILATION_ERROR,
        executionTimeMs: 0,
        memoryUsedKb: 0,
        error: compileRes.compileOutput,
      }));

      res.status(200).json({
        success: true,
        data: {
          verdict: Verdicts.COMPILATION_ERROR,
          totalCases: sampleCases.length,
          passedCases: 0,
          sampleResults,
        },
      });
      return;
    }

    // Process each sample case with live sandboxed execution and diffing
    const sampleResults: ISampleCaseResult[] = [];
    let passedCount = 0;
    let overallVerdict: string = Verdicts.ACCEPTED;

    for (let i = 0; i < sampleCases.length; i++) {
      const sc = sampleCases[i];
      const caseIndex = i + 1;

      const runRes = await sandbox.runTestCase(
        sc.input,
        language,
        problem.timeLimitMs,
        problem.memoryLimitKb
      );

      const diff = diffOutput(runRes.actualOutput, sc.output);
      let caseVerdict: string = Verdicts.ACCEPTED;

      if (runRes.timedOut || runRes.metrics.cpuTimeMs > problem.timeLimitMs) {
        caseVerdict = Verdicts.TIME_LIMIT_EXCEEDED;
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
        verdict: caseVerdict as any,
        executionTimeMs: runRes.metrics.cpuTimeMs,
        memoryUsedKb: runRes.metrics.maxRssKb,
        error: runRes.stderr || undefined,
      });
    }

    const response: ISampleRunResponse = {
      verdict: overallVerdict as any,
      totalCases: sampleCases.length,
      passedCases: passedCount,
      sampleResults,
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  } finally {
    if (sandbox) {
      await sandbox.cleanup();
    }
  }
}

export async function getSubmissionById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid submission ID format',
      });
      return;
    }

    const solution = await Solution.findById(id)
      .populate<{ problem: { _id: string; problemCode: string; name: string } }>('problem', 'problemCode name')
      .populate<{ user: { _id: string; fullName: string; email: string } }>('user', 'fullName email')
      .lean();

    if (!solution) {
      res.status(404).json({
        success: false,
        error: 'Submission not found',
      });
      return;
    }

    // BOLA Protection: Enforce that only the owner can view submission details
    const isOwner = solution.user._id.toString() === req.userId;
    if (!isOwner) {
      res.status(403).json({
        success: false,
        error: 'Access denied: You do not have permission to view this submission.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        submissionId: solution._id.toString(),
        problemId: solution.problem._id.toString(),
        problemCode: solution.problem.problemCode,
        problemName: solution.problem.name,
        language: solution.language,
        verdict: solution.verdict,
        status: solution.verdict,
        compileOutput: solution.compileOutput,
        executionTime: solution.executionTime,
        memoryUsed: solution.memoryUsed,
        failedTestCaseNumber: solution.failedTestCaseNumber,
        totalTestCases: solution.totalTestCases,
        passedTestCases: solution.passedTestCases,
        submittedAt: solution.submittedAt,
        code: solution.code,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves submission history for a user.
 * Decision R7: Derives user from JWT, never trusts an unverified URL param.
 */
export async function getUserSubmissions(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = String(req.params.userId);

    // Decision R7 IDOR check: Enforce authenticated user matches requested userId
    if (userId !== req.userId && userId !== 'me') {
      res.status(403).json({
        success: false,
        error: 'Access denied: You can only view your own submission history.',
      });
      return;
    }

    const targetUserId = req.userId!;
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 20, 1), 50);
    const skip = (page - 1) * limit;

    const [submissions, totalCount] = await Promise.all([
      Solution.find({ user: targetUserId })
        .populate<{ problem: { _id: string; problemCode: string; name: string; difficulty: 'Easy' | 'Medium' | 'Hard' } }>(
          'problem',
          'problemCode name difficulty'
        )
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Solution.countDocuments({ user: targetUserId }),
    ]);

    const items: ISubmissionHistoryItem[] = submissions.map((sub) => ({
      _id: sub._id.toString(),
      problem: {
        _id: sub.problem._id.toString(),
        problemCode: sub.problem.problemCode,
        name: sub.problem.name,
        difficulty: sub.problem.difficulty,
      },
      language: sub.language,
      verdict: sub.verdict,
      executionTime: sub.executionTime,
      memoryUsed: sub.memoryUsed,
      passedTestCases: sub.passedTestCases,
      totalTestCases: sub.totalTestCases,
      submittedAt: sub.submittedAt,
      code: sub.code,
    }));

    res.status(200).json({
      success: true,
      data: {
        submissions: items,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProblemSubmissions(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const problemId = String(req.params.problemId);
    const userId = req.userId!;

    let queryProbId = problemId;
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      const prob = await Problem.findOne({ problemCode: problemId.toLowerCase() }).select('_id');
      if (!prob) {
        res.status(404).json({ success: false, error: 'Problem not found' });
        return;
      }
      queryProbId = prob._id.toString();
    }

    const submissions = await Solution.find({
      user: userId,
      problem: queryProbId,
    })
      .select('_id user problem language verdict executionTime memoryUsed failedTestCaseNumber totalTestCases passedTestCases submittedAt')
      .sort({ submittedAt: -1 })
      .limit(20)
      .lean();

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
}
