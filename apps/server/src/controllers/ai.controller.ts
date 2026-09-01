import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Solution } from '../models/Solution';
import { Problem } from '../models/Problem';
import { TestCase } from '../models/TestCase';
import { hintService } from '../ai/hints/hintService';
import { reviewService } from '../ai/review/reviewService';
import {
  ApiResponse,
  IHintResponse,
  IHintRequest,
  IProblemReviewResponse,
  SupportedLanguage,
  ProblemDifficulty,
} from '@anti-oj/shared';

/**
 * POST /api/ai/hints
 * Generates a real-time Socratic debugging hint for a failed submission.
 */
export async function requestHint(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { submissionId } = req.body as IHintRequest;

    if (!submissionId || !mongoose.Types.ObjectId.isValid(submissionId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid or missing submissionId format.',
      } as ApiResponse);
      return;
    }

    const solution = await Solution.findById(submissionId).lean();
    if (!solution) {
      res.status(404).json({
        success: false,
        error: 'Submission not found.',
      } as ApiResponse);
      return;
    }

    // IDOR Protection: User must own the submission or be an admin
    const isOwner = solution.user.toString() === req.userId;
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied: You can only request hints for your own submissions.',
      } as ApiResponse);
      return;
    }

    // Fetch Problem statement and public sample cases ONLY (zero hidden test cases queried)
    const problem = await Problem.findById(solution.problem).select('problemCode name statement sampleCases').lean();
    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Associated problem not found.',
      } as ApiResponse);
      return;
    }

    const hintResult = await hintService.getHint({
      userId: req.userId!,
      problemId: problem._id.toString(),
      problemCode: problem.problemCode,
      problemName: problem.name,
      statement: problem.statement,
      sampleCases: problem.sampleCases || [],
      code: solution.code,
      language: solution.language,
      verdict: solution.verdict,
      compileOutput: solution.compileOutput,
    });

    res.status(200).json({
      success: true,
      data: hintResult,
    } as ApiResponse<IHintResponse>);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/ai/review
 * Admin-only: Performs comprehensive AI QA audit on a problem package using Gemini Flash.
 */
export async function requestProblemReview(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { problemId, referenceSolution, referenceSolutionLanguage, editorial } = req.body as {
      problemId: string;
      referenceSolution?: string;
      referenceSolutionLanguage?: SupportedLanguage;
      editorial?: string;
    };

    if (!problemId) {
      res.status(400).json({
        success: false,
        error: 'Problem identifier is required.',
      } as ApiResponse);
      return;
    }

    let query: Record<string, unknown>;
    if (mongoose.Types.ObjectId.isValid(problemId)) {
      query = { $or: [{ _id: problemId }, { problemCode: problemId.toLowerCase() }] };
    } else {
      query = { problemCode: problemId.toLowerCase() };
    }

    const problem = await Problem.findOne(query).lean();
    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Problem not found.',
      } as ApiResponse);
      return;
    }

    // Admins are permitted full test suite access
    const testCases = await TestCase.find({ problem: problem._id }).sort({ order: 1 }).lean();

    const reviewFindings = await reviewService.reviewProblem({
      problemCode: problem.problemCode,
      problemName: problem.name,
      statement: problem.statement,
      difficulty: problem.difficulty as ProblemDifficulty,
      tags: problem.tags || [],
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
      sampleCases: problem.sampleCases || [],
      testCases: testCases.map((tc) => ({
        _id: tc._id.toString(),
        problem: tc.problem.toString(),
        input: tc.input,
        output: tc.output,
        isSample: tc.isSample,
        order: tc.order,
      })),
      editorial: editorial || problem.editorial,
      referenceSolution,
      referenceSolutionLanguage,
    });

    res.status(200).json({
      success: true,
      data: reviewFindings,
    } as ApiResponse<IProblemReviewResponse>);
  } catch (error) {
    next(error);
  }
}

