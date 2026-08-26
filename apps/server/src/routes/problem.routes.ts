import { Router } from 'express';
import { getProblems, getProblemByIdOrCode } from '../controllers/problem.controller';
import { optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', optionalAuth, getProblems);
router.get('/:identifier', optionalAuth, getProblemByIdOrCode);

export default router;
