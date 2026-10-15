import Redis, { RedisOptions } from 'ioredis';
import { env } from './env';

export const redisConnectionOptions: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  // FIX: Render talks to Redis on the Azure VM over the public internet.
  // Azure silently drops TCP connections that stay idle (default 4 minutes),
  // so after a quiet period the next command went into a dead connection and
  // only got through minutes later, after a reconnect. TCP keep-alive probes
  // every 30 seconds keep the connection active, so it is never dropped as idle.
  // BullMQ copies these options for its Queue and QueueEvents connections,
  // so this one setting covers all of them.
  keepAlive: 30000,
  retryStrategy(times) {
    if (env.NODE_ENV === 'test') {
      return null; // Do not hang test runner if Redis is offline
    }
    if (times % 10 === 0) {
      console.warn(`[Redis] Reconnection attempt ${times} to ${env.REDIS_HOST}:${env.REDIS_PORT}...`);
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