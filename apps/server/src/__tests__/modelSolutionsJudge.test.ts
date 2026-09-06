import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, SpawnSyncReturns } from 'node:child_process';
import { ALL_SEED_PROBLEMS } from '../seeds/data';
import { SeedTestCase } from '../seeds/types';
import { getModelSolution } from '@anti-oj/shared/solutions';
import { SupportedLanguages, diffOutput } from '@anti-oj/shared';

describe('Model Solutions OJ Execution Verification', () => {
  // Test representative problems across all 18 clusters
  const sampleSlugs = [
    'two-sum',                               // Cluster 1
    'valid-palindrome',                      // Cluster 2
    'best-time-to-buy-and-sell-stock',       // Cluster 3
    'valid-parentheses',                     // Cluster 4
    'binary-search',                         // Cluster 5
    'reverse-linked-list',                   // Cluster 6
    'invert-binary-tree',                    // Cluster 7
    'implement-trie-prefix-tree',            // Cluster 8
    'kth-largest-element-in-an-array',       // Cluster 9
    'subsets',                               // Cluster 10
    'number-of-islands',                     // Cluster 11
    'network-delay-time',                    // Cluster 12
    'climbing-stairs',                       // Cluster 13
    'unique-paths',                          // Cluster 14
    'maximum-subarray',                      // Cluster 15
    'insert-interval',                       // Cluster 16
    'happy-number',                          // Cluster 17
    'single-number',                         // Cluster 18
  ];

  for (const slug of sampleSlugs) {
    const prob = ALL_SEED_PROBLEMS.find((p) => p.problemCode === slug);
    if (!prob) continue;

    test(`Execute model solution: ${slug} against all testcases`, () => {
      const pyCode = getModelSolution(slug, SupportedLanguages.PYTHON);
      assert.ok(pyCode, `Python solution must exist for ${slug}`);

      for (let i = 0; i < prob.testCases.length; i++) {
        const tc: SeedTestCase = prob.testCases[i];
        const res: ReturnType<typeof spawnSync> = spawnSync('python', ['-c', pyCode], {
          input: tc.input,
          encoding: 'utf-8',
          timeout: 5000,
        });

        assert.equal(
          res.status,
          0,
          `Problem ${slug} failed on test case #${i + 1} with error:\n${res.stderr}\nInput:\n${tc.input}`
        );

        const diff = diffOutput(String(res.stdout), tc.output);
        assert.ok(
          diff.isMatch,
          `Problem ${slug} output mismatch on test case #${i + 1}:\nExpected:\n${tc.output}\nGot:\n${res.stdout}\nInput:\n${tc.input}`
        );
      }
    });
  }
});
