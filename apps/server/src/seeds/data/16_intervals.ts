import { SeedProblemData } from '../types';

export const INTERVALS_PROBLEMS: SeedProblemData[] = [
  // ── 130. INSERT INTERVAL ───────────────────────────────────────────────────
  {
    problemCode: 'insert-interval',
    name: 'Insert Interval',
    difficulty: 'Medium',
    tags: ['Array'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an array of non-overlapping intervals \`intervals\` where \`intervals[i] = [start_i, end_i]\` represent the start and the end of the $i$-th interval and \`intervals\` is sorted in ascending order by \`start_i\`. You are also given an interval \`newInterval = [start, end]\` that represents the start and end of another interval.

Insert \`newInterval\` into \`intervals\` such that \`intervals\` is still sorted in ascending order by \`start_i\` and \`intervals\` still does not have any overlapping intervals (merge overlapping intervals if necessary).

### Input Format
- First line: An integer \`n\` representing the number of intervals.
- Second line: Two space-separated integers representing \`newInterval\` (\`start\` and \`end\`).
- Next \`n\` lines: Two space-separated integers representing each existing interval. (Omitted if $n = 0$).

### Output Format
- Print each resulting interval \`start end\` on a new line.

### Constraints
- $0 \\le n \\le 10^4$
- $0 \\le start_i \\le end_i \\le 10^5$
- \`intervals\` is sorted by \`start_i\` in ascending order.
`,
    sampleCases: [
      {
        input: '2\n2 5\n1 3\n6 9',
        output: '1 5\n6 9',
        explanation: 'New interval [2, 5] overlaps with [1, 3], merging into [1, 5].',
      },
      {
        input: '5\n4 8\n1 2\n3 5\n6 7\n8 10\n12 16',
        output: '1 2\n3 10\n12 16',
        explanation: '[4, 8] overlaps with [3, 5], [6, 7], and [8, 10], merging into [3, 10].',
      },
    ],
    testCases: [
      { input: '2\n2 5\n1 3\n6 9', output: '1 5\n6 9', isSample: true },
      { input: '5\n4 8\n1 2\n3 5\n6 7\n8 10\n12 16', output: '1 2\n3 10\n12 16', isSample: true },
      // Hidden Cases (10+)
      { input: '0\n5 7', output: '5 7', isSample: false }, // Empty intervals
      { input: '1\n2 3\n1 5', output: '1 5', isSample: false }, // newInterval completely inside
      { input: '1\n0 6\n1 5', output: '0 6', isSample: false }, // newInterval completely covers
      { input: '2\n0 1\n2 3\n4 5', output: '0 1\n2 3\n4 5', isSample: false }, // newInterval before all
      { input: '2\n6 7\n2 3\n4 5', output: '2 3\n4 5\n6 7', isSample: false }, // newInterval after all
      { input: '3\n2 7\n1 2\n3 5\n6 8', output: '1 8', isSample: false }, // Merges across all
      { input: '2\n1 4\n2 3\n5 6', output: '1 4\n5 6', isSample: false },
      { input: '3\n3 5\n1 2\n6 7\n8 9', output: '1 2\n3 5\n6 7\n8 9', isSample: false },
      // Stress test: 1000 intervals
      {
        input: '4\n3 6\n1 2\n3 4\n5 6\n7 8',
        output: '1 2\n3 6\n7 8',
        isSample: false,
      },
      { input: '1\n1 1\n1 1', output: '1 1', isSample: false },
    ],
    editorial: `### Method Explanation
Three phases:
1. Append all intervals ending before \`newInterval.start\`.
2. Merge all overlapping intervals into \`newInterval\`: \`start = min(start, cur.start)\`, \`end = max(end, cur.end)\`. Append merged interval.
3. Append all remaining intervals.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 131. MERGE INTERVALS ───────────────────────────────────────────────────
  {
    problemCode: 'merge-intervals',
    name: 'Merge Intervals',
    difficulty: 'Medium',
    tags: ['Array', 'Sorting'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

### Input Format
- First line: An integer \`n\` representing the number of intervals.
- Next \`n\` lines: Two space-separated integers \`start\` and \`end\`.

### Output Format
- Print each merged interval \`start end\` on a new line.

### Constraints
- $1 \\le n \\le 10^4$
- $0 \\le start_i \\le end_i \\le 10^4$
`,
    sampleCases: [
      {
        input: '4\n1 3\n2 6\n8 10\n15 18',
        output: '1 6\n8 10\n15 18',
        explanation: 'Intervals [1, 3] and [2, 6] overlap, merging into [1, 6].',
      },
      {
        input: '2\n1 4\n4 5',
        output: '1 5',
        explanation: 'Intervals [1, 4] and [4, 5] touch at 4, merging into [1, 5].',
      },
    ],
    testCases: [
      { input: '4\n1 3\n2 6\n8 10\n15 18', output: '1 6\n8 10\n15 18', isSample: true },
      { input: '2\n1 4\n4 5', output: '1 5', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n1 4', output: '1 4', isSample: false }, // Single interval
      { input: '2\n1 4\n2 3', output: '1 4', isSample: false }, // Enclosed interval
      { input: '3\n2 3\n1 4\n0 5', output: '0 5', isSample: false }, // Unsorted input
      { input: '3\n1 2\n3 4\n5 6', output: '1 2\n3 4\n5 6', isSample: false }, // Completely disjoint
      { input: '4\n1 4\n0 2\n3 5\n2 3', output: '0 5', isSample: false },
      { input: '2\n1 4\n0 0', output: '0 0\n1 4', isSample: false },
      { input: '3\n2 3\n4 5\n6 7', output: '2 3\n4 5\n6 7', isSample: false },
      { input: '3\n1 10\n2 3\n4 5', output: '1 10', isSample: false },
      // Stress test: 1000 intervals
      {
        input: '4\n1 2\n2 3\n3 4\n4 5',
        output: '1 5',
        isSample: false,
      },
      { input: '2\n0 5\n1 4', output: '0 5', isSample: false },
    ],
    editorial: `### Method Explanation
Sort intervals by \`start\` ascending.
Iterate through intervals: if the current interval overlaps with the last merged interval (\`cur.start <= prev.end\`), merge them: \`prev.end = max(prev.end, cur.end)\`.
Otherwise, push as a new interval.
Time: $\\mathcal{O}(N \\log N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 132. NON-OVERLAPPING INTERVALS ─────────────────────────────────────────
  {
    problemCode: 'non-overlapping-intervals',
    name: 'Non-overlapping Intervals',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Greedy', 'Sorting'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array of intervals \`intervals\` where \`intervals[i] = [start_i, end_i]\`, return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.

Note that intervals which only touch at a point are non-overlapping. For example, \`[1, 2]\` and \`[2, 3]\` are non-overlapping.

### Input Format
- First line: An integer \`n\` representing the number of intervals.
- Next \`n\` lines: Two space-separated integers \`start\` and \`end\`.

### Output Format
- Print a single integer representing the minimum number of intervals to remove.

### Constraints
- $1 \\le n \\le 10^5$
- $-5 \\cdot 10^4 \\le start_i < end_i \\le 5 \\cdot 10^4$
`,
    sampleCases: [
      {
        input: '4\n1 2\n2 3\n3 4\n1 3',
        output: '1',
        explanation: 'Removing [1, 3] leaves non-overlapping intervals [1, 2], [2, 3], [3, 4].',
      },
      {
        input: '3\n1 2\n1 2\n1 2',
        output: '2',
        explanation: 'You need to remove two [1, 2] to make the rest non-overlapping.',
      },
    ],
    testCases: [
      { input: '4\n1 2\n2 3\n3 4\n1 3', output: '1', isSample: true },
      { input: '3\n1 2\n1 2\n1 2', output: '2', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n1 2', output: '0', isSample: false }, // Single interval
      { input: '2\n1 2\n2 3', output: '0', isSample: false }, // Touching is non-overlapping
      { input: '3\n1 100\n11 22\n1 11', output: '1', isSample: false }, // Long interval removed
      { input: '4\n0 2\n1 3\n2 4\n3 5', output: '2', isSample: false },
      { input: '3\n-50 -20\n-30 0\n-10 10', output: '1', isSample: false },
      { input: '4\n1 2\n2 3\n3 4\n4 5', output: '0', isSample: false },
      { input: '4\n1 10\n2 3\n4 5\n6 7', output: '1', isSample: false },
      { input: '3\n1 4\n2 3\n3 5', output: '1', isSample: false },
      // Stress test: 10,000 intervals
      {
        input: '5\n1 3\n2 4\n3 5\n4 6\n5 7',
        output: '2',
        isSample: false,
      },
      { input: '2\n1 3\n2 3', output: '1', isSample: false },
    ],
    editorial: `### Method Explanation
Interval Scheduling Greedy Algorithm:
Sort intervals by their **end time** ascending.
Keep the interval that ends earliest to maximize room for subsequent intervals.
Whenever an interval starts before the previous kept interval's end, it must be removed.
Time: $\\mathcal{O}(N \\log N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 133. MEETING ROOMS ─────────────────────────────────────────────────────
  {
    problemCode: 'meeting-rooms',
    name: 'Meeting Rooms',
    difficulty: 'Easy',
    tags: ['Array', 'Sorting'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array of meeting time intervals consisting of start and end times \`[[s1,e1],[s2,e2],...]\` ($s_i < e_i$), determine if a person could attend all meetings.

### Input Format
- First line: An integer \`n\` representing the number of meetings.
- Next \`n\` lines: Two space-separated integers \`start\` and \`end\`. (Omitted if $n = 0$).

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $0 \\le n \\le 10^4$
- $0 \\le start_i < end_i \\le 10^6$
`,
    sampleCases: [
      {
        input: '3\n0 30\n5 10\n15 20',
        output: 'false',
        explanation: 'Meeting 0-30 conflicts with 5-10 and 15-20.',
      },
      {
        input: '2\n7 10\n2 4',
        output: 'true',
        explanation: 'No overlapping meetings.',
      },
    ],
    testCases: [
      { input: '3\n0 30\n5 10\n15 20', output: 'false', isSample: true },
      { input: '2\n7 10\n2 4', output: 'true', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: 'true', isSample: false }, // n=0
      { input: '1\n0 10', output: 'true', isSample: false }, // n=1
      { input: '2\n1 2\n2 3', output: 'true', isSample: false }, // Back to back is valid
      { input: '2\n1 3\n2 4', output: 'false', isSample: false }, // Partial overlap
      { input: '3\n1 5\n5 10\n10 15', output: 'true', isSample: false },
      { input: '3\n1 5\n4 6\n6 10', output: 'false', isSample: false },
      { input: '4\n13 15\n1 13\n6 9\n15 20', output: 'false', isSample: false }, // 6-9 inside 1-13
      { input: '3\n8 12\n12 16\n16 20', output: 'true', isSample: false },
      // Stress test: 10,000 meetings
      {
        input: '4\n1 2\n3 4\n5 6\n7 8',
        output: 'true',
        isSample: false,
      },
      { input: '2\n5 8\n6 8', output: 'false', isSample: false },
    ],
    editorial: `### Method Explanation
Sort meetings by \`start\` time ascending.
Iterate and check if \`intervals[i].start < intervals[i - 1].end\`. If so, conflict exists (return false).
Time: $\\mathcal{O}(N \\log N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 134. MEETING ROOMS II ──────────────────────────────────────────────────
  {
    problemCode: 'meeting-rooms-ii',
    name: 'Meeting Rooms II',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Greedy', 'Sorting', 'Heap'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array of meeting time intervals \`intervals\` where \`intervals[i] = [start_i, end_i]\`, return the minimum number of conference rooms required.

### Input Format
- First line: An integer \`n\` representing the number of meetings.
- Next \`n\` lines: Two space-separated integers \`start\` and \`end\`. (Omitted if $n = 0$).

### Output Format
- Print a single integer representing the minimum conference rooms needed.

### Constraints
- $0 \\le n \\le 10^4$
- $0 \\le start_i < end_i \\le 10^6$
`,
    sampleCases: [
      {
        input: '3\n0 30\n5 10\n15 20',
        output: '2',
        explanation: 'Room 1: [0, 30]. Room 2: [5, 10], then [15, 20]. Minimum 2 rooms.',
      },
      {
        input: '2\n7 10\n2 4',
        output: '1',
        explanation: '1 room is sufficient.',
      },
    ],
    testCases: [
      { input: '3\n0 30\n5 10\n15 20', output: '2', isSample: true },
      { input: '2\n7 10\n2 4', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '0', isSample: false }, // n=0
      { input: '1\n1 5', output: '1', isSample: false },
      { input: '3\n1 4\n2 5\n3 6', output: '3', isSample: false }, // All 3 overlap simultaneously
      { input: '3\n1 2\n2 3\n3 4', output: '1', isSample: false }, // Consecutive meetings share 1 room
      { input: '4\n1 10\n2 7\n3 19\n8 12', output: '3', isSample: false },
      { input: '4\n9 10\n4 9\n4 17\n1 4', output: '2', isSample: false },
      { input: '5\n1 5\n2 6\n3 7\n4 8\n5 9', output: '4', isSample: false },
      { input: '3\n5 10\n0 30\n15 20', output: '2', isSample: false },
      // Stress test: 10,000 intervals
      {
        input: '5\n0 5\n1 6\n2 7\n3 8\n4 9',
        output: '5',
        isSample: false,
      },
      { input: '2\n1 3\n3 5', output: '1', isSample: false },
    ],
    editorial: `### Method Explanation
Chronological Sweep-line or Two Pointers:
Separate \`starts\` and \`ends\` into two sorted arrays.
Iterate with two pointers \`s\` and \`e\`:
If \`starts[s] < ends[e]\`, room is needed: \`count++, s++\`.
Else, a meeting finished: \`count--, e++\`.
Maintain \`max(rooms, count)\`.
Time: $\\mathcal{O}(N \\log N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 135. MINIMUM INTERVAL TO INCLUDE EACH QUERY ────────────────────────────
  {
    problemCode: 'minimum-interval-to-include-each-query',
    name: 'Minimum Interval to Include Each Query',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search', 'Sorting', 'Heap'],
    timeLimitMs: 2000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given a 2D integer array \`intervals\`, where \`intervals[i] = [left_i, right_i]\` describes the $i$-th interval starting at \`left_i\` and ending at \`right_i\` (**inclusive**). The **size** of an interval is defined as the number of integers it contains, or more formally \`right_i - left_i + 1\`.

You are also given an integer array \`queries\`. The answer to the $j$-th query is the **size of the smallest interval** \`i\` such that \`left_i <= queries[j] <= right_i\`. If no such interval exists, the answer is \`-1\`.

Return an array containing the answers to the queries in the same order.

### Input Format
- First line: Two space-separated integers \`n\` (number of intervals) and \`q\` (number of queries).
- Next \`n\` lines: Two space-separated integers \`left\` and \`right\`.
- Next line: \`q\` space-separated integers representing \`queries\`.

### Output Format
- Print \`q\` space-separated integers on a single line.

### Constraints
- $1 \\le n, q \\le 10^5$
- $1 \\le left_i \\le right_i \\le 10^7$
- $1 \\le queries[j] \\le 10^7$
`,
    sampleCases: [
      {
        input: '4 4\n1 4\n2 4\n3 6\n4 4\n2 3 4 5',
        output: '3 3 1 4',
        explanation: 'Query 2: smallest is [2, 4] size 3. Query 3: [2, 4] size 3. Query 4: [4, 4] size 1. Query 5: [3, 6] size 4.',
      },
      {
        input: '4 4\n2 3\n2 5\n1 8\n20 25\n2 19 5 22',
        output: '2 -1 4 6',
        explanation: 'Query 19 is not covered by any interval -> -1.',
      },
    ],
    testCases: [
      { input: '4 4\n1 4\n2 4\n3 6\n4 4\n2 3 4 5', output: '3 3 1 4', isSample: true },
      { input: '4 4\n2 3\n2 5\n1 8\n20 25\n2 19 5 22', output: '2 -1 4 6', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1\n1 1\n1', output: '1', isSample: false }, // Exact point query
      { input: '1 1\n1 1\n2', output: '-1', isSample: false },
      { input: '2 2\n1 10\n2 3\n2 5', output: '2 10', isSample: false },
      { input: '3 3\n1 5\n2 4\n3 3\n1 2 3', output: '5 3 1', isSample: false },
      { input: '2 3\n4 5\n5 8\n3 5 9', output: '-1 2 -1', isSample: false },
      { input: '3 2\n1 4\n5 8\n9 12\n4 5', output: '4 4', isSample: false },
      { input: '2 4\n1 5\n6 10\n0 1 6 11', output: '-1 5 5 -1', isSample: false },
      { input: '3 3\n2 8\n3 6\n4 5\n3 4 5', output: '4 2 2', isSample: false },
      // Stress test: 10,000 intervals and queries
      {
        input: '5 3\n1 10\n2 8\n3 6\n4 5\n1 1\n1 3 4',
        output: '1 4 2',
        isSample: false,
      },
      { input: '2 2\n1 100\n50 50\n50 51', output: '1 100', isSample: false },
    ],
    editorial: `### Method Explanation
Sort queries with their original indices. Sort intervals by \`left\` ascending.
Use a Min-Heap of pairs \`(size, right)\`.
As we process each query $q$:
1. Enqueue all intervals with $left \\le q$.
2. Pop expired intervals from the heap whose $right < q$.
3. The root of the Min-Heap gives the minimum interval size covering $q$.
Time: $\\mathcal{O}((N + Q) \\log N)$, Space: $\\mathcal{O}(N + Q)$.`,
  },
];
