process.env.NODE_ENV = 'test';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ClassifyService } from '../ai/classify/classifyService';
import { AIProvider, ChatCompletionParams, ChatCompletionResult } from '../ai/providers';

class MockClassifierProvider implements AIProvider {
  readonly name = 'mock-classifier';

  async chatCompletion(_params: ChatCompletionParams): Promise<ChatCompletionResult> {
    const sample = {
      approach: 'Hash Map Frequency Counting',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      relatedProblemCode: 'two-sum-ii',
    };

    return {
      content: JSON.stringify(sample),
      provider: this.name,
      model: 'openrouter/mock-free',
    };
  }
}

describe('Post-AC Approach & Complexity Classifier Tests', () => {
  it('should parse approach classification JSON and structure properly', async () => {
    const classifyService = new ClassifyService();
    const mockProvider = new MockClassifierProvider();

    const result = await classifyService.classifySubmission(
      {
        submissionId: 'mock-sub-id',
        problemId: 'mock-prob-id',
        problemName: 'Two Sum',
        problemStatement: 'Find pair',
        code: 'seen = {}; return [seen[diff], i]',
        language: 'python',
      },
      mockProvider
    );

    assert.ok(result);
    assert.strictEqual(result?.approach, 'Hash Map Frequency Counting');
    assert.strictEqual(result?.timeComplexity, 'O(N)');
    assert.strictEqual(result?.spaceComplexity, 'O(N)');
    assert.strictEqual(result?.relatedProblemCode, 'two-sum-ii');
  });

  it('should gracefully handle malformed AI response without throwing', async () => {
    const classifyService = new ClassifyService();
    const badProvider: AIProvider = {
      name: 'bad-provider',
      async chatCompletion() {
        return {
          content: 'This is not json!',
          provider: 'bad-provider',
          model: 'mock',
        };
      },
    };

    const result = await classifyService.classifySubmission(
      {
        submissionId: 'mock-sub-id',
        problemId: 'mock-prob-id',
        problemName: 'Two Sum',
        problemStatement: 'Find pair',
        code: 'seen = {}',
        language: 'python',
      },
      badProvider
    );

    assert.strictEqual(result, null);
  });
});
