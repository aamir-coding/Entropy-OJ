import { SeedProblemData, rangeString } from '../types';

export const ONE_D_DP_PROBLEMS: SeedProblemData[] = [
  // ── 99. CLIMBING STAIRS ────────────────────────────────────────────────────
  {
    problemCode: 'climbing-stairs',
    name: 'Climbing Stairs',
    difficulty: 'Easy',
    tags: ['Math', 'Dynamic Programming', 'Memoization'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?

### Input Format
- A single integer \`n\`.

### Output Format
- Print a single integer representing the number of distinct ways.

### Constraints
- $1 \\le n \\le 45$
`,
    sampleCases: [
      {
        input: '2',
        output: '2',
        explanation: '1. 1 step + 1 step, 2. 2 steps.',
      },
      {
        input: '3',
        output: '3',
        explanation: '1. 1+1+1, 2. 1+2, 3. 2+1.',
      },
    ],
    testCases: [
      { input: '2', output: '2', isSample: true },
      { input: '3', output: '3', isSample: true },
      // Hidden Cases (10+)
      { input: '1', output: '1', isSample: false }, // Base case
      { input: '4', output: '5', isSample: false },
      { input: '5', output: '8', isSample: false },
      { input: '6', output: '13', isSample: false },
      { input: '10', output: '89', isSample: false },
      { input: '20', output: '10946', isSample: false },
      { input: '30', output: '1346269', isSample: false },
      { input: '40', output: '165580141', isSample: false },
      // Constraint limit
      { input: '44', output: '1134903170', isSample: false },
      { input: '45', output: '1836311903', isSample: false },
    ],
    editorial: `### Method Explanation
Fibonacci recurrence: $dp[i] = dp[i - 1] + dp[i - 2]$ with base cases $dp[1] = 1, dp[2] = 2$.
Space can be optimized to $\\mathcal{O}(1)$ with two variables.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 100. MIN COST CLIMBING STAIRS ──────────────────────────────────────────
  {
    problemCode: 'min-cost-climbing-stairs',
    name: 'Min Cost Climbing Stairs',
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an integer array \`cost\` where \`cost[i]\` is the cost of $i$-th step on a staircase. Once you pay the cost, you can either climb one or two steps.

You can either start from the step with index \`0\`, or the step with index \`1\`.

Return the minimum cost to reach the top of the floor.

### Input Format
- First line: An integer \`n\` representing array length.
- Second line: \`n\` space-separated integers representing \`cost\`.

### Output Format
- Print a single integer representing the minimum cost.

### Constraints
- $2 \\le n \\le 1000$
- $0 \\le cost[i] \\le 999$
`,
    sampleCases: [
      {
        input: '3\n10 15 20',
        output: '15',
        explanation: 'Cheapest is: start at index 1 (pay 15) and take two steps to reach top.',
      },
      {
        input: '10\n1 100 1 1 1 100 1 1 100 1',
        output: '6',
        explanation: 'Pay 1 on each step, skipping the 100s.',
      },
    ],
    testCases: [
      { input: '3\n10 15 20', output: '15', isSample: true },
      { input: '10\n1 100 1 1 1 100 1 1 100 1', output: '6', isSample: true },
      // Hidden Cases (10+)
      { input: '2\n1 2', output: '1', isSample: false }, // Base case n=2
      { input: '2\n10 5', output: '5', isSample: false },
      { input: '4\n0 0 0 0', output: '0', isSample: false }, // Zero costs
      { input: '5\n1 2 3 4 5', output: '6', isSample: false },
      { input: '5\n5 4 3 2 1', output: '6', isSample: false },
      { input: '6\n10 1 1 10 1 1', output: '3', isSample: false },
      { input: '4\n1 100 100 1', output: '2', isSample: false },
      { input: '7\n0 1 2 2 1 0 1', output: '2', isSample: false },
      // Stress test: 1000 steps
      { input: `1000\n${'1 '.repeat(1000)}`.trim(), output: '500', isSample: false },
      { input: `1000\n${'0 '.repeat(1000)}`.trim(), output: '0', isSample: false },
    ],
    editorial: `### Method Explanation
$dp[i] = cost[i] + \\min(dp[i - 1], dp[i - 2])$.
Final answer is $\\min(dp[n - 1], dp[n - 2])$.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 101. HOUSE ROBBER ──────────────────────────────────────────────────────
  {
    problemCode: 'house-robber',
    name: 'House Robber',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and **it will automatically contact the police if two adjacent houses were broken into on the same night**.

Given an integer array \`nums\` representing the amount of money of each house, return the maximum amount of money you can rob tonight **without alerting the police**.

### Input Format
- First line: An integer \`n\` representing the number of houses.
- Second line: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the maximum rob money.

### Constraints
- $1 \\le n \\le 100$
- $0 \\le nums[i] \\le 400$
`,
    sampleCases: [
      {
        input: '4\n1 2 3 1',
        output: '4',
        explanation: 'Rob house 1 (money = 1) and then rob house 3 (money = 3). Total amount = 1 + 3 = 4.',
      },
      {
        input: '5\n2 7 9 3 1',
        output: '12',
        explanation: 'Rob house 1 (2), house 3 (9) and house 5 (1). Total = 2 + 9 + 1 = 12.',
      },
    ],
    testCases: [
      { input: '4\n1 2 3 1', output: '4', isSample: true },
      { input: '5\n2 7 9 3 1', output: '12', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n100', output: '100', isSample: false }, // Single house
      { input: '2\n1 2', output: '2', isSample: false },
      { input: '2\n5 3', output: '5', isSample: false },
      { input: '3\n2 1 1', output: '3', isSample: false },
      { input: '4\n2 1 1 2', output: '4', isSample: false },
      { input: '5\n0 0 0 0 0', output: '0', isSample: false },
      { input: '6\n1 3 1 3 100 1', output: '104', isSample: false },
      { input: '5\n10 2 2 10 2', output: '20', isSample: false },
      { input: '7\n4 1 2 7 5 3 1', output: '14', isSample: false },
      // Stress test: 100 houses
      { input: `100\n${'5 '.repeat(100)}`.trim(), output: '250', isSample: false },
    ],
    editorial: `### Method Explanation
Recurrence: $rob[i] = \\max(rob[i - 1], rob[i - 2] + nums[i])$.
Maintain two variables \`rob1\` and \`rob2\` for $\\mathcal{O}(1)$ space.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 102. HOUSE ROBBER II ───────────────────────────────────────────────────
  {
    problemCode: 'house-robber-ii',
    name: 'House Robber II',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are **arranged in a circle**. That means the first house is the neighbor of the last one. Meanwhile, adjacent houses have a security system connected, and **it will automatically contact the police if two adjacent houses were broken into on the same night**.

Given an integer array \`nums\` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.

### Input Format
- First line: An integer \`n\` representing the number of houses.
- Second line: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the maximum rob money.

### Constraints
- $1 \\le n \\le 100$
- $0 \\le nums[i] \\le 1000$
`,
    sampleCases: [
      {
        input: '3\n2 3 2',
        output: '3',
        explanation: 'You cannot rob house 1 and house 3 because they are adjacent neighbors in a circle.',
      },
      {
        input: '4\n1 2 3 1',
        output: '4',
        explanation: 'Rob house 1 (1) and house 3 (3), total 4.',
      },
    ],
    testCases: [
      { input: '3\n2 3 2', output: '3', isSample: true },
      { input: '4\n1 2 3 1', output: '4', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n42', output: '42', isSample: false }, // Single house
      { input: '2\n1 2', output: '2', isSample: false },
      { input: '2\n10 20', output: '20', isSample: false },
      { input: '3\n1 2 3', output: '3', isSample: false },
      { input: '4\n1 3 1 3', output: '4', isSample: false },
      { input: '5\n1 2 1 1 2', output: '4', isSample: false },
      { input: '6\n200 3 140 20 10 100', output: '340', isSample: false },
      { input: '5\n10 1 1 10 1', output: '11', isSample: false },
      { input: '4\n0 0 0 0', output: '0', isSample: false },
      // Stress test: 100 houses
      { input: `100\n${'10 '.repeat(100)}`.trim(), output: '490', isSample: false },
    ],
    editorial: `### Method Explanation
Since house 0 and house $n - 1$ are adjacent, we cannot rob both.
Run standard House Robber on two slices: \`nums[0:n-1]\` and \`nums[1:n]\`.
Take the maximum: $\\max(nums[0], \\text{rob}(nums[0:n-1]), \\text{rob}(nums[1:n]))$.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 103. LONGEST PALINDROMIC SUBSTRING ──────────────────────────────────────
  {
    problemCode: 'longest-palindromic-substring',
    name: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    tags: ['Two Pointers', 'String', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a string \`s\`, return the **longest palindromic substring** in \`s\`.

If there are multiple answers with the same maximum length, return the one that occurs **earliest** in \`s\`.

### Input Format
- A single line containing the string \`s\`.

### Output Format
- Print the longest palindromic substring.

### Constraints
- $1 \\le |s| \\le 1000$
- \`s\` consist of only digits and English letters.
`,
    sampleCases: [
      {
        input: 'babad',
        output: 'bab',
        explanation: '"aba" is also valid, but "bab" appears earlier.',
      },
      {
        input: 'cbbd',
        output: 'bb',
        explanation: '"bb" is the longest palindromic substring.',
      },
    ],
    testCases: [
      { input: 'babad', output: 'bab', isSample: true },
      { input: 'cbbd', output: 'bb', isSample: true },
      // Hidden Cases (10+)
      { input: 'a', output: 'a', isSample: false }, // Single letter
      { input: 'ac', output: 'a', isSample: false }, // Earliest single
      { input: 'bb', output: 'bb', isSample: false },
      { input: 'racecar', output: 'racecar', isSample: false },
      { input: 'abacdfgdcaba', output: 'aba', isSample: false },
      { input: 'forgeeksskeegfor', output: 'geeksskeeg', isSample: false },
      { input: '1234321', output: '1234321', isSample: false },
      { input: 'abcba78987', output: 'abcba', isSample: false },
      // Stress test: 1000 identical characters
      { input: 'a'.repeat(1000), output: 'a'.repeat(1000), isSample: false },
      { input: 'bananas', output: 'anana', isSample: false },
    ],
    editorial: `### Method Explanation
Expand around center: Every palindrome has either an odd center (1 character) or an even center (2 characters).
There are $2N - 1$ centers. Expanding from each center takes $\\mathcal{O}(N)$ time.
Total Time: $\\mathcal{O}(N^2)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 104. PALINDROMIC SUBSTRINGS ────────────────────────────────────────────
  {
    problemCode: 'palindromic-substrings',
    name: 'Palindromic Substrings',
    difficulty: 'Medium',
    tags: ['Two Pointers', 'String', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a string \`s\`, return the number of **palindromic substrings** in it.

A string is a **palindrome** when it reads the same backward as forward.

A **substring** is a contiguous sequence of characters within the string.

### Input Format
- A single line containing the string \`s\`.

### Output Format
- Print a single integer representing the total count of palindromic substrings.

### Constraints
- $1 \\le |s| \\le 1000$
- \`s\` consists of lowercase English letters.
`,
    sampleCases: [
      {
        input: 'abc',
        output: '3',
        explanation: 'Three palindromic substrings: "a", "b", "c".',
      },
      {
        input: 'aaa',
        output: '6',
        explanation: 'Six palindromic substrings: "a", "a", "a", "aa", "aa", "aaa".',
      },
    ],
    testCases: [
      { input: 'abc', output: '3', isSample: true },
      { input: 'aaa', output: '6', isSample: true },
      // Hidden Cases (10+)
      { input: 'a', output: '1', isSample: false },
      { input: 'aba', output: '4', isSample: false }, // "a", "b", "a", "aba"
      { input: 'ababa', output: '9', isSample: false },
      { input: 'racecar', output: '10', isSample: false },
      { input: 'noon', output: '6', isSample: false },
      { input: 'aaaa', output: '10', isSample: false },
      { input: 'abcd', output: '4', isSample: false },
      { input: 'baab', output: '6', isSample: false },
      // Stress test: 100 'a's -> 100 * 101 / 2 = 5050
      { input: 'a'.repeat(100), output: '5050', isSample: false },
      { input: 'hello', output: '6', isSample: false },
    ],
    editorial: `### Method Explanation
Expand around center for each of the $2N - 1$ centers.
While $l \\ge 0$ and $r < N$ and $s[l] == s[r]$, increment palindrome count, $l--, r++$.
Time: $\\mathcal{O}(N^2)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 105. DECODE WAYS ───────────────────────────────────────────────────────
  {
    problemCode: 'decode-ways',
    name: 'Decode Ways',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
A message containing letters from \`A-Z\` can be encoded into numbers using the following mapping:
- 'A' -> "1", 'B' -> "2", ..., 'Z' -> "26".

To decode an encoded message, all the digits must be grouped then mapped back into letters using the reverse of the mapping above (there may be multiple ways). For example, \`"11106"\` can be mapped into:
- \`"AAJF"\` with the grouping \`(1 1 10 6)\`
- \`"KJF"\` with the grouping \`(11 10 6)\`

Note that the grouping \`(1 11 06)\` is invalid because \`"06"\` cannot be mapped into \`'F'\` since \`"6"\` is different from \`"06"\`.

Given a string \`s\` containing only digits, return the **number of ways** to decode it.

### Input Format
- A single line containing the digit string \`s\`.

### Output Format
- Print a single integer representing the number of decoding ways.

### Constraints
- $1 \\le |s| \\le 100$
- \`s\` contains only digits and may contain leading zero(s).
`,
    sampleCases: [
      {
        input: '12',
        output: '2',
        explanation: '"12" could be decoded as "AB" (1 2) or "L" (12).',
      },
      {
        input: '226',
        output: '3',
        explanation: '"226" could be decoded as "BZ" (2 26), "VF" (22 6), or "BBF" (2 2 6).',
      },
    ],
    testCases: [
      { input: '12', output: '2', isSample: true },
      { input: '226', output: '3', isSample: true },
      // Hidden Cases (10+)
      { input: '06', output: '0', isSample: false }, // Leading zero
      { input: '0', output: '0', isSample: false },
      { input: '10', output: '1', isSample: false }, // Single valid 10
      { input: '27', output: '1', isSample: false }, // 27 > 26 so only (2, 7)
      { input: '111', output: '3', isSample: false },
      { input: '1111', output: '5', isSample: false },
      { input: '2101', output: '1', isSample: false }, // 2 (10) 1
      { input: '301', output: '0', isSample: false }, // 30 is invalid
      { input: '1201234', output: '3', isSample: false },
      // Stress test: 30 1s -> Fib(31) = 1346269
      { input: '1'.repeat(30), output: '1346269', isSample: false },
    ],
    editorial: `### Method Explanation
$dp[i]$: number of ways to decode prefix $s[0..i]$.
If $s[i - 1] \\ne '0'$, $dp[i] += dp[i - 1]$.
If $10 \\le \\text{int}(s[i-2..i]) \\le 26$, $dp[i] += dp[i - 2]$.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 106. COIN CHANGE ───────────────────────────────────────────────────────
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
- First line: Two space-separated integers \`n\` and \`amount\`.
- Second line: \`n\` space-separated integers representing \`coins\`.

### Output Format
- Print a single integer representing the minimum coins needed or \`-1\`.

### Constraints
- $1 \\le n \\le 12$
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
        explanation: 'Amount 3 cannot be made with only coin 2.',
      },
    ],
    testCases: [
      { input: '3 11\n1 2 5', output: '3', isSample: true },
      { input: '1 3\n2', output: '-1', isSample: true },
      // Hidden Cases (10+)
      { input: '1 0\n1', output: '0', isSample: false }, // amount = 0
      { input: '3 6249\n186 419 83', output: '20', isSample: false },
      { input: '4 7\n2 4 6 8', output: '-1', isSample: false }, // All even coins cannot make odd
      { input: '2 3\n1 2', output: '2', isSample: false },
      { input: '1 1\n1', output: '1', isSample: false },
      { input: '3 4\n1 2 3', output: '2', isSample: false },
      { input: '3 100\n1 5 10', output: '10', isSample: false },
      { input: '4 15\n1 5 10 25', output: '2', isSample: false },
      // Stress test: amount = 10,000
      { input: '1 10000\n1', output: '10000', isSample: false },
      { input: '2 10000\n2 5', output: '2000', isSample: false },
    ],
    editorial: `### Method Explanation
Unbounded knapsack DP:
\`dp[i] = min(dp[i], dp[i - coin] + 1)\` for each coin $\\le i$.
Initialize \`dp[0] = 0\` and all other values to $\\infty$.
Time: $\\mathcal{O}(N \\cdot \\text{amount})$, Space: $\\mathcal{O}(\\text{amount})$.`,
  },

  // ── 107. MAXIMUM PRODUCT SUBARRAY ──────────────────────────────────────────
  {
    problemCode: 'maximum-product-subarray',
    name: 'Maximum Product Subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\`, find a subarray that has the largest product, and return the product.

### Input Format
- First line: An integer \`n\` representing array length.
- Second line: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the maximum product.

### Constraints
- $1 \\le n \\le 2 \\cdot 10^4$
- $-10 \\le nums[i] \\le 10$
- The product of any prefix or suffix of \`nums\` is guaranteed to fit in a **64-bit** integer.
`,
    sampleCases: [
      {
        input: '4\n2 3 -2 4',
        output: '6',
        explanation: '[2, 3] has the largest product 6.',
      },
      {
        input: '3\n-2 0 -1',
        output: '0',
        explanation: 'Result cannot be 2, because [-2,-1] is not a contiguous subarray.',
      },
    ],
    testCases: [
      { input: '4\n2 3 -2 4', output: '6', isSample: true },
      { input: '3\n-2 0 -1', output: '0', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n-2', output: '-2', isSample: false }, // Single negative
      { input: '2\n-2 3', output: '3', isSample: false },
      { input: '2\n-2 -3', output: '6', isSample: false }, // Two negatives make positive
      { input: '4\n-2 -3 -4 0', output: '12', isSample: false },
      { input: '5\n-1 -2 -3 -4 -5', output: '120', isSample: false },
      { input: '4\n0 2 0 3', output: '3', isSample: false },
      { input: '5\n2 -5 -2 -4 3', output: '24', isSample: false },
      { input: '4\n-1 0 -2 0', output: '0', isSample: false },
      // Stress test: 1000 ones and alternating -1s
      { input: '6\n-2 1 -3 4 -1 2', output: '48', isSample: false },
      { input: '5\n1 2 3 4 5', output: '120', isSample: false },
    ],
    editorial: `### Method Explanation
Maintain both \`curMax\` and \`curMin\` ending at each index because multiplying a negative number flips minimum into maximum.
When $nums[i] < 0$, swap \`curMax\` and \`curMin\`.
Then \`curMax = max(nums[i], curMax * nums[i])\` and \`curMin = min(nums[i], curMin * nums[i])\`.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 108. WORD BREAK ────────────────────────────────────────────────────────
  {
    problemCode: 'word-break',
    name: 'Word Break',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'String', 'Dynamic Programming', 'Trie', 'Memoization'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a string \`s\` and a dictionary of strings \`wordDict\`, return \`true\` if \`s\` can be segmented into a space-separated sequence of one or more dictionary words.

Note that the same word in the dictionary may be reused multiple times in the segmentation.

### Input Format
- First line: The target string \`s\`.
- Second line: An integer \`N\` representing dictionary size.
- Third line: \`N\` space-separated words in \`wordDict\`.

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $1 \\le |s| \\le 300$
- $1 \\le N \\le 1000$
- $1 \\le |wordDict[i]| \\le 20$
- \`s\` and \`wordDict[i]\` consist of only lowercase English letters.
- All the strings of \`wordDict\` are **unique**.
`,
    sampleCases: [
      {
        input: 'leetcode\n2\nleet code',
        output: 'true',
        explanation: '"leetcode" can be segmented as "leet code".',
      },
      {
        input: 'applepenapple\n2\napple pen',
        output: 'true',
        explanation: '"applepenapple" can be segmented as "apple pen apple". Reuse is allowed.',
      },
    ],
    testCases: [
      { input: 'leetcode\n2\nleet code', output: 'true', isSample: true },
      { input: 'applepenapple\n2\napple pen', output: 'true', isSample: true },
      // Hidden Cases (10+)
      { input: 'catsandog\n5\ncats dog sand and cat', output: 'false', isSample: false },
      { input: 'a\n1\na', output: 'true', isSample: false },
      { input: 'a\n1\nb', output: 'false', isSample: false },
      { input: 'cars\n3\ncar ca rs', output: 'true', isSample: false },
      { input: 'bb\n2\na b', output: 'true', isSample: false },
      { input: 'program\n2\npro gram', output: 'true', isSample: false },
      { input: 'goalspecial\n2\ngoal special', output: 'true', isSample: false },
      { input: 'aaaaaaa\n2\naaa aaaa', output: 'true', isSample: false }, // 3 + 4 = 7
      // Stress test: repeated patterns
      { input: 'ab\n2\na b', output: 'true', isSample: false },
      { input: 'cbca\n3\nbc ca cb', output: 'false', isSample: false },
    ],
    editorial: `### Method Explanation
$dp[i]$: boolean indicating whether $s[0..i]$ can be segmented.
Base case: $dp[0] = true$.
For each $i$ from 1 to $N$, check all words $w$ in dictionary: if $s[i - |w| .. i] == w$ and $dp[i - |w|]$ is true, then $dp[i] = true$.
Time: $\\mathcal{O}(|s| \\cdot \\sum |w|)$, Space: $\\mathcal{O}(|s|)$.`,
  },

  // ── 109. LONGEST INCREASING SUBSEQUENCE ─────────────────────────────────────
  {
    problemCode: 'longest-increasing-subsequence',
    name: 'Longest Increasing Subsequence',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\`, return the length of the longest strictly increasing subsequence.

### Input Format
- First line: An integer \`N\` representing array length.
- Second line: \`N\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the length of the LIS.

### Constraints
- $1 \\le N \\le 2500$
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
        explanation: 'LIS is [0, 1, 2, 3] of length 4.',
      },
    ],
    testCases: [
      { input: '8\n10 9 2 5 3 7 101 18', output: '4', isSample: true },
      { input: '6\n0 1 0 3 2 3', output: '4', isSample: true },
      // Hidden Cases (10+)
      { input: '7\n7 7 7 7 7 7 7', output: '1', isSample: false }, // All equal (strictly increasing requirement)
      { input: '1\n42', output: '1', isSample: false }, // N=1
      { input: '5\n5 4 3 2 1', output: '1', isSample: false }, // Strictly decreasing
      { input: '5\n1 2 3 4 5', output: '5', isSample: false }, // Strictly increasing
      { input: '4\n1 3 2 4', output: '3', isSample: false },
      { input: '6\n1 3 6 7 9 4', output: '5', isSample: false },
      { input: '6\n-1 -2 -3 -4 -5 0', output: '2', isSample: false },
      { input: '5\n10 22 9 33 21', output: '3', isSample: false },
      // Stress test: 2500 elements
      { input: `2500\n${rangeString(1, 2500)}`, output: '2500', isSample: false },
      { input: `2500\n${rangeString(2500, 1)}`, output: '1', isSample: false },
    ],
    editorial: `### Method Explanation
Patience Sorting with Binary Search:
Maintain array \`tails\` where \`tails[i]\` is the smallest tail of all increasing subsequences of length $i + 1$.
For each $x$, binary search \`bisect_left\` in \`tails\`. If $x >$ all tails, append; else update.
Time: $\\mathcal{O}(N \\log N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 110. PARTITION EQUAL SUBSET SUM ────────────────────────────────────────
  {
    problemCode: 'partition-equal-subset-sum',
    name: 'Partition Equal Subset Sum',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\`, return \`true\` if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or \`false\` otherwise.

### Input Format
- First line: An integer \`N\` representing array length.
- Second line: \`N\` space-separated integers representing \`nums\`.

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $1 \\le N \\le 200$
- $1 \\le nums[i] \\le 100$
`,
    sampleCases: [
      {
        input: '4\n1 5 11 5',
        output: 'true',
        explanation: 'The array can be partitioned as [1, 5, 5] and [11]. Both sum to 11.',
      },
      {
        input: '4\n1 2 3 5',
        output: 'false',
        explanation: 'Total sum is 11 (odd), so it cannot be divided into two equal integer sums.',
      },
    ],
    testCases: [
      { input: '4\n1 5 11 5', output: 'true', isSample: true },
      { input: '4\n1 2 3 5', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n2', output: 'false', isSample: false }, // Single element cannot partition into 2 subsets
      { input: '2\n2 2', output: 'true', isSample: false },
      { input: '2\n1 2', output: 'false', isSample: false },
      { input: '3\n1 2 3', output: 'true', isSample: false },
      { input: '4\n2 2 2 2', output: 'true', isSample: false },
      { input: '3\n2 2 3', output: 'false', isSample: false },
      { input: '5\n1 2 3 4 5', output: 'false', isSample: false }, // Sum = 15 (odd)
      { input: '6\n1 2 3 4 5 5', output: 'true', isSample: false }, // Sum = 20 (even, half=10)
      { input: '4\n10 20 30 40', output: 'true', isSample: false }, // Sum = 100, 10+40 = 50
      // Stress test: 100 elements
      { input: `100\n${'2 '.repeat(100)}`.trim(), output: 'true', isSample: false },
    ],
    editorial: `### Method Explanation
If total sum is odd, return false immediately.
Target sum is $S = \\text{sum} / 2$.
Reduce to 0/1 Knapsack: Maintain a boolean array \`dp[0..S]\` or bitset.
\`dp |= (dp << num)\`. Return \`dp[S]\`.
Time: $\\mathcal{O}(N \\cdot S)$ where $S \\le 10000$, Space: $\\mathcal{O}(S)$.`,
  },
];
