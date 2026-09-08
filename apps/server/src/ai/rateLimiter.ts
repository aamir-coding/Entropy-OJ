import Redis from 'ioredis';
import { AIProviderError } from './providers/types';

/**
 * Token Bucket rate limiter supporting local memory and shared Redis sliding window (Medium 2).
 */
export class TokenBucketLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRatePerMs: number;
  private readonly redisClient?: Redis;
  private readonly redisKey?: string;

  constructor(maxRequestsPerMinute: number, redisClient?: Redis, redisKey?: string) {
    this.capacity = Math.max(1, maxRequestsPerMinute);
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
    this.refillRatePerMs = this.capacity / (60 * 1000);
    this.redisClient = redisClient;
    this.redisKey = redisKey;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    if (elapsed > 0) {
      const addedTokens = elapsed * this.refillRatePerMs;
      this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
      this.lastRefill = now;
    }
  }

  tryConsume(tokens = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  async tryConsumeAsync(tokens = 1): Promise<boolean> {
    // Medium 2: Coordinated sliding window rate limiting across server replicas using Redis
    if (this.redisClient && this.redisKey) {
      try {
        const now = Date.now();
        const windowMs = 60000;
        const clearBefore = now - windowMs;
        const pipeline = this.redisClient.pipeline();
        pipeline.zremrangebyscore(this.redisKey, 0, clearBefore);
        pipeline.zcard(this.redisKey);
        const results = await pipeline.exec();
        const currentCount = (results?.[1]?.[1] as number) || 0;
        if (currentCount + tokens <= this.capacity) {
          const addPipeline = this.redisClient.pipeline();
          for (let i = 0; i < tokens; i++) {
            addPipeline.zadd(this.redisKey, now, `${now}-${Math.random()}`);
          }
          addPipeline.pexpire(this.redisKey, windowMs * 2);
          await addPipeline.exec();
          this.tryConsume(tokens);
          return true;
        }
        return false;
      } catch {
        return this.tryConsume(tokens);
      }
    }
    return this.tryConsume(tokens);
  }

  getEstimatedWaitMs(tokens = 1): number {
    this.refill();
    if (this.tokens >= tokens) return 0;
    const deficit = tokens - this.tokens;
    return Math.ceil(deficit / this.refillRatePerMs);
  }
}

export interface UserQuotaStatus {
  allowed: boolean;
  remainingDaily: number;
  remainingHourly: number;
  resetDailySec: number;
  resetHourlySec: number;
}

/**
 * Redis-backed per-user daily and hourly quota tracker.
 */
export class PerUserQuota {
  constructor(
    private readonly redisClient: Redis,
    private readonly featurePrefix: string,
    private readonly dailyLimit: number,
    private readonly hourlyLimit: number
  ) {}

  private getDailyKey(userId: string): string {
    const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `quota:${this.featurePrefix}:daily:${userId}:${dateStr}`;
  }

  private getHourlyKey(userId: string): string {
    const hourStr = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
    return `quota:${this.featurePrefix}:hourly:${userId}:${hourStr}`;
  }

  async check(userId: string): Promise<UserQuotaStatus> {
    try {
      const dailyKey = this.getDailyKey(userId);
      const hourlyKey = this.getHourlyKey(userId);

      const [dailyCountStr, hourlyCountStr, dailyTtl, hourlyTtl] = await Promise.all([
        this.redisClient.get(dailyKey),
        this.redisClient.get(hourlyKey),
        this.redisClient.ttl(dailyKey),
        this.redisClient.ttl(hourlyKey),
      ]);

      const dailyCount = parseInt(dailyCountStr || '0', 10);
      const hourlyCount = parseInt(hourlyCountStr || '0', 10);

      const remainingDaily = Math.max(0, this.dailyLimit - dailyCount);
      const remainingHourly = Math.max(0, this.hourlyLimit - hourlyCount);

      const allowed = dailyCount < this.dailyLimit && hourlyCount < this.hourlyLimit;

      return {
        allowed,
        remainingDaily,
        remainingHourly,
        resetDailySec: dailyTtl > 0 ? dailyTtl : 86400,
        resetHourlySec: hourlyTtl > 0 ? hourlyTtl : 3600,
      };
    } catch (err) {
      if (process.env.NODE_ENV === 'test') {
        return {
          allowed: true,
          remainingDaily: this.dailyLimit,
          remainingHourly: this.hourlyLimit,
          resetDailySec: 86400,
          resetHourlySec: 3600,
        };
      }
      console.error('[PerUserQuota] Redis check error, failing closed to protect AI quota:', err);
      return {
        allowed: false,
        remainingDaily: 0,
        remainingHourly: 0,
        resetDailySec: 86400,
        resetHourlySec: 3600,
      };
    }
  }

