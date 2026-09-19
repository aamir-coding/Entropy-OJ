import {
  IProblemReviewResponse,
  SupportedLanguage,
  ITestCase,
  ISampleTestCase,
} from '@entropy-oj/shared';
import { env } from '../../config/env';
import { getProvider, AIProvider, ChatMessage, AIProviderError } from '../providers';
import { parseAIJson } from '../jsonRepair';

export interface ProblemReviewOptions {
  problemCode: string;
  problemName: string;
  statement: string;
  difficulty: string;
  tags: string[];
  timeLimitMs: number;
  memoryLimitKb: number;
  sampleCases: ISampleTestCase[];
  testCases: ITestCase[];
  editorial?: string;
  referenceSolution?: string;
  referenceSolutionLanguage?: SupportedLanguage;
  customProvider?: AIProvider; // For testing / mock injection
}

export class ReviewService {
  async reviewProblem(options: ProblemReviewOptions): Promise<IProblemReviewResponse> {
    // 1. Check Feature Flag
    if (!env.FEATURE_AI_REVIEW) {
      throw new AIProviderError(
        'The AI Problem Review Co-Pilot is currently disabled by administrator configuration.',
        403
      );
    }

    // 2. Prepare problem package components with length safety to prevent token exhaustion
    const truncateText = (str: string, maxLen = 400): string => {
      if (!str) return '';
      const trimmed = str.trim();
      if (trimmed.length <= maxLen) return trimmed;
      return `${trimmed.slice(0, maxLen)}... [truncated ${trimmed.length - maxLen} chars]`;
    };

    const samplesFormatted = (options.sampleCases || [])
      .map(
        (sc, i) =>
          `[Sample Case ${i + 1}]\nInput:\n${truncateText(sc.input, 500)}\nOutput:\n${truncateText(sc.output, 500)}${
            sc.explanation ? `\nExplanation: ${truncateText(sc.explanation, 500)}` : ''
          }`
      )
      .join('\n\n');

    const testCasesFormatted = (options.testCases || [])
      .slice(0, 25) // Include up to 25 judge test cases for deep analysis
      .map(
        (tc, i) =>
          `[Test Case ${i + 1} (${tc.isSample ? 'Sample' : 'Hidden'})]\nInput:\n${truncateText(tc.input, 300)}\nExpected Output:\n${truncateText(tc.output, 300)}`
      )
      .join('\n\n');

    const systemPrompt = `You are a Principal Problem Setter and Quality Assurance Auditor for an elite competitive programming platform.
Your task is to comprehensively audit a full problem package (statement, sample test cases, hidden judge test cases, editorial, and reference solution).

You MUST return a JSON object with this exact schema:
{
  "statementAmbiguities": [
    { "issue": "Specific ambiguity or underspecified constraint in the statement", "suggestion": "How to clarify it precisely" }
  ],
  "missingEdgeCases": [
    { "description": "Edge case not covered in the test suite", "suggestedInput": "concrete input string", "expectedBehavior": "what the solution should produce" }
  ],
  "adversarialInputs": [
    { "input": "Input crafted to break naive or vulnerable solutions (e.g. O(N^2) TLE, recursion stack overflow, integer overflow)", "rationale": "Why this adversarial case is necessary" }
  ],
  "inconsistencies": [
    { "between": "Component pair, e.g. Statement vs Reference Solution or Statement vs Test Cases", "issue": "Explanation of discrepancy" }
  ],
  "overallAssessment": "A concise paragraph assessing the problem quality, balance, and readiness for publication."
}

CRITICAL RULES:
- Output ONLY valid, parseable JSON matching the schema. Do not enclose in markdown ticks if json mode is active.
- For large adversarial test inputs, provide plain strings or truncated summaries (e.g. "20000\\n100000 0 ... 0 100000"). DO NOT write code expressions like "+" or ".repeat()" in JSON strings.
- Escape all backslashes in mathematical formulas (e.g. \\\\le, \\\\cdot, \\\\sum, \\\\text).
- Look for common competitive programming flaws: 0 vs 1 based indexing ambiguity, empty array handling, negative numbers, integer overflow (32-bit vs 64-bit int), floating point precision, multiple valid answers without tie-breaking rules.
- Review reference solution for time and memory complexity adherence against the limits.`;

    const userPrompt = `Problem Package to Review:

Code: ${options.problemCode}
Title: ${options.problemName}
Difficulty: ${options.difficulty}
Tags: ${options.tags.join(', ')}
Time Limit: ${options.timeLimitMs}ms
Memory Limit: ${Math.round(options.memoryLimitKb / 1024)}MB

=== STATEMENT ===
${options.statement}

=== PUBLIC SAMPLE CASES ===
${samplesFormatted || 'None provided.'}

=== JUDGE TEST SUITE (Total: ${options.testCases.length} testcases) ===
${testCasesFormatted || 'None provided.'}

${options.editorial ? `=== EDITORIAL ===\n${options.editorial}\n` : ''}
${
  options.referenceSolution
    ? `=== REFERENCE MODEL SOLUTION (${options.referenceSolutionLanguage || 'cpp'}) ===\n${truncateText(options.referenceSolution, 3000)}\n`
    : ''
}

Please perform a thorough audit and return the structured JSON review findings.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    // 3. Configure Multi-Provider Fallback Chain: Gemini -> Groq -> OpenRouter
    const providersToUse: AIProvider[] = options.customProvider
      ? [options.customProvider]
      : [getProvider('gemini'), getProvider('groq'), getProvider('openrouter')];

    let lastError: any = null;

    for (let i = 0; i < providersToUse.length; i++) {
      const currentProvider = providersToUse[i];
      const isLast = i === providersToUse.length - 1;

      try {
        console.log(`[ReviewService] 🤖 Sending problem review to provider '${currentProvider.name}'...`);
        const startTime = Date.now();
        const completion = await currentProvider.chatCompletion({
          model: '',
          messages,
          temperature: 0.2,
          maxTokens: 8192,
          responseFormat: 'json',
        });

        const elapsed = Date.now() - startTime;
        console.log(`[ReviewService] ⚡ Provider '${currentProvider.name}' responded in ${elapsed}ms`);

        if (!completion.content || completion.content.trim().length === 0) {
          throw new Error(`Provider '${currentProvider.name}' returned empty response content.`);
        }

        const parsed = parseAIJson<IProblemReviewResponse>(completion.content);

        return {
          statementAmbiguities: Array.isArray(parsed.statementAmbiguities) ? parsed.statementAmbiguities : [],
          missingEdgeCases: Array.isArray(parsed.missingEdgeCases) ? parsed.missingEdgeCases : [],
          adversarialInputs: Array.isArray(parsed.adversarialInputs) ? parsed.adversarialInputs : [],
          inconsistencies: Array.isArray(parsed.inconsistencies) ? parsed.inconsistencies : [],
          overallAssessment: parsed.overallAssessment || 'Problem review audit completed.',
        };
      } catch (err: any) {
        lastError = err;
        console.warn(
          `[ReviewService] Provider '${currentProvider.name}' failed during review or parse (${err.message}). ${
            isLast ? 'No remaining fallback providers.' : `Cascading to fallback provider '${providersToUse[i + 1].name}'...`
          }`
        );
      }
    }

    console.error('[ReviewService] All AI review providers failed:', lastError?.message);
    throw new AIProviderError(
      'AI review returned invalid structured format. Please retry.',
      lastError?.statusCode || 502
    );
  }
}

export const reviewService = new ReviewService();

