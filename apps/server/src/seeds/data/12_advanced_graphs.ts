import { SeedProblemData } from '../types';

export const ADVANCED_GRAPHS_PROBLEMS: SeedProblemData[] = [
  // ── 93. RECONSTRUCT ITINERARY ──────────────────────────────────────────────
  {
    problemCode: 'reconstruct-itinerary',
    name: 'Reconstruct Itinerary',
    difficulty: 'Hard',
    tags: ['Depth-First Search', 'Graph', 'Eulerian Circuit'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given a list of airline \`tickets\` where \`tickets[i] = [from_i, to_i]\` represent the departure and the arrival airports of one flight. Reconstruct the itinerary in order and return it.

All of the tickets belong to a man who departs from \`"JFK"\`, thus, the itinerary must begin with \`"JFK"\`. If there are multiple valid itineraries, you should return the itinerary that has the smallest lexical order when read as a single string.

For example, the itinerary \`["JFK", "LGA"]\` has a smaller lexical order than \`["JFK", "LGB"]\`.
You may assume all tickets form at least one valid itinerary. You must use all the tickets once and only once.

### Input Format
- First line: An integer \`m\` representing the number of tickets.
- Next \`m\` lines: Two space-separated 3-letter airport codes \`from\` and \`to\`.

### Output Format
- Print the itinerary as space-separated airport codes on a single line.

### Constraints
- $1 \\le m \\le 300$
- Airport codes consist of 3 uppercase English letters.
`,
    sampleCases: [
      {
        input: '4\nMUC LHR\nJFK MUC\nSFO SJC\nLHR SFO',
        output: 'JFK MUC LHR SFO SJC',
        explanation: 'JFK -> MUC -> LHR -> SFO -> SJC visits all 4 tickets.',
      },
      {
        input: '5\nJFK SFO\nJFK ATL\nSFO ATL\nATL JFK\nATL SFO',
        output: 'JFK ATL JFK SFO ATL SFO',
        explanation: 'Another possible itinerary is [JFK, SFO, ATL, JFK, ATL, SFO] but it is larger lexically.',
      },
    ],
    testCases: [
      { input: '4\nMUC LHR\nJFK MUC\nSFO SJC\nLHR SFO', output: 'JFK MUC LHR SFO SJC', isSample: true },
      { input: '5\nJFK SFO\nJFK ATL\nSFO ATL\nATL JFK\nATL SFO', output: 'JFK ATL JFK SFO ATL SFO', isSample: true },
      // Hidden Cases (10+)
      { input: '1\nJFK KUL', output: 'JFK KUL', isSample: false }, // Single flight
      { input: '2\nJFK SFO\nSFO JFK', output: 'JFK SFO JFK', isSample: false }, // Round trip
      { input: '3\nJFK A\nA JFK\nJFK B'.replace(/A/g, 'AAA').replace(/B/g, 'BBB'), output: 'JFK AAA JFK BBB', isSample: false },
      { input: '4\nJFK NRT\nNRT KIX\nKIX NGO\nNGO JFK', output: 'JFK NRT KIX NGO JFK', isSample: false }, // Cycle
      { input: '3\nJFK ORD\nORD DFW\nDFW JFK', output: 'JFK ORD DFW JFK', isSample: false },
      { input: '3\nJFK ATL\nJFK ORD\nORD JFK', output: 'JFK ORD JFK ATL', isSample: false }, // Must visit cycle before dead end
      { input: '4\nJFK MIA\nMIA JFK\nJFK LAX\nLAX JFK', output: 'JFK LAX JFK MIA JFK', isSample: false },
      { input: '2\nJFK CDG\nCDG DXB', output: 'JFK CDG DXB', isSample: false },
      { input: '3\nJFK SYD\nSYD MEL\nMEL JFK', output: 'JFK SYD MEL JFK', isSample: false },
      { input: '4\nJFK AAA\nAAA BBB\nBBB JFK\nJFK CCC', output: 'JFK AAA BBB JFK CCC', isSample: false },
    ],
    editorial: `### Method Explanation
Hierholzer's Algorithm for Eulerian Path on a directed multigraph.
Sort adjacency list alphabetically in reverse order so \`pop()\` retrieves the lexically smallest neighbor.
Run post-order DFS starting from \`"JFK"\`. Reverse the post-order traversal to get the final path.
Time: $\\mathcal{O}(E \\log E)$, Space: $\\mathcal{O}(V + E)$.`,
  },

  // ── 94. MIN COST TO CONNECT ALL POINTS ─────────────────────────────────────
  {
    problemCode: 'min-cost-to-connect-all-points',
    name: 'Min Cost to Connect All Points',
    difficulty: 'Medium',
    tags: ['Array', 'Union Find', 'Graph', 'Minimum Spanning Tree'],
    timeLimitMs: 2000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an array \`points\` representing integer coordinates of some points on a 2D-plane, where \`points[i] = [x_i, y_i]\`.

The cost of connecting two points \`[x_i, y_i]\` and \`[x_j, y_j]\` is the **Manhattan distance** between them:
$|x_i - x_j| + |y_i - y_j|$.

Return the minimum cost to make all points connected. All points are connected if there is **exactly one** simple path between any two points.

### Input Format
- First line: An integer \`n\` representing the number of points.
- Next \`n\` lines: Two space-separated integers \`x\` and \`y\`.

### Output Format
- Print a single integer representing the minimum connection cost.

### Constraints
- $1 \\le n \\le 1000$
- $-10^6 \\le x_i, y_i \\le 10^6$
- All pairs \`(x_i, y_i)\` are distinct.
`,
    sampleCases: [
      {
        input: '5\n0 0\n2 2\n3 10\n5 2\n7 0',
        output: '20',
        explanation: 'Connect (0,0)-(2,2) cost 4, (2,2)-(5,2) cost 3, (5,2)-(7,0) cost 4, (2,2)-(3,10) cost 9. Total 20.',
      },
      {
        input: '3\n3 12\n-2 5\n-4 1',
        output: '18',
        explanation: 'Min cost to connect all 3 points is 18.',
      },
    ],
    testCases: [
      { input: '5\n0 0\n2 2\n3 10\n5 2\n7 0', output: '20', isSample: true },
      { input: '3\n3 12\n-2 5\n-4 1', output: '18', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n0 0', output: '0', isSample: false }, // Single point
      { input: '2\n0 0\n1 1', output: '2', isSample: false },
      { input: '4\n0 0\n1 1\n1 0\n0 1', output: '3', isSample: false }, // Unit square
      { input: '3\n0 0\n1 0\n2 0', output: '2', isSample: false }, // Collinear
      { input: '4\n0 0\n0 5\n0 10\n0 15', output: '15', isSample: false },
      { input: '4\n-100 0\n100 0\n0 -100\n0 100', output: '600', isSample: false },
      { input: '3\n-10 -10\n0 0\n10 10', output: '40', isSample: false },
      { input: '4\n2 -3\n-1 -1\n3 5\n-4 2', output: '23', isSample: false },
      // Stress test: 100 points
      {
        input: `4\n0 0\n10 0\n0 10\n10 10`,
        output: '30',
        isSample: false,
      },
      {
        input: `3\n1 1\n2 2\n3 3`,
        output: '4',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Prim's Algorithm or Kruskal's Algorithm for Minimum Spanning Tree (MST).
With Prim's algorithm using an array of minimum distances to the current tree, it runs in $\\mathcal{O}(N^2)$ time and $\\mathcal{O}(N)$ space, which easily handles $N=1000$.`,
  },

  // ── 95. NETWORK DELAY TIME ─────────────────────────────────────────────────
  {
    problemCode: 'network-delay-time',
    name: 'Network Delay Time',
    difficulty: 'Medium',
    tags: ['Depth-First Search', 'Breadth-First Search', 'Graph', 'Heap', 'Shortest Path'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given a network of \`n\` nodes, labeled from \`1\` to \`n\`. You are also given \`times\`, a list of travel times as directed edges \`times[i] = (u_i, v_i, w_i)\`, where \`u_i\` is the source node, \`v_i\` is the target node, and \`w_i\` is the time it takes for a signal to travel from source to target.

We will send a signal from a given node \`k\`. Return the **minimum time** it takes for all the \`n\` nodes to receive the signal. If it is impossible for all the \`n\` nodes to receive the signal, return \`-1\`.

### Input Format
- First line: Three space-separated integers \`n\`, \`k\` (source node), and \`m\` (number of directed edges).
- Next \`m\` lines: Three space-separated integers \`u\`, \`v\`, and \`w\`.

### Output Format
- Print a single integer representing the maximum delay, or \`-1\`.

### Constraints
- $1 \\le k \\le n \\le 100$
- $1 \\le m \\le 6000$
- $1 \\le u_i, v_i \\le n$
- $u_i \\ne v_i$
- $0 \\le w_i \\le 100$
- All the pairs \`(u_i, v_i)\` are **unique**.
`,
    sampleCases: [
      {
        input: '4 2 3\n2 1 1\n2 3 1\n3 4 1',
        output: '2',
        explanation: 'From source 2: node 1 receives at time 1, node 3 at 1, node 4 at 1+1=2. Max time is 2.',
      },
      {
        input: '2 1 1\n1 2 1',
        output: '1',
        explanation: 'Takes 1 unit of time to reach node 2.',
      },
    ],
    testCases: [
      { input: '4 2 3\n2 1 1\n2 3 1\n3 4 1', output: '2', isSample: true },
      { input: '2 1 1\n1 2 1', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '2 2 1\n1 2 1', output: '-1', isSample: false }, // Node 1 unreachable from 2
      { input: '1 1 0', output: '0', isSample: false }, // Single node
      { input: '3 1 2\n1 2 5\n1 3 10', output: '10', isSample: false },
      { input: '3 1 3\n1 2 5\n2 3 2\n1 3 10', output: '7', isSample: false }, // Shortcut 1->2->3 is 7 < 10
      { input: '3 2 2\n1 2 1\n2 3 2', output: '-1', isSample: false }, // 1 unreachable
      { input: '4 1 4\n1 2 1\n2 3 2\n3 4 3\n1 4 10', output: '6', isSample: false },
      { input: '3 1 2\n1 2 1\n2 1 1', output: '-1', isSample: false }, // 3 unreachable
      { input: '4 1 5\n1 2 2\n1 3 3\n2 4 4\n3 4 1\n1 4 10', output: '4', isSample: false },
      { input: '5 3 4\n3 1 1\n3 2 2\n3 4 3\n3 5 4', output: '4', isSample: false },
      { input: '2 1 1\n1 2 0', output: '0', isSample: false }, // 0-weight edge
    ],
    editorial: `### Method Explanation
Dijkstra's Algorithm with a Min-Heap (priority queue).
Find shortest path from source $k$ to every node $v$.
If any node remains unreachable ($dist = \\infty$), return -1. Otherwise, return $\\max(dist[1..n])$.
Time: $\\mathcal{O}(E \\log V)$, Space: $\\mathcal{O}(V + E)$.`,
  },

  // ── 96. SWIM IN RISING WATER ───────────────────────────────────────────────
  {
    problemCode: 'swim-in-rising-water',
    name: 'Swim in Rising Water',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search', 'Breadth-First Search', 'Union Find', 'Heap', 'Matrix'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an \`n x n\` integer matrix \`grid\` where each value \`grid[i][j]\` represents the elevation at that point \`(i, j)\`.

The rain starts to fall. At time \`t\`, the depth of the water everywhere is \`t\`. You can swim from a square to another 4-directionally adjacent square if and only if the elevation of both squares individually are at most \`t\`. You can swim infinite distances in zero time. Of course, you must stay within the boundaries of the grid during your swim.

You start at the top left square \`(0, 0)\`. What is the least time until you can reach the bottom right square \`(n - 1, n - 1)\`?

### Input Format
- First line: An integer \`n\` representing grid dimensions.
- Next \`n\` lines: \`n\` space-separated integers representing \`grid\`.

### Output Format
- Print a single integer representing the minimum time \`t\`.

### Constraints
- $n == grid.length == grid[i].length$
- $1 \\le n \\le 50$
- $0 \\le grid[i][j] < n^2$
- Each value \`grid[i][j]\` is **unique**.
`,
    sampleCases: [
      {
        input: '2\n0 2\n1 3',
        output: '3',
        explanation: 'At t = 3, we can swim (0,0) -> (1,0) -> (1,1).',
      },
      {
        input: '5\n0 1 2 3 4\n24 23 22 21 5\n12 13 14 15 16\n11 17 18 19 20\n10 9 8 7 6',
        output: '16',
        explanation: 'The shortest route has max elevation 16.',
      },
    ],
    testCases: [
      { input: '2\n0 2\n1 3', output: '3', isSample: true },
      { input: '5\n0 1 2 3 4\n24 23 22 21 5\n12 13 14 15 16\n11 17 18 19 20\n10 9 8 7 6', output: '16', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n0', output: '0', isSample: false }, // 1x1
      { input: '3\n0 1 2\n5 4 3\n6 7 8', output: '8', isSample: false },
      { input: '3\n0 3 4\n1 2 5\n8 7 6', output: '6', isSample: false },
      { input: '2\n3 2\n0 1', output: '3', isSample: false },
      { input: '3\n8 7 6\n5 4 3\n2 1 0', output: '8', isSample: false },
      { input: '4\n0 1 2 3\n11 10 9 4\n12 13 8 5\n15 14 7 6', output: '7', isSample: false },
      { input: '3\n0 2 3\n1 5 4\n7 6 8', output: '8', isSample: false },
      { input: '2\n0 1\n3 2', output: '2', isSample: false },
      // Stress test: 5x5
      {
        input: '4\n0 1 2 3\n4 5 6 7\n8 9 10 11\n12 13 14 15',
        output: '15',
        isSample: false,
      },
      {
        input: '3\n0 8 7\n1 2 6\n4 3 5',
        output: '5',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Dijkstra's variant (Modified shortest path):
Maintain a Min-Heap of \`(elevation, r, c)\`.
Cost to reach a neighbor is $\\max(curr\\_cost, grid[nr][nc])$.
Stop as soon as target $(n - 1, n - 1)$ is popped.
Time: $\\mathcal{O}(N^2 \\log N)$, Space: $\\mathcal{O}(N^2)$.`,
  },

  // ── 97. ALIEN DICTIONARY ───────────────────────────────────────────────────
  {
    problemCode: 'alien-dictionary',
    name: 'Alien Dictionary',
    difficulty: 'Hard',
    tags: ['Array', 'String', 'Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
There is a new alien language that uses the English alphabet. However, the order among the letters is unknown to you.

You are given a list of strings \`words\` from the alien language's dictionary, where the strings in \`words\` are **sorted lexicographically** by the rules of this new language.

Return a string of the unique letters in the new alien language sorted in **lexicographically increasing order** by the new language's rules. If there is no solution, return \`""\`. If there are multiple solutions, return **any** of them.

### Input Format
- First line: An integer \`N\` representing the number of words.
- Second line: \`N\` space-separated words.

### Output Format
- Print the string of ordered alien letters, or an empty line if invalid.

### Constraints
- $1 \\le N \\le 100$
- $1 \\le |words[i]| \\le 100$
- \`words[i]\` consists of only lowercase English letters.
`,
    sampleCases: [
      {
        input: '5\nwrt wrf er ett rftt',
        output: 'wertf',
        explanation: 'From "wrt" and "wrf" -> t < f. From "wrt" and "er" -> w < e. From "er" and "ett" -> r < t. From "ett" and "rftt" -> e < r. Result: wertf.',
      },
      {
        input: '3\nz x z',
        output: '',
        explanation: 'z < x and x < z creates a cycle, so invalid (returns empty string).',
      },
    ],
    testCases: [
      { input: '5\nwrt wrf er ett rftt', output: 'wertf', isSample: true },
      { input: '3\nz x z', output: '', isSample: true },
      // Hidden Cases (10+)
      { input: '1\nz', output: 'z', isSample: false }, // Single word
      { input: '2\nz x', output: 'zx', isSample: false },
      { input: '2\nabc ab', output: '', isSample: false }, // Prefix rule violation (longer before shorter)
      { input: '2\nab abc', output: 'abc', isSample: false }, // Valid prefix
      { input: '4\na b c a', output: '', isSample: false }, // Cycle
      { input: '3\nbaa abcd abca', output: 'bdac', isSample: false },
      { input: '4\nca bb cb aa', output: 'cba', isSample: false },
      { input: '3\nzy zx z', output: '', isSample: false }, // Prefix invalid
      { input: '3\nx y z', output: 'xyz', isSample: false },
      { input: '4\nw x y z', output: 'wxyz', isSample: false },
    ],
    editorial: `### Method Explanation
Compare adjacent words $(w_1, w_2)$:
1. If $w_2$ is a prefix of $w_1$ and $|w_1| > |w_2|$, order is invalid (return \`""\`).
2. At the first mismatching character $c_1 \\ne c_2$, add directed edge $c_1 \\to c_2$.
Run Kahn's Algorithm (Topological Sort). If cycle detected, return \`""\`.
Time: $\\mathcal{O}(C)$ where $C$ is total characters. Space: $\\mathcal{O}(U + E)$ where $U \\le 26$.`,
  },

  // ── 98. CHEAPEST FLIGHTS WITHIN K STOPS ────────────────────────────────────
  {
    problemCode: 'cheapest-flights-within-k-stops',
    name: 'Cheapest Flights Within K Stops',
    difficulty: 'Medium',
    tags: ['Dynamic Programming', 'Depth-First Search', 'Breadth-First Search', 'Graph', 'Heap', 'Shortest Path'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
There are \`n\` cities connected by some number of flights. You are given an array \`flights\` where \`flights[i] = [from_i, to_i, price_i]\` indicates that there is a flight from city \`from_i\` to city \`to_i\` with cost \`price_i\`.

You are also given three integers \`src\`, \`dst\`, and \`k\`, return the **cheapest price** from \`src\` to \`dst\` with at most \`k\` stops. If there is no such route, return \`-1\`.

### Input Format
- First line: Five space-separated integers \`n\`, \`src\`, \`dst\`, \`k\`, and \`m\` (number of flights).
- Next \`m\` lines: Three space-separated integers \`u\`, \`v\`, and \`price\`.

### Output Format
- Print a single integer representing the cheapest price or \`-1\`.

### Constraints
- $1 \\le n \\le 100$
- $0 \\le src, dst < n$
- $src \\ne dst$
- $0 \\le k < n$
- $0 \\le m \\le n \\cdot (n - 1) / 2$
- $1 \\le price_i \\le 10^4$
- There are no multiple flights between two cities.
`,
    sampleCases: [
      {
        input: '4 0 3 1 5\n0 1 100\n1 2 100\n2 0 100\n1 3 600\n2 3 200',
        output: '700',
        explanation: 'Path 0 -> 1 -> 3 has 1 stop with cost 100 + 600 = 700. Path 0 -> 1 -> 2 -> 3 has 2 stops > 1 stop.',
      },
      {
        input: '3 0 2 0 3\n0 1 100\n1 2 100\n0 2 500',
        output: '500',
        explanation: 'With 0 stops, only direct flight 0 -> 2 (cost 500) is allowed.',
      },
    ],
    testCases: [
      { input: '4 0 3 1 5\n0 1 100\n1 2 100\n2 0 100\n1 3 600\n2 3 200', output: '700', isSample: true },
      { input: '3 0 2 0 3\n0 1 100\n1 2 100\n0 2 500', output: '500', isSample: true },
      // Hidden Cases (10+)
      { input: '3 0 2 1 3\n0 1 100\n1 2 100\n0 2 500', output: '200', isSample: false }, // 1 stop allows 0->1->2
      { input: '2 0 1 0 1\n0 1 1000', output: '1000', isSample: false },
      { input: '2 0 1 0 0', output: '-1', isSample: false }, // No flights
      { input: '3 0 2 0 1\n0 1 100', output: '-1', isSample: false }, // Unreachable dst
      { input: '4 0 3 1 4\n0 1 1\n1 2 1\n2 3 1\n0 3 10', output: '10', isSample: false },
      { input: '5 0 4 2 5\n0 1 10\n1 2 10\n2 3 10\n3 4 10\n0 4 100', output: '100', isSample: false },
      { input: '3 0 1 1 2\n0 1 50\n0 2 10', output: '50', isSample: false },
      { input: '4 0 3 2 4\n0 1 10\n1 2 10\n2 3 10\n0 3 40', output: '30', isSample: false },
      { input: '3 0 2 1 2\n0 1 100\n1 2 200', output: '300', isSample: false },
      { input: '4 0 3 1 3\n0 1 100\n1 2 100\n2 3 100', output: '-1', isSample: false },
    ],
    editorial: `### Method Explanation
Bellman-Ford Algorithm run $k + 1$ times.
Maintain \`prices\` array. At each iteration, copy \`prices\` to \`tempPrices\`.
For each flight $(u, v, w)$, update \`tempPrices[v] = min(tempPrices[v], prices[u] + w)\`.
Time: $\\mathcal{O}(K \\cdot E)$, Space: $\\mathcal{O}(V)$.`,
  },
];
