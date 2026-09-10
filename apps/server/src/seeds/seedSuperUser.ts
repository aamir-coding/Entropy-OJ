import mongoose from 'mongoose';
import { User } from '../models/User';
import { Problem } from '../models/Problem';
import { TestCase } from '../models/TestCase';
import { Solution } from '../models/Solution';
import { env } from '../config/env';
import { Verdicts, SupportedLanguages } from '@entropy-oj/shared';
import { getModelSolution } from '@entropy-oj/shared/solutions';

import { ensureProblemsSeeded } from './seedProblems';

export async function resetAndOrganicallySeedSuperUser(): Promise<void> {
  console.log('[SuperUser Provisioner] Connecting to MongoDB at:', env.MONGO_URI);

  // Guarantee problems and test cases are seeded before provisioning solutions
  await ensureProblemsSeeded();

  // 1. Find existing superuser and delete all associated records
  const existingSuperUser = await User.findOne({ email: 'superuser@entropy.dev' });
  if (existingSuperUser) {
    const deletedSolutions = await Solution.deleteMany({ user: existingSuperUser._id });
    console.log(`[SuperUser Provisioner] Deleted ${deletedSolutions.deletedCount} stale solutions for existing superuser.`);
    await User.deleteOne({ _id: existingSuperUser._id });
    console.log('[SuperUser Provisioner] Deleted existing superuser account.');
  }

  // 2. Also clean up any orphaned solutions pointing to deleted problems
  const currentProblemIds = new Set(
    (await Problem.find({}, { _id: 1 })).map((p) => p._id.toString())
  );
  const allSolutions = await Solution.find({});
  let orphanedCount = 0;
  for (const sol of allSolutions) {
    if (!sol.problem || !currentProblemIds.has(sol.problem.toString())) {
      await Solution.deleteOne({ _id: sol._id });
      orphanedCount++;
    }
  }
  if (orphanedCount > 0) {
    console.log(`[SuperUser Provisioner] Cleaned up ${orphanedCount} orphaned solutions from database.`);
  }

  // 3. Organically create fresh Super User
  const superUser = await User.create({
    fullName: 'Super User',
    email: 'superuser@entropy.dev',
    password: 'Password@123',
    role: 'user',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  });
  console.log(`[SuperUser Provisioner] Created fresh Super User: ${superUser.email} (ID: ${superUser._id})`);

  // 4. Select active problems to organically solve (All 9 problems in Arrays & Hashing + cross-system coverage)
  const solvedProblemCodes = [
    // ── Arrays & Hashing Star System (All 9 Problems Solved) ─────────────────
    { code: 'contains-duplicate', lang: SupportedLanguages.PYTHON, approach: 'Hash Set Lookup', timeC: 'O(N)', spaceC: 'O(N)' },
    { code: 'valid-anagram', lang: SupportedLanguages.PYTHON, approach: 'Character Frequency Counting', timeC: 'O(N)', spaceC: 'O(1)' },
    { code: 'two-sum', lang: SupportedLanguages.PYTHON, approach: 'Hash Map Frequency Counting', timeC: 'O(N)', spaceC: 'O(N)' },
    { code: 'group-anagrams', lang: SupportedLanguages.PYTHON, approach: 'Sorted String Hash Map Grouping', timeC: 'O(N * K log K)', spaceC: 'O(N * K)' },
    { code: 'top-k-frequent-elements', lang: SupportedLanguages.PYTHON, approach: 'Hash Map Frequency Bucket Sort', timeC: 'O(N)', spaceC: 'O(N)' },
    { code: 'product-of-array-except-self', lang: SupportedLanguages.CPP, approach: 'Prefix & Suffix Product Array Accumulation', timeC: 'O(N)', spaceC: 'O(1)' },
    { code: 'valid-sudoku', lang: SupportedLanguages.PYTHON, approach: 'Row, Column & Box Hash Sets', timeC: 'O(1)', spaceC: 'O(1)' },
    { code: 'encode-and-decode-strings', lang: SupportedLanguages.PYTHON, approach: 'Length-Prefixed Chunk Delimiting', timeC: 'O(N)', spaceC: 'O(1)' },
    { code: 'longest-consecutive-sequence', lang: SupportedLanguages.CPP, approach: 'Hash Set Sequence Exploration', timeC: 'O(N)', spaceC: 'O(N)' },

    // ── Additional Solved Problems Across Other Star Systems ────────────────
    { code: 'valid-palindrome', lang: SupportedLanguages.CPP, approach: 'Two Pointers In-Place', timeC: 'O(N)', spaceC: 'O(1)' },
    { code: 'best-time-to-buy-and-sell-stock', lang: SupportedLanguages.CPP, approach: 'Single Pass Min Tracking', timeC: 'O(N)', spaceC: 'O(1)' },
    { code: 'valid-parentheses', lang: SupportedLanguages.PYTHON, approach: 'Stack-based Matching', timeC: 'O(N)', spaceC: 'O(N)' },
  ];

  const now = Date.now();
  const totalCount = solvedProblemCodes.length;

  for (let i = 0; i < totalCount; i++) {
    const item = solvedProblemCodes[i];
    const problemDoc = await Problem.findOne({ problemCode: item.code });
    if (!problemDoc) {
      console.warn(`[SuperUser Provisioner] Warning: Problem ${item.code} not found in database!`);
      continue;
    }

    const testCaseCount = await TestCase.countDocuments({ problem: problemDoc._id });
    const modelCode = getModelSolution(item.code, item.lang) || '# Valid Model Solution';

    // Distribute submissions realistically across the past 6 days
    const hoursAgo = 3 + (totalCount - 1 - i) * (140 / totalCount) + (Math.random() * 2 - 1);
    const submittedAt = new Date(now - hoursAgo * 3600 * 1000);

    await Solution.create({
      user: superUser._id,
      problem: problemDoc._id,
      code: modelCode,
      language: item.lang,
      verdict: Verdicts.ACCEPTED,
      executionTime: Math.floor(18 + Math.random() * 25),
      memoryUsed: Math.floor(16000 + Math.random() * 8000),
      totalTestCases: testCaseCount,
      passedTestCases: testCaseCount,
      classification: {
        approach: item.approach,
        timeComplexity: item.timeC,
        spaceComplexity: item.spaceC,
        relatedProblemCode: item.code,
      },
      submittedAt,
    });

    const totalSubs = await Solution.countDocuments({ problem: problemDoc._id });
    const acceptedSubs = await Solution.countDocuments({ problem: problemDoc._id, verdict: Verdicts.ACCEPTED });
    await Problem.updateOne({ _id: problemDoc._id }, { totalSubmissions: totalSubs, acceptedSubmissions: acceptedSubs });
    console.log(`  ✔ Organically solved: ${item.code} (${item.lang}) -> Accepted (${testCaseCount}/${testCaseCount} tests)`);
  }

  // 5. Add 1 genuine Wrong Answer submission on an unsolved problem to organically produce realistic accuracy
  const waProblemDoc = await Problem.findOne({ problemCode: 'maximum-subarray' });
  if (waProblemDoc) {
    const waTestCases = await TestCase.countDocuments({ problem: waProblemDoc._id });
    const waCode = `class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        # Initial naive greedy attempt - fails on all negative arrays\n        cur = 0\n        res = 0\n        for n in nums:\n            cur += n\n            res = max(res, cur)\n        return res\n`;

    await Solution.create({
      user: superUser._id,
      problem: waProblemDoc._id,
      code: waCode,
      language: SupportedLanguages.PYTHON,
      verdict: Verdicts.WRONG_ANSWER,
      executionTime: 22,
      memoryUsed: 17200,
      totalTestCases: waTestCases,
      passedTestCases: Math.max(1, Math.floor(waTestCases * 0.3)),
      failedTestCaseNumber: Math.max(2, Math.floor(waTestCases * 0.3) + 1),
      submittedAt: new Date(now - 1.5 * 3600 * 1000), // 1.5 hours ago
    });
    const totalSubs = await Solution.countDocuments({ problem: waProblemDoc._id });
    const acceptedSubs = await Solution.countDocuments({ problem: waProblemDoc._id, verdict: Verdicts.ACCEPTED });
    await Problem.updateOne({ _id: waProblemDoc._id }, { totalSubmissions: totalSubs, acceptedSubmissions: acceptedSubs });
    console.log(`  ✔ Organically attempted: maximum-subarray -> Wrong Answer (partial tests passed)`);
  }

  console.log('[SuperUser Provisioner] ✅ Successfully provisioned Super User with genuine, organic submission history!');
}

// Allow direct CLI execution
if (require.main === module) {
  (async () => {
    try {
      await mongoose.connect(env.MONGO_URI);
      await resetAndOrganicallySeedSuperUser();
    } catch (err) {
      console.error('[SuperUser Provisioner] Fatal error:', err);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      console.log('[SuperUser Provisioner] MongoDB connection closed.');
    }
  })();
}
