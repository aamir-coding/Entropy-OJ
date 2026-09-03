import { AIProvider, ChatCompletionParams, ChatCompletionResult, AIProviderError } from './types';
import { TokenBucketLimiter, withDynamicBackoff } from '../rateLimiter';

export interface GeminiProviderConfig {
  apiKey?: string;
  defaultModel?: string;
  models?: string[];
  rpmLimit?: number;
}

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private readonly apiKey: string | undefined;
  private readonly models: string[];
  private readonly rateLimiter: TokenBucketLimiter;

  constructor(config: GeminiProviderConfig = {}) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;
    const defaultModel = config.defaultModel || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.models = config.models || [
      defaultModel,
      'gemini-3.0-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.7-flash',
    ].filter((m, i, arr) => arr.indexOf(m) === i); // Deduplicate

    const rpm = config.rpmLimit || (process.env.GEMINI_RPM_LIMIT ? parseInt(process.env.GEMINI_RPM_LIMIT, 10) : 10);
    this.rateLimiter = new TokenBucketLimiter(rpm);
  }

  async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResult> {
    if (!this.apiKey) {
      throw new AIProviderError('Gemini API key is not configured', 503, undefined, false, this.name);
    }

    if (!this.rateLimiter.tryConsume()) {
      const waitMs = this.rateLimiter.getEstimatedWaitMs();
      throw new AIProviderError(
        `Gemini static rate limit exceeded (RPM). Try again in ${Math.ceil(waitMs / 1000)}s`,
        429,
        waitMs,
        true,
        this.name
      );
    }

    const candidateModels = params.model ? [params.model, ...this.models.filter((m) => m !== params.model)] : this.models;
    let lastError: Error | null = null;

    for (const model of candidateModels) {
      try {
        const result = await this.executeSingleModelCall(model, params);
        return result;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini] Model '${model}' call failed: ${err.message}. Trying next Gemini fallback model...`);
      }
    }

    throw lastError || new AIProviderError('All Gemini models exhausted without success', 502, undefined, false, this.name);
  }

  private async executeSingleModelCall(model: string, params: ChatCompletionParams): Promise<ChatCompletionResult> {
    return withDynamicBackoff(
      async () => {
        // Convert messages to Gemini format
        const systemMessage = params.messages.find((m) => m.role === 'system');
        const nonSystemMessages = params.messages.filter((m) => m.role !== 'system');

        const contents = nonSystemMessages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const body: Record<string, any> = {
          contents,
          generationConfig: {
            temperature: params.temperature ?? 0.4,
          },
        };

        if (systemMessage) {
          body.systemInstruction = {
            parts: [{ text: systemMessage.content }],
          };
        }

        if (params.maxTokens) {
          body.generationConfig.maxOutputTokens = params.maxTokens;
        }

        if (params.responseFormat === 'json') {
          body.generationConfig.responseMimeType = 'application/json';
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(30000),
        });

        if (!res.ok) {
          let errorMsg = `Gemini API returned HTTP ${res.status}`;
          let isRateLimited = res.status === 429;

          try {
            const errData = (await res.json()) as any;
            if (errData?.error?.message) {
              errorMsg = errData.error.message;
            }
            if (errData?.error?.status === 'RESOURCE_EXHAUSTED') {
              isRateLimited = true;
            }
          } catch {
            // non-json response
          }

          throw new AIProviderError(errorMsg, res.status, undefined, isRateLimited, this.name);
        }

        const data = (await res.json()) as any;
        const candidate = data?.candidates?.[0];
        const content = candidate?.content?.parts?.map((p: any) => p.text || '').join('') || '';

        const usageMetadata = data?.usageMetadata;

        return {
          content,
          provider: this.name,
          model,
          usage: usageMetadata
            ? {
              promptTokens: usageMetadata.promptTokenCount || 0,
              completionTokens: usageMetadata.candidatesTokenCount || 0,
              totalTokens: usageMetadata.totalTokenCount || 0,
            }
            : undefined,
        };
      },
      { maxRetries: 2, providerName: this.name }
    );
  }
}
