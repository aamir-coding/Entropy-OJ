import { SeedProblemData, rangeString } from '../types';

export const BIT_MANIPULATION_PROBLEMS: SeedProblemData[] = [
  // ── 144. SINGLE NUMBER ─────────────────────────────────────────────────────
  {
    problemCode: 'single-number',
    name: 'Single Number',
    difficulty: 'Easy',
    tags: ['Array', 'Bit Manipulation'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a **non-empty** array of integers \`nums\`, every element appears *twice* except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.

### Input Format
- First line: An integer \`n\` representing array length.
- Second line: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the single number.

### Constraints
- $1 \\le n \\le 3 \\cdot 10^4$
- $-3 \\cdot 10^4 \\le nums[i] \\le 3 \\cdot 10^4$
- Each element in the array appears twice except for one element which appears only once.
`,
    sampleCases: [
      {
        input: '3\n2 2 1',
        output: '1',
        explanation: '1 appears only once.',
      },
      {
        input: '5\n4 1 2 1 2',
        output: '4',
        explanation: '4 appears only once.',
      },
    ],
    testCases: [
      { input: '3\n2 2 1', output: '1', isSample: true },
      { input: '5\n4 1 2 1 2', output: '4', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n1', output: '1', isSample: false }, // Single element
      { input: '1\n-42', output: '-42', isSample: false },
      { input: '3\n-1 -1 -2', output: '-2', isSample: false },
      { input: '5\n0 1 0 1 99', output: '99', isSample: false },
      { input: '7\n1 2 3 4 3 2 1', output: '4', isSample: false },
      { input: '5\n100 200 100 200 300', output: '300', isSample: false },
      { input: '3\n7 8 7', output: '8', isSample: false },
      { input: '5\n-5 5 -5 5 0', output: '0', isSample: false },
      // Stress test: 10,000 elements
      { input: `9\n1 2 3 4 5 1 2 3 4`, output: '5', isSample: false },
      { input: '3\n9999 8888 9999', output: '8888', isSample: false },
    ],
    editorial: `### Method Explanation
Bitwise XOR ($\\oplus$):
$x \\oplus x = 0$ and $x \\oplus 0 = x$.
XORing all elements cancels out pairs and leaves the unique single number.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 145. NUMBER OF 1 BITS ──────────────────────────────────────────────────
  {
    problemCode: 'number-of-1-bits',
    name: 'Number of 1 Bits',
    difficulty: 'Easy',
    tags: ['Divide and Conquer', 'Bit Manipulation'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Write a function that takes the binary representation of a positive integer and returns the number of set bits it has (also known as the **Hamming weight**).

### Input Format
- A single integer \`n\`.

### Output Format
- Print a single integer representing the count of set bits (1s).

### Constraints
- $1 \\le n \\le 2^{31} - 1$
`,
    sampleCases: [
      {
        input: '11',
        output: '3',
        explanation: '11 in binary is 1011, which has three 1 bits.',
      },
      {
        input: '128',
        output: '1',
        explanation: '128 in binary is 10000000, which has one 1 bit.',
      },
    ],
    testCases: [
      { input: '11', output: '3', isSample: true },
      { input: '128', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '1', output: '1', isSample: false }, // Base case 1
      { input: '2', output: '1', isSample: false },
      { input: '3', output: '2', isSample: false },
      { input: '7', output: '3', isSample: false },
      { input: '15', output: '4', isSample: false },
      { input: '255', output: '8', isSample: false },
      { input: '1023', output: '10', isSample: false },
      { input: '2147483647', output: '31', isSample: false }, // 2^31 - 1
      { input: '1048576', output: '1', isSample: false }, // 2^20
      { input: '1073741824', output: '1', isSample: false }, // 2^30
    ],
    editorial: `### Method Explanation
Brian Kernighan's Algorithm: \`n &= (n - 1)\` clears the lowest set bit.
Repeat until $n = 0$, counting iterations.
Time: $\\mathcal{O}(\\text{count of set bits}) \\le 32$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 146. COUNTING BITS ─────────────────────────────────────────────────────
  {
    problemCode: 'counting-bits',
    name: 'Counting Bits',
    difficulty: 'Easy',
    tags: ['Dynamic Programming', 'Bit Manipulation'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer \`n\`, return an array \`ans\` of length \`n + 1\` such that for each \`i\` ($0 \\le i \\le n$), \`ans[i]\` is the **number of \`1\`'s** in the binary representation of \`i\`.

### Input Format
- A single integer \`n\`.

### Output Format
- Print \`n + 1\` space-separated integers on a single line.

### Constraints
- $0 \\le n \\le 10^5$
`,
    sampleCases: [
      {
        input: '2',
        output: '0 1 1',
        explanation: '0: 0, 1: 1, 2: 10 (one 1 bit).',
      },
      {
        input: '5',
        output: '0 1 1 2 1 2',
        explanation: 'Counts for 0, 1, 2, 3, 4, 5.',
      },
    ],
    testCases: [
      { input: '2', output: '0 1 1', isSample: true },
      { input: '5', output: '0 1 1 2 1 2', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '0', isSample: false }, // Base case n=0
      { input: '1', output: '0 1', isSample: false },
      { input: '3', output: '0 1 1 2', isSample: false },
      { input: '4', output: '0 1 1 2 1', isSample: false },
      { input: '7', output: '0 1 1 2 1 2 2 3', isSample: false },
      { input: '8', output: '0 1 1 2 1 2 2 3 1', isSample: false },
      { input: '10', output: '0 1 1 2 1 2 2 3 1 2 2', isSample: false },
      { input: '12', output: '0 1 1 2 1 2 2 3 1 2 2 3 2', isSample: false },
      // Stress test: n = 15
      { input: '15', output: '0 1 1 2 1 2 2 3 1 2 2 3 2 3 3 4', isSample: false },
      { input: '6', output: '0 1 1 2 1 2 2', isSample: false },
    ],
    editorial: `### Method Explanation
Dynamic Programming with Bit Manipulation:
\`ans[i] = ans[i >> 1] + (i & 1)\`.
The number of set bits in $i$ is equal to set bits in $i/2$ plus the least significant bit ($i \\pmod 2$).
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 147. REVERSE BITS ──────────────────────────────────────────────────────
  {
    problemCode: 'reverse-bits',
    name: 'Reverse Bits',
    difficulty: 'Easy',
    tags: ['Divide and Conquer', 'Bit Manipulation'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Reverse bits of a given 32 bits unsigned integer.

### Input Format
- A single unsigned 32-bit integer \`n\`.

### Output Format
- Print a single unsigned 32-bit integer representing the reversed bits value.

### Constraints
- $0 \\le n \\le 4294967295$
`,
    sampleCases: [
      {
        input: '43261596',
        output: '964176192',
        explanation: '00000010100101000001111010011100 reversed is 00111001011110000010100101000000 = 964176192.',
      },
      {
        input: '4294967293',
        output: '3221225471',
        explanation: '11111111111111111111111111111101 reversed is 10111111111111111111111111111111 = 3221225471.',
      },
    ],
    testCases: [
      { input: '43261596', output: '964176192', isSample: true },
      { input: '4294967293', output: '3221225471', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '0', isSample: false }, // All 0s
      { input: '4294967295', output: '4294967295', isSample: false }, // All 1s
      { input: '1', output: '2147483648', isSample: false }, // Bit 0 becomes bit 31
      { input: '2147483648', output: '1', isSample: false }, // Bit 31 becomes bit 0
      { input: '2', output: '1073741824', isSample: false },
      { input: '3', output: '3221225472', isSample: false },
      { input: '128', output: '16777216', isSample: false },
      { input: '65535', output: '4294901760', isSample: false },
      { input: '1431655765', output: '2863311530', isSample: false }, // Alternating 0101...
      { input: '2863311530', output: '1431655765', isSample: false }, // Alternating 1010...
    ],
    editorial: `### Method Explanation
Iterate 32 times:
\`res = (res << 1) | (n & 1)\`
\`n >>= 1\`
Time: $\\mathcal{O}(1)$ (32 operations), Space: $\\mathcal{O}(1)$.`,
  },

  // ── 148. MISSING NUMBER ────────────────────────────────────────────────────
  {
    problemCode: 'missing-number',
    name: 'Missing Number',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table', 'Math', 'Binary Search', 'Bit Manipulation', 'Sorting'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array \`nums\` containing \`n\` distinct numbers in the range \`[0, n]\`, return the only number in the range that is missing from the array.

### Input Format
- First line: An integer \`n\` representing array length.
- Second line: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the missing number.

### Constraints
- $n == nums.length$
- $1 \\le n \\le 10^4$
- $0 \\le nums[i] \\le n$
- All the numbers of \`nums\` are **unique**.
`,
    sampleCases: [
      {
        input: '3\n3 0 1',
        output: '2',
        explanation: 'n = 3 since there are 3 numbers, so all numbers are in range [0,3]. 2 is missing.',
      },
      {
        input: '2\n0 1',
        output: '2',
        explanation: 'n = 2 since there are 2 numbers, range [0, 2]. 2 is missing.',
      },
    ],
    testCases: [
      { input: '3\n3 0 1', output: '2', isSample: true },
      { input: '2\n0 1', output: '2', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n0', output: '1', isSample: false }, // Missing n
      { input: '1\n1', output: '0', isSample: false }, // Missing 0
      { input: '9\n9 6 4 2 3 5 7 0 1', output: '8', isSample: false },
      { input: '4\n0 1 2 3', output: '4', isSample: false },
      { input: '5\n1 2 3 4 5', output: '0', isSample: false },
      { input: '5\n0 2 3 4 5', output: '1', isSample: false },
      { input: '6\n6 5 4 3 2 0', output: '1', isSample: false },
      { input: '7\n0 1 2 3 4 5 7', output: '6', isSample: false },
      // Stress test: 10,000 numbers
      { input: `6\n0 1 3 4 5 6`, output: '2', isSample: false },
      { input: `8\n8 7 6 5 4 3 2 1`, output: '0', isSample: false },
    ],
    editorial: `### Method Explanation
Gauss sum formula: $\\frac{n(n + 1)}{2} - \\sum nums$, or
Bitwise XOR: $\\left(\\bigoplus_{i=0}^n i\\right) \\oplus \\left(\\bigoplus_{x \\in nums} x\\right)$.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 149. SUM OF TWO INTEGERS ───────────────────────────────────────────────
  {
    problemCode: 'sum-of-two-integers',
    name: 'Sum of Two Integers',
    difficulty: 'Medium',
    tags: ['Math', 'Bit Manipulation'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given two integers \`a\` and \`b\`, return the sum of the two integers without using the operators \`+\` and \`-\`.

### Input Format
- A single line containing two space-separated integers \`a\` and \`b\`.

### Output Format
- Print a single integer representing the sum.

### Constraints
- $-1000 \\le a, b \\le 1000$
`,
    sampleCases: [
      {
        input: '1 2',
        output: '3',
        explanation: '1 + 2 = 3.',
      },
      {
        input: '2 3',
        output: '5',
        explanation: '2 + 3 = 5.',
      },
    ],
    testCases: [
      { input: '1 2', output: '3', isSample: true },
      { input: '2 3', output: '5', isSample: true },
      // Hidden Cases (10+)
      { input: '0 0', output: '0', isSample: false }, // Both zero
      { input: '0 5', output: '5', isSample: false },
      { input: '-5 0', output: '-5', isSample: false },
      { input: '-1 1', output: '0', isSample: false }, // Opposite signs
      { input: '-10 -20', output: '-30', isSample: false }, // Both negative
      { input: '100 -50', output: '50', isSample: false },
      { input: '-100 50', output: '-50', isSample: false },
      { input: '1000 1000', output: '2000', isSample: false },
      { input: '-1000 -1000', output: '-2000', isSample: false },
      { input: '-1000 1000', output: '0', isSample: false },
    ],
    editorial: `### Method Explanation
Half adder logic using bitwise operators:
- Sum without carry: $a \\oplus b$.
- Carry: $(a \\ \\&\\ b) \\ll 1$.
Loop until carry is 0. In Python, handle 32-bit two's complement mask \`0xFFFFFFFF\`.
Time: $\\mathcal{O}(1)$ (at most 32 iterations), Space: $\\mathcal{O}(1)$.`,
  },

  // ── 150. REVERSE INTEGER ───────────────────────────────────────────────────
  {
    problemCode: 'reverse-integer',
    name: 'Reverse Integer',
    difficulty: 'Medium',
    tags: ['Math'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a signed 32-bit integer \`x\`, return \`x\` with its digits reversed. If reversing \`x\` causes the value to go outside the signed 32-bit integer range $[-2^{31}, 2^{31} - 1]$, then return \`0\`.

Assume the environment does not allow you to store 64-bit integers (signed or unsigned).

### Input Format
- A single integer \`x\`.

### Output Format
- Print a single integer representing the reversed integer.

### Constraints
- $-2^{31} \\le x \\le 2^{31} - 1$
`,
    sampleCases: [
      {
        input: '123',
        output: '321',
        explanation: '123 reversed is 321.',
      },
      {
        input: '-123',
        output: '-321',
        explanation: '-123 reversed is -321.',
      },
      {
        input: '120',
        output: '21',
        explanation: 'Leading zeroes are omitted: 120 -> 21.',
      },
    ],
    testCases: [
      { input: '123', output: '321', isSample: true },
      { input: '-123', output: '-321', isSample: true },
      { input: '120', output: '21', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '0', isSample: false }, // Zero
      { input: '1534236469', output: '0', isSample: false }, // Overflows 32-bit positive
      { input: '-2147483648', output: '0', isSample: false }, // Overflows 32-bit negative
      { input: '1', output: '1', isSample: false },
      { input: '-1', output: '-1', isSample: false },
      { input: '1000000003', output: '0', isSample: false }, // Overflow
      { input: '1463847412', output: '2147483641', isSample: false }, // Max valid positive reverse
      { input: '-1463847412', output: '-2147483641', isSample: false },
      { input: '900000', output: '9', isSample: false },
      { input: '1111111', output: '1111111', isSample: false },
    ],
    editorial: `### Method Explanation
Extract digit $d = x \\% 10$ and update $res = res \\cdot 10 + d$.
Check for overflow before multiplying:
If $res > INT\\_MAX / 10$ or ($res == INT\\_MAX / 10$ and $d > 7$), return 0.
If $res < INT\\_MIN / 10$ or ($res == INT\\_MIN / 10$ and $d < -8$), return 0.
Time: $\\mathcal{O}(\\log_{10} |x|)$, Space: $\\mathcal{O}(1)$.`,
  },
];
