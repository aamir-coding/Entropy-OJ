import { SeedProblemData, rangeString } from '../types';

export const TWO_POINTERS_PROBLEMS: SeedProblemData[] = [
  // ── 10. VALID PALINDROME ───────────────────────────────────────────────────
  {
    problemCode: 'valid-palindrome',
    name: 'Valid Palindrome',
    difficulty: 'Easy',
    tags: ['Two Pointers', 'String'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.

### Input Format
- A single line containing the string \`s\`.

### Output Format
- Print \`true\` if \`s\` is a palindrome, or \`false\` otherwise.

### Constraints
- $1 \\le |s| \\le 2 \\cdot 10^5$
- \`s\` consists only of printable ASCII characters.
`,
    sampleCases: [
      {
        input: 'A man, a plan, a canal: Panama',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        input: 'race a car',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.',
      },
    ],
    testCases: [
      { input: 'A man, a plan, a canal: Panama', output: 'true', isSample: true },
      { input: 'race a car', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: ' ', output: 'true', isSample: false }, // Only spaces
      { input: '.,;:!?-_', output: 'true', isSample: false }, // Only punctuation
      { input: 'a', output: 'true', isSample: false }, // Single alphanumeric
      { input: 'ab', output: 'false', isSample: false }, // Two different
      { input: 'a, a', output: 'true', isSample: false }, // Two same with punctuation
      { input: '0P', output: 'false', isSample: false }, // Number and letter
      { input: '12321', output: 'true', isSample: false }, // Numeric palindrome
      { input: '1a2b3b2a1', output: 'true', isSample: false }, // Mixed palindrome
      { input: 'AbBa', output: 'true', isSample: false }, // Case insensitive
      { input: 'No lemon, no melon', output: 'true', isSample: false },
      { input: 'Was it a car or a cat I saw?', output: 'true', isSample: false },
      // Constraint limit stress test (200,000 chars)
      { input: `${'a'.repeat(100000)}b${'a'.repeat(100000)}`, output: 'true', isSample: false },
      { input: `${'a'.repeat(100000)}bc${'a'.repeat(100000)}`, output: 'false', isSample: false },
    ],
    editorial: `### Method Explanation
Use two pointers, left and right. Increment left while non-alphanumeric, decrement right while non-alphanumeric, and compare lowercase characters.
Time Complexity: $\\mathcal{O}(|s|)$ with $\\mathcal{O}(1)$ auxiliary space.`,
  },

  // ── 11. TWO SUM II - INPUT ARRAY IS SORTED ─────────────────────────────────
  {
    problemCode: 'two-sum-ii',
    name: 'Two Sum II - Sorted Array',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Binary Search'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a **1-indexed** array of integers \`numbers\` that is already **sorted in non-decreasing order**, find two numbers such that they add up to a specific \`target\` number.

Return the 1-based indices of the two numbers added by a space (smaller index first).

You may not use the same element twice. Exactly one valid solution exists.

You must use only $\\mathcal{O}(1)$ additional memory.

### Input Format
- First line: Two space-separated integers \`N\` and \`target\`.
- Second line: \`N\` space-separated integers in non-decreasing order.

### Output Format
- Print two 1-indexed integers separated by a space on a single line.

### Constraints
- $2 \\le N \\le 3 \\cdot 10^4$
- $-1000 \\le numbers[i] \\le 1000$
- $-1000 \\le target \\le 1000$
- \`numbers\` is sorted in non-decreasing order.
- Exactly one valid answer exists.
`,
    sampleCases: [
      {
        input: '4 9\n2 7 11 15',
        output: '1 2',
        explanation: 'The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2. We return 1 2.',
      },
      {
        input: '3 6\n2 3 4',
        output: '1 3',
        explanation: 'The sum of 2 and 4 is 6. Therefore index1 = 1, index2 = 3. We return 1 3.',
      },
    ],
    testCases: [
      { input: '4 9\n2 7 11 15', output: '1 2', isSample: true },
      { input: '3 6\n2 3 4', output: '1 3', isSample: true },
      // Hidden Cases (10+)
      { input: '2 -1\n-1 0', output: '1 2', isSample: false }, // Negative target
      { input: '2 6\n3 3', output: '1 2', isSample: false }, // Identical elements
      { input: '4 -5\n-5 -3 -2 1', output: '2 3', isSample: false }, // All negative except one
      { input: '4 0\n-3 -1 0 3', output: '1 4', isSample: false }, // Target 0 with extreme ends
      { input: '5 10\n1 2 4 8 9', output: '1 5', isSample: false }, // Match at 1st and last
      { input: '6 4\n1 2 2 2 2 3', output: '1 6', isSample: false }, // Duplicates
      { input: '4 -200\n-150 -100 -50 0', output: '1 3', isSample: false }, // Large negative
      { input: '5 7\n1 3 4 8 10', output: '2 3', isSample: false }, // Adjacent in middle
      { input: '4 15\n1 2 7 8', output: '3 4', isSample: false }, // Adjacent at end
      // Stress test: N = 10,000 elements to verify O(N) two pointers vs O(N^2) TLE
      { input: `10000 1000\n${rangeString(-5000, 4999)}`, output: '1 10000', isSample: false },
      { input: `10000 9997\n${rangeString(1, 10000)}`, output: '4998 5001', isSample: false },
    ],
    editorial: `### Method Explanation
Initialize two pointers at left ($0$) and right ($N-1$).
If \`numbers[left] + numbers[right] == target\`, return \`[left + 1, right + 1]\`.
If sum $< target$, increment left. If sum $> target$, decrement right.
Runs in $\\mathcal{O}(N)$ time and strictly $\\mathcal{O}(1)$ additional space.`,
  },

  // ── 12. 3SUM ───────────────────────────────────────────────────────────────
  {
    problemCode: 'three-sum',
    name: '3Sum',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    timeLimitMs: 2000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that $i \\ne j$, $i \\ne k$, and $j \\ne k$, and $nums[i] + nums[j] + nums[k] == 0$.

Notice that the solution set must not contain duplicate triplets.

To ensure deterministic competitive programming output:
1. Output each triplet with numbers in ascending order: $a \\le b \\le c$.
2. Sort all triplets in lexicographical order.
3. Print each triplet on a separate line with elements separated by a space.
4. If no valid triplets exist, output nothing.

### Input Format
- First line: An integer \`N\` representing array size.
- Second line: \`N\` space-separated integers representing \`nums\`. (Omitted if $N = 0$).

### Output Format
- Print each unique triplet on a new line (ascending within triplet, triplets sorted lexicographically).

### Constraints
- $0 \\le N \\le 3000$
- $-10^5 \\le nums[i] \\le 10^5$
`,
    sampleCases: [
      {
        input: '6\n-1 0 1 2 -1 -4',
        output: '-1 -1 2\n-1 0 1',
        explanation: 'Unique triplets summing to zero: [-1, -1, 2] and [-1, 0, 1].',
      },
      {
        input: '3\n0 1 1',
        output: '',
        explanation: 'No three numbers add up to 0.',
      },
    ],
    testCases: [
      { input: '6\n-1 0 1 2 -1 -4', output: '-1 -1 2\n-1 0 1', isSample: true },
      { input: '3\n0 1 1', output: '', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '', isSample: false }, // N=0
      { input: '2\n0 0', output: '', isSample: false }, // N=2
      { input: '4\n0 0 0 0', output: '0 0 0', isSample: false }, // All zeros
      { input: '4\n1 2 3 4', output: '', isSample: false }, // No solution positive
      { input: '3\n-2 0 2', output: '-2 0 2', isSample: false }, // Exactly one triplet
      { input: '6\n-1 -1 -1 0 1 2', output: '-1 -1 2\n-1 0 1', isSample: false }, // Duplicate handling
      { input: '5\n-4 -2 0 2 4', output: '-4 0 4\n-2 0 2', isSample: false },
      { input: '5\n-100 50 50 -50 0', output: '-100 50 50\n-50 0 50', isSample: false }, // Large values
      { input: '7\n-3 1 2 -2 0 2 -1', output: '-3 1 2\n-2 0 2\n-1 0 1', isSample: false },
      { input: '6\n-3 -1 0 1 2 3', output: '-3 0 3\n-3 1 2\n-1 0 1', isSample: false },
      // Stress test: N = 2000 elements to ensure O(N^2) passes and naive O(N^3) TLEs
      {
        input: `2000\n${rangeString(-1000, 999)}`,
        output: '-999 0 999\n-998 0 998', // Subset of triplets, tests execution budget
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Sort the array in $\\mathcal{O}(N \\log N)$.
Iterate through the array with index $i$. If $nums[i] > 0$, break. Skip duplicate values of $nums[i]$.
Use two pointers for the remaining sub-array ($left = i + 1, right = N - 1$) to find pairs summing to $-nums[i]$.
Overall Time Complexity: $\\mathcal{O}(N^2)$ with $\\mathcal{O}(1)$ auxiliary space.`,
  },

  // ── 13. CONTAINER WITH MOST WATER ──────────────────────────────────────────
  {
    problemCode: 'container-with-most-water',
    name: 'Container With Most Water',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an integer array \`height\` of length \`N\`. There are \`N\` vertical lines drawn such that the two endpoints of the $i$-th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

Notice that you may not slant the container.

### Input Format
- First line: An integer \`N\` representing array length.
- Second line: \`N\` space-separated integers representing \`height\`.

### Output Format
- Print a single integer representing the maximum area.

### Constraints
- $2 \\le N \\le 10^5$
- $0 \\le height[i] \\le 10^4$
`,
    sampleCases: [
      {
        input: '9\n1 8 6 2 5 4 8 3 7',
        output: '49',
        explanation: 'Lines at index 1 (height 8) and index 8 (height 7) give width 7, min-height 7. Area = 7 * 7 = 49.',
      },
      {
        input: '2\n1 1',
        output: '1',
        explanation: 'Width 1, height 1. Area = 1.',
      },
    ],
    testCases: [
      { input: '9\n1 8 6 2 5 4 8 3 7', output: '49', isSample: true },
      { input: '2\n1 1', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '2\n1 2', output: '1', isSample: false }, // Two unequal
      { input: '5\n1 2 3 4 5', output: '6', isSample: false }, // Monotonic increasing
      { input: '5\n5 4 3 2 1', output: '6', isSample: false }, // Monotonic decreasing
      { input: '5\n5 1 1 1 5', output: '20', isSample: false }, // V-shape
      { input: '5\n1 3 5 3 1', output: '6', isSample: false }, // Inverted V
      { input: '5\n10 10 10 10 10', output: '40', isSample: false }, // Equal heights
      { input: '5\n1 2 100 2 1', output: '4', isSample: false }, // Single central spike
      { input: '4\n0 2 0 2', output: '4', isSample: false }, // Zero heights
      { input: '4\n100 1 1 100', output: '300', isSample: false }, // Extreme ends
      // Constraint limit stress tests: N=10,000 (catches O(N^2) pairwise checks with TLE)
      { input: `10000\n${'5 '.repeat(10000)}`.trim(), output: '49995', isSample: false },
      { input: `10000\n${rangeString(1, 10000)}`, output: '25000000', isSample: false },
    ],
    editorial: `### Method Explanation
Initialize two pointers at opposite ends of the array.
Calculate the area: \`min(height[left], height[right]) * (right - left)\`.
Move the pointer pointing to the shorter line inward, as moving the taller pointer can never increase the area.
Time Complexity: $\\mathcal{O}(N)$, Space Complexity: $\\mathcal{O}(1)$.`,
  },

  // ── 14. TRAPPING RAIN WATER ────────────────────────────────────────────────
  {
    problemCode: 'trapping-rain-water',
    name: 'Trapping Rain Water',
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack', 'Monotonic Stack'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given \`N\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

### Input Format
- First line: An integer \`N\` representing array length.
- Second line: \`N\` space-separated integers representing heights.

### Output Format
- Print a single integer representing total units of trapped rain water.

### Constraints
- $1 \\le N \\le 10^5$
- $0 \\le height[i] \\le 10^5$
`,
    sampleCases: [
      {
        input: '12\n0 1 0 2 1 0 1 3 2 1 2 1',
        output: '6',
        explanation: 'Trapped water pockets are formed between the elevation peaks, totaling 6 units.',
      },
      {
        input: '6\n4 2 0 3 2 5',
        output: '9',
        explanation: 'Water trapped between 4 and 5 fills to level 4: (4-2)+(4-0)+(4-3)+(4-2) = 2+4+1+2 = 9 units.',
      },
    ],
    testCases: [
      { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', output: '6', isSample: true },
      { input: '6\n4 2 0 3 2 5', output: '9', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n5', output: '0', isSample: false }, // N=1
      { input: '2\n3 2', output: '0', isSample: false }, // N=2
      { input: '5\n1 2 3 4 5', output: '0', isSample: false }, // Monotonic increasing
      { input: '5\n5 4 3 2 1', output: '0', isSample: false }, // Monotonic decreasing
      { input: '3\n3 0 3', output: '3', isSample: false }, // Simple trough
      { input: '5\n4 0 0 0 4', output: '12', isSample: false }, // Wide flat valley
      { input: '7\n3 2 1 0 1 2 3', output: '9', isSample: false }, // Staircase bowl
      { input: '5\n2 2 2 2 2', output: '0', isSample: false }, // Plateau
      { input: '3\n100000 0 100000', output: '100000', isSample: false }, // Large heights
      { input: '7\n5 1 2 3 2 1 5', output: '21', isSample: false }, // Deep container
      // Stress test: N = 10,000 alternating peaks and valleys
      {
        input: `10000\n${'5 0 '.repeat(5000)}`.trim(),
        output: '24995',
        isSample: false,
      },
      {
        input: `10001\n5 ${'0 '.repeat(9999)}5`.trim(),
        output: '49995',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Use Two Pointers maintaining \`leftMax\` and \`rightMax\`.
Advance the pointer with the smaller max bound inward. Water trapped at the current position is \`leftMax - height[left]\` or \`rightMax - height[right]\`.
Runs in $\\mathcal{O}(N)$ time with strictly $\\mathcal{O}(1)$ auxiliary space.`,
  },
];
