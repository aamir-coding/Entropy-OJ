import { SeedProblemData } from '../types';

export const MATH_GEOMETRY_PROBLEMS: SeedProblemData[] = [
  // ── 136. ROTATE IMAGE ──────────────────────────────────────────────────────
  {
    problemCode: 'rotate-image',
    name: 'Rotate Image',
    difficulty: 'Medium',
    tags: ['Array', 'Math', 'Matrix'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an \`n x n\` 2D \`matrix\` representing an image, rotate the image by **90 degrees clockwise** in-place.

### Input Format
- First line: An integer \`n\` representing matrix dimensions.
- Next \`n\` lines: \`n\` space-separated integers representing each row.

### Output Format
- Print \`n\` lines representing the rotated matrix.

### Constraints
- $1 \\le n \\le 20$
- $-1000 \\le matrix[i][j] \\le 1000$
`,
    sampleCases: [
      {
        input: '3\n1 2 3\n4 5 6\n7 8 9',
        output: '7 4 1\n8 5 2\n9 6 3',
        explanation: '90-degree clockwise rotation.',
      },
      {
        input: '4\n5 1 9 11\n2 4 8 10\n13 3 6 7\n15 14 12 16',
        output: '15 13 2 5\n14 3 4 1\n12 6 8 9\n16 7 10 11',
        explanation: '4x4 matrix rotation.',
      },
    ],
    testCases: [
      { input: '3\n1 2 3\n4 5 6\n7 8 9', output: '7 4 1\n8 5 2\n9 6 3', isSample: true },
      { input: '4\n5 1 9 11\n2 4 8 10\n13 3 6 7\n15 14 12 16', output: '15 13 2 5\n14 3 4 1\n12 6 8 9\n16 7 10 11', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n1', output: '1', isSample: false }, // 1x1
      { input: '2\n1 2\n3 4', output: '3 1\n4 2', isSample: false }, // 2x2
      { input: '2\n-1 -2\n-3 -4', output: '-3 -1\n-4 -2', isSample: false },
      { input: '3\n0 0 0\n0 0 0\n0 0 0', output: '0 0 0\n0 0 0\n0 0 0', isSample: false },
      { input: '3\n1 0 0\n0 1 0\n0 0 1', output: '0 0 1\n0 1 0\n1 0 0', isSample: false }, // Identity rotated
      { input: '4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16', output: '13 9 5 1\n14 10 6 2\n15 11 7 3\n16 12 8 4', isSample: false },
      { input: '2\n0 1\n2 3', output: '2 0\n3 1', isSample: false },
      { input: '3\n1 2 1\n2 1 2\n1 2 1', output: '1 2 1\n2 1 2\n1 2 1', isSample: false }, // Symmetric
      // Stress test: 5x5
      {
        input: '5\n1 2 3 4 5\n6 7 8 9 10\n11 12 13 14 15\n16 17 18 19 20\n21 22 23 24 25',
        output: '21 16 11 6 1\n22 17 12 7 2\n23 18 13 8 3\n24 19 14 9 4\n25 20 15 10 5',
        isSample: false,
      },
      { input: '1\n-100', output: '-100', isSample: false },
    ],
    editorial: `### Method Explanation
Transpose the matrix (\`swap(matrix[i][j], matrix[j][i])\`), then reverse each row.
This achieves an in-place 90° clockwise rotation.
Time: $\\mathcal{O}(N^2)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 137. SPIRAL MATRIX ─────────────────────────────────────────────────────
  {
    problemCode: 'spiral-matrix',
    name: 'Spiral Matrix',
    difficulty: 'Medium',
    tags: ['Array', 'Matrix', 'Simulation'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an \`m x n\` \`matrix\`, return all elements of the \`matrix\` in **spiral order**.

### Input Format
- First line: Two space-separated integers \`m\` and \`n\`.
- Next \`m\` lines: \`n\` space-separated integers representing each row.

### Output Format
- Print all elements in spiral order space-separated on a single line.

### Constraints
- $1 \\le m, n \\le 10$
- $-100 \\le matrix[i][j] \\le 100$
`,
    sampleCases: [
      {
        input: '3 3\n1 2 3\n4 5 6\n7 8 9',
        output: '1 2 3 6 9 8 7 4 5',
        explanation: 'Spiral traversal from top-left: 1->2->3->6->9->8->7->4->5.',
      },
      {
        input: '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12',
        output: '1 2 3 4 8 12 11 10 9 5 6 7',
        explanation: 'Spiral traversal of 3x4 matrix.',
      },
    ],
    testCases: [
      { input: '3 3\n1 2 3\n4 5 6\n7 8 9', output: '1 2 3 6 9 8 7 4 5', isSample: true },
      { input: '3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12', output: '1 2 3 4 8 12 11 10 9 5 6 7', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1\n42', output: '42', isSample: false }, // 1x1
      { input: '1 4\n1 2 3 4', output: '1 2 3 4', isSample: false }, // 1D row
      { input: '4 1\n1\n2\n3\n4', output: '1 2 3 4', isSample: false }, // 1D col
      { input: '2 2\n1 2\n4 3', output: '1 2 3 4', isSample: false },
      { input: '2 3\n1 2 3\n6 5 4', output: '1 2 3 4 5 6', isSample: false },
      { input: '3 2\n1 2\n6 3\n5 4', output: '1 2 3 4 5 6', isSample: false },
      { input: '4 4\n1 2 3 4\n12 13 14 5\n11 16 15 6\n10 9 8 7', output: '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16', isSample: false },
      { input: '2 4\n1 2 3 4\n8 7 6 5', output: '1 2 3 4 5 6 7 8', isSample: false },
      // Stress test: 4x3
      { input: '4 3\n1 2 3\n10 11 4\n9 12 5\n8 7 6', output: '1 2 3 4 5 6 7 8 9 10 11 12', isSample: false },
      { input: '3 1\n1\n2\n3', output: '1 2 3', isSample: false },
    ],
    editorial: `### Method Explanation
Maintain four boundaries: \`top\`, \`bottom\`, \`left\`, \`right\`.
1. Traverse left to right along \`top\`, \`top++\`.
2. Traverse top to bottom along \`right\`, \`right--\`.
3. Traverse right to left along \`bottom\` (if \`top <= bottom\`), \`bottom--\`.
4. Traverse bottom to top along \`left\` (if \`left <= right\`), \`left++\`.
Time: $\\mathcal{O}(m \\cdot n)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 138. SET MATRIX ZEROES ─────────────────────────────────────────────────
  {
    problemCode: 'set-matrix-zeroes',
    name: 'Set Matrix Zeroes',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Matrix'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an \`m x n\` integer matrix \`matrix\`, if an element is \`0\`, set its entire row and column to \`0\`'s.

You must do it **in place**.

### Input Format
- First line: Two space-separated integers \`m\` and \`n\`.
- Next \`m\` lines: \`n\` space-separated integers representing each row.

### Output Format
- Print \`m\` lines representing the modified matrix.

### Constraints
- $1 \\le m, n \\le 200$
- $-2^{31} \\le matrix[i][j] \\le 2^{31} - 1$
`,
    sampleCases: [
      {
        input: '3 3\n1 1 1\n1 0 1\n1 1 1',
        output: '1 0 1\n0 0 0\n1 0 1',
        explanation: 'Center element 0 causes row 1 and column 1 to become zeroes.',
      },
      {
        input: '3 4\n0 1 2 0\n3 4 5 2\n1 3 1 5',
        output: '0 0 0 0\n0 4 5 0\n0 3 1 0',
        explanation: 'Two zeroes in the top row cause columns 0 and 3 and row 0 to be zeroed.',
      },
    ],
    testCases: [
      { input: '3 3\n1 1 1\n1 0 1\n1 1 1', output: '1 0 1\n0 0 0\n1 0 1', isSample: true },
      { input: '3 4\n0 1 2 0\n3 4 5 2\n1 3 1 5', output: '0 0 0 0\n0 4 5 0\n0 3 1 0', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1\n0', output: '0', isSample: false }, // 1x1 zero
      { input: '1 1\n5', output: '5', isSample: false }, // 1x1 non-zero
      { input: '2 2\n1 0\n0 1', output: '0 0\n0 0', isSample: false },
      { input: '2 2\n1 1\n1 1', output: '1 1\n1 1', isSample: false }, // No zeroes
      { input: '3 3\n0 0 0\n0 0 0\n0 0 0', output: '0 0 0\n0 0 0\n0 0 0', isSample: false }, // All zeroes
      { input: '1 3\n1 0 1', output: '0 0 0', isSample: false },
      { input: '3 1\n1\n0\n1', output: '0\n0\n0', isSample: false },
      { input: '3 3\n1 2 3\n4 0 6\n7 8 9', output: '1 0 3\n0 0 0\n7 0 9', isSample: false },
      // Stress test: 4x4
      {
        input: '4 4\n1 2 3 4\n5 6 7 8\n9 0 11 12\n13 14 15 16',
        output: '1 0 3 4\n5 0 7 8\n0 0 0 0\n13 0 15 16',
        isSample: false,
      },
      { input: '2 3\n1 1 1\n0 1 2', output: '0 1 1\n0 0 0', isSample: false },
    ],
    editorial: `### Method Explanation
Use the first row and first column as markers:
Maintain a boolean \`row_zero\` for whether the first row itself has any zeros.
Use \`matrix[0][c]\` and \`matrix[r][0]\` to record which columns and rows should be zeroed.
Time: $\\mathcal{O}(m \\cdot n)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 139. HAPPY NUMBER ──────────────────────────────────────────────────────
  {
    problemCode: 'happy-number',
    name: 'Happy Number',
    difficulty: 'Easy',
    tags: ['Hash Table', 'Math', 'Two Pointers'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Write an algorithm to determine if a number \`n\` is happy.

A **happy number** is a number defined by the following process:
- Starting with any positive integer, replace the number by the sum of the squares of its digits.
- Repeat the process until the number equals 1 (where it will stay), or it **loops endlessly in a cycle** which does not include 1.
- Those numbers for which this process **ends in 1** are happy.

Return \`true\` if \`n\` is a happy number, and \`false\` if not.

### Input Format
- A single integer \`n\`.

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $1 \\le n \\le 2^{31} - 1$
`,
    sampleCases: [
      {
        input: '19',
        output: 'true',
        explanation: '1^2 + 9^2 = 82 -> 8^2 + 2^2 = 68 -> 6^2 + 8^2 = 100 -> 1^2 + 0^2 + 0^2 = 1.',
      },
      {
        input: '2',
        output: 'false',
        explanation: '2 enters a cycle and never reaches 1.',
      },
    ],
    testCases: [
      { input: '19', output: 'true', isSample: true },
      { input: '2', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '1', output: 'true', isSample: false }, // Base case 1
      { input: '7', output: 'true', isSample: false }, // 7 is happy
      { input: '4', output: 'false', isSample: false }, // Standard cycle starting at 4
      { input: '10', output: 'true', isSample: false },
      { input: '100', output: 'true', isSample: false },
      { input: '1111111', output: 'true', isSample: false },
      { input: '3', output: 'false', isSample: false },
      { input: '28', output: 'true', isSample: false },
      // Large numbers
      { input: '2147483647', output: 'false', isSample: false },
      { input: '68', output: 'true', isSample: false },
    ],
    editorial: `### Method Explanation
Floyd's Tortoise and Hare cycle detection algorithm:
Compute \`slow = next(slow)\` and \`fast = next(next(fast))\`.
If \`fast == 1\`, return true. If \`slow == fast\`, cycle detected -> return false.
Time: $\\mathcal{O}(\\log n)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 140. PLUS ONE ──────────────────────────────────────────────────────────
  {
    problemCode: 'plus-one',
    name: 'Plus One',
    difficulty: 'Easy',
    tags: ['Array', 'Math'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given a **large integer** represented as an integer array \`digits\`, where each \`digits[i]\` is the $i$-th digit of the integer. The digits are ordered from most significant to least significant in left-to-right order. The large integer does not contain any leading \`0\`'s.

Increment the large integer by one and return the resulting array of digits.

### Input Format
- First line: An integer \`n\` representing the number of digits.
- Second line: \`n\` space-separated digits.

### Output Format
- Print the resulting digits separated by a space on a single line.

### Constraints
- $1 \\le n \\le 100$
- $0 \\le digits[i] \\le 9$
- \`digits\` does not contain any leading \`0\`'s.
`,
    sampleCases: [
      {
        input: '3\n1 2 3',
        output: '1 2 4',
        explanation: '123 + 1 = 124.',
      },
      {
        input: '4\n4 3 2 1',
        output: '4 3 2 2',
        explanation: '4321 + 1 = 4322.',
      },
    ],
    testCases: [
      { input: '3\n1 2 3', output: '1 2 4', isSample: true },
      { input: '4\n4 3 2 1', output: '4 3 2 2', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n9', output: '1 0', isSample: false }, // Single digit with carry
      { input: '1\n0', output: '1', isSample: false },
      { input: '3\n9 9 9', output: '1 0 0 0', isSample: false }, // Ripple carry
      { input: '4\n1 9 9 9', output: '2 0 0 0', isSample: false },
      { input: '4\n8 9 9 9', output: '9 0 0 0', isSample: false },
      { input: '5\n1 0 0 0 0', output: '1 0 0 0 1', isSample: false },
      { input: '2\n9 0', output: '9 1', isSample: false },
      { input: '5\n9 9 8 9 9', output: '9 9 9 0 0', isSample: false },
      // Stress test: 10 nines
      { input: `10\n${'9 '.repeat(10)}`.trim(), output: `1 ${'0 '.repeat(10)}`.trim(), isSample: false },
      { input: '2\n1 9', output: '2 0', isSample: false },
    ],
    editorial: `### Method Explanation
Iterate backwards from $n - 1$ to 0:
If $digits[i] < 9$: increment $digits[i]$ and return.
Else set $digits[i] = 0$.
If loop finishes, prepend 1: \`[1] + digits\`.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 141. POW(X, N) ─────────────────────────────────────────────────────────
  {
    problemCode: 'powx-n',
    name: 'Pow(x, n)',
    difficulty: 'Medium',
    tags: ['Math', 'Recursion'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Implement \`pow(x, n)\`, which calculates \`x\` raised to the power \`n\` ($x^n$).

Print the result formatted to **5 decimal places** (e.g. \`1024.00000\`, \`0.25000\`).

### Input Format
- A single line containing a float \`x\` and an integer \`n\`.

### Output Format
- Print the result formatted to 5 decimal places.

### Constraints
- $-100.0 < x < 100.0$
- $-2^{31} \\le n \\le 2^{31}-1$
- $n$ is an integer.
- Either $x$ is not zero, or $n > 0$.
- $-10^4 \\le x^n \\le 10^4$
`,
    sampleCases: [
      {
        input: '2.00000 10',
        output: '1024.00000',
        explanation: '2^10 = 1024.',
      },
      {
        input: '2.10000 3',
        output: '9.26100',
        explanation: '2.1^3 = 9.261.',
      },
    ],
    testCases: [
      { input: '2.00000 10', output: '1024.00000', isSample: true },
      { input: '2.10000 3', output: '9.26100', isSample: true },
      // Hidden Cases (10+)
      { input: '2.00000 -2', output: '0.25000', isSample: false }, // Negative power
      { input: '1.00000 2147483647', output: '1.00000', isSample: false }, // Large positive power
      { input: '1.00000 -2147483648', output: '1.00000', isSample: false }, // Large negative power
      { input: '-1.00000 2', output: '1.00000', isSample: false }, // Even negative base
      { input: '-1.00000 3', output: '-1.00000', isSample: false }, // Odd negative base
      { input: '2.00000 0', output: '1.00000', isSample: false }, // n = 0
      { input: '0.50000 2', output: '0.25000', isSample: false },
      { input: '-2.00000 3', output: '-8.00000', isSample: false },
      { input: '3.00000 5', output: '243.00000', isSample: false },
      { input: '0.00001 2', output: '0.00000', isSample: false },
    ],
    editorial: `### Method Explanation
Binary Exponentiation (Fast Power):
If $n < 0$, set $x = 1/x, n = -n$.
While $n > 0$: if $n$ is odd, multiply result by $x$. Square $x$ ($x = x \\cdot x$) and integer divide $n$ by 2.
Time: $\\mathcal{O}(\\log |n|)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 142. MULTIPLY STRINGS ──────────────────────────────────────────────────
  {
    problemCode: 'multiply-strings',
    name: 'Multiply Strings',
    difficulty: 'Medium',
    tags: ['Math', 'String', 'Simulation'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given two non-negative integers \`num1\` and \`num2\` represented as strings, return the product of \`num1\` and \`num2\`, also represented as a string.

Note: You must not use any built-in BigInteger library or convert the inputs to integer directly.

### Input Format
- A single line containing two space-separated digit strings \`num1\` and \`num2\`.

### Output Format
- Print the product string.

### Constraints
- $1 \\le |num1|, |num2| \\le 200$
- \`num1\` and \`num2\` consist of digits only.
- Both \`num1\` and \`num2\` do not contain any leading zero, except the number \`0\` itself.
`,
    sampleCases: [
      {
        input: '2 3',
        output: '6',
        explanation: '2 * 3 = 6.',
      },
      {
        input: '123 456',
        output: '56088',
        explanation: '123 * 456 = 56088.',
      },
    ],
    testCases: [
      { input: '2 3', output: '6', isSample: true },
      { input: '123 456', output: '56088', isSample: true },
      // Hidden Cases (10+)
      { input: '0 0', output: '0', isSample: false }, // Zero product
      { input: '999 0', output: '0', isSample: false },
      { input: '0 999', output: '0', isSample: false },
      { input: '9 9', output: '81', isSample: false },
      { input: '99 99', output: '9801', isSample: false },
      { input: '10 10', output: '100', isSample: false },
      { input: '12345 6789', output: '83810205', isSample: false },
      { input: '9999 9999', output: '99980001', isSample: false },
      // Stress test: 20 digits
      { input: '123456789 987654321', output: '121932631112635269', isSample: false },
      { input: '1000 1000', output: '1000000', isSample: false },
    ],
    editorial: `### Method Explanation
Schoolbook multiplication simulation:
Allocate an array of size $len(num1) + len(num2)$ initialized to 0.
Multiply digits from right to left: $num1[i] \\times num2[j]$ contributes to indices $i + j$ and $i + j + 1$.
Pass carries through and strip leading zeroes.
Time: $\\mathcal{O}(M \\cdot N)$, Space: $\\mathcal{O}(M + N)$.`,
  },

  // ── 143. DETECT SQUARES ────────────────────────────────────────────────────
  {
    problemCode: 'detect-squares',
    name: 'Detect Squares',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Math', 'Geometry', 'Design'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given a stream of points on the X-Y plane. Design an algorithm that:
- Adds new points from the stream into a data structure. Duplicate points are allowed and should be treated as different points.
- Given a query point, counts the number of ways to choose three points from the data structure such that the three points and the query point form an **axis-aligned square** with **positive area**.

Implement the \`DetectSquares\` operations:
- \`add x y\`: Adds point \`(x, y)\`.
- \`count x y\`: Returns number of squares with query point \`(x, y)\`.

### Input Format
- First line: An integer \`Q\` representing the number of commands.
- Next \`Q\` lines: Each line contains a command (\`add x y\` or \`count x y\`).

### Output Format
- For each \`count\` command, print the integer count on a new line.

### Constraints
- $1 \\le Q \\le 5000$
- $0 \\le x, y \\le 1000$
`,
    sampleCases: [
      {
        input: '6\nadd 3 10\nadd 11 2\nadd 3 2\ncount 11 10\ncount 14 8\nadd 11 2',
        output: '1\n0',
        explanation: 'Query (11, 10) forms a square with (3, 10), (11, 2), and (3, 2).',
      },
      {
        input: '4\nadd 0 0\nadd 0 1\nadd 1 0\ncount 1 1',
        output: '1',
        explanation: 'Unit square with query point (1, 1).',
      },
    ],
    testCases: [
      { input: '6\nadd 3 10\nadd 11 2\nadd 3 2\ncount 11 10\ncount 14 8\nadd 11 2', output: '1\n0', isSample: true },
      { input: '4\nadd 0 0\nadd 0 1\nadd 1 0\ncount 1 1', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '2\nadd 1 1\ncount 1 1', output: '0', isSample: false }, // Area must be positive
      { input: '5\nadd 0 0\nadd 0 2\nadd 2 0\nadd 2 2\ncount 2 2', output: '1', isSample: false },
      { input: '7\nadd 1 1\nadd 1 3\nadd 3 1\nadd 3 3\ncount 1 1\nadd 1 3\ncount 1 1', output: '1\n2', isSample: false }, // Duplicates double count
      { input: '4\nadd 5 5\nadd 5 10\nadd 10 5\ncount 10 10', output: '1', isSample: false },
      { input: '3\nadd 1 2\nadd 3 4\ncount 5 6', output: '0', isSample: false },
      { input: '6\nadd 0 0\nadd 0 4\nadd 4 0\nadd 4 4\ncount 0 0\ncount 4 4', output: '1\n1', isSample: false },
      // Stress test: multiple queries
      {
        input: '8\nadd 1 1\nadd 1 2\nadd 2 1\nadd 2 2\ncount 2 2\ncount 1 1\ncount 1 2\ncount 2 1',
        output: '1\n1\n1\n1',
        isSample: false,
      },
      { input: '4\nadd 10 10\nadd 10 20\nadd 20 10\ncount 20 20', output: '1', isSample: false },
      { input: '4\nadd 1 1\nadd 1 2\nadd 2 1\ncount 2 2', output: '1', isSample: false },
      { input: '3\nadd 0 0\nadd 10 0\ncount 0 10', output: '0', isSample: false },
    ],
    editorial: `### Method Explanation
Store points in a frequency hash map: \`counts[(x, y)] = freq\`.
Keep a list of all added points.
When querying \`(px, py)\`: iterate through all added points \`(x, y)\`.
If $|px - x| == |py - y| > 0$, check if diagonal points \`(x, py)\` and \`(px, y)\` exist in the hash map.
Add \`counts[(x, py)] * counts[(px, y)]\` to total.
Time: $\\mathcal{O}(1)$ for add, $\\mathcal{O}(N)$ for count. Space: $\\mathcal{O}(N)$.`,
  },
];
