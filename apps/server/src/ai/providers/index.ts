import { AIProvider, ChatCompletionParams, ChatCompletionResult, AIProviderError } from './types';
import { GroqProvider } from './groq.provider';
import { GeminiProvider } from './gemini.provider';
import { OpenRouterProvider } from './openrouter.provider';

export * from './types';
export * from './groq.provider';
export * from './gemini.provider';
export * from './openrouter.provider';

const providersMap: Map<string, AIProvider> = new Map();

export function getProvider(name: 'groq' | 'gemini' | 'openrouter'): AIProvider {
  if (providersMap.has(name)) {
    return providersMap.get(name)!;
  }

  let provider: AIProvider;
  switch (name) {
    case 'groq':
      provider = new GroqProvider();
      break;
    case 'gemini':
      provider = new GeminiProvider();
      break;
    case 'openrouter':
      provider = new OpenRouterProvider();
      break;
    default:
      throw new Error(`Unknown AI provider name: ${name}`);
  }

  providersMap.set(name, provider);
  return provider;
}

/**
 * Executes chat completion across a chain of providers with automatic fallback.
 * Cascades on 429 rate limits, 503 unavailable, or server errors.
 */
export async function callWithFallback(
  providers: AIProvider[],
  params: ChatCompletionParams
): Promise<ChatCompletionResult> {
  if (!providers || providers.length === 0) {
    throw new AIProviderError('No AI providers specified for fallback chain', 500);
  }

  let lastError: Error | null = null;

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    try {
      return await provider.chatCompletion(params);
    } catch (err: any) {
      lastError = err;
      const isLast = i === providers.length - 1;
      const errorMsg = err instanceof Error ? err.message : String(err);

      console.warn(
        `[AI Fallback Chain] Provider '${provider.name}' failed (${errorMsg}). ${
          isLast ? 'No more fallback providers remaining.' : `Cascading to next provider '${providers[i + 1].name}'...`
        }`
      );
    }
  }

  throw (
    lastError ||
    new AIProviderError('All AI providers in fallback chain failed to generate a response', 502)
  );
}
