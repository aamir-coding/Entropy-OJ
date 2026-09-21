import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Solution } from '../models/Solution';
import { Problem } from '../models/Problem';
import { TestCase } from '../models/TestCase';
import { AuthRequest } from '../middlewares/auth.middleware';
import { enqueueSubmission, executeSampleRun } from '../queues/submission.queue';
import { env } from '../config/env';
import {
  CreateSubmissionInput,
  RunSampleInput,
  Verdict,
  Verdicts,
  ISubmissionResponse,
  ISubmissionHistoryItem,
  ISampleRunResponse,
  ISampleCaseResult,
  diffOutput,
} from '@entropy-oj/shared';

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

    // Validate problem existence with strict 24-hex ObjectId check (Issue L-4)
    let problemQuery: Record<string, unknown>;
    const isStrictHexId = mongoose.Types.ObjectId.isValid(problemId) && /^[a-f\d]{24}$/i.test(problemId);
    if (isStrictHexId) {
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

    // Check for pending submissions to prevent spamming
    const existingPending = await Solution.findOne({
      user: userId,
      problem: problem._id,
      verdict: Verdicts.PENDING,
    });

    if (existingPending) {
      const isStale = Date.now() - new Date(existingPending.submittedAt).getTime() > 300 * 1000;
      if (isStale) {
        existingPending.verdict = Verdicts.INTERNAL_ERROR;
        existingPending.compileOutput = 'Evaluation timed out.';
        await existingPending.save();
      } else {
        res.status(429).json({
          success: false,
          error: 'You already have an evaluation in progress for this problem. Please wait.',
        });
        return;
      }
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
      console.error('[Submission] Enqueue failed. Rolling back database records...', queueErr);
      await Solution.findByIdAndDelete(solution._id);
      throw queueErr;
    }

    // Increment problem totalSubmissions counter only after successful enqueue
    await Problem.findByIdAndUpdate(problem._id, { $inc: { totalSubmissions: 1 } });

    const response: ISubmissionResponse = {
      submissionId: solution._id.toString(),
      status: Verdicts.PENDING,
      verdict: solution.verdict as Verdict,
      problemId: problem._id.toString(),
      problemCode: problem.problemCode,
      problemName: problem.name,
      language: solution.language,
      submittedAt: solution.submittedAt,
    };

    res.status(201).json({
      success: true,
      data: response,
    });
  } catch (err: any) {
    console.error('[Submission] Error creating submission:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create submission. Please try again later.',
    });
  }
}

/**
 * POST /api/submissions/run
 * Ephemeral sandbox runner for sample test cases with diff output.
 */
export const runSampleCases = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { problemId, language, code } = req.body as RunSampleInput;

    const isStrictHexId = mongoose.Types.ObjectId.isValid(problemId) && /^[a-f\d]{24}$/i.test(problemId);
    const problemQuery = isStrictHexId
      ? { $or: [{ _id: problemId }, { problemCode: problemId.toLowerCase() }] }
      : { problemCode: problemId.toLowerCase() };

    const problem = await Problem.findOne(problemQuery);
    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
      return;
    }

    // Retrieve only sample test cases
    const sampleCases = await TestCase.find({ problem: problem._id, isSample: true })
      .sort({ order: 1 })
      .lean();

    if (!sampleCases || sampleCases.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No sample test cases available for this problem.',
      });
      return;
    }

    try {
      const response = await executeSampleRun(
        {
          submissionId: `sample-${new mongoose.Types.ObjectId()}`,
          problemId: problem._id.toString(),
          userId: req.userId || 'anonymous',
          code,
          language,
          timeLimitMs: problem.timeLimitMs,
          memoryLimitKb: problem.memoryLimitKb,
          isSampleRun: true,
        },
        30000
      );

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (err: any) {
      console.error('[RunSample] Error running sample cases:', err);
      res.status(500).json({
        success: false,
        error: 'Sample test run execution failed: ' + (err.message || 'Internal error'),
      });
    }
  } catch (err: any) {
    console.error('[RunSample] Unexpected error in runSample controller:', err);
    res.status(500).json({
      success: false,
      error: 'Sample test run failed: ' + (err.message || 'Internal error'),
    });
  }
};

/**
 * GET /api/submissions/:id
 * Retrieve submission details. Enforces owner IDOR protection (with admin exemption).
 */
