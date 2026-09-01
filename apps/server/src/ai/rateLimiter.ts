import Redis from 'ioredis';
import { AIProviderError } from './providers/types';

/**
 * In-memory Token Bucket rate limiter for static RPM/RPS enforcement.
 */
export class TokenBucketLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRatePerMs: number;

  constructor(maxRequestsPerMinute: number) {
    this.capacity = Math.max(1, maxRequestsPerMinute);
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
    this.refillRatePerMs = this.capacity / (60 * 1000);
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
      console.warn('[PerUserQuota] Redis check error, allowing request conservatively:', err);
      return {
        allowed: true,
        remainingDaily: this.dailyLimit,
        remainingHourly: this.hourlyLimit,
        resetDailySec: 86400,
        resetHourlySec: 3600,
      };
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
