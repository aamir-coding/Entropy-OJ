import { ProblemDifficulty } from '@entropy-oj/shared';

export interface IStarProblem {
  id: string;
  code: string;
  title: string;
  difficulty: ProblemDifficulty;
  category: string;
  order: number; // 1 to 150
  orbitAngleDeg: number; // 0 to 360
  orbitRadius: number;   // radial distance in px when blossomed
}

export interface IStarCluster {
  id: string;
  name: string;
  designation: string;
  sector: 'I' | 'II' | 'III';
  sectorName: string;
  sectorDescription: string;
  spectralColor: string;
  coronaGlow: string;
  bgGlow: string;
  problems: IStarProblem[];
}

export const STAR_CLUSTERS: IStarCluster[] = [
  // ── SECTOR I: THE GENESIS SHALLOWS (Sapphire / Deep Blue) ────────────────
  {
    id: 'arrays-hashing',
    name: 'Arrays & Hashing',
    designation: 'SGR A*',
    sector: 'I',
    sectorName: 'Sector I: The Genesis Shallows',
    sectorDescription: 'Foundational memory architectures and fast hash lookups',
    spectralColor: '#38bdf8', // radiant sky blue
    coronaGlow: 'rgba(56, 189, 248, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '1', code: 'contains-duplicate', title: 'Contains Duplicate', difficulty: 'Easy', category: 'Arrays & Hashing', order: 1, orbitAngleDeg: 0, orbitRadius: 155 },
      { id: '2', code: 'valid-anagram', title: 'Valid Anagram', difficulty: 'Easy', category: 'Arrays & Hashing', order: 2, orbitAngleDeg: 40, orbitRadius: 175 },
      { id: '3', code: 'two-sum', title: 'Two Sum', difficulty: 'Easy', category: 'Arrays & Hashing', order: 3, orbitAngleDeg: 80, orbitRadius: 155 },
      { id: '4', code: 'group-anagrams', title: 'Group Anagrams', difficulty: 'Medium', category: 'Arrays & Hashing', order: 4, orbitAngleDeg: 120, orbitRadius: 180 },
      { id: '5', code: 'top-k-frequent-elements', title: 'Top K Frequent Elements', difficulty: 'Medium', category: 'Arrays & Hashing', order: 5, orbitAngleDeg: 160, orbitRadius: 160 },
      { id: '6', code: 'product-of-array-except-self', title: 'Product of Array Except Self', difficulty: 'Medium', category: 'Arrays & Hashing', order: 6, orbitAngleDeg: 200, orbitRadius: 175 },
      { id: '7', code: 'valid-sudoku', title: 'Valid Sudoku', difficulty: 'Medium', category: 'Arrays & Hashing', order: 7, orbitAngleDeg: 240, orbitRadius: 155 },
      { id: '8', code: 'encode-and-decode-strings', title: 'Encode and Decode Strings', difficulty: 'Medium', category: 'Arrays & Hashing', order: 8, orbitAngleDeg: 280, orbitRadius: 180 },
      { id: '9', code: 'longest-consecutive-sequence', title: 'Longest Consecutive Sequence', difficulty: 'Medium', category: 'Arrays & Hashing', order: 9, orbitAngleDeg: 320, orbitRadius: 165 },
    ],
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers',
    designation: 'OJ 287',
    sector: 'I',
    sectorName: 'Sector I: The Genesis Shallows',
    sectorDescription: 'Converging index trajectories and boundary trapping',
    spectralColor: '#22d3ee', // vivid cyan
    coronaGlow: 'rgba(34, 211, 238, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(34, 211, 238, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '10', code: 'valid-palindrome', title: 'Valid Palindrome', difficulty: 'Easy', category: 'Two Pointers', order: 10, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '11', code: 'two-sum-ii', title: 'Two Sum II - Sorted Array', difficulty: 'Medium', category: 'Two Pointers', order: 11, orbitAngleDeg: 72, orbitRadius: 175 },
      { id: '12', code: 'three-sum', title: '3Sum', difficulty: 'Medium', category: 'Two Pointers', order: 12, orbitAngleDeg: 144, orbitRadius: 160 },
      { id: '13', code: 'container-with-most-water', title: 'Container With Most Water', difficulty: 'Medium', category: 'Two Pointers', order: 13, orbitAngleDeg: 216, orbitRadius: 180 },
      { id: '14', code: 'trapping-rain-water', title: 'Trapping Rain Water', difficulty: 'Hard', category: 'Two Pointers', order: 14, orbitAngleDeg: 288, orbitRadius: 170 },
    ],
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    designation: 'CYG X-1',
    sector: 'I',
    sectorName: 'Sector I: The Genesis Shallows',
    sectorDescription: 'Dynamic range filters and rolling sub-segment states',
    spectralColor: '#60a5fa', // radiant blue
    coronaGlow: 'rgba(96, 165, 250, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(96, 165, 250, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '15', code: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy & Sell Stock', difficulty: 'Easy', category: 'Sliding Window', order: 15, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '16', code: 'longest-unique-substring', title: 'Longest Substring Without Repeats', difficulty: 'Medium', category: 'Sliding Window', order: 16, orbitAngleDeg: 60, orbitRadius: 180 },
      { id: '17', code: 'longest-repeating-character-replacement', title: 'Longest Repeating Replacement', difficulty: 'Medium', category: 'Sliding Window', order: 17, orbitAngleDeg: 120, orbitRadius: 160 },
      { id: '18', code: 'permutation-in-string', title: 'Permutation in String', difficulty: 'Medium', category: 'Sliding Window', order: 18, orbitAngleDeg: 180, orbitRadius: 180 },
      { id: '19', code: 'minimum-window-substring', title: 'Minimum Window Substring', difficulty: 'Hard', category: 'Sliding Window', order: 19, orbitAngleDeg: 240, orbitRadius: 165 },
      { id: '20', code: 'sliding-window-maximum', title: 'Sliding Window Maximum', difficulty: 'Hard', category: 'Sliding Window', order: 20, orbitAngleDeg: 300, orbitRadius: 185 },
    ],
  },

  // ── SECTOR II: THE QUANTUM RIFT (Violet / Electric Cyan / Emerald) ────────
  {
    id: 'stack',
    name: 'Stack',
    designation: 'GW 150914',
    sector: 'II',
    sectorName: 'Sector II: The Quantum Rift',
    sectorDescription: 'LIFO depth accumulators and monotonic sequences',
    spectralColor: '#a78bfa', // purple
    coronaGlow: 'rgba(167, 139, 250, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(167, 139, 250, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '21', code: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'Easy', category: 'Stack', order: 21, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '22', code: 'min-stack', title: 'Min Stack', difficulty: 'Medium', category: 'Stack', order: 22, orbitAngleDeg: 51, orbitRadius: 180 },
      { id: '23', code: 'evaluate-reverse-polish-notation', title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', category: 'Stack', order: 23, orbitAngleDeg: 102, orbitRadius: 160 },
      { id: '24', code: 'generate-parentheses', title: 'Generate Parentheses', difficulty: 'Medium', category: 'Stack', order: 24, orbitAngleDeg: 154, orbitRadius: 180 },
      { id: '25', code: 'daily-temperatures', title: 'Daily Temperatures', difficulty: 'Medium', category: 'Stack', order: 25, orbitAngleDeg: 205, orbitRadius: 165 },
      { id: '26', code: 'car-fleet', title: 'Car Fleet', difficulty: 'Medium', category: 'Stack', order: 26, orbitAngleDeg: 257, orbitRadius: 180 },
      { id: '27', code: 'largest-rectangle-in-histogram', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', category: 'Stack', order: 27, orbitAngleDeg: 308, orbitRadius: 170 },
    ],
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    designation: 'SS 433',
    sector: 'II',
    sectorName: 'Sector II: The Quantum Rift',
    sectorDescription: 'Logarithmic division of sorted celestial search spaces',
    spectralColor: '#06b6d4', // deep cyan
    coronaGlow: 'rgba(6, 182, 212, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(6, 182, 212, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '28', code: 'binary-search', title: 'Binary Search', difficulty: 'Easy', category: 'Binary Search', order: 28, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '29', code: 'search-a-2d-matrix', title: 'Search a 2D Matrix', difficulty: 'Medium', category: 'Binary Search', order: 29, orbitAngleDeg: 51, orbitRadius: 175 },
      { id: '30', code: 'koko-eating-bananas', title: 'Koko Eating Bananas', difficulty: 'Medium', category: 'Binary Search', order: 30, orbitAngleDeg: 102, orbitRadius: 160 },
      { id: '31', code: 'find-minimum-in-rotated-sorted-array', title: 'Find Min in Rotated Array', difficulty: 'Medium', category: 'Binary Search', order: 31, orbitAngleDeg: 154, orbitRadius: 180 },
      { id: '32', code: 'search-in-rotated-sorted-array', title: 'Search in Rotated Array', difficulty: 'Medium', category: 'Binary Search', order: 32, orbitAngleDeg: 205, orbitRadius: 165 },
      { id: '33', code: 'time-based-key-value-store', title: 'Time Based Key-Value Store', difficulty: 'Medium', category: 'Binary Search', order: 33, orbitAngleDeg: 257, orbitRadius: 180 },
      { id: '34', code: 'median-of-two-sorted-arrays', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', category: 'Binary Search', order: 34, orbitAngleDeg: 308, orbitRadius: 170 },
    ],
  },
  {
    id: 'linked-list',
    name: 'Linked List',
    designation: 'Q2237+030',
    sector: 'II',
    sectorName: 'Sector II: The Quantum Rift',
    sectorDescription: 'Unidirectional and circular pointer linkages',
    spectralColor: '#10b981', // emerald
    coronaGlow: 'rgba(16, 185, 129, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '35', code: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy', category: 'Linked List', order: 35, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '36', code: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', difficulty: 'Easy', category: 'Linked List', order: 36, orbitAngleDeg: 33, orbitRadius: 180 },
      { id: '37', code: 'reorder-list', title: 'Reorder List', difficulty: 'Medium', category: 'Linked List', order: 37, orbitAngleDeg: 65, orbitRadius: 160 },
      { id: '38', code: 'remove-nth-node-from-end-of-list', title: 'Remove Nth Node From End', difficulty: 'Medium', category: 'Linked List', order: 38, orbitAngleDeg: 98, orbitRadius: 185 },
      { id: '39', code: 'copy-list-with-random-pointer', title: 'Copy List with Random Pointer', difficulty: 'Medium', category: 'Linked List', order: 39, orbitAngleDeg: 130, orbitRadius: 165 },
      { id: '40', code: 'add-two-numbers', title: 'Add Two Numbers', difficulty: 'Medium', category: 'Linked List', order: 40, orbitAngleDeg: 163, orbitRadius: 180 },
      { id: '41', code: 'linked-list-cycle', title: 'Linked List Cycle', difficulty: 'Easy', category: 'Linked List', order: 41, orbitAngleDeg: 196, orbitRadius: 160 },
      { id: '42', code: 'find-the-duplicate-number', title: 'Find the Duplicate Number', difficulty: 'Medium', category: 'Linked List', order: 42, orbitAngleDeg: 229, orbitRadius: 185 },
      { id: '43', code: 'lru-cache', title: 'LRU Cache', difficulty: 'Medium', category: 'Linked List', order: 43, orbitAngleDeg: 261, orbitRadius: 165 },
      { id: '44', code: 'merge-k-sorted-lists', title: 'Merge k Sorted Lists', difficulty: 'Hard', category: 'Linked List', order: 44, orbitAngleDeg: 294, orbitRadius: 180 },
      { id: '45', code: 'reverse-nodes-in-k-group', title: 'Reverse Nodes in k-Group', difficulty: 'Hard', category: 'Linked List', order: 45, orbitAngleDeg: 327, orbitRadius: 170 },
    ],
  },
  {
    id: 'trees',
    name: 'Trees & BST',
    designation: 'SWIFT J1644',
    sector: 'II',
    sectorName: 'Sector II: The Quantum Rift',
    sectorDescription: 'Branching hierarchies, recursive traversals, and balance factors',
    spectralColor: '#22c55e', // vivid green
    coronaGlow: 'rgba(34, 197, 94, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(34, 197, 94, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '46', code: 'invert-binary-tree', title: 'Invert Binary Tree', difficulty: 'Easy', category: 'Trees', order: 46, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '47', code: 'maximum-depth-of-binary-tree', title: 'Max Depth of Binary Tree', difficulty: 'Easy', category: 'Trees', order: 47, orbitAngleDeg: 24, orbitRadius: 185 },
      { id: '48', code: 'diameter-of-binary-tree', title: 'Diameter of Binary Tree', difficulty: 'Easy', category: 'Trees', order: 48, orbitAngleDeg: 48, orbitRadius: 160 },
      { id: '49', code: 'balanced-binary-tree', title: 'Balanced Binary Tree', difficulty: 'Easy', category: 'Trees', order: 49, orbitAngleDeg: 72, orbitRadius: 185 },
      { id: '50', code: 'same-tree', title: 'Same Tree', difficulty: 'Easy', category: 'Trees', order: 50, orbitAngleDeg: 96, orbitRadius: 165 },
      { id: '51', code: 'subtree-of-another-tree', title: 'Subtree of Another Tree', difficulty: 'Easy', category: 'Trees', order: 51, orbitAngleDeg: 120, orbitRadius: 185 },
      { id: '52', code: 'lowest-common-ancestor-of-a-bst', title: 'LCA of a BST', difficulty: 'Medium', category: 'Trees', order: 52, orbitAngleDeg: 144, orbitRadius: 160 },
      { id: '53', code: 'binary-tree-level-order-traversal', title: 'Level Order Traversal', difficulty: 'Medium', category: 'Trees', order: 53, orbitAngleDeg: 168, orbitRadius: 185 },
      { id: '54', code: 'binary-tree-right-side-view', title: 'Right Side View', difficulty: 'Medium', category: 'Trees', order: 54, orbitAngleDeg: 192, orbitRadius: 165 },
      { id: '55', code: 'count-good-nodes-in-binary-tree', title: 'Count Good Nodes in Tree', difficulty: 'Medium', category: 'Trees', order: 55, orbitAngleDeg: 216, orbitRadius: 185 },
      { id: '56', code: 'validate-binary-search-tree', title: 'Validate Binary Search Tree', difficulty: 'Medium', category: 'Trees', order: 56, orbitAngleDeg: 240, orbitRadius: 160 },
      { id: '57', code: 'kth-smallest-element-in-a-bst', title: 'Kth Smallest in a BST', difficulty: 'Medium', category: 'Trees', order: 57, orbitAngleDeg: 264, orbitRadius: 185 },
      { id: '58', code: 'construct-binary-tree-from-preorder-and-inorder', title: 'Construct Tree from Traversals', difficulty: 'Medium', category: 'Trees', order: 58, orbitAngleDeg: 288, orbitRadius: 165 },
      { id: '59', code: 'binary-tree-maximum-path-sum', title: 'Binary Tree Max Path Sum', difficulty: 'Hard', category: 'Trees', order: 59, orbitAngleDeg: 312, orbitRadius: 190 },
      { id: '60', code: 'serialize-and-deserialize-binary-tree', title: 'Serialize & Deserialize Tree', difficulty: 'Hard', category: 'Trees', order: 60, orbitAngleDeg: 336, orbitRadius: 170 },
    ],
  },
  {
    id: 'tries',
    name: 'Tries',
    designation: 'NGC 1275',
    sector: 'II',
    sectorName: 'Sector II: The Quantum Rift',
    sectorDescription: 'Prefix tree indexing and fast lexicon lookup webs',
    spectralColor: '#14b8a6', // teal
    coronaGlow: 'rgba(20, 184, 166, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(20, 184, 166, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '61', code: 'implement-trie-prefix-tree', title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', category: 'Tries', order: 61, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '62', code: 'design-add-and-search-words-data-structure', title: 'Design Add & Search Words', difficulty: 'Medium', category: 'Tries', order: 62, orbitAngleDeg: 120, orbitRadius: 175 },
      { id: '63', code: 'word-search-ii', title: 'Word Search II', difficulty: 'Hard', category: 'Tries', order: 63, orbitAngleDeg: 240, orbitRadius: 165 },
    ],
  },
  {
    id: 'heap',
    name: 'Heap / Priority Queue',
    designation: 'J1148+1930',
    sector: 'II',
    sectorName: 'Sector II: The Quantum Rift',
    sectorDescription: 'Priority ordering, min/max extraction, and streaming medians',
    spectralColor: '#eab308', // amber
    coronaGlow: 'rgba(234, 179, 8, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(234, 179, 8, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '64', code: 'kth-largest-element-in-a-stream', title: 'Kth Largest in a Stream', difficulty: 'Easy', category: 'Heap / Priority Queue', order: 64, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '65', code: 'last-stone-weight', title: 'Last Stone Weight', difficulty: 'Easy', category: 'Heap / Priority Queue', order: 65, orbitAngleDeg: 51, orbitRadius: 180 },
      { id: '66', code: 'k-closest-points-to-origin', title: 'K Closest Points to Origin', difficulty: 'Medium', category: 'Heap / Priority Queue', order: 66, orbitAngleDeg: 102, orbitRadius: 160 },
      { id: '67', code: 'kth-largest-element', title: 'Kth Largest Element in Array', difficulty: 'Medium', category: 'Heap / Priority Queue', order: 67, orbitAngleDeg: 154, orbitRadius: 180 },
      { id: '68', code: 'task-scheduler', title: 'Task Scheduler', difficulty: 'Medium', category: 'Heap / Priority Queue', order: 68, orbitAngleDeg: 205, orbitRadius: 165 },
      { id: '69', code: 'design-twitter', title: 'Design Twitter', difficulty: 'Medium', category: 'Heap / Priority Queue', order: 69, orbitAngleDeg: 257, orbitRadius: 180 },
      { id: '70', code: 'find-median-from-data-stream', title: 'Find Median from Data Stream', difficulty: 'Hard', category: 'Heap / Priority Queue', order: 70, orbitAngleDeg: 308, orbitRadius: 170 },
    ],
  },

  // ── SECTOR III: THE EVENT HORIZON (Magenta / Crimson / Magma Ember) ───────
  {
    id: 'backtracking',
    name: 'Backtracking',
    designation: 'MAXI J1820',
    sector: 'III',
    sectorName: 'Sector III: The Event Horizon',
    sectorDescription: 'Combinatorial space traversal, state pruning, and constraint solvers',
    spectralColor: '#f97316', // bright orange
    coronaGlow: 'rgba(249, 115, 22, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(249, 115, 22, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '71', code: 'subsets', title: 'Subsets', difficulty: 'Medium', category: 'Backtracking', order: 71, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '72', code: 'combination-sum', title: 'Combination Sum', difficulty: 'Medium', category: 'Backtracking', order: 72, orbitAngleDeg: 40, orbitRadius: 180 },
      { id: '73', code: 'permutations', title: 'Permutations', difficulty: 'Medium', category: 'Backtracking', order: 73, orbitAngleDeg: 80, orbitRadius: 160 },
      { id: '74', code: 'subsets-ii', title: 'Subsets II', difficulty: 'Medium', category: 'Backtracking', order: 74, orbitAngleDeg: 120, orbitRadius: 180 },
      { id: '75', code: 'combination-sum-ii', title: 'Combination Sum II', difficulty: 'Medium', category: 'Backtracking', order: 75, orbitAngleDeg: 160, orbitRadius: 165 },
      { id: '76', code: 'word-search', title: 'Word Search', difficulty: 'Medium', category: 'Backtracking', order: 76, orbitAngleDeg: 200, orbitRadius: 180 },
      { id: '77', code: 'palindrome-partitioning', title: 'Palindrome Partitioning', difficulty: 'Medium', category: 'Backtracking', order: 77, orbitAngleDeg: 240, orbitRadius: 160 },
      { id: '78', code: 'letter-combinations-of-a-phone-number', title: 'Letter Combos of Phone', difficulty: 'Medium', category: 'Backtracking', order: 78, orbitAngleDeg: 280, orbitRadius: 180 },
      { id: '79', code: 'n-queens', title: 'N-Queens', difficulty: 'Hard', category: 'Backtracking', order: 79, orbitAngleDeg: 320, orbitRadius: 170 },
    ],
  },
  {
    id: 'graphs',
    name: 'Graphs',
    designation: 'GRO J1655',
    sector: 'III',
    sectorName: 'Sector III: The Event Horizon',
    sectorDescription: 'BFS, DFS, topological sorting, and union-find connectivity',
    spectralColor: '#38bdf8', // vivid cyan
    coronaGlow: 'rgba(56, 189, 248, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '80', code: 'number-of-islands', title: 'Number of Islands', difficulty: 'Medium', category: 'Graphs', order: 80, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '81', code: 'max-area-of-island', title: 'Max Area of Island', difficulty: 'Medium', category: 'Graphs', order: 81, orbitAngleDeg: 28, orbitRadius: 185 },
      { id: '82', code: 'clone-graph', title: 'Clone Graph', difficulty: 'Medium', category: 'Graphs', order: 82, orbitAngleDeg: 55, orbitRadius: 160 },
      { id: '83', code: 'walls-and-gates', title: 'Walls and Gates', difficulty: 'Medium', category: 'Graphs', order: 83, orbitAngleDeg: 83, orbitRadius: 185 },
      { id: '84', code: 'rotting-oranges', title: 'Rotting Oranges', difficulty: 'Medium', category: 'Graphs', order: 84, orbitAngleDeg: 111, orbitRadius: 165 },
      { id: '85', code: 'pacific-atlantic-water-flow', title: 'Pacific Atlantic Flow', difficulty: 'Medium', category: 'Graphs', order: 85, orbitAngleDeg: 138, orbitRadius: 185 },
      { id: '86', code: 'surrounded-regions', title: 'Surrounded Regions', difficulty: 'Medium', category: 'Graphs', order: 86, orbitAngleDeg: 166, orbitRadius: 160 },
      { id: '87', code: 'course-schedule', title: 'Course Schedule', difficulty: 'Medium', category: 'Graphs', order: 87, orbitAngleDeg: 194, orbitRadius: 185 },
      { id: '88', code: 'course-schedule-ii', title: 'Course Schedule II', difficulty: 'Medium', category: 'Graphs', order: 88, orbitAngleDeg: 222, orbitRadius: 165 },
      { id: '89', code: 'graph-valid-tree', title: 'Graph Valid Tree', difficulty: 'Medium', category: 'Graphs', order: 89, orbitAngleDeg: 249, orbitRadius: 185 },
      { id: '90', code: 'number-of-connected-components', title: 'Connected Components', difficulty: 'Medium', category: 'Graphs', order: 90, orbitAngleDeg: 277, orbitRadius: 160 },
      { id: '91', code: 'redundant-connection', title: 'Redundant Connection', difficulty: 'Medium', category: 'Graphs', order: 91, orbitAngleDeg: 305, orbitRadius: 185 },
      { id: '92', code: 'word-ladder', title: 'Word Ladder', difficulty: 'Hard', category: 'Graphs', order: 92, orbitAngleDeg: 332, orbitRadius: 170 },
    ],
  },
  {
    id: 'advanced-graphs',
    name: 'Advanced Graphs',
    designation: 'GRS 1915',
    sector: 'III',
    sectorName: 'Sector III: The Event Horizon',
    sectorDescription: 'Shortest paths, Dijkstra, minimum spanning trees, and network flow',
    spectralColor: '#818cf8', // indigo
    coronaGlow: 'rgba(129, 140, 248, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(129, 140, 248, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '93', code: 'reconstruct-itinerary', title: 'Reconstruct Itinerary', difficulty: 'Hard', category: 'Advanced Graphs', order: 93, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '94', code: 'min-cost-to-connect-all-points', title: 'Min Cost to Connect Points', difficulty: 'Medium', category: 'Advanced Graphs', order: 94, orbitAngleDeg: 60, orbitRadius: 180 },
      { id: '95', code: 'network-delay-time', title: 'Network Delay Time', difficulty: 'Medium', category: 'Advanced Graphs', order: 95, orbitAngleDeg: 120, orbitRadius: 160 },
      { id: '96', code: 'swim-in-rising-water', title: 'Swim in Rising Water', difficulty: 'Hard', category: 'Advanced Graphs', order: 96, orbitAngleDeg: 180, orbitRadius: 180 },
      { id: '97', code: 'alien-dictionary', title: 'Alien Dictionary', difficulty: 'Hard', category: 'Advanced Graphs', order: 97, orbitAngleDeg: 240, orbitRadius: 165 },
      { id: '98', code: 'cheapest-flights-within-k-stops', title: 'Cheapest Flights K Stops', difficulty: 'Medium', category: 'Advanced Graphs', order: 98, orbitAngleDeg: 300, orbitRadius: 180 },
    ],
  },
  {
    id: '1d-dp',
    name: '1-D Dynamic Programming',
    designation: 'M87*',
    sector: 'III',
    sectorName: 'Sector III: The Event Horizon',
    sectorDescription: 'Optimal substructure, memoized recurrence, and knapsack transitions',
    spectralColor: '#f43f5e', // rose crimson
    coronaGlow: 'rgba(244, 63, 94, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(244, 63, 94, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '99', code: 'climbing-stairs', title: 'Climbing Stairs', difficulty: 'Easy', category: '1-D Dynamic Programming', order: 99, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '100', code: 'min-cost-climbing-stairs', title: 'Min Cost Climbing Stairs', difficulty: 'Easy', category: '1-D Dynamic Programming', order: 100, orbitAngleDeg: 30, orbitRadius: 185 },
      { id: '101', code: 'house-robber', title: 'House Robber', difficulty: 'Medium', category: '1-D Dynamic Programming', order: 101, orbitAngleDeg: 60, orbitRadius: 160 },
      { id: '102', code: 'house-robber-ii', title: 'House Robber II', difficulty: 'Medium', category: '1-D Dynamic Programming', order: 102, orbitAngleDeg: 90, orbitRadius: 185 },
      { id: '103', code: 'longest-palindromic-substring', title: 'Longest Palindromic Substring', difficulty: 'Medium', category: '1-D Dynamic Programming', order: 103, orbitAngleDeg: 120, orbitRadius: 165 },
      { id: '104', code: 'palindromic-substrings', title: 'Palindromic Substrings', difficulty: 'Medium', category: '1-D Dynamic Programming', order: 104, orbitAngleDeg: 150, orbitRadius: 185 },
      { id: '105', code: 'decode-ways', title: 'Decode Ways', difficulty: 'Medium', category: '1-D Dynamic Programming', order: 105, orbitAngleDeg: 180, orbitRadius: 160 },
      { id: '106', code: 'coin-change', title: 'Coin Change', difficulty: 'Medium', category: '1-D Dynamic Programming', order: 106, orbitAngleDeg: 210, orbitRadius: 185 },
      { id: '107', code: 'maximum-product-subarray', title: 'Max Product Subarray', difficulty: 'Medium', category: '1-D Dynamic Programming', order: 107, orbitAngleDeg: 240, orbitRadius: 165 },
      { id: '108', code: 'word-break', title: 'Word Break', difficulty: 'Medium', category: '1-D Dynamic Programming', order: 108, orbitAngleDeg: 270, orbitRadius: 185 },
      { id: '109', code: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence', difficulty: 'Medium', category: '1-D Dynamic Programming', order: 109, orbitAngleDeg: 300, orbitRadius: 160 },
      { id: '110', code: 'partition-equal-subset-sum', title: 'Partition Equal Subset Sum', difficulty: 'Medium', category: '1-D Dynamic Programming', order: 110, orbitAngleDeg: 330, orbitRadius: 185 },
    ],
  },
  {
    id: '2d-dp',
    name: '2-D Dynamic Programming',
    designation: 'V404 CYG',
    sector: 'III',
    sectorName: 'Sector III: The Event Horizon',
    sectorDescription: 'Grid states, edit distances, string interleaving, and boundary limits',
    spectralColor: '#ec4899', // hot magenta
    coronaGlow: 'rgba(236, 72, 153, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(236, 72, 153, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '111', code: 'unique-paths', title: 'Unique Paths', difficulty: 'Medium', category: '2-D Dynamic Programming', order: 111, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '112', code: 'longest-common-subsequence', title: 'Longest Common Subsequence', difficulty: 'Medium', category: '2-D Dynamic Programming', order: 112, orbitAngleDeg: 33, orbitRadius: 185 },
      { id: '113', code: 'best-time-to-buy-and-sell-stock-with-cooldown', title: 'Stock with Cooldown', difficulty: 'Medium', category: '2-D Dynamic Programming', order: 113, orbitAngleDeg: 65, orbitRadius: 160 },
      { id: '114', code: 'coin-change-ii', title: 'Coin Change II', difficulty: 'Medium', category: '2-D Dynamic Programming', order: 114, orbitAngleDeg: 98, orbitRadius: 185 },
      { id: '115', code: 'target-sum', title: 'Target Sum', difficulty: 'Medium', category: '2-D Dynamic Programming', order: 115, orbitAngleDeg: 130, orbitRadius: 165 },
      { id: '116', code: 'interleaving-string', title: 'Interleaving String', difficulty: 'Medium', category: '2-D Dynamic Programming', order: 116, orbitAngleDeg: 163, orbitRadius: 180 },
      { id: '117', code: 'longest-increasing-path-in-a-matrix', title: 'Longest Path in Matrix', difficulty: 'Hard', category: '2-D Dynamic Programming', order: 117, orbitAngleDeg: 196, orbitRadius: 160 },
      { id: '118', code: 'distinct-subsequences', title: 'Distinct Subsequences', difficulty: 'Hard', category: '2-D Dynamic Programming', order: 118, orbitAngleDeg: 229, orbitRadius: 185 },
      { id: '119', code: 'edit-distance', title: 'Edit Distance', difficulty: 'Hard', category: '2-D Dynamic Programming', order: 119, orbitAngleDeg: 261, orbitRadius: 165 },
      { id: '120', code: 'burst-balloons', title: 'Burst Balloons', difficulty: 'Hard', category: '2-D Dynamic Programming', order: 120, orbitAngleDeg: 294, orbitRadius: 180 },
      { id: '121', code: 'regular-expression-matching', title: 'Regular Expression Matching', difficulty: 'Hard', category: '2-D Dynamic Programming', order: 121, orbitAngleDeg: 327, orbitRadius: 170 },
    ],
  },
  {
    id: 'greedy',
    name: 'Greedy',
    designation: 'TON 618',
    sector: 'III',
    sectorName: 'Sector III: The Event Horizon',
    sectorDescription: 'Local greedy heuristics, step optimality, and frontier jumping',
    spectralColor: '#f59e0b', // amber
    coronaGlow: 'rgba(245, 158, 11, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '122', code: 'maximum-subarray', title: 'Maximum Subarray', difficulty: 'Medium', category: 'Greedy', order: 122, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '123', code: 'jump-game', title: 'Jump Game', difficulty: 'Medium', category: 'Greedy', order: 123, orbitAngleDeg: 45, orbitRadius: 180 },
      { id: '124', code: 'jump-game-ii', title: 'Jump Game II', difficulty: 'Medium', category: 'Greedy', order: 124, orbitAngleDeg: 90, orbitRadius: 160 },
      { id: '125', code: 'gas-station', title: 'Gas Station', difficulty: 'Medium', category: 'Greedy', order: 125, orbitAngleDeg: 135, orbitRadius: 180 },
      { id: '126', code: 'hand-of-straights', title: 'Hand of Straights', difficulty: 'Medium', category: 'Greedy', order: 126, orbitAngleDeg: 180, orbitRadius: 165 },
      { id: '127', code: 'merge-triplets-to-form-target-triplet', title: 'Merge Triplets', difficulty: 'Medium', category: 'Greedy', order: 127, orbitAngleDeg: 225, orbitRadius: 180 },
      { id: '128', code: 'partition-labels', title: 'Partition Labels', difficulty: 'Medium', category: 'Greedy', order: 128, orbitAngleDeg: 270, orbitRadius: 160 },
      { id: '129', code: 'valid-parenthesis-string', title: 'Valid Parenthesis String', difficulty: 'Medium', category: 'Greedy', order: 129, orbitAngleDeg: 315, orbitRadius: 180 },
    ],
  },
  {
    id: 'intervals',
    name: 'Intervals',
    designation: '3C 75',
    sector: 'III',
    sectorName: 'Sector III: The Event Horizon',
    sectorDescription: 'Temporal overlaps, segment intersections, and sweep-line algorithms',
    spectralColor: '#14b8a6', // teal
    coronaGlow: 'rgba(20, 184, 166, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(20, 184, 166, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '130', code: 'insert-interval', title: 'Insert Interval', difficulty: 'Medium', category: 'Intervals', order: 130, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '131', code: 'merge-intervals', title: 'Merge Intervals', difficulty: 'Medium', category: 'Intervals', order: 131, orbitAngleDeg: 60, orbitRadius: 180 },
      { id: '132', code: 'non-overlapping-intervals', title: 'Non-overlapping Intervals', difficulty: 'Medium', category: 'Intervals', order: 132, orbitAngleDeg: 120, orbitRadius: 160 },
      { id: '133', code: 'meeting-rooms', title: 'Meeting Rooms', difficulty: 'Easy', category: 'Intervals', order: 133, orbitAngleDeg: 180, orbitRadius: 180 },
      { id: '134', code: 'meeting-rooms-ii', title: 'Meeting Rooms II', difficulty: 'Medium', category: 'Intervals', order: 134, orbitAngleDeg: 240, orbitRadius: 165 },
      { id: '135', code: 'minimum-interval-to-include-each-query', title: 'Min Interval for Query', difficulty: 'Hard', category: 'Intervals', order: 135, orbitAngleDeg: 300, orbitRadius: 180 },
    ],
  },
  {
    id: 'math-geometry',
    name: 'Math & Geometry',
    designation: 'HOLMB 15A',
    sector: 'III',
    sectorName: 'Sector III: The Event Horizon',
    sectorDescription: 'Coordinate rotations, modular arithmetic, spiral matrix traversal, and numerical power',
    spectralColor: '#818cf8', // indigo
    coronaGlow: 'rgba(129, 140, 248, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(129, 140, 248, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '136', code: 'rotate-image', title: 'Rotate Image', difficulty: 'Medium', category: 'Math & Geometry', order: 136, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '137', code: 'spiral-matrix', title: 'Spiral Matrix', difficulty: 'Medium', category: 'Math & Geometry', order: 137, orbitAngleDeg: 45, orbitRadius: 180 },
      { id: '138', code: 'set-matrix-zeroes', title: 'Set Matrix Zeroes', difficulty: 'Medium', category: 'Math & Geometry', order: 138, orbitAngleDeg: 90, orbitRadius: 160 },
      { id: '139', code: 'happy-number', title: 'Happy Number', difficulty: 'Easy', category: 'Math & Geometry', order: 139, orbitAngleDeg: 135, orbitRadius: 180 },
      { id: '140', code: 'plus-one', title: 'Plus One', difficulty: 'Easy', category: 'Math & Geometry', order: 140, orbitAngleDeg: 180, orbitRadius: 160 },
      { id: '141', code: 'powx-n', title: 'Pow(x, n)', difficulty: 'Medium', category: 'Math & Geometry', order: 141, orbitAngleDeg: 225, orbitRadius: 180 },
      { id: '142', code: 'multiply-strings', title: 'Multiply Strings', difficulty: 'Medium', category: 'Math & Geometry', order: 142, orbitAngleDeg: 270, orbitRadius: 165 },
      { id: '143', code: 'detect-squares', title: 'Detect Squares', difficulty: 'Medium', category: 'Math & Geometry', order: 143, orbitAngleDeg: 315, orbitRadius: 180 },
    ],
  },
  {
    id: 'bit-manipulation',
    name: 'Bit Manipulation',
    designation: 'SGR 1806-20',
    sector: 'III',
    sectorName: 'Sector III: The Event Horizon',
    sectorDescription: 'Binary masks, XOR arithmetic, bitwise shifts, and register logic',
    spectralColor: '#fb7185', // rose
    coronaGlow: 'rgba(251, 113, 133, 0.45)',
    bgGlow: 'radial-gradient(circle, rgba(251, 113, 133, 0.18) 0%, transparent 70%)',
    problems: [
      { id: '144', code: 'single-number', title: 'Single Number', difficulty: 'Easy', category: 'Bit Manipulation', order: 144, orbitAngleDeg: 0, orbitRadius: 160 },
      { id: '145', code: 'number-of-1-bits', title: 'Number of 1 Bits', difficulty: 'Easy', category: 'Bit Manipulation', order: 145, orbitAngleDeg: 51, orbitRadius: 180 },
      { id: '146', code: 'counting-bits', title: 'Counting Bits', difficulty: 'Easy', category: 'Bit Manipulation', order: 146, orbitAngleDeg: 102, orbitRadius: 160 },
      { id: '147', code: 'reverse-bits', title: 'Reverse Bits', difficulty: 'Easy', category: 'Bit Manipulation', order: 147, orbitAngleDeg: 154, orbitRadius: 180 },
      { id: '148', code: 'missing-number', title: 'Missing Number', difficulty: 'Easy', category: 'Bit Manipulation', order: 148, orbitAngleDeg: 205, orbitRadius: 165 },
      { id: '149', code: 'sum-of-two-integers', title: 'Sum of Two Integers', difficulty: 'Medium', category: 'Bit Manipulation', order: 149, orbitAngleDeg: 257, orbitRadius: 180 },
      { id: '150', code: 'reverse-integer', title: 'Reverse Integer', difficulty: 'Medium', category: 'Bit Manipulation', order: 150, orbitAngleDeg: 308, orbitRadius: 170 },
    ],
  },
];

export const ALL_GALAXY_PROBLEMS: IStarProblem[] = STAR_CLUSTERS.flatMap((c) => c.problems);
export const TOTAL_GALAXY_PROBLEMS = ALL_GALAXY_PROBLEMS.length;
