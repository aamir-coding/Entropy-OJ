import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createSubmission,
  runSampleCases,
  getSubmissionById,
  getUserSubmissions,
  getProblemSubmissions,
} from '../controllers/submission.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createSubmissionSchema, runSampleSchema } from '@anti-oj/shared';

const router = Router();

// Dedicated rate limiter for code evaluations (15 submissions per 15 minutes per IP)
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many submissions. Please wait a few minutes before submitting again.',
  },
});

// Dedicated rate limiter for live sample code runs (20 runs per 5 minutes)
const sampleRunLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many sample run requests. Please wait a moment before testing code again.',
  },
});

// Live Sample Runner (dedicated rate limiter applied)
router.post('/run', requireAuth, sampleRunLimiter, validateBody(runSampleSchema), runSampleCases);

// Submit Code
router.post('/', requireAuth, submissionLimiter, validateBody(createSubmissionSchema), createSubmission);

// Specific sub-paths MUST be registered before wildcard /:id
router.get('/user/:userId', requireAuth, getUserSubmissions);
router.get('/problem/:problemId', requireAuth, getProblemSubmissions);

// Wildcard submission by ID
router.get('/:id', requireAuth, getSubmissionById);

export default router;
