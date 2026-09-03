import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';

// Resolve .env deterministically from process cwd or relative to module directory
const cwdEnv = path.resolve(process.cwd(), '.env');
const localEnv = path.resolve(__dirname, '../../.env');
const envPath = fs.existsSync(cwdEnv) ? cwdEnv : localEnv;
dotenv.config({ path: envPath });

const WEAK_DEFAULT_SECRETS = [
  'super_secret_jwt_key_anti_online_judge_2026_production_grade',
  'CHANGE_ME_TO_A_SECURE_RANDOM_SECRET_KEY_MINIMUM_32_BYTES',
  'default_jwt_secret',
];

const booleanFeatureFlag = z
  .union([z.boolean(), z.string()])
  .default('true')
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    const lower = String(val).trim().toLowerCase();
    return lower !== 'false' && lower !== '0' && lower !== 'no';
  });

const envSchema = z
  .object({
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

    // AI Feature Flags (parsed as booleans)
    FEATURE_AI_HINTS: booleanFeatureFlag,
    FEATURE_AI_REVIEW: booleanFeatureFlag,
    FEATURE_AI_CLASSIFY: booleanFeatureFlag,

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
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production' && WEAK_DEFAULT_SECRETS.includes(data.JWT_SECRET)) {
        return false;
      }
      return true;
    },
    {
      message: 'CRITICAL SECURITY: Default or example JWT_SECRET cannot be used in production environment.',
      path: ['JWT_SECRET'],
    }
  );

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

