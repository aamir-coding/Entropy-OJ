process.env.NODE_ENV = 'test';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ReviewService } from '../ai/review/reviewService';
import { AIProvider, ChatCompletionParams, ChatCompletionResult } from '../ai/providers';

class MockGeminiReviewProvider implements AIProvider {
  readonly name = 'mock-gemini';
  public lastPrompt = '';

  async chatCompletion(params: ChatCompletionParams): Promise<ChatCompletionResult> {
    this.lastPrompt = params.messages.map((m) => m.content).join('\n');

    const sampleResponse = {
      statementAmbiguities: [
        { issue: 'Does not state whether array can contain negative numbers', suggestion: 'Explicitly specify range of nums[i]' },
      ],
      missingEdgeCases: [
        { description: 'Empty array input', suggestedInput: '0 0\n', expectedBehavior: 'Return empty array or handle error' },
      ],
      adversarialInputs: [
        { input: '10000 0\n0 0 0 ... 0', rationale: 'O(N^2) brute force will timeout' },
      ],
      inconsistencies: [
        { between: 'Statement vs Test Cases', issue: 'Statement says N >= 2 but Test Case 3 has N = 1' },
      ],
      overallAssessment: 'Solid problem package, but edge cases around bounds should be reinforced.',
    };

    return {
      content: JSON.stringify(sampleResponse),
      provider: this.name,
      model: 'gemini-2.5-flash',
    };
  }
}

describe('AI Problem-Setting QA Review Service Tests', () => {
  it('should parse structured findings from Gemini Flash package audit', async () => {
    const reviewService = new ReviewService();
    const mockProvider = new MockGeminiReviewProvider();

    const result = await reviewService.reviewProblem({
      problemCode: 'two-sum',
      problemName: 'Two Sum',
      statement: 'Find two indices.',
      difficulty: 'Easy',
      tags: ['Array'],
      timeLimitMs: 1000,
      memoryLimitKb: 256 * 1024,
      sampleCases: [{ input: '4 9\n2 7 11 15', output: '0 1' }],
      testCases: [
        { _id: 'tc1', problem: 'p1', input: '4 9\n2 7 11 15', output: '0 1', isSample: true, order: 1 },
        { _id: 'tc2', problem: 'p1', input: '5 10\n1 2 3 7 9', output: '2 3', isSample: false, order: 2 },
      ],
      customProvider: mockProvider,
    });

    assert.strictEqual(result.statementAmbiguities.length, 1);
    assert.strictEqual(result.missingEdgeCases.length, 1);
    assert.strictEqual(result.adversarialInputs.length, 1);
    assert.strictEqual(result.inconsistencies.length, 1);
    assert.strictEqual(result.overallAssessment.includes('Solid problem package'), true);

    // Verify full package (including hidden test cases) is included in prompt for admin QA audit
    assert.strictEqual(mockProvider.lastPrompt.includes('5 10\n1 2 3 7 9'), true);
  });
});
