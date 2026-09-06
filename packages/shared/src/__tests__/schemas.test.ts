import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createSubmissionSchema } from '../validation/submission.schema';
import {
  problemFilterSchema,
  adminSampleCaseSchema,
  adminJudgeTestCaseSchema,
  createProblemSchema,
  updateProblemSchema,
} from '../validation/problem.schema';
import { SupportedLanguages } from '../constants/languages';

describe('Validation Schemas Unit Tests', () => {
  describe('Submission Schema (Byte vs Character Limits)', () => {
    it('should accept valid submission within 64 KB', () => {
      const result = createSubmissionSchema.safeParse({
        problemId: 'prob-123',
        language: SupportedLanguages.PYTHON,
        code: 'print("Hello World")',
      });
      assert.ok(result.success);
    });

    it('should reject code that exceeds 64 KB in UTF-8 bytes even if characters are fewer', () => {
      // 3-byte UTF-8 character '中'
      // 25,000 '中' characters is 25,000 chars (< 65536 chars) but 75,000 bytes (> 65536 bytes)
      const multiByteCode = '中'.repeat(25000);
      assert.ok(multiByteCode.length < 65536);
      assert.ok(new TextEncoder().encode(multiByteCode).length > 65536);

      const result = createSubmissionSchema.safeParse({
        problemId: 'prob-123',
        language: SupportedLanguages.PYTHON,
        code: multiByteCode,
      });

      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(result.error.errors.some((e) => e.message.includes('byte size')));
      }
    });

    it('should reject empty code', () => {
      const result = createSubmissionSchema.safeParse({
        problemId: 'prob-123',
        language: SupportedLanguages.PYTHON,
        code: '',
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('Problem Filter Schema', () => {
    it('should accept tag and tags arrays up to 20 elements', () => {
      const validTags = Array.from({ length: 20 }, (_, i) => `tag-${i}`);
      const result = problemFilterSchema.safeParse({
        tags: validTags,
      });
      assert.ok(result.success);
    });

    it('should reject tags array with more than 20 elements', () => {
      const tooManyTags = Array.from({ length: 21 }, (_, i) => `tag-${i}`);
      const result = problemFilterSchema.safeParse({
        tags: tooManyTags,
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('TestCase Schemas (Empty Output Enforcement)', () => {
    it('should reject empty output in sample cases', () => {
      const result = adminSampleCaseSchema.safeParse({
        input: '1 2',
        output: '',
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(result.error.errors.some((e) => e.path.includes('output')));
      }
    });

    it('should reject empty output in judge test cases', () => {
      const result = adminJudgeTestCaseSchema.safeParse({
        input: '1 2',
        output: '',
        isSample: false,
      });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid non-empty test cases', () => {
      const sampleResult = adminSampleCaseSchema.safeParse({
        input: '1 2',
        output: '3',
      });
      assert.ok(sampleResult.success);

      const judgeResult = adminJudgeTestCaseSchema.safeParse({
        input: '1 2',
        output: '3',
        isSample: true,
      });
      assert.ok(judgeResult.success);
    });
  });

  describe('Problem Update Schema', () => {
    it('should allow partial updates while maintaining field rules when provided', () => {
      const validPartial = updateProblemSchema.safeParse({
        name: 'Updated Name',
      });
      assert.ok(validPartial.success);

      const invalidCode = updateProblemSchema.safeParse({
        problemCode: 'INVALID CODE WITH SPACES',
      });
      assert.strictEqual(invalidCode.success, false);
    });
  });
});
