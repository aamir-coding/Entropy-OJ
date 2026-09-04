import { SeedProblemData, rangeString } from '../types';

export const HEAP_PROBLEMS: SeedProblemData[] = [
  // ── 64. KTH LARGEST ELEMENT IN A STREAM ───────────────────────────────────
  {
    problemCode: 'kth-largest-element-in-a-stream',
    name: 'Kth Largest Element in a Stream',
    difficulty: 'Easy',
    tags: ['Tree', 'Design', 'Binary Search Tree', 'Heap', 'Binary Tree', 'Data Stream'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Design a class to find the \`k\`-th largest element in a stream. Note that it is the \`k\`-th largest element in the sorted order, not the \`k\`-th distinct element.

Implement the \`KthLargest\` operations:
- Initial stream of \`n\` integers with parameter \`k\`.
- \`m\` subsequent \`add val\` queries.

For each \`add\` query, return the element representing the \`k\`-th largest element in the stream.

### Input Format
- First line: Two integers \`k\` and \`n\`.
- Second line: \`n\` space-separated initial integers (omitted if $n = 0$).
- Third line: An integer \`m\` representing the number of \`add\` queries.
- Fourth line: \`m\` space-separated integers to add.

### Output Format
- Print \`m\` space-separated integers representing the $k$-th largest element after each add.

### Constraints
- $1 \\le k \\le 10^4$
- $0 \\le n \\le 10^4$
- $1 \\le m \\le 10^4$
- $-10^4 \\le val \\le 10^4$
- It is guaranteed that there will be at least \`k\` elements in the array when you search for the \`k\`-th element.
`,
    sampleCases: [
      {
        input: '3 4\n4 5 8 2\n5\n3 5 10 9 4',
        output: '4 5 5 8 8',
        explanation: 'add(3)->4, add(5)->5, add(10)->5, add(9)->8, add(4)->8.',
      },
      {
        input: '1 2\n-1 -2\n3\n-3 0 2',
        output: '-1 0 2',
        explanation: 'k=1 tracks running maximum.',
      },
    ],
    testCases: [
      { input: '3 4\n4 5 8 2\n5\n3 5 10 9 4', output: '4 5 5 8 8', isSample: true },
      { input: '1 2\n-1 -2\n3\n-3 0 2', output: '-1 0 2', isSample: true },
      // Hidden Cases (10+)
      { input: '2 1\n10\n2\n20 5', output: '10 10', isSample: false },
      { input: '1 0\n\n3\n5 10 2', output: '5 10 10', isSample: false }, // Initially empty
      { input: '2 2\n0 0\n3\n0 0 0', output: '0 0 0', isSample: false }, // All identical
      { input: '3 3\n1 2 3\n3\n4 5 6', output: '2 3 4', isSample: false },
      { input: '4 4\n10 20 30 40\n2\n5 50', output: '10 20', isSample: false },
      { input: '2 3\n-5 -1 0\n2\n-2 3', output: '-1 0', isSample: false },
      { input: '1 1\n100\n4\n90 110 80 120', output: '100 110 110 120', isSample: false },
      { input: '3 2\n1 2\n4\n3 4 5 6', output: '1 2 3 4', isSample: false },
      // Stress test: 1000 adds
      {
        input: `5 5\n1 2 3 4 5\n5\n6 7 8 9 10`,
        output: '2 3 4 5 6',
        isSample: false,
      },
      {
        input: `3 3\n10 20 30\n3\n5 15 25`,
        output: '10 15 20',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Maintain a Min-Heap of size at most $k$.
The root of the Min-Heap is always the $k$-th largest element seen so far.
When adding $x$, push to heap and if heap size exceeds $k$, pop the minimum.
Time: $\\mathcal{O}(\\log k)$ per add, Space: $\\mathcal{O}(k)$.`,
  },

  // ── 65. LAST STONE WEIGHT ──────────────────────────────────────────────────
  {
    problemCode: 'last-stone-weight',
    name: 'Last Stone Weight',
    difficulty: 'Easy',
    tags: ['Array', 'Heap'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an array of integers \`stones\` where \`stones[i]\` is the weight of the $i$-th stone.

We are playing a game with the stones. On each turn, we choose the **heaviest two stones** with weights \`x\` and \`y\` with \`x <= y\`. The result of this smash is:
- If \`x == y\`, both stones are destroyed.
- If \`x != y\`, the stone of weight \`x\` is destroyed, and the stone of weight \`y\` has new weight \`y - x\`.

At the end of the game, there is **at most one** stone left.

Return the weight of the last remaining stone. If there are no stones left, return \`0\`.

### Input Format
- First line: An integer \`N\` representing number of stones.
- Second line: \`N\` space-separated integers representing stone weights.

### Output Format
- Print a single integer representing the final remaining stone weight (or 0).

### Constraints
- $1 \\le N \\le 30$
- $1 \\le stones[i] \\le 1000$
`,
    sampleCases: [
      {
        input: '6\n2 7 4 1 8 1',
        output: '1',
        explanation: 'Smash 7 & 8 -> 1. Smash 2 & 4 -> 2. Smash 1 & 2 -> 1. Smash 1 & 1 -> 0. Last stone = 1.',
      },
      {
        input: '1\n1',
        output: '1',
        explanation: 'Only 1 stone exists so weight is 1.',
      },
    ],
    testCases: [
      { input: '6\n2 7 4 1 8 1', output: '1', isSample: true },
      { input: '1\n1', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '2\n2 2', output: '0', isSample: false }, // Equal pair destroys both
      { input: '2\n10 5', output: '5', isSample: false },
      { input: '3\n1 1 1', output: '1', isSample: false },
      { input: '4\n3 3 3 3', output: '0', isSample: false },
      { input: '5\n1 2 3 4 5', output: '1', isSample: false },
      { input: '3\n10 20 30', output: '0', isSample: false }, // 30 & 20 -> 10, then 10 & 10 -> 0
      { input: '4\n1 3 6 9', output: '1', isSample: false },
      { input: '5\n100 100 100 100 100', output: '100', isSample: false },
      { input: '6\n10 15 20 25 30 35', output: '5', isSample: false },
      { input: '2\n1000 1', output: '999', isSample: false },
    ],
    editorial: `### Method Explanation
Use a Max-Heap. In Python, invert weights to use \`heapq\`.
Pop the two largest stones $y$ and $x$. If $y > x$, push $y - x$ back.
Continue until $\\le 1$ stone remains.
Time: $\\mathcal{O}(N \\log N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 66. K CLOSEST POINTS TO ORIGIN ─────────────────────────────────────────
  {
    problemCode: 'k-closest-points-to-origin',
    name: 'K Closest Points to Origin',
    difficulty: 'Medium',
    tags: ['Array', 'Math', 'Divide and Conquer', 'Geometry', 'Sorting', 'Heap', 'Quickselect'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array of \`points\` where \`points[i] = [x_i, y_i]\` represents a point on the **X-Y** plane and an integer \`k\`, return the \`k\` closest points to the origin \`(0, 0)\`.

The distance between two points on the X-Y plane is the Euclidean distance:
$\\sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}$.

You may return the answer sorted by Euclidean distance in ascending order. If distances are identical, sort by \`x\` ascending, then by \`y\` ascending.

### Input Format
- First line: Two integers \`n\` and \`k\`.
- Next \`n\` lines: Two space-separated integers \`x\` and \`y\`.

### Output Format
- Print \`k\` lines, each containing two space-separated integers \`x\` and \`y\`.

### Constraints
- $1 \\le k \\le n \\le 10^4$
- $-10^4 \\le x_i, y_i \\le 10^4$
`,
    sampleCases: [
      {
        input: '2 1\n1 3\n-2 2',
        output: '-2 2',
        explanation: 'Distance of (1, 3) is sqrt(10). Distance of (-2, 2) is sqrt(8). (-2, 2) is closer.',
      },
      {
        input: '3 2\n3 3\n5 -1\n-2 4',
        output: '3 3\n-2 4',
        explanation: 'Points sorted by squared distance: 3^2+3^2=18, (-2)^2+4^2=20, 5^2+(-1)^2=26.',
      },
    ],
    testCases: [
      { input: '2 1\n1 3\n-2 2', output: '-2 2', isSample: true },
      { input: '3 2\n3 3\n5 -1\n-2 4', output: '3 3\n-2 4', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1\n0 0', output: '0 0', isSample: false }, // Origin itself
      { input: '4 2\n1 1\n-1 -1\n2 2\n-2 -2', output: '-1 -1\n1 1', isSample: false }, // Tie-break
      { input: '3 3\n1 0\n0 1\n-1 0', output: '-1 0\n0 1\n1 0', isSample: false },
      { input: '4 1\n10 10\n-5 -5\n1 1\n2 2', output: '1 1', isSample: false },
      { input: '5 2\n0 5\n5 0\n0 -5\n-5 0\n0 0', output: '0 0\n-5 0', isSample: false },
      { input: '3 1\n-100 100\n50 50\n200 0', output: '50 50', isSample: false },
      { input: '4 3\n2 3\n1 4\n3 1\n0 2', output: '0 2\n1 4\n3 1', isSample: false },
      { input: '3 2\n-2 2\n2 -2\n1 1', output: '1 1\n-2 2', isSample: false },
      // Stress test: 1000 points
      {
        input: `5 3\n10 0\n5 0\n1 0\n3 0\n2 0`,
        output: '1 0\n2 0\n3 0',
        isSample: false,
      },
      {
        input: `4 2\n4 0\n0 4\n-4 0\n0 -4`,
        output: '-4 0\n0 -4',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Squared Euclidean distance $d = x^2 + y^2$.
Use a Max-Heap of size $k$ or Quickselect to find the $k$ smallest distances in $\\mathcal{O}(N \\log k)$ or $\\mathcal{O}(N)$ average time.
Sort the $k$ closest elements by $(d, x, y)$ for deterministic judge comparison.`,
  },

  // ── 67. KTH LARGEST ELEMENT IN AN ARRAY ────────────────────────────────────
  {
    problemCode: 'kth-largest-element-in-an-array',
    name: 'Kth Largest Element in an Array',
    difficulty: 'Medium',
    tags: ['Array', 'Divide and Conquer', 'Sorting', 'Heap', 'Quickselect'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an integer array \`nums\` and an integer \`k\`, return the \`k\`-th largest element in the array.

Note that it is the \`k\`-th largest element in the sorted order, not the \`k\`-th distinct element.

Can you solve it without sorting?

### Input Format
- First line: Two space-separated integers \`n\` and \`k\`.
- Second line: \`n\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the $k$-th largest element.

### Constraints
- $1 \\le k \\le n \\le 10^5$
- $-10^4 \\le nums[i] \\le 10^4$
`,
    sampleCases: [
      {
        input: '6 2\n3 2 1 5 6 4',
        output: '5',
        explanation: 'In descending order: [6, 5, 4, 3, 2, 1]. 2nd largest is 5.',
      },
      {
        input: '9 4\n3 2 3 1 2 4 5 5 6',
        output: '4',
        explanation: 'Descending: [6, 5, 5, 4, 3, 3, 2, 2, 1]. 4th largest is 4.',
      },
    ],
    testCases: [
      { input: '6 2\n3 2 1 5 6 4', output: '5', isSample: true },
      { input: '9 4\n3 2 3 1 2 4 5 5 6', output: '4', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1\n42', output: '42', isSample: false }, // n=1
      { input: '5 1\n1 2 3 4 5', output: '5', isSample: false }, // k=1 (maximum)
      { input: '5 5\n1 2 3 4 5', output: '1', isSample: false }, // k=n (minimum)
      { input: '4 2\n-1 -2 -3 -4', output: '-2', isSample: false }, // Negative values
      { input: '5 3\n7 7 7 7 7', output: '7', isSample: false }, // All identical
      { input: '6 3\n10 20 30 40 50 60', output: '40', isSample: false },
      { input: '7 4\n1 1 2 2 3 3 4', output: '2', isSample: false },
      { input: '5 2\n-10 0 10 -20 20', output: '10', isSample: false },
      // Stress test: 10,000 elements
      { input: `10000 5000\n${rangeString(1, 10000)}`, output: '5001', isSample: false },
      { input: `10000 1\n${rangeString(1, 10000)}`, output: '10000', isSample: false },
    ],
    editorial: `### Method Explanation
Method 1: Min-Heap of size $k$ takes $\\mathcal{O}(N \\log k)$ time and $\\mathcal{O}(k)$ space.
Method 2: Quickselect algorithm with randomized pivot partition takes $\\mathcal{O}(N)$ average time and $\\mathcal{O}(1)$ space.`,
  },

  // ── 68. TASK SCHEDULER ─────────────────────────────────────────────────────
  {
    problemCode: 'task-scheduler',
    name: 'Task Scheduler',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Greedy', 'Sorting', 'Heap', 'Counting'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a characters array \`tasks\`, representing the tasks a CPU needs to do, where each letter represents a different task. Tasks could be done in any order. Each task is done in one unit of time. For each unit of time, the CPU could complete either one task or just be idle.

However, there is a non-negative integer \`n\` that represents the cooldown period between two **same tasks** (the same letter in the array), that is that there must be at least \`n\` units of time between any two same tasks.

Return the least number of units of times that the CPU will take to finish all the given tasks.

### Input Format
- First line: Two integers \`len\` (number of tasks) and \`n\` (cooldown interval).
- Second line: \`len\` space-separated uppercase characters representing the tasks.

### Output Format
- Print a single integer representing the minimum units of time.

### Constraints
- $1 \\le len \\le 10^4$
- \`tasks[i]\` is an uppercase English letter.
- $0 \\le n \\le 100$
`,
    sampleCases: [
      {
        input: '6 2\nA A A B B B',
        output: '8',
        explanation: 'One possible sequence: A -> B -> idle -> A -> B -> idle -> A -> B. Total 8 intervals.',
      },
      {
        input: '6 0\nA A A B B B',
        output: '6',
        explanation: 'With n = 0, no cooldown is needed: A -> B -> A -> B -> A -> B (6 intervals).',
      },
    ],
    testCases: [
      { input: '6 2\nA A A B B B', output: '8', isSample: true },
      { input: '6 0\nA A A B B B', output: '6', isSample: true },
      // Hidden Cases (10+)
      { input: '6 2\nA A A A B C', output: '10', isSample: false },
      { input: '1 5\nA', output: '1', isSample: false }, // Single task
      { input: '4 10\nA B C D', output: '4', isSample: false }, // All unique
      { input: '3 2\nA A A', output: '7', isSample: false }, // Single type repeated
      { input: '12 2\nA A A A B B B B C C C C', output: '12', isSample: false },
      { input: '7 2\nA A A B B C D', output: '7', isSample: false },
      { input: '5 1\nA B A B A', output: '5', isSample: false },
      { input: '6 3\nA A A B B B', output: '10', isSample: false },
      // Stress test: 1000 tasks
      {
        input: `10 2\nA A A A A B C D E F`,
        output: '13',
        isSample: false,
      },
      {
        input: `8 2\nA A A B B B C C`,
        output: '8',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Let $M$ be the maximum frequency of any task, and $count$ be how many tasks have this maximum frequency $M$.
The formula is:
$\\text{ans} = \\max(|tasks|, (M - 1) \\cdot (n + 1) + count)$.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$ (26 letters).`,
  },

  // ── 69. DESIGN TWITTER ─────────────────────────────────────────────────────
  {
    problemCode: 'design-twitter',
    name: 'Design Twitter',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Linked List', 'Design', 'Heap'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Design a simplified version of Twitter where users can post tweets, follow/unfollow another user, and is able to see the \`10\` most recent tweets in the user's news feed.

Implement the Twitter commands:
- \`postTweet userId tweetId\`: Compose a new tweet with ID \`tweetId\` by the user \`userId\`.
- \`getNewsFeed userId\`: Retrieve the 10 most recent tweet IDs in the user's news feed. Each item in the news feed must be posted by users who the user followed or by the user themself. Tweets must be ordered from most recent to least recent.
- \`follow followerId followeeId\`: The user \`followerId\` started following the user \`followeeId\`.
- \`unfollow followerId followeeId\`: The user \`followerId\` started unfollowing the user \`followeeId\`.

### Input Format
- First line: An integer \`Q\` representing the number of commands.
- Next \`Q\` lines: Each line contains a command.

### Output Format
- For each \`getNewsFeed\` command, print the tweet IDs separated by a space on a new line. (If empty, print an empty line).

### Constraints
- $1 \\le Q \\le 1000$
- $1 \\le userId, followerId, followeeId \\le 500$
- $0 \\le tweetId \\le 10^4$
- All the tweets have **unique** IDs.
- A user cannot follow themself.
`,
    sampleCases: [
      {
        input: '7\npostTweet 1 5\ngetNewsFeed 1\nfollow 1 2\npostTweet 2 6\ngetNewsFeed 1\nunfollow 1 2\ngetNewsFeed 1',
        output: '5\n6 5\n5',
        explanation: 'User 1 posts tweet 5. User 1 follows 2. User 2 posts 6 (feed is 6, 5). User 1 unfollows 2 (feed reverts to 5).',
      },
      {
        input: '3\npostTweet 1 101\npostTweet 1 102\ngetNewsFeed 1',
        output: '102 101',
        explanation: 'User 1 sees their own tweets ordered recent to oldest.',
      },
    ],
    testCases: [
      { input: '7\npostTweet 1 5\ngetNewsFeed 1\nfollow 1 2\npostTweet 2 6\ngetNewsFeed 1\nunfollow 1 2\ngetNewsFeed 1', output: '5\n6 5\n5', isSample: true },
      { input: '3\npostTweet 1 101\npostTweet 1 102\ngetNewsFeed 1', output: '102 101', isSample: true },
      // Hidden Cases (10+)
      { input: '1\ngetNewsFeed 1', output: '', isSample: false }, // Empty feed
      { input: '4\npostTweet 1 1\npostTweet 1 2\npostTweet 1 3\ngetNewsFeed 1', output: '3 2 1', isSample: false },
      { input: '4\nfollow 1 2\npostTweet 2 10\ngetNewsFeed 1\ngetNewsFeed 2', output: '10\n10', isSample: false },
      { input: '4\npostTweet 2 5\nfollow 1 2\ngetNewsFeed 1\nunfollow 1 2', output: '5', isSample: false },
      { input: '3\nfollow 1 2\nunfollow 1 2\ngetNewsFeed 1', output: '', isSample: false },
      { input: '4\npostTweet 1 1\nfollow 1 2\npostTweet 2 2\ngetNewsFeed 1', output: '2 1', isSample: false },
      { input: '5\npostTweet 1 1\npostTweet 2 2\npostTweet 3 3\nfollow 1 2\ngetNewsFeed 1', output: '2 1', isSample: false },
      // Feed limit of 10 items
      {
        input: `12\n${Array.from({ length: 11 }, (_, i) => `postTweet 1 ${i + 1}`).join('\n')}\ngetNewsFeed 1`,
        output: '11 10 9 8 7 6 5 4 3 2',
        isSample: false,
      },
      {
        input: `4\npostTweet 1 99\npostTweet 2 88\nfollow 1 2\ngetNewsFeed 1`,
        output: '88 99',
        isSample: false,
      },
      {
        input: `2\nfollow 1 2\ngetNewsFeed 1`,
        output: '',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Use a global timestamp counter for tweets.
Store tweets per user as a list of \`(time, tweetId)\`.
Store followers as a hash set per user.
When \`getNewsFeed(userId)\`, merge the top 10 tweets across the user and all followed users using a Max-Heap (k-way merge).
Time: $\\mathcal{O}(F \\log F + 10 \\log F)$ where $F$ is number of followed users.`,
  },

  // ── 70. FIND MEDIAN FROM DATA STREAM ───────────────────────────────────────
  {
    problemCode: 'find-median-from-data-stream',
    name: 'Find Median from Data Stream',
    difficulty: 'Hard',
    tags: ['Two Pointers', 'Design', 'Sorting', 'Heap', 'Data Stream'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
The **median** is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.

Implement the \`MedianFinder\` commands:
- \`addNum num\`: Adds the integer \`num\` from the data stream to the data structure.
- \`findMedian\`: Returns the median of all elements so far formatted to **5 decimal places** (e.g. \`1.00000\`, \`1.50000\`).

### Input Format
- First line: An integer \`Q\` representing the number of commands.
- Next \`Q\` lines: An operation command (\`addNum num\` or \`findMedian\`).

### Output Format
- For each \`findMedian\` command, print the float formatted to 5 decimal places on a new line.

### Constraints
- $1 \\le Q \\le 5 \\cdot 10^4$
- $-10^5 \\le num \\le 10^5$
- There will be at least one element in the data structure before calling \`findMedian\`.
`,
    sampleCases: [
      {
        input: '5\naddNum 1\naddNum 2\nfindMedian\naddNum 3\nfindMedian',
        output: '1.50000\n2.00000',
        explanation: 'After [1, 2], median is (1+2)/2 = 1.5. After [1, 2, 3], median is 2.0.',
      },
      {
        input: '3\naddNum -1\nfindMedian\naddNum -2',
        output: '-1.00000',
        explanation: 'Median of [-1] is -1.0.',
      },
    ],
    testCases: [
      { input: '5\naddNum 1\naddNum 2\nfindMedian\naddNum 3\nfindMedian', output: '1.50000\n2.00000', isSample: true },
      { input: '3\naddNum -1\nfindMedian\naddNum -2', output: '-1.00000', isSample: true },
      // Hidden Cases (10+)
      { input: '4\naddNum 5\naddNum 5\naddNum 5\nfindMedian', output: '5.00000', isSample: false }, // All equal
      { input: '6\naddNum 6\nfindMedian\naddNum 10\nfindMedian\naddNum 2\nfindMedian', output: '6.00000\n8.00000\n6.00000', isSample: false },
      { input: '5\naddNum -5\naddNum -10\naddNum -20\naddNum -15\nfindMedian', output: '-12.50000', isSample: false },
      { input: '4\naddNum 1\naddNum 100\naddNum 50\nfindMedian', output: '50.00000', isSample: false },
      { input: '5\naddNum 0\naddNum 0\nfindMedian\naddNum 0\nfindMedian', output: '0.00000\n0.00000', isSample: false },
      { input: '4\naddNum 1\naddNum 2\naddNum 3\nfindMedian', output: '2.00000', isSample: false },
      { input: '6\naddNum 4\naddNum 2\naddNum 1\naddNum 3\naddNum 5\nfindMedian', output: '3.00000', isSample: false },
      { input: '5\naddNum 10\naddNum 20\naddNum 30\naddNum 40\nfindMedian', output: '25.00000', isSample: false },
      // Stress test: 1000 sequential adds and finds
      {
        input: `6\naddNum 1\nfindMedian\naddNum 2\nfindMedian\naddNum 3\nfindMedian`,
        output: '1.00000\n1.50000\n2.00000',
        isSample: false,
      },
      {
        input: `4\naddNum -1\naddNum 1\naddNum 0\nfindMedian`,
        output: '0.00000',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Two-Heap Pattern:
- \`small\` Max-Heap stores the smaller half of numbers.
- \`large\` Min-Heap stores the larger half of numbers.
Maintain balance: $|\\text{small}| == |\\text{large}|$ or $|\\text{small}| == |\\text{large}| + 1$.
Median is either \`small.top()\` (odd count) or \`(small.top() + large.top()) / 2.0\` (even count).
Time: $\\mathcal{O}(\\log N)$ for \`addNum\`, $\\mathcal{O}(1)$ for \`findMedian\`.`,
  },
];
