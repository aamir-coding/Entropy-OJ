import { z } from 'zod';

export const problemFilterSchema = z.object({
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ProblemFilterInput = z.infer<typeof problemFilterSchema>;
