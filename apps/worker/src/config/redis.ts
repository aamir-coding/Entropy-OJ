import Redis, { RedisOptions } from 'ioredis';
import { env } from './env';

export const redisConnectionOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    if (env.NODE_ENV === 'test') {
      return null;
    }
    return Math.min(times * 200, 3000);
  },
};

export const redisClient = new Redis(redisConnectionOptions);

redisClient.on('connect', () => {
  console.log(`[Worker Redis] Connected to Redis at ${env.REDIS_HOST}:${env.REDIS_PORT}`);
});

redisClient.on('error', (err) => {
  if (env.NODE_ENV !== 'test') {
    console.error('[Worker Redis] Connection error:', err.message);
  }
});
