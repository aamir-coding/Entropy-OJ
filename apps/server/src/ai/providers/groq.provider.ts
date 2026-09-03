import { AIProvider, ChatCompletionParams, ChatCompletionResult, AIProviderError } from './types';
import { TokenBucketLimiter, withDynamicBackoff } from '../rateLimiter';

export interface GroqProviderConfig {
  apiKey?: string;
  defaultModel?: string;
  rpmLimit?: number;
}

export class GroqProvider implements AIProvider {
  readonly name = 'groq';
  private readonly apiKey: string | undefined;
  private readonly defaultModel: string;
  private readonly rateLimiter: TokenBucketLimiter;

  constructor(config: GroqProviderConfig = {}) {
    this.apiKey = config.apiKey || process.env.GROQ_API_KEY;
    this.defaultModel = config.defaultModel || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    const rpm = config.rpmLimit || (process.env.GROQ_RPM_LIMIT ? parseInt(process.env.GROQ_RPM_LIMIT, 10) : 30);
    this.rateLimiter = new TokenBucketLimiter(rpm);
  }

  async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResult> {
    if (!this.apiKey) {
      throw new AIProviderError('Groq API key is not configured', 503, undefined, false, this.name);
    }

    if (!this.rateLimiter.tryConsume()) {
      const waitMs = this.rateLimiter.getEstimatedWaitMs();
      throw new AIProviderError(
        `Groq static rate limit exceeded (RPM). Try again in ${Math.ceil(waitMs / 1000)}s`,
        429,
        waitMs,
        true,
        this.name
      );
    }

    const model = params.model || this.defaultModel;

    return withDynamicBackoff(
      async () => {
        const body: Record<string, any> = {
          model,
          messages: params.messages,
          temperature: params.temperature ?? 0.7,
        };

        if (params.maxTokens) {
          body.max_tokens = params.maxTokens;
        }

        if (params.responseFormat === 'json') {
          body.response_format = { type: 'json_object' };
        }

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) {
          let retryAfterMs: number | undefined;
          const retryHeader = res.headers.get('retry-after');
          if (retryHeader) {
            const seconds = parseFloat(retryHeader);
            if (!isNaN(seconds)) retryAfterMs = seconds * 1000;
          }

          let errorMsg = `Groq API returned HTTP ${res.status}`;
          try {
            const errData = (await res.json()) as any;
            if (errData?.error?.message) {
              errorMsg = errData.error.message;
            }
          } catch {
            // response was not json
          }

          const isRateLimited = res.status === 429;
          throw new AIProviderError(errorMsg, res.status, retryAfterMs, isRateLimited, this.name);
        }

        const data = (await res.json()) as any;
        const choice = data?.choices?.[0];
        const content = choice?.message?.content || '';

        return {
          content,
          provider: this.name,
          model,
          usage: data?.usage
            ? {
                promptTokens: data.usage.prompt_tokens || 0,
                completionTokens: data.usage.completion_tokens || 0,
                totalTokens: data.usage.total_tokens || 0,
              }
            : undefined,
        };
      },
      { maxRetries: 2, providerName: this.name }
    );
  }
}
