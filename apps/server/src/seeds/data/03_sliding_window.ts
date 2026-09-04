import { SeedProblemData, rangeString } from '../types';

export const SLIDING_WINDOW_PROBLEMS: SeedProblemData[] = [
  // ── 15. BEST TIME TO BUY AND SELL STOCK ────────────────────────────────────
  {
    problemCode: 'best-time-to-buy-and-sell-stock',
    name: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    tags: ['Array', 'Dynamic Programming', 'Sliding Window'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the $i$-th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.

### Input Format
- First line: An integer \`N\` representing the number of days.
- Second line: \`N\` space-separated integers representing \`prices\`.

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
      // Hidden Cases (10+)
      { input: '1\n10', output: '0', isSample: false }, // N=1
      { input: '2\n1 5', output: '4', isSample: false }, // N=2 increasing
      { input: '2\n5 1', output: '0', isSample: false }, // N=2 decreasing
      { input: '4\n3 3 3 3', output: '0', isSample: false }, // All same
      { input: '5\n1 2 3 4 5', output: '4', isSample: false }, // Monotonic increasing
      { input: '6\n2 4 1 7 3 9', output: '8', isSample: false }, // Multiple valleys
      { input: '4\n0 100 0 100', output: '100', isSample: false }, // Zero price
      { input: '5\n10000 0 10000 0 10000', output: '10000', isSample: false },
      { input: '6\n10 1 2 3 4 11', output: '10', isSample: false },
      // Stress tests (catches O(N^2) naive checks)
      { input: `10000\n${rangeString(10000, 1)}`, output: '0', isSample: false },
      { input: `10000\n${rangeString(1, 10000)}`, output: '9999', isSample: false },
    ],
    editorial: `### Method Explanation
Track the minimum price seen so far as you iterate through the array.
At each day, compute potential profit = \`prices[i] - min_price\` and update max profit.
Time Complexity: $\\mathcal{O}(N)$ with $\\mathcal{O}(1)$ space.`,
  },

  // ── 16. LONGEST SUBSTRING WITHOUT REPEATING CHARACTERS ─────────────────────
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
- $0 \\le |s| \\le 5 \\cdot 10^4$
- \`s\` consists of English letters, digits, symbols, and spaces.
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
      // Hidden Cases (10+)
      { input: '', output: '0', isSample: false }, // Empty string
      { input: 'pwwkew', output: '3', isSample: false }, // Substring "wke"
      { input: 'a', output: '1', isSample: false }, // Single char
      { input: 'au', output: '2', isSample: false },
      { input: 'dvdf', output: '3', isSample: false }, // Re-occurring before end
      { input: 'abcdefghijklmnopqrstuvwxyz', output: '26', isSample: false }, // All unique
      { input: 'abba', output: '2', isSample: false }, // Out of window jump test
      { input: 'tmmzuxt', output: '5', isSample: false },
      { input: '   ', output: '1', isSample: false }, // Spaces
      { input: '12345!@#$%12345', output: '10', isSample: false },
      // Stress test: 50,000 chars
      { input: 'abcdefghij'.repeat(5000), output: '10', isSample: false },
    ],
    editorial: `### Method Explanation
Use a sliding window with two pointers or a hash map storing the last seen index of each character.
When character \`s[r]\` has been seen at index \`last[s[r]] >= l\`, move \`l = last[s[r]] + 1\`.
Runs in $\\mathcal{O}(N)$ time and $\\mathcal{O}(\\min(N, \\Sigma))$ space where $\\Sigma$ is alphabet size.`,
  },

  // ── 17. LONGEST REPEATING CHARACTER REPLACEMENT ────────────────────────────
  {
    problemCode: 'longest-repeating-character-replacement',
    name: 'Longest Repeating Character Replacement',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given a string \`s\` and an integer \`k\`. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most \`k\` times.

Return the length of the longest substring containing the same letter you can get after performing the above operations.

### Input Format
- First line: String \`s\` and integer \`k\` separated by a space.

### Output Format
- Print a single integer representing the maximum length possible.

### Constraints
- $1 \\le |s| \\le 10^5$
- $0 \\le k \\le |s|$
- \`s\` consists of only uppercase English letters.
`,
    sampleCases: [
      {
        input: 'ABAB 2',
        output: '4',
        explanation: 'Replace the two \'A\'s with two \'B\'s or vice versa to get "BBBB" or "AAAA".',
      },
      {
        input: 'AABABBA 1',
        output: '4',
        explanation: 'Replace the one \'A\' in the middle with \'B\' to form "AABBBBA" or "AABBBBA". The substring "BBBB" has length 4.',
      },
    ],
    testCases: [
      { input: 'ABAB 2', output: '4', isSample: true },
      { input: 'AABABBA 1', output: '4', isSample: true },
      // Hidden Cases (10+)
      { input: 'A 0', output: '1', isSample: false },
      { input: 'AB 0', output: '1', isSample: false },
      { input: 'AB 1', output: '2', isSample: false },
      { input: 'AAAA 2', output: '4', isSample: false }, // All same
      { input: 'ABCDE 1', output: '2', isSample: false },
      { input: 'BAAA 0', output: '3', isSample: false },
      { input: 'KRSCDCSONK 2', output: '3', isSample: false },
      { input: 'ABBB 2', output: '4', isSample: false },
      { input: 'BAAAB 2', output: '5', isSample: false },
      // Stress test: N = 20,000 chars
      { input: `${'AB'.repeat(10000)} 5`, output: '11', isSample: false },
      { input: `${'A'.repeat(20000)} 0`, output: '20000', isSample: false },
    ],
    editorial: `### Method Explanation
Maintain a sliding window \`[l, r]\` and track character counts.
If \`(window_length - max_frequency) > k\`, shrink the window from the left.
Time Complexity: $\\mathcal{O}(N)$ since the window only expands or shifts right. Space: $\\mathcal{O}(26) = \\mathcal{O}(1)$.`,
  },

  // ── 18. PERMUTATION IN STRING ──────────────────────────────────────────────
  {
    problemCode: 'permutation-in-string',
    name: 'Permutation in String',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Two Pointers', 'String', 'Sliding Window'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given two strings \`s1\` and \`s2\`, return \`true\` if \`s2\` contains a **permutation** of \`s1\`, or \`false\` otherwise.

In other words, return \`true\` if one of \`s1\`'s permutations is the **substring** of \`s2\`.

### Input Format
- First line: String \`s1\`.
- Second line: String \`s2\`.

### Output Format
- Print \`true\` if \`s2\` contains a permutation of \`s1\`, or \`false\` otherwise.

### Constraints
- $1 \\le |s1|, |s2| \\le 10^4$
- \`s1\` and \`s2\` consist of lowercase English letters.
`,
    sampleCases: [
      {
        input: 'ab\neidbaooo',
        output: 'true',
        explanation: 's2 contains one permutation of s1 ("ba").',
      },
      {
        input: 'ab\neidboaoo',
        output: 'false',
        explanation: 'No permutation of "ab" is a contiguous substring of s2.',
      },
    ],
    testCases: [
      { input: 'ab\neidbaooo', output: 'true', isSample: true },
      { input: 'ab\neidboaoo', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: 'a\na', output: 'true', isSample: false },
      { input: 'a\nb', output: 'false', isSample: false },
      { input: 'ab\na', output: 'false', isSample: false }, // s1 longer than s2
      { input: 'adc\ndcda', output: 'true', isSample: false },
      { input: 'hello\nooolleoooleh', output: 'false', isSample: false },
      { input: 'abc\nbbbbca', output: 'true', isSample: false },
      { input: 'prosperity\nproperties', output: 'false', isSample: false },
      { input: 'xyz\nzxy', output: 'true', isSample: false },
      { input: 'aaa\naaaa', output: 'true', isSample: false },
      // Stress test: 10,000 chars
      { input: `ab\n${'c'.repeat(9998)}ba`, output: 'true', isSample: false },
      { input: `ab\n${'c'.repeat(10000)}`, output: 'false', isSample: false },
    ],
    editorial: `### Method Explanation
Use a fixed sliding window of size \`len(s1)\` over \`s2\`.
Compare letter counts in $\\mathcal{O}(1)$ by maintaining a match counter of 26 letters.
Time Complexity: $\\mathcal{O}(|s1| + |s2|)$ with $\\mathcal{O}(26) = \\mathcal{O}(1)$ space.`,
  },

  // ── 19. MINIMUM WINDOW SUBSTRING ───────────────────────────────────────────
  {
    problemCode: 'minimum-window-substring',
    name: 'Minimum Window Substring',
    difficulty: 'Hard',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given two strings \`s\` and \`t\` of lengths \`m\` and \`n\` respectively, return the **minimum window substring** of \`s\` such that every character in \`t\` (**including duplicates**) is included in the window. If there is no such substring, return the empty string \`""\`.

The testcases will be generated such that the answer is **unique**.

### Input Format
- First line: String \`s\`.
- Second line: String \`t\`.

### Output Format
- Print the minimum window substring, or an empty line if none exists.

### Constraints
- $1 \\le |s|, |t| \\le 10^5$
- \`s\` and \`t\` consist of uppercase and lowercase English letters.
`,
    sampleCases: [
      {
        input: 'ADOBECODEBANC\nABC',
        output: 'BANC',
        explanation: 'The minimum window substring "BANC" includes \'A\', \'B\', and \'C\' from string t.',
      },
      {
        input: 'a\na',
        output: 'a',
        explanation: 'The entire string s is the minimum window.',
      },
    ],
    testCases: [
      { input: 'ADOBECODEBANC\nABC', output: 'BANC', isSample: true },
      { input: 'a\na', output: 'a', isSample: true },
      // Hidden Cases (10+)
      { input: 'a\naa', output: '', isSample: false }, // Impossible duplicate requirement
      { input: 'aa\na', output: 'a', isSample: false },
      { input: 'ab\nb', output: 'b', isSample: false },
      { input: 'bdab\nab', output: 'ab', isSample: false },
      { input: 'cabwefgewcwaefgcf\ncae', output: 'cwae', isSample: false },
      { input: 'bba\nab', output: 'ba', isSample: false },
      { input: 'a\nb', output: '', isSample: false },
      { input: 'ADOBECODEBANC\nXYZ', output: '', isSample: false },
      { input: 'AAAAAA\nAA', output: 'AA', isSample: false },
      // Stress test: 10,000 characters
      { input: `${'x'.repeat(5000)}ABC${'x'.repeat(5000)}\nABC`, output: 'ABC', isSample: false },
      { input: `${'a'.repeat(10000)}\n${'a'.repeat(5000)}`, output: 'a'.repeat(5000), isSample: false },
    ],
    editorial: `### Method Explanation
Use a sliding window \`[l, r]\` and maintain counts of characters needed from \`t\`.
Expand \`r\` until all required characters are present. Then shrink \`l\` to find the minimal valid window.
Time Complexity: $\\mathcal{O}(|s| + |t|)$ with $\\mathcal{O}(1)$ auxiliary space (at most 52 letters).`,
  },

  // ── 20. SLIDING WINDOW MAXIMUM ─────────────────────────────────────────────
  {
    problemCode: 'sliding-window-maximum',
    name: 'Sliding Window Maximum',
    difficulty: 'Hard',
    tags: ['Array', 'Queue', 'Sliding Window', 'Heap', 'Monotonic Queue'],
    timeLimitMs: 2000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an array of integers \`nums\`, there is a sliding window of size \`k\` which is moving from the very left of the array to the very right. You can only see the \`k\` numbers in the window. Each time the sliding window moves right by one position.

Return the max sliding window.

### Input Format
- First line: Two integers \`N\` and \`K\` separated by a space.
- Second line: \`N\` space-separated integers representing \`nums\`.

### Output Format
- Print the sliding window maximums separated by a space.

### Constraints
- $1 \\le N \\le 10^5$
- $1 \\le K \\le N$
- $-10^4 \\le nums[i] \\le 10^4$
`,
    sampleCases: [
      {
        input: '8 3\n1 3 -1 -3 5 3 6 7',
        output: '3 3 5 5 6 7',
        explanation: 'Max in windows [1,3,-1]->3, [3,-1,-3]->3, [-1,-3,5]->5, [-3,5,3]->5, [5,3,6]->6, [3,6,7]->7.',
      },
      {
        input: '1 1\n1',
        output: '1',
        explanation: 'Single element window.',
      },
    ],
    testCases: [
      { input: '8 3\n1 3 -1 -3 5 3 6 7', output: '3 3 5 5 6 7', isSample: true },
      { input: '1 1\n1', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '2 1\n1 -1', output: '1 -1', isSample: false }, // K=1
      { input: '4 4\n1 2 3 4', output: '4', isSample: false }, // K=N
      { input: '5 2\n5 4 3 2 1', output: '5 4 3 2', isSample: false }, // Monotonic decreasing
      { input: '5 3\n1 2 3 4 5', output: '3 4 5', isSample: false }, // Monotonic increasing
      { input: '4 2\n-7 -8 7 5', output: '-7 7 7', isSample: false }, // Negatives
      { input: '5 3\n9 9 9 9 9', output: '9 9 9', isSample: false }, // All same
      { input: '6 3\n10 0 10 0 10 0', output: '10 10 10 10', isSample: false },
      { input: '6 4\n1 3 1 2 0 5', output: '3 3 2 5', isSample: false },
      // Stress test: N = 10,000, K = 500 (catches O(N * K) brute force with TLE)
      { input: `10000 500\n${rangeString(1, 10000)}`, output: rangeString(500, 10000), isSample: false },
      { input: `10000 500\n${rangeString(10000, 1)}`, output: rangeString(10000, 501), isSample: false },
    ],
    editorial: `### Method Explanation
Use a Monotonic Deque storing indices of elements in decreasing order of value.
At each step $i$:
1. Remove indices out of window ($< i - k + 1$).
2. Pop from back while \`nums[back] < nums[i]\`.
3. Push index $i$. Front of deque is the window maximum.
Time Complexity: $\\mathcal{O}(N)$ since each index enters and exits the deque at most once.`,
  },
];
