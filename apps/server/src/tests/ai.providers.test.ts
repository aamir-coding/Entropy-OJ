process.env.NODE_ENV = 'test';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TokenBucketLimiter, withDynamicBackoff } from '../ai/rateLimiter';
import { callWithFallback, AIProvider, AIProviderError, ChatCompletionParams, ChatCompletionResult } from '../ai/providers';

class MockProvider implements AIProvider {
  constructor(
    readonly name: string,
    public shouldFailWithRateLimit = false,
    public shouldFailWithError = false,
    public responseContent = 'Mocked response'
  ) {}

  async chatCompletion(_params: ChatCompletionParams): Promise<ChatCompletionResult> {
    if (this.shouldFailWithRateLimit) {
      throw new AIProviderError(`Rate limit exceeded on ${this.name}`, 429, 100, true, this.name);
    }
    if (this.shouldFailWithError) {
      throw new AIProviderError(`Internal error on ${this.name}`, 500, undefined, false, this.name);
    }
    return {
      content: this.responseContent,
      provider: this.name,
      model: 'mock-model',
    };
  }
}

describe('AI Provider Abstraction & Rate Limiter Tests', () => {
  describe('TokenBucketLimiter', () => {
    it('should allow requests within RPM capacity', () => {
      const limiter = new TokenBucketLimiter(5);
      assert.strictEqual(limiter.tryConsume(1), true);
      assert.strictEqual(limiter.tryConsume(1), true);
      assert.strictEqual(limiter.tryConsume(1), true);
      assert.strictEqual(limiter.tryConsume(1), true);
      assert.strictEqual(limiter.tryConsume(1), true);
      // 6th request should fail
      assert.strictEqual(limiter.tryConsume(1), false);
    });

    it('should calculate estimated wait time when exhausted', () => {
      const limiter = new TokenBucketLimiter(60); // 1 token per second
      limiter.tryConsume(60);
      assert.strictEqual(limiter.tryConsume(1), false);
      const waitMs = limiter.getEstimatedWaitMs(1);
      assert.strictEqual(waitMs > 0, true);
    });
  });

  describe('callWithFallback', () => {
    it('should succeed on primary provider when available', async () => {
      const p1 = new MockProvider('groq', false, false, 'Groq hint');
      const p2 = new MockProvider('openrouter', false, false, 'OpenRouter hint');

      const res = await callWithFallback([p1, p2], {
        model: 'test',
        messages: [{ role: 'user', content: 'hello' }],
      });

      assert.strictEqual(res.provider, 'groq');
      assert.strictEqual(res.content, 'Groq hint');
    });

    it('should automatically cascade to fallback provider when primary returns 429', async () => {
      const p1 = new MockProvider('groq', true, false); // Rate limited
      const p2 = new MockProvider('openrouter', false, false, 'Fallback hint from OpenRouter');

      const res = await callWithFallback([p1, p2], {
        model: 'test',
        messages: [{ role: 'user', content: 'hello' }],
      });

      assert.strictEqual(res.provider, 'openrouter');
      assert.strictEqual(res.content, 'Fallback hint from OpenRouter');
    });

    it('should throw when all providers in fallback chain fail', async () => {
      const p1 = new MockProvider('groq', true, false);
      const p2 = new MockProvider('openrouter', false, true);

      await assert.rejects(
        async () => {
          await callWithFallback([p1, p2], {
            model: 'test',
            messages: [{ role: 'user', content: 'hello' }],
          });
        },
        (err: any) => {
          return err instanceof AIProviderError || err.statusCode === 500;
        }
      );
    });
  });

  describe('withDynamicBackoff', () => {
    it('should retry on transient failures and succeed', async () => {
      let attempts = 0;
      const result = await withDynamicBackoff(
        async () => {
          attempts++;
          if (attempts < 2) {
            throw new AIProviderError('Rate limited', 429, 50, true, 'mock');
          }
          return 'Success after retry';
        },
        { maxRetries: 3, initialDelayMs: 20, maxDelayMs: 100 }
      );

      assert.strictEqual(result, 'Success after retry');
      assert.strictEqual(attempts, 2);
    });
  });
});
