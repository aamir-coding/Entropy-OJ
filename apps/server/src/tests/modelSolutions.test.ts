process.env.NODE_ENV = 'test';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MODEL_SOLUTIONS, getModelSolution } from '@entropy-oj/shared/solutions';
import { SupportedLanguages } from '@entropy-oj/shared';

describe('Model Solutions Verification Tests', () => {
  const problems = [
    // 12 Easy
    'two-sum',
    'valid-parentheses',
    'reverse-array',
    'best-time-to-buy-and-sell-stock',
    'binary-search',
    'climbing-stairs',
    'contains-duplicate',
    'valid-anagram',
    'single-number',
    'palindrome-number',
    'merge-two-sorted-arrays',
    'fizz-buzz-extended',
    // 10 Medium
    'maximum-subarray',
    'longest-unique-substring',
    'container-with-most-water',
    'three-sum',
    'coin-change',
    'longest-increasing-subsequence',
    'number-of-islands',
    'kth-largest-element',
    'course-schedule',
    'word-break',
    // 8 Hard
    'trapping-rain-water',
    'sliding-window-maximum',
    'median-of-two-sorted-arrays',
    'edit-distance',
    'merge-k-sorted-arrays',
    'longest-consecutive-sequence',
    'word-ladder',
    'n-queens',
  ];

  it('should have Python and C++ model solutions defined for all 30 problems', () => {
    assert.strictEqual(problems.length, 30, 'Must test exactly 30 problems');
    for (const slug of problems) {
      const pyCode = getModelSolution(slug, SupportedLanguages.PYTHON);
      const cppCode = getModelSolution(slug, SupportedLanguages.CPP);

      assert.ok(pyCode && pyCode.length > 20, `Python model solution for ${slug} must be non-empty`);
      assert.ok(cppCode && cppCode.length > 20, `C++ model solution for ${slug} must be non-empty`);
      assert.notStrictEqual(pyCode, cppCode, `Python and C++ code for ${slug} must differ`);
    }
  });

  it('getModelSolution should fallback to language starter code for unknown problems', () => {
    const pyStarter = getModelSolution('unknown-problem-123', SupportedLanguages.PYTHON);
    const cppStarter = getModelSolution('unknown-problem-123', SupportedLanguages.CPP);

    assert.ok(pyStarter.includes('def main'));
    assert.ok(cppStarter.includes('#include <iostream>'));
  });
});

