import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getModelSolution, hasModelSolution, MODEL_SOLUTIONS } from '../constants/modelSolutions';
import { SupportedLanguages, LANGUAGE_CONFIGS } from '../constants/languages';

describe('Model Solutions Subpath Helper Tests', () => {
  it('should verify registered model solution for known problem (two-sum)', () => {
    assert.ok(hasModelSolution('two-sum'));
    assert.ok(hasModelSolution('two-sum', SupportedLanguages.PYTHON));
    assert.ok(hasModelSolution('two-sum', SupportedLanguages.CPP));

    const pySolution = getModelSolution('two-sum', SupportedLanguages.PYTHON);
    assert.ok(pySolution.length > 0);
    assert.ok(pySolution.includes('solve()') || pySolution.includes('main()'));

    const cppSolution = getModelSolution('two-sum', SupportedLanguages.CPP);
    assert.ok(cppSolution.length > 0);
    assert.ok(cppSolution.includes('int main()'));
  });

  it('hasModelSolution should return false for unregistered problem', () => {
    assert.strictEqual(hasModelSolution('completely-nonexistent-problem-xyz'), false);
    assert.strictEqual(hasModelSolution(null), false);
    assert.strictEqual(hasModelSolution(undefined), false);
  });

  it('getModelSolution should fallback to language starter code for unknown problems', () => {
    const pyFallback = getModelSolution('unknown-problem-123', SupportedLanguages.PYTHON);
    assert.strictEqual(pyFallback, LANGUAGE_CONFIGS[SupportedLanguages.PYTHON].starterCode);

    const cppFallback = getModelSolution('unknown-problem-123', SupportedLanguages.CPP);
    assert.strictEqual(cppFallback, LANGUAGE_CONFIGS[SupportedLanguages.CPP].starterCode);
  });

  it('MODEL_SOLUTIONS table should be deeply frozen', () => {
    assert.ok(Object.isFrozen(MODEL_SOLUTIONS));
    const twoSum = MODEL_SOLUTIONS['two-sum'];
    if (twoSum) {
      assert.ok(Object.isFrozen(twoSum));
    }
  });
});
