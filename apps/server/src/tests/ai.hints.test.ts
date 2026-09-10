process.env.NODE_ENV = 'test';
import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import { HintService } from '../ai/hints/hintService';
import { AIProvider, ChatCompletionParams, ChatCompletionResult } from '../ai/providers';
import { Verdicts } from '@entropy-oj/shared';
import { redisClient } from '../config/redis';

class CapturePromptMockProvider implements AIProvider {
  readonly name = 'mock-capture';
  public lastPrompt = '';
  public returnWithCodeBlock = false;

  async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResult> {
    this.lastPrompt = params.messages.map((m) => m.content).join('\n');

    if (this.returnWithCodeBlock) {
      return {
        content: 'Consider this fix:\n```cpp\nint mid = left + (right - left) / 2;\n```\nDoes this prevent integer overflow?',
        provider: this.name,
        model: 'mock',
      };
    }

    return {
      content: 'Have you considered the case where the input array contains duplicate elements?',
      provider: this.name,
      model: 'mock',
    };
  }
}

describe('Socratic Debug Copilot Guardrails & Service Tests', () => {
  after(() => {
    try {
      redisClient.disconnect();
    } catch {}
  });

  it('should guarantee no code blocks or corrected snippets reach the client even if provider outputs code', async () => {
    const hintService = new HintService();
    const mockProvider = new CapturePromptMockProvider();
    mockProvider.returnWithCodeBlock = true;
    const uniqueNonce = Math.random().toString(36).slice(2);

    const res = await hintService.getHint({
      userId: `test-user-${uniqueNonce}`,
      problemId: `test-prob-${uniqueNonce}`,
      problemCode: 'two-sum',
      problemName: 'Two Sum',
      statement: 'Find two numbers adding up to target.',
      sampleCases: [{ input: '4 9\n2 7 11 15', output: '0 1' }],
      code: `def solve(): pass # ${uniqueNonce}`,
      language: 'python',
      verdict: Verdicts.WRONG_ANSWER,
      customProviders: [mockProvider],
    });

    assert.strictEqual(res.hint.includes('```'), false);
    assert.strictEqual(res.hint.includes('int mid = left'), false);
    assert.strictEqual(res.hint.includes('Does this prevent integer overflow?'), true);
  });

  it('should strictly exclude hidden test case data from AI prompt', async () => {
    const hintService = new HintService();
    const mockProvider = new CapturePromptMockProvider();
    const uniqueNonce = Math.random().toString(36).slice(2);

    await hintService.getHint({
      userId: `test-user-hidden-check-${uniqueNonce}`,
      problemId: `test-prob-789-${uniqueNonce}`,
      problemCode: 'valid-parentheses',
      problemName: 'Valid Parentheses',
      statement: 'Given string s with brackets, determine if valid.',
      sampleCases: [{ input: '()', output: 'true' }],
      code: `class Solution { public boolean isValid(String s) { return false; } } /* ${uniqueNonce} */`,
      language: 'cpp',
      verdict: Verdicts.WRONG_ANSWER,
      customProviders: [mockProvider],
    });

    const prompt = mockProvider.lastPrompt;
    assert.strictEqual(prompt.includes('Valid Parentheses'), true);
    assert.strictEqual(prompt.includes('Given string s with brackets'), true);
    // Ensure hidden test data marker is not present
    assert.strictEqual(prompt.includes('Hidden Test Case'), false);
  });

  it('should not generate hints for Accepted solutions', async () => {
    const hintService = new HintService();
    const mockProvider = new CapturePromptMockProvider();

    const res = await hintService.getHint({
      userId: 'test-user-ac',
      problemId: 'test-prob-ac',
      problemCode: 'two-sum',
      problemName: 'Two Sum',
      statement: 'Statement',
      sampleCases: [],
      code: 'code',
      language: 'python',
      verdict: Verdicts.ACCEPTED,
      customProviders: [mockProvider],
    });

    assert.strictEqual(res.hint.includes('already Accepted'), true);
    assert.strictEqual(mockProvider.lastPrompt, ''); // Provider was never called
  });

  it('should not generate hints for Pending submissions', async () => {
    const hintService = new HintService();
    const mockProvider = new CapturePromptMockProvider();

    const res = await hintService.getHint({
      userId: 'test-user-pending',
      problemId: 'test-prob-pd',
      problemCode: 'two-sum',
      problemName: 'Two Sum',
      statement: 'Statement',
      sampleCases: [],
      code: 'code',
      language: 'python',
      verdict: Verdicts.PENDING,
      customProviders: [mockProvider],
    });

    assert.strictEqual(res.hint.includes('still being evaluated'), true);
    assert.strictEqual(mockProvider.lastPrompt, '');
  });
});
