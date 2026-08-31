import mongoose from 'mongoose';
import { Problem } from '../models/Problem';
import { TestCase } from '../models/TestCase';
import { env } from '../config/env';

interface SeedProblemData {
  problemCode: string;
  name: string;
  statement: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  timeLimitMs: number;
  memoryLimitKb: number;
  sampleCases: { input: string; output: string; explanation?: string }[];
  testCases: { input: string; output: string; isSample: boolean }[];
}

const SEED_PROBLEMS: SeedProblemData[] = [
  {
    problemCode: 'two-sum',
    name: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description

Given an array of integers \`nums\` of length \`N\` and an integer \`target\`, find the indices of the two numbers such that they add up to \`target\`.

You may assume that each input will have **exactly one solution**, and you may not use the same element twice.

Print the two 0-indexed positions separated by a space in ascending order.

---

### Input Format
- First line: Two space-separated integers \`N\` and \`target\`.
- Second line: \`N\` space-separated integers representing the array \`nums\`.

### Output Format
- Print the two indices separated by a space on a single line (smaller index first).

### Constraints
- $2 \\le N \\le 10^4$
- $-10^9 \\le nums[i] \\le 10^9$
- $-10^9 \\le target \\le 10^9$
- Exactly one valid answer exists.
`,
    sampleCases: [
      {
        input: '4 9\n2 7 11 15',
        output: '0 1',
        explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1.',
      },
      {
        input: '3 6\n3 2 4',
        output: '1 2',
        explanation: 'Because nums[1] + nums[2] == 2 + 4 == 6, we return 1 2.',
      },
      {
        input: '2 6\n3 3',
        output: '0 1',
        explanation: 'Because nums[0] + nums[1] == 3 + 3 == 6, we return 0 1.',
      },
    ],
    testCases: [
      { input: '4 9\n2 7 11 15', output: '0 1', isSample: true },
      { input: '3 6\n3 2 4', output: '1 2', isSample: true },
      { input: '2 6\n3 3', output: '0 1', isSample: true },
      { input: '5 10\n1 2 3 7 9', output: '2 3', isSample: false },
      { input: '5 0\n-5 2 3 5 9', output: '0 3', isSample: false },
      { input: '6 -10\n-2 -3 -8 4 1 9', output: '0 2', isSample: false },
      { input: '4 100\n10 20 30 70', output: '2 3', isSample: false },
    ],
  },
  {
    problemCode: 'valid-parentheses',
    name: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description

Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

---

### Input Format
- The first line contains an integer \`T\` representing the number of test cases.
- Each of the next \`T\` lines contains a string \`s\`.

### Output Format
- For each test case, print \`true\` if the string is valid, or \`false\` otherwise on a new line.

### Constraints
- $1 \\le T \\le 100$
- $1 \\le \\text{length of } s \\le 10^4$
- \`s\` consists of parentheses only \`'()[]{}'\`.
`,
    sampleCases: [
      {
        input: '3\n()\n()[]{}\n(]',
        output: 'true\ntrue\nfalse',
        explanation: '() and ()[]{} are balanced. (] is not properly closed.',
      },
      {
        input: '2\n([)]\n{[]}',
        output: 'false\ntrue',
        explanation: '([)] has mismatched nesting order, while {[]} is correctly nested.',
      },
    ],
    testCases: [
      { input: '3\n()\n()[]{}\n(]', output: 'true\ntrue\nfalse', isSample: true },
      { input: '2\n([)]\n{[]}', output: 'false\ntrue', isSample: true },
      { input: '4\n(\n)\n((\n))', output: 'false\nfalse\nfalse\nfalse', isSample: false },
      { input: '3\n((({{{[[[]]]}}})))\n{[]}()\n{{{{}}}}', output: 'true\ntrue\ntrue', isSample: false },
      { input: '3\n[[\n]]\n({[()]})', output: 'false\nfalse\ntrue', isSample: false },
    ],
  },
  {
    problemCode: 'reverse-array',
    name: 'Reverse an Array',
    difficulty: 'Easy',
    tags: ['Array', 'Two Pointers'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description

Given an array of integers of size \`N\`, print the elements of the array in reversed order.

---

### Input Format
- First line: An integer \`N\`.
- Second line: \`N\` space-separated integers.

### Output Format
- Print the \`N\` integers in reversed order separated by spaces on a single line.

### Constraints
- $1 \\le N \\le 10^5$
- $-10^9 \\le A[i] \\le 10^9$
`,
    sampleCases: [
      {
        input: '4\n1 2 3 4',
        output: '4 3 2 1',
        explanation: 'The reversed order of [1, 2, 3, 4] is 4 3 2 1.',
      },
      {
        input: '1\n42',
        output: '42',
        explanation: 'A single element reversed is unchanged.',
      },
    ],
    testCases: [
      { input: '4\n1 2 3 4', output: '4 3 2 1', isSample: true },
      { input: '1\n42', output: '42', isSample: true },
      { input: '5\n10 20 30 40 50', output: '50 40 30 20 10', isSample: false },
      { input: '6\n-5 -4 -3 3 4 5', output: '5 4 3 -3 -4 -5', isSample: false },
      { input: '7\n1 1 1 2 2 3 3', output: '3 3 2 2 1 1 1', isSample: false },
    ],
  },
  {
    problemCode: 'longest-unique-substring',
    name: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    tags: ['String', 'Sliding Window', 'Hash Table'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description

Given a string \`s\`, find the length of the **longest substring** without duplicate characters.

---

### Input Format
- A single line containing the string \`s\`.

### Output Format
- Print a single integer representing the length of the longest substring with all unique characters.

### Constraints
- $0 \\le \\text{length of } s \\le 5 \\cdot 10^4$
- \`s\` consists of English letters, digits, symbols and spaces.
`,
    sampleCases: [
      {
        input: 'abcabcbb',
        output: '3',
        explanation: 'The answer is "abc", with length 3.',
      },
      {
        input: 'bbbbb',
        output: '1',
        explanation: 'The answer is "b", with length 1.',
      },
      {
        input: 'pwwkew',
        output: '3',
        explanation: 'The answer is "wke", with length 3. Note "pwke" is a subsequence and not a substring.',
      },
    ],
    testCases: [
      { input: 'abcabcbb', output: '3', isSample: true },
      { input: 'bbbbb', output: '1', isSample: true },
      { input: 'pwwkew', output: '3', isSample: true },
      { input: 'abcdefg', output: '7', isSample: false },
      { input: 'aab', output: '2', isSample: false },
      { input: 'dvdf', output: '3', isSample: false },
      { input: 'tmmzuxt', output: '5', isSample: false },
    ],
  },
  {
    problemCode: 'maximum-subarray',
    name: 'Maximum Subarray Sum',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description

Given an integer array \`nums\` of size \`N\`, find the subarray with the largest sum, and print its sum (Kadane's Algorithm).

A **subarray** is a contiguous non-empty sequence of elements within an array.

---

### Input Format
- First line: An integer \`N\`.
- Second line: \`N\` space-separated integers.

### Output Format
- Print a single integer representing the maximum subarray sum.

### Constraints
- $1 \\le N \\le 10^5$
- $-10^4 \\le nums[i] \\le 10^4$
`,
    sampleCases: [
      {
        input: '9\n-2 1 -3 4 -1 2 1 -5 4',
        output: '6',
        explanation: 'The subarray [4, -1, 2, 1] has the largest sum = 6.',
      },
      {
        input: '1\n1',
        output: '1',
        explanation: 'The subarray [1] has the largest sum = 1.',
      },
      {
        input: '5\n5 4 -1 7 8',
        output: '23',
        explanation: 'The subarray [5, 4, -1, 7, 8] has the largest sum = 23.',
      },
    ],
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', isSample: true },
      { input: '1\n1', output: '1', isSample: true },
      { input: '5\n5 4 -1 7 8', output: '23', isSample: true },
      { input: '4\n-5 -2 -8 -1', output: '-1', isSample: false },
      { input: '6\n-2 -3 4 -1 -2 1 5 -3', output: '7', isSample: false },
      { input: '8\n-1 2 3 -4 5 1 -2 3', output: '8', isSample: false },
    ],
  },
  {
    problemCode: 'trapping-rain-water',
    name: 'Trapping Rain Water',
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description

Given \`N\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

---

### Input Format
- First line: An integer \`N\`.
- Second line: \`N\` non-negative space-separated integers.

### Output Format
- Print a single integer representing total units of trapped water.

### Constraints
- $1 \\le N \\le 2 \\cdot 10^4$
- $0 \\le \\text{height}[i] \\le 10^5$
`,
    sampleCases: [
      {
        input: '12\n0 1 0 2 1 0 1 3 2 1 2 1',
        output: '6',
        explanation: 'The elevation map is [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water are trapped.',
      },
      {
        input: '6\n4 2 0 3 2 5',
        output: '9',
        explanation: 'Trapped water units is 9.',
      },
    ],
    testCases: [
      { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', output: '6', isSample: true },
      { input: '6\n4 2 0 3 2 5', output: '9', isSample: true },
      { input: '5\n3 0 0 0 3', output: '9', isSample: false },
      { input: '5\n1 2 3 4 5', output: '0', isSample: false },
      { input: '5\n5 4 3 2 1', output: '0', isSample: false },
      { input: '10\n0 2 0 3 1 0 1 3 2 1', output: '7', isSample: false },
    ],
  },
];

export async function seedDatabase(): Promise<void> {
  try {
    console.log('[Seeder] Connecting to MongoDB at:', env.MONGO_URI);
    await mongoose.connect(env.MONGO_URI);

    console.log('[Seeder] Clearing existing Problems and TestCases...');
    await Problem.deleteMany({});
    await TestCase.deleteMany({});

    console.log(`[Seeder] Seeding ${SEED_PROBLEMS.length} problems with test cases...`);

    for (const probData of SEED_PROBLEMS) {
      const { testCases, ...problemFields } = probData;

      const createdProblem = await Problem.create(problemFields);

      const testCaseDocs = testCases.map((tc, index) => ({
        problem: createdProblem._id,
        input: tc.input,
        output: tc.output,
        isSample: tc.isSample,
        order: index + 1,
      }));

      await TestCase.insertMany(testCaseDocs);
      console.log(`  ✔ Seeded: [${createdProblem.difficulty}] ${createdProblem.name} (${testCaseDocs.length} test cases)`);
    }

    console.log('[Seeder] ✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('[Seeder] ❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Seeder] MongoDB connection closed.');
  }
}

// Execute seeding if run directly
seedDatabase();
