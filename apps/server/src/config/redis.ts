import Redis, { RedisOptions } from 'ioredis';
import { env } from './env';

export const redisConnectionOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  retryStrategy(times) {
    if (env.NODE_ENV === 'test') {
      return null; // Do not hang test runner if Redis is offline
    }
    return Math.min(times * 200, 3000);
  },
};

export const redisClient = new Redis(redisConnectionOptions);

redisClient.on('connect', () => {
  console.log(`[Redis] Connected to Redis at ${env.REDIS_HOST}:${env.REDIS_PORT}`);
});

redisClient.on('error', (err) => {
  if (env.NODE_ENV !== 'test') {
    console.error('[Redis] Connection error:', err.message);
  }
});
