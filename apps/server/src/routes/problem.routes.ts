import { Router } from 'express';
import { getProblems, getProblemByIdOrCode, getGalaxyProgress } from '../controllers/problem.controller';
import { optionalAuth } from '../middlewares/auth.middleware';
import { validateQuery } from '../middlewares/validate.middleware';
import { problemFilterSchema } from '@anti-oj/shared';

const router = Router();

router.get('/', optionalAuth, validateQuery(problemFilterSchema), getProblems);
router.get('/galaxy/progress', optionalAuth, getGalaxyProgress);
router.get('/:identifier', optionalAuth, getProblemByIdOrCode);

export default router;
