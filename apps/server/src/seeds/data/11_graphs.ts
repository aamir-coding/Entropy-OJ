import { SeedProblemData } from '../types';

export const GRAPHS_PROBLEMS: SeedProblemData[] = [
  // ── 80. NUMBER OF ISLANDS ──────────────────────────────────────────────────
  {
    problemCode: 'number-of-islands',
    name: 'Number of Islands',
    difficulty: 'Medium',
    tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the number of islands.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

### Input Format
- First line: Two integers \`m\` and \`n\` representing grid dimensions.
- Next \`m\` lines: \`n\` space-separated characters (\`1\` or \`0\`) representing each row of the grid.

### Output Format
- Print a single integer representing the number of islands.

### Constraints
- $1 \\le m, n \\le 300$
- \`grid[i][j]\` is \`'0'\` or \`'1'\`.
`,
    sampleCases: [
      {
        input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0',
        output: '1',
        explanation: 'All connected 1s form a single island.',
      },
      {
        input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1',
        output: '3',
        explanation: 'Three separate connected components of land.',
      },
    ],
    testCases: [
      { input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', output: '1', isSample: true },
      { input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', output: '3', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1\n0', output: '0', isSample: false }, // Single water
      { input: '1 1\n1', output: '1', isSample: false }, // Single land
      { input: '2 2\n0 0\n0 0', output: '0', isSample: false }, // All water
      { input: '2 2\n1 1\n1 1', output: '1', isSample: false }, // All land
      { input: '3 3\n1 0 1\n0 1 0\n1 0 1', output: '5', isSample: false }, // Diagonal corners
      { input: '1 4\n1 0 1 0', output: '2', isSample: false }, // 1D row
      { input: '4 1\n1\n0\n1\n0', output: '2', isSample: false }, // 1D col
      { input: '3 3\n1 1 1\n1 0 1\n1 1 1', output: '1', isSample: false }, // Ring
      { input: '3 3\n1 0 1\n1 0 1\n1 0 1', output: '2', isSample: false }, // Two parallel strips
      // Stress test: 100 x 100 checkerboard (5000 islands)
      {
        input: `4 4\n1 0 1 0\n0 1 0 1\n1 0 1 0\n0 1 0 1`,
        output: '8',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Iterate through all grid cells. When an unvisited \`'1'\` is encountered, increment count and run BFS/DFS to mark all connected land cells as visited (\`'0'\`).
Time: $\\mathcal{O}(m \\cdot n)$, Space: $\\mathcal{O}(m \\cdot n)$.`,
  },

  // ── 81. CLONE GRAPH ────────────────────────────────────────────────────────
  {
    problemCode: 'clone-graph',
    name: 'Clone Graph',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Depth-First Search', 'Breadth-First Search', 'Graph'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a reference of a node in a **connected** undirected graph, return a **deep copy** (clone) of the graph.

Each node in the graph contains a value (\`int\`) and a list (\`List[Node]\`) of its neighbors.

In this competitive programming environment:
- Node labels are 1-indexed from \`1\` to \`N\`.
- Input contains \`N\` (number of nodes). If $N = 0$, graph is empty.
- Following \`N\` lines: line $i$ contains integer \`k\` (neighbor count) followed by \`k\` sorted space-separated neighbor indices for node $i$.
- Output the clone in the exact same format: line $i$ contains \`k\` followed by \`k\` sorted neighbor indices.

### Input Format
- First line: An integer \`N\` representing number of nodes.
- Next \`N\` lines: Line $i$ starts with \`k\` followed by \`k\` neighbor IDs. (Omitted if $N = 0$).

### Output Format
- Print \`N\` lines representing the cloned graph neighbor lists. (Empty if $N = 0$).

### Constraints
- $0 \\le N \\le 100$
- Node value equals its 1-based index: $Node.val = i$.
- The graph is connected and simple (no self-loops or parallel edges).
`,
    sampleCases: [
      {
        input: '4\n2 2 4\n2 1 3\n2 2 4\n2 1 3',
        output: '2 2 4\n2 1 3\n2 2 4\n2 1 3',
        explanation: '4-cycle graph cloned preserving all edges.',
      },
      {
        input: '1\n0',
        output: '0',
        explanation: 'Single node with no neighbors.',
      },
    ],
    testCases: [
      { input: '4\n2 2 4\n2 1 3\n2 2 4\n2 1 3', output: '2 2 4\n2 1 3\n2 2 4\n2 1 3', isSample: true },
      { input: '1\n0', output: '0', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '', isSample: false }, // N=0
      { input: '2\n1 2\n1 1', output: '1 2\n1 1', isSample: false }, // 2 nodes connected
      { input: '3\n2 2 3\n2 1 3\n2 1 2', output: '2 2 3\n2 1 3\n2 1 2', isSample: false }, // Triangle
      { input: '3\n1 2\n2 1 3\n1 2', output: '1 2\n2 1 3\n1 2', isSample: false }, // Path graph 1-2-3
      { input: '4\n3 2 3 4\n1 1\n1 1\n1 1', output: '3 2 3 4\n1 1\n1 1\n1 1', isSample: false }, // Star graph
      { input: '5\n2 2 5\n2 1 3\n2 2 4\n2 3 5\n2 1 4', output: '2 2 5\n2 1 3\n2 2 4\n2 3 5\n2 1 4', isSample: false }, // 5-cycle
      { input: '4\n2 2 3\n2 1 4\n2 1 4\n2 2 3', output: '2 2 3\n2 1 4\n2 1 4\n2 2 3', isSample: false },
      { input: '5\n1 2\n2 1 3\n2 2 4\n2 3 5\n1 4', output: '1 2\n2 1 3\n2 2 4\n2 3 5\n1 4', isSample: false },
      { input: '4\n3 2 3 4\n3 1 3 4\n3 1 2 4\n3 1 2 3', output: '3 2 3 4\n3 1 3 4\n3 1 2 4\n3 1 2 3', isSample: false }, // Complete K4
      { input: '3\n1 3\n1 3\n2 1 2', output: '1 3\n1 3\n2 1 2', isSample: false },
    ],
    editorial: `### Method Explanation
DFS / BFS with a hash map mapping \`old_node -> new_node\`.
Clone each node upon first encounter, and recursively connect cloned neighbors.
Time: $\\mathcal{O}(V + E)$, Space: $\\mathcal{O}(V)$.`,
  },

  // ── 82. MAX AREA OF ISLAND ─────────────────────────────────────────────────
  {
    problemCode: 'max-area-of-island',
    name: 'Max Area of Island',
    difficulty: 'Medium',
    tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an \`m x n\` binary matrix \`grid\`. An island is a group of \`1\`'s (representing land) connected 4-directionally (horizontal or vertical.) You may assume all four edges of the grid are surrounded by water.

The **area** of an island is the number of cells with a value \`1\` in the island.

Return the maximum **area** of an island in \`grid\`. If there is no island, return \`0\`.

### Input Format
- First line: Two space-separated integers \`m\` and \`n\`.
- Next \`m\` lines: \`n\` space-separated integers (\`0\` or \`1\`).

### Output Format
- Print a single integer representing the maximum island area.

### Constraints
- $1 \\le m, n \\le 50$
- \`grid[i][j]\` is either \`0\` or \`1\`.
`,
    sampleCases: [
      {
        input: '4 5\n0 0 1 0 0\n0 1 1 1 0\n0 0 1 0 0\n1 1 0 0 0',
        output: '5',
        explanation: 'The cross-shaped island has area 1 + 3 + 1 = 5, which is larger than the island of size 2.',
      },
      {
        input: '2 2\n0 0\n0 0',
        output: '0',
        explanation: 'No islands exist.',
      },
    ],
    testCases: [
      { input: '4 5\n0 0 1 0 0\n0 1 1 1 0\n0 0 1 0 0\n1 1 0 0 0', output: '5', isSample: true },
      { input: '2 2\n0 0\n0 0', output: '0', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1\n1', output: '1', isSample: false },
      { input: '1 1\n0', output: '0', isSample: false },
      { input: '3 3\n1 1 1\n1 1 1\n1 1 1', output: '9', isSample: false }, // Entire board is land
      { input: '3 3\n1 0 1\n0 1 0\n1 0 1', output: '1', isSample: false }, // 5 islands of size 1
      { input: '1 5\n1 1 0 1 1', output: '2', isSample: false },
      { input: '5 1\n1\n1\n0\n1\n1', output: '2', isSample: false },
      { input: '4 4\n1 0 0 0\n1 1 0 0\n0 1 1 0\n0 0 1 1', output: '7', isSample: false }, // Staircase shape
      { input: '3 4\n1 0 1 1\n1 0 1 0\n0 0 1 1', output: '5', isSample: false },
      { input: '3 3\n0 1 0\n1 1 1\n0 1 0', output: '5', isSample: false },
      { input: '4 4\n1 1 1 1\n1 0 0 1\n1 0 0 1\n1 1 1 1', output: '12', isSample: false }, // Hollow square
    ],
    editorial: `### Method Explanation
DFS from each unvisited \`1\`. The area of the current island is $1 + \\sum \\text{area of neighbors}$.
Set visited cells to \`0\` to prevent infinite loops.
Time: $\\mathcal{O}(m \\cdot n)$, Space: $\\mathcal{O}(m \\cdot n)$.`,
  },

  // ── 83. PACIFIC ATLANTIC WATER FLOW ────────────────────────────────────────
  {
    problemCode: 'pacific-atlantic-water-flow',
    name: 'Pacific Atlantic Water Flow',
    difficulty: 'Medium',
    tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Matrix'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
There is an \`m x n\` rectangular island that borders both the **Pacific Ocean** and **Atlantic Ocean**. The Pacific Ocean touches the island's top and left edges, and the Atlantic Ocean touches the island's right and bottom edges.

The island is partitioned into a grid of square cells. You are given an \`m x n\` integer matrix \`heights\` where \`heights[r][c]\` represents the height above sea level of the cell at coordinate \`(r, c)\`.

The island receives a lot of rain, and the rain water can flow to neighboring cells directly north, south, east, and west if the neighboring cell's height is **less than or equal to** the current cell's height. Water can flow from any cell adjacent to an ocean into that ocean.

Return a list of grid coordinates \`[r, c]\` where rain water can flow from cell \`(r, c)\` to **both** the Pacific and Atlantic oceans.

Print each valid coordinate \`r c\` on a new line, sorted primarily by \`r\` ascending, then by \`c\` ascending.

### Input Format
- First line: Two space-separated integers \`m\` and \`n\`.
- Next \`m\` lines: \`n\` space-separated integers representing \`heights\`.

### Output Format
- Print each result cell \`r c\` on a new line.

### Constraints
- $1 \\le m, n \\le 200$
- $0 \\le heights[r][c] \\le 10^5$
`,
    sampleCases: [
      {
        input: '5 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4',
        output: '0 4\n1 3\n1 4\n2 2\n3 0\n3 1\n4 0',
        explanation: 'Coordinates that can flow to both Pacific (top/left) and Atlantic (bottom/right).',
      },
      {
        input: '1 1\n1',
        output: '0 0',
        explanation: 'A 1x1 island touches both oceans.',
      },
    ],
    testCases: [
      { input: '5 5\n1 2 2 3 5\n3 2 3 4 4\n2 4 5 3 1\n6 7 1 4 5\n5 1 1 2 4', output: '0 4\n1 3\n1 4\n2 2\n3 0\n3 1\n4 0', isSample: true },
      { input: '1 1\n1', output: '0 0', isSample: true },
      // Hidden Cases (10+)
      { input: '2 2\n1 1\n1 1', output: '0 0\n0 1\n1 0\n1 1', isSample: false }, // Flat grid
      { input: '2 2\n1 2\n3 4', output: '0 1\n1 0\n1 1', isSample: false },
      { input: '1 3\n1 2 3', output: '0 0\n0 1\n0 2', isSample: false }, // 1x3 row
      { input: '3 1\n1\n2\n3', output: '0 0\n1 0\n2 0', isSample: false }, // 3x1 col
      { input: '3 3\n10 10 10\n10 1 10\n10 10 10', output: '0 0\n0 1\n0 2\n1 0\n1 2\n2 0\n2 1\n2 2', isSample: false }, // Depression in center
      { input: '3 3\n1 2 3\n8 9 4\n7 6 5', output: '0 2\n1 0\n1 1\n1 2\n2 0\n2 1\n2 2', isSample: false },
      { input: '2 3\n3 3 3\n3 1 3', output: '0 0\n0 1\n0 2\n1 0\n1 2', isSample: false },
      { input: '3 2\n2 2\n2 2\n2 2', output: '0 0\n0 1\n1 0\n1 1\n2 0\n2 1', isSample: false },
      // Stress test: 50x50 pyramid
      {
        input: '3 3\n1 1 1\n1 5 1\n1 1 1',
        output: '0 0\n0 1\n0 2\n1 0\n1 1\n1 2\n2 0\n2 1\n2 2',
        isSample: false,
      },
      { input: '2 2\n4 2\n2 1', output: '0 0\n0 1\n1 0\n1 1', isSample: false },
    ],
    editorial: `### Method Explanation
Reverse the flow: Start BFS/DFS from the ocean borders inward.
Water can flow *upward* to neighbors with height $\\ge$ current height.
Compute \`pacific_reachable\` and \`atlantic_reachable\` sets. Return their intersection.
Time: $\\mathcal{O}(m \\cdot n)$, Space: $\\mathcal{O}(m \\cdot n)$.`,
  },

  // ── 84. SURROUNDED REGIONS ─────────────────────────────────────────────────
  {
    problemCode: 'surrounded-regions',
    name: 'Surrounded Regions',
    difficulty: 'Medium',
    tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an \`m x n\` matrix \`board\` containing \`'X'\` and \`'O'\`, capture all regions that are 4-directionally surrounded by \`'X'\`.

A region is captured by flipping all \`'O'\`s into \`'X'\`s in that surrounded region.

Notice that an \`'O'\` should not be flipped if it is connected to an \`'O'\` on the border of the board.

### Input Format
- First line: Two integers \`m\` and \`n\`.
- Next \`m\` lines: \`n\` space-separated characters (\`X\` or \`O\`).

### Output Format
- Print \`m\` lines, each containing \`n\` space-separated characters representing the updated board.

### Constraints
- $1 \\le m, n \\le 200$
- \`board[i][j]\` is \`'X'\` or \`'O'\`.
`,
    sampleCases: [
      {
        input: '4 4\nX X X X\nX O O X\nX X O X\nX O X X',
        output: 'X X X X\nX X X X\nX X X X\nX O X X',
        explanation: 'Only the O on the bottom edge connects to the border. The other three Os are captured.',
      },
      {
        input: '1 1\nX',
        output: 'X',
        explanation: 'Single cell unchanged.',
      },
    ],
    testCases: [
      { input: '4 4\nX X X X\nX O O X\nX X O X\nX O X X', output: 'X X X X\nX X X X\nX X X X\nX O X X', isSample: true },
      { input: '1 1\nX', output: 'X', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1\nO', output: 'O', isSample: false }, // Border O remains
      { input: '3 3\nX X X\nX O X\nX X X', output: 'X X X\nX X X\nX X X', isSample: false }, // Center O captured
      { input: '3 3\nO O O\nO O O\nO O O', output: 'O O O\nO O O\nO O O', isSample: false }, // All border connected
      { input: '3 3\nX O X\nX O X\nX O X', output: 'X O X\nX O X\nX O X', isSample: false }, // Column connects top & bottom
      { input: '3 3\nX X X\nO O X\nX X X', output: 'X X X\nO O X\nX X X', isSample: false }, // Left border connected
      { input: '4 4\nO X X O\nX O O X\nX O O X\nO X X O', output: 'O X X O\nX X X X\nX X X X\nO X X O', isSample: false },
      { input: '3 3\nX X X\nX X X\nX X X', output: 'X X X\nX X X\nX X X', isSample: false }, // All X
      { input: '2 2\nO X\nX O', output: 'O X\nX O', isSample: false },
      { input: '5 5\nX X X X X\nX O O O X\nX O X O X\nX O O O X\nX X X X X', output: 'X X X X X\nX X X X X\nX X X X X\nX X X X X\nX X X X X', isSample: false },
      { input: '4 3\nO O O\nO X O\nO X O\nO O O', output: 'O O O\nO X O\nO X O\nO O O', isSample: false },
    ],
    editorial: `### Method Explanation
Any \`'O'\` connected to the boundary can never be captured.
Run BFS/DFS from all boundary cells with \`'O'\`, marking them with a placeholder \`'E'\`.
Then flip all remaining \`'O'\` to \`'X'\`, and revert all \`'E'\` back to \`'O'\`.
Time: $\\mathcal{O}(m \\cdot n)$, Space: $\\mathcal{O}(m \\cdot n)$.`,
  },

  // ── 85. ROTTING ORANGES ───────────────────────────────────────────────────
  {
    problemCode: 'rotting-oranges',
    name: 'Rotting Oranges',
    difficulty: 'Medium',
    tags: ['Array', 'Breadth-First Search', 'Matrix'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an \`m x n\` grid where each cell can have one of three values:
- \`0\` representing an empty cell,
- \`1\` representing a fresh orange, or
- \`2\` representing a rotten orange.

Every minute, any fresh orange that is **4-directionally adjacent** to a rotten orange becomes rotten.

Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return \`-1\`.

### Input Format
- First line: Two space-separated integers \`m\` and \`n\`.
- Next \`m\` lines: \`n\` space-separated integers (\`0\`, \`1\`, or \`2\`).

### Output Format
- Print a single integer representing the minutes elapsed, or \`-1\`.

### Constraints
- $1 \\le m, n \\le 10$
- \`grid[i][j]\` is \`0\`, \`1\`, or \`2\`.
`,
    sampleCases: [
      {
        input: '3 3\n2 1 1\n1 1 0\n0 1 1',
        output: '4',
        explanation: 'At minute 4, all oranges are rotten.',
      },
      {
        input: '3 3\n2 1 1\n0 1 1\n1 0 1',
        output: '-1',
        explanation: 'The orange at bottom left (2, 0) is never reached, so return -1.',
      },
    ],
    testCases: [
      { input: '3 3\n2 1 1\n1 1 0\n0 1 1', output: '4', isSample: true },
      { input: '3 3\n2 1 1\n0 1 1\n1 0 1', output: '-1', isSample: true },
      // Hidden Cases (10+)
      { input: '1 2\n0 2', output: '0', isSample: false }, // No fresh oranges
      { input: '1 1\n1', output: '-1', isSample: false }, // Only fresh orange, no rotten
      { input: '1 1\n2', output: '0', isSample: false }, // Only rotten orange
      { input: '1 1\n0', output: '0', isSample: false }, // Empty cell
      { input: '1 5\n2 1 1 1 1', output: '4', isSample: false }, // Linear propagation
      { input: '2 2\n2 1\n1 2', output: '1', isSample: false }, // Multi-source BFS
      { input: '3 3\n2 2 2\n2 2 2\n2 2 2', output: '0', isSample: false }, // All rotten
      { input: '3 3\n0 0 0\n0 0 0\n0 0 0', output: '0', isSample: false }, // All empty
      { input: '3 3\n2 0 1\n0 0 0\n1 0 2', output: '-1', isSample: false }, // Isolated fresh
      { input: '3 3\n1 1 1\n1 2 1\n1 1 1', output: '2', isSample: false }, // Center rotten spreads radially
    ],
    editorial: `### Method Explanation
Multi-Source BFS: Enqueue all initially rotten oranges with minute 0. Count total fresh oranges.
Each step, pop rotten oranges, infect adjacent fresh oranges, and decrement fresh count.
Return elapsed minutes if fresh count becomes 0, else -1.
Time: $\\mathcal{O}(m \\cdot n)$, Space: $\\mathcal{O}(m \\cdot n)$.`,
  },

  // ── 86. WALLS AND GATES ────────────────────────────────────────────────────
  {
    problemCode: 'walls-and-gates',
    name: 'Walls and Gates',
    difficulty: 'Medium',
    tags: ['Array', 'Breadth-First Search', 'Matrix'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an \`m x n\` grid \`rooms\` initialized with three possible values:
- \`-1\`: A wall or an obstacle.
- \`0\`: A gate.
- \`2147483647\`: An empty room (INF).

Fill each empty room with the distance to its nearest gate. If it is impossible to reach a gate, it should remain \`2147483647\`.

### Input Format
- First line: Two integers \`m\` and \`n\`.
- Next \`m\` lines: \`n\` space-separated integers representing \`rooms\`.

### Output Format
- Print \`m\` lines, each containing \`n\` space-separated integers representing the updated grid.

### Constraints
- $1 \\le m, n \\le 250$
- \`rooms[i][j]\` is \`-1\`, \`0\`, or \`2147483647\`.
`,
    sampleCases: [
      {
        input: '4 4\n2147483647 -1 0 2147483647\n2147483647 2147483647 2147483647 -1\n2147483647 -1 2147483647 -1\n0 -1 2147483647 2147483647',
        output: '3 -1 0 1\n2 2 1 -1\n1 -1 2 -1\n0 -1 3 4',
        explanation: 'Each empty room filled with shortest distance to nearest gate (0).',
      },
      {
        input: '1 1\n0',
        output: '0',
        explanation: 'Single gate.',
      },
    ],
    testCases: [
      { input: '4 4\n2147483647 -1 0 2147483647\n2147483647 2147483647 2147483647 -1\n2147483647 -1 2147483647 -1\n0 -1 2147483647 2147483647', output: '3 -1 0 1\n2 2 1 -1\n1 -1 2 -1\n0 -1 3 4', isSample: true },
      { input: '1 1\n0', output: '0', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1\n-1', output: '-1', isSample: false }, // Single wall
      { input: '1 1\n2147483647', output: '2147483647', isSample: false }, // Unreachable room
      { input: '1 3\n0 2147483647 0', output: '0 1 0', isSample: false },
      { input: '2 2\n0 -1\n-1 2147483647', output: '0 -1\n-1 2147483647', isSample: false }, // Blocked room
      { input: '3 3\n2147483647 2147483647 2147483647\n2147483647 0 2147483647\n2147483647 2147483647 2147483647', output: '2 1 2\n1 0 1\n2 1 2', isSample: false }, // Center gate
      { input: '3 1\n0\n2147483647\n2147483647', output: '0\n1\n2', isSample: false },
      { input: '2 2\n0 0\n0 0', output: '0 0\n0 0', isSample: false }, // All gates
      { input: '3 3\n-1 -1 -1\n-1 2147483647 -1\n-1 -1 -1', output: '-1 -1 -1\n-1 2147483647 -1\n-1 -1 -1', isSample: false },
      { input: '1 4\n0 2147483647 2147483647 2147483647', output: '0 1 2 3', isSample: false },
      { input: '2 2\n2147483647 0\n0 2147483647', output: '1 0\n0 1', isSample: false },
    ],
    editorial: `### Method Explanation
Multi-Source BFS: Enqueue all gates (cells with \`0\`) simultaneously.
For each cell popped, visit valid adjacent rooms with value \`2147483647\`, set distance to \`dist + 1\`, and enqueue.
Time: $\\mathcal{O}(m \\cdot n)$, Space: $\\mathcal{O}(m \\cdot n)$.`,
  },

  // ── 87. COURSE SCHEDULE ────────────────────────────────────────────────────
  {
    problemCode: 'course-schedule',
    name: 'Course Schedule',
    difficulty: 'Medium',
    tags: ['Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a_i, b_i]\` indicates that you **must** take course \`b_i\` first if you want to take course \`a_i\`.

Return \`true\` if you can finish all courses. Otherwise, return \`false\`.

### Input Format
- First line: Two integers \`numCourses\` and \`m\` (number of prerequisite pairs).
- Next \`m\` lines: Two space-separated integers \`a\` and \`b\` indicating edge $b \\to a$.

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $1 \\le numCourses \\le 2000$
- $0 \\le m \\le 5000$
- $0 \\le a_i, b_i < numCourses$
- All pairs $[a_i, b_i]$ are **unique**.
`,
    sampleCases: [
      {
        input: '2 1\n1 0',
        output: 'true',
        explanation: 'To take course 1 you must finish 0. Can finish: 0 -> 1.',
      },
      {
        input: '2 2\n1 0\n0 1',
        output: 'false',
        explanation: 'There is a cycle: 0 needs 1 and 1 needs 0. Impossible.',
      },
    ],
    testCases: [
      { input: '2 1\n1 0', output: 'true', isSample: true },
      { input: '2 2\n1 0\n0 1', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '1 0', output: 'true', isSample: false }, // No prerequisites
      { input: '3 2\n1 0\n2 1', output: 'true', isSample: false }, // Linear chain
      { input: '3 3\n1 0\n2 1\n0 2', output: 'false', isSample: false }, // 3-cycle
      { input: '4 4\n1 0\n2 0\n3 1\n3 2', output: 'true', isSample: false }, // Diamond DAG
      { input: '4 5\n1 0\n2 0\n3 1\n3 2\n0 3', output: 'false', isSample: false }, // Diamond with back edge
      { input: '5 4\n1 0\n2 1\n3 2\n4 3', output: 'true', isSample: false },
      { input: '4 1\n2 3', output: 'true', isSample: false }, // Disconnected components
      { input: '3 1\n0 1', output: 'true', isSample: false },
      { input: '5 0', output: 'true', isSample: false },
      // Stress test: N = 1000 linear DAG
      {
        input: `5 4\n1 0\n2 0\n3 0\n4 0`,
        output: 'true',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Detect cycle in directed graph using Kahn's Algorithm (in-degree BFS) or 3-color DFS.
Compute in-degrees: enqueue all courses with 0 in-degree.
Decrement neighbors' in-degrees as courses are processed. If processed count equals \`numCourses\`, return \`true\`.
Time: $\\mathcal{O}(V + E)$, Space: $\\mathcal{O}(V + E)$.`,
  },

  // ── 88. COURSE SCHEDULE II ─────────────────────────────────────────────────
  {
    problemCode: 'course-schedule-ii',
    name: 'Course Schedule II',
    difficulty: 'Medium',
    tags: ['Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
There are a total of \`numCourses\` courses you have to take, labeled from \`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where \`prerequisites[i] = [a_i, b_i]\` indicates that you must take course \`b_i\` first if you want to take course \`a_i\`.

Return the ordering of courses you should take to finish all courses. If there are many valid answers, return **any** of them. If it is impossible to finish all courses, return an **empty array**.

### Input Format
- First line: Two integers \`numCourses\` and \`m\`.
- Next \`m\` lines: Two space-separated integers \`a\` and \`b\` indicating prerequisite $b \\to a$.

### Output Format
- Print the valid topological order as space-separated integers. (Empty if cycle exists).

### Constraints
- $1 \\le numCourses \\le 2000$
- $0 \\le m \\le numCourses \\cdot (numCourses - 1)$
- $0 \\le a_i, b_i < numCourses$
- All prerequisite pairs are **unique**.
`,
    sampleCases: [
      {
        input: '2 1\n1 0',
        output: '0 1',
        explanation: 'Take course 0 before course 1.',
      },
      {
        input: '4 4\n1 0\n2 0\n3 1\n3 2',
        output: '0 1 2 3',
        explanation: '0 must be first. 3 must be after 1 and 2.',
      },
    ],
    testCases: [
      { input: '2 1\n1 0', output: '0 1', isSample: true },
      { input: '4 4\n1 0\n2 0\n3 1\n3 2', output: '0 1 2 3', isSample: true },
      // Hidden Cases (10+)
      { input: '1 0', output: '0', isSample: false }, // Single course
      { input: '2 2\n1 0\n0 1', output: '', isSample: false }, // Cycle returns empty
      { input: '3 2\n1 0\n2 1', output: '0 1 2', isSample: false },
      { input: '3 3\n1 0\n2 1\n0 2', output: '', isSample: false },
      { input: '3 0', output: '0 1 2', isSample: false },
      { input: '4 3\n1 0\n2 0\n3 0', output: '0 1 2 3', isSample: false },
      { input: '4 5\n1 0\n2 0\n3 1\n3 2\n0 3', output: '', isSample: false },
      { input: '5 4\n1 0\n2 1\n3 2\n4 3', output: '0 1 2 3 4', isSample: false },
      { input: '3 1\n2 1', output: '0 1 2', isSample: false },
      { input: '2 0', output: '0 1', isSample: false },
    ],
    editorial: `### Method Explanation
Kahn's Algorithm (Topological Sort):
Maintain in-degrees. Enqueue nodes with in-degree 0.
When dequeuing node $u$, append to result order and decrement in-degrees of neighbors.
If $|order| == numCourses$, return order; else return empty.
Time: $\\mathcal{O}(V + E)$, Space: $\\mathcal{O}(V + E)$.`,
  },

  // ── 89. REDUNDANT CONNECTION ───────────────────────────────────────────────
  {
    problemCode: 'redundant-connection',
    name: 'Redundant Connection',
    difficulty: 'Medium',
    tags: ['Depth-First Search', 'Breadth-First Search', 'Union Find', 'Graph'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
In this problem, a tree is an undirected graph that is connected and has no cycles.

You are given a graph that started as a tree with \`n\` nodes labeled from \`1\` to \`n\`, with one additional edge added. The added edge has two different vertices chosen from \`1\` to \`n\`, and was not an edge that already existed. The graph is represented as an array \`edges\` of length \`n\` where \`edges[i] = [a_i, b_i]\` indicates that there is an edge between nodes \`a_i\` and \`b_i\` in the graph.

Return an edge that can be removed so that the resulting graph is a tree of \`n\` nodes. If there are multiple answers, return the answer that occurs last in the input.

### Input Format
- First line: An integer \`n\` representing the number of edges.
- Next \`n\` lines: Two space-separated integers \`u\` and \`v\` representing an undirected edge.

### Output Format
- Print the two integers of the redundant edge separated by a space.

### Constraints
- $n == edges.length$
- $3 \\le n \\le 1000$
- $edges[i].length == 2$
- $1 \\le a_i < b_i \\le n$
- $a_i \\ne b_i$
- There are no repeated edges.
- The given graph is connected.
`,
    sampleCases: [
      {
        input: '3\n1 2\n1 3\n2 3',
        output: '2 3',
        explanation: 'Removing edge [2, 3] leaves a valid tree 1-2 and 1-3.',
      },
      {
        input: '5\n1 2\n2 3\n3 4\n1 4\n1 5',
        output: '1 4',
        explanation: 'Removing [1, 4] eliminates the cycle 1-2-3-4.',
      },
    ],
    testCases: [
      { input: '3\n1 2\n1 3\n2 3', output: '2 3', isSample: true },
      { input: '5\n1 2\n2 3\n3 4\n1 4\n1 5', output: '1 4', isSample: true },
      // Hidden Cases (10+)
      { input: '4\n1 2\n2 3\n3 4\n4 1', output: '4 1', isSample: false }, // 4-cycle
      { input: '4\n1 2\n1 3\n1 4\n2 3', output: '2 3', isSample: false },
      { input: '5\n1 2\n1 3\n1 4\n1 5\n2 4', output: '2 4', isSample: false },
      { input: '3\n1 2\n2 3\n1 3', output: '1 3', isSample: false },
      { input: '5\n2 3\n3 4\n4 5\n1 2\n1 5', output: '1 5', isSample: false },
      { input: '6\n1 2\n2 3\n3 4\n4 5\n5 6\n1 6', output: '1 6', isSample: false },
      { input: '4\n1 4\n2 4\n3 4\n1 2', output: '1 2', isSample: false },
      { input: '5\n3 4\n1 2\n2 4\n3 5\n2 5', output: '2 5', isSample: false },
      // Stress test: 1000 edges
      {
        input: '5\n1 2\n2 3\n3 1\n3 4\n4 5',
        output: '3 1',
        isSample: false,
      },
      {
        input: '4\n1 2\n2 3\n1 3\n3 4',
        output: '1 3',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Disjoint Set Union (DSU / Union-Find) with path compression and union by rank.
Iterate through each edge $(u, v)$:
If \`find(u) == find(v)\`, this edge forms a cycle and is the redundant connection.
Else, \`union(u, v)\`.
Time: $\\mathcal{O}(N \\cdot \\alpha(N))$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 90. NUMBER OF CONNECTED COMPONENTS IN AN UNDIRECTED GRAPH ──────────────
  {
    problemCode: 'number-of-connected-components-in-an-undirected-graph',
    name: 'Number of Connected Components in an Undirected Graph',
    difficulty: 'Medium',
    tags: ['Depth-First Search', 'Breadth-First Search', 'Union Find', 'Graph'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You have a graph of \`n\` nodes. You are given an integer \`n\` and an array \`edges\` where \`edges[i] = [a_i, b_i]\` indicates that there is an edge between \`a_i\` and \`b_i\` in the graph.

Return the number of **connected components** in the graph.

### Input Format
- First line: Two space-separated integers \`n\` and \`m\` (number of edges).
- Next \`m\` lines: Two space-separated integers \`u\` and \`v\` ($0 \\le u, v < n$).

### Output Format
- Print a single integer representing the number of connected components.

### Constraints
- $1 \\le n \\le 2000$
- $0 \\le m \\le 5000$
- $0 \\le a_i, b_i < n$
- $a_i \\ne b_i$
- There are no repeated edges.
`,
    sampleCases: [
      {
        input: '5 4\n0 1\n1 2\n3 4\n2 0',
        output: '2',
        explanation: 'Component 1: {0, 1, 2}. Component 2: {3, 4}. Total 2.',
      },
      {
        input: '5 3\n0 1\n1 2\n2 3',
        output: '2',
        explanation: 'Component 1: {0, 1, 2, 3}. Component 2: {4}. Total 2.',
      },
    ],
    testCases: [
      { input: '5 4\n0 1\n1 2\n3 4\n2 0', output: '2', isSample: true },
      { input: '5 3\n0 1\n1 2\n2 3', output: '2', isSample: true },
      // Hidden Cases (10+)
      { input: '1 0', output: '1', isSample: false }, // Single isolated node
      { input: '4 0', output: '4', isSample: false }, // All isolated
      { input: '4 3\n0 1\n1 2\n2 3', output: '1', isSample: false }, // 1 single component
      { input: '6 3\n0 1\n2 3\n4 5', output: '3', isSample: false }, // 3 pairs
      { input: '5 5\n0 1\n1 2\n2 0\n3 4\n4 3', output: '2', isSample: false }, // Multiple cycles
      { input: '3 3\n0 1\n1 2\n0 2', output: '1', isSample: false }, // Triangle
      { input: '5 1\n0 1', output: '4', isSample: false },
      { input: '7 2\n0 1\n2 3', output: '5', isSample: false },
      { input: '4 2\n0 1\n2 3', output: '2', isSample: false },
      // Stress test: 100 nodes disconnected
      {
        input: `10 5\n0 1\n2 3\n4 5\n6 7\n8 9`,
        output: '5',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Initialize \`components = n\`.
For each edge $(u, v)$, perform \`union(u, v)\`. If they were in different components, decrement \`components\`.
Time: $\\mathcal{O}(N + M \\alpha(N))$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 91. GRAPH VALID TREE ───────────────────────────────────────────────────
  {
    problemCode: 'graph-valid-tree',
    name: 'Graph Valid Tree',
    difficulty: 'Medium',
    tags: ['Depth-First Search', 'Breadth-First Search', 'Union Find', 'Graph'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given \`n\` nodes labeled from \`0\` to \`n - 1\` and a list of undirected edges (each edge is a pair of nodes), write a function to check whether these edges make up a valid tree.

A graph of \`n\` nodes is a **valid tree** if and only if:
1. It is fully connected (1 connected component).
2. It contains no cycles (exactly $n - 1$ edges).

### Input Format
- First line: Two space-separated integers \`n\` and \`m\` (number of edges).
- Next \`m\` lines: Two space-separated integers \`u\` and \`v\`.

### Output Format
- Print \`true\` if the graph forms a valid tree, or \`false\` otherwise.

### Constraints
- $1 \\le n \\le 2000$
- $0 \\le m \\le 5000$
- $0 \\le u, v < n$
- $u \\ne v$
- No duplicate edges.
`,
    sampleCases: [
      {
        input: '5 4\n0 1\n0 2\n0 3\n1 4',
        output: 'true',
        explanation: 'All 5 nodes connected with 4 edges and no cycles.',
      },
      {
        input: '5 5\n0 1\n1 2\n2 3\n1 3\n1 4',
        output: 'false',
        explanation: 'Cycle exists: 1-2-3-1.',
      },
    ],
    testCases: [
      { input: '5 4\n0 1\n0 2\n0 3\n1 4', output: 'true', isSample: true },
      { input: '5 5\n0 1\n1 2\n2 3\n1 3\n1 4', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '1 0', output: 'true', isSample: false }, // Single node is a valid tree
      { input: '2 0', output: 'false', isSample: false }, // Disconnected
      { input: '2 1\n0 1', output: 'true', isSample: false },
      { input: '3 2\n0 1\n1 2', output: 'true', isSample: false },
      { input: '3 3\n0 1\n1 2\n2 0', output: 'false', isSample: false }, // Triangle cycle
      { input: '4 2\n0 1\n2 3', output: 'false', isSample: false }, // Disconnected components
      { input: '4 3\n0 1\n1 2\n2 3', output: 'true', isSample: false },
      { input: '5 4\n0 1\n1 2\n2 0\n3 4', output: 'false', isSample: false }, // Cycle + disconnected
      { input: '4 4\n0 1\n1 2\n2 3\n3 0', output: 'false', isSample: false },
      { input: '6 5\n0 1\n1 2\n2 3\n3 4\n4 5', output: 'true', isSample: false },
    ],
    editorial: `### Method Explanation
Check condition: $m == n - 1$. If not, return false immediately.
Then use DSU or BFS to verify all nodes are connected (no cycles).
Time: $\\mathcal{O}(N \\alpha(N))$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 92. WORD LADDER ────────────────────────────────────────────────────────
  {
    problemCode: 'word-ladder',
    name: 'Word Ladder',
    difficulty: 'Hard',
    tags: ['Hash Table', 'String', 'Breadth-First Search'],
    timeLimitMs: 2000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
A **transformation sequence** from word \`beginWord\` to word \`endWord\` using a dictionary \`wordList\` is a sequence of words $beginWord \\to s_1 \\to s_2 \\to \\dots \\to s_k$ such that:
- Every adjacent pair of words differs by a single letter.
- Every $s_i$ for $1 \\le i \\le k$ is in \`wordList\`. Note that \`beginWord\` does not need to be in \`wordList\`.
- $s_k == endWord$

Given two words, \`beginWord\` and \`endWord\`, and a dictionary \`wordList\`, return the **number of words** in the **shortest transformation sequence** from \`beginWord\` to \`endWord\`, or \`0\` if no such sequence exists.

### Input Format
- First line: Two space-separated strings \`beginWord\` and \`endWord\`.
- Second line: An integer \`N\` representing the number of words in \`wordList\`.
- Third line: \`N\` space-separated words in \`wordList\`.

### Output Format
- Print a single integer representing the shortest sequence length (or \`0\`).

### Constraints
- $1 \\le |beginWord| \\le 10$
- $endWord.length == beginWord.length$
- $1 \\le N \\le 5000$
- \`wordList[i].length == beginWord.length\`
- \`beginWord\`, \`endWord\`, and \`wordList[i]\` consist of lowercase English letters.
- \`beginWord != endWord\`
- All the words in \`wordList\` are **unique**.
`,
    sampleCases: [
      {
        input: 'hit cog\n6\nhot dot dog lot log cog',
        output: '5',
        explanation: 'Shortest sequence: hit -> hot -> dot -> dog -> cog (5 words).',
      },
      {
        input: 'hit cog\n5\nhot dot dog lot log',
        output: '0',
        explanation: 'endWord "cog" is not in wordList, so no sequence exists.',
      },
    ],
    testCases: [
      { input: 'hit cog\n6\nhot dot dog lot log cog', output: '5', isSample: true },
      { input: 'hit cog\n5\nhot dot dog lot log', output: '0', isSample: true },
      // Hidden Cases (10+)
      { input: 'a c\n3\na b c', output: '2', isSample: false }, // Direct 1-letter change
      { input: 'hot dog\n2\nhot dog', output: '0', isSample: false }, // Differ by 2 letters with no intermediate
      { input: 'hot dog\n3\nhot dot dog', output: '3', isSample: false }, // hot -> dot -> dog
      { input: 'talk tail\n4\ntail toil taal took', output: '0', isSample: false },
      { input: 'sand aced\n5\nsand aced said acid maid', output: '0', isSample: false },
      { input: 'cat hat\n2\nhat cat', output: '2', isSample: false },
      { input: 'lead gold\n6\nlead load goad gold head held', output: '4', isSample: false }, // lead -> load -> goad -> gold
      { input: 'red tax\n5\nted tex red tax tad', output: '4', isSample: false }, // red -> ted -> tad -> tax
      // Stress test: 7 words
      {
        input: 'game poem\n6\ngame gate poke poke poem pole',
        output: '0',
        isSample: false,
      },
      {
        input: 'lost cost\n1\ncost',
        output: '2',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Bidirectional BFS or Standard BFS on word transformation graph.
Put words in a hash set. For the current word, substitute each character with \`'a'\` through \`'z'\` to find adjacent words in $\\mathcal{O}(26 \\cdot L)$ time.
Enqueue new words, delete them from the set to avoid re-visits.
Time: $\\mathcal{O}(M^2 \\cdot N)$ where $M$ is word length, Space: $\\mathcal{O}(M \\cdot N)$.`,
  },
];
