import { z } from 'zod';
import { SupportedLanguages } from '../constants/languages';
import { ExecutionLimits } from '../constants/limits';

export const createSubmissionSchema = z.object({
  problemId: z
    .string({ required_error: 'Problem ID is required' })
    .min(1, 'Problem ID is required'),
  language: z.enum([SupportedLanguages.CPP, SupportedLanguages.PYTHON], {
    errorMap: () => ({ message: 'Language must be either cpp or python' }),
  }),
  code: z
    .string({ required_error: 'Code is required' })
    .min(1, 'Submitted code cannot be empty')
    .max(
      ExecutionLimits.MAX_CODE_SIZE_BYTES,
      `Code size cannot exceed ${ExecutionLimits.MAX_CODE_SIZE_BYTES / 1024} KB`
    ),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
