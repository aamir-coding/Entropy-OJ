import { SeedProblemData } from '../types';

export const TREES_PROBLEMS: SeedProblemData[] = [
  // ── 46. INVERT BINARY TREE ─────────────────────────────────────────────────
  {
    problemCode: 'invert-binary-tree',
    name: 'Invert Binary Tree',
    difficulty: 'Easy',
    tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given the \`root\` of a binary tree, invert the tree, and return its root.

### Input Format
- First line: An integer \`N\` representing the number of level-order tokens.
- Second line: \`N\` space-separated tokens representing the level-order traversal of the tree, where empty children are \`null\`. (Omitted if $N = 0$).

### Output Format
- Print the level-order traversal of the inverted tree as space-separated tokens. (Omitted if $N = 0$).

### Constraints
- $0 \\le N \\le 1000$
- $-100 \\le Node.val \\le 100$
`,
    sampleCases: [
      {
        input: '7\n4 2 7 1 3 6 9',
        output: '4 7 2 9 6 3 1',
        explanation: 'The left and right subtrees at every level are swapped.',
      },
      {
        input: '3\n2 1 3',
        output: '2 3 1',
        explanation: 'Children 1 and 3 are inverted to 3 and 1.',
      },
    ],
    testCases: [
      { input: '7\n4 2 7 1 3 6 9', output: '4 7 2 9 6 3 1', isSample: true },
      { input: '3\n2 1 3', output: '2 3 1', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '', isSample: false }, // N=0 empty tree
      { input: '1\n1', output: '1', isSample: false }, // Single node
      { input: '2\n1 2', output: '1 null 2', isSample: false }, // Left child only becomes right child
      { input: '3\n1 null 2', output: '1 2', isSample: false }, // Right child only becomes left child
      { input: '4\n1 2 null 3', output: '1 null 2 null 3', isSample: false },
      { input: '3\n1 2 null', output: '1 null 2', isSample: false },
      { input: '7\n1 2 3 4 5 6 7', output: '1 3 2 7 6 5 4', isSample: false },
      { input: '5\n1 2 3 null null', output: '1 3 2', isSample: false },
      { input: '3\n-1 -2 -3', output: '-1 -3 -2', isSample: false },
      { input: '7\n10 5 15 2 7 12 20', output: '10 15 5 20 12 7 2', isSample: false },
    ],
    editorial: `### Method Explanation
Recursive DFS: For any node, swap its left and right child, then recursively invert the left and right subtrees.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(H)$ where $H$ is the height of the tree.`,
  },

  // ── 47. MAXIMUM DEPTH OF BINARY TREE ───────────────────────────────────────
  {
    problemCode: 'maximum-depth-of-binary-tree',
    name: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given the \`root\` of a binary tree, return its **maximum depth**.

A binary tree's **maximum depth** is the number of nodes along the longest path from the root node down to the farthest leaf node.

### Input Format
- First line: An integer \`N\` representing the number of level-order tokens.
- Second line: \`N\` space-separated tokens representing the tree in level-order (with \`null\` for missing nodes). (Omitted if $N = 0$).

### Output Format
- Print a single integer representing the maximum depth.

### Constraints
- $0 \\le N \\le 10^4$
- $-100 \\le Node.val \\le 100$
`,
    sampleCases: [
      {
        input: '7\n3 9 20 null null 15 7',
        output: '3',
        explanation: 'The longest path is 3 -> 20 -> 15 (or 7) of length 3.',
      },
      {
        input: '2\n1 null 2',
        output: '2',
        explanation: 'Path 1 -> 2 has length 2.',
      },
    ],
    testCases: [
      { input: '7\n3 9 20 null null 15 7', output: '3', isSample: true },
      { input: '2\n1 null 2', output: '2', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '0', isSample: false }, // N=0
      { input: '1\n1', output: '1', isSample: false }, // N=1
      { input: '3\n1 2 3', output: '2', isSample: false },
      { input: '5\n1 2 null 3 null', output: '3', isSample: false }, // Skewed tree
      { input: '7\n1 2 3 4 5 6 7', output: '3', isSample: false }, // Full tree depth 3
      { input: '15\n1 2 3 4 5 6 7 8 9 10 11 12 13 14 15', output: '4', isSample: false }, // Full tree depth 4
      { input: '4\n1 2 null 3', output: '3', isSample: false },
      { input: '5\n1 null 2 null 3', output: '3', isSample: false },
      { input: '6\n1 2 3 null 4 null', output: '3', isSample: false },
      { input: '7\n1 null 2 null 3 null 4', output: '4', isSample: false },
    ],
    editorial: `### Method Explanation
Recursive DFS: \`depth(node) = 1 + max(depth(node.left), depth(node.right))\`. Base case: \`depth(null) = 0\`.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(H)$.`,
  },

  // ── 48. DIAMETER OF BINARY TREE ────────────────────────────────────────────
  {
    problemCode: 'diameter-of-binary-tree',
    name: 'Diameter of Binary Tree',
    difficulty: 'Easy',
    tags: ['Tree', 'Depth-First Search', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given the \`root\` of a binary tree, return the length of the **diameter** of the tree.

The **diameter** of a binary tree is the length of the longest path between any two nodes in a tree. This path may or may not pass through the \`root\`.

The length of a path between two nodes is represented by the number of edges between them.

### Input Format
- First line: An integer \`N\` representing token count.
- Second line: \`N\` space-separated level-order tokens.

### Output Format
- Print a single integer representing the diameter.

### Constraints
- $1 \\le N \\le 10^4$
- $-100 \\le Node.val \\le 100$
`,
    sampleCases: [
      {
        input: '5\n1 2 3 4 5',
        output: '3',
        explanation: 'Path 4 -> 2 -> 1 -> 3 or 5 -> 2 -> 1 -> 3 has length 3 edges.',
      },
      {
        input: '2\n1 2',
        output: '1',
        explanation: 'Path 2 -> 1 has length 1 edge.',
      },
    ],
    testCases: [
      { input: '5\n1 2 3 4 5', output: '3', isSample: true },
      { input: '2\n1 2', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n1', output: '0', isSample: false }, // Single node
      { input: '3\n1 2 3', output: '2', isSample: false },
      { input: '4\n1 2 null 3', output: '2', isSample: false }, // Line graph
      { input: '7\n1 2 3 4 5 6 7', output: '4', isSample: false }, // Full tree depth 3
      { input: '6\n1 2 null 3 null 4', output: '3', isSample: false },
      { input: '7\n1 2 3 null 4 5 null', output: '4', isSample: false },
      { input: '5\n1 null 2 null 3', output: '2', isSample: false },
      { input: '6\n3 1 null null 2', output: '2', isSample: false },
      { input: '8\n4 -7 -3 null null -9 -3 9', output: '4', isSample: false },
      { input: '7\n1 2 3 4 null null 5', output: '4', isSample: false },
    ],
    editorial: `### Method Explanation
For each node, compute max depth of left and right subtrees.
Diameter passing through this node is \`left_depth + right_depth\`.
Maintain a global maximum across all nodes.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(H)$.`,
  },

  // ── 49. BALANCED BINARY TREE ───────────────────────────────────────────────
  {
    problemCode: 'balanced-binary-tree',
    name: 'Balanced Binary Tree',
    difficulty: 'Easy',
    tags: ['Tree', 'Depth-First Search', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a binary tree, determine if it is **height-balanced**.

A height-balanced binary tree is a binary tree in which the depth of the two subtrees of every node never differs by more than one.

### Input Format
- First line: An integer \`N\` representing token count.
- Second line: \`N\` space-separated level-order tokens. (Omitted if $N = 0$).

### Output Format
- Print \`true\` if the tree is height-balanced, or \`false\` otherwise.

### Constraints
- $0 \\le N \\le 5000$
- $-10^4 \\le Node.val \\le 10^4$
`,
    sampleCases: [
      {
        input: '7\n3 9 20 null null 15 7',
        output: 'true',
        explanation: 'Every node has subtree heights differing by at most 1.',
      },
      {
        input: '7\n1 2 2 3 3 null null',
        output: 'false',
        explanation: 'The left subtree is much deeper than the right subtree.',
      },
    ],
    testCases: [
      { input: '7\n3 9 20 null null 15 7', output: 'true', isSample: true },
      { input: '7\n1 2 2 3 3 null null', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: 'true', isSample: false }, // Empty tree is balanced
      { input: '1\n1', output: 'true', isSample: false },
      { input: '3\n1 2 3', output: 'true', isSample: false },
      { input: '4\n1 2 null 3', output: 'false', isSample: false },
      { input: '5\n1 null 2 null 3', output: 'false', isSample: false },
      { input: '7\n1 2 3 4 5 6 7', output: 'true', isSample: false },
      { input: '6\n1 2 3 4 null null', output: 'true', isSample: false },
      { input: '5\n1 2 3 null 4', output: 'true', isSample: false },
      { input: '7\n1 2 2 3 null null 3', output: 'false', isSample: false },
      { input: '5\n1 2 3 4 null', output: 'true', isSample: false },
    ],
    editorial: `### Method Explanation
Bottom-up DFS: Return the height of each subtree, or -1 if the subtree is unbalanced.
If \`|left_height - right_height| > 1\`, propagate -1 immediately.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(H)$.`,
  },

  // ── 50. SAME TREE ──────────────────────────────────────────────────────────
  {
    problemCode: 'same-tree',
    name: 'Same Tree',
    difficulty: 'Easy',
    tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given the roots of two binary trees \`p\` and \`q\`, write a function to check if they are the same or not.

Two binary trees are considered the same if they are structurally identical, and the nodes have the same value.

### Input Format
- First line: An integer \`N\` representing token count for tree \`p\`.
- Second line: \`N\` space-separated tokens for tree \`p\`. (Omitted if $N = 0$).
- Third line: An integer \`M\` representing token count for tree \`q\`.
- Fourth line: \`M\` space-separated tokens for tree \`q\`. (Omitted if $M = 0$).

### Output Format
- Print \`true\` if the trees are identical, or \`false\` otherwise.

### Constraints
- $0 \\le N, M \\le 100$
- $-10^4 \\le Node.val \\le 10^4$
`,
    sampleCases: [
      {
        input: '3\n1 2 3\n3\n1 2 3',
        output: 'true',
        explanation: 'Both trees have root 1 and children 2 and 3.',
      },
      {
        input: '3\n1 2 null\n3\n1 null 2',
        output: 'false',
        explanation: 'Structure differs: left child vs right child.',
      },
    ],
    testCases: [
      { input: '3\n1 2 3\n3\n1 2 3', output: 'true', isSample: true },
      { input: '3\n1 2 null\n3\n1 null 2', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '0\n\n0\n', output: 'true', isSample: false }, // Both empty
      { input: '1\n1\n0\n', output: 'false', isSample: false }, // One empty
      { input: '0\n\n1\n1', output: 'false', isSample: false },
      { input: '1\n1\n1\n1', output: 'true', isSample: false }, // Single same
      { input: '1\n1\n1\n2', output: 'false', isSample: false }, // Single different
      { input: '3\n1 2 1\n3\n1 1 2', output: 'false', isSample: false }, // Values swapped
      { input: '7\n1 2 3 4 5 6 7\n7\n1 2 3 4 5 6 7', output: 'true', isSample: false },
      { input: '7\n1 2 3 4 5 6 7\n7\n1 2 3 4 5 6 8', output: 'false', isSample: false },
      { input: '4\n1 2 null 3\n4\n1 2 null 3', output: 'true', isSample: false },
      { input: '3\n-1 -2 -3\n3\n-1 -2 -3', output: 'true', isSample: false },
    ],
    editorial: `### Method Explanation
Recursively compare nodes: If both are null, return true. If only one is null or values differ, return false.
Recursively check \`isSame(p.left, q.left) && isSame(p.right, q.right)\`.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(H)$.`,
  },

  // ── 51. SUBTREE OF ANOTHER TREE ────────────────────────────────────────────
  {
    problemCode: 'subtree-of-another-tree',
    name: 'Subtree of Another Tree',
    difficulty: 'Easy',
    tags: ['Tree', 'Depth-First Search', 'String Matching', 'Binary Tree', 'Hash Function'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given the roots of two binary trees \`root\` and \`subRoot\`, return \`true\` if there is a subtree of \`root\` with the same structure and node values of \`subRoot\` and \`false\` otherwise.

A subtree of a binary tree \`tree\` is a tree that consists of a node in \`tree\` and all of this node's descendants. The tree \`tree\` could also be considered as a subtree of itself.

### Input Format
- First line: An integer \`N\` representing token count for \`root\`.
- Second line: \`N\` space-separated level-order tokens for \`root\`.
- Third line: An integer \`M\` representing token count for \`subRoot\`.
- Fourth line: \`M\` space-separated level-order tokens for \`subRoot\`.

### Output Format
- Print \`true\` or \`false\`.

### Constraints
- $1 \\le N \\le 2000$
- $1 \\le M \\le 1000$
- $-10^4 \\le Node.val \\le 10^4$
`,
    sampleCases: [
      {
        input: '7\n3 4 5 1 2 null null\n3\n4 1 2',
        output: 'true',
        explanation: 'subRoot matches the left subtree rooted at 4.',
      },
      {
        input: '9\n3 4 5 1 2 null null null 0\n3\n4 1 2',
        output: 'false',
        explanation: 'Node 2 has an additional child 0 in root, so it is not identical to subRoot.',
      },
    ],
    testCases: [
      { input: '7\n3 4 5 1 2 null null\n3\n4 1 2', output: 'true', isSample: true },
      { input: '9\n3 4 5 1 2 null null null 0\n3\n4 1 2', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n1\n1\n1', output: 'true', isSample: false }, // Both single node
      { input: '1\n1\n1\n2', output: 'false', isSample: false },
      { input: '3\n1 2 3\n3\n1 2 3', output: 'true', isSample: false }, // Root itself
      { input: '3\n1 2 3\n1\n2', output: 'true', isSample: false }, // Leaf subtree
      { input: '3\n1 2 3\n1\n4', output: 'false', isSample: false },
      { input: '7\n1 2 3 4 5 6 7\n3\n2 4 5', output: 'true', isSample: false },
      { input: '7\n1 2 3 4 5 6 7\n3\n3 6 7', output: 'true', isSample: false },
      { input: '5\n1 1 1 1 1\n3\n1 1 1', output: 'true', isSample: false },
      { input: '4\n1 2 null 3\n2\n2 3', output: 'true', isSample: false },
      { input: '5\n1 null 2 null 3\n2\n2 3', output: 'false', isSample: false },
    ],
    editorial: `### Method Explanation
Check if \`isSameTree(root, subRoot)\`. If not, recursively check \`isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot)\`.
Time: $\\mathcal{O}(N \\cdot M)$, Space: $\\mathcal{O}(H)$.`,
  },

  // ── 52. LOWEST COMMON ANCESTOR OF A BINARY SEARCH TREE ─────────────────────
  {
    problemCode: 'lowest-common-ancestor-of-a-bst',
    name: 'Lowest Common Ancestor of a BST',
    difficulty: 'Medium',
    tags: ['Tree', 'Depth-First Search', 'Binary Search Tree', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.

According to the definition of LCA on Wikipedia: "The lowest common ancestor is defined between two nodes \`p\` and \`q\` as the lowest node in \`T\` that has both \`p\` and \`q\` as descendants (where we allow a node to be a descendant of itself)."

### Input Format
- First line: An integer \`N\` representing token count of the BST.
- Second line: \`N\` space-separated level-order tokens.
- Third line: Two space-separated integers representing the values of nodes \`p\` and \`q\`.

### Output Format
- Print a single integer representing the value of the LCA node.

### Constraints
- $2 \\le N \\le 10^4$
- $-10^9 \\le Node.val \\le 10^9$
- All \`Node.val\` are **unique**.
- \`p\` and \`q\` will exist in the BST and $p \\ne q$.
`,
    sampleCases: [
      {
        input: '11\n6 2 8 0 4 7 9 null null 3 5\n2 8',
        output: '6',
        explanation: 'The LCA of nodes 2 and 8 is 6.',
      },
      {
        input: '11\n6 2 8 0 4 7 9 null null 3 5\n2 4',
        output: '2',
        explanation: 'The LCA of nodes 2 and 4 is 2, since a node can be a descendant of itself.',
      },
    ],
    testCases: [
      { input: '11\n6 2 8 0 4 7 9 null null 3 5\n2 8', output: '6', isSample: true },
      { input: '11\n6 2 8 0 4 7 9 null null 3 5\n2 4', output: '2', isSample: true },
      // Hidden Cases (10+)
      { input: '3\n2 1 3\n1 3', output: '2', isSample: false }, // Root LCA
      { input: '3\n2 1 3\n1 2', output: '2', isSample: false }, // Node itself
      { input: '7\n5 3 6 2 4 null null\n2 4', output: '3', isSample: false },
      { input: '7\n5 3 6 2 4 null null\n2 6', output: '5', isSample: false },
      { input: '5\n10 5 15 3 7\n3 7', output: '5', isSample: false },
      { input: '7\n20 10 30 5 15 25 35\n25 35', output: '30', isSample: false },
      { input: '7\n20 10 30 5 15 25 35\n5 35', output: '20', isSample: false },
      { input: '5\n3 1 4 null 2\n2 4', output: '3', isSample: false },
      { input: '5\n3 1 4 null 2\n2 1', output: '1', isSample: false },
      { input: '7\n50 30 70 20 40 60 80\n20 40', output: '30', isSample: false },
    ],
    editorial: `### Method Explanation
Leverage the BST property:
If both $p$ and $q$ are smaller than \`curr.val\`, LCA is in the left subtree.
If both $p$ and $q$ are greater than \`curr.val\`, LCA is in the right subtree.
Otherwise, the split point \`curr\` is the LCA.
Time: $\\mathcal{O}(H)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 53. BINARY TREE LEVEL ORDER TRAVERSAL ──────────────────────────────────
  {
    problemCode: 'binary-tree-level-order-traversal',
    name: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    tags: ['Tree', 'Breadth-First Search', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given the \`root\` of a binary tree, return the **level order traversal** of its nodes' values (i.e., from left to right, level by level).

### Input Format
- First line: An integer \`N\` representing token count.
- Second line: \`N\` space-separated level-order tokens. (Omitted if $N = 0$).

### Output Format
- Print each level on its own line as space-separated integers. (Omitted if $N = 0$).

### Constraints
- $0 \\le N \\le 2000$
- $-1000 \\le Node.val \\le 1000$
`,
    sampleCases: [
      {
        input: '7\n3 9 20 null null 15 7',
        output: '3\n9 20\n15 7',
        explanation: 'Level 0: [3], Level 1: [9, 20], Level 2: [15, 7].',
      },
      {
        input: '1\n1',
        output: '1',
        explanation: 'Single root node at level 0.',
      },
    ],
    testCases: [
      { input: '7\n3 9 20 null null 15 7', output: '3\n9 20\n15 7', isSample: true },
      { input: '1\n1', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '', isSample: false }, // N=0
      { input: '3\n1 2 3', output: '1\n2 3', isSample: false },
      { input: '4\n1 2 null 3', output: '1\n2\n3', isSample: false }, // Skewed
      { input: '7\n1 2 3 4 5 6 7', output: '1\n2 3\n4 5 6 7', isSample: false },
      { input: '5\n1 null 2 null 3', output: '1\n2\n3', isSample: false },
      { input: '6\n1 2 3 4 null 5', output: '1\n2 3\n4 5', isSample: false },
      { input: '5\n10 20 30 40 50', output: '10\n20 30\n40 50', isSample: false },
      { input: '3\n-1 -2 -3', output: '-1\n-2 -3', isSample: false },
      { input: '7\n1 2 2 3 null null 3', output: '1\n2 2\n3 3', isSample: false },
      { input: '8\n1 2 3 4 5 null 6 null 7', output: '1\n2 3\n4 5 6\n7', isSample: false },
    ],
    editorial: `### Method Explanation
Use a queue (BFS). At each step, record the current queue size $S$.
Dequeue $S$ nodes, collect their values into the current level list, and enqueue non-null children.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 54. BINARY TREE RIGHT SIDE VIEW ────────────────────────────────────────
  {
    problemCode: 'binary-tree-right-side-view',
    name: 'Binary Tree Right Side View',
    difficulty: 'Medium',
    tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given the \`root\` of a binary tree, imagine yourself standing on the **right side** of it, return the values of the nodes you can see ordered from top to bottom.

### Input Format
- First line: An integer \`N\` representing token count.
- Second line: \`N\` space-separated level-order tokens. (Omitted if $N = 0$).

### Output Format
- Print the right-side view node values as space-separated integers on a single line. (Omitted if $N = 0$).

### Constraints
- $0 \\le N \\le 100$
- $-100 \\le Node.val \\le 100$
`,
    sampleCases: [
      {
        input: '5\n1 2 3 null 5 null 4',
        output: '1 3 4',
        explanation: 'From the right side, nodes 1, 3, and 4 are visible.',
      },
      {
        input: '3\n1 null 3',
        output: '1 3',
        explanation: 'Nodes 1 and 3 are visible.',
      },
    ],
    testCases: [
      { input: '5\n1 2 3 null 5 null 4', output: '1 3 4', isSample: true },
      { input: '3\n1 null 3', output: '1 3', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '', isSample: false }, // N=0
      { input: '1\n1', output: '1', isSample: false },
      { input: '3\n1 2 3', output: '1 3', isSample: false },
      { input: '4\n1 2 3 4', output: '1 3 4', isSample: false }, // Left child deeper than right
      { input: '5\n1 2 null 3 null 4', output: '1 2 3 4', isSample: false }, // All left
      { input: '7\n1 2 3 4 5 6 7', output: '1 3 7', isSample: false }, // Full tree
      { input: '5\n1 2 3 null null 4', output: '1 3 4', isSample: false },
      { input: '6\n1 2 3 4 5', output: '1 3 5', isSample: false },
      { input: '4\n1 2 3 null 5', output: '1 3 5', isSample: false },
      { input: '3\n-1 -2 -3', output: '-1 -3', isSample: false },
    ],
    editorial: `### Method Explanation
BFS level order traversal: the last node at each level belongs to the right-side view.
Alternatively, reverse pre-order DFS (\`root -> right -> left\`) adding the first node visited at each depth level.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(H)$.`,
  },

  // ── 55. COUNT GOOD NODES IN BINARY TREE ────────────────────────────────────
  {
    problemCode: 'count-good-nodes-in-binary-tree',
    name: 'Count Good Nodes in Binary Tree',
    difficulty: 'Medium',
    tags: ['Tree', 'Depth-First Search', 'Breadth-First Search', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a binary tree \`root\`, a node \`X\` in the tree is named **good** if in the path from the root to \`X\` there are no nodes with a value greater than \`X\`.

Return the number of **good** nodes in the binary tree.

### Input Format
- First line: An integer \`N\` representing token count.
- Second line: \`N\` space-separated level-order tokens.

### Output Format
- Print a single integer representing the count of good nodes.

### Constraints
- $1 \\le N \\le 10^5$
- $-10^4 \\le Node.val \\le 10^4$
`,
    sampleCases: [
      {
        input: '7\n3 1 4 3 null 1 5',
        output: '4',
        explanation: 'Root node 3 is always good. Node 4, node 5, and node 3 are also good.',
      },
      {
        input: '4\n3 3 null 4 2',
        output: '3',
        explanation: 'Nodes 3, 3, and 4 are good. Node 2 has ancestor 4 > 2 so it is not good.',
      },
    ],
    testCases: [
      { input: '7\n3 1 4 3 null 1 5', output: '4', isSample: true },
      { input: '4\n3 3 null 4 2', output: '3', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n1', output: '1', isSample: false }, // Single node
      { input: '3\n1 2 3', output: '3', isSample: false }, // All increasing
      { input: '3\n3 2 1', output: '1', isSample: false }, // Strictly decreasing
      { input: '4\n2 2 2 2', output: '4', isSample: false }, // All equal
      { input: '5\n-1 -2 -3 -4 -5', output: '1', isSample: false }, // Negative values
      { input: '7\n9 null 3 6', output: '1', isSample: false },
      { input: '7\n2 4 4 4 4 2 4', output: '6', isSample: false },
      { input: '5\n5 4 6 3 null', output: '2', isSample: false },
      { input: '6\n1 2 3 null 4 5', output: '5', isSample: false },
      { input: '5\n10 20 null 30 null', output: '3', isSample: false },
    ],
    editorial: `### Method Explanation
DFS passing down \`max_so_far\`.
A node is good if \`node.val >= max_so_far\`. Update \`max_so_far = max(max_so_far, node.val)\` when recursing.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(H)$.`,
  },

  // ── 56. VALIDATE BINARY SEARCH TREE ────────────────────────────────────────
  {
    problemCode: 'validate-binary-search-tree',
    name: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    tags: ['Tree', 'Depth-First Search', 'Binary Search Tree', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given the \`root\` of a binary tree, determine if it is a valid binary search tree (BST).

A **valid BST** is defined as follows:
- The left subtree of a node contains only nodes with keys **strictly less than** the node's key.
- The right subtree of a node contains only nodes with keys **strictly greater than** the node's key.
- Both the left and right subtrees must also be binary search trees.

### Input Format
- First line: An integer \`N\` representing token count.
- Second line: \`N\` space-separated level-order tokens.

### Output Format
- Print \`true\` if the tree is a valid BST, or \`false\` otherwise.

### Constraints
- $1 \\le N \\le 10^4$
- $-2^{31} \\le Node.val \\le 2^{31} - 1$
`,
    sampleCases: [
      {
        input: '3\n2 1 3',
        output: 'true',
        explanation: 'Root 2 has left child 1 (< 2) and right child 3 (> 2).',
      },
      {
        input: '7\n5 1 4 null null 3 6',
        output: 'false',
        explanation: 'The root node\'s value is 5 but its right child\'s value is 4.',
      },
    ],
    testCases: [
      { input: '3\n2 1 3', output: 'true', isSample: true },
      { input: '7\n5 1 4 null null 3 6', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n10', output: 'true', isSample: false }, // Single node
      { input: '2\n1 1', output: 'false', isSample: false }, // Duplicate value not allowed
      { input: '5\n5 4 6 null null 3 7', output: 'false', isSample: false }, // Subtree violates ancestor constraint (3 in right of 5)
      { input: '3\n1 1 null', output: 'false', isSample: false },
      { input: '3\n2 2 2', output: 'false', isSample: false },
      { input: '7\n10 5 15 null null 6 20', output: 'false', isSample: false }, // 6 in right subtree of 10
      { input: '7\n10 5 15 2 7 12 20', output: 'true', isSample: false }, // Valid full BST
      { input: '1\n2147483647', output: 'true', isSample: false }, // Max 32-bit int
      { input: '1\n-2147483648', output: 'true', isSample: false }, // Min 32-bit int
      { input: '4\n3 1 5 null 2', output: 'true', isSample: false },
    ],
    editorial: `### Method Explanation
DFS passing valid bounds \`(low, high)\`.
Check \`low < node.val < high\`. When going left, update \`high = node.val\`. When going right, update \`low = node.val\`.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(H)$.`,
  },

  // ── 57. KTH SMALLEST ELEMENT IN A BST ──────────────────────────────────────
  {
    problemCode: 'kth-smallest-element-in-a-bst',
    name: 'Kth Smallest Element in a BST',
    difficulty: 'Medium',
    tags: ['Tree', 'Depth-First Search', 'Binary Search Tree', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given the \`root\` of a binary search tree, and an integer \`k\`, return the \`k\`-th smallest value (**1-indexed**) of all the values of the nodes in the tree.

### Input Format
- First line: Two space-separated integers \`N\` (token count) and \`k\`.
- Second line: \`N\` space-separated level-order tokens.

### Output Format
- Print a single integer representing the $k$-th smallest element.

### Constraints
- The number of nodes in the tree is \`n\`.
- $1 \\le k \\le n \\le 10^4$
- $0 \\le Node.val \\le 10^4$
`,
    sampleCases: [
      {
        input: '4 1\n3 1 4 null 2',
        output: '1',
        explanation: 'In-order traversal: [1, 2, 3, 4]. The 1st smallest is 1.',
      },
      {
        input: '9 3\n5 3 6 2 4 null null 1',
        output: '3',
        explanation: 'In-order: [1, 2, 3, 4, 5, 6]. The 3rd smallest is 3.',
      },
    ],
    testCases: [
      { input: '4 1\n3 1 4 null 2', output: '1', isSample: true },
      { input: '9 3\n5 3 6 2 4 null null 1', output: '3', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1\n5', output: '5', isSample: false }, // n=1, k=1
      { input: '3 2\n2 1 3', output: '2', isSample: false }, // k in middle
      { input: '3 3\n2 1 3', output: '3', isSample: false }, // k at max
      { input: '7 1\n4 2 6 1 3 5 7', output: '1', isSample: false },
      { input: '7 4\n4 2 6 1 3 5 7', output: '4', isSample: false },
      { input: '7 7\n4 2 6 1 3 5 7', output: '7', isSample: false },
      { input: '5 2\n1 null 2 null 3', output: '2', isSample: false },
      { input: '4 2\n4 2 null 1', output: '2', isSample: false },
      { input: '5 5\n5 3 6 2 4 null null 1', output: '5', isSample: false },
      { input: '6 4\n10 5 15 2 7 null 20', output: '10', isSample: false },
    ],
    editorial: `### Method Explanation
In-order traversal of a BST visits nodes in strictly increasing order.
Stop and return the $k$-th visited node.
Time: $\\mathcal{O}(H + k)$, Space: $\\mathcal{O}(H)$.`,
  },

  // ── 58. CONSTRUCT BINARY TREE FROM PREORDER AND INORDER TRAVERSAL ──────────
  {
    problemCode: 'construct-binary-tree-from-preorder-and-inorder',
    name: 'Construct Binary Tree from Preorder and Inorder Traversal',
    difficulty: 'Medium',
    tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Tree', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given two integer arrays \`preorder\` and \`inorder\` where \`preorder\` is the preorder traversal of a binary tree and \`inorder\` is the inorder traversal of the same tree, construct and return the binary tree.

### Input Format
- First line: An integer \`N\` representing array length.
- Second line: \`N\` space-separated integers for \`preorder\`.
- Third line: \`N\` space-separated integers for \`inorder\`.

### Output Format
- Print the level-order traversal of the reconstructed tree with \`null\` for missing nodes.

### Constraints
- $1 \\le N \\le 3000$
- $-3000 \\le preorder[i], inorder[i] \\le 3000$
- \`preorder\` and \`inorder\` consist of **unique** values.
- Each value of \`inorder\` also appears in \`preorder\`.
`,
    sampleCases: [
      {
        input: '5\n3 9 20 15 7\n9 3 15 20 7',
        output: '3 9 20 null null 15 7',
        explanation: 'The reconstructed tree matches level order [3, 9, 20, null, null, 15, 7].',
      },
      {
        input: '1\n-1\n-1',
        output: '-1',
        explanation: 'Single node reconstructed.',
      },
    ],
    testCases: [
      { input: '5\n3 9 20 15 7\n9 3 15 20 7', output: '3 9 20 null null 15 7', isSample: true },
      { input: '1\n-1\n-1', output: '-1', isSample: true },
      // Hidden Cases (10+)
      { input: '2\n1 2\n2 1', output: '1 2', isSample: false }, // Left child only
      { input: '2\n1 2\n1 2', output: '1 null 2', isSample: false }, // Right child only
      { input: '3\n1 2 3\n2 1 3', output: '1 2 3', isSample: false },
      { input: '3\n1 2 3\n3 2 1', output: '1 2 null 3', isSample: false }, // Left skewed
      { input: '3\n1 2 3\n1 2 3', output: '1 null 2 null 3', isSample: false }, // Right skewed
      { input: '7\n1 2 4 5 3 6 7\n4 2 5 1 6 3 7', output: '1 2 3 4 5 6 7', isSample: false }, // Full tree
      { input: '4\n1 2 3 4\n2 1 4 3', output: '1 2 3 null null 4', isSample: false },
      { input: '4\n10 20 30 40\n20 10 30 40', output: '10 20 30 null null null 40', isSample: false },
      { input: '5\n1 2 4 5 3\n4 2 5 1 3', output: '1 2 3 4 5', isSample: false },
      { input: '3\n-1 -2 -3\n-2 -1 -3', output: '-1 -2 -3', isSample: false },
    ],
    editorial: `### Method Explanation
The first element of \`preorder\` is always the root.
Locate root in \`inorder\` using a hash map. Everything to the left is the left subtree, and to the right is the right subtree.
Recursively build subtrees.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 59. BINARY TREE MAXIMUM PATH SUM ───────────────────────────────────────
  {
    problemCode: 'binary-tree-maximum-path-sum',
    name: 'Binary Tree Maximum Path Sum',
    difficulty: 'Hard',
    tags: ['Dynamic Programming', 'Tree', 'Depth-First Search', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
A **path** in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence **at most once**. Note that the path does not need to pass through the root.

The **path sum** of a path is the sum of the node's values in the path.

Given the \`root\` of a binary tree, return the **maximum path sum** of any non-empty path.

### Input Format
- First line: An integer \`N\` representing token count.
- Second line: \`N\` space-separated level-order tokens.

### Output Format
- Print a single integer representing the maximum path sum.

### Constraints
- $1 \\le N \\le 3 \\cdot 10^4$
- $-1000 \\le Node.val \\le 1000$
`,
    sampleCases: [
      {
        input: '3\n1 2 3',
        output: '6',
        explanation: 'Path 2 -> 1 -> 3 gives the optimal sum: 2 + 1 + 3 = 6.',
      },
      {
        input: '7\n-10 9 20 null null 15 7',
        output: '42',
        explanation: 'Path 15 -> 20 -> 7 gives max sum: 15 + 20 + 7 = 42.',
      },
    ],
    testCases: [
      { input: '3\n1 2 3', output: '6', isSample: true },
      { input: '7\n-10 9 20 null null 15 7', output: '42', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n-3', output: '-3', isSample: false }, // Single negative node
      { input: '1\n100', output: '100', isSample: false },
      { input: '3\n2 -1 -2', output: '2', isSample: false }, // Negative children ignored
      { input: '5\n-2 1 null -1 null', output: '1', isSample: false },
      { input: '5\n1 -2 3', output: '4', isSample: false }, // 1 + 3
      { input: '7\n5 4 8 11 null 13 4', output: '35', isSample: false },
      { input: '3\n-3 -2 -1', output: '-1', isSample: false }, // All negative
      { input: '7\n1 2 3 4 5 6 7', output: '18', isSample: false }, // 5 + 2 + 1 + 3 + 7 = 18
      { input: '5\n9 6 -3 null null -6 2', output: '16', isSample: false },
      { input: '5\n2 -1 null null null', output: '2', isSample: false },
    ],
    editorial: `### Method Explanation
For each node, compute the maximum gain from its left and right subtrees (bounded at 0 to ignore negative paths).
The maximum path sum passing through this node is \`node.val + left_gain + right_gain\`.
Return \`node.val + max(left_gain, right_gain)\` to parent.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(H)$.`,
  },

  // ── 60. SERIALIZE AND DESERIALIZE BINARY TREE ──────────────────────────────
  {
    problemCode: 'serialize-and-deserialize-binary-tree',
    name: 'Serialize and Deserialize Binary Tree',
    difficulty: 'Hard',
    tags: ['String', 'Tree', 'Depth-First Search', 'Breadth-First Search', 'Design', 'Binary Tree'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment.

Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work.

In this judge environment:
Input: A binary tree represented in level-order tokens.
Your program must parse, serialize to string, deserialize back to binary tree, and print the resulting level-order tokens.

### Input Format
- First line: An integer \`N\` representing token count.
- Second line: \`N\` space-separated level-order tokens. (Omitted if $N = 0$).

### Output Format
- Print the reconstructed level-order tokens separated by a space. (Omitted if $N = 0$).

### Constraints
- $0 \\le N \\le 10^4$
- $-1000 \\le Node.val \\le 1000$
`,
    sampleCases: [
      {
        input: '5\n1 2 3 null null 4 5',
        output: '1 2 3 null null 4 5',
        explanation: 'Tree serialized and deserialized accurately.',
      },
      {
        input: '0',
        output: '',
        explanation: 'Empty tree produces empty output.',
      },
    ],
    testCases: [
      { input: '5\n1 2 3 null null 4 5', output: '1 2 3 null null 4 5', isSample: true },
      { input: '0', output: '', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n1', output: '1', isSample: false },
      { input: '2\n1 2', output: '1 2', isSample: false },
      { input: '3\n1 2 null', output: '1 2', isSample: false },
      { input: '3\n1 null 2', output: '1 null 2', isSample: false },
      { input: '7\n1 2 3 4 5 6 7', output: '1 2 3 4 5 6 7', isSample: false },
      { input: '4\n-1 -2 -3 -4', output: '-1 -2 -3 -4', isSample: false },
      { input: '5\n10 null 20 null 30', output: '10 null 20 null 30', isSample: false },
      { input: '5\n4 -7 -3 null -9', output: '4 -7 -3 null -9', isSample: false },
      { input: '3\n5 3 6', output: '5 3 6', isSample: false },
      { input: '6\n1 2 3 null 4 null', output: '1 2 3 null 4', isSample: false },
    ],
    editorial: `### Method Explanation
Preorder DFS with delimiter: append \`node.val + ","\` or \`"#, "\` for nulls.
Deserialization: Split into iterator and recursively reconstruct node, left, and right.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(N)$.`,
  },
];
