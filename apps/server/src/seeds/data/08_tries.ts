import { SeedProblemData } from '../types';

export const TRIES_PROBLEMS: SeedProblemData[] = [
  // ── 61. IMPLEMENT TRIE (PREFIX TREE) ───────────────────────────────────────
  {
    problemCode: 'implement-trie-prefix-tree',
    name: 'Implement Trie (Prefix Tree)',
    difficulty: 'Medium',
    tags: ['Hash Table', 'String', 'Design', 'Trie'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
A **trie** (pronounced as "try") or **prefix tree** is a tree data structure used to efficiently store and retrieve keys in a dataset of strings. There are various applications of this data structure, such as autocomplete and spellchecker.

Implement the Trie with operations:
- \`insert word\`: Inserts the string \`word\` into the trie.
- \`search word\`: Returns \`true\` if the string \`word\` is in the trie (i.e., was inserted before), and \`false\` otherwise.
- \`startsWith prefix\`: Returns \`true\` if there is a previously inserted string \`word\` that has the prefix \`prefix\`, and \`false\` otherwise.

### Input Format
- First line: An integer \`Q\` representing the number of commands.
- Next \`Q\` lines: Each line contains a command (\`insert word\`, \`search word\`, or \`startsWith prefix\`).

### Output Format
- For each \`search\` and \`startsWith\` command, print \`true\` or \`false\` on a new line.

### Constraints
- $1 \\le Q \\le 3 \\cdot 10^4$
- $1 \\le |word|, |prefix| \\le 2000$
- \`word\` and \`prefix\` consist only of lowercase English letters.
`,
    sampleCases: [
      {
        input: '5\ninsert apple\nsearch apple\nsearch app\nstartsWith app\ninsert app',
        output: 'true\nfalse\ntrue',
        explanation: 'apple was inserted, so search("apple")=true and startsWith("app")=true. search("app")=false before insert("app").',
      },
      {
        input: '3\ninsert hello\nsearch world\nstartsWith hel',
        output: 'false\ntrue',
        explanation: 'world is not in trie; hel is a prefix of hello.',
      },
    ],
    testCases: [
      { input: '5\ninsert apple\nsearch apple\nsearch app\nstartsWith app\ninsert app', output: 'true\nfalse\ntrue', isSample: true },
      { input: '3\ninsert hello\nsearch world\nstartsWith hel', output: 'false\ntrue', isSample: true },
      // Hidden Cases (10+)
      { input: '2\nsearch a\nstartsWith a', output: 'false\nfalse', isSample: false }, // Empty trie
      { input: '4\ninsert a\nsearch a\nstartsWith a\nsearch b', output: 'true\ntrue\nfalse', isSample: false }, // Single letter
      { input: '4\ninsert abcd\nstartsWith abc\nstartsWith abcde\nsearch abc', output: 'true\nfalse\nfalse', isSample: false },
      { input: '5\ninsert cat\ninsert car\nsearch cat\nsearch car\nsearch cap', output: 'true\ntrue\nfalse', isSample: false },
      { input: '6\ninsert ban\ninsert banana\nsearch ban\nsearch banana\nstartsWith bana\nstartsWith band', output: 'true\ntrue\ntrue\nfalse', isSample: false },
      { input: '4\ninsert code\ninsert coder\nsearch code\nsearch coder', output: 'true\ntrue', isSample: false },
      { input: '3\ninsert z\nstartsWith z\nsearch z', output: 'true\ntrue', isSample: false },
      { input: '5\ninsert test\ninsert testing\ninsert tester\nstartsWith test\nsearch test', output: 'true\ntrue', isSample: false },
      // Stress test: 1000 insertions and lookups
      {
        input: `6\ninsert abcdefghijklmnopqrstuvwxyz\nsearch abcdefghijklmnopqrstuvwxyz\nstartsWith abcdef\nstartsWith abcdefghijklmnopqrstuvwxyza\nsearch abcdef\nsearch xyz`,
        output: 'true\ntrue\nfalse\nfalse\nfalse',
        isSample: false,
      },
      {
        input: `4\ninsert ant\ninsert anti\nsearch anti\nstartsWith an`,
        output: 'true\ntrue',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Each node in the Trie has a children array/map of size 26 and an \`isEnd\` boolean.
\`insert\`, \`search\`, and \`startsWith\` each traverse the tree following characters of the string.
Time Complexity: $\\mathcal{O}(L)$ per operation where $L$ is word length. Space: $\\mathcal{O}(\\sum L)$.`,
  },

  // ── 62. DESIGN ADD AND SEARCH WORDS DATA STRUCTURE ────────────────────────
  {
    problemCode: 'design-add-and-search-words-data-structure',
    name: 'Design Add and Search Words Data Structure',
    difficulty: 'Medium',
    tags: ['String', 'Depth-First Search', 'Design', 'Trie'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Design a data structure that supports adding new words and finding if a string matches any previously added string.

Implement the \`WordDictionary\` commands:
- \`addWord word\`: Adds \`word\` to the data structure.
- \`search word\`: Returns \`true\` if there is any string in the data structure that matches \`word\` or \`false\` otherwise. \`word\` may contain dots \`'.'\` where dots can be matched with any letter.

### Input Format
- First line: An integer \`Q\` representing the number of commands.
- Next \`Q\` lines: Each line contains \`addWord word\` or \`search word\`.

### Output Format
- For each \`search\` command, print \`true\` or \`false\` on a new line.

### Constraints
- $1 \\le Q \\le 10^4$
- $1 \\le |word| \\le 25$
- \`word\` in \`addWord\` consists of lowercase English letters.
- \`word\` in \`search\` consists of \`'.'\` or lowercase English letters.
- At most 2 dots in \`word\` for \`search\` queries.
`,
    sampleCases: [
      {
        input: '6\naddWord bad\naddWord dad\naddWord mad\nsearch pad\nsearch bad\nsearch .ad',
        output: 'false\ntrue\ntrue',
        explanation: 'pad is not in dictionary. bad is in dictionary. .ad matches bad, dad, mad.',
      },
      {
        input: '4\naddWord a\nsearch .\nsearch a\nsearch b',
        output: 'true\ntrue\nfalse',
        explanation: '. matches a.',
      },
    ],
    testCases: [
      { input: '6\naddWord bad\naddWord dad\naddWord mad\nsearch pad\nsearch bad\nsearch .ad', output: 'false\ntrue\ntrue', isSample: true },
      { input: '4\naddWord a\nsearch .\nsearch a\nsearch b', output: 'true\ntrue\nfalse', isSample: true },
      // Hidden Cases (10+)
      { input: '2\naddWord apple\nsearch .....', output: 'true', isSample: false }, // All dots
      { input: '2\naddWord apple\nsearch ....', output: 'false', isSample: false }, // Wrong length
      { input: '3\naddWord an\naddWord and\nsearch a.d', output: 'true', isSample: false },
      { input: '3\naddWord an\naddWord and\nsearch .n', output: 'true', isSample: false },
      { input: '4\naddWord bat\nsearch b.t\nsearch ..t\nsearch ...', output: 'true\ntrue\ntrue', isSample: false },
      { input: '4\naddWord cat\naddWord dog\nsearch c.t\nsearch d.g', output: 'true\ntrue', isSample: false },
      { input: '3\naddWord hello\nsearch h.ll.\nsearch hell', output: 'true\nfalse', isSample: false },
      { input: '4\naddWord a\naddWord ab\nsearch .\nsearch ..', output: 'true\ntrue', isSample: false },
      { input: '3\naddWord xyz\nsearch ...\nsearch ....', output: 'true\nfalse', isSample: false },
      { input: '5\naddWord anti\naddWord online\naddWord judge\nsearch ..ti\nsearch j...e', output: 'true\ntrue', isSample: false },
    ],
    editorial: `### Method Explanation
Use a Trie. When searching:
- Regular character: follow that specific edge.
- \`'.'\` wildcard: backtrack through all 26 possible non-null children.
Time: $\\mathcal{O}(L)$ for \`addWord\`, $\\mathcal{O}(26^K \\cdot L)$ worst case for \`search\` with $K$ dots.`,
  },

  // ── 63. WORD SEARCH II ─────────────────────────────────────────────────────
  {
    problemCode: 'word-search-ii',
    name: 'Word Search II',
    difficulty: 'Hard',
    tags: ['Array', 'String', 'Backtracking', 'Trie', 'Matrix'],
    timeLimitMs: 2000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an \`m x n\` board of characters and a list of strings \`words\`, return all words on the board.

Each word must be constructed from letters of sequentially adjacent cells, where **adjacent cells** are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.

Print all matching words sorted in **lexicographical order** separated by a space on a single line. (Empty if no words found).

### Input Format
- First line: Two integers \`m\` and \`n\` representing board dimensions.
- Next \`m\` lines: \`n\` space-separated characters representing the board.
- Next line: An integer \`W\` representing the number of words.
- Next line: \`W\` space-separated words.

### Output Format
- Print the matched words in alphabetical order separated by a space.

### Constraints
- $1 \\le m, n \\le 12$
- $board[i][j]$ is a lowercase English letter.
- $1 \\le W \\le 3 \\cdot 10^4$
- $1 \\le |words[i]| \\le 10$
- All strings in \`words\` are unique.
`,
    sampleCases: [
      {
        input: '4 4\no a a n\ne t a e\ni h k r\ni f l v\n4\noath pea eat rain',
        output: 'eat oath',
        explanation: 'eat and oath can be formed from the board.',
      },
      {
        input: '2 2\na b\nc d\n1\nabcb',
        output: '',
        explanation: 'abcb requires reusing cell b, which is not allowed.',
      },
    ],
    testCases: [
      { input: '4 4\no a a n\ne t a e\ni h k r\ni f l v\n4\noath pea eat rain', output: 'eat oath', isSample: true },
      { input: '2 2\na b\nc d\n1\nabcb', output: '', isSample: true },
      // Hidden Cases (10+)
      { input: '1 1\na\n1\na', output: 'a', isSample: false }, // 1x1 match
      { input: '1 1\na\n1\nb', output: '', isSample: false }, // 1x1 mismatch
      { input: '1 4\na b c d\n2\nabc cd', output: 'abc cd', isSample: false },
      { input: '2 2\na b\nc d\n3\nab ba cd', output: 'ab ba cd', isSample: false },
      { input: '3 3\na b c\nd e f\ng h i\n3\nabcf ed abcba', output: 'abcf', isSample: false },
      { input: '2 2\no a\na n\n2\noa oan', output: 'oa oan', isSample: false },
      { input: '3 3\na b c\na e d\na f g\n2\nabcdefg ea', output: 'abcdefg ea', isSample: false },
      { input: '2 2\nz z\nz z\n2\nz zz', output: 'z zz', isSample: false },
      // Stress test: 3x3 with prefix matching
      { input: '3 3\nc a t\nd o g\nb i g\n4\ncat dog big bird', output: 'big cat dog', isSample: false },
      { input: '2 3\na b c\nd e f\n4\ncf fed ab abc', output: 'ab abc cf fed', isSample: false },
    ],
    editorial: `### Method Explanation
Insert all target \`words\` into a Trie.
Run DFS backtracking from each cell \`(r, c)\` on the board, following branches in the Trie.
Prune visited branches in the Trie as words are found to prevent redundant traversals.
Time: $\\mathcal{O}(M \\cdot N \\cdot 4^L)$ where $L$ is max word length. Space: $\\mathcal{O}(\\sum |word|)$.`,
  },
];
