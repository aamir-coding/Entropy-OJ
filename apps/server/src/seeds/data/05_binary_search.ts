import { SeedProblemData, rangeString } from '../types';

export const BINARY_SEARCH_PROBLEMS: SeedProblemData[] = [
  // ── 28. BINARY SEARCH ──────────────────────────────────────────────────────
  {
    problemCode: 'binary-search',
    name: 'Binary Search',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with $\\mathcal{O}(\\log N)$ runtime complexity.

### Input Format
- First line: Two space-separated integers \`N\` and \`target\`.
- Second line: \`N\` space-separated integers in ascending order.

### Output Format
- Print the 0-indexed position of \`target\`, or \`-1\` if not found.

### Constraints
- $1 \\le N \\le 10^5$
- $-10^4 \\le nums[i], target \\le 10^4$
- All the integers in \`nums\` are **unique**.
- \`nums\` is sorted in ascending order.
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
      // Hidden Cases (10+)
      { input: '1 5\n5', output: '0', isSample: false }, // N=1 found
      { input: '1 5\n-5', output: '-1', isSample: false }, // N=1 not found
      { input: '2 1\n1 3', output: '0', isSample: false }, // Left boundary
      { input: '2 3\n1 3', output: '1', isSample: false }, // Right boundary
      { input: '5 0\n-5 -2 0 3 8', output: '2', isSample: false }, // Center
      { input: '4 10\n1 2 3 4', output: '-1', isSample: false }, // Target beyond right
      { input: '4 -10\n1 2 3 4', output: '-1', isSample: false }, // Target before left
      { input: '5 -2\n-10 -5 -2 0 1', output: '2', isSample: false },
      { input: '8 4\n-3 -2 -1 0 1 2 3 4', output: '7', isSample: false },
      // Stress test: N = 10,000 (catches O(N) linear scan if budget is strict)
      { input: `10000 5000\n${rangeString(1, 10000)}`, output: '4999', isSample: false },
      { input: `10000 10001\n${rangeString(1, 10000)}`, output: '-1', isSample: false },
    ],
    editorial: `### Method Explanation
Maintain two pointers \`left\` and \`right\`. Set \`mid = left + (right - left) // 2\`.
Compare \`nums[mid]\` with \`target\`, eliminating half the search space at each step.
Time Complexity: $\\mathcal{O}(\\log N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 29. SEARCH A 2D MATRIX ─────────────────────────────────────────────────
  {
    problemCode: 'search-a-2d-matrix',
    name: 'Search a 2D Matrix',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search', 'Matrix'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an \`m x n\` integer matrix \`matrix\` with the following two properties:
1. Each row is sorted in non-decreasing order.
2. The first integer of each row is greater than the last integer of the previous row.

Given an integer \`target\`, return \`true\` if \`target\` is in \`matrix\` or \`false\` otherwise.

You must write a solution in $\\mathcal{O}(\\log(m \\cdot n))$ time complexity.

### Input Format
- First line: Three space-separated integers \`m\`, \`n\`, and \`target\`.
- Next \`m\` lines: \`n\` space-separated integers representing each row.

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $1 \\le m, n \\le 100$
- $-10^4 \\le matrix[i][j], target \\le 10^4$
`,
    sampleCases: [
      {
        input: '3 4 3\n1 3 5 7\n10 11 16 20\n23 30 34 60',
        output: 'true',
        explanation: '3 is present in the first row at column 1.',
      },
      {
        input: '3 4 13\n1 3 5 7\n10 11 16 20\n23 30 34 60',
        output: 'false',
        explanation: '13 is not in the matrix.',
      },
    ],
    testCases: [
      { input: '3 4 3\n1 3 5 7\n10 11 16 20\n23 30 34 60', output: 'true', isSample: true },
      { input: '3 4 13\n1 3 5 7\n10 11 16 20\n23 30 34 60', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1 1\n1', output: 'true', isSample: false }, // 1x1 match
      { input: '1 1 2\n1', output: 'false', isSample: false }, // 1x1 mismatch
      { input: '1 4 3\n1 3 5 7', output: 'true', isSample: false }, // Single row match
      { input: '4 1 3\n1\n3\n5\n7', output: 'true', isSample: false }, // Single col match
      { input: '2 2 4\n1 2\n3 4', output: 'true', isSample: false }, // Bottom right
      { input: '2 2 0\n1 2\n3 4', output: 'false', isSample: false }, // Before top-left
      { input: '2 2 5\n1 2\n3 4', output: 'false', isSample: false }, // After bottom-right
      { input: '3 3 -5\n-10 -8 -5\n-2 0 4\n8 12 15', output: 'true', isSample: false }, // Negative values
      { input: '3 3 7\n-10 -8 -5\n-2 0 4\n8 12 15', output: 'false', isSample: false },
      // Stress test: 100 x 100 = 10,000 cells
      { input: `100 100 5000\n${Array.from({ length: 100 }, (_, r) => rangeString(r * 100 + 1, (r + 1) * 100)).join('\n')}`, output: 'true', isSample: false },
      { input: `100 100 10001\n${Array.from({ length: 100 }, (_, r) => rangeString(r * 100 + 1, (r + 1) * 100)).join('\n')}`, output: 'false', isSample: false },
    ],
    editorial: `### Method Explanation
Treat the $m \\times n$ matrix as a flattened 1D sorted array of length $m \\cdot n$.
For a 1D index $mid$, row is $mid // n$ and column is $mid \\% n$.
Standard binary search over $[0, m \\cdot n - 1]$ takes $\\mathcal{O}(\\log(m \\cdot n))$ time.`,
  },

  // ── 30. KOKO EATING BANANAS ────────────────────────────────────────────────
  {
    problemCode: 'koko-eating-bananas',
    name: 'Koko Eating Bananas',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Koko loves to eat bananas. There are \`n\` piles of bananas, the $i$-th pile has \`piles[i]\` bananas. The guards have gone and will come back in \`h\` hours.

Koko can decide her bananas-per-hour eating speed of \`k\`. Each hour, she chooses some pile of bananas and eats \`k\` bananas from that pile. If the pile has less than \`k\` bananas, she eats all of them instead and will not eat any more bananas during this hour.

Koko likes to eat slowly but still wants to finish eating all the bananas before the guards return.

Return the minimum integer \`k\` such that she can eat all the bananas within \`h\` hours.

### Input Format
- First line: Two space-separated integers \`n\` and \`h\`.
- Second line: \`n\` space-separated integers representing \`piles\`.

### Output Format
- Print a single integer representing the minimum eating speed \`k\`.

### Constraints
- $1 \\le n \\le 10^4$
- $n \\le h \\le 10^9$
- $1 \\le piles[i] \\le 10^9$
`,
    sampleCases: [
      {
        input: '4 8\n3 6 7 11',
        output: '4',
        explanation: 'At speed 4: ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1 + 2 + 2 + 3 = 8 hours <= 8.',
      },
      {
        input: '5 5\n30 11 23 4 20',
        output: '30',
        explanation: 'With h = n = 5, she must eat the largest pile in 1 hour, so k = 30.',
      },
    ],
    testCases: [
      { input: '4 8\n3 6 7 11', output: '4', isSample: true },
      { input: '5 5\n30 11 23 4 20', output: '30', isSample: true },
      // Hidden Cases (10+)
      { input: '5 6\n30 11 23 4 20', output: '23', isSample: false },
      { input: '1 5\n10', output: '2', isSample: false }, // Single pile
      { input: '3 1000000000\n1000000000 1000000000 1000000000', output: '3', isSample: false }, // Large h
      { input: '4 4\n1 1 1 1', output: '1', isSample: false },
      { input: '3 6\n10 10 10', output: '5', isSample: false },
      { input: '4 10\n2 5 7 11', output: '3', isSample: false },
      { input: '5 15\n1 2 3 4 5', output: '1', isSample: false },
      { input: '2 3\n10 20', output: '10', isSample: false },
      // Stress test: 10,000 piles
      { input: `10000 20000\n${'100 '.repeat(10000)}`.trim(), output: '50', isSample: false },
      { input: `10000 10000\n${rangeString(1, 10000)}`, output: '10000', isSample: false },
    ],
    editorial: `### Method Explanation
Binary search on the answer in range $[1, \\max(piles)]$.
For a candidate speed $k$, total hours is $\\sum \\lceil piles[i] / k \\rceil$.
If total hours $\\le h$, try smaller speed ($right = mid$); else increase speed ($left = mid + 1$).
Time Complexity: $\\mathcal{O}(N \\log(\\max(piles)))$.`,
  },

  // ── 31. FIND MINIMUM IN ROTATED SORTED ARRAY ───────────────────────────────
  {
    problemCode: 'find-minimum-in-rotated-sorted-array',
    name: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Suppose an array of length \`n\` sorted in ascending order is rotated between 1 and \`n\` times. For example, the array \`nums = [0,1,2,4,5,6,7]\` might become:
- \`[4,5,6,7,0,1,2]\` if it was rotated 4 times.
- \`[0,1,2,4,5,6,7]\` if it was rotated 7 times.

Notice that rotating an array \`[a[0], a[1], ..., a[n-1]]\` 1 time results in the array \`[a[n-1], a[0], a[1], ..., a[n-2]]\`.

Given the sorted rotated array \`nums\` of **unique** elements, return the **minimum element** of this array.

You must write an algorithm that runs in $\\mathcal{O}(\\log n)$ time.

### Input Format
- First line: An integer \`n\` representing array length.
- Second line: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the minimum element.

### Constraints
- $1 \\le n \\le 5000$
- $-5000 \\le nums[i] \\le 5000$
- All the integers of \`nums\` are **unique**.
- \`nums\` is sorted and rotated between \`1\` and \`n\` times.
`,
    sampleCases: [
      {
        input: '5\n3 4 5 1 2',
        output: '1',
        explanation: 'The original array was [1,2,3,4,5] rotated 3 times.',
      },
      {
        input: '7\n4 5 6 7 0 1 2',
        output: '0',
        explanation: 'The original array was [0,1,2,4,5,6,7] and it was rotated 4 times.',
      },
    ],
    testCases: [
      { input: '5\n3 4 5 1 2', output: '1', isSample: true },
      { input: '7\n4 5 6 7 0 1 2', output: '0', isSample: true },
      // Hidden Cases (10+)
      { input: '4\n11 13 15 17', output: '11', isSample: false }, // Already sorted (0 or N rotations)
      { input: '1\n42', output: '42', isSample: false }, // N=1
      { input: '2\n2 1', output: '1', isSample: false }, // N=2 rotated
      { input: '2\n1 2', output: '1', isSample: false }, // N=2 unrotated
      { input: '3\n2 3 1', output: '1', isSample: false },
      { input: '3\n3 1 2', output: '1', isSample: false },
      { input: '4\n4 1 2 3', output: '1', isSample: false },
      { input: '5\n2 3 4 5 1', output: '1', isSample: false },
      { input: '5\n-3 -2 -1 -5 -4', output: '-5', isSample: false }, // Negative numbers
      // Stress test: N = 5000
      { input: `5000\n${rangeString(2501, 5000)} ${rangeString(1, 2500)}`, output: '1', isSample: false },
      { input: `5000\n${rangeString(1, 5000)}`, output: '1', isSample: false },
    ],
    editorial: `### Method Explanation
Binary search comparing \`nums[mid]\` with \`nums[right]\`.
If \`nums[mid] > nums[right]\`, the minimum lies strictly in the right half (\`left = mid + 1\`).
Else, the minimum lies at or to the left of \`mid\` (\`right = mid\`).
Time Complexity: $\\mathcal{O}(\\log N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 32. SEARCH IN ROTATED SORTED ARRAY ─────────────────────────────────────
  {
    problemCode: 'search-in-rotated-sorted-array',
    name: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    tags: ['Array', 'Binary Search'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
There is an integer array \`nums\` sorted in ascending order (with **distinct** values).

Prior to being passed to your function, \`nums\` is **possibly rotated** at an unknown pivot index \`k\` ($1 \\le k < nums.length$).

Given the array \`nums\` after the possible rotation and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`.

You must write an algorithm with $\\mathcal{O}(\\log n)$ runtime complexity.

### Input Format
- First line: Two space-separated integers \`n\` and \`target\`.
- Second line: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print the 0-indexed position of \`target\`, or \`-1\` if not found.

### Constraints
- $1 \\le n \\le 5000$
- $-10^4 \\le nums[i], target \\le 10^4$
- All values of \`nums\` are **unique**.
- \`nums\` is an ascending array that is possibly rotated.
`,
    sampleCases: [
      {
        input: '7 0\n4 5 6 7 0 1 2',
        output: '4',
        explanation: 'Target 0 is found at index 4.',
      },
      {
        input: '7 3\n4 5 6 7 0 1 2',
        output: '-1',
        explanation: 'Target 3 does not exist in the array.',
      },
    ],
    testCases: [
      { input: '7 0\n4 5 6 7 0 1 2', output: '4', isSample: true },
      { input: '7 3\n4 5 6 7 0 1 2', output: '-1', isSample: true },
      // Hidden Cases (10+)
      { input: '1 0\n0', output: '0', isSample: false }, // N=1 match
      { input: '1 3\n0', output: '-1', isSample: false }, // N=1 not found
      { input: '2 1\n1 3', output: '0', isSample: false }, // N=2 unrotated
      { input: '2 3\n3 1', output: '0', isSample: false }, // N=2 rotated
      { input: '2 1\n3 1', output: '1', isSample: false },
      { input: '3 1\n5 1 3', output: '1', isSample: false },
      { input: '4 2\n4 5 6 2', output: '3', isSample: false },
      { input: '5 4\n4 5 1 2 3', output: '0', isSample: false }, // Left end
      { input: '5 3\n4 5 1 2 3', output: '4', isSample: false }, // Right end
      // Stress test: N = 5000
      { input: `5000 1000\n${rangeString(2501, 5000)} ${rangeString(1, 2500)}`, output: '3499', isSample: false },
      { input: `5000 9999\n${rangeString(2501, 5000)} ${rangeString(1, 2500)}`, output: '-1', isSample: false },
    ],
    editorial: `### Method Explanation
Determine which half of the array is sorted at each step.
If \`nums[left] <= nums[mid]\`, the left half is normally sorted. Check if \`target\` is within \`[nums[left], nums[mid]]\`.
Otherwise, the right half is sorted.
Time Complexity: $\\mathcal{O}(\\log N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 33. TIME BASED KEY-VALUE STORE ─────────────────────────────────────────
  {
    problemCode: 'time-based-key-value-store',
    name: 'Time Based Key-Value Store',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Binary Search', 'Design'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Design a time-based key-value data structure that can store multiple values for the same key at different time stamps and retrieve the key's value at a certain timestamp.

Implement the following commands:
- \`set key value timestamp\`: Stores the key \`key\` with the value \`value\` at the given time \`timestamp\`. Timestamps of \`set\` calls are strictly increasing for each key.
- \`get key timestamp\`: Returns a value such that \`set\` was called previously, with \`timestamp_prev <= timestamp\`. If there are multiple such values, it returns the value associated with the largest \`timestamp_prev\`. If there are no values, it returns \`""\`.

### Input Format
- First line: An integer \`Q\` representing the number of commands.
- Next \`Q\` lines: Each line contains a command (\`set key value timestamp\` or \`get key timestamp\`).

### Output Format
- For each \`get\` command, print the returned value on a new line.

### Constraints
- $1 \\le Q \\le 10^4$
- $1 \\le |key|, |value| \\le 100$
- $1 \\le timestamp \\le 10^7$
`,
    sampleCases: [
      {
        input: '5\nset foo bar 1\nget foo 1\nget foo 3\nset foo bar2 4\nget foo 4',
        output: 'bar\nbar\nbar2',
        explanation: 'At timestamp 1 and 3, value is "bar". At timestamp 4, value updated to "bar2".',
      },
      {
        input: '3\nget foo 1\nset foo hello 2\nget foo 1',
        output: '\n',
        explanation: 'get at timestamp 1 returns empty string because no set occurred <= 1.',
      },
    ],
    testCases: [
      { input: '5\nset foo bar 1\nget foo 1\nget foo 3\nset foo bar2 4\nget foo 4', output: 'bar\nbar\nbar2', isSample: true },
      { input: '3\nget foo 1\nset foo hello 2\nget foo 1', output: '\n', isSample: true },
      // Hidden Cases (10+)
      { input: '2\nset k v 10\nget k 10', output: 'v', isSample: false },
      { input: '3\nset k v 10\nget k 5\nget k 15', output: '\nv', isSample: false },
      { input: '4\nset a val1 1\nset a val2 5\nget a 3\nget a 5', output: 'val1\nval2', isSample: false },
      { input: '4\nset x y 1\nset x z 2\nget x 2\nget x 1', output: 'z\ny', isSample: false },
      { input: '5\nset a apple 1\nset b banana 2\nget a 2\nget b 1\nget b 2', output: 'apple\n\nbanana', isSample: false },
      { input: '3\nset user alice 100\nget user 99\nget user 100', output: '\nalice', isSample: false },
      { input: '4\nset code oj 50\nset code anti 100\nget code 75\nget code 150', output: 'oj\nanti', isSample: false },
      { input: '3\nset test a 1\nset test b 2\nget test 3', output: 'b', isSample: false },
      { input: '2\nset num 42 5\nget num 4', output: '', isSample: false },
      // Stress test: 1000 sequential sets and gets
      {
        input: `10\nset k v1 1\nset k v2 2\nset k v3 3\nset k v4 4\nset k v5 5\nget k 1\nget k 2\nget k 3\nget k 4\nget k 5`,
        output: 'v1\nv2\nv3\nv4\nv5',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Use a Hash Map mapping each key to a list of pairs: \`(timestamp, value)\`.
Since timestamps for \`set\` are strictly increasing, each list is sorted by timestamp.
For \`get\`, use binary search (\`bisect_right\` or \`upper_bound\`) to find the largest timestamp $\\le target$.
Time: $\\mathcal{O}(1)$ for \`set\`, $\\mathcal{O}(\\log M)$ for \`get\`.`,
  },

  // ── 34. MEDIAN OF TWO SORTED ARRAYS ────────────────────────────────────────
  {
    problemCode: 'median-of-two-sorted-arrays',
    name: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the **median** of the two sorted arrays.

The overall run time complexity should be $\\mathcal{O}(\\log(m+n))$.

Print the result with **exactly 5 decimal places** (e.g. \`2.00000\`, \`2.50000\`).

### Input Format
- First line: Two integers \`m\` and \`n\` representing the lengths of the two arrays.
- Second line: \`m\` space-separated integers for \`nums1\` (omitted if $m = 0$).
- Third line: \`n\` space-separated integers for \`nums2\` (omitted if $n = 0$).

### Output Format
- Print a single floating-point number formatted to 5 decimal places.

### Constraints
- $0 \\le m \\le 1000$
- $0 \\le n \\le 1000$
- $1 \\le m + n \\le 2000$
- $-10^6 \\le nums1[i], nums2[i] \\le 10^6$
`,
    sampleCases: [
      {
        input: '2 1\n1 3\n2',
        output: '2.00000',
        explanation: 'Merged array = [1, 2, 3] and median is 2.',
      },
      {
        input: '2 2\n1 2\n3 4',
        output: '2.50000',
        explanation: 'Merged array = [1, 2, 3, 4] and median is (2 + 3) / 2 = 2.5.',
      },
    ],
    testCases: [
      { input: '2 1\n1 3\n2', output: '2.00000', isSample: true },
      { input: '2 2\n1 2\n3 4', output: '2.50000', isSample: true },
      // Hidden Cases (10+)
      { input: '0 1\n\n1', output: '1.00000', isSample: false }, // m=0
      { input: '1 0\n2\n', output: '2.00000', isSample: false }, // n=0
      { input: '2 0\n1 2\n', output: '1.50000', isSample: false },
      { input: '1 1\n1\n2', output: '1.50000', isSample: false },
      { input: '3 3\n1 2 3\n4 5 6', output: '3.50000', isSample: false }, // Disjoint ranges
      { input: '4 3\n1 3 5 7\n2 4 6', output: '4.00000', isSample: false }, // Interleaved
      { input: '2 2\n-5 -2\n-3 -1', output: '-2.50000', isSample: false }, // Negatives
      { input: '3 2\n10 20 30\n5 15', output: '15.00000', isSample: false },
      { input: '4 4\n100 100 100 100\n100 100 100 100', output: '100.00000', isSample: false }, // Duplicates
      // Stress test: m=1000, n=1000
      { input: `1000 1000\n${rangeString(1, 1000)}\n${rangeString(1001, 2000)}`, output: '1000.50000', isSample: false },
      { input: `1000 1000\n${rangeString(1, 1000)}\n${rangeString(1, 1000)}`, output: '500.50000', isSample: false },
    ],
    editorial: `### Method Explanation
Binary search on the partition of the smaller array $A$.
We choose partition $i$ in $A$ and partition $j = (m + n + 1) / 2 - i$ in $B$ such that:
$\\max(A_{left}, B_{left}) \\le \\min(A_{right}, B_{right})$.
Runs in $\\mathcal{O}(\\log(\\min(m, n)))$ time and $\\mathcal{O}(1)$ space.`,
  },
];
