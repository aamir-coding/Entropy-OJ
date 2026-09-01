import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().int().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required').default('mongodb://localhost:27017/anti_oj'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().default(6379),
  REDIS_PASSWORD: z.string().optional().transform((val) => val || undefined),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters for security'),
  JWT_EXPIRES_DAYS: z.coerce.number().int().min(1).default(7),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  RUNNER_IMAGE: z.string().default('oj-runner:latest'),

  // AI Feature Flags
  FEATURE_AI_HINTS: z.string().default('true'),
  FEATURE_AI_REVIEW: z.string().default('true'),
  FEATURE_AI_CLASSIFY: z.string().default('true'),

  // Groq (Feature 1: Debug Socratic Hint Copilot)
  GROQ_API_KEY: z.string().optional().transform((v) => v || undefined),
  GROQ_MODEL: z.string().default('llama-3.1-8b-instant'),
  GROQ_RPM_LIMIT: z.coerce.number().int().default(30),

  // Gemini (Feature 2: Problem-Setting Co-Pilot)
  GEMINI_API_KEY: z.string().optional().transform((v) => v || undefined),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  GEMINI_RPM_LIMIT: z.coerce.number().int().default(10),
  GEMINI_RPD_LIMIT: z.coerce.number().int().default(1500),

  // OpenRouter (Feature 5: Approach Classifier & Feature 1 Fallback)
  OPENROUTER_API_KEY: z.string().optional().transform((v) => v || undefined),
  OPENROUTER_MODELS: z.string().default('openrouter/free,meta-llama/llama-3.3-70b-instruct:free,deepseek/deepseek-r1:free,qwen/qwen-2.5-coder-32b-instruct:free'),
  OPENROUTER_RPM_LIMIT: z.coerce.number().int().default(20),
  OPENROUTER_RPD_LIMIT: z.coerce.number().int().default(50),

  // Per-User Hint Quotas
  AI_HINT_USER_DAILY_LIMIT: z.coerce.number().int().default(20),
  AI_HINT_USER_HOURLY_LIMIT: z.coerce.number().int().default(5),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('[Config] ❌ Invalid server environment configuration:');
  console.error(parsedEnv.error.format());
  throw new Error('Invalid server environment configuration');
}

export const env = {
  ...parsedEnv.data,
  isProduction: parsedEnv.data.NODE_ENV === 'production',
};
