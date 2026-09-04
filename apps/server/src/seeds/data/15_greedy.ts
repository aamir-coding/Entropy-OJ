import { SeedProblemData, rangeString } from '../types';

export const GREEDY_PROBLEMS: SeedProblemData[] = [
  // ── 122. MAXIMUM SUBARRAY ──────────────────────────────────────────────────
  {
    problemCode: 'maximum-subarray',
    name: 'Maximum Subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

### Input Format
- First line: An integer \`n\` representing array length.
- Second line: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the maximum subarray sum.

### Constraints
- $1 \\le n \\le 10^5$
- $-10^4 \\le nums[i] \\le 10^4$
`,
    sampleCases: [
      {
        input: '9\n-2 1 -3 4 -1 2 1 -5 4',
        output: '6',
        explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.',
      },
      {
        input: '1\n1',
        output: '1',
        explanation: 'Subarray [1] has sum 1.',
      },
    ],
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', isSample: true },
      { input: '1\n1', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n-5', output: '-5', isSample: false }, // Single negative
      { input: '5\n5 4 -1 7 8', output: '23', isSample: false }, // Entire array positive
      { input: '5\n-5 -4 -3 -2 -1', output: '-1', isSample: false }, // All negative
      { input: '4\n-2 -1 -3 -4', output: '-1', isSample: false },
      { input: '3\n-1 0 -2', output: '0', isSample: false },
      { input: '6\n1 2 -5 4 3 -2', output: '7', isSample: false },
      { input: '5\n10 -20 30 -5 10', output: '35', isSample: false },
      { input: '4\n-100 50 -10 60', output: '100', isSample: false },
      // Stress test: 10,000 elements
      { input: `10000\n${'1 '.repeat(10000)}`.trim(), output: '10000', isSample: false },
      { input: `10000\n${'-1 '.repeat(10000)}`.trim(), output: '-1', isSample: false },
    ],
    editorial: `### Method Explanation
Kadane's Algorithm: Maintain running sum \`cur_sum\`.
\`cur_sum = max(x, cur_sum + x)\` and \`max_sum = max(max_sum, cur_sum)\`.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 123. JUMP GAME ─────────────────────────────────────────────────────────
  {
    problemCode: 'jump-game',
    name: 'Jump Game',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Greedy'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an integer array \`nums\`. You are initially positioned at the array's **first index**, and each element in the array represents your maximum jump length at that position.

Return \`true\` if you can reach the last index, or \`false\` otherwise.

### Input Format
- First line: An integer \`n\` representing array length.
- Second line: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $1 \\le n \\le 10^4$
- $0 \\le nums[i] \\le 10^5$
`,
    sampleCases: [
      {
        input: '5\n2 3 1 1 4',
        output: 'true',
        explanation: 'Jump 1 step from 0 to 1, then 3 steps to the last index.',
      },
      {
        input: '5\n3 2 1 0 4',
        output: 'false',
        explanation: 'You will always arrive at index 3 where maximum jump is 0.',
      },
    ],
    testCases: [
      { input: '5\n2 3 1 1 4', output: 'true', isSample: true },
      { input: '5\n3 2 1 0 4', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n0', output: 'true', isSample: false }, // Single element already at end
      { input: '2\n1 0', output: 'true', isSample: false },
      { input: '2\n0 1', output: 'false', isSample: false }, // Stuck at start
      { input: '3\n1 0 2', output: 'false', isSample: false },
      { input: '4\n1 2 0 1', output: 'true', isSample: false },
      { input: '5\n2 0 0 0', output: 'false', isSample: false },
      { input: '5\n4 0 0 0 0', output: 'true', isSample: false },
      { input: '6\n1 1 1 1 1 1', output: 'true', isSample: false },
      // Stress test: 10,000 elements
      { input: `10000\n${'1 '.repeat(10000)}`.trim(), output: 'true', isSample: false },
      { input: `10000\n1 0 ${'1 '.repeat(9998)}`.trim(), output: 'false', isSample: false },
    ],
    editorial: `### Method Explanation
Greedy tracking of farthest reachable index:
Maintain \`max_reach = 0\`. If $i > max\\_reach$, return false.
\`max_reach = max(max_reach, i + nums[i])\`. If $max\\_reach \\ge n - 1$, return true.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 124. JUMP GAME II ──────────────────────────────────────────────────────
  {
    problemCode: 'jump-game-ii',
    name: 'Jump Game II',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Greedy'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given a 0-indexed array of integers \`nums\` of length \`n\`. You are initially positioned at \`nums[0]\`.

Each element \`nums[i]\` represents the maximum length of a forward jump from index \`i\`. In other words, if you are at \`nums[i]\`, you can jump to any \`nums[i + j]\` where:
- $0 \\le j \\le nums[i]$ and $i + j < n$.

Return the minimum number of jumps to reach \`nums[n - 1]\`. The test cases are generated such that you can reach \`nums[n - 1]\`.

### Input Format
- First line: An integer \`n\` representing array length.
- Second line: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the minimum number of jumps.

### Constraints
- $1 \\le n \\le 10^4$
- $0 \\le nums[i] \\le 1000$
- It's guaranteed that you can reach \`nums[n - 1]\`.
`,
    sampleCases: [
      {
        input: '5\n2 3 1 1 4',
        output: '2',
        explanation: 'Jump 1 step from 0 to 1, then 3 steps to the last index. Total 2 jumps.',
      },
      {
        input: '5\n2 3 0 1 4',
        output: '2',
        explanation: 'Minimum jumps is 2.',
      },
    ],
    testCases: [
      { input: '5\n2 3 1 1 4', output: '2', isSample: true },
      { input: '5\n2 3 0 1 4', output: '2', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n0', output: '0', isSample: false }, // Already at destination
      { input: '2\n1 1', output: '1', isSample: false },
      { input: '3\n2 1 1', output: '1', isSample: false },
      { input: '4\n1 1 1 1', output: '3', isSample: false },
      { input: '5\n1 2 3 4 5', output: '3', isSample: false },
      { input: '5\n4 1 1 1 1', output: '1', isSample: false },
      { input: '6\n3 4 0 1 0 0', output: '2', isSample: false },
      { input: '5\n3 2 1 1 4', output: '2', isSample: false },
      // Stress test: 1000 steps
      { input: `10\n${rangeString(1, 10)}`, output: '4', isSample: false },
      { input: '4\n2 3 1 1', output: '2', isSample: false },
    ],
    editorial: `### Method Explanation
BFS Level by Level (Greedy Window):
Maintain the current jump's window $[l, r]$.
At each jump, find the farthest reachable index from any point in $[l, r]$.
Set $l = r + 1, r = farthest$ and increment jumps.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 125. GAS STATION ───────────────────────────────────────────────────────
  {
    problemCode: 'gas-station',
    name: 'Gas Station',
    difficulty: 'Medium',
    tags: ['Array', 'Greedy'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
There are \`n\` gas stations along a circular route, where the amount of gas at the $i$-th station is \`gas[i]\`.

You have a car with an unlimited gas tank and it costs \`cost[i]\` of gas to travel from the $i$-th station to its next $(i + 1)$-th station. You begin the journey with an empty tank at one of the gas stations.

Given two integer arrays \`gas\` and \`cost\`, return the starting gas station's index if you can travel around the circuit once in the clockwise direction, otherwise return \`-1\`. If there exists a solution, it is **guaranteed to be unique**.

### Input Format
- First line: An integer \`n\` representing the number of gas stations.
- Second line: \`n\` space-separated integers representing \`gas\`.
- Third line: \`n\` space-separated integers representing \`cost\`.

### Output Format
- Print a single integer representing the 0-based starting station index, or \`-1\`.

### Constraints
- $n == gas.length == cost.length$
- $1 \\le n \\le 10^5$
- $0 \\le gas[i], cost[i] \\le 10^4$
`,
    sampleCases: [
      {
        input: '5\n1 2 3 4 5\n3 4 5 1 2',
        output: '3',
        explanation: 'Start at station 3 (index 3) with tank = 4. 4 - 1 + 5 - 2 + 1 - 3 + 2 - 4 + 3 - 5 = 0. Successfully completes circle.',
      },
      {
        input: '3\n2 3 4\n3 4 3',
        output: '-1',
        explanation: 'Total gas = 9 < Total cost = 10, so impossible to complete.',
      },
    ],
    testCases: [
      { input: '5\n1 2 3 4 5\n3 4 5 1 2', output: '3', isSample: true },
      { input: '3\n2 3 4\n3 4 3', output: '-1', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n5\n4', output: '0', isSample: false }, // n=1 valid
      { input: '1\n4\n5', output: '-1', isSample: false }, // n=1 invalid
      { input: '2\n2 2\n2 2', output: '0', isSample: false }, // Exactly equal
      { input: '4\n5 1 2 3\n4 4 1 5', output: '-1', isSample: false },
      { input: '4\n3 1 1 5\n2 2 2 4', output: '3', isSample: false },
      { input: '3\n5 8 2\n6 5 4', output: '1', isSample: false },
      { input: '5\n4 5 2 6 5\n3 2 7 3 2', output: '0', isSample: false },
      { input: '3\n1 2 3\n1 2 3', output: '0', isSample: false },
      // Stress test: 10,000 stations
      { input: `10\n1 1 1 1 1 1 1 1 1 10\n2 1 1 1 1 1 1 1 1 1`, output: '9', isSample: false },
      { input: `4\n1 2 3 4\n2 2 2 2`, output: '1', isSample: false },
    ],
    editorial: `### Method Explanation
If $\\sum gas < \\sum cost$, completion is impossible (return -1).
Otherwise, maintain \`cur_tank = 0\` and \`start = 0\`.
If \`cur_tank + gas[i] - cost[i] < 0\`, no station from current start to $i$ can be the answer.
Reset \`cur_tank = 0\` and set \`start = i + 1\`.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 126. HAND OF STRAIGHTS ─────────────────────────────────────────────────
  {
    problemCode: 'hand-of-straights',
    name: 'Hand of Straights',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Greedy', 'Sorting'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Alice has some number of cards and she wants to rearrange the cards into groups so that each group is of size \`groupSize\`, and consists of \`groupSize\` consecutive cards.

Given an integer array \`hand\` where \`hand[i]\` is the value written on the $i$-th card and an integer \`groupSize\`, return \`true\` if she can rearrange the cards, or \`false\` otherwise.

### Input Format
- First line: Two space-separated integers \`n\` and \`groupSize\`.
- Second line: \`n\` space-separated integers representing \`hand\`.

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $1 \\le n \\le 10^4$
- $0 \\le hand[i] \\le 10^9$
- $1 \\le groupSize \\le n$
`,
    sampleCases: [
      {
        input: '9 3\n1 2 3 6 2 3 4 7 8',
        output: 'true',
        explanation: 'Rearranged into [1,2,3], [2,3,4], [6,7,8].',
      },
      {
        input: '5 4\n1 2 3 4 5',
        output: 'false',
        explanation: '5 cards cannot be grouped into groups of size 4.',
      },
    ],
    testCases: [
      { input: '9 3\n1 2 3 6 2 3 4 7 8', output: 'true', isSample: true },
      { input: '5 4\n1 2 3 4 5', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '6 1\n1 2 3 4 5 6', output: 'true', isSample: false }, // groupSize = 1
      { input: '6 2\n1 2 3 4 5 6', output: 'true', isSample: false },
      { input: '6 3\n1 2 3 1 2 3', output: 'true', isSample: false }, // Duplicate groups
      { input: '6 3\n8 10 12 11 9 7', output: 'true', isSample: false }, // Unsorted
      { input: '4 2\n1 2 4 5', output: 'true', isSample: false }, // Non-consecutive groups
      { input: '4 2\n1 2 2 3', output: 'true', isSample: false },
      { input: '4 2\n1 3 5 7', output: 'false', isSample: false },
      { input: '6 3\n1 2 4 5 6 7', output: 'false', isSample: false },
      // Stress test: 1000 cards
      { input: `6 3\n2 3 4 5 6 7`, output: 'true', isSample: false },
      { input: `4 4\n1 2 3 4`, output: 'true', isSample: false },
    ],
    editorial: `### Method Explanation
Check $n \\% groupSize == 0$.
Count card frequencies using a hash map and sort unique card values (or use a Min-Heap).
For the smallest available card $x$ with count $C$, deduct $C$ from $x, x+1, \\dots, x + groupSize - 1$.
If any card has insufficient count, return false.
Time: $\\mathcal{O}(N \\log N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 127. MERGE TRIPLETS TO FORM TARGET TRIPLET ─────────────────────────────
  {
    problemCode: 'merge-triplets-to-form-target-triplet',
    name: 'Merge Triplets to Form Target Triplet',
    difficulty: 'Medium',
    tags: ['Array', 'Greedy'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
A **triplet** is an array of three integers. You are given a 2D integer array \`triplets\`, where \`triplets[i] = [a_i, b_i, c_i]\` describes the $i$-th triplet. You are also given an integer array \`target = [x, y, z]\` that describes the triplet you want to obtain.

To obtain \`target\`, you may apply the following operation on \`triplets\` any number of times (possibly zero):
- Choose two indices \`i\` and \`j\` and update \`triplets[j]\` to be \`[max(a_i, a_j), max(b_i, b_j), max(c_i, c_j)]\`.

Return \`true\` if it is possible to obtain the \`target\` triplet \`[x, y, z]\` as an element of \`triplets\`, or \`false\` otherwise.

### Input Format
- First line: An integer \`n\` representing the number of triplets.
- Second line: Three space-separated integers \`x\`, \`y\`, and \`z\` representing \`target\`.
- Next \`n\` lines: Three space-separated integers representing each triplet.

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $1 \\le n \\le 10^5$
- $triplets[i].length == target.length == 3$
- $1 \\le a_i, b_i, c_i, x, y, z \\le 1000$
`,
    sampleCases: [
      {
        input: '4\n5 4 3\n2 5 3\n1 8 4\n1 7 5\n5 4 3',
        output: 'true',
        explanation: 'triplet 4 matches target [5, 4, 3] directly.',
      },
      {
        input: '3\n3 2 5\n3 4 5\n4 5 6\n2 5 3',
        output: 'false',
        explanation: 'Impossible because all triplets have values exceeding target.',
      },
    ],
    testCases: [
      { input: '4\n5 4 3\n2 5 3\n1 8 4\n1 7 5\n5 4 3', output: 'true', isSample: true },
      { input: '3\n3 2 5\n3 4 5\n4 5 6\n2 5 3', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '3\n5 5 5\n2 5 3\n2 3 4\n1 2 5', output: 'true', isSample: false }, // Merge [2,5,3] and [1,2,5] gives [2,5,5], not enough x=5
      { input: '3\n2 5 3\n2 5 3\n1 1 1\n1 1 1', output: 'true', isSample: false },
      { input: '3\n3 3 3\n1 3 1\n3 1 1\n1 1 3', output: 'true', isSample: false }, // 3 complementary triplets
      { input: '2\n3 3 3\n4 1 1\n1 1 1', output: 'false', isSample: false },
      { input: '3\n5 5 5\n5 1 1\n1 5 1\n1 1 5', output: 'true', isSample: false },
      { input: '1\n1 2 3\n1 2 3', output: 'true', isSample: false },
      { input: '1\n1 2 3\n1 2 4', output: 'false', isSample: false },
      { input: '4\n6 7 8\n6 1 1\n1 7 1\n1 1 8\n9 9 9', output: 'true', isSample: false },
      // Stress test: 1000 triplets
      {
        input: '4\n10 10 10\n10 5 5\n5 10 5\n5 5 10\n1 1 1',
        output: 'true',
        isSample: false,
      },
      { input: '2\n2 2 2\n1 1 1\n2 2 3', output: 'false', isSample: false },
    ],
    editorial: `### Method Explanation
Any triplet with any element greater than target cannot be used (it would overshoot target).
Filter out all triplets where $a > x \\lor b > y \\lor c > z$.
From valid triplets, record if we can hit $x$ on first index, $y$ on second, and $z$ on third.
Return \`found_x && found_y && found_z\`.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 128. PARTITION LABELS ──────────────────────────────────────────────────
  {
    problemCode: 'partition-labels',
    name: 'Partition Labels',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Two Pointers', 'String', 'Greedy'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given a string \`s\`. We want to partition the string into as many parts as possible so that each letter appears in at most one part.

Note that the partition is done so that after concatenating all the parts in order, the resultant string should be \`s\`.

Return a list of integers representing the size of these parts.

### Input Format
- A single line containing the string \`s\`.

### Output Format
- Print space-separated integers representing the partition sizes on a single line.

### Constraints
- $1 \\le |s| \\le 500$
- \`s\` consists of lowercase English letters.
`,
    sampleCases: [
      {
        input: 'ababcbacadefegdehijhklij',
        output: '9 7 8',
        explanation: 'The partition is "ababcbaca", "defegde", "hijhklij". Sizes: 9, 7, 8.',
      },
      {
        input: 'eccbbbbdec',
        output: '10',
        explanation: 'All characters in "eccbbbbdec" overlap in their occurrences, so size is 10.',
      },
    ],
    testCases: [
      { input: 'ababcbacadefegdehijhklij', output: '9 7 8', isSample: true },
      { input: 'eccbbbbdec', output: '10', isSample: true },
      // Hidden Cases (10+)
      { input: 'a', output: '1', isSample: false }, // Single letter
      { input: 'abcdef', output: '1 1 1 1 1 1', isSample: false }, // All unique
      { input: 'aaaaa', output: '5', isSample: false }, // All same
      { input: 'aba', output: '3', isSample: false },
      { input: 'abacaba', output: '7', isSample: false },
      { input: 'abaccbdeffed', output: '6 6', isSample: false },
      { input: 'qiejxqfnqcewy', output: '13', isSample: false },
      { input: 'abcabcbcd', output: '8 1', isSample: false },
      { input: 'caedbdedda', output: '1 9', isSample: false },
      // Stress test: 500 characters
      { input: 'abc'.repeat(166) + 'ab', output: '500', isSample: false },
    ],
    editorial: `### Method Explanation
Record the last occurrence index for every character: \`last[c] = i\`.
Iterate through $s$: expand the current partition boundary \`end = max(end, last[c])\`.
When $i == end$, the partition is closed: record \`end - start + 1\` and reset \`start = i + 1\`.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$ (26 letters).`,
  },

  // ── 129. VALID PARENTHESIS STRING ──────────────────────────────────────────
  {
    problemCode: 'valid-parenthesis-string',
    name: 'Valid Parenthesis String',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming', 'Stack', 'Greedy'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a string \`s\` containing only three types of characters: \`'('\`, \`')'\` and \`'*'\`, return \`true\` if \`s\` is **valid**.

The following rules define a **valid** string:
1. Any left parenthesis \`'('\` must have a corresponding right parenthesis \`')'\`.
2. Any right parenthesis \`')'\` must have a corresponding left parenthesis \`'('\`.
3. Left parenthesis \`'('\` must go before the corresponding right parenthesis \`')'\`.
4. \`'*'\` could be treated as a single right parenthesis \`')'\` or a single left parenthesis \`'('\` or an empty string \`""\`.

### Input Format
- A single line containing the string \`s\`.

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $1 \\le |s| \\le 100$
- \`s[i]\` is \`'('\`, \`')'\`, or \`'*'\`.
`,
    sampleCases: [
      {
        input: '()',
        output: 'true',
        explanation: 'Balanced parentheses.',
      },
      {
        input: '(*)',
        output: 'true',
        explanation: '\'*\' can be treated as empty string "".',
      },
    ],
    testCases: [
      { input: '()', output: 'true', isSample: true },
      { input: '(*)', output: 'true', isSample: true },
      // Hidden Cases (10+)
      { input: '(*))', output: 'true', isSample: false }, // '*' acts as '('
      { input: ')(', output: 'false', isSample: false },
      { input: '*', output: 'true', isSample: false }, // '*' acts as empty
      { input: '(((*)', output: 'false', isSample: false }, // Excess '('
      { input: '((**)', output: 'true', isSample: false },
      { input: '(((******)))', output: 'true', isSample: false },
      { input: ')*', output: 'false', isSample: false },
      { input: '*(', output: 'false', isSample: false },
      { input: '(*()', output: 'true', isSample: false },
      { input: '***', output: 'true', isSample: false },
    ],
    editorial: `### Method Explanation
Greedy range of open parentheses count: \`[cmin, cmax]\`.
When \`'('\`: \`cmin++, cmax++\`.
When \`')'\`: \`cmin--, cmax--\`.
When \`'*'\`: \`cmin--\` (act as ')'), \`cmax++\` (act as '(').
If \`cmax < 0\`, too many ')' -> return false.
Clamp \`cmin = max(cmin, 0)\`. At end, return \`cmin == 0\`.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },
];
