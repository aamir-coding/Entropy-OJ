import { Router } from 'express';
import authRoutes from './auth.routes';
import problemRoutes from './problem.routes';
import submissionRoutes from './submission.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/admin', adminRoutes);

export default router;
