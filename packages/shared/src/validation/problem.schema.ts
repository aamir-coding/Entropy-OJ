import { z } from 'zod';
import { ALL_PROBLEM_DIFFICULTIES } from '../types';
import { ExecutionLimits } from '../constants/limits';
import { supportedLanguageSchema } from '../constants/languages';

const tagTransformSchema = z.union([
  z
    .string()
    .max(200)
    .transform((val) =>
      val
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    ),
  z.array(z.string().max(50)).max(20),
]);

export const problemFilterSchema = z.object({
  difficulty: z.enum(ALL_PROBLEM_DIFFICULTIES).optional(),
  /** @deprecated Use `tags` instead */
  tag: tagTransformSchema.optional(),
  tags: tagTransformSchema.optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const adminSampleCaseSchema = z.object({
  input: z.string().min(1, 'Sample input cannot be empty'),
  output: z.string().min(1, 'Sample output cannot be empty'),
  explanation: z.string().optional(),
});

export const adminJudgeTestCaseSchema = z.object({
  _id: z.string().optional(),
  input: z.string().min(1, 'Testcase input cannot be empty'),
  output: z.string().min(1, 'Testcase output cannot be empty'),
  isSample: z.boolean().default(false),
  order: z.number().int().optional(),
});

export const createProblemSchema = z.object({
  problemCode: z
    .string()
    .min(2, 'Problem code must be at least 2 characters')
    .max(50, 'Problem code cannot exceed 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Problem code must be lowercase alphanumeric with hyphens (e.g. two-sum)'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  statement: z.string().min(10, 'Statement must be at least 10 characters'),
  difficulty: z.enum(ALL_PROBLEM_DIFFICULTIES),
  tags: z.array(z.string().min(1).max(30)).min(1, 'At least one tag is required'),
  timeLimitMs: z
    .number()
    .int()
    .min(100, 'Time limit must be at least 100ms')
    .max(
      ExecutionLimits.MAX_TIME_LIMIT_MS,
      `Time limit cannot exceed ${ExecutionLimits.MAX_TIME_LIMIT_MS}ms`
    )
    .default(ExecutionLimits.DEFAULT_TIME_LIMIT_MS),
  memoryLimitKb: z
    .number()
    .int()
    .min(16 * 1024, 'Memory limit must be at least 16MB')
    .max(
      ExecutionLimits.MAX_MEMORY_LIMIT_KB,
      `Memory limit cannot exceed ${ExecutionLimits.MAX_MEMORY_LIMIT_KB / 1024}MB`
    )
    .default(ExecutionLimits.DEFAULT_MEMORY_LIMIT_KB),
  sampleCases: z.array(adminSampleCaseSchema).min(1, 'At least one sample test case is required'),
  testCases: z.array(adminJudgeTestCaseSchema).min(1, 'At least one test case is required'),
});

export const updateProblemSchema = createProblemSchema.partial();

export const validateSolutionSchema = z.object({
  language: supportedLanguageSchema,
  code: z.string().min(1, 'Code cannot be empty'),
});

export type ProblemFilterInput = z.infer<typeof problemFilterSchema>;
export type AdminSampleCaseInput = z.infer<typeof adminSampleCaseSchema>;
export type AdminJudgeTestCaseInput = z.infer<typeof adminJudgeTestCaseSchema>;
export type CreateProblemInput = z.infer<typeof createProblemSchema>;
export type UpdateProblemInput = z.infer<typeof updateProblemSchema>;
export type ValidateSolutionInput = z.infer<typeof validateSolutionSchema>;

