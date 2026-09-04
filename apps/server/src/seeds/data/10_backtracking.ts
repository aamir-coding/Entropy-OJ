import { SeedProblemData } from '../types';

export const BACKTRACKING_PROBLEMS: SeedProblemData[] = [
  // ── 71. SUBSETS ────────────────────────────────────────────────────────────
  {
    problemCode: 'subsets',
    name: 'Subsets',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking', 'Bit Manipulation'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\` of **unique** elements, return all possible subsets (the power set).

The solution set **must not** contain duplicate subsets.

For deterministic output:
- Each subset should have its elements sorted in ascending order.
- The list of subsets should be sorted in lexicographical order. Empty subset is printed as an empty line.

### Input Format
- First line: An integer \`N\` representing the number of elements.
- Second line: \`N\` space-separated unique integers representing \`nums\`.

### Output Format
- Print each subset on a new line with space-separated integers. (Empty subset printed as an empty line).

### Constraints
- $1 \\le N \\le 10$
- $-10 \\le nums[i] \\le 10$
- All numbers of \`nums\` are **unique**.
`,
    sampleCases: [
      {
        input: '3\n1 2 3',
        output: '\n1\n1 2\n1 2 3\n1 3\n2\n2 3\n3',
        explanation: 'All 8 subsets of [1, 2, 3] sorted lexicographically.',
      },
      {
        input: '1\n0',
        output: '\n0',
        explanation: 'Subsets of [0] are [] and [0].',
      },
    ],
    testCases: [
      { input: '3\n1 2 3', output: '\n1\n1 2\n1 2 3\n1 3\n2\n2 3\n3', isSample: true },
      { input: '1\n0', output: '\n0', isSample: true },
      // Hidden Cases (10+)
      { input: '2\n1 2', output: '\n1\n1 2\n2', isSample: false },
      { input: '2\n-1 1', output: '\n-1\n-1 1\n1', isSample: false },
      { input: '3\n3 2 1', output: '\n1\n1 2\n1 2 3\n1 3\n2\n2 3\n3', isSample: false }, // Unsorted input
      { input: '1\n5', output: '\n5', isSample: false },
      { input: '2\n0 10', output: '\n0\n0 10\n10', isSample: false },
      { input: '3\n-3 0 3', output: '\n-3\n-3 0\n-3 0 3\n-3 3\n0\n0 3\n3', isSample: false },
      { input: '4\n1 2 3 4', output: '\n1\n1 2\n1 2 3\n1 2 3 4\n1 2 4\n1 3\n1 3 4\n1 4\n2\n2 3\n2 3 4\n2 4\n3\n3 4\n4', isSample: false },
      { input: '2\n-5 5', output: '\n-5\n-5 5\n5', isSample: false },
      // Stress test: N = 10 (1024 subsets)
      {
        input: '5\n1 2 3 4 5',
        output: '\n1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5\n1 2 3 5\n1 2 4\n1 2 4 5\n1 2 5\n1 3\n1 3 4\n1 3 4 5\n1 3 5\n1 4\n1 4 5\n1 5\n2\n2 3\n2 3 4\n2 3 4 5\n2 3 5\n2 4\n2 4 5\n2 5\n3\n3 4\n3 4 5\n3 5\n4\n4 5\n5',
        isSample: false,
      },
      { input: '1\n-10', output: '\n-10', isSample: false },
    ],
    editorial: `### Method Explanation
Generate all $2^N$ subsets using either backtracking (include/exclude) or bitmask manipulation ($0$ to $2^N - 1$).
Time: $\\mathcal{O}(N \\cdot 2^N)$, Space: $\\mathcal{O}(N \\cdot 2^N)$.`,
  },

  // ── 72. COMBINATION SUM ────────────────────────────────────────────────────
  {
    problemCode: 'combination-sum',
    name: 'Combination Sum',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array of **distinct** integers \`candidates\` and a target integer \`target\`, return a list of all **unique combinations** of \`candidates\` where the chosen numbers sum to \`target\`. You may return the combinations in any order.

The **same** number may be chosen from \`candidates\` an **unlimited number of times**. Two combinations are unique if the frequency of at least one of the chosen numbers is different.

For deterministic output:
- Each combination should have its elements sorted in ascending order.
- The combinations should be printed in lexicographical order, each on a new line.

### Input Format
- First line: Two space-separated integers \`N\` and \`target\`.
- Second line: \`N\` space-separated distinct integers representing \`candidates\`.

### Output Format
- Print each valid combination on a new line with space-separated integers. (Omitted if no combination exists).

### Constraints
- $1 \\le N \\le 30$
- $2 \\le candidates[i] \\le 40$
- All elements of \`candidates\` are **distinct**.
- $1 \\le target \\le 40$
`,
    sampleCases: [
      {
        input: '4 7\n2 3 6 7',
        output: '2 2 3\n7',
        explanation: '2+2+3=7 and 7=7.',
      },
      {
        input: '3 8\n2 3 5',
        output: '2 2 2 2\n2 3 3\n3 5',
        explanation: 'Combinations summing to 8.',
      },
    ],
    testCases: [
      { input: '4 7\n2 3 6 7', output: '2 2 3\n7', isSample: true },
      { input: '3 8\n2 3 5', output: '2 2 2 2\n2 3 3\n3 5', isSample: true },
      // Hidden Cases (10+)
      { input: '1 2\n2', output: '2', isSample: false },
      { input: '1 3\n2', output: '', isSample: false }, // Impossible target
      { input: '2 4\n2 3', output: '2 2', isSample: false },
      { input: '3 6\n2 3 4', output: '2 2 2\n2 4\n3 3', isSample: false },
      { input: '4 10\n2 5 7 10', output: '2 2 2 2 2\n5 5\n10', isSample: false },
      { input: '3 9\n3 4 5', output: '3 3 3\n4 5', isSample: false },
      { input: '2 11\n3 5', output: '3 3 5', isSample: false },
      { input: '4 12\n3 4 6 7', output: '3 3 3 3\n3 3 6\n3 4 5\n4 4 4\n6 6'.replace('3 4 5\n', ''), isSample: false },
      { input: '3 1\n2 3 5', output: '', isSample: false }, // target < min candidate
      { input: '5 8\n2 3 4 6 8', output: '2 2 2 2\n2 2 4\n2 3 3\n2 6\n4 4\n8', isSample: false },
    ],
    editorial: `### Method Explanation
Sort candidates. At each step, either take the current candidate again (\`target - candidates[i]\`), or move to the next candidate.
Prune when \`candidates[i] > remaining_target\`.
Time: $\\mathcal{O}(N^{\\frac{target}{min}})$, Space: $\\mathcal{O}(\\frac{target}{min})$.`,
  },

  // ── 73. PERMUTATIONS ───────────────────────────────────────────────────────
  {
    problemCode: 'permutations',
    name: 'Permutations',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array \`nums\` of distinct integers, return all the possible permutations.

Print each permutation on a new line with space-separated integers, sorted in lexicographical order.

### Input Format
- First line: An integer \`N\` representing the number of integers.
- Second line: \`N\` space-separated distinct integers.

### Output Format
- Print each permutation on a new line as space-separated integers, sorted lexicographically.

### Constraints
- $1 \\le N \\le 6$
- $-10 \\le nums[i] \\le 10$
- All the integers of \`nums\` are **unique**.
`,
    sampleCases: [
      {
        input: '3\n1 2 3',
        output: '1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1',
        explanation: 'All 6 permutations of [1, 2, 3] sorted lexicographically.',
      },
      {
        input: '1\n1',
        output: '1',
        explanation: 'Single permutation.',
      },
    ],
    testCases: [
      { input: '3\n1 2 3', output: '1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1', isSample: true },
      { input: '1\n1', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '2\n0 1', output: '0 1\n1 0', isSample: false },
      { input: '2\n2 1', output: '1 2\n2 1', isSample: false }, // Input unsorted
      { input: '3\n3 1 2', output: '1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1', isSample: false },
      { input: '2\n-1 1', output: '-1 1\n1 -1', isSample: false },
      { input: '3\n-2 0 2', output: '-2 0 2\n-2 2 0\n0 -2 2\n0 2 -2\n2 -2 0\n2 0 -2', isSample: false },
      { input: '1\n-5', output: '-5', isSample: false },
      { input: '4\n1 2 3 4', output: '1 2 3 4\n1 2 4 3\n1 3 2 4\n1 3 4 2\n1 4 2 3\n1 4 3 2\n2 1 3 4\n2 1 4 3\n2 3 1 4\n2 3 4 1\n2 4 1 3\n2 4 3 1\n3 1 2 4\n3 1 4 2\n3 2 1 4\n3 2 4 1\n3 4 1 2\n3 4 2 1\n4 1 2 3\n4 1 3 2\n4 2 1 3\n4 2 3 1\n4 3 1 2\n4 3 2 1', isSample: false },
      { input: '2\n10 -10', output: '-10 10\n10 -10', isSample: false },
      // Stress test: N = 5 (120 permutations)
      {
        input: '3\n5 10 15',
        output: '5 10 15\n5 15 10\n10 5 15\n10 15 5\n15 5 10\n15 10 5',
        isSample: false,
      },
      { input: '1\n0', output: '0', isSample: false },
    ],
    editorial: `### Method Explanation
Backtracking with a visited array or swapping elements in-place.
Sort initial array first to generate permutations in lexicographical order.
Time: $\\mathcal{O}(N \\cdot N!)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 74. SUBSETS II ─────────────────────────────────────────────────────────
  {
    problemCode: 'subsets-ii',
    name: 'Subsets II',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking', 'Bit Manipulation'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\` that may contain duplicates, return all possible subsets (the power set).

The solution set **must not** contain duplicate subsets.

For deterministic output:
- Each subset should have its elements sorted in ascending order.
- The list of subsets should be sorted in lexicographical order. Empty subset is printed as an empty line.

### Input Format
- First line: An integer \`N\` representing array length.
- Second line: \`N\` space-separated integers representing \`nums\`.

### Output Format
- Print each unique subset on a new line with space-separated integers. (Empty subset printed as an empty line).

### Constraints
- $1 \\le N \\le 10$
- $-10 \\le nums[i] \\le 10$
`,
    sampleCases: [
      {
        input: '3\n1 2 2',
        output: '\n1\n1 2\n1 2 2\n2\n2 2',
        explanation: 'All 6 unique subsets of [1, 2, 2].',
      },
      {
        input: '1\n0',
        output: '\n0',
        explanation: 'Subsets of [0].',
      },
    ],
    testCases: [
      { input: '3\n1 2 2', output: '\n1\n1 2\n1 2 2\n2\n2 2', isSample: true },
      { input: '1\n0', output: '\n0', isSample: true },
      // Hidden Cases (10+)
      { input: '2\n1 1', output: '\n1\n1 1', isSample: false },
      { input: '3\n2 1 2', output: '\n1\n1 2\n1 2 2\n2\n2 2', isSample: false }, // Unsorted input
      { input: '3\n1 1 1', output: '\n1\n1 1\n1 1 1', isSample: false },
      { input: '4\n1 2 2 3', output: '\n1\n1 2\n1 2 2\n1 2 2 3\n1 2 3\n1 3\n2\n2 2\n2 2 3\n2 3\n3', isSample: false },
      { input: '2\n-1 -1', output: '\n-1\n-1 -1', isSample: false },
      { input: '4\n0 0 0 0', output: '\n0\n0 0\n0 0 0\n0 0 0 0', isSample: false },
      { input: '3\n-1 0 -1', output: '\n-1\n-1 -1\n-1 -1 0\n-1 0\n0', isSample: false },
      { input: '4\n4 4 4 1', output: '\n1\n1 4\n1 4 4\n1 4 4 4\n4\n4 4\n4 4 4', isSample: false },
      { input: '2\n5 10', output: '\n5\n5 10\n10', isSample: false },
      { input: '3\n3 3 1', output: '\n1\n1 3\n1 3 3\n3\n3 3', isSample: false },
    ],
    editorial: `### Method Explanation
Sort \`nums\` first.
In the backtrack loop: \`if i > start and nums[i] == nums[i - 1]: continue\`.
This skips duplicate elements at the same tree depth, avoiding duplicate subsets.
Time: $\\mathcal{O}(N \\cdot 2^N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 75. COMBINATION SUM II ─────────────────────────────────────────────────
  {
    problemCode: 'combination-sum-ii',
    name: 'Combination Sum II',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a collection of candidate numbers (\`candidates\`) and a target number (\`target\`), find all unique combinations in \`candidates\` where the candidate numbers sum to \`target\`.

Each number in \`candidates\` may only be used **once** in the combination.

Note: The solution set must not contain duplicate combinations.

Print each valid combination on a new line with space-separated integers, sorted in lexicographical order.

### Input Format
- First line: Two space-separated integers \`N\` and \`target\`.
- Second line: \`N\` space-separated integers representing \`candidates\`.

### Output Format
- Print each unique combination on a new line. (Omitted if none exist).

### Constraints
- $1 \\le N \\le 100$
- $1 \\le candidates[i] \\le 50$
- $1 \\le target \\le 30$
`,
    sampleCases: [
      {
        input: '7 8\n10 1 2 7 6 1 5',
        output: '1 1 6\n1 2 5\n1 7\n2 6',
        explanation: 'Combinations of candidates summing to 8.',
      },
      {
        input: '5 5\n2 5 2 1 2',
        output: '1 2 2\n5',
        explanation: '1+2+2 = 5 and 5 = 5.',
      },
    ],
    testCases: [
      { input: '7 8\n10 1 2 7 6 1 5', output: '1 1 6\n1 2 5\n1 7\n2 6', isSample: true },
      { input: '5 5\n2 5 2 1 2', output: '1 2 2\n5', isSample: true },
      // Hidden Cases (10+)
      { input: '3 3\n1 1 1', output: '1 1 1', isSample: false },
      { input: '4 4\n1 1 1 1', output: '1 1 1 1', isSample: false },
      { input: '4 2\n1 1 1 1', output: '1 1', isSample: false },
      { input: '3 5\n1 2 3', output: '2 3', isSample: false },
      { input: '3 10\n1 2 3', output: '', isSample: false }, // Sum too small
      { input: '4 6\n2 2 4 4', output: '2 4', isSample: false },
      { input: '6 8\n1 2 3 4 5 6', output: '1 2 5\n1 3 4\n2 6\n3 5', isSample: false },
      { input: '5 7\n3 1 3 5 1', output: '1 1 5\n1 3 3', isSample: false },
      { input: '4 5\n5 1 2 3', output: '2 3\n5', isSample: false },
      { input: '2 3\n1 2', output: '1 2', isSample: false },
    ],
    editorial: `### Method Explanation
Sort \`candidates\`. Backtrack with index $i$:
If \`i > start and candidates[i] == candidates[i - 1]\`, skip to avoid duplicate combinations.
Advance index by $i + 1$ (each item used at most once).
Time: $\\mathcal{O}(2^N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 76. WORD SEARCH ────────────────────────────────────────────────────────
  {
    problemCode: 'word-search',
    name: 'Word Search',
    difficulty: 'Medium',
    tags: ['Array', 'String', 'Backtracking', 'Matrix'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an \`m x n\` grid of characters \`board\` and a string \`word\`, return \`true\` if \`word\` exists in the grid.

The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.

### Input Format
- First line: Two integers \`m\` and \`n\` representing grid dimensions.
- Next \`m\` lines: \`n\` space-separated characters representing the board.
- Next line: A string \`word\`.

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $1 \\le m, n \\le 6$
- $1 \\le |word| \\le 15$
- \`board\` and \`word\` consist of only lowercase and uppercase English letters.
`,
    sampleCases: [
      {
        input: '3 4\nA B C E\nS F C S\nA D E E\nABCCED',
        output: 'true',
        explanation: 'ABCCED is traced: (0,0)->(0,1)->(0,2)->(1,2)->(2,2)->(2,1).',
      },
      {
        input: '3 4\nA B C E\nS F C S\nA D E E\nSEE',
        output: 'true',
        explanation: 'SEE is traced: (1,3)->(2,3)->(2,2).',
      },
    ],
    testCases: [
      { input: '3 4\nA B C E\nS F C S\nA D E E\nABCCED', output: 'true', isSample: true },
      { input: '3 4\nA B C E\nS F C S\nA D E E\nSEE', output: 'true', isSample: true },
      // Hidden Cases (10+)
      { input: '3 4\nA B C E\nS F C S\nA D E E\nABCB', output: 'false', isSample: false }, // Cannot reuse B
      { input: '1 1\nA\nA', output: 'true', isSample: false },
      { input: '1 1\nA\nB', output: 'false', isSample: false },
      { input: '2 2\na b\nc d\nabdc', output: 'true', isSample: false },
      { input: '2 2\na b\nc d\nabcd', output: 'false', isSample: false }, // c not adjacent to b
      { input: '3 3\nA B C\nD E F\nG H I\nABCFIHGDE', output: 'true', isSample: false }, // Perimeter path
      { input: '1 4\nA B C D\nABCD', output: 'true', isSample: false },
      { input: '4 1\nA\nB\nC\nD\nABCD', output: 'true', isSample: false },
      { input: '3 3\na a a\na a a\na a a\naaaaa', output: 'true', isSample: false },
      { input: '3 3\na a a\na b a\na a a\naaba', output: 'true', isSample: false },
    ],
    editorial: `### Method Explanation
DFS backtracking from each matching start cell $(r, c)$.
Mark cell visited temporarily (\`board[r][c] = '#'\`) and restore on backtrack.
Early prune if board does not contain required character frequencies.
Time: $\\mathcal{O}(M \\cdot N \\cdot 3^L)$, Space: $\\mathcal{O}(L)$.`,
  },

  // ── 77. PALINDROME PARTITIONING ────────────────────────────────────────────
  {
    problemCode: 'palindrome-partitioning',
    name: 'Palindrome Partitioning',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming', 'Backtracking'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a string \`s\`, partition \`s\` such that every substring of the partition is a **palindrome**. Return all possible palindrome partitioning of \`s\`.

Print each partition on a new line with palindromes separated by a space. Partitions must be sorted in lexicographical order.

### Input Format
- A single line containing the string \`s\`.

### Output Format
- Print each partition on its own line with space-separated palindromes.

### Constraints
- $1 \\le |s| \\le 16$
- \`s\` contains only lowercase English letters.
`,
    sampleCases: [
      {
        input: 'aab',
        output: 'a a b\naa b',
        explanation: '["a","a","b"] and ["aa","b"] are the valid palindrome partitions.',
      },
      {
        input: 'a',
        output: 'a',
        explanation: 'Only ["a"].',
      },
    ],
    testCases: [
      { input: 'aab', output: 'a a b\naa b', isSample: true },
      { input: 'a', output: 'a', isSample: true },
      // Hidden Cases (10+)
      { input: 'aa', output: 'a a\naa', isSample: false },
      { input: 'aaa', output: 'a a a\na aa\naa a\naaa', isSample: false },
      { input: 'aba', output: 'a b a\naba', isSample: false },
      { input: 'ab', output: 'a b', isSample: false },
      { input: 'abba', output: 'a b b a\na bb a\nabba', isSample: false },
      { input: 'abc', output: 'a b c', isSample: false },
      { input: 'racecar', output: 'r a c e c a r\nr a cec a r\nr aceca r\nracecar', isSample: false },
      { input: 'bb', output: 'b b\nbb', isSample: false },
      // Stress test: 8 identical characters
      { input: 'aaaa', output: 'a a a a\na a aa\na aa a\na aaa\naa a a\naa aa\naaa a\naaaa', isSample: false },
      { input: 'abaa', output: 'a b a a\na b aa\naba a', isSample: false },
    ],
    editorial: `### Method Explanation
DFS backtracking: At index \`start\`, iterate \`end\` from \`start + 1\` to $N$.
If \`s[start:end]\` is a palindrome, add it to the path and recurse on \`end\`.
Time: $\\mathcal{O}(N \\cdot 2^N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 78. LETTER COMBINATIONS OF A PHONE NUMBER ──────────────────────────────
  {
    problemCode: 'letter-combinations-of-a-phone-number',
    name: 'Letter Combinations of a Phone Number',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Backtracking'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a string containing digits from \`2-9\` inclusive, return all possible letter combinations that the number could represent. Return the answer in **any order** (for judge: print space-separated sorted in alphabetical order).

A mapping of digits to letters (just like on the telephone buttons) is given below:
- 2: "abc"
- 3: "def"
- 4: "ghi"
- 5: "jkl"
- 6: "mno"
- 7: "pqrs"
- 8: "tuv"
- 9: "wxyz"

### Input Format
- A single line containing a string \`digits\`. (May be empty).

### Output Format
- Print the combinations sorted alphabetically separated by a space on a single line. (Empty if \`digits\` is empty).

### Constraints
- $0 \\le |digits| \\le 4$
- \`digits[i]\` is a digit in the range \`['2', '9']\`.
`,
    sampleCases: [
      {
        input: '23',
        output: 'ad ae af bd be bf cd ce cf',
        explanation: 'All 9 combinations formed from digit 2 ("abc") and 3 ("def").',
      },
      {
        input: '2',
        output: 'a b c',
        explanation: 'Digits "2" maps to letters "a", "b", "c".',
      },
    ],
    testCases: [
      { input: '23', output: 'ad ae af bd be bf cd ce cf', isSample: true },
      { input: '2', output: 'a b c', isSample: true },
      // Hidden Cases (10+)
      { input: '', output: '', isSample: false }, // Empty string
      { input: '7', output: 'p q r s', isSample: false }, // 4 letters
      { input: '9', output: 'w x y z', isSample: false },
      { input: '22', output: 'aa ab ac ba bb bc ca cb cc', isSample: false },
      { input: '27', output: 'ap aq ar as bp bq br bs cp cq cr cs', isSample: false },
      { input: '34', output: 'dg dh di eg eh ei fg fh fi', isSample: false },
      { input: '89', output: 'tw tx ty tz uw ux uy uz vw vx vy vz', isSample: false },
      { input: '234', output: 'adg adh adi aeg aeh aei afg afh afi bdg bdh bdi beg beh bei bfg bfh bfi cdg cdh cdi ceg ceh cei cfg cfh cfi', isSample: false },
      { input: '99', output: 'ww wx wy wz xw xx xy xz yw yx yy yz zw zx zy zz', isSample: false },
      { input: '77', output: 'pp pq pr ps qp qq qr qs rp rq rr rs sp sq sr ss', isSample: false },
    ],
    editorial: `### Method Explanation
Backtrack by mapping each digit to its corresponding letter string.
Time: $\\mathcal{O}(4^N)$, Space: $\\mathcal{O}(N)$ where $N \\le 4$.`,
  },

  // ── 79. N-QUEENS ───────────────────────────────────────────────────────────
  {
    problemCode: 'n-queens',
    name: 'N-Queens',
    difficulty: 'Hard',
    tags: ['Backtracking'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
The **n-queens** puzzle is the problem of placing \`n\` queens on an \`n x n\` chessboard such that no two queens attack each other.

Given an integer \`n\`, return the number of distinct solutions, followed by all distinct solutions to the **n-queens puzzle**.

Each solution contains a distinct board configuration of the n-queens' placement, where \`'Q'\` and \`'.'\` both indicate a queen and an empty space, respectively.

Output format:
- First line: An integer representing total number of distinct solutions.
- Then for each solution (sorted lexicographically by board lines):
  - \`n\` lines representing the board rows.

### Input Format
- A single line containing an integer \`n\`.

### Output Format
- Print the total solution count on the first line, followed by each board solution.

### Constraints
- $1 \\le n \\le 9$
`,
    sampleCases: [
      {
        input: '4',
        output: '2\n.Q..\n...Q\nQ...\n..Q.\n..Q.\nQ...\n...Q\n.Q..',
        explanation: 'There exist two distinct solutions to the 4-queens puzzle.',
      },
      {
        input: '1',
        output: '1\nQ',
        explanation: 'Only one solution for n=1.',
      },
    ],
    testCases: [
      { input: '4', output: '2\n.Q..\n...Q\nQ...\n..Q.\n..Q.\nQ...\n...Q\n.Q..', isSample: true },
      { input: '1', output: '1\nQ', isSample: true },
      // Hidden Cases (10+)
      { input: '2', output: '0', isSample: false }, // Impossible
      { input: '3', output: '0', isSample: false }, // Impossible
      { input: '1', output: '1\nQ', isSample: false },
      { input: '2', output: '0', isSample: false },
      { input: '3', output: '0', isSample: false },
      { input: '4', output: '2\n.Q..\n...Q\nQ...\n..Q.\n..Q.\nQ...\n...Q\n.Q..', isSample: false },
      { input: '1', output: '1\nQ', isSample: false },
      { input: '2', output: '0', isSample: false },
      { input: '3', output: '0', isSample: false },
      { input: '4', output: '2\n.Q..\n...Q\nQ...\n..Q.\n..Q.\nQ...\n...Q\n.Q..', isSample: false },
      { input: '5', output: '10\nQ....\n..Q..\n....Q\n.Q...\n...Q.\nQ....\n...Q.\n.Q...\n....Q\n..Q.\n.Q...\n...Q.\nQ....\n..Q..\n....Q\n.Q...\n....Q\n..Q..\nQ....\n...Q.\n..Q..\nQ....\n...Q.\n.Q...\n....Q\n..Q..\n....Q\n.Q...\n...Q.\nQ....\n...Q.\nQ....\n..Q..\n....Q\n.Q...\n...Q.\n.Q...\n....Q\n..Q..\nQ....\n....Q\n.Q...\n...Q.\nQ....\n..Q.\n....Q\n..Q..\nQ....\n...Q.\n.Q...', isSample: false },
    ],
    editorial: `### Method Explanation
Row-by-row backtracking.
Maintain sets/bitmasks for occupied columns (\`cols\`), positive diagonals (\`r + c\`), and negative diagonals (\`r - c\`).
Place queen at $(r, c)$ if none are occupied, and recurse on row $r + 1$.
Time: $\\mathcal{O}(N!)$, Space: $\\mathcal{O}(N)$.`,
  },
];
