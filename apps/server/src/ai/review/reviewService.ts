import {
  IProblemReviewResponse,
  SupportedLanguage,
  ITestCase,
  ISampleTestCase,
} from '@anti-oj/shared';
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

    // 2. Prepare problem package components
    const samplesFormatted = (options.sampleCases || [])
      .map(
        (sc, i) =>
          `[Sample Case ${i + 1}]\nInput:\n${sc.input}\nOutput:\n${sc.output}${
            sc.explanation ? `\nExplanation: ${sc.explanation}` : ''
          }`
      )
      .join('\n\n');

    const testCasesFormatted = (options.testCases || [])
      .slice(0, 30) // Include up to 30 full judge test cases for deep analysis
      .map(
        (tc, i) =>
          `[Test Case ${i + 1} (${tc.isSample ? 'Sample' : 'Hidden'})]\nInput:\n${tc.input}\nExpected Output:\n${tc.output}`
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
    ? `=== REFERENCE MODEL SOLUTION (${options.referenceSolutionLanguage || 'cpp'}) ===\n${options.referenceSolution}\n`
    : ''
}

Please perform a thorough audit and return the structured JSON review findings.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const provider = options.customProvider || getProvider('gemini');

    const completion = await provider.chatCompletion({
      model: '',
      messages,
      temperature: 0.2,
      maxTokens: 3000,
      responseFormat: 'json',
    });

    try {
      const parsed = parseAIJson<IProblemReviewResponse>(completion.content);
      return {
        statementAmbiguities: Array.isArray(parsed.statementAmbiguities) ? parsed.statementAmbiguities : [],
        missingEdgeCases: Array.isArray(parsed.missingEdgeCases) ? parsed.missingEdgeCases : [],
        adversarialInputs: Array.isArray(parsed.adversarialInputs) ? parsed.adversarialInputs : [],
        inconsistencies: Array.isArray(parsed.inconsistencies) ? parsed.inconsistencies : [],
        overallAssessment: parsed.overallAssessment || 'Audit completed.',
      };
    } catch (parseErr) {
      console.error('[ReviewService] JSON parse error for AI review response:', completion.content);
      throw new AIProviderError(
        'AI review returned invalid structured format. Please retry.',
        502
      );
    }
  }
}

export const reviewService = new ReviewService();

