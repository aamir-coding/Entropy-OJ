import { Router } from 'express';
import {
  getAdminProblems,
  getAdminProblemById,
  createAdminProblem,
  updateAdminProblem,
  deleteAdminProblem,
  validateModelSolution,
} from '../controllers/admin.controller';
import { requireAdmin } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  createProblemSchema,
  updateProblemSchema,
  validateSolutionSchema,
} from '@anti-oj/shared';

const router = Router();

// Enforce RBAC on all admin routes
router.use(requireAdmin);

router.get('/problems', getAdminProblems);
router.get('/problems/:id', getAdminProblemById);
router.post('/problems', validateBody(createProblemSchema), createAdminProblem);
router.put('/problems/:id', validateBody(updateProblemSchema), updateAdminProblem);
router.delete('/problems/:id', deleteAdminProblem);
router.post('/problems/:id/validate', validateBody(validateSolutionSchema), validateModelSolution);

export default router;
