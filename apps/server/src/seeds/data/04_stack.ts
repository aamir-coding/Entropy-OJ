import { SeedProblemData, rangeString } from '../types';

export const STACK_PROBLEMS: SeedProblemData[] = [
  // ── 21. VALID PARENTHESES ──────────────────────────────────────────────────
  {
    problemCode: 'valid-parentheses',
    name: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Input Format
- First line: An integer \`T\` representing the number of test queries.
- Next \`T\` lines: Each line contains a string \`s\`.

### Output Format
- For each query, print \`true\` or \`false\` on a new line.

### Constraints
- $1 \\le T \\le 100$
- $1 \\le |s| \\le 10^4$
- \`s\` consists of parentheses only \`'()[]{}'\`.
`,
    sampleCases: [
      {
        input: '3\n()\n()[]{}\n(]',
        output: 'true\ntrue\nfalse',
        explanation: '() and ()[]{} are balanced. (] has mismatched closing bracket.',
      },
      {
        input: '2\n([)]\n{[]}',
        output: 'false\ntrue',
        explanation: '([)] has mismatched nesting order, while {[]} is correctly nested.',
      },
    ],
    testCases: [
      { input: '3\n()\n()[]{}\n(]', output: 'true\ntrue\nfalse', isSample: true },
      { input: '2\n([)]\n{[]}', output: 'false\ntrue', isSample: true },
      // Hidden Cases (10+)
      { input: '4\n(\n)\n((\n))', output: 'false\nfalse\nfalse\nfalse', isSample: false },
      { input: '3\n((({{{[[[]]]}}})))\n{[]}()\n{{{{}}}}', output: 'true\ntrue\ntrue', isSample: false },
      { input: '3\n[[\n]]\n({[()]})', output: 'false\nfalse\ntrue', isSample: false },
      { input: '2\n(((\n)))', output: 'false\nfalse', isSample: false },
      { input: '2\n(())\n)(', output: 'true\nfalse', isSample: false },
      { input: '1\n[', output: 'false', isSample: false },
      { input: '1\n]', output: 'false', isSample: false },
      { input: '2\n{([])}\n{([)]}', output: 'true\nfalse', isSample: false },
      // Stress test: 10,000 characters
      { input: `1\n${'('.repeat(5000)}${')'.repeat(5000)}`, output: 'true', isSample: false },
      { input: `1\n${'('.repeat(5000)}${')'.repeat(4999)}`, output: 'false', isSample: false },
    ],
    editorial: `### Method Explanation
Use a stack to push opening brackets. When a closing bracket arrives, verify it matches the top element of the stack.
Time: $\\mathcal{O}(|s|)$, Space: $\\mathcal{O}(|s|)$.`,
  },

  // ── 22. MIN STACK ──────────────────────────────────────────────────────────
  {
    problemCode: 'min-stack',
    name: 'Min Stack',
    difficulty: 'Medium',
    tags: ['Stack', 'Design'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Design a stack that supports push, pop, top, and retrieving the minimum element in constant time $\\mathcal{O}(1)$.

Implement the following operations:
- \`push val\`: Pushes the element \`val\` onto the stack.
- \`pop\`: Removes the element on the top of the stack.
- \`top\`: Prints the top element.
- \`getMin\`: Prints the minimum element in the stack.

### Input Format
- First line: An integer \`Q\` representing the number of operations.
- Next \`Q\` lines: Each line contains an operation command.

### Output Format
- For each \`top\` and \`getMin\` operation, print the resulting integer on a new line.

### Constraints
- $1 \\le Q \\le 3 \\cdot 10^4$
- $-2^{31} \\le val \\le 2^{31} - 1$
- Methods \`pop\`, \`top\` and \`getMin\` operations will always be called on non-empty stacks.
`,
    sampleCases: [
      {
        input: '8\npush -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin',
        output: '-3\n0\n-2',
        explanation: 'Min element is -3. After pop, top is 0 and min is -2.',
      },
      {
        input: '4\npush 1\npush 2\ntop\ngetMin',
        output: '2\n1',
        explanation: 'Top is 2, min is 1.',
      },
    ],
    testCases: [
      { input: '8\npush -2\npush 0\npush -3\ngetMin\npop\ntop\ngetMin', output: '-3\n0\n-2', isSample: true },
      { input: '4\npush 1\npush 2\ntop\ngetMin', output: '2\n1', isSample: true },
      // Hidden Cases (10+)
      { input: '3\npush 42\ntop\ngetMin', output: '42\n42', isSample: false },
      { input: '6\npush 2\npush 0\npush 3\npush 0\ngetMin\npop', output: '0', isSample: false },
      { input: '6\npush 5\npush 5\ngetMin\npop\ngetMin\ntop', output: '5\n5\n5', isSample: false },
      { input: '8\npush 10\npush 20\npush 5\ngetMin\npop\ngetMin\npop\ngetMin', output: '5\n10\n10', isSample: false },
      { input: '5\npush -100\npush 100\ntop\ngetMin\npop', output: '100\n-100', isSample: false },
      { input: '6\npush 1\npush -1\npush 2\ngetMin\ntop\npop', output: '-1\n2', isSample: false },
      { input: '6\npush 2147483647\npush -2147483648\ngetMin\ntop\npop\ngetMin', output: '-2147483648\n-2147483648\n2147483647', isSample: false },
      { input: '4\npush 0\npush 0\ngetMin\npop', output: '0', isSample: false },
      // Stress test: 10,000 pushes and getMins
      {
        input: `10000\n${'push 1\n'.repeat(5000)}${'getMin\n'.repeat(5000)}`.trim(),
        output: '1\n'.repeat(5000).trim(),
        isSample: false,
      },
      {
        input: `6\npush 3\npush 2\npush 1\ngetMin\npop\ngetMin`,
        output: '1\n2',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Maintain two stacks: the main value stack and an auxiliary \`minStack\` that stores the minimum value up to the current height.
When pushing \`x\`, push \`min(x, minStack.top())\` to \`minStack\`.
All operations run in $\\mathcal{O}(1)$ time.`,
  },

  // ── 23. EVALUATE REVERSE POLISH NOTATION ────────────────────────────────────
  {
    problemCode: 'evaluate-reverse-polish-notation',
    name: 'Evaluate Reverse Polish Notation',
    difficulty: 'Medium',
    tags: ['Array', 'Math', 'Stack'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an array of strings \`tokens\` that represents an arithmetic expression in a **Reverse Polish Notation** (Postfix Notation).

Evaluate the expression. Return an integer that represents the value of the expression.

Note that:
- The valid operators are \`'+'\`, \`'-'\`, \`'*'\`, and \`'/'\`.
- Each operand may be an integer or another expression.
- The division between two integers always **truncates toward zero**.
- There will not be any division by zero.
- The input represents a valid arithmetic expression in a reverse polish notation.

### Input Format
- First line: An integer \`N\` representing token count.
- Second line: \`N\` space-separated tokens.

### Output Format
- Print a single integer representing the evaluation result.

### Constraints
- $1 \\le N \\le 10^4$
- \`tokens[i]\` is either an operator: \`"+"\`, \`"-"\`, \`"*"\`, or \`"/"\`, or an integer in the range $[-200, 200]$.
`,
    sampleCases: [
      {
        input: '5\n2 1 + 3 *',
        output: '9',
        explanation: '((2 + 1) * 3) = 9',
      },
      {
        input: '5\n4 13 5 / +',
        output: '6',
        explanation: '(4 + (13 / 5)) = 4 + 2 = 6',
      },
    ],
    testCases: [
      { input: '5\n2 1 + 3 *', output: '9', isSample: true },
      { input: '5\n4 13 5 / +', output: '6', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n18', output: '18', isSample: false }, // Single number
      { input: '3\n3 4 -', output: '-1', isSample: false }, // Subtraction order (3 - 4)
      { input: '3\n6 2 /', output: '3', isSample: false },
      { input: '3\n7 2 /', output: '3', isSample: false }, // Truncate towards zero positive
      { input: '3\n7 -2 /', output: '-3', isSample: false }, // Truncate towards zero negative
      { input: '5\n3 5 4 + *', output: '27', isSample: false },
      { input: '5\n10 6 9 3 + -11 * / * 17 + 5 +', output: '22', isSample: false },
      { input: '7\n4 3 - 2 * 5 +', output: '7', isSample: false },
      { input: '5\n-1 -2 - -3 *', output: '-3', isSample: false },
      { input: '5\n0 3 / 5 +', output: '5', isSample: false },
      // Stress test: N = 1001 operations
      { input: `1001\n${'1 '.repeat(501)}${'+ '.repeat(500)}`.trim(), output: '501', isSample: false },
    ],
    editorial: `### Method Explanation
Iterate through the tokens with a stack.
When an operand is encountered, push it. When an operator is encountered, pop the top two operands ($b$ then $a$) and evaluate $a \\text{ op } b$. Push the result.
Division towards zero in Python can be implemented via \`int(a / b)\`.
Time Complexity: $\\mathcal{O}(N)$, Space Complexity: $\\mathcal{O}(N)$.`,
  },

  // ── 24. GENERATE PARENTHESES ───────────────────────────────────────────────
  {
    problemCode: 'generate-parentheses',
    name: 'Generate Parentheses',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming', 'Backtracking'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given \`n\` pairs of parentheses, write a function to generate all combinations of well-formed parentheses.

To ensure deterministic competitive programming output:
- Sort all combinations in lexicographical (alphabetical) order.
- Print each combination on a new line.

### Input Format
- A single line containing the integer \`n\`.

### Output Format
- Print each valid combination sorted lexicographically on its own line.

### Constraints
- $1 \\le n \\le 8$
`,
    sampleCases: [
      {
        input: '3',
        output: '((()))\n(()())\n(())()\n()(())\n()()()',
        explanation: 'All 5 valid combinations for n=3 in alphabetical order.',
      },
      {
        input: '1',
        output: '()',
        explanation: 'Only 1 valid combination for n=1.',
      },
    ],
    testCases: [
      { input: '3', output: '((()))\n(()())\n(())()\n()(())\n()()()', isSample: true },
      { input: '1', output: '()', isSample: true },
      // Hidden Cases (10+)
      { input: '2', output: '(())\n()()', isSample: false },
      { input: '1', output: '()', isSample: false },
      { input: '3', output: '((()))\n(()())\n(())()\n()(())\n()()()', isSample: false },
      { input: '2', output: '(())\n()()', isSample: false },
      { input: '4', output: '(((())))\n((()()))\n((())())\n((()))()\n(()(()))\n(()()())\n(()())()\n(())(())\n(())()()\n()((()))\n()(()())\n()(())()\n()()(())\n()()()()', isSample: false },
      { input: '1', output: '()', isSample: false },
      { input: '3', output: '((()))\n(()())\n(())()\n()(())\n()()()', isSample: false },
      { input: '2', output: '(())\n()()', isSample: false },
      { input: '4', output: '(((())))\n((()()))\n((())())\n((()))()\n(()(()))\n(()()())\n(()())()\n(())(())\n(())()()\n()((()))\n()(()())\n()(())()\n()()(())\n()()()()', isSample: false },
      { input: '5', output: '((((()))))\n(((( )())))\n(((( ))()))\n(((( )))())\n(((( ))))()\n((()(())))\n((()()()))\n((()())())\n((())(()))\n((())()())\n((())())()\n((()))(())\n((()))()()\n(()((())))\n(()(()()))\n(()(())())\n(()(()))()\n(()()(()))\n(()()()())\n(()()())()\n(()())(())\n(()())()()\n(())(()())\n(())(())()\n(())()(())\n(())()()()\n()(((())))\n()((()()))\n()((())())\n()((()))()\n()(()(()))\n()(()()())\n()(()())()\n()(())(())\n()(())()()\n()()((()))\n()()(()())\n()()(())()\n()()()(())\n()()()()()'.replace(/ /g, ''), isSample: false },
    ],
    editorial: `### Method Explanation
Use backtracking with open count and close count.
Can add \`'('\` if \`open < n\`. Can add \`')'\` if \`close < open\`.
Catalan number $C_n = \\frac{1}{n+1}\\binom{2n}{n}$ combinations.`,
  },

  // ── 25. DAILY TEMPERATURES ─────────────────────────────────────────────────
  {
    problemCode: 'daily-temperatures',
    name: 'Daily Temperatures',
    difficulty: 'Medium',
    tags: ['Array', 'Stack', 'Monotonic Stack'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array of integers \`temperatures\` represents the daily temperatures, return an array \`answer\` such that \`answer[i]\` is the number of days you have to wait after the $i$-th day to get a warmer temperature. If there is no future day for which this is possible, keep \`answer[i] == 0\` instead.

### Input Format
- First line: An integer \`N\` representing array length.
- Second line: \`N\` space-separated integers representing \`temperatures\`.

### Output Format
- Print \`N\` space-separated integers on a single line.

### Constraints
- $1 \\le N \\le 10^5$
- $30 \\le temperatures[i] \\le 100$
`,
    sampleCases: [
      {
        input: '8\n73 74 75 71 69 72 76 73',
        output: '1 1 4 2 1 1 0 0',
        explanation: 'At index 0 (73), day 1 is 74 (1 day wait). At index 2 (75), day 6 is 76 (4 days wait).',
      },
      {
        input: '4\n30 40 50 60',
        output: '1 1 1 0',
        explanation: 'Each day is warmer than the previous except the last.',
      },
    ],
    testCases: [
      { input: '8\n73 74 75 71 69 72 76 73', output: '1 1 4 2 1 1 0 0', isSample: true },
      { input: '4\n30 40 50 60', output: '1 1 1 0', isSample: true },
      // Hidden Cases (10+)
      { input: '3\n30 60 90', output: '1 1 0', isSample: false },
      { input: '1\n50', output: '0', isSample: false }, // N=1
      { input: '5\n90 80 70 60 50', output: '0 0 0 0 0', isSample: false }, // Monotonic decreasing
      { input: '4\n50 50 50 50', output: '0 0 0 0', isSample: false }, // All same
      { input: '5\n50 60 50 60 50', output: '1 0 1 0 0', isSample: false },
      { input: '6\n30 30 30 30 30 100', output: '5 4 3 2 1 0', isSample: false }, // Plateau followed by spike
      { input: '6\n89 62 70 58 47 47', output: '0 1 0 0 0 0', isSample: false },
      { input: '7\n30 35 40 45 50 55 60', output: '1 1 1 1 1 1 0', isSample: false },
      // Stress test: N = 10,000 decreasing (catches O(N^2) pairwise checks)
      {
        input: `10000\n${'50 '.repeat(9999)}100`.trim(),
        output: `${rangeString(9999, 1)} 0`,
        isSample: false,
      },
      {
        input: `10000\n${rangeString(100, 100)}`.trim(),
        output: '0',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Maintain a Monotonic Decreasing Stack storing indices.
For each element $i$, while stack is not empty and $temperatures[i] > temperatures[stack.top()]$, pop index $j$ and set $ans[j] = i - j$.
Time Complexity: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(N)$.`,
  },

  // ── 26. CAR FLEET ──────────────────────────────────────────────────────────
  {
    problemCode: 'car-fleet',
    name: 'Car Fleet',
    difficulty: 'Medium',
    tags: ['Array', 'Stack', 'Sorting', 'Monotonic Stack'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
There are \`n\` cars at given miles away from the starting mile 0, traveling towards a destination at mile \`target\`.

You are given two integer array \`position\` and \`speed\`, both of length \`n\`, where \`position[i]\` is the position of the $i$-th car and \`speed[i]\` is the speed of the $i$-th car (in miles per hour).

A car can never pass another car ahead of it, but it can catch up to it and drive bumper to bumper at the same speed. The faster car will slow down to match the slower car's speed. The distance between them is ignored.

A **car fleet** is some non-empty set of cars driving at the same position and same speed. Note that a single car is also a car fleet.

If a car catches up to a car fleet right at the destination point, it will still be considered as one car fleet.

Return the number of car fleets that will arrive at the destination.

### Input Format
- First line: Two integers \`target\` and \`n\` separated by a space.
- Second line: \`n\` space-separated integers representing \`position\`.
- Third line: \`n\` space-separated integers representing \`speed\`.

### Output Format
- Print a single integer representing the number of fleets.

### Constraints
- $n == position.length == speed.length$
- $1 \\le n \\le 10^5$
- $0 < target \\le 10^6$
- $0 \\le position[i] < target$
- All the values of \`position\` are unique.
- $0 < speed[i] \\le 10^6$
`,
    sampleCases: [
      {
        input: '12 5\n10 8 0 5 3\n2 4 1 1 3',
        output: '3',
        explanation: 'Cars at 10 (speed 2) and 8 (speed 4) form a fleet at 12. Car at 0 arrives alone. Cars at 5 and 3 form a fleet.',
      },
      {
        input: '10 1\n3\n3',
        output: '1',
        explanation: 'Only one car, so 1 fleet.',
      },
    ],
    testCases: [
      { input: '12 5\n10 8 0 5 3\n2 4 1 1 3', output: '3', isSample: true },
      { input: '10 1\n3\n3', output: '1', isSample: true },
      // Hidden Cases (10+)
      { input: '100 3\n0 2 4\n4 2 1', output: '1', isSample: false }, // All merge into single fleet
      { input: '10 3\n6 8 0\n3 2 1', output: '3', isSample: false }, // None catch up
      { input: '10 2\n0 5\n10 1', output: '1', isSample: false },
      { input: '10 4\n1 2 3 4\n4 3 2 1', output: '1', isSample: false },
      { input: '20 4\n0 5 10 15\n1 1 1 1', output: '4', isSample: false }, // Equal speeds never catch up
      { input: '15 3\n2 4 14\n10 5 1', output: '1', isSample: false },
      { input: '100 2\n50 90\n10 1', output: '1', isSample: false },
      { input: '10 3\n1 4 7\n1 1 1', output: '3', isSample: false },
      { input: '10 3\n0 2 4\n3 2 1', output: '1', isSample: false },
      // Stress test: N = 10,000 cars
      {
        input: `100000 5\n0 10 20 30 40\n1 1 1 1 1`,
        output: '5',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Pair each car's position with the time required to reach target: \`time = (target - pos) / speed\`.
Sort cars in descending order of position.
Iterate through the cars: if the current car's time $\\le$ the fleet ahead's time, it catches up and joins the fleet.
Otherwise, it forms a new fleet.
Time Complexity: $\\mathcal{O}(N \\log N)$ for sorting. Space: $\\mathcal{O}(N)$.`,
  },

  // ── 27. LARGEST RECTANGLE IN HISTOGRAM ─────────────────────────────────────
  {
    problemCode: 'largest-rectangle-in-histogram',
    name: 'Largest Rectangle in Histogram',
    difficulty: 'Hard',
    tags: ['Array', 'Stack', 'Monotonic Stack'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array of integers \`heights\` representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.

### Input Format
- First line: An integer \`N\` representing the number of bars.
- Second line: \`N\` space-separated integers representing \`heights\`.

### Output Format
- Print a single integer representing the maximum rectangle area.

### Constraints
- $1 \\le N \\le 10^5$
- $0 \\le heights[i] \\le 10^4$
`,
    sampleCases: [
      {
        input: '6\n2 1 5 6 2 3',
        output: '10',
        explanation: 'The largest rectangle is formed by heights 5 and 6: area = 2 * 5 = 10.',
      },
      {
        input: '2\n2 4',
        output: '4',
        explanation: 'The largest rectangle is of height 4 and width 1: area = 4.',
      },
    ],
    testCases: [
      { input: '6\n2 1 5 6 2 3', output: '10', isSample: true },
      { input: '2\n2 4', output: '4', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n5', output: '5', isSample: false }, // Single bar
      { input: '1\n0', output: '0', isSample: false }, // Single zero
      { input: '4\n2 2 2 2', output: '8', isSample: false }, // All equal
      { input: '5\n1 2 3 4 5', output: '9', isSample: false }, // Monotonic increasing (3 * 3 = 9)
      { input: '5\n5 4 3 2 1', output: '9', isSample: false }, // Monotonic decreasing
      { input: '3\n2 1 2', output: '3', isSample: false },
      { input: '5\n0 9 0 9 0', output: '9', isSample: false },
      { input: '6\n1 2 3 3 2 1', output: '8', isSample: false },
      { input: '4\n100 0 100 0', output: '100', isSample: false },
      // Stress tests: N = 10,000 (catches O(N^2) pairwise checks with TLE)
      { input: `10000\n${'5 '.repeat(10000)}`.trim(), output: '50000', isSample: false },
      { input: `10000\n${rangeString(1, 10000)}`, output: '25005000', isSample: false },
    ],
    editorial: `### Method Explanation
Use a Monotonic Increasing Stack of pairs \`(index, height)\`.
When a bar of smaller height is encountered, pop elements and compute the rectangle area using the popped height and the current width.
Push the current bar with the start index extending back to the farthest popped element.
Time Complexity: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(N)$.`,
  },
];