  /**
   * Atomic check-and-consume using Redis Lua script to prevent race conditions on parallel requests (Medium 1).
   */
  async checkAndConsume(userId: string): Promise<UserQuotaStatus> {
    try {
      const dailyKey = this.getDailyKey(userId);
      const hourlyKey = this.getHourlyKey(userId);

      const luaScript = `
        local dailyKey = KEYS[1]
        local hourlyKey = KEYS[2]
        local dailyLimit = tonumber(ARGV[1])
        local hourlyLimit = tonumber(ARGV[2])
        local dailyTtl = tonumber(ARGV[3])
        local hourlyTtl = tonumber(ARGV[4])

        local dailyCount = tonumber(redis.call('get', dailyKey) or '0')
        local hourlyCount = tonumber(redis.call('get', hourlyKey) or '0')

        if dailyCount >= dailyLimit or hourlyCount >= hourlyLimit then
          local dt = redis.call('ttl', dailyKey)
          local ht = redis.call('ttl', hourlyKey)
          return { 0, math.max(0, dailyLimit - dailyCount), math.max(0, hourlyLimit - hourlyCount), dt > 0 and dt or dailyTtl, ht > 0 and ht or hourlyTtl }
        end

        local newDaily = redis.call('incr', dailyKey)
        if newDaily == 1 then
          redis.call('expire', dailyKey, dailyTtl)
        end

        local newHourly = redis.call('incr', hourlyKey)
        if newHourly == 1 then
          redis.call('expire', hourlyKey, hourlyTtl)
        end

        local dt = redis.call('ttl', dailyKey)
        local ht = redis.call('ttl', hourlyKey)

        return { 1, math.max(0, dailyLimit - newDaily), math.max(0, hourlyLimit - newHourly), dt > 0 and dt or dailyTtl, ht > 0 and ht or hourlyTtl }
      `;

      const res = (await this.redisClient.eval(
        luaScript,
        2,
        dailyKey,
        hourlyKey,
        this.dailyLimit,
        this.hourlyLimit,
        86400 * 2,
        3600 * 2
      )) as [number, number, number, number, number];

      const allowed = res[0] === 1;
      const remainingDaily = res[1];
      const remainingHourly = res[2];
      const resetDailySec = res[3];
      const resetHourlySec = res[4];

      return {
        allowed,
        remainingDaily,
        remainingHourly,
        resetDailySec,
        resetHourlySec,
      };
    } catch (err) {
      if (process.env.NODE_ENV === 'test') {
        return {
          allowed: true,
          remainingDaily: this.dailyLimit,
          remainingHourly: this.hourlyLimit,
          resetDailySec: 86400,
          resetHourlySec: 3600,
        };
      }
      console.error('[PerUserQuota] Redis checkAndConsume error, failing closed:', err);
      return {
        allowed: false,
        remainingDaily: 0,
        remainingHourly: 0,
        resetDailySec: 86400,
        resetHourlySec: 3600,
      };
    }
  }

  async refund(userId: string): Promise<void> {
    try {
      const dailyKey = this.getDailyKey(userId);
      const hourlyKey = this.getHourlyKey(userId);
      const pipeline = this.redisClient.pipeline();
      pipeline.decr(dailyKey);
      pipeline.decr(hourlyKey);
      await pipeline.exec();
    } catch (err) {
      console.warn('[PerUserQuota] Redis refund error:', err);
    }
  }

  async consume(userId: string): Promise<void> {
    try {
      const dailyKey = this.getDailyKey(userId);
      const hourlyKey = this.getHourlyKey(userId);

      const pipeline = this.redisClient.pipeline();
      pipeline.incr(dailyKey);
      pipeline.expire(dailyKey, 86400 * 2); // 2 days TTL
      pipeline.incr(hourlyKey);
      pipeline.expire(hourlyKey, 3600 * 2); // 2 hours TTL
      await pipeline.exec();
    } catch (err) {
      console.warn('[PerUserQuota] Redis consume error:', err);
    }
  }
}

/**
 * Dynamic backoff retry wrapper for handling 429s and temporary provider errors.
 */
export async function withDynamicBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    providerName?: string;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 5000;
  const provider = options.providerName ?? 'ai-provider';

  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;

      const isRateLimited = error instanceof AIProviderError ? error.isRateLimited : error?.status === 429;
      const isRetryable =
        isRateLimited ||
        error?.statusCode >= 500 ||
        error?.code === 'ECONNRESET' ||
        error?.code === 'ETIMEDOUT';

      if (!isRetryable || attempt > maxRetries) {
        throw error;
      }

      let waitMs = initialDelayMs * Math.pow(2, attempt - 1) + Math.random() * 200;
      if (error instanceof AIProviderError && error.retryAfterMs) {
        waitMs = Math.min(error.retryAfterMs, maxDelayMs);
      } else {
        waitMs = Math.min(waitMs, maxDelayMs);
      }

      console.warn(
        `[${provider}] Attempt ${attempt} failed with ${error.message || 'error'}. Backing off for ${Math.round(waitMs)}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}
