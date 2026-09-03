import crypto from 'crypto';
import { IHintResponse, Verdict, Verdicts } from '@anti-oj/shared';
import { env } from '../../config/env';
import { redisClient } from '../../config/redis';
import { PerUserQuota } from '../rateLimiter';
import { stripCodeBlocks } from '../codeBlockStripper';
import { getProvider, callWithFallback, AIProvider, ChatMessage } from '../providers';

export interface HintServiceOptions {
  userId: string;
  problemId: string;
  problemCode: string;
  problemName: string;
  statement: string;
  sampleCases: Array<{ input: string; output: string; explanation?: string }>;
  code: string;
  language: string;
  verdict: Verdict;
  compileOutput?: string;
  customProviders?: AIProvider[]; // For testing / mock injection
}

export class HintService {
  private userQuota: PerUserQuota;

  constructor() {
    this.userQuota = new PerUserQuota(
      redisClient,
      'hints',
      env.AI_HINT_USER_DAILY_LIMIT,
      env.AI_HINT_USER_HOURLY_LIMIT
    );
  }

  private getCacheKey(problemId: string, code: string, verdict: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(`${problemId}:${code.trim()}:${verdict}`)
      .digest('hex');
    return `ai:hint:cache:${hash}`;
  }

  async getHint(options: HintServiceOptions): Promise<IHintResponse> {
    // 1. Check Feature Flag
    if (!env.FEATURE_AI_HINTS) {
      return {
        hint: 'The AI Hint Copilot is currently disabled by administrator configuration.',
        cached: false,
        provider: 'none',
      };
    }

    // 2. Validate Verdict Eligibility (Only non-AC failures are eligible)
    if (options.verdict === Verdicts.ACCEPTED) {
      return {
        hint: 'Your solution is already Accepted! Great job! No debugging hint is needed.',
        cached: false,
        provider: 'none',
      };
    }

    if (options.verdict === Verdicts.PENDING) {
      return {
        hint: 'Your submission is still being evaluated by the judge worker. Please wait for the verdict before requesting a hint.',
        cached: false,
        provider: 'none',
      };
    }

    // 3. Per-User Quota Check
    const quotaStatus = await this.userQuota.check(options.userId);
    if (!quotaStatus.allowed) {
      return {
        hint: `You have reached your hint limit (${env.AI_HINT_USER_DAILY_LIMIT} per day / ${env.AI_HINT_USER_HOURLY_LIMIT} per hour). Please take a moment to review your logic before asking again!`,
        cached: false,
        provider: 'none',
        remainingDaily: quotaStatus.remainingDaily,
        remainingHourly: quotaStatus.remainingHourly,
      };
    }

    // 4. Cache Check (Identical problem + code + verdict)
    const cacheKey = this.getCacheKey(options.problemId, options.code, options.verdict);
    try {
      const cachedHint = await redisClient.get(cacheKey);
      if (cachedHint) {
        return {
          hint: cachedHint,
          cached: true,
          provider: 'cache',
          remainingDaily: quotaStatus.remainingDaily,
          remainingHourly: quotaStatus.remainingHourly,
        };
      }
    } catch (err) {
      console.warn('[HintService] Cache read failed:', err);
    }

    // 5. Build Socratic Prompt (Strictly no hidden test case data)
    const sampleCasesSummary = options.sampleCases
      .slice(0, 2)
      .map((sc, i) => `Sample ${i + 1}: Input [${sc.input.trim()}] -> Output [${sc.output.trim()}]`)
      .join('\n');

    const systemPrompt = `You are a Socratic DSA tutor for competitive programming students.
The student submitted code for "${options.problemName}" and received verdict: "${options.verdict}".

CRITICAL GUARANTEES & RULES:
1. NEVER output code, code snippets, pseudo-code, or corrected implementations in ANY language.
2. NEVER use markdown backticks (\` or \`\`\`).
3. If verdict is Compilation Error or Runtime Error: translate the compiler error or stderr into plain English and point to the line or concept.
4. If verdict is Wrong Answer: ask 1-2 guiding questions about potential edge cases (e.g. empty input, bounds, duplicates, integer overflow, 0/1 base cases) without revealing the solution.
5. If verdict is Time Limit Exceeded: ask a question regarding the time complexity of their approach (e.g. nested loops vs O(n) or O(n log n)).
6. Keep response short (2 to 4 sentences max). Be encouraging and purely guiding.`;

    const userPrompt = `Problem Statement:
${options.statement}

${sampleCasesSummary ? `Public Samples:\n${sampleCasesSummary}\n` : ''}
Student Language: ${options.language}
Student Code:
${options.code}

Judge Verdict: ${options.verdict}
${options.compileOutput ? `Compiler Output / Stderr:\n${options.compileOutput}\n` : ''}

Please give me a Socratic hint to help me fix this. Remember: DO NOT write any code or code blocks!`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // 6. Execute Provider Call with Fallback (Groq primary -> OpenRouter fallback)
    const primaryProvider = getProvider('groq');
    const fallbackProvider = getProvider('openrouter');
    const providersToUse = options.customProviders || [primaryProvider, fallbackProvider];

    let rawHint = '';
    let usedProvider = 'groq';

    try {
      const completion = await callWithFallback(providersToUse, {
        model: '',
        messages,
        temperature: 0.5,
        maxTokens: 300,
      });

      rawHint = completion.content;
      usedProvider = completion.provider;
    } catch (err: any) {
      console.error('[HintService] All providers failed:', err.message);
      return {
        hint: 'Our AI tutor is experiencing high demand right now. Please try again in a few minutes or review your logic against the sample test cases.',
        cached: false,
        provider: 'none',
        remainingDaily: quotaStatus.remainingDaily,
        remainingHourly: quotaStatus.remainingHourly,
      };
    }

    // 7. Strip Code Blocks & Code Patterns (Hard Security Guarantee)
    const sanitizedHint = stripCodeBlocks(rawHint);

    // 8. Consume Quota
    await this.userQuota.consume(options.userId);

    // 9. Cache in Redis (1 hour TTL)
    try {
      await redisClient.set(cacheKey, sanitizedHint, 'EX', 3600);
    } catch (err) {
      console.warn('[HintService] Cache write failed:', err);
    }

    return {
      hint: sanitizedHint,
      cached: false,
      provider: usedProvider,
      remainingDaily: Math.max(0, quotaStatus.remainingDaily - 1),
      remainingHourly: Math.max(0, quotaStatus.remainingHourly - 1),
    };
  }
}

export const hintService = new HintService();
