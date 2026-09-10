import mongoose from 'mongoose';
import { User } from '../models/User';
import { Solution } from '../models/Solution';
import { Problem } from '../models/Problem';
import { env } from '../config/env';
import { Verdicts } from '@entropy-oj/shared';

const ARRAYS_HASHING = [
  'contains-duplicate',
  'valid-anagram',
  'two-sum',
  'group-anagrams',
  'top-k-frequent-elements',
  'product-of-array-except-self',
  'valid-sudoku',
  'encode-and-decode-strings',
  'longest-consecutive-sequence',
];

async function main() {
  await mongoose.connect(env.MONGO_URI);
  const user = await User.findOne({ email: 'superuser@entropy.dev' });
  if (!user) {
    console.error('Super User not found');
    process.exit(1);
  }

  const solutions = await Solution.find({ user: user._id, verdict: Verdicts.ACCEPTED }).populate('problem');
  const solvedCodes = new Set(solutions.map((s: any) => s.problem?.problemCode));

  console.log('Super User ID:', user._id);
  console.log('Total Solved Problems across all systems:', solvedCodes.size);

  let ahSolved = 0;
  for (const code of ARRAYS_HASHING) {
    const isSolved = solvedCodes.has(code);
    console.log(`  [${isSolved ? '✔' : '❌'}] ${code}`);
    if (isSolved) ahSolved++;
  }

  console.log(`\nArrays & Hashing Star System Status: ${ahSolved} / ${ARRAYS_HASHING.length} solved!`);
  await mongoose.disconnect();
}

main().catch(console.error);
