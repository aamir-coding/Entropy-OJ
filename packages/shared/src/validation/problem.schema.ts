import { z } from 'zod';
import { ALL_PROBLEM_DIFFICULTIES } from '../types';

export const problemFilterSchema = z.object({
  difficulty: z.enum(ALL_PROBLEM_DIFFICULTIES as unknown as [string, ...string[]]).optional(),
  tag: z.string().max(50).optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ProblemFilterInput = z.infer<typeof problemFilterSchema>;
