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
