import { Router } from 'express';
import { requestHint, requestProblemReview } from '../controllers/ai.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Socratic Debug Hint Copilot (Student)
router.post('/hints', requireAuth, requestHint);

// Problem-Setting QA Co-Pilot (Admin only)
router.post('/review', requireAdmin, requestProblemReview);

export default router;
