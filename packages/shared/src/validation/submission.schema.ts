import { z } from 'zod';
import { supportedLanguageSchema } from '../constants/languages';
import { ExecutionLimits } from '../constants/limits';

const textEncoder = new TextEncoder();

export const baseSubmissionSchema = z.object({
  problemId: z
    .string({ required_error: 'Problem ID is required' })
    .min(1, 'Problem ID is required'),
  language: supportedLanguageSchema,
  code: z
    .string({ required_error: 'Code is required' })
    .min(1, 'Submitted code cannot be empty')
    .max(
      ExecutionLimits.MAX_CODE_SIZE_BYTES,
      `Code size cannot exceed ${ExecutionLimits.MAX_CODE_SIZE_BYTES / 1024} KB`
    )
    .refine(
      (val) => textEncoder.encode(val).length <= ExecutionLimits.MAX_CODE_SIZE_BYTES,
      `Code byte size cannot exceed ${ExecutionLimits.MAX_CODE_SIZE_BYTES / 1024} KB`
    ),
});

export const createSubmissionSchema = baseSubmissionSchema;
export const runSampleSchema = baseSubmissionSchema;

export type BaseSubmissionInput = z.infer<typeof baseSubmissionSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type RunSampleInput = z.infer<typeof runSampleSchema>;

