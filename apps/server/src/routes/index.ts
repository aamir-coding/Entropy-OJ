import { Router } from 'express';
import authRoutes from './auth.routes';
import problemRoutes from './problem.routes';
import submissionRoutes from './submission.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);

export default router;
