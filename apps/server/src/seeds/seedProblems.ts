import mongoose from 'mongoose';
import { Problem } from '../models/Problem';
import { TestCase } from '../models/TestCase';
import { User } from '../models/User';
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
  // ─── 1. TWO SUM (Easy) ──────────────────────────────────────────────────────
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

### Input Format
- First line: Two space-separated integers \`N\` and \`target\`.
- Second line: \`N\` space-separated integers representing the array \`nums\`.

### Output Format
- Print the two 0-indexed positions separated by a space on a single line (smaller index first).

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
    ],
    testCases: [
      { input: '4 9\n2 7 11 15', output: '0 1', isSample: true },
      { input: '3 6\n3 2 4', output: '1 2', isSample: true },
      { input: '2 6\n3 3', output: '0 1', isSample: false },
      { input: '5 10\n1 2 3 7 9', output: '2 3', isSample: false },
      { input: '5 0\n-5 2 3 5 9', output: '0 3', isSample: false },
      { input: '6 -10\n-2 -3 -8 4 1 9', output: '0 2', isSample: false },
      { input: '4 100\n10 20 30 70', output: '2 3', isSample: false },
    ],
  },

  // ─── 2. VALID PARENTHESES (Easy) ────────────────────────────────────────────
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

### Input Format
- First line: An integer \`T\` representing the number of test cases.
- Next \`T\` lines: Each line contains a string \`s\`.

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
        explanation: '() and ()[]{} are balanced. (] has mismatched closing bracket.',
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

  // ─── 3. REVERSE AN ARRAY (Easy) ─────────────────────────────────────────────
  {
    problemCode: 'reverse-array',
    name: 'Reverse an Array',
    difficulty: 'Easy',
    tags: ['Array', 'Two Pointers'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array of integers of size \`N\`, print the elements of the array in reversed order.

### Input Format
- First line: An integer \`N\` representing the number of elements.
- Second line: \`N\` space-separated integers.

### Output Format
- Print the reversed array elements separated by spaces on a single line.

### Constraints
- $1 \\le N \\le 10^5$
- $-10^9 \\le A[i] \\le 10^9$
`,
    sampleCases: [
      {
        input: '5\n1 2 3 4 5',
        output: '5 4 3 2 1',
        explanation: 'Reversing [1, 2, 3, 4, 5] gives [5, 4, 3, 2, 1].',
      },
      {
        input: '4\n10 -2 30 4',
        output: '4 30 -2 10',
        explanation: 'Reversing [10, -2, 30, 4] gives [4, 30, -2, 10].',
      },
    ],
    testCases: [
      { input: '5\n1 2 3 4 5', output: '5 4 3 2 1', isSample: true },
      { input: '4\n10 -2 30 4', output: '4 30 -2 10', isSample: true },
      { input: '1\n42', output: '42', isSample: false },
      { input: '2\n7 9', output: '9 7', isSample: false },
      { input: '6\n-1 -2 -3 -4 -5 -6', output: '-6 -5 -4 -3 -2 -1', isSample: false },
      { input: '5\n0 0 1 0 0', output: '0 0 1 0 0', isSample: false },
    ],
  },

  // ─── 4. BEST TIME TO BUY AND SELL STOCK (Easy) ──────────────────────────────
  {
    problemCode: 'best-time-to-buy-and-sell-stock',
    name: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    tags: ['Array', 'Greedy', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an array \`prices\` of length \`N\` where \`prices[i]\` is the price of a given stock on the $i$-th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.

### Input Format
- First line: An integer \`N\`.
- Second line: \`N\` space-separated integers representing stock prices.

### Output Format
- Print a single integer representing the maximum profit.

### Constraints
- $1 \\le N \\le 10^5$
- $0 \\le prices[i] \\le 10^4$
`,
    sampleCases: [
      {
        input: '6\n7 1 5 3 6 4',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.',
      },
      {
        input: '5\n7 6 4 3 1',
        output: '0',
        explanation: 'In this case, no transactions are done and the max profit = 0.',
      },
    ],
    testCases: [
      { input: '6\n7 1 5 3 6 4', output: '5', isSample: true },
      { input: '5\n7 6 4 3 1', output: '0', isSample: true },
      { input: '1\n100', output: '0', isSample: false },
      { input: '2\n2 4', output: '2', isSample: false },
      { input: '2\n4 2', output: '0', isSample: false },
      { input: '6\n3 2 6 5 0 3', output: '4', isSample: false },
      { input: '5\n1 2 3 4 5', output: '4', isSample: false },
    ],
  },

  // ─── 5. BINARY SEARCH (Easy) ────────────────────────────────────────────────
  {
    problemCode: 'binary-search',
    name: 'Binary Search',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array of integers \`nums\` sorted in ascending order and an integer \`target\`, write a function to search for \`target\` in \`nums\`. If \`target\` exists, return its 0-based index. Otherwise, return \`-1\`.

You must write an algorithm with $\\mathcal{O}(\\log N)$ runtime complexity.

### Input Format
- First line: Two space-separated integers \`N\` and \`target\`.
- Second line: \`N\` sorted space-separated integers.

### Output Format
- Print the 0-based index of \`target\`, or \`-1\` if not found.

### Constraints
- $1 \\le N \\le 10^5$
- $-10^9 \\le target, nums[i] \\le 10^9$
- All integers in \`nums\` are unique and strictly sorted in ascending order.
`,
    sampleCases: [
      {
        input: '6 9\n-1 0 3 5 9 12',
        output: '4',
        explanation: '9 exists in nums and its index is 4.',
      },
      {
        input: '6 2\n-1 0 3 5 9 12',
        output: '-1',
        explanation: '2 does not exist in nums so return -1.',
      },
    ],
    testCases: [
      { input: '6 9\n-1 0 3 5 9 12', output: '4', isSample: true },
      { input: '6 2\n-1 0 3 5 9 12', output: '-1', isSample: true },
      { input: '1 5\n5', output: '0', isSample: false },
      { input: '1 3\n5', output: '-1', isSample: false },
      { input: '2 10\n5 10', output: '1', isSample: false },
      { input: '5 -5\n-10 -5 0 5 10', output: '1', isSample: false },
      { input: '5 100\n1 2 3 4 5', output: '-1', isSample: false },
    ],
  },

  // ─── 6. CLIMBING STAIRS (Easy) ──────────────────────────────────────────────
  {
    problemCode: 'climbing-stairs',
    name: 'Climbing Stairs',
    difficulty: 'Easy',
    tags: ['Dynamic Programming', 'Math'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are climbing a staircase. It takes \`N\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?

### Input Format
- A single integer \`N\`.

### Output Format
- Print a single integer representing the total number of distinct ways.

### Constraints
- $1 \\le N \\le 45$
`,
    sampleCases: [
      {
        input: '2',
        output: '2',
        explanation: 'There are two ways to climb: (1+1) or (2).',
      },
      {
        input: '3',
        output: '3',
        explanation: 'There are three ways: (1+1+1), (1+2), or (2+1).',
      },
    ],
    testCases: [
      { input: '2', output: '2', isSample: true },
      { input: '3', output: '3', isSample: true },
      { input: '1', output: '1', isSample: false },
      { input: '4', output: '5', isSample: false },
      { input: '5', output: '8', isSample: false },
      { input: '10', output: '89', isSample: false },
      { input: '20', output: '10946', isSample: false },
    ],
  },

  // ─── 7. CONTAINS DUPLICATE (Easy) ───────────────────────────────────────────
  {
    problemCode: 'contains-duplicate',
    name: 'Contains Duplicate',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Set'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\` of size \`N\`, return \`true\` if any value appears at least twice in the array, and return \`false\` if every element is distinct.

### Input Format
- First line: An integer \`N\`.
- Second line: \`N\` space-separated integers.

### Output Format
- Print \`true\` if duplicate elements exist, otherwise print \`false\`.

### Constraints
- $1 \\le N \\le 10^5$
- $-10^9 \\le nums[i] \\le 10^9$
`,
    sampleCases: [
      {
        input: '4\n1 2 3 1',
        output: 'true',
        explanation: '1 appears twice.',
      },
      {
        input: '4\n1 2 3 4',
        output: 'false',
        explanation: 'All elements are distinct.',
      },
    ],
    testCases: [
      { input: '4\n1 2 3 1', output: 'true', isSample: true },
      { input: '4\n1 2 3 4', output: 'false', isSample: true },
      { input: '1\n99', output: 'false', isSample: false },
      { input: '2\n5 5', output: 'true', isSample: false },
      { input: '5\n1 1 1 1 1', output: 'true', isSample: false },
      { input: '6\n-1 -2 -3 -4 -5 -1', output: 'true', isSample: false },
    ],
  },

  // ─── 8. VALID ANAGRAM (Easy) ────────────────────────────────────────────────
  {
    problemCode: 'valid-anagram',
    name: 'Valid Anagram',
    difficulty: 'Easy',
    tags: ['String', 'Hash Map', 'Sorting'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **anagram** is a word formed by rearranging the letters of a different word, typically using all the original letters exactly once.

### Input Format
- First line: String \`s\`.
- Second line: String \`t\`.

### Output Format
- Print \`true\` if \`t\` is an anagram of \`s\`, else \`false\`.

### Constraints
- $1 \\le \\text{length of } s, t \\le 5 \\times 10^4$
- \`s\` and \`t\` consist of lowercase English letters.
`,
    sampleCases: [
      {
        input: 'anagram\nnagaram',
        output: 'true',
        explanation: 'Both strings have the exact same character frequencies.',
      },
      {
        input: 'rat\ncar',
        output: 'false',
        explanation: 'Character sets differ.',
      },
    ],
    testCases: [
      { input: 'anagram\nnagaram', output: 'true', isSample: true },
      { input: 'rat\ncar', output: 'false', isSample: true },
      { input: 'a\na', output: 'true', isSample: false },
      { input: 'a\nb', output: 'false', isSample: false },
      { input: 'ab\na', output: 'false', isSample: false },
      { input: 'listen\nsilent', output: 'true', isSample: false },
    ],
  },

  // ─── 9. SINGLE NUMBER (Easy) ────────────────────────────────────────────────
  {
    problemCode: 'single-number',
    name: 'Single Number',
    difficulty: 'Easy',
    tags: ['Array', 'Bit Manipulation'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a non-empty array of integers \`nums\`, every element appears twice except for one. Find that single one.

You must implement a solution with a linear runtime complexity $\\mathcal{O}(N)$ and use only constant extra space $\\mathcal{O}(1)$.

### Input Format
- First line: An integer \`N\`.
- Second line: \`N\` space-separated integers.

### Output Format
- Print the single unique integer.

### Constraints
- $1 \\le N \\le 3 \\times 10^4$
- $N$ is always an odd number.
- $-3 \\times 10^4 \\le nums[i] \\le 3 \\times 10^4$
- Each element in the array appears twice except for one element which appears once.
`,
    sampleCases: [
      {
        input: '3\n2 2 1',
        output: '1',
        explanation: '2 appears twice, 1 appears once.',
      },
      {
        input: '5\n4 1 2 1 2',
        output: '4',
        explanation: '1 and 2 appear twice, 4 appears once.',
      },
    ],
    testCases: [
      { input: '3\n2 2 1', output: '1', isSample: true },
      { input: '5\n4 1 2 1 2', output: '4', isSample: true },
      { input: '1\n1', output: '1', isSample: false },
      { input: '3\n-1 -1 -2', output: '-2', isSample: false },
      { input: '5\n0 1 0 1 99', output: '99', isSample: false },
    ],
  },

  // ─── 10. PALINDROME NUMBER (Easy) ───────────────────────────────────────────
  {
    problemCode: 'palindrome-number',
    name: 'Palindrome Number',
    difficulty: 'Easy',
    tags: ['Math', 'Number Theory'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer \`x\`, return \`true\` if \`x\` is a palindrome, and \`false\` otherwise.

An integer is a palindrome when it reads the same backward as forward. For example, \`121\` is a palindrome while \`123\` is not. Negative numbers are never palindromes (e.g. \`-121\` becomes \`121-\`).

### Input Format
- A single integer \`x\`.

### Output Format
- Print \`true\` if \`x\` is a palindrome, or \`false\` otherwise.

### Constraints
- $-2^{31} \\le x \\le 2^{31} - 1$
`,
    sampleCases: [
      {
        input: '121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.',
      },
      {
        input: '-121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left, it becomes 121-.',
      },
    ],
    testCases: [
      { input: '121', output: 'true', isSample: true },
      { input: '-121', output: 'false', isSample: true },
      { input: '10', output: 'false', isSample: false },
      { input: '0', output: 'true', isSample: false },
      { input: '1221', output: 'true', isSample: false },
      { input: '1234321', output: 'true', isSample: false },
    ],
  },

  // ─── 11. MERGE TWO SORTED ARRAYS (Easy) ─────────────────────────────────────
  {
    problemCode: 'merge-two-sorted-arrays',
    name: 'Merge Two Sorted Arrays',
    difficulty: 'Easy',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given two sorted integer arrays \`A\` of size \`N\` and \`B\` of size \`M\`. Merge \`A\` and \`B\` into a single sorted array and print it.

### Input Format
- First line: Two integers \`N\` and \`M\`.
- Second line: \`N\` space-separated sorted integers (array \`A\`).
- Third line: \`M\` space-separated sorted integers (array \`B\`).

### Output Format
- Print the merged sorted array of size $N + M$ separated by spaces on a single line.

### Constraints
- $0 \\le N, M \\le 10^5$
- $N + M \\ge 1$
- $-10^9 \\le A[i], B[j] \\le 10^9$
`,
    sampleCases: [
      {
        input: '3 3\n1 2 3\n2 5 6',
        output: '1 2 2 3 5 6',
        explanation: 'Merging [1, 2, 3] and [2, 5, 6] produces [1, 2, 2, 3, 5, 6].',
      },
      {
        input: '1 1\n1\n2',
        output: '1 2',
        explanation: 'Merging [1] and [2] produces [1, 2].',
      },
    ],
    testCases: [
      { input: '3 3\n1 2 3\n2 5 6', output: '1 2 2 3 5 6', isSample: true },
      { input: '1 1\n1\n2', output: '1 2', isSample: true },
      { input: '3 1\n2 4 6\n1', output: '1 2 4 6', isSample: false },
      { input: '2 2\n-5 0\n-2 3', output: '-5 -2 0 3', isSample: false },
      { input: '4 2\n1 3 5 7\n2 4', output: '1 2 3 4 5 7', isSample: false },
    ],
  },

  // ─── 12. FIZZBUZZ EXTENDED (Easy) ───────────────────────────────────────────
  {
    problemCode: 'fizz-buzz-extended',
    name: 'FizzBuzz Extended',
    difficulty: 'Easy',
    tags: ['Simulation', 'Math'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer \`N\`, print the string representation of numbers from \`1\` to \`N\` such that:
- For multiples of both 3 and 5, print \`FizzBuzz\`.
- For multiples of 3 only, print \`Fizz\`.
- For multiples of 5 only, print \`Buzz\`.
- For all other numbers, print the number itself.

### Input Format
- A single integer \`N\`.

### Output Format
- Print \`N\` lines corresponding to the rules above.

### Constraints
- $1 \\le N \\le 10^4$
`,
    sampleCases: [
      {
        input: '5',
        output: '1\n2\nFizz\n4\nBuzz',
        explanation: '3 is divisible by 3 (Fizz), 5 by 5 (Buzz).',
      },
      {
        input: '15',
        output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
        explanation: '15 is divisible by both 3 and 5, so FizzBuzz.',
      },
    ],
    testCases: [
      { input: '5', output: '1\n2\nFizz\n4\nBuzz', isSample: true },
      { input: '15', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', isSample: true },
      { input: '1', output: '1', isSample: false },
      { input: '3', output: '1\n2\nFizz', isSample: false },
      { input: '6', output: '1\n2\nFizz\n4\nBuzz\nFizz', isSample: false },
    ],
  },

  // ─── 13. MAXIMUM SUBARRAY (Medium) ──────────────────────────────────────────
  {
    problemCode: 'maximum-subarray',
    name: 'Maximum Subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\` of length \`N\`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A **subarray** is a contiguous part of an array.

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
        explanation: 'Subarray [4, -1, 2, 1] has the largest sum = 6.',
      },
      {
        input: '1\n1',
        output: '1',
        explanation: 'The subarray [1] has the largest sum = 1.',
      },
    ],
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', isSample: true },
      { input: '1\n1', output: '1', isSample: true },
      { input: '5\n5 4 -1 7 8', output: '23', isSample: false },
      { input: '3\n-3 -2 -1', output: '-1', isSample: false },
      { input: '4\n-10 -20 -30 -40', output: '-10', isSample: false },
      { input: '6\n1 2 3 4 5 6', output: '21', isSample: false },
    ],
  },

  // ─── 14. LONGEST SUBSTRING WITHOUT REPEATING CHARACTERS (Medium) ───────────
  {
    problemCode: 'longest-unique-substring',
    name: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a string \`s\`, find the length of the **longest substring** without repeating characters.

### Input Format
- A single line containing the string \`s\`.

### Output Format
- Print a single integer representing the length of the longest substring with unique characters.

### Constraints
- $0 \\le \\text{length of } s \\le 10^5$
- \`s\` consists of English letters, digits, symbols and spaces.
`,
    sampleCases: [
      {
        input: 'abcabcbb',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 'bbbbb',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
    ],
    testCases: [
      { input: 'abcabcbb', output: '3', isSample: true },
      { input: 'bbbbb', output: '1', isSample: true },
      { input: 'pwwkew', output: '3', isSample: false },
      { input: 'au', output: '2', isSample: false },
      { input: 'abcdefg', output: '7', isSample: false },
      { input: 'abba', output: '2', isSample: false },
    ],
  },

  // ─── 15. CONTAINER WITH MOST WATER (Medium) ─────────────────────────────────
  {
    problemCode: 'container-with-most-water',
    name: 'Container With Most Water',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an integer array \`height\` of length \`N\`. There are \`N\` vertical lines drawn such that the two endpoints of the $i$-th line are $(i, 0)$ and $(i, height[i])$.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

### Input Format
- First line: An integer \`N\`.
- Second line: \`N\` space-separated integers representing vertical bar heights.

### Output Format
- Print a single integer representing the maximum water volume.

### Constraints
- $2 \\le N \\le 10^5$
- $0 \\le height[i] \\le 10^4$
`,
    sampleCases: [
      {
        input: '9\n1 8 6 2 5 4 8 3 7',
        output: '49',
        explanation: 'Lines at index 1 (height 8) and index 8 (height 7) give max area min(8, 7) * (8 - 1) = 49.',
      },
      {
        input: '2\n1 1',
        output: '1',
        explanation: 'min(1, 1) * 1 = 1.',
      },
    ],
    testCases: [
      { input: '9\n1 8 6 2 5 4 8 3 7', output: '49', isSample: true },
      { input: '2\n1 1', output: '1', isSample: true },
      { input: '4\n4 3 2 1 4', output: '16', isSample: false },
      { input: '3\n1 2 1', output: '2', isSample: false },
      { input: '5\n1 2 4 3', output: '4', isSample: false },
    ],
  },

  // ─── 16. 3SUM (Medium) ──────────────────────────────────────────────────────
  {
    problemCode: 'three-sum',
    name: '3Sum',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\` of length \`N\`, return the **number of unique triplets** \`[nums[i], nums[j], nums[k]]\` such that $i \\neq j$, $i \\neq k$, and $j \\neq k$, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.

### Input Format
- First line: An integer \`N\`.
- Second line: \`N\` space-separated integers.

### Output Format
- Print the total count of unique zero-sum triplets.

### Constraints
- $3 \\le N \\le 3000$
- $-10^5 \\le nums[i] \\le 10^5$
`,
    sampleCases: [
      {
        input: '6\n-1 0 1 2 -1 -4',
        output: '2',
        explanation: 'The distinct triplets are [-1, -1, 2] and [-1, 0, 1]. Count = 2.',
      },
      {
        input: '3\n0 1 1',
        output: '0',
        explanation: 'No possible triplet sums to 0.',
      },
    ],
    testCases: [
      { input: '6\n-1 0 1 2 -1 -4', output: '2', isSample: true },
      { input: '3\n0 1 1', output: '0', isSample: true },
      { input: '3\n0 0 0', output: '1', isSample: false },
      { input: '5\n-2 0 1 1 2', output: '2', isSample: false },
      { input: '6\n-2 0 0 2 2 2', output: '1', isSample: false },
    ],
  },

  // ─── 17. COIN CHANGE (Medium) ───────────────────────────────────────────────
  {
    problemCode: 'coin-change',
    name: 'Coin Change',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Breadth-First Search'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the **fewest number of coins** that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.

### Input Format
- First line: Two integers \`N\` (number of coin types) and \`amount\`.
- Second line: \`N\` space-separated integers representing the denominations.

### Output Format
- Print a single integer representing the minimum coins required, or \`-1\` if impossible.

### Constraints
- $1 \\le N \\le 12$
- $1 \\le coins[i] \\le 2^{31} - 1$
- $0 \\le amount \\le 10^4$
`,
    sampleCases: [
      {
        input: '3 11\n1 2 5',
        output: '3',
        explanation: '11 = 5 + 5 + 1 (3 coins).',
      },
      {
        input: '1 3\n2',
        output: '-1',
        explanation: 'The amount of 3 cannot be made with only coin 2.',
      },
    ],
    testCases: [
      { input: '3 11\n1 2 5', output: '3', isSample: true },
      { input: '1 3\n2', output: '-1', isSample: true },
      { input: '1 0\n1', output: '0', isSample: false },
      { input: '4 6249\n186 419 83 408', output: '20', isSample: false },
      { input: '2 7\n2 4', output: '-1', isSample: false },
    ],
  },

  // ─── 18. LONGEST INCREASING SUBSEQUENCE (Medium) ────────────────────────────
  {
    problemCode: 'longest-increasing-subsequence',
    name: 'Longest Increasing Subsequence',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\` of length \`N\`, return the length of the longest strictly increasing subsequence.

A **subsequence** is derived by deleting zero or more elements without changing the relative order of the remaining elements.

### Input Format
- First line: An integer \`N\`.
- Second line: \`N\` space-separated integers.

### Output Format
- Print a single integer representing the length of the LIS.

### Constraints
- $1 \\le N \\le 10^5$
- $-10^4 \\le nums[i] \\le 10^4$
`,
    sampleCases: [
      {
        input: '8\n10 9 2 5 3 7 101 18',
        output: '4',
        explanation: 'The longest increasing subsequence is [2, 3, 7, 101], therefore the length is 4.',
      },
      {
        input: '6\n0 1 0 3 2 3',
        output: '4',
        explanation: 'The LIS is [0, 1, 2, 3] with length 4.',
      },
    ],
    testCases: [
      { input: '8\n10 9 2 5 3 7 101 18', output: '4', isSample: true },
      { input: '6\n0 1 0 3 2 3', output: '4', isSample: true },
      { input: '7\n7 7 7 7 7 7 7', output: '1', isSample: false },
      { input: '5\n1 3 6 7 9', output: '5', isSample: false },
      { input: '5\n5 4 3 2 1', output: '1', isSample: false },
    ],
  },

  // ─── 19. NUMBER OF ISLANDS (Medium) ─────────────────────────────────────────
  {
    problemCode: 'number-of-islands',
    name: 'Number of Islands',
    difficulty: 'Medium',
    tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an \`R x C\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the number of islands.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

### Input Format
- First line: Two integers \`R\` and \`C\`.
- Next \`R\` lines: Each line contains a string of \`C\` characters composed of \`'1'\` and \`'0'\`.

### Output Format
- Print a single integer representing the count of connected islands.

### Constraints
- $1 \\le R, C \\le 300$
- \`grid[i][j]\` is \`'0'\` or \`'1'\`.
`,
    sampleCases: [
      {
        input: '4 5\n11110\n11010\n11000\n00000',
        output: '1',
        explanation: 'All 1s form a single connected component.',
      },
      {
        input: '4 5\n11000\n11000\n00100\n00011',
        output: '3',
        explanation: 'Top-left, center, and bottom-right form 3 disjoint islands.',
      },
    ],
    testCases: [
      { input: '4 5\n11110\n11010\n11000\n00000', output: '1', isSample: true },
      { input: '4 5\n11000\n11000\n00100\n00011', output: '3', isSample: true },
      { input: '1 1\n0', output: '0', isSample: false },
      { input: '1 1\n1', output: '1', isSample: false },
      { input: '3 3\n101\n010\n101', output: '5', isSample: false },
    ],
  },

  // ─── 20. KTH LARGEST ELEMENT IN AN ARRAY (Medium) ───────────────────────────
  {
    problemCode: 'kth-largest-element',
    name: 'Kth Largest Element in an Array',
    difficulty: 'Medium',
    tags: ['Array', 'Divide and Conquer', 'Sorting', 'Heap'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\` and an integer \`k\`, return the $k$-th largest element in the array.

Note that it is the $k$-th largest element in the sorted order, not the $k$-th distinct element.

Can you solve it without sorting the entire array in $\\mathcal{O}(N \\log K)$ or $\\mathcal{O}(N)$ average time?

### Input Format
- First line: Two integers \`N\` and \`K\`.
- Second line: \`N\` space-separated integers.

### Output Format
- Print the $K$-th largest integer.

### Constraints
- $1 \\le K \\le N \\le 10^5$
- $-10^4 \\le nums[i] \\le 10^4$
`,
    sampleCases: [
      {
        input: '6 2\n3 2 1 5 6 4',
        output: '5',
        explanation: 'In sorted descending order: [6, 5, 4, 3, 2, 1]. The 2nd largest is 5.',
      },
      {
        input: '9 4\n3 2 3 1 2 4 5 5 6',
        output: '4',
        explanation: 'Descending order: [6, 5, 5, 4, 3, 3, 2, 2, 1]. The 4th largest is 4.',
      },
    ],
    testCases: [
      { input: '6 2\n3 2 1 5 6 4', output: '5', isSample: true },
      { input: '9 4\n3 2 3 1 2 4 5 5 6', output: '4', isSample: true },
      { input: '1 1\n10', output: '10', isSample: false },
      { input: '2 1\n1 2', output: '2', isSample: false },
      { input: '5 5\n10 20 30 40 50', output: '10', isSample: false },
    ],
  },

  // ─── 21. COURSE SCHEDULE (Medium) ───────────────────────────────────────────
  {
    problemCode: 'course-schedule',
    name: 'Course Schedule',
    difficulty: 'Medium',
    tags: ['Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
There are a total of \`N\` courses you have to take, labeled from \`0\` to \`N - 1\`. You are given \`M\` prerequisite pairs where \`u v\` indicates that you must take course \`v\` before you can take course \`u\`.

Return \`true\` if you can finish all courses. Otherwise, return \`false\` (i.e. if there exists a circular dependency).

### Input Format
- First line: Two integers \`N\` (courses) and \`M\` (prerequisite pairs).
- Next \`M\` lines: Two integers \`u v\` representing a directed edge $v \\to u$.

### Output Format
- Print \`true\` if all courses can be finished without circular dependencies, otherwise \`false\`.

### Constraints
- $1 \\le N \\le 2000$
- $0 \\le M \\le 5000$
- All prerequisite pairs are unique.
`,
    sampleCases: [
      {
        input: '2 1\n1 0',
        output: 'true',
        explanation: 'To take course 1 you should have finished course 0. So it is possible.',
      },
      {
        input: '2 2\n1 0\n0 1',
        output: 'false',
        explanation: 'To take course 1 you need 0, and to take 0 you need 1. Impossible cycle.',
      },
    ],
    testCases: [
      { input: '2 1\n1 0', output: 'true', isSample: true },
      { input: '2 2\n1 0\n0 1', output: 'false', isSample: true },
      { input: '3 2\n1 0\n2 1', output: 'true', isSample: false },
      { input: '4 4\n1 0\n2 1\n3 2\n1 3', output: 'false', isSample: false },
      { input: '1 0', output: 'true', isSample: false },
    ],
  },

  // ─── 22. WORD BREAK (Medium) ────────────────────────────────────────────────
  {
    problemCode: 'word-break',
    name: 'Word Break',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Dynamic Programming', 'Trie'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a string \`s\` and a dictionary of strings \`wordDict\`, return \`true\` if \`s\` can be segmented into a space-separated sequence of one or more dictionary words.

Note that the same word in the dictionary may be reused multiple times in the segmentation.

### Input Format
- First line: The string \`s\`.
- Second line: An integer \`K\` (size of dictionary).
- Third line: \`K\` space-separated dictionary words.

### Output Format
- Print \`true\` if \`s\` can be segmented into dictionary words, else \`false\`.

### Constraints
- $1 \\le \\text{length of } s \\le 300$
- $1 \\le K \\le 1000$
- $1 \\le \\text{length of each word} \\le 20$
- \`s\` and dictionary words consist of lowercase English letters.
`,
    sampleCases: [
      {
        input: 'leetcode\n2\nleet code',
        output: 'true',
        explanation: 'Return true because "leetcode" can be segmented as "leet code".',
      },
      {
        input: 'applepenapple\n2\napple pen',
        output: 'true',
        explanation: 'Segmented as "apple pen apple". Word reuse is permitted.',
      },
    ],
    testCases: [
      { input: 'leetcode\n2\nleet code', output: 'true', isSample: true },
      { input: 'applepenapple\n2\napple pen', output: 'true', isSample: true },
      { input: 'catsandog\n5\ncats dog sand and cat', output: 'false', isSample: false },
      { input: 'a\n1\na', output: 'true', isSample: false },
      { input: 'b\n1\na', output: 'false', isSample: false },
    ],
  },

  // ─── 23. TRAPPING RAIN WATER (Hard) ─────────────────────────────────────────
  {
    problemCode: 'trapping-rain-water',
    name: 'Trapping Rain Water',
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given \`N\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

### Input Format
- First line: An integer \`N\`.
- Second line: \`N\` space-separated integers representing elevations.

### Output Format
- Print a single integer representing the total volume of trapped water.

### Constraints
- $1 \\le N \\le 2 \\times 10^5$
- $0 \\le height[i] \\le 10^5$
`,
    sampleCases: [
      {
        input: '12\n0 1 0 2 1 0 1 3 2 1 2 1',
        output: '6',
        explanation: 'Elevation map traps 6 units of rain water.',
      },
      {
        input: '6\n4 2 0 3 2 5',
        output: '9',
        explanation: 'Water trapped between elevation bars sums to 9 units.',
      },
    ],
    testCases: [
      { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', output: '6', isSample: true },
      { input: '6\n4 2 0 3 2 5', output: '9', isSample: true },
      { input: '1\n5', output: '0', isSample: false },
      { input: '3\n3 0 3', output: '3', isSample: false },
      { input: '5\n5 4 3 2 1', output: '0', isSample: false },
      { input: '10\n0 2 0 3 1 0 1 3 2 1', output: '7', isSample: false },
    ],
  },

  // ─── 24. SLIDING WINDOW MAXIMUM (Hard) ──────────────────────────────────────
  {
    problemCode: 'sliding-window-maximum',
    name: 'Sliding Window Maximum',
    difficulty: 'Hard',
    tags: ['Array', 'Queue', 'Sliding Window', 'Monotonic Queue'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an array of integers \`nums\` of size \`N\`, there is a sliding window of size \`K\` which is moving from the very left of the array to the very right. You can only see the \`K\` numbers in the window. Each time the sliding window moves right by one position.

Return the max sliding window values in $\\mathcal{O}(N)$ time.

### Input Format
- First line: Two integers \`N\` and \`K\`.
- Second line: \`N\` space-separated integers.

### Output Format
- Print the maximums for each window position separated by spaces on a single line.

### Constraints
- $1 \\le K \\le N \\le 10^5$
- $-10^4 \\le nums[i] \\le 10^4$
`,
    sampleCases: [
      {
        input: '8 3\n1 3 -1 -3 5 3 6 7',
        output: '3 3 5 5 6 7',
        explanation: 'Max of [1, 3, -1] is 3; max of [3, -1, -3] is 3; max of [-1, -3, 5] is 5, etc.',
      },
      {
        input: '1 1\n1',
        output: '1',
        explanation: 'Window size 1 over 1 element returns [1].',
      },
    ],
    testCases: [
      { input: '8 3\n1 3 -1 -3 5 3 6 7', output: '3 3 5 5 6 7', isSample: true },
      { input: '1 1\n1', output: '1', isSample: true },
      { input: '4 2\n9 11 8 5', output: '11 11 8', isSample: false },
      { input: '5 3\n5 4 3 2 1', output: '5 4 3', isSample: false },
      { input: '4 4\n1 2 3 4', output: '4', isSample: false },
    ],
  },

  // ─── 25. MEDIAN OF TWO SORTED ARRAYS (Hard) ─────────────────────────────────
  {
    problemCode: 'median-of-two-sorted-arrays',
    name: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given two sorted arrays \`nums1\` of size \`N\` and \`nums2\` of size \`M\`, return the **median** of the two sorted arrays.

The overall run time complexity should be $\\mathcal{O}(\\log(N + M))$. Format the output to 1 decimal place.

### Input Format
- First line: Two integers \`N\` and \`M\`.
- Second line: \`N\` sorted space-separated integers.
- Third line: \`M\` sorted space-separated integers.

### Output Format
- Print the median formatted to 1 decimal place (e.g. \`2.0\` or \`2.5\`).

### Constraints
- $0 \\le N, M \\le 10^5$
- $1 \\le N + M \\le 2 \\times 10^5$
- $-10^6 \\le nums1[i], nums2[j] \\le 10^6$
`,
    sampleCases: [
      {
        input: '2 1\n1 3\n2',
        output: '2.0',
        explanation: 'Merged array = [1, 2, 3] and median is 2.0.',
      },
      {
        input: '2 2\n1 2\n3 4',
        output: '2.5',
        explanation: 'Merged array = [1, 2, 3, 4] and median is (2 + 3) / 2 = 2.5.',
      },
    ],
    testCases: [
      { input: '2 1\n1 3\n2', output: '2.0', isSample: true },
      { input: '2 2\n1 2\n3 4', output: '2.5', isSample: true },
      { input: '1 0\n1\n', output: '1.0', isSample: false },
      { input: '0 1\n\n2', output: '2.0', isSample: false },
      { input: '2 4\n1 5\n2 3 4 6', output: '3.5', isSample: false },
    ],
  },

  // ─── 26. EDIT DISTANCE (Hard) ───────────────────────────────────────────────
  {
    problemCode: 'edit-distance',
    name: 'Edit Distance',
    difficulty: 'Hard',
    tags: ['String', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given two strings \`word1\` and \`word2\`, return the **minimum number of operations** required to convert \`word1\` to \`word2\`.

You have the following three operations permitted on a word:
- Insert a character
- Delete a character
- Replace a character

### Input Format
- First line: String \`word1\`.
- Second line: String \`word2\`.

### Output Format
- Print a single integer representing the Levenshtein edit distance.

### Constraints
- $0 \\le \\text{length of } word1, word2 \\le 500$
- Strings consist of lowercase English letters.
`,
    sampleCases: [
      {
        input: 'horse\nros',
        output: '3',
        explanation: 'horse -> rorse (replace h with r) -> rose (remove r) -> ros (remove e).',
      },
      {
        input: 'intention\nexecution',
        output: '5',
        explanation: 'intention -> inention -> enention -> exention -> exection -> execution.',
      },
    ],
    testCases: [
      { input: 'horse\nros', output: '3', isSample: true },
      { input: 'intention\nexecution', output: '5', isSample: true },
      { input: 'a\nb', output: '1', isSample: false },
      { input: 'abc\nabc', output: '0', isSample: false },
      { input: 'zoologico\nzoologico', output: '0', isSample: false },
    ],
  },

  // ─── 27. MERGE K SORTED ARRAYS (Hard) ───────────────────────────────────────
  {
    problemCode: 'merge-k-sorted-arrays',
    name: 'Merge K Sorted Arrays',
    difficulty: 'Hard',
    tags: ['Heap', 'Priority Queue', 'Divide and Conquer'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given \`K\` sorted arrays of integers of various lengths. Merge all \`K\` sorted arrays into one sorted array and print it.

Aim for $\\mathcal{O}(N \\log K)$ time complexity where $N$ is the total count of elements across all arrays.

### Input Format
- First line: An integer \`K\`.
- Next \`K\` lines: The first integer is \`L_i\` (length of the $i$-th array), followed by \`L_i\` space-separated sorted integers.

### Output Format
- Print the combined sorted array separated by spaces on a single line.

### Constraints
- $1 \\le K \\le 1000$
- $0 \\le L_i \\le 1000$
- Total elements $N \\le 10^5$
- $-10^9 \\le \\text{element} \\le 10^9$
`,
    sampleCases: [
      {
        input: '3\n3 1 4 5\n3 1 3 4\n2 2 6',
        output: '1 1 2 3 4 4 5 6',
        explanation: 'Arrays [1, 4, 5], [1, 3, 4], and [2, 6] are merged in ascending order.',
      },
      {
        input: '2\n2 10 20\n2 5 15',
        output: '5 10 15 20',
        explanation: 'Arrays [10, 20] and [5, 15] merged.',
      },
    ],
    testCases: [
      { input: '3\n3 1 4 5\n3 1 3 4\n2 2 6', output: '1 1 2 3 4 4 5 6', isSample: true },
      { input: '2\n2 10 20\n2 5 15', output: '5 10 15 20', isSample: true },
      { input: '1\n3 1 2 3', output: '1 2 3', isSample: false },
      { input: '3\n1 5\n1 3\n1 1', output: '1 3 5', isSample: false },
      { input: '2\n3 -5 0 5\n2 -10 10', output: '-10 -5 0 5 10', isSample: false },
    ],
  },

  // ─── 28. LONGEST CONSECUTIVE SEQUENCE (Hard) ────────────────────────────────
  {
    problemCode: 'longest-consecutive-sequence',
    name: 'Longest Consecutive Sequence',
    difficulty: 'Hard',
    tags: ['Array', 'Hash Table', 'Union Find'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an unsorted array of integers \`nums\` of length \`N\`, return the length of the longest consecutive elements sequence.

You must write an algorithm that runs in $\\mathcal{O}(N)$ time.

### Input Format
- First line: An integer \`N\`.
- Second line: \`N\` space-separated integers.

### Output Format
- Print a single integer representing the length of the longest consecutive sequence.

### Constraints
- $0 \\le N \\le 10^5$
- $-10^9 \\le nums[i] \\le 10^9$
`,
    sampleCases: [
      {
        input: '6\n100 4 200 1 3 2',
        output: '4',
        explanation: 'The longest consecutive elements sequence is [1, 2, 3, 4]. Its length is 4.',
      },
      {
        input: '10\n0 3 7 2 5 8 4 6 0 1',
        output: '9',
        explanation: 'The sequence is [0, 1, 2, 3, 4, 5, 6, 7, 8]. Length is 9.',
      },
    ],
    testCases: [
      { input: '6\n100 4 200 1 3 2', output: '4', isSample: true },
      { input: '10\n0 3 7 2 5 8 4 6 0 1', output: '9', isSample: true },
      { input: '0', output: '0', isSample: false },
      { input: '1\n42', output: '1', isSample: false },
      { input: '5\n1 2 0 1 2', output: '3', isSample: false },
    ],
  },

  // ─── 29. WORD LADDER (Hard) ─────────────────────────────────────────────────
  {
    problemCode: 'word-ladder',
    name: 'Word Ladder',
    difficulty: 'Hard',
    tags: ['Hash Table', 'String', 'Breadth-First Search'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
A **transformation sequence** from word \`beginWord\` to word \`endWord\` using a dictionary \`wordList\` is a sequence of words \`beginWord -> s_1 -> s_2 -> ... -> s_k\` such that:
- Every adjacent pair of words differs by exactly one letter.
- Every \`s_i\` for $1 \\le i \\le k$ is in \`wordList\`. Note that \`beginWord\` does not need to be in \`wordList\`.
- \`s_k == endWord\`.

Given two words, \`beginWord\` and \`endWord\`, and a dictionary \`wordList\`, return the **number of words** in the shortest transformation sequence from \`beginWord\` to \`endWord\`, or \`0\` if no such sequence exists.

### Input Format
- First line: Two words \`beginWord\` and \`endWord\`.
- Second line: An integer \`N\` (dictionary size).
- Next \`N\` lines: Words in the dictionary.

### Output Format
- Print a single integer representing the shortest transformation sequence length, or \`0\`.

### Constraints
- $1 \\le \\text{length of words} \\le 10$
- $1 \\le N \\le 5000$
- All words consist of lowercase English letters and have the same length.
`,
    sampleCases: [
      {
        input: 'hit cog\n6\nhot\ndot\ndog\nlot\nlog\ncog',
        output: '5',
        explanation: 'One shortest transformation sequence is hit -> hot -> dot -> dog -> cog (5 words).',
      },
      {
        input: 'hit cog\n5\nhot\ndot\ndog\nlot\nlog',
        output: '0',
        explanation: 'The endWord "cog" is not in wordList, therefore there is no valid transformation sequence.',
      },
    ],
    testCases: [
      { input: 'hit cog\n6\nhot\ndot\ndog\nlot\nlog\ncog', output: '5', isSample: true },
      { input: 'hit cog\n5\nhot\ndot\ndog\nlot\nlog', output: '0', isSample: true },
      { input: 'a c\n3\na\nb\nc', output: '2', isSample: false },
      { input: 'hot dog\n3\nhot\ndog\ndot', output: '3', isSample: false },
    ],
  },

  // ─── 30. N-QUEENS (Hard) ───────────────────────────────────────────────────
  {
    problemCode: 'n-queens',
    name: 'N-Queens Solutions',
    difficulty: 'Hard',
    tags: ['Backtracking', 'Bit Manipulation'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
The **n-queens** puzzle is the problem of placing \`N\` queens on an \`N x N\` chessboard such that no two queens attack each other.

Given an integer \`N\`, return the **total number of distinct solutions** to the n-queens puzzle.

### Input Format
- A single integer \`N\`.

### Output Format
- Print a single integer representing the total number of distinct valid placements.

### Constraints
- $1 \\le N \\le 12$
`,
    sampleCases: [
      {
        input: '4',
        output: '2',
        explanation: 'There are 2 distinct solutions to the 4-queens puzzle.',
      },
      {
        input: '1',
        output: '1',
        explanation: 'Only 1 valid placement for a 1x1 board.',
      },
    ],
    testCases: [
      { input: '4', output: '2', isSample: true },
      { input: '1', output: '1', isSample: true },
      { input: '2', output: '0', isSample: false },
      { input: '3', output: '0', isSample: false },
      { input: '5', output: '10', isSample: false },
      { input: '6', output: '4', isSample: false },
      { input: '8', output: '92', isSample: false },
    ],
  },
];

export async function seedDatabase(): Promise<void> {
  // Production guard (Issue H-1 & L-3)
  if (env.isProduction || process.env.NODE_ENV === 'production') {
    console.error('[Seeder] ❌ Refusing to run destructive database seeder in PRODUCTION mode!');
    process.exit(1);
  }

  try {
    console.log('[Seeder] Connecting to MongoDB at:', env.MONGO_URI);
    await mongoose.connect(env.MONGO_URI);

    console.log('[Seeder] Clearing existing Problems and TestCases in dev database...');
    await Problem.deleteMany({});
    await TestCase.deleteMany({});

    console.log(`[Seeder] Seeding ${SEED_PROBLEMS.length} problems with test cases...`);

    let totalTestCases = 0;
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
      totalTestCases += testCaseDocs.length;
      console.log(`  ✔ Seeded: [${createdProblem.difficulty}] ${createdProblem.name} (${testCaseDocs.length} test cases)`);
    }

    // Seed/update default Admin user with configurable password (Issue H-1)
    const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@anti-oj.com';
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'DevAdmin@2026!';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        fullName: 'Judge Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(`  ✔ Created Admin User: ${adminEmail} (Configured via ADMIN_SEED_PASSWORD)`);
    } else if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log(`  ✔ Promoted existing user to Admin: ${adminEmail}`);
    }

    console.log(`[Seeder] ✅ Database seeding completed successfully! Seeded ${SEED_PROBLEMS.length} problems with ${totalTestCases} test cases.`);
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
