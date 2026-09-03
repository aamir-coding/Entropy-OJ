import { Router } from 'express';
import {
  requestHint,
  requestProblemReview,
  requestClassification,
  aiHintRequestSchema,
  aiReviewRequestSchema,
  aiClassifyRequestSchema,
} from '../controllers/ai.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';

const router = Router();

// Socratic Debug Hint Copilot (Student)
router.post('/hints', requireAuth, validateBody(aiHintRequestSchema), requestHint);

// Approach & Complexity Classification on-demand (Student)
router.post('/classify', requireAuth, validateBody(aiClassifyRequestSchema), requestClassification);

// Problem-Setting QA Co-Pilot (Admin only)
router.post('/review', requireAdmin, validateBody(aiReviewRequestSchema), requestProblemReview);

export default router;
