import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/anti_oj',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
  RUNNER_IMAGE: process.env.RUNNER_IMAGE || 'oj-runner:latest',
  WORKER_CONCURRENCY: parseInt(process.env.WORKER_CONCURRENCY || '2', 10),
  DOCKER_TIMEOUT_SEC: parseInt(process.env.DOCKER_TIMEOUT_SEC || '15', 10),
};
