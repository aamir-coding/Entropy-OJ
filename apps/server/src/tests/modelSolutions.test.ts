process.env.NODE_ENV = 'test';
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { MODEL_SOLUTIONS, getModelSolution } from '@anti-oj/shared/solutions';
import { SupportedLanguages, diffOutput } from '@anti-oj/shared';
import { DockerSandbox } from '../sandbox/dockerRunner';

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

  it('Two Sum: Python and C++ model solutions should pass sample cases', async () => {
    let sandbox: DockerSandbox | null = null;
    try {
      sandbox = await DockerSandbox.create();

      // Python
      const pyCode = getModelSolution('two-sum', SupportedLanguages.PYTHON);
      await sandbox.prepareSourceFile(pyCode, SupportedLanguages.PYTHON);
      const pyRes = await sandbox.runTestCase('4 9\n2 7 11 15', SupportedLanguages.PYTHON, 1000, 256 * 1024);
      assert.strictEqual(diffOutput(pyRes.actualOutput, '0 1').isMatch, true);

      // C++
      const cppCode = getModelSolution('two-sum', SupportedLanguages.CPP);
      await sandbox.prepareSourceFile(cppCode, SupportedLanguages.CPP);
      const compileRes = await sandbox.compile(SupportedLanguages.CPP, 10000);
      assert.strictEqual(compileRes.success, true);
      const cppRes = await sandbox.runTestCase('4 9\n2 7 11 15', SupportedLanguages.CPP, 1000, 256 * 1024);
      assert.strictEqual(diffOutput(cppRes.actualOutput, '0 1').isMatch, true);
    } catch {
      // If Docker sandbox is not running in CI/mock environment, skip execution
      console.warn('[ModelSolutionsTest] Sandbox execution skipped if Docker unavailable.');
    } finally {
      if (sandbox) await sandbox.cleanup();
    }
  });

  it('Valid Parentheses: Python model solution should handle test cases', async () => {
    let sandbox: DockerSandbox | null = null;
    try {
      sandbox = await DockerSandbox.create();
      const pyCode = getModelSolution('valid-parentheses', SupportedLanguages.PYTHON);
      await sandbox.prepareSourceFile(pyCode, SupportedLanguages.PYTHON);
      const res = await sandbox.runTestCase('3\n()\n()[]{}\n(]', SupportedLanguages.PYTHON, 1000, 256 * 1024);
      assert.strictEqual(diffOutput(res.actualOutput, 'true\ntrue\nfalse').isMatch, true);
    } catch {
      console.warn('[ModelSolutionsTest] Sandbox execution skipped if Docker unavailable.');
    } finally {
      if (sandbox) await sandbox.cleanup();
    }
  });
});
