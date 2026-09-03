import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const workerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1).default('mongodb://localhost:27017/anti_oj'),
  REDIS_HOST: z.string().min(1).default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  RUNNER_IMAGE: z.string().min(1).default('oj-runner:latest'),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(2),
  DOCKER_TIMEOUT_SEC: z.coerce.number().int().positive().default(15),
  WORKER_HEALTH_PORT: z.coerce.number().int().positive().default(5001),
});

const parsed = workerEnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ [Worker] Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

