import { AIProvider, ChatCompletionParams, ChatCompletionResult, AIProviderError } from './types';
import { TokenBucketLimiter, withDynamicBackoff } from '../rateLimiter';

export interface OpenRouterProviderConfig {
  apiKey?: string;
  models?: string[];
  rpmLimit?: number;
}

export class OpenRouterProvider implements AIProvider {
  readonly name = 'openrouter';
  private readonly apiKey: string | undefined;
  private readonly models: string[];
  private readonly rateLimiter: TokenBucketLimiter;

  constructor(config: OpenRouterProviderConfig = {}) {
    this.apiKey = config.apiKey || process.env.OPENROUTER_API_KEY;

    const envModels = process.env.OPENROUTER_MODELS
      ? process.env.OPENROUTER_MODELS.split(',').map((m) => m.trim()).filter(Boolean)
      : [];

    this.models = config.models || (envModels.length > 0 ? envModels : [
      'openrouter/free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'deepseek/deepseek-r1:free',
      'deepseek/deepseek-chat:free',
      'qwen/qwen-2.5-coder-32b-instruct:free',
      'mistralai/mistral-small-24b-instruct-2501:free',
    ]);

    const rpm = config.rpmLimit || (process.env.OPENROUTER_RPM_LIMIT ? parseInt(process.env.OPENROUTER_RPM_LIMIT, 10) : 20);
    this.rateLimiter = new TokenBucketLimiter(rpm);
  }

  async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResult> {
    if (!this.apiKey) {
      throw new AIProviderError('OpenRouter API key is not configured', 503, undefined, false, this.name);
    }

    if (!this.rateLimiter.tryConsume()) {
      const waitMs = this.rateLimiter.getEstimatedWaitMs();
      throw new AIProviderError(
        `OpenRouter static rate limit exceeded (RPM). Try again in ${Math.ceil(waitMs / 1000)}s`,
        429,
        waitMs,
        true,
        this.name
      );
    }

    // Attempt models in fallback order
    const candidateModels = params.model ? [params.model, ...this.models.filter((m) => m !== params.model)] : this.models;
    let lastError: Error | null = null;

    for (const model of candidateModels) {
      try {
        const result = await this.executeSingleModelCall(model, params);
        return result;
      } catch (err: any) {
        lastError = err;
        console.warn(`[OpenRouter] Model ${model} failed: ${err.message}. Trying next fallback model...`);
        // If it was rate limited or provider error, continue to next model in free pool
      }
    }

    throw lastError || new AIProviderError('All OpenRouter models exhausted without success', 502, undefined, false, this.name);
  }

  private async executeSingleModelCall(model: string, params: ChatCompletionParams): Promise<ChatCompletionResult> {
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

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
            'X-Title': 'Entropy',
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

          let errorMsg = `OpenRouter API returned HTTP ${res.status} for model ${model}`;
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
        let content = choice?.message?.content || '';
        if (!content && choice?.message?.reasoning_content) {
          content = choice.message.reasoning_content;
        }

        if (!content || !content.trim()) {
          throw new Error(`OpenRouter model ${model} returned empty content`);
        }

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
      { maxRetries: 1, providerName: `${this.name}:${model}` }
    );
  }
}