export const getSubmissionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const solution = await Solution.findById(id)
      .populate<{ problem: { _id: mongoose.Types.ObjectId; problemCode: string; name: string } }>(
        'problem',
        'name problemCode statement difficulty timeLimitMs memoryLimitKb'
      )
      .populate<{ user: { _id: mongoose.Types.ObjectId; name: string; email: string; username: string } }>(
        'user',
        'name email username'
      )
      .lean();

    if (!solution) {
      res.status(404).json({
        success: false,
        error: 'Submission not found',
      });
      return;
    }

    // BOLA Protection: Enforce that only the owner or an admin can view submission details (Issue H-4)
    const isOwner = solution.user?._id ? solution.user._id.toString() === req.userId : false;
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
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
        problemId: solution.problem?._id ? solution.problem._id.toString() : '',
        problemCode: solution.problem?.problemCode || 'unknown',
        problemName: solution.problem?.name || 'Unknown Problem',
        language: solution.language,
        verdict: solution.verdict,
        status: solution.verdict,
        compileOutput: solution.compileOutput,
        executionTime: solution.executionTime,
        memoryUsed: solution.memoryUsed,
        failedTestCaseNumber: solution.failedTestCaseNumber,
        totalTestCases: solution.totalTestCases,
        passedTestCases: solution.passedTestCases,
        classification: solution.classification,
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

    const items: ISubmissionHistoryItem[] = submissions
      .filter((sub) => Boolean(sub && sub.problem))
      .map((sub) => ({
        _id: sub._id.toString(),
        problem: {
          _id: sub.problem?._id ? sub.problem._id.toString() : '',
          problemCode: sub.problem?.problemCode || 'unknown',
          name: sub.problem?.name || 'Unknown Problem',
          difficulty: sub.problem?.difficulty || 'Medium',
        },
        language: sub.language,
        verdict: sub.verdict,
        executionTime: sub.executionTime,
        memoryUsed: sub.memoryUsed,
        passedTestCases: sub.passedTestCases,
        totalTestCases: sub.totalTestCases,
        classification: sub.classification,
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
      .select('_id user problem language verdict executionTime memoryUsed failedTestCaseNumber totalTestCases passedTestCases classification submittedAt code')
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

/**
 * Retrieves the distinct list of problems successfully solved by the user.
 */
export async function getUserSolvedProblems(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = String(req.params.userId);

    // Enforce authenticated user matches requested userId
    if (userId !== req.userId && userId !== 'me') {
      res.status(403).json({
        success: false,
        error: 'Access denied: You can only view your own solved problems.',
      });
      return;
    }

    const targetUserId = req.userId!;

    // Query all accepted submissions for the user (exclude heavy source code)
    const acceptedSolutions = await Solution.find({
      user: targetUserId,
      verdict: Verdicts.ACCEPTED,
    })
      .select('-code -compileOutput')
      .populate<{ problem: { _id: string; problemCode: string; name: string; difficulty: 'Easy' | 'Medium' | 'Hard'; tags: string[] } }>(
        'problem',
        'problemCode name difficulty tags'
      )
      .sort({ submittedAt: -1 })
      .lean();

    // Deduplicate by problem to get distinct solved problems with their best/latest accepted submission
    const solvedMap = new Map<string, any>();

    for (const sub of acceptedSolutions) {
      if (!sub.problem) continue;
      const probId = sub.problem._id.toString();
      if (!solvedMap.has(probId)) {
        solvedMap.set(probId, {
          _id: sub._id.toString(),
          problem: {
            _id: probId,
            problemCode: sub.problem.problemCode,
            name: sub.problem.name,
            difficulty: sub.problem.difficulty,
            tags: sub.problem.tags || [],
          },
          language: sub.language,
          executionTime: sub.executionTime,
          memoryUsed: sub.memoryUsed,
          solvedAt: sub.submittedAt,
        });
      }
    }

    const solvedProblems = Array.from(solvedMap.values());

    // Compute approach distribution across distinct solved problems with classification
    let approachDistribution: { approach: string; count: number }[] = [];
    try {
      const approachDistributionRaw = await Solution.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(targetUserId),
            verdict: Verdicts.ACCEPTED,
            'classification.approach': { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: { problem: '$problem', approach: '$classification.approach' },
          },
        },
        {
          $group: {
            _id: '$_id.approach',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);

      approachDistribution = approachDistributionRaw.map((a) => ({
        approach: String(a._id),
        count: Number(a.count),
      }));
    } catch (aggErr) {
      console.warn('[getUserSolvedProblems] Aggregation fallback warning:', aggErr);
    }

    res.status(200).json({
      success: true,
      data: {
        solvedProblems,
        totalSolved: solvedProblems.length,
        approachDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
}
