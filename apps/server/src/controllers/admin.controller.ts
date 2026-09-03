import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Problem } from '../models/Problem';
import { TestCase } from '../models/TestCase';
import { Solution } from '../models/Solution';
import { AuthRequest } from '../middlewares/auth.middleware';
import { DockerSandbox } from '../sandbox/dockerRunner';
import {
  CreateProblemInput,
  UpdateProblemInput,
  ValidateSolutionInput,
  Verdicts,
  Verdict,
  ProblemDifficulty,
  IAdminProblemListItem,
  IAdminProblemDetail,
  IAdminValidateSolutionResponse,
  IAdminValidateTestCaseResult,
  diffOutput,
} from '@anti-oj/shared';

/**
 * GET /api/admin/problems
 * List all problems with testcase counts and submission stats for administration.
 */
export async function getAdminProblems(
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const problems = await Problem.aggregate([
      {
        $lookup: {
          from: 'testcases',
          localField: '_id',
          foreignField: 'problem',
          as: 'testCasesList',
        },
      },
      {
        $project: {
          _id: 1,
          problemCode: 1,
          name: 1,
          difficulty: 1,
          tags: 1,
          totalSubmissions: 1,
          acceptedSubmissions: 1,
          createdAt: 1,
          sampleCasesCount: { $size: '$sampleCases' },
          totalCasesCount: { $size: '$testCasesList' },
          hiddenCasesCount: {
            $size: {
              $filter: {
                input: '$testCasesList',
                as: 'tc',
                cond: { $eq: ['$$tc.isSample', false] },
              },
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const formattedProblems: IAdminProblemListItem[] = problems.map((p) => ({
      _id: p._id.toString(),
      problemCode: p.problemCode,
      name: p.name,
      difficulty: p.difficulty as ProblemDifficulty,
      tags: p.tags,
      totalSubmissions: p.totalSubmissions,
      acceptedSubmissions: p.acceptedSubmissions,
      acceptanceRate:
        p.totalSubmissions > 0
          ? Math.round((p.acceptedSubmissions / p.totalSubmissions) * 1000) / 10
          : 0,
      sampleCasesCount: p.sampleCasesCount,
      hiddenCasesCount: p.hiddenCasesCount,
      totalCasesCount: p.totalCasesCount,
      createdAt: p.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedProblems,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/problems/:id
 * Get full problem details including all sample and hidden test cases.
 */
export async function getAdminProblemById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    let query: Record<string, unknown>;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { problemCode: id.toLowerCase() }] };
    } else {
      query = { problemCode: id.toLowerCase() };
    }

    const problem = await Problem.findOne(query).lean();
    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
      return;
    }

    const testCases = await TestCase.find({ problem: problem._id })
      .sort({ order: 1 })
      .lean();

    const responseData: IAdminProblemDetail = {
      ...problem,
      _id: problem._id.toString(),
      difficulty: problem.difficulty as ProblemDifficulty,
      createdAt: problem.createdAt.toISOString(),
      testCases: testCases.map((tc) => ({
        ...tc,
        _id: tc._id.toString(),
        problem: tc.problem.toString(),
      })),
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/problems
 * Create a new problem and insert its sample & judge test cases.
 */
export async function createAdminProblem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as CreateProblemInput;

    const existing = await Problem.findOne({ problemCode: input.problemCode.toLowerCase() });
    if (existing) {
      res.status(409).json({
        success: false,
        error: `Problem with code '${input.problemCode}' already exists.`,
      });
      return;
    }

    const problem = await Problem.create({
      problemCode: input.problemCode.toLowerCase().trim(),
      name: input.name.trim(),
      statement: input.statement.trim(),
      difficulty: input.difficulty,
      tags: input.tags,
      timeLimitMs: input.timeLimitMs,
      memoryLimitKb: input.memoryLimitKb,
      sampleCases: input.sampleCases,
    });

    const testCaseDocs = input.testCases.map((tc, idx) => ({
      problem: problem._id,
      input: tc.input,
      output: tc.output,
      isSample: tc.isSample || false,
      order: tc.order ?? idx + 1,
    }));

    await TestCase.insertMany(testCaseDocs);

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      data: {
        _id: problem._id.toString(),
        problemCode: problem.problemCode,
        name: problem.name,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/problems/:id
 * Update problem metadata, statement, and test cases.
 */
export async function updateAdminProblem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const input = req.body as UpdateProblemInput;

    let query: Record<string, unknown>;
    const isStrictHexId = mongoose.Types.ObjectId.isValid(id) && /^[a-f\d]{24}$/i.test(id);
    if (isStrictHexId) {
      query = { $or: [{ _id: id }, { problemCode: id.toLowerCase() }] };
    } else {
      query = { problemCode: id.toLowerCase() };
    }

    const problem = await Problem.findOne(query);
    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
      return;
    }

    // Check problemCode uniqueness if changing
    if (input.problemCode && input.problemCode.toLowerCase().trim() !== problem.problemCode) {
      const existing = await Problem.findOne({
        problemCode: input.problemCode.toLowerCase().trim(),
        _id: { $ne: problem._id },
      });
      if (existing) {
        res.status(409).json({
          success: false,
          error: 'A problem with this problemCode already exists',
        });
        return;
      }
      problem.problemCode = input.problemCode.toLowerCase().trim();
    }

    if (input.name) problem.name = input.name.trim();
    if (input.statement) problem.statement = input.statement.trim();
    if (input.difficulty) problem.difficulty = input.difficulty as ProblemDifficulty;
    if (input.tags) problem.tags = input.tags;
    if (input.timeLimitMs) problem.timeLimitMs = input.timeLimitMs;
    if (input.memoryLimitKb) problem.memoryLimitKb = input.memoryLimitKb;
    if (input.sampleCases) problem.sampleCases = input.sampleCases;

    await problem.save();

    // If testCases array is explicitly provided, replace test cases atomically (Issue C-4)
    if (input.testCases && Array.isArray(input.testCases)) {
      const testCaseDocs = input.testCases.map((tc, idx) => ({
        problem: problem._id,
        input: tc.input,
        output: tc.output,
        isSample: tc.isSample || false,
        order: tc.order ?? idx + 1,
      }));

      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await TestCase.deleteMany({ problem: problem._id }, { session });
          await TestCase.insertMany(testCaseDocs, { session });
        });
      } catch (txnError: any) {
        if (
          txnError.message?.includes('replica set') ||
          txnError.message?.includes('Transactions are not supported')
        ) {
          await TestCase.deleteMany({ problem: problem._id });
          await TestCase.insertMany(testCaseDocs);
        } else {
          throw txnError;
        }
      } finally {
        await session.endSession();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      data: {
        _id: problem._id.toString(),
        problemCode: problem.problemCode,
        name: problem.name,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/problems/:id
 * Cascading delete: problem + test cases + solutions.
 */
export async function deleteAdminProblem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    let query: Record<string, unknown>;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { problemCode: id.toLowerCase() }] };
    } else {
      query = { problemCode: id.toLowerCase() };
    }

    const problem = await Problem.findOneAndDelete(query);
    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
      return;
    }

    // Cascade delete associated test cases and solutions
    await TestCase.deleteMany({ problem: problem._id });
    await Solution.deleteMany({ problem: problem._id });

    res.status(200).json({
      success: true,
      message: `Problem '${problem.name}' (#${problem.problemCode}) and all associated test cases and submissions deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/problems/:id/validate
 * Run a model/reference solution in Docker against all test cases for validation.
 */
export async function validateModelSolution(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { language, code } = req.body as ValidateSolutionInput;

    let query: Record<string, unknown>;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { problemCode: id.toLowerCase() }] };
    } else {
      query = { problemCode: id.toLowerCase() };
    }

    const problem = await Problem.findOne(query);
    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
      return;
    }

    const testCases = await TestCase.find({ problem: problem._id })
      .sort({ order: 1 })
      .lean();

    if (testCases.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Cannot validate model solution: Problem has no test cases configured.',
      });
      return;
    }

    // Prepare live Docker sandbox
    const sandbox = await DockerSandbox.create();

    try {
      await sandbox.prepareSourceFile(code, language);
      const compileRes = await sandbox.compile(language);

      if (!compileRes.success) {
        res.status(200).json({
          success: true,
          data: {
            verdict: Verdicts.COMPILATION_ERROR,
            compileOutput: compileRes.compileOutput || 'Compilation failed',
            totalTestCases: testCases.length,
            passedTestCases: 0,
            executionTimeMs: 0,
            memoryUsedKb: 0,
            results: [],
          } as IAdminValidateSolutionResponse,
        });
        return;
      }

      let maxTimeMs = 0;
      let maxMemKb = 0;
      let allPassed = true;
      let overallVerdict: Verdict = Verdicts.ACCEPTED;
      const testResults: IAdminValidateTestCaseResult[] = [];

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const runRes = await sandbox.runTestCase(tc.input, language, problem.timeLimitMs, problem.memoryLimitKb);

        const cpuTimeMs = runRes.metrics.cpuTimeMs;
        const memoryKb = runRes.metrics.maxRssKb;
        maxTimeMs = Math.max(maxTimeMs, cpuTimeMs);
        maxMemKb = Math.max(maxMemKb, memoryKb);

        let testVerdict: Verdict = Verdicts.ACCEPTED;
        if (runRes.timedOut || cpuTimeMs > problem.timeLimitMs) {
          testVerdict = Verdicts.TIME_LIMIT_EXCEEDED;
        } else if (memoryKb > problem.memoryLimitKb) {
          testVerdict = Verdicts.MEMORY_LIMIT_EXCEEDED;
        } else if (runRes.metrics.exitCode !== 0) {
          testVerdict = Verdicts.RUNTIME_ERROR;
        } else {
          const diff = diffOutput(runRes.actualOutput, tc.output);
          if (!diff.isMatch) {
            testVerdict = Verdicts.WRONG_ANSWER;
          }
        }

        const passed = testVerdict === Verdicts.ACCEPTED;
        if (!passed) {
          allPassed = false;
          if (overallVerdict === Verdicts.ACCEPTED) {
            overallVerdict = testVerdict;
          }
        }

        testResults.push({
          testCaseIndex: i + 1,
          isSample: tc.isSample,
          input: tc.input,
          expectedOutput: tc.output,
          actualOutput: runRes.actualOutput,
          passed,
          verdict: testVerdict,
          executionTimeMs: cpuTimeMs,
          memoryUsedKb: memoryKb,
          error: runRes.stderr || undefined,
        });
      }

      const passedCount = testResults.filter((r) => r.passed).length;

      res.status(200).json({
        success: true,
        data: {
          verdict: allPassed ? Verdicts.ACCEPTED : overallVerdict,
          totalTestCases: testCases.length,
          passedTestCases: passedCount,
          executionTimeMs: maxTimeMs,
          memoryUsedKb: maxMemKb,
          results: testResults,
        } as IAdminValidateSolutionResponse,
      });
    } finally {
      await sandbox.cleanup();
    }
  } catch (error) {
    next(error);
  }
}
