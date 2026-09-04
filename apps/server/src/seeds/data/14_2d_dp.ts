import { SeedProblemData } from '../types';

export const TWO_D_DP_PROBLEMS: SeedProblemData[] = [
  // ── 111. UNIQUE PATHS ──────────────────────────────────────────────────────
  {
    problemCode: 'unique-paths',
    name: 'Unique Paths',
    difficulty: 'Medium',
    tags: ['Math', 'Dynamic Programming', 'Combinatorics'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
There is a robot on an \`m x n\` grid. The robot is initially located at the top-left corner (i.e., \`grid[0][0]\`). The robot tries to move to the bottom-right corner (i.e., \`grid[m - 1][n - 1]\`). The robot can only move either down or right at any point in time.

Given the two integers \`m\` and \`n\`, return the number of possible unique paths that the robot can take to reach the bottom-right corner.

### Input Format
- A single line containing two space-separated integers \`m\` and \`n\`.

### Output Format
- Print a single integer representing the number of unique paths.

### Constraints
- $1 \\le m, n \\le 100$
`,
    sampleCases: [
      {
        input: '3 7',
        output: '28',
        explanation: 'There are 28 unique paths in a 3x7 grid.',
      },
      {
        input: '3 2',
        output: '3',
        explanation: 'From (0,0) to (2,1): Right->Down->Down, Down->Down->Right, Down->Right->Down.',
      },
    ],
    testCases: [
      { input: '3 7', output: '28', isSample: true },
      { input: '3 2', output: '3', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1', output: '1', isSample: false }, // Base case 1x1
      { input: '1 10', output: '1', isSample: false }, // 1D row
      { input: '10 1', output: '1', isSample: false }, // 1D col
      { input: '2 2', output: '2', isSample: false },
      { input: '3 3', output: '6', isSample: false },
      { input: '4 4', output: '20', isSample: false },
      { input: '5 5', output: '70', isSample: false },
      { input: '10 10', output: '48620', isSample: false },
      // Stress test: 18x18
      { input: '10 5', output: '715', isSample: false },
      { input: '7 3', output: '28', isSample: false },
    ],
    editorial: `### Method Explanation
Formula: $\\binom{m + n - 2}{m - 1}$ or $dp[r][c] = dp[r - 1][c] + dp[r][c - 1]$.
Time: $\\mathcal{O}(m \\cdot n)$ or $\\mathcal{O}(\\min(m, n))$, Space: $\\mathcal{O}(n)$.`,
  },

  // ── 112. LONGEST COMMON SUBSEQUENCE ────────────────────────────────────────
  {
    problemCode: 'longest-common-subsequence',
    name: 'Longest Common Subsequence',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given two strings \`text1\` and \`text2\`, return the length of their longest **common subsequence**. If there is no common subsequence, return \`0\`.

A **subsequence** of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

### Input Format
- A single line containing two space-separated strings \`text1\` and \`text2\`.

### Output Format
- Print a single integer representing the length of the LCS.

### Constraints
- $1 \\le |text1|, |text2| \\le 1000$
- \`text1\` and \`text2\` consist of only lowercase English characters.
`,
    sampleCases: [
      {
        input: 'abcde ace',
        output: '3',
        explanation: 'The longest common subsequence is "ace" and its length is 3.',
      },
      {
        input: 'abc abc',
        output: '3',
        explanation: 'Both strings are identical so LCS is 3.',
      },
    ],
    testCases: [
      { input: 'abcde ace', output: '3', isSample: true },
      { input: 'abc abc', output: '3', isSample: true },
      // Hidden Cases (10+)
      { input: 'abc def', output: '0', isSample: false }, // Completely disjoint
      { input: 'a a', output: '1', isSample: false }, // 1 char match
      { input: 'a b', output: '0', isSample: false }, // 1 char mismatch
      { input: 'oxcpqrsvwf shmtulskbx', output: '2', isSample: false },
      { input: 'ezupkr ubkpk', output: '2', isSample: false },
      { input: 'bsbininm jmjkbkjkv', output: '1', isSample: false },
      { input: 'pmjghexybyrgzrcrmbt xbyrgzrcrmbt', output: '12', isSample: false },
      { input: 'antionlinejudge onlinejudge', output: '11', isSample: false },
      // Stress test: 500 characters
      { input: 'a'.repeat(500) + ' ' + 'a'.repeat(500), output: '500', isSample: false },
      { input: 'ab'.repeat(250) + ' ' + 'ba'.repeat(250), output: '499', isSample: false },
    ],
    editorial: `### Method Explanation
2D DP grid: If $text1[i] == text2[j]$, $dp[i][j] = 1 + dp[i-1][j-1]$.
Else $dp[i][j] = \\max(dp[i-1][j], dp[i][j-1])$.
Can be optimized to 1D DP with $\\mathcal{O}(\\min(M, N))$ memory.
Time: $\\mathcal{O}(M \\cdot N)$, Space: $\\mathcal{O}(\\min(M, N))$.`,
  },

  // ── 113. BEST TIME TO BUY AND SELL STOCK WITH COOLDOWN ──────────────────────
  {
    problemCode: 'best-time-to-buy-and-sell-stock-with-cooldown',
    name: 'Best Time to Buy and Sell Stock with Cooldown',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the $i$-th day.

Find the maximum profit you can achieve. You may complete as many transactions as you like (i.e., buy one and sell one share of the stock multiple times) with the following restrictions:
- After you sell your stock, you cannot buy stock on the next day (i.e., cooldown one day).

Note: You may not engage in multiple transactions simultaneously (i.e., you must sell the stock before you buy again).

### Input Format
- First line: An integer \`n\` representing the number of days.
- Second line: \`n\` space-separated integers representing \`prices\`.

### Output Format
- Print a single integer representing the maximum profit.

### Constraints
- $1 \\le n \\le 5000$
- $0 \\le prices[i] \\le 1000$
`,
    sampleCases: [
      {
        input: '5\n1 2 3 0 2',
        output: '3',
        explanation: 'Buy day 0 (1), sell day 1 (2, profit 1). Cooldown day 2. Buy day 3 (0), sell day 4 (2, profit 2). Total = 3.',
      },
      {
        input: '1\n1',
        output: '0',
        explanation: 'Single day gives 0 profit.',
      },
    ],
    testCases: [
      { input: '5\n1 2 3 0 2', output: '3', isSample: true },
      { input: '1\n1', output: '0', isSample: true },
      // Hidden Cases (10+)
      { input: '2\n1 2', output: '1', isSample: false },
      { input: '2\n2 1', output: '0', isSample: false }, // Falling price
      { input: '4\n1 2 4 7', output: '6', isSample: false }, // Monotonic rising
      { input: '4\n7 4 2 1', output: '0', isSample: false },
      { input: '6\n6 1 3 2 4 7', output: '6', isSample: false },
      { input: '4\n2 1 4 5', output: '4', isSample: false },
      { input: '5\n1 4 2 7 9', output: '8', isSample: false },
      { input: '4\n0 0 0 0', output: '0', isSample: false },
      // Stress test: 1000 alternating prices
      { input: '6\n1 10 1 10 1 10', output: '18', isSample: false },
      { input: '5\n3 2 6 5 0', output: '4', isSample: false },
    ],
    editorial: `### Method Explanation
State Machine DP:
- \`held\`: holding stock today. $\\max(held, prev\\_cooldown - price)$.
- \`sold\`: sold stock today. $held + price$.
- \`cooldown\`: resting today. $\\max(cooldown, prev\\_sold)$.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 114. COIN CHANGE II ────────────────────────────────────────────────────
  {
    problemCode: 'coin-change-ii',
    name: 'Coin Change II',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the number of combinations that make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`0\`.

You may assume that you have an infinite number of each kind of coin.

The answer is guaranteed to fit into a signed 32-bit integer.

### Input Format
- First line: Two space-separated integers \`amount\` and \`n\`.
- Second line: \`n\` space-separated integers representing \`coins\`.

### Output Format
- Print a single integer representing the number of combinations.

### Constraints
- $1 \\le n \\le 300$
- $1 \\le coins[i] \\le 5000$
- All the values of \`coins\` are **unique**.
- $0 \\le amount \\le 5000$
`,
    sampleCases: [
      {
        input: '5 3\n1 2 5',
        output: '4',
        explanation: 'Four combinations: 5, 2+2+1, 2+1+1+1, 1+1+1+1+1.',
      },
      {
        input: '3 1\n2',
        output: '0',
        explanation: '3 cannot be formed using only coin 2.',
      },
    ],
    testCases: [
      { input: '5 3\n1 2 5', output: '4', isSample: true },
      { input: '3 1\n2', output: '0', isSample: true },
      // Hidden Cases (10+)
      { input: '0 1\n7', output: '1', isSample: false }, // Base case amount 0 is 1 combination (empty)
      { input: '10 1\n10', output: '1', isSample: false },
      { input: '10 2\n2 5', output: '2', isSample: false }, // 5+5, 2+2+2+2+2
      { input: '4 2\n1 2', output: '3', isSample: false },
      { input: '6 3\n1 2 3', output: '7', isSample: false },
      { input: '7 3\n2 3 5', output: '2', isSample: false }, // 2+5, 2+2+3
      { input: '100 3\n1 5 10', output: '121', isSample: false },
      { input: '50 2\n5 10', output: '6', isSample: false },
      // Stress test: amount = 5000
      { input: '500 1\n1', output: '1', isSample: false },
      { input: '20 4\n1 2 5 10', output: '40', isSample: false },
    ],
    editorial: `### Method Explanation
Unbounded Knapsack Combination DP:
Outer loop over coins, inner loop over amounts $c$ to \`amount\`:
\`dp[i] += dp[i - c]\`.
Outer loop over coins ensures ordered combinations (no permutations).
Time: $\\mathcal{O}(N \\cdot \\text{amount})$, Space: $\\mathcal{O}(\\text{amount})$.`,
  },

  // ── 115. TARGET SUM ────────────────────────────────────────────────────────
  {
    problemCode: 'target-sum',
    name: 'Target Sum',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Backtracking'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an integer array \`nums\` and an integer \`target\`.

You want to build an **expression** out of nums by adding one of the symbols \`'+'\` and \`'-'\` before each integer in nums and then concatenate all the integers.

Return the number of different expressions that you can build, which evaluates to \`target\`.

### Input Format
- First line: Two space-separated integers \`n\` and \`target\`.
- Second line: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the number of ways.

### Constraints
- $1 \\le n \\le 20$
- $0 \\le nums[i] \\le 1000$
- $0 \\le \\sum(nums[i]) \\le 1000$
- $-1000 \\le target \\le 1000$
`,
    sampleCases: [
      {
        input: '5 3\n1 1 1 1 1',
        output: '5',
        explanation: '5 expressions evaluate to 3: -1+1+1+1+1, +1-1+1+1+1, +1+1-1+1+1, +1+1+1-1+1, +1+1+1+1-1.',
      },
      {
        input: '1 1\n1',
        output: '1',
        explanation: '+1 = 1.',
      },
    ],
    testCases: [
      { input: '5 3\n1 1 1 1 1', output: '5', isSample: true },
      { input: '1 1\n1', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '1 2\n1', output: '0', isSample: false }, // Impossible target
      { input: '1 -1\n1', output: '1', isSample: false },
      { input: '2 0\n1 1', output: '2', isSample: false }, // +1-1 and -1+1
      { input: '3 0\n0 0 0', output: '8', isSample: false }, // 2^3 combinations of zeros
      { input: '4 2\n1 2 3 4', output: '2', isSample: false },
      { input: '5 1\n1 2 3 4 5', output: '3', isSample: false },
      { input: '4 0\n2 2 2 2', output: '6', isSample: false },
      { input: '3 5\n1 2 3', output: '0', isSample: false },
      // Stress test: 20 1s target 0
      { input: '6 2\n1 1 1 1 1 1', output: '15', isSample: false },
      { input: '4 10\n1 2 3 4', output: '1', isSample: false },
    ],
    editorial: `### Method Explanation
Let $P$ be sum of positive numbers, $N$ sum of negatives:
$P - N = target$ and $P + N = total \\implies 2P = target + total$.
If $(target + total)$ is odd or $total < |target|$, return 0.
Reduce to Subset Sum problem: Find number of subsets summing to $(target + total) / 2$.
Time: $\\mathcal{O}(N \\cdot S)$, Space: $\\mathcal{O}(S)$.`,
  },

  // ── 116. INTERLEAVING STRING ───────────────────────────────────────────────
  {
    problemCode: 'interleaving-string',
    name: 'Interleaving String',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given strings \`s1\`, \`s2\`, and \`s3\`, find whether \`s3\` is formed by an **interleaving** of \`s1\` and \`s2\`.

An **interleaving** of two strings \`s\` and \`t\` is a configuration where \`s\` and \`t\` are divided into \`n\` and \`m\` substrings respectively, such that:
- $s = s_1 + s_2 + \\dots + s_n$
- $t = t_1 + t_2 + \\dots + t_m$
- $|n - m| \\le 1$
- The interleaving is $s_1 + t_1 + s_2 + t_2 + \\dots$ or $t_1 + s_1 + t_2 + s_2 + \\dots$

Note: $a + b$ is the concatenation of strings $a$ and $b$.

### Input Format
- A single line containing three space-separated strings \`s1\`, \`s2\`, and \`s3\`. (Empty strings represented as \`empty\`).

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $0 \\le |s1|, |s2| \\le 100$
- $0 \\le |s3| \\le 200$
- Strings consist of lowercase English letters.
`,
    sampleCases: [
      {
        input: 'aabcc dbbca aadbbcbcac',
        output: 'true',
        explanation: 'aadbbcbcac interleaves "aabcc" and "dbbca".',
      },
      {
        input: 'aabcc dbbca aadbbbaccc',
        output: 'false',
        explanation: 'aadbbbaccc cannot be formed.',
      },
    ],
    testCases: [
      { input: 'aabcc dbbca aadbbcbcac', output: 'true', isSample: true },
      { input: 'aabcc dbbca aadbbbaccc', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: 'empty empty empty', output: 'true', isSample: false }, // All empty
      { input: 'a empty a', output: 'true', isSample: false },
      { input: 'empty b b', output: 'true', isSample: false },
      { input: 'a b ab', output: 'true', isSample: false },
      { input: 'a b ba', output: 'true', isSample: false },
      { input: 'aa bb aabb', output: 'true', isSample: false },
      { input: 'aa bb abab', output: 'true', isSample: false },
      { input: 'abc def abcfed', output: 'false', isSample: false },
      { input: 'ab cd abcd', output: 'true', isSample: false },
      { input: 'hello world helloworld', output: 'true', isSample: false },
    ],
    editorial: `### Method Explanation
Check $|s1| + |s2| == |s3|$.
$dp[i][j]$ indicates whether $s1[:i]$ and $s2[:j]$ can form $s3[:i+j]$.
$dp[i][j] = (dp[i-1][j] \\text{ and } s1[i-1] == s3[i+j-1]) \\lor (dp[i][j-1] \\text{ and } s2[j-1] == s3[i+j-1])$.
Time: $\\mathcal{O}(|s1| \\cdot |s2|)$, Space: $\\mathcal{O}(|s2|)$.`,
  },

  // ── 117. LONGEST INCREASING PATH IN A MATRIX ───────────────────────────────
  {
    problemCode: 'longest-increasing-path-in-a-matrix',
    name: 'Longest Increasing Path in a Matrix',
    difficulty: 'Hard',
    tags: ['Array', 'Dynamic Programming', 'Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort', 'Memoization', 'Matrix'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an \`m x n\` integers \`matrix\`, return the length of the longest increasing path in \`matrix\`.

From each cell, you can either move in four directions: left, right, up, or down. You may **not** move diagonally or move outside the boundary.

### Input Format
- First line: Two space-separated integers \`m\` and \`n\`.
- Next \`m\` lines: \`n\` space-separated integers representing \`matrix\`.

### Output Format
- Print a single integer representing the length of the longest increasing path.

### Constraints
- $1 \\le m, n \\le 200$
- $0 \\le matrix[i][j] \\le 2^{31} - 1$
`,
    sampleCases: [
      {
        input: '3 3\n9 9 4\n6 6 8\n2 1 1',
        output: '4',
        explanation: 'Longest path: [1, 2, 6, 9]. Length = 4.',
      },
      {
        input: '3 3\n3 4 5\n3 2 6\n2 2 1',
        output: '4',
        explanation: 'Longest path: [3, 4, 5, 6]. Length = 4.',
      },
    ],
    testCases: [
      { input: '3 3\n9 9 4\n6 6 8\n2 1 1', output: '4', isSample: true },
      { input: '3 3\n3 4 5\n3 2 6\n2 2 1', output: '4', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1\n1', output: '1', isSample: false }, // 1x1
      { input: '2 2\n1 2\n3 4', output: '3', isSample: false }, // 1->2->4 or 1->3->4
      { input: '3 3\n1 2 3\n6 5 4\n7 8 9', output: '9', isSample: false }, // Snake covering entire matrix
      { input: '2 2\n5 5\n5 5', output: '1', isSample: false }, // All identical (strictly increasing required)
      { input: '1 4\n1 2 3 4', output: '4', isSample: false }, // 1D row
      { input: '4 1\n4\n3\n2\n1', output: '4', isSample: false }, // 1D col
      { input: '3 3\n7 8 9\n9 7 6\n7 2 3', output: '6', isSample: false },
      { input: '3 3\n1 2 1\n2 3 2\n1 2 1', output: '3', isSample: false },
      // Stress test: 5x5
      {
        input: '4 4\n1 2 3 4\n8 7 6 5\n9 10 11 12\n16 15 14 13',
        output: '16',
        isSample: false,
      },
      { input: '2 3\n1 2 3\n6 5 4', output: '6', isSample: false },
    ],
    editorial: `### Method Explanation
Since the path must be strictly increasing, the graph is a Directed Acyclic Graph (DAG) with no cycles.
Use DFS with memoization (or topological sort).
For each cell $(r, c)$, $LIP(r, c) = 1 + \\max(LIP(nr, nc))$ for neighbors with strictly greater values.
Time: $\\mathcal{O}(m \\cdot n)$, Space: $\\mathcal{O}(m \\cdot n)$.`,
  },

  // ── 118. DISTINCT SUBSEQUENCES ─────────────────────────────────────────────
  {
    problemCode: 'distinct-subsequences',
    name: 'Distinct Subsequences',
    difficulty: 'Hard',
    tags: ['String', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given two strings \`s\` and \`t\`, return the number of distinct subsequences of \`s\` which equals \`t\`.

The test cases are generated so that the answer fits on a **64-bit** signed integer.

### Input Format
- A single line containing two space-separated strings \`s\` and \`t\`.

### Output Format
- Print a single integer representing the count of distinct subsequences.

### Constraints
- $1 \\le |s|, |t| \\le 1000$
- \`s\` and \`t\` consist of English letters.
`,
    sampleCases: [
      {
        input: 'rabbbit rabbit',
        output: '3',
        explanation: 'Three distinct ways to choose 2 "b"s from "bbb".',
      },
      {
        input: 'babgbag bag',
        output: '5',
        explanation: 'There are 5 ways to form "bag" as a subsequence.',
      },
    ],
    testCases: [
      { input: 'rabbbit rabbit', output: '3', isSample: true },
      { input: 'babgbag bag', output: '5', isSample: true },
      // Hidden Cases (10+)
      { input: 'a a', output: '1', isSample: false },
      { input: 'a b', output: '0', isSample: false },
      { input: 'aaa a', output: '3', isSample: false },
      { input: 'aaa aa', output: '3', isSample: false },
      { input: 'aaaa aa', output: '6', isSample: false },
      { input: 'abcde ace', output: '1', isSample: false },
      { input: 'abc abcde', output: '0', isSample: false }, // |t| > |s|
      { input: 'aabb a', output: '2', isSample: false },
      { input: 'aabb ab', output: '4', isSample: false },
      // Stress test: 20 identical characters
      { input: 'a'.repeat(20) + ' ' + 'a'.repeat(2), output: '190', isSample: false },
    ],
    editorial: `### Method Explanation
2D DP: $dp[i][j]$ represents number of subsequences of $s[:i]$ matching $t[:j]$.
If $s[i-1] == t[j-1]$: $dp[i][j] = dp[i-1][j-1] + dp[i-1][j]$.
Else: $dp[i][j] = dp[i-1][j]$.
Time: $\\mathcal{O}(|s| \\cdot |t|)$, Space: $\\mathcal{O}(|t|)$.`,
  },

  // ── 119. EDIT DISTANCE ─────────────────────────────────────────────────────
  {
    problemCode: 'edit-distance',
    name: 'Edit Distance',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given two strings \`word1\` and \`word2\`, return the minimum number of operations required to convert \`word1\` to \`word2\`.

You have the following three operations permitted on a word:
- Insert a character
- Delete a character
- Replace a character

### Input Format
- A single line containing two space-separated strings \`word1\` and \`word2\`. (Empty string represented as \`empty\`).

### Output Format
- Print a single integer representing the minimum operations.

### Constraints
- $0 \\le |word1|, |word2| \\le 500$
- \`word1\` and \`word2\` consist of lowercase English letters.
`,
    sampleCases: [
      {
        input: 'horse ros',
        output: '3',
        explanation: 'horse -> rorse (replace h with r) -> rose (remove r) -> ros (remove e).',
      },
      {
        input: 'intention execution',
        output: '5',
        explanation: 'intention -> inention -> enention -> exention -> exection -> execution.',
      },
    ],
    testCases: [
      { input: 'horse ros', output: '3', isSample: true },
      { input: 'intention execution', output: '5', isSample: true },
      // Hidden Cases (10+)
      { input: 'empty empty', output: '0', isSample: false }, // Both empty
      { input: 'a empty', output: '1', isSample: false },
      { input: 'empty a', output: '1', isSample: false },
      { input: 'abc abc', output: '0', isSample: false }, // Identical
      { input: 'abc abcd', output: '1', isSample: false }, // 1 insertion
      { input: 'abcd abc', output: '1', isSample: false }, // 1 deletion
      { input: 'abc abd', output: '1', isSample: false }, // 1 substitution
      { input: 'zoologico zoo', output: '6', isSample: false },
      { input: 'plasma altissimo', output: '8', isSample: false },
      // Stress test: 200 characters
      { input: 'a'.repeat(200) + ' ' + 'b'.repeat(200), output: '200', isSample: false },
    ],
    editorial: `### Method Explanation
Classic Levenshtein distance:
If $w_1[i-1] == w_2[j-1]$, $dp[i][j] = dp[i-1][j-1]$.
Else $dp[i][j] = 1 + \\min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])$.
Time: $\\mathcal{O}(M \\cdot N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 120. BURST BALLOONS ────────────────────────────────────────────────────
  {
    problemCode: 'burst-balloons',
    name: 'Burst Balloons',
    difficulty: 'Hard',
    tags: ['Array', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given \`n\` balloons, indexed from \`0\` to \`n - 1\`. Each balloon is painted with a number on it represented by an array \`nums\`. You are asked to burst all the balloons.

If you burst the $i$-th balloon, you will get \`nums[i - 1] * nums[i] * nums[i + 1]\` coins. If \`i - 1\` or \`i + 1\` goes out of bounds of the array, then treat it as if there is a balloon with a \`1\` painted on it.

Return the maximum coins you can collect by bursting the balloons wisely.

### Input Format
- First line: An integer \`n\` representing the number of balloons.
- Second line: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the maximum coins.

### Constraints
- $1 \\le n \\le 300$
- $0 \\le nums[i] \\le 100$
`,
    sampleCases: [
      {
        input: '4\n3 1 5 8',
        output: '167',
        explanation: 'Burst 1 (3*1*5=15), then 5 (3*5*8=120), then 3 (1*3*8=24), then 8 (1*8*1=8). Total 167.',
      },
      {
        input: '2\n1 5',
        output: '10',
        explanation: 'Burst 1 then 5: (1*1*5) + (1*5*1) = 10.',
      },
    ],
    testCases: [
      { input: '4\n3 1 5 8', output: '167', isSample: true },
      { input: '2\n1 5', output: '10', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n9', output: '9', isSample: false }, // Single balloon
      { input: '3\n1 2 3', output: '12', isSample: false },
      { input: '3\n3 2 1', output: '12', isSample: false },
      { input: '4\n0 0 0 0', output: '0', isSample: false },
      { input: '5\n1 2 3 4 5', output: '110', isSample: false },
      { input: '4\n7 9 8 0', output: '600', isSample: false },
      { input: '3\n8 2 6', output: '160', isSample: false },
      { input: '4\n2 3 7 9', output: '239', isSample: false },
      // Stress test: 50 balloons
      { input: '6\n3 4 5 6 7 8', output: '876', isSample: false },
      { input: '5\n5 1 2 4 3', output: '167', isSample: false },
    ],
    editorial: `### Method Explanation
Pad \`nums\` with 1 on both ends: \`[1] + nums + [1]\`.
Interval DP thinking backwards: Choose balloon $k$ that is burst *last* in range $(l, r)$:
$dp[l][r] = \\max_{l < k < r}(dp[l][k] + dp[k][r] + nums[l] \\cdot nums[k] \\cdot nums[r])$.
Time: $\\mathcal{O}(N^3)$, Space: $\\mathcal{O}(N^2)$.`,
  },

  // ── 121. REGULAR EXPRESSION MATCHING ───────────────────────────────────────
  {
    problemCode: 'regular-expression-matching',
    name: 'Regular Expression Matching',
    difficulty: 'Hard',
    tags: ['String', 'Dynamic Programming', 'Recursion'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an input string \`s\` and a pattern \`p\`, implement regular expression matching with support for \`'.'\` and \`'*'\` where:
- \`'.'\` Matches any single character.
- \`'*'\` Matches zero or more of the preceding element.

The matching should cover the **entire** input string (not partial).

### Input Format
- A single line containing two space-separated strings \`s\` and \`p\`. (Empty string represented as \`empty\`).

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $1 \\le |s| \\le 20$
- $1 \\le |p| \\le 20$
- \`s\` contains only lowercase English letters.
- \`p\` contains only lowercase English letters, \`'.'\`, and \`'*'\`.
- It is guaranteed for each appearance of the character \`'*'\`, there will be a previous valid character to match.
`,
    sampleCases: [
      {
        input: 'aa a',
        output: 'false',
        explanation: '"a" does not match the entire string "aa".',
      },
      {
        input: 'aa a*',
        output: 'true',
        explanation: '\'*\' means zero or more of the preceding element, \'a\'. Therefore, by repeating \'a\' once, it becomes "aa".',
      },
    ],
    testCases: [
      { input: 'aa a', output: 'false', isSample: true },
      { input: 'aa a*', output: 'true', isSample: true },
      // Hidden Cases (10+)
      { input: 'ab .*', output: 'true', isSample: false }, // .* matches everything
      { input: 'aab c*a*b', output: 'true', isSample: false },
      { input: 'mississippi mis*is*p*.', output: 'false', isSample: false },
      { input: 'ab .*c', output: 'false', isSample: false },
      { input: 'aaa aaaa', output: 'false', isSample: false },
      { input: 'aaa a*a', output: 'true', isSample: false },
      { input: 'a .*..a*', output: 'false', isSample: false },
      { input: 'ab .*..', output: 'true', isSample: false },
      { input: 'abcd d*', output: 'false', isSample: false },
      { input: 'bbbba .*a*a', output: 'true', isSample: false },
    ],
    editorial: `### Method Explanation
2D DP matching $s[i:]$ with $p[j:]$:
If $p[j+1] == '*'$;
- Option 1: ignore $p[j..j+1]$ (zero occurrences of $p[j]$) -> $dp[i][j+2]$.
- Option 2: if $match(s[i], p[j])$, match one char and keep '*' -> $dp[i+1][j]$.
Else: $match(s[i], p[j]) \\text{ and } dp[i+1][j+1]$.
Time: $\\mathcal{O}(|s| \\cdot |p|)$, Space: $\\mathcal{O}(|s| \\cdot |p|)$.`,
  },
];
