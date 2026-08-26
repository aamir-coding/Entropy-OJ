import { Router } from 'express';
import {
  createSubmission,
  getSubmissionById,
  getUserSubmissions,
  getProblemSubmissions,
} from '../controllers/submission.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createSubmissionSchema } from '@anti-oj/shared';

const router = Router();

router.post('/', requireAuth, validateBody(createSubmissionSchema), createSubmission);
router.get('/:id', requireAuth, getSubmissionById);
router.get('/user/:userId', requireAuth, getUserSubmissions);
router.get('/problem/:problemId', requireAuth, getProblemSubmissions);

export default router;
