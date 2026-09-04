import { SeedProblemData, rangeString } from '../types';

export const ARRAYS_HASHING_PROBLEMS: SeedProblemData[] = [
  // ── 1. CONTAINS DUPLICATE ──────────────────────────────────────────────────
  {
    problemCode: 'contains-duplicate',
    name: 'Contains Duplicate',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table', 'Sorting'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.

### Input Format
- First line: An integer \`N\` representing the size of the array.
- Second line: \`N\` space-separated integers representing \`nums\`.

### Output Format
- Print \`true\` if any value appears at least twice, or \`false\` otherwise.

### Constraints
- $1 \\le N \\le 10^5$
- $-10^9 \\le nums[i] \\le 10^9$
`,
    sampleCases: [
      {
        input: '4\n1 2 3 1',
        output: 'true',
        explanation: 'The element 1 occurs at index 0 and index 3.',
      },
      {
        input: '4\n1 2 3 4',
        output: 'false',
        explanation: 'All elements in the array are distinct.',
      },
    ],
    testCases: [
      { input: '4\n1 2 3 1', output: 'true', isSample: true },
      { input: '4\n1 2 3 4', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n42', output: 'false', isSample: false }, // Single element
      { input: '2\n1 1', output: 'true', isSample: false }, // Pair duplicate
      { input: '2\n-100 100', output: 'false', isSample: false }, // Negative and positive distinct
      { input: '3\n1000000000 -1000000000 1000000000', output: 'true', isSample: false }, // Extreme values duplicate
      { input: '5\n-5 -2 0 -5 10', output: 'true', isSample: false }, // Negative duplicate
      { input: '6\n7 7 7 7 7 7', output: 'true', isSample: false }, // All identical
      { input: '6\n99 1 2 3 4 99', output: 'true', isSample: false }, // Duplicate at ends
      { input: '5\n1 2 2 3 4', output: 'true', isSample: false }, // Adjacent duplicate
      { input: '4\n0 5 -5 0', output: 'true', isSample: false }, // Zero duplicate
      // Constraint limit / stress tests (catches O(N^2) with TLE)
      { input: `10000\n${rangeString(1, 10000)}`, output: 'false', isSample: false },
      { input: `10001\n${rangeString(1, 10000)} 1`, output: 'true', isSample: false },
    ],
    editorial: `### Method Explanation
An optimal approach uses a Hash Set to track visited numbers in $\\mathcal{O}(N)$ time and $\\mathcal{O}(N)$ space.
Alternatively, sorting takes $\\mathcal{O}(N \\log N)$ time and $\\mathcal{O}(1)$ auxiliary space.
A naive brute-force checking all pairs $\\mathcal{O}(N^2)$ will trigger Time Limit Exceeded on large inputs.`,
  },

  // ── 2. VALID ANAGRAM ───────────────────────────────────────────────────────
  {
    problemCode: 'valid-anagram',
    name: 'Valid Anagram',
    difficulty: 'Easy',
    tags: ['Hash Table', 'String', 'Sorting'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

### Input Format
- First line: String \`s\`.
- Second line: String \`t\`.

### Output Format
- Print \`true\` if \`t\` is an anagram of \`s\`, or \`false\` otherwise.

### Constraints
- $1 \\le |s|, |t| \\le 5 \\cdot 10^4$
- \`s\` and \`t\` consist of lowercase English letters.
`,
    sampleCases: [
      {
        input: 'anagram\nnagaram',
        output: 'true',
        explanation: 'Both words contain three \'a\'s and one of \'n\', \'g\', \'r\', \'m\'.',
      },
      {
        input: 'rat\ncar',
        output: 'false',
        explanation: '\'car\' contains \'c\' which is not in \'rat\'.',
      },
    ],
    testCases: [
      { input: 'anagram\nnagaram', output: 'true', isSample: true },
      { input: 'rat\ncar', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: 'a\na', output: 'true', isSample: false }, // Length 1 identical
      { input: 'a\nb', output: 'false', isSample: false }, // Length 1 different
      { input: 'ab\na', output: 'false', isSample: false }, // Different lengths
      { input: 'a\nab', output: 'false', isSample: false }, // Different lengths
      { input: 'aab\nabb', output: 'false', isSample: false }, // Same distinct chars, different counts
      { input: 'racecar\ncarrace', output: 'true', isSample: false }, // Palindrome anagram
      { input: 'abcdefghijklmnopqrstuvwxyz\nzyxwvutsrqponmlkjihgfedcba', output: 'true', isSample: false }, // Alphabet reverse
      { input: 'aaaaa\naaaaa', output: 'true', isSample: false }, // Repeated chars
      { input: 'aaaaab\naaaaaa', output: 'false', isSample: false }, // Off by one char
      // Large stress tests (50,000 characters)
      { input: `${'abcdefghij'.repeat(5000)}\n${'jihgfedcba'.repeat(5000)}`, output: 'true', isSample: false },
      { input: `${'abcdefghij'.repeat(5000)}\n${'jihgfedcba'.repeat(4999)}jihgfedcbb`, output: 'false', isSample: false },
    ],
    editorial: `### Method Explanation
Count character frequencies using a fixed-size frequency array of 26 letters.
Increment counts for characters in \`s\` and decrement for \`t\`.
Runs in $\\mathcal{O}(|s| + |t|)$ time and $\\mathcal{O}(1)$ space.`,
  },

  // ── 3. TWO SUM ─────────────────────────────────────────────────────────────
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
- $2 \\le N \\le 10^5$
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
      // Hidden Cases (10+)
      { input: '2 6\n3 3', output: '0 1', isSample: false }, // Minimum length N=2 with identical values
      { input: '5 0\n-5 2 3 5 9', output: '0 3', isSample: false }, // Target 0 with negative number
      { input: '6 -10\n-2 -3 -8 4 1 9', output: '0 2', isSample: false }, // Negative target
      { input: '3 0\n0 4 0', output: '0 2', isSample: false }, // Zero values
      { input: '4 2000000000\n1000000000 5 1000000000 8', output: '0 2', isSample: false }, // 32-bit boundary targets
      { input: '5 10\n1 2 3 7 9', output: '2 3', isSample: false }, // Middle match
      { input: '4 100\n10 20 30 70', output: '2 3', isSample: false },
      { input: '6 15\n10 2 8 5 3 7', output: '0 3', isSample: false }, // Unsorted ordering
      { input: '4 -4\n-10 6 2 4', output: '0 1', isSample: false }, // Negative and positive
      // Stress test: N=10,000 to trigger TLE on naive O(N^2) pairwise comparisons
      { input: `10000 1000000001\n${rangeString(1, 9999)} 1000000000`, output: '0 9999', isSample: false },
      { input: `10000 19997\n${rangeString(1, 9998)} 10000 9999`, output: '9996 9998', isSample: false },
    ],
    editorial: `### Method Explanation
Use a Hash Map mapping \`num -> index\`.
As we iterate through the array, check if \`target - num\` exists in the map.
This achieves an optimal $\\mathcal{O}(N)$ time complexity and $\\mathcal{O}(N)$ space complexity.`,
  },

  // ── 4. GROUP ANAGRAMS ──────────────────────────────────────────────────────
  {
    problemCode: 'group-anagrams',
    name: 'Group Anagrams',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'String', 'Sorting'],
    timeLimitMs: 2000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array of strings \`strs\`, group the **anagrams** together.

To ensure deterministic competitive programming output:
1. Sort the words in each individual group in lexicographical (alphabetical) order.
2. Sort all the groups by their first word in lexicographical order.
3. Print each group on a separate line with words separated by a single space.

### Input Format
- First line: An integer \`N\` representing the number of words.
- Next \`N\` lines: Each line contains a string. (If a string is empty, the line may be blank).

### Output Format
- Print each sorted anagram group on a new line.

### Constraints
- $1 \\le N \\le 10^4$
- $0 \\le |strs[i]| \\le 100$
- \`strs[i]\` consists of lowercase English letters.
`,
    sampleCases: [
      {
        input: '6\neat\ntea\ntan\nate\nnat\nbat',
        output: 'ate eat tea\nbat\nnat tan',
        explanation: 'Grouping anagrams: ["ate","eat","tea"], ["bat"], ["nat","tan"].',
      },
      {
        input: '1\na',
        output: 'a',
        explanation: 'Single element forms its own group.',
      },
    ],
    testCases: [
      { input: '6\neat\ntea\ntan\nate\nnat\nbat', output: 'ate eat tea\nbat\nnat tan', isSample: true },
      { input: '1\na', output: 'a', isSample: true },
      // Hidden Cases (10+)
      { input: '4\na\nb\nc\nd', output: 'a\nb\nc\nd', isSample: false }, // All distinct
      { input: '4\nab\nba\nab\nba', output: 'ab ab ba ba', isSample: false }, // All anagrams with duplicates
      { input: '5\na\na\na\nb\nb', output: 'a a a\nb b', isSample: false }, // Single characters
      { input: '4\nlisten\nsilent\nenlist\nstone', output: 'enlist listen silent\nstone', isSample: false },
      { input: '6\nabc\nbca\ncab\ndef\nfed\nefd', output: 'abc bca cab\ndef efd fed', isSample: false },
      { input: '4\naaa\naab\naba\nbaa', output: 'aaa\naab aba baa', isSample: false },
      { input: '4\ncat\ndog\ncat\ndog', output: 'cat cat\ndog dog', isSample: false },
      { input: '3\nstop\npots\ntops', output: 'pots stop tops', isSample: false },
      { input: '5\nloop\npool\npolo\nleaf\nfeal', output: 'feal leaf\nloop polo pool', isSample: false },
      // Large stress test (N = 1000 items)
      {
        input: `6\n${'abc\n'.repeat(3)}${'def\n'.repeat(3)}`.trim(),
        output: 'abc abc abc\ndef def def',
        isSample: false,
      },
      {
        input: '8\nz\ny\nx\nw\nz\ny\nx\nw',
        output: 'w w\nx x\ny y\nz z',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Categorize strings by their sorted character sequence. A hash map maps the sorted signature (e.g. \`"aet"\`) to a list of original words.
Time Complexity: $\\mathcal{O}(N \\cdot K \\log K)$ where $K$ is the maximum string length.`,
  },

  // ── 5. TOP K FREQUENT ELEMENTS ─────────────────────────────────────────────
  {
    problemCode: 'top-k-frequent-elements',
    name: 'Top K Frequent Elements',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Sorting', 'Heap', 'Bucket Sort'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements.

To ensure deterministic competitive programming output:
- Print the \`k\` space-separated elements in **descending order of frequency**.
- If two elements have the same frequency, output the smaller numerical value first.

### Input Format
- First line: Two space-separated integers \`N\` and \`k\`.
- Second line: \`N\` space-separated integers representing \`nums\`.

### Output Format
- Print \`k\` space-separated integers.

### Constraints
- $1 \\le k \\le \\text{number of unique elements} \\le N \\le 10^5$
- $-10^4 \\le nums[i] \\le 10^4$
`,
    sampleCases: [
      {
        input: '6 2\n1 1 1 2 2 3',
        output: '1 2',
        explanation: '1 occurs 3 times, 2 occurs 2 times, and 3 occurs 1 time.',
      },
      {
        input: '1 1\n1',
        output: '1',
        explanation: 'Only one element exists with frequency 1.',
      },
    ],
    testCases: [
      { input: '6 2\n1 1 1 2 2 3', output: '1 2', isSample: true },
      { input: '1 1\n1', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '4 1\n5 5 5 5', output: '5', isSample: false }, // All identical
      { input: '4 3\n4 2 1 3', output: '1 2 3', isSample: false }, // All frequency 1 (sorted numerically)
      { input: '5 2\n-1 -1 -2 -2 -3', output: '-2 -1', isSample: false }, // Negative numbers with tie
      { input: '6 3\n3 3 2 2 1 1', output: '1 2 3', isSample: false }, // Equal frequencies tie-break
      { input: '3 2\n1 2 2', output: '2 1', isSample: false },
      { input: '6 1\n10 20 10 20 10 30', output: '10', isSample: false }, // Highest single
      { input: '7 2\n9 9 9 9 9 1 2', output: '9 1', isSample: false },
      { input: '5 1\n0 0 0 1 2', output: '0', isSample: false }, // Zero values
      { input: '4 2\n10000 10000 -10000 5000', output: '10000 -10000', isSample: false },
      // Limit Stress Case: N=10,000 elements
      { input: `10000 2\n${'7 '.repeat(6000)}${'3 '.repeat(3000)}${'1 '.repeat(1000)}`.trim(), output: '7 3', isSample: false },
      { input: `10000 1\n${rangeString(1, 9999)} 500`, output: '500', isSample: false },
    ],
    editorial: `### Method Explanation
1. Count frequencies using a hash map in $\\mathcal{O}(N)$.
2. Use Bucket Sort or a Min-Heap of size $K$ to extract the top $k$ elements in $\\mathcal{O}(N)$ or $\\mathcal{O}(N \\log K)$ time.`,
  },

  // ── 6. PRODUCT OF ARRAY EXCEPT SELF ────────────────────────────────────────
  {
    problemCode: 'product-of-array-except-self',
    name: 'Product of Array Except Self',
    difficulty: 'Medium',
    tags: ['Array', 'Prefix Sum'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

The product of any prefix or suffix of \`nums\` is **guaranteed** to fit in a **32-bit** integer.

You must write an algorithm that runs in $\\mathcal{O}(N)$ time and **without using the division operation**.

### Input Format
- First line: An integer \`N\` representing array length.
- Second line: \`N\` space-separated integers representing \`nums\`.

### Output Format
- Print \`N\` space-separated integers on a single line.

### Constraints
- $2 \\le N \\le 10^5$
- $-30 \\le nums[i] \\le 30$
`,
    sampleCases: [
      {
        input: '4\n1 2 3 4',
        output: '24 12 8 6',
        explanation: 'At index 0: 2*3*4=24. At index 1: 1*3*4=12. At index 2: 1*2*4=8. At index 3: 1*2*3=6.',
      },
      {
        input: '5\n-1 1 0 -3 3',
        output: '0 0 9 0 0',
        explanation: 'Zero at index 2 zeroes out all products except index 2 where (-1)*1*(-3)*3 = 9.',
      },
    ],
    testCases: [
      { input: '4\n1 2 3 4', output: '24 12 8 6', isSample: true },
      { input: '5\n-1 1 0 -3 3', output: '0 0 9 0 0', isSample: true },
      // Hidden Cases (10+)
      { input: '2\n2 3', output: '3 2', isSample: false }, // Minimum length N=2
      { input: '2\n0 5', output: '5 0', isSample: false }, // Zero and non-zero
      { input: '4\n0 1 2 0', output: '0 0 0 0', isSample: false }, // Multiple zeros
      { input: '4\n-1 -2 -3 -4', output: '-24 -12 -8 -6', isSample: false }, // All negative
      { input: '5\n1 1 1 1 1', output: '1 1 1 1 1', isSample: false }, // All ones
      { input: '4\n1 -1 1 -1', output: '-1 1 -1 1', isSample: false }, // Alternating signs
      { input: '3\n0 2 4', output: '8 0 0', isSample: false }, // Zero at first index
      { input: '3\n2 4 0', output: '0 0 8', isSample: false }, // Zero at last index
      { input: '4\n2 2 2 2', output: '8 8 8 8', isSample: false }, // All identical
      { input: '5\n-2 0 1 0 -2', output: '0 0 0 0 0', isSample: false }, // Two zeros
      // Stress test: N=10,000 to enforce O(N) linear time limit
      {
        input: `10000\n${'1 '.repeat(10000)}`.trim(),
        output: '1 '.repeat(10000).trim(),
        isSample: false,
      },
      {
        input: `10000\n${'1 '.repeat(5000)}${'-1 '.repeat(5000)}`.trim(),
        output: `${'-1 '.repeat(5000)}${'1 '.repeat(5000)}`.trim(),
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Compute prefix products from left to right, then traverse right to left maintaining a running suffix product.
Runs in $\\mathcal{O}(N)$ time with $\\mathcal{O}(1)$ auxiliary space (excluding output array).`,
  },

  // ── 7. VALID SUDOKU ────────────────────────────────────────────────────────
  {
    problemCode: 'valid-sudoku',
    name: 'Valid Sudoku',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Matrix'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Determine if a $9 \\times 9$ Sudoku board is valid. Only the filled cells need to be validated according to the following rules:

1. Each row must contain the digits \`1-9\` without repetition.
2. Each column must contain the digits \`1-9\` without repetition.
3. Each of the nine $3 \\times 3$ sub-boxes of the grid must contain the digits \`1-9\` without repetition.

Empty cells are represented by the character \`'.'\`.

Note: A Sudoku board (partially filled) could be valid but is not necessarily solvable.

### Input Format
- 9 lines, each containing 9 characters representing a row of the board. Characters can be separated by spaces or contiguous.

### Output Format
- Print \`true\` if the board is valid, or \`false\` otherwise.

### Constraints
- Board dimension is strictly $9 \\times 9$.
- Each cell contains a digit \`'1'-'9'\` or \`'.'\`.
`,
    sampleCases: [
      {
        input: `5 3 . . 7 . . . .
6 . . 1 9 5 . . .
. 9 8 . . . . 6 .
8 . . . 6 . . . 3
4 . . 8 . 3 . . 1
7 . . . 2 . . . 6
. 6 . . . . 2 8 .
. . . 4 1 9 . . 5
. . . . 8 . . 7 9`,
        output: 'true',
        explanation: 'All rows, columns, and 3x3 sub-boxes contain valid distinct digits.',
      },
      {
        input: `8 3 . . 7 . . . .
6 . . 1 9 5 . . .
. 9 8 . . . . 6 .
8 . . . 6 . . . 3
4 . . 8 . 3 . . 1
7 . . . 2 . . . 6
. 6 . . . . 2 8 .
. . . 4 1 9 . . 5
. . . . 8 . . 7 9`,
        output: 'false',
        explanation: 'The top-left 3x3 sub-box and the first column both contain two 8s.',
      },
    ],
    testCases: [
      {
        input: `5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9`,
        output: 'true',
        isSample: true,
      },
      {
        input: `8 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9`,
        output: 'false',
        isSample: true,
      },
      // Hidden Cases (10+)
      {
        // All empty board
        input: `. . . . . . . . .\n`.repeat(9).trim(),
        output: 'true',
        isSample: false,
      },
      {
        // Row duplicate in first row
        input: `1 2 3 4 5 6 7 8 1\n${'. . . . . . . . .\n'.repeat(8)}`.trim(),
        output: 'false',
        isSample: false,
      },
      {
        // Column duplicate in last column
        input: `. . . . . . . . 9\n. . . . . . . . 9\n${'. . . . . . . . .\n'.repeat(7)}`.trim(),
        output: 'false',
        isSample: false,
      },
      {
        // Box duplicate without row/col duplicate
        input: `1 . . . . . . . .\n. 1 . . . . . . .\n. . . . . . . . .\n${'. . . . . . . . .\n'.repeat(6)}`.trim(),
        output: 'false',
        isSample: false,
      },
      {
        // Valid full diagonal
        input: `1 . . . . . . . .\n. 2 . . . . . . .\n. . 3 . . . . . .\n. . . 4 . . . . .\n. . . . 5 . . . .\n. . . . . 6 . . .\n. . . . . . 7 . .\n. . . . . . . 8 .\n. . . . . . . . 9`,
        output: 'true',
        isSample: false,
      },
      {
        // Duplicate in last 3x3 box
        input: `${'. . . . . . . . .\n'.repeat(7)}. . . . . . 5 . .\n. . . . . . . 5 .`.trim(),
        output: 'false',
        isSample: false,
      },
      {
        // Valid complete row
        input: `1 2 3 4 5 6 7 8 9\n${'. . . . . . . . .\n'.repeat(8)}`.trim(),
        output: 'true',
        isSample: false,
      },
      {
        // Valid complete column
        input: `1 . . . . . . . .\n2 . . . . . . . .\n3 . . . . . . . .\n4 . . . . . . . .\n5 . . . . . . . .\n6 . . . . . . . .\n7 . . . . . . . .\n8 . . . . . . . .\n9 . . . . . . . .`,
        output: 'true',
        isSample: false,
      },
      {
        // Single digit in every box
        input: `1 . . . . . . . .\n. . . 1 . . . . .\n. . . . . . 1 . .\n. 1 . . . . . . .\n. . . . 1 . . . .\n. . . . . . . 1 .\n. . 1 . . . . . .\n. . . . . 1 . . .\n. . . . . . . . 1`,
        output: 'true',
        isSample: false,
      },
      {
        // Compact string format (no spaces)
        input: `53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79`,
        output: 'true',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Check row, column, and $3 \\times 3$ box uniqueness using boolean arrays or bitmasks.
Sub-box index is computed as \`(r / 3) * 3 + (c / 3)\`.
Runs in $\\mathcal{O}(1)$ time as the board size is fixed at $9 \\times 9 = 81$ cells.`,
  },

  // ── 8. ENCODE AND DECODE STRINGS ───────────────────────────────────────────
  {
    problemCode: 'encode-and-decode-strings',
    name: 'Encode and Decode Strings',
    difficulty: 'Medium',
    tags: ['Array', 'String', 'Design'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Design an algorithm to encode a list of strings to a single string. The encoded string is then sent over the network and decoded back to the original list of strings.

In this judge environment, your program will read \`N\` strings from input, encode them, decode them, and print the exact decoded strings back out.

### Input Format
- First line: An integer \`N\` representing the number of strings.
- Next \`N\` lines: Each line contains one string (may contain spaces, numbers, punctuation, or be empty).

### Output Format
- Print each decoded string on its own line.

### Constraints
- $0 \\le N \\le 200$
- $0 \\le |strs[i]| \\le 200$
- \`strs[i]\` contains printable ASCII characters.
`,
    sampleCases: [
      {
        input: '2\nlint\ncode',
        output: 'lint\ncode',
        explanation: 'The 2 strings ["lint", "code"] are encoded and decoded back successfully.',
      },
      {
        input: '4\nwe\nsay\n:\nyes',
        output: 'we\nsay\n:\nyes',
        explanation: 'Delimiter characters like colons are preserved.',
      },
    ],
    testCases: [
      { input: '2\nlint\ncode', output: 'lint\ncode', isSample: true },
      { input: '4\nwe\nsay\n:\nyes', output: 'we\nsay\n:\nyes', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '', isSample: false }, // N=0 empty list
      { input: '1\nhello world', output: 'hello world', isSample: false }, // String with spaces
      { input: '3\n4#foo\n10#bar\n#', output: '4#foo\n10#bar\n#', isSample: false }, // Delimiter collisions
      { input: '3\n\n\n', output: '\n\n', isSample: false }, // Empty strings
      { input: '3\n123\n456\n789', output: '123\n456\n789', isSample: false }, // Numbers
      { input: '2\n!@#$%^&*()\n[]{}|;:,.<>?/', output: '!@#$%^&*()\n[]{}|;:,.<>?/', isSample: false }, // Symbols
      { input: '2\n5#apple\n6#banana', output: '5#apple\n6#banana', isSample: false },
      { input: '5\na\nb\nc\nd\ne', output: 'a\nb\nc\nd\ne', isSample: false }, // Single characters
      { input: `1\n${'x'.repeat(100)}`, output: 'x'.repeat(100), isSample: false }, // Long string
      { input: '4\nslash/backslash\\\nquote"apostrophe\'\n\ttab\nnewline', output: 'slash/backslash\\\nquote"apostrophe\'\n\ttab\nnewline', isSample: false },
      { input: '5\n1#\n2##\n3###\n4####\n5#####', output: '1#\n2##\n3###\n4####\n5#####', isSample: false },
    ],
    editorial: `### Method Explanation
Prefix each string with its length followed by a delimiter, e.g. \`length + "#" + str\`.
When decoding, read the length digits up to the delimiter \`'#'\`, then read exactly \`length\` characters.
This prevents ambiguity with any character inside the strings. Runs in $\\mathcal{O}(L)$ time where $L$ is total characters.`,
  },

  // ── 9. LONGEST CONSECUTIVE SEQUENCE ────────────────────────────────────────
  {
    problemCode: 'longest-consecutive-sequence',
    name: 'Longest Consecutive Sequence',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Union Find'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an unsorted array of integers \`nums\`, return the length of the longest consecutive elements sequence.

You must write an algorithm that runs in $\\mathcal{O}(N)$ time.

### Input Format
- First line: An integer \`N\` representing array size.
- Second line: \`N\` space-separated integers representing \`nums\`. (Omitted if $N = 0$).

### Output Format
- Print a single integer representing the length of the longest consecutive elements sequence.

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
        explanation: 'The longest consecutive elements sequence is [0, 1, 2, 3, 4, 5, 6, 7, 8]. Length is 9.',
      },
    ],
    testCases: [
      { input: '6\n100 4 200 1 3 2', output: '4', isSample: true },
      { input: '10\n0 3 7 2 5 8 4 6 0 1', output: '9', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '0', isSample: false }, // N=0
      { input: '1\n10', output: '1', isSample: false }, // N=1
      { input: '2\n2 1', output: '2', isSample: false }, // N=2 consecutive
      { input: '2\n1 10', output: '1', isSample: false }, // N=2 non-consecutive
      { input: '5\n1 2 2 3 4', output: '4', isSample: false }, // Duplicates in sequence
      { input: '5\n7 7 7 7 7', output: '1', isSample: false }, // All duplicates
      { input: '6\n-5 -4 -3 0 1 2', output: '3', isSample: false }, // Negatives and positives
      { input: '4\n-1000000000 1000000000 0 1', output: '2', isSample: false }, // Extreme values
      { input: '5\n5 4 3 2 1', output: '5', isSample: false }, // Reverse sorted
      // Limit Stress Tests: N=10,000 (catches O(N^2) or nested loop scans without sequence-start check)
      { input: `10000\n${rangeString(1, 10000)}`, output: '10000', isSample: false },
      { input: `10000\n${rangeString(1, 5000)} ${rangeString(100001, 105000)}`, output: '5000', isSample: false },
    ],
    editorial: `### Method Explanation
Insert all numbers into a Hash Set.
Only attempt to build a sequence from numbers that are the start of a sequence (i.e. \`num - 1\` is NOT in the set).
Each number is visited at most twice, achieving $\\mathcal{O}(N)$ total time complexity.`,
  },
];
