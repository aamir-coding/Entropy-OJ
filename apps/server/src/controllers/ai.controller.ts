import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Solution } from '../models/Solution';
import { Problem } from '../models/Problem';
import { TestCase } from '../models/TestCase';
import { hintService } from '../ai/hints/hintService';
import { reviewService } from '../ai/review/reviewService';
import { classifyService } from '../ai/classify/classifyService';
import {
  ApiResponse,
  IHintResponse,
  IProblemReviewResponse,
  IApproachClassification,
  Verdicts,
  SupportedLanguage,
  ProblemDifficulty,
  ALL_SUPPORTED_LANGUAGES,
} from '@entropy-oj/shared';

export const aiHintRequestSchema = z.object({
  submissionId: z.string().min(1, 'Submission identifier is required').max(100),
});

export const aiClassifyRequestSchema = z.object({
  submissionId: z.string().min(1, 'Submission identifier is required').max(100),
});

export const aiReviewRequestSchema = z.object({
  problemId: z.string().min(1, 'Problem identifier is required').max(100),
  referenceSolution: z.string().max(50000).optional(),
  referenceSolutionLanguage: z.enum(ALL_SUPPORTED_LANGUAGES as [string, ...string[]]).optional(),
  editorial: z.string().max(50000).optional(),
});

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
    const { submissionId } = req.body;

    const isStrictHexId = mongoose.Types.ObjectId.isValid(submissionId) && /^[a-f\d]{24}$/i.test(submissionId);
    if (!submissionId || !isStrictHexId) {
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

    // IDOR Protection: Only the author of the submission or an admin may request a hint
    const isAuthor = solution.user?.toString() === req.userId;
    const isAdmin = req.user?.role === 'admin';
    if (!isAuthor && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied: You can only request hints for your own submissions.',
      } as ApiResponse);
      return;
    }

    // Retrieve problem context
    const problem = await Problem.findById(solution.problem).lean();
    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Associated problem no longer exists.',
      } as ApiResponse);
      return;
    }

    const hintResult = await hintService.getHint({
      userId: req.userId!,
      problemId: problem._id.toString(),
      problemCode: problem.problemCode,
      problemName: problem.name,
      statement: problem.statement,
      sampleCases: (problem.sampleCases || []).map((sc: any) => ({
        input: sc.input,
        output: sc.output,
        explanation: sc.explanation,
      })),
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
 * Problem-Setting QA Co-Pilot: Synthesizes adversarial tests, ambiguities, and edge-cases.
 * Restricted to administrators.
 */
export async function requestProblemReview(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { problemId, referenceSolution, referenceSolutionLanguage, editorial } = req.body;

    const isStrictHexId = mongoose.Types.ObjectId.isValid(problemId) && /^[a-f\d]{24}$/i.test(problemId);
    let query: Record<string, unknown>;
    if (isStrictHexId) {
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

/**
 * POST /api/ai/classify
 * Analyzes and classifies the approach and complexity of an Accepted solution.
 */
export async function requestClassification(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { submissionId } = req.body;

    const isStrictHexId = mongoose.Types.ObjectId.isValid(submissionId) && /^[a-f\d]{24}$/i.test(submissionId);
    if (!submissionId || !isStrictHexId) {
      res.status(400).json({
        success: false,
        error: 'Invalid or missing submissionId format.',
      } as ApiResponse);
      return;
    }

    const solution = await Solution.findById(submissionId);
    if (!solution) {
      res.status(404).json({
        success: false,
        error: 'Submission not found.',
      } as ApiResponse);
      return;
    }

    // IDOR Protection: Only the author of the submission or an admin may request classification
    const isAuthor = solution.user?.toString() === req.userId;
    const isAdmin = req.user?.role === 'admin';
    if (!isAuthor && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied: You do not have permission to analyze this submission.',
      } as ApiResponse);
      return;
    }

    if (solution.verdict !== Verdicts.ACCEPTED) {
      res.status(400).json({
        success: false,
        error: 'Approach classification is only available for Accepted solutions.',
      } as ApiResponse);
      return;
    }

    // If already classified, return existing classification
    if (solution.classification && solution.classification.approach) {
      res.status(200).json({
        success: true,
        data: solution.classification,
      } as ApiResponse<IApproachClassification>);
      return;
    }

    const problem = await Problem.findById(solution.problem).select('name statement').lean();
    if (!problem) {
      res.status(404).json({
        success: false,
        error: 'Associated problem not found.',
      } as ApiResponse);
      return;
    }

    const classification = await classifyService.classifySubmission({
      submissionId: solution._id.toString(),
      problemId: problem._id.toString(),
      problemName: problem.name,
      problemStatement: problem.statement,
      code: solution.code,
      language: solution.language,
    });

    if (!classification) {
      res.status(502).json({
        success: false,
        error: 'AI classification service temporarily unavailable. Please try again.',
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      data: classification,
    } as ApiResponse<IApproachClassification>);
  } catch (error) {
    next(error);
  }
}


