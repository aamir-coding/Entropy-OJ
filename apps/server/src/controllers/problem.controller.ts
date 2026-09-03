import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Problem } from '../models/Problem';
import { Solution } from '../models/Solution';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ProblemFilterInput, Verdicts, IProblemListItem } from '@anti-oj/shared';

function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function getProblems(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { difficulty, tag, search, page = 1, limit = 20 } = req.query as unknown as ProblemFilterInput;

    const filter: Record<string, unknown> = {};

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const sanitized = escapeRegex(search.trim().slice(0, 100));
      const searchRegex = new RegExp(sanitized, 'i');
      filter.$or = [{ name: searchRegex }, { problemCode: searchRegex }, { tags: searchRegex }];
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const safePage = Math.max(Number(page) || 1, 1);
    const skip = (safePage - 1) * safeLimit;

    const [problems, totalCount] = await Promise.all([
      Problem.find(filter)
        .select('problemCode name difficulty tags totalSubmissions acceptedSubmissions createdAt')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Problem.countDocuments(filter),
    ]);

    // If user is authenticated, determine their status per problem (Solved / Attempted / Unsolved) (Issue M-2: Scoped to current page)
    let userSolvedProblemIds = new Set<string>();
    let userAttemptedProblemIds = new Set<string>();

    if (req.userId && problems.length > 0) {
      const pageProblemIds = problems.map((p) => p._id);
      const userSubmissions = await Solution.find({
        user: req.userId,
        problem: { $in: pageProblemIds },
      })
        .select('problem verdict')
        .lean();

      for (const sub of userSubmissions) {
        const probId = sub.problem.toString();
        userAttemptedProblemIds.add(probId);
        if (sub.verdict === Verdicts.ACCEPTED) {
          userSolvedProblemIds.add(probId);
        }
      }
    }

    const items: IProblemListItem[] = problems.map((prob) => {
      const probId = prob._id.toString();
      const total = prob.totalSubmissions || 0;
      const accepted = prob.acceptedSubmissions || 0;
      const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100 * 10) / 10 : 0;

      let userStatus: 'Solved' | 'Attempted' | 'Unsolved' | undefined = undefined;
      if (req.userId) {
        if (userSolvedProblemIds.has(probId)) {
          userStatus = 'Solved';
        } else if (userAttemptedProblemIds.has(probId)) {
          userStatus = 'Attempted';
        } else {
          userStatus = 'Unsolved';
        }
      }

      return {
        _id: probId,
        problemCode: prob.problemCode,
        name: prob.name,
        difficulty: prob.difficulty,
        tags: prob.tags,
        totalSubmissions: total,
        acceptedSubmissions: accepted,
        acceptanceRate,
        userStatus,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        problems: items,
        pagination: {
          total: totalCount,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(totalCount / safeLimit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProblemByIdOrCode(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const identifier = String(req.params.identifier);

    // Strict 24-character hexadecimal ObjectId check (Issue L-4)
    const isStrictHexId = mongoose.Types.ObjectId.isValid(identifier) && /^[a-f\d]{24}$/i.test(identifier);
    let query: Record<string, unknown>;
    if (isStrictHexId) {
      query = { $or: [{ _id: identifier }, { problemCode: identifier.toLowerCase() }] };
    } else {
      query = { problemCode: identifier.toLowerCase() };
    }

    // Explicitly return problem fields and sampleCases only. Hidden test cases are in the TestCase collection and not leaked.
    const problem = await Problem.findOne(query)
      .select('problemCode name statement difficulty tags timeLimitMs memoryLimitKb sampleCases totalSubmissions acceptedSubmissions createdAt')
      .lean();

    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    next(error);
  }
}
