import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_SEED_PROBLEMS } from '../seeds/data';
import { MODEL_SOLUTIONS, getModelSolution } from '@anti-oj/shared/solutions';
import { SupportedLanguages } from '@anti-oj/shared';

describe('NeetCode 150 Problem Suite Verification', () => {
  test('Suite contains exactly 150 problems', () => {
    assert.equal(ALL_SEED_PROBLEMS.length, 150, `Expected 150 problems, got ${ALL_SEED_PROBLEMS.length}`);
  });

  test('All problem codes are unique', () => {
    const codes = new Set<string>();
    for (const prob of ALL_SEED_PROBLEMS) {
      assert.ok(!codes.has(prob.problemCode), `Duplicate problem code found: ${prob.problemCode}`);
      codes.add(prob.problemCode);
    }
    assert.equal(codes.size, 150);
  });

  test('Every problem has at least 10 hidden test cases (total >= 12)', () => {
    const deficient: { code: string; hiddenCount: number }[] = [];
    for (const prob of ALL_SEED_PROBLEMS) {
      const hiddenCases = prob.testCases.filter((tc) => !tc.isSample);
      if (hiddenCases.length < 10) {
        deficient.push({ code: prob.problemCode, hiddenCount: hiddenCases.length });
      }
      assert.ok(
        prob.sampleCases.length >= 2,
        `Problem ${prob.problemCode} must have at least 2 sample cases`
      );
      assert.ok(
        prob.statement.length > 50,
        `Problem ${prob.problemCode} has an abnormally short problem statement`
      );
    }
    if (deficient.length > 0) {
      console.log('Deficient problems:', deficient);
    }
    assert.equal(
      deficient.length,
      0,
      `Found ${deficient.length} problems with fewer than 10 hidden test cases: ${deficient.map((d) => `${d.code} (${d.hiddenCount})`).join(', ')}`
    );
  });

  test('Every problem has matching Python and C++ reference model solutions', () => {
    for (const prob of ALL_SEED_PROBLEMS) {
      const sol = MODEL_SOLUTIONS[prob.problemCode];
      assert.ok(sol, `Missing model solution entry for problem: ${prob.problemCode}`);
      assert.ok(
        sol.python && sol.python.trim().length > 20,
        `Missing or empty Python solution for problem: ${prob.problemCode}`
      );
      assert.ok(
        sol.cpp && sol.cpp.trim().length > 20,
        `Missing or empty C++ solution for problem: ${prob.problemCode}`
      );

      // getModelSolution helper test
      const pyCode = getModelSolution(prob.problemCode, SupportedLanguages.PYTHON);
      assert.equal(pyCode, sol.python);
      const cppCode = getModelSolution(prob.problemCode, SupportedLanguages.CPP);
      assert.equal(cppCode, sol.cpp);
    }
  });

  test('Difficulty distribution matches standard NeetCode 150 expectations', () => {
    const difficulties = { Easy: 0, Medium: 0, Hard: 0 };
    for (const prob of ALL_SEED_PROBLEMS) {
      difficulties[prob.difficulty]++;
    }
    console.log('Difficulty Breakdown:', difficulties);
    assert.ok(difficulties.Easy >= 25, `Expected >= 25 Easy problems, got ${difficulties.Easy}`);
    assert.ok(difficulties.Medium >= 80, `Expected >= 80 Medium problems, got ${difficulties.Medium}`);
    assert.ok(difficulties.Hard >= 20, `Expected >= 20 Hard problems, got ${difficulties.Hard}`);
  });
});
