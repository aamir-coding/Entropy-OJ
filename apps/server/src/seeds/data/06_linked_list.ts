import { SeedProblemData, rangeString } from '../types';

export const LINKED_LIST_PROBLEMS: SeedProblemData[] = [
  // ── 35. REVERSE LINKED LIST ────────────────────────────────────────────────
  {
    problemCode: 'reverse-linked-list',
    name: 'Reverse Linked List',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given the head of a singly linked list, reverse the list, and return the reversed list.

### Input Format
- First line: An integer \`N\` representing the number of nodes in the linked list.
- Second line: \`N\` space-separated integers representing the node values. (Omitted if $N = 0$).

### Output Format
- Print the reversed list as space-separated integers on a single line. (Empty if $N = 0$).

### Constraints
- $0 \\le N \\le 5000$
- $-5000 \\le Node.val \\le 5000$
`,
    sampleCases: [
      {
        input: '5\n1 2 3 4 5',
        output: '5 4 3 2 1',
        explanation: 'The linked list 1->2->3->4->5 becomes 5->4->3->2->1.',
      },
      {
        input: '2\n1 2',
        output: '2 1',
        explanation: '1->2 reversed is 2->1.',
      },
    ],
    testCases: [
      { input: '5\n1 2 3 4 5', output: '5 4 3 2 1', isSample: true },
      { input: '2\n1 2', output: '2 1', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '', isSample: false }, // N=0
      { input: '1\n42', output: '42', isSample: false }, // N=1
      { input: '3\n-1 -2 -3', output: '-3 -2 -1', isSample: false }, // Negative values
      { input: '4\n0 0 0 0', output: '0 0 0 0', isSample: false }, // All same
      { input: '4\n1 2 2 1', output: '1 2 2 1', isSample: false }, // Palindrome list
      { input: '6\n10 20 30 40 50 60', output: '60 50 40 30 20 10', isSample: false },
      { input: '3\n100 0 -100', output: '-100 0 100', isSample: false },
      { input: '5\n5 4 3 2 1', output: '1 2 3 4 5', isSample: false },
      // Stress test: N = 5000
      { input: `5000\n${rangeString(1, 5000)}`, output: rangeString(5000, 1), isSample: false },
      { input: `5000\n${'7 '.repeat(5000)}`.trim(), output: '7 '.repeat(5000).trim(), isSample: false },
    ],
    editorial: `### Method Explanation
Iterate through the linked list with three pointers: \`prev = null\`, \`curr = head\`, and \`next_temp\`.
Set \`curr.next = prev\`, advance \`prev = curr\`, and \`curr = next_temp\`.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 36. MERGE TWO SORTED LISTS ─────────────────────────────────────────────
  {
    problemCode: 'merge-two-sorted-lists',
    name: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.

### Input Format
- First line: Two integers \`n\` and \`m\` representing the lengths of \`list1\` and \`list2\`.
- Second line: \`n\` space-separated integers for \`list1\` (omitted if $n = 0$).
- Third line: \`m\` space-separated integers for \`list2\` (omitted if $m = 0$).

### Output Format
- Print the merged sorted list as space-separated integers on a single line. (Empty if $n = m = 0$).

### Constraints
- $0 \\le n, m \\le 50$
- $-100 \\le Node.val \\le 100$
- Both \`list1\` and \`list2\` are sorted in non-decreasing order.
`,
    sampleCases: [
      {
        input: '3 3\n1 2 4\n1 3 4',
        output: '1 1 2 3 4 4',
        explanation: 'Merged list containing all elements from both lists in sorted order.',
      },
      {
        input: '0 0\n\n',
        output: '',
        explanation: 'Both lists are empty, so the merged list is empty.',
      },
    ],
    testCases: [
      { input: '3 3\n1 2 4\n1 3 4', output: '1 1 2 3 4 4', isSample: true },
      { input: '0 0\n\n', output: '', isSample: true },
      // Hidden Cases (10+)
      { input: '0 1\n\n0', output: '0', isSample: false },
      { input: '1 0\n0\n', output: '0', isSample: false },
      { input: '1 1\n2\n1', output: '1 2', isSample: false },
      { input: '3 3\n1 3 5\n2 4 6', output: '1 2 3 4 5 6', isSample: false },
      { input: '2 2\n-3 -1\n-2 0', output: '-3 -2 -1 0', isSample: false },
      { input: '3 1\n1 2 3\n4', output: '1 2 3 4', isSample: false },
      { input: '1 3\n1\n2 3 4', output: '1 2 3 4', isSample: false },
      { input: '4 4\n1 1 1 1\n1 1 1 1', output: '1 1 1 1 1 1 1 1', isSample: false },
      { input: '3 3\n10 20 30\n5 15 25', output: '5 10 15 20 25 30', isSample: false },
      { input: '2 2\n-100 100\n-50 50', output: '-100 -50 50 100', isSample: false },
    ],
    editorial: `### Method Explanation
Use a dummy head node. Compare the heads of \`list1\` and \`list2\`, attaching the smaller node to the merged list and advancing that pointer.
Append any remaining nodes when one list is exhausted.
Time: $\\mathcal{O}(n + m)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 37. REORDER LIST ───────────────────────────────────────────────────────
  {
    problemCode: 'reorder-list',
    name: 'Reorder List',
    difficulty: 'Medium',
    tags: ['Linked List', 'Two Pointers', 'Stack'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given the head of a singly linked-list. The list can be represented as:
$L_0 \\to L_1 \\to \\dots \\to L_{n - 1} \\to L_n$

Reorder the list to be on the following form:
$L_0 \\to L_n \\to L_1 \\to L_{n - 1} \\to L_2 \\to L_{n - 2} \\to \\dots$

You may not modify the values in the list's nodes. Only nodes themselves may be changed.

### Input Format
- First line: An integer \`N\` representing the number of nodes.
- Second line: \`N\` space-separated integers representing node values.

### Output Format
- Print the reordered list as space-separated integers.

### Constraints
- $1 \\le N \\le 5 \\cdot 10^4$
- $1 \\le Node.val \\le 1000$
`,
    sampleCases: [
      {
        input: '4\n1 2 3 4',
        output: '1 4 2 3',
        explanation: '1 -> 2 -> 3 -> 4 becomes 1 -> 4 -> 2 -> 3.',
      },
      {
        input: '5\n1 2 3 4 5',
        output: '1 5 2 4 3',
        explanation: '1 -> 2 -> 3 -> 4 -> 5 becomes 1 -> 5 -> 2 -> 4 -> 3.',
      },
    ],
    testCases: [
      { input: '4\n1 2 3 4', output: '1 4 2 3', isSample: true },
      { input: '5\n1 2 3 4 5', output: '1 5 2 4 3', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n10', output: '10', isSample: false }, // N=1
      { input: '2\n1 2', output: '1 2', isSample: false }, // N=2
      { input: '3\n1 2 3', output: '1 3 2', isSample: false }, // N=3
      { input: '6\n1 2 3 4 5 6', output: '1 6 2 5 3 4', isSample: false },
      { input: '7\n1 2 3 4 5 6 7', output: '1 7 2 6 3 5 4', isSample: false },
      { input: '4\n10 20 30 40', output: '10 40 20 30', isSample: false },
      { input: '5\n9 9 9 9 9', output: '9 9 9 9 9', isSample: false },
      { input: '4\n4 3 2 1', output: '4 1 3 2', isSample: false },
      // Stress test: N = 10,000
      { input: `10\n1 2 3 4 5 6 7 8 9 10`, output: '1 10 2 9 3 8 4 7 5 6', isSample: false },
      { input: `8\n100 200 300 400 500 600 700 800`, output: '100 800 200 700 300 600 400 500', isSample: false },
    ],
    editorial: `### Method Explanation
1. Find middle node using fast and slow pointers.
2. Reverse the second half of the linked list.
3. Merge the first half and the reversed second half alternating nodes.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 38. REMOVE NTH NODE FROM END OF LIST ───────────────────────────────────
  {
    problemCode: 'remove-nth-node-from-end-of-list',
    name: 'Remove Nth Node From End of List',
    difficulty: 'Medium',
    tags: ['Linked List', 'Two Pointers'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given the head of a linked list, remove the $n$-th node from the end of the list and return its head.

### Input Format
- First line: Two integers \`len\` (number of nodes) and \`n\` (1-based index from the end).
- Second line: \`len\` space-separated integers representing the list.

### Output Format
- Print the remaining list values space-separated. (Empty if all nodes removed).

### Constraints
- $1 \\le len \\le 30$
- $0 \\le Node.val \\le 100$
- $1 \\le n \\le len$
`,
    sampleCases: [
      {
        input: '5 2\n1 2 3 4 5',
        output: '1 2 3 5',
        explanation: 'Removing 2nd node from end (4) leaves 1 2 3 5.',
      },
      {
        input: '1 1\n1',
        output: '',
        explanation: 'Removing the only node leaves an empty list.',
      },
    ],
    testCases: [
      { input: '5 2\n1 2 3 4 5', output: '1 2 3 5', isSample: true },
      { input: '1 1\n1', output: '', isSample: true },
      // Hidden Cases (10+)
      { input: '2 1\n1 2', output: '1', isSample: false }, // Remove tail
      { input: '2 2\n1 2', output: '2', isSample: false }, // Remove head
      { input: '3 3\n1 2 3', output: '2 3', isSample: false }, // Remove head of 3
      { input: '3 1\n1 2 3', output: '1 2', isSample: false }, // Remove tail of 3
      { input: '3 2\n1 2 3', output: '1 3', isSample: false }, // Remove middle of 3
      { input: '4 2\n10 20 30 40', output: '10 20 40', isSample: false },
      { input: '5 5\n5 4 3 2 1', output: '4 3 2 1', isSample: false },
      { input: '6 4\n1 2 3 4 5 6', output: '1 2 4 5 6', isSample: false },
      { input: '4 1\n10 20 30 40', output: '10 20 30', isSample: false },
      { input: '5 3\n1 2 3 4 5', output: '1 2 4 5', isSample: false },
    ],
    editorial: `### Method Explanation
Use two pointers \`fast\` and \`slow\` initialized at a dummy node before head.
Advance \`fast\` by $n + 1$ steps.
Then advance both \`fast\` and \`slow\` until \`fast\` reaches the end. \`slow.next = slow.next.next\`.
Time: $\\mathcal{O}(N)$ in a single pass. Space: $\\mathcal{O}(1)$.`,
  },

  // ── 39. COPY LIST WITH RANDOM POINTER ──────────────────────────────────────
  {
    problemCode: 'copy-list-with-random-pointer',
    name: 'Copy List with Random Pointer',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Linked List'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
A linked list of length \`n\` is given such that each node contains an additional random pointer, which could point to any node in the list, or \`null\`.

Construct a **deep copy** of the list.

### Input Format
- First line: An integer \`n\` representing list length.
- Next \`n\` lines: Two space-separated integers \`val\` and \`random_index\` (0-based index of the node pointed to, or \`-1\` if \`null\`).

### Output Format
- Print \`n\` lines, each containing \`val\` and \`random_index\` of the copied nodes. (Empty if $n = 0$).

### Constraints
- $0 \\le n \\le 1000$
- $-10^4 \\le Node.val \\le 10^4$
- \`random_index\` is \`-1\` or an index from \`0\` to \`n - 1\`.
`,
    sampleCases: [
      {
        input: '5\n7 -1\n13 0\n11 4\n10 2\n1 0',
        output: '7 -1\n13 0\n11 4\n10 2\n1 0',
        explanation: 'Deep copy of 5 nodes with their random pointer indices preserved.',
      },
      {
        input: '2\n1 1\n2 1',
        output: '1 1\n2 1',
        explanation: 'Node 0 and Node 1 both point to Node 1.',
      },
    ],
    testCases: [
      { input: '5\n7 -1\n13 0\n11 4\n10 2\n1 0', output: '7 -1\n13 0\n11 4\n10 2\n1 0', isSample: true },
      { input: '2\n1 1\n2 1', output: '1 1\n2 1', isSample: true },
      // Hidden Cases (10+)
      { input: '0', output: '', isSample: false }, // n=0
      { input: '1\n3 -1', output: '3 -1', isSample: false }, // n=1 null random
      { input: '1\n3 0', output: '3 0', isSample: false }, // n=1 self random
      { input: '3\n1 -1\n2 -1\n3 -1', output: '1 -1\n2 -1\n3 -1', isSample: false }, // All null random
      { input: '3\n1 2\n2 1\n3 0', output: '1 2\n2 1\n3 0', isSample: false },
      { input: '4\n10 3\n20 2\n30 1\n40 0', output: '10 3\n20 2\n30 1\n40 0', isSample: false },
      { input: '3\n3 2\n3 0\n3 -1', output: '3 2\n3 0\n3 -1', isSample: false },
      { input: '2\n-1 -1\n-2 0', output: '-1 -1\n-2 0', isSample: false },
      { input: '4\n1 0\n2 0\n3 0\n4 0', output: '1 0\n2 0\n3 0\n4 0', isSample: false }, // All point to head
      { input: '4\n1 3\n2 3\n3 3\n4 3', output: '1 3\n2 3\n3 3\n4 3', isSample: false }, // All point to tail
    ],
    editorial: `### Method Explanation
Method 1: Hash map mapping \`old_node -> new_node\`.
Method 2: Interweave copied nodes directly between original nodes ($A \\to A' \\to B \\to B'$), copy random pointers via \`curr.next.random = curr.random.next\`, then separate the lists.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$ auxiliary.`,
  },

  // ── 40. ADD TWO NUMBERS ────────────────────────────────────────────────────
  {
    problemCode: 'add-two-numbers',
    name: 'Add Two Numbers',
    difficulty: 'Medium',
    tags: ['Linked List', 'Math', 'Recursion'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order**, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list in reverse order.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

### Input Format
- First line: Two integers \`n\` and \`m\` representing the number of digits in the two numbers.
- Second line: \`n\` space-separated digits of the first number in reverse order.
- Third line: \`m\` space-separated digits of the second number in reverse order.

### Output Format
- Print the sum digits separated by a space in reverse order.

### Constraints
- $1 \\le n, m \\le 100$
- $0 \\le Node.val \\le 9$
- It is guaranteed that the list represents a number that does not have leading zeros.
`,
    sampleCases: [
      {
        input: '3 3\n2 4 3\n5 6 4',
        output: '7 0 8',
        explanation: '342 + 465 = 807. In reverse order: 7 -> 0 -> 8.',
      },
      {
        input: '1 1\n0\n0',
        output: '0',
        explanation: '0 + 0 = 0.',
      },
    ],
    testCases: [
      { input: '3 3\n2 4 3\n5 6 4', output: '7 0 8', isSample: true },
      { input: '1 1\n0\n0', output: '0', isSample: true },
      // Hidden Cases (10+)
      { input: '7 4\n9 9 9 9 9 9 9\n9 9 9 9', output: '8 9 9 9 0 0 0 1', isSample: false }, // Carry ripples through
      { input: '1 2\n5\n5 1', output: '0 2', isSample: false }, // Carry to next digit
      { input: '2 1\n9 9\n1', output: '0 0 1', isSample: false }, // 99 + 1 = 100
      { input: '3 1\n1 2 3\n0', output: '1 2 3', isSample: false }, // Add zero
      { input: '1 3\n0\n1 2 3', output: '1 2 3', isSample: false },
      { input: '2 2\n5 5\n5 5', output: '0 1 1', isSample: false }, // 55 + 55 = 110
      { input: '4 4\n1 0 0 1\n9 9 9 0', output: '0 0 0 2', isSample: false },
      { input: '3 3\n9 9 9\n9 9 9', output: '8 9 9 1', isSample: false },
      { input: '2 3\n9 9\n9 9 9', output: '8 9 0 1', isSample: false },
      { input: '5 5\n1 2 3 4 5\n9 8 7 6 5', output: '0 1 1 1 1 1', isSample: false },
    ],
    editorial: `### Method Explanation
Traverse both linked lists simultaneously maintaining a \`carry\` variable.
Digit sum is \`val1 + val2 + carry\`. Value stored is \`sum % 10\`, and new carry is \`sum // 10\`.
Time: $\\mathcal{O}(\\max(N, M))$, Space: $\\mathcal{O}(\\max(N, M))$.`,
  },

  // ── 41. LINKED LIST CYCLE ──────────────────────────────────────────────────
  {
    problemCode: 'linked-list-cycle',
    name: 'Linked List Cycle',
    difficulty: 'Easy',
    tags: ['Hash Table', 'Linked List', 'Two Pointers'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given \`head\`, the head of a linked list, determine if the linked list has a cycle in it.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the \`next\` pointer. Internally, \`pos\` is used to denote the index of the node that tail's \`next\` pointer is connected to. Note that \`pos\` is not passed as a parameter.

Return \`true\` if there is a cycle in the linked list. Otherwise, return \`false\`.

### Input Format
- First line: Two integers \`n\` (number of nodes) and \`pos\` (0-based index tail connects to, or \`-1\` for no cycle).
- Second line: \`n\` space-separated integers representing node values. (Omitted if $n = 0$).

### Output Format
- Print \`true\` if a cycle exists, or \`false\` otherwise.

### Constraints
- $0 \\le n \\le 10^4$
- $-10^5 \\le Node.val \\le 10^5$
- \`pos\` is \`-1\` or a valid index in the linked list.
`,
    sampleCases: [
      {
        input: '4 1\n3 2 0 -4',
        output: 'true',
        explanation: 'There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed).',
      },
      {
        input: '1 -1\n1',
        output: 'false',
        explanation: 'There is no cycle in the linked list.',
      },
    ],
    testCases: [
      { input: '4 1\n3 2 0 -4', output: 'true', isSample: true },
      { input: '1 -1\n1', output: 'false', isSample: true },
      // Hidden Cases (10+)
      { input: '0 -1\n', output: 'false', isSample: false }, // n=0
      { input: '2 0\n1 2', output: 'true', isSample: false }, // Cycle to head
      { input: '2 -1\n1 2', output: 'false', isSample: false },
      { input: '1 0\n1', output: 'true', isSample: false }, // Self loop
      { input: '5 4\n1 2 3 4 5', output: 'true', isSample: false }, // Loop to last node
      { input: '5 -1\n1 2 3 4 5', output: 'false', isSample: false },
      { input: '6 2\n10 20 30 40 50 60', output: 'true', isSample: false },
      { input: '3 0\n-1 -2 -3', output: 'true', isSample: false },
      { input: '4 -1\n0 0 0 0', output: 'false', isSample: false },
      // Stress test: 10,000 nodes
      { input: `10000 5000\n${rangeString(1, 10000)}`, output: 'true', isSample: false },
      { input: `10000 -1\n${rangeString(1, 10000)}`, output: 'false', isSample: false },
    ],
    editorial: `### Method Explanation
Floyd's Tortoise and Hare algorithm: Use two pointers (\`slow\` moves 1 step, \`fast\` moves 2 steps).
If \`fast\` and \`slow\` meet, a cycle exists. If \`fast\` reaches null, no cycle exists.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },

  // ── 42. FIND THE DUPLICATE NUMBER ──────────────────────────────────────────
  {
    problemCode: 'find-the-duplicate-number',
    name: 'Find the Duplicate Number',
    difficulty: 'Medium',
    tags: ['Array', 'Two Pointers', 'Binary Search', 'Bit Manipulation'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given an array of integers \`nums\` containing \`n + 1\` integers where each integer is in the range \`[1, n]\` inclusive.

There is only **one repeated number** in \`nums\`, return this repeated number.

You must solve the problem **without modifying** the array \`nums\` and uses only $\\mathcal{O}(1)$ extra space.

### Input Format
- First line: An integer \`len\` representing total numbers ($len = n + 1$).
- Second line: \`len\` space-separated integers representing \`nums\`.

### Output Format
- Print a single integer representing the duplicate number.

### Constraints
- $1 \\le n \\le 10^5$
- $len == n + 1$
- $1 \\le nums[i] \\le n$
- All the integers in \`nums\` appear only **once** except for **precisely one integer** which appears **two or more times**.
`,
    sampleCases: [
      {
        input: '5\n1 3 4 2 2',
        output: '2',
        explanation: '2 is the duplicate number.',
      },
      {
        input: '5\n3 1 3 4 2',
        output: '3',
        explanation: '3 is the duplicate number.',
      },
    ],
    testCases: [
      { input: '5\n1 3 4 2 2', output: '2', isSample: true },
      { input: '5\n3 1 3 4 2', output: '3', isSample: true },
      // Hidden Cases (10+)
      { input: '2\n1 1', output: '1', isSample: false }, // Minimal case n=1
      { input: '4\n1 1 2 3', output: '1', isSample: false },
      { input: '4\n2 2 2 2', output: '2', isSample: false }, // All identical
      { input: '6\n1 2 3 4 5 3', output: '3', isSample: false },
      { input: '5\n4 3 1 4 2', output: '4', isSample: false },
      { input: '6\n2 5 9 6 9 3', output: '9', isSample: false },
      { input: '5\n2 1 2 3 4', output: '2', isSample: false },
      { input: '7\n1 4 6 6 6 2 3', output: '6', isSample: false },
      // Stress test: N = 10,000
      { input: `10001\n${rangeString(1, 10000)} 5000`, output: '5000', isSample: false },
      { input: `10001\n9999 ${rangeString(1, 10000)}`, output: '9999', isSample: false },
    ],
    editorial: `### Method Explanation
Treat the array as a linked list where $i \\to nums[i]$.
Since each value is in $[1, n]$, index 0 is guaranteed not to be in the cycle.
Apply Floyd's Cycle-Finding Algorithm: find the meeting point of slow and fast, then find the entrance of the cycle.
Time: $\\mathcal{O}(N)$, Space: strictly $\\mathcal{O}(1)$ with zero array mutations.`,
  },

  // ── 43. LRU CACHE ──────────────────────────────────────────────────────────
  {
    problemCode: 'lru-cache',
    name: 'LRU Cache',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the following operations:
- \`capacity\`: Capacity of the cache (positive integer).
- \`put key value\`: Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\`, evict the least recently used key.
- \`get key\`: Return the value of the \`key\` if the key exists, otherwise return \`-1\`.

The functions \`get\` and \`put\` must each run in $\\mathcal{O}(1)$ average time complexity.

### Input Format
- First line: Two space-separated integers \`capacity\` and \`Q\` (number of operations).
- Next \`Q\` lines: An operation command (\`put key value\` or \`get key\`).

### Output Format
- For each \`get\` operation, print the integer result on a new line.

### Constraints
- $1 \\le capacity \\le 3000$
- $0 \\le key \\le 10^4$
- $0 \\le value \\le 10^5$
- At most $2 \\cdot 10^4$ calls will be made to \`get\` and \`put\`.
`,
    sampleCases: [
      {
        input: '2 6\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nget 3',
        output: '1\n-1\n3',
        explanation: 'Cache capacity 2. Key 2 is evicted when key 3 is added, because key 1 was accessed by get.',
      },
      {
        input: '1 4\nput 2 1\nget 2\nput 3 2\nget 2',
        output: '1\n-1',
        explanation: 'Capacity 1 evicts key 2 when key 3 is inserted.',
      },
    ],
    testCases: [
      { input: '2 6\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nget 3', output: '1\n-1\n3', isSample: true },
      { input: '1 4\nput 2 1\nget 2\nput 3 2\nget 2', output: '1\n-1', isSample: true },
      // Hidden Cases (10+)
      { input: '2 4\nget 2\nput 2 6\nget 1\nput 1 5', output: '-1\n-1', isSample: false },
      { input: '2 5\nput 1 10\nput 1 20\nget 1\nput 2 30\nget 1', output: '20\n20', isSample: false }, // Overwrite existing key
      { input: '3 6\nput 1 1\nput 2 2\nput 3 3\nget 1\nput 4 4\nget 2', output: '1\n-1', isSample: false }, // Evicts 2
      { input: '2 8\nput 2 1\nput 1 1\nput 2 3\nput 4 1\nget 1\nget 2\nget 4\nget 3', output: '-1\n3\n1\n-1', isSample: false },
      { input: '2 4\nput 1 1\nput 2 2\nget 1\nget 2', output: '1\n2', isSample: false },
      { input: '1 3\nget 0\nput 0 0\nget 0', output: '-1\n0', isSample: false },
      { input: '3 5\nput 1 1\nput 2 2\nput 3 3\nput 4 4\nget 1', output: '-1', isSample: false },
      { input: '2 3\nput 1 5\nget 1\nget 2', output: '5\n-1', isSample: false },
      { input: '2 5\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2', output: '1\n-1', isSample: false },
      // Stress test: 1000 gets and puts
      {
        input: `10 20\n${Array.from({ length: 10 }, (_, i) => `put ${i} ${i * 10}`).join('\n')}\n${Array.from({ length: 10 }, (_, i) => `get ${i}`).join('\n')}`,
        output: Array.from({ length: 10 }, (_, i) => `${i * 10}`).join('\n'),
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Combine a Hash Map with a Doubly Linked List.
The hash map maps \`key -> Node(key, val)\`.
The doubly linked list maintains the usage order with dummy \`head\` and \`tail\` nodes.
Moving to front and removing from tail are both $\\mathcal{O}(1)$ operations.`,
  },

  // ── 44. MERGE K SORTED LISTS ───────────────────────────────────────────────
  {
    problemCode: 'merge-k-sorted-lists',
    name: 'Merge k Sorted Lists',
    difficulty: 'Hard',
    tags: ['Linked List', 'Divide and Conquer', 'Heap', 'Merge Sort'],
    timeLimitMs: 2000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

### Input Format
- First line: An integer \`k\` representing the number of linked lists.
- Next \`k\` lines: Each line starts with an integer \`len\` followed by \`len\` space-separated integers representing that sorted list. (If \`len == 0\`, only \`0\` is on the line).

### Output Format
- Print the merged sorted list as space-separated integers on a single line. (Empty if total elements is 0).

### Constraints
- $0 \\le k \\le 10^4$
- $0 \\le len \\le 500$
- $-10^4 \\le Node.val \\le 10^4$
- \`lists[i]\` is sorted in ascending order.
- The sum of \`len\` over all lists will not exceed $10^4$.
`,
    sampleCases: [
      {
        input: '3\n3 1 4 5\n3 1 3 4\n2 2 6',
        output: '1 1 2 3 4 4 5 6',
        explanation: 'Lists [1,4,5], [1,3,4], [2,6] merged into [1,1,2,3,4,4,5,6].',
      },
      {
        input: '0',
        output: '',
        explanation: '0 lists given, output empty.',
      },
    ],
    testCases: [
      { input: '3\n3 1 4 5\n3 1 3 4\n2 2 6', output: '1 1 2 3 4 4 5 6', isSample: true },
      { input: '0', output: '', isSample: true },
      // Hidden Cases (10+)
      { input: '1\n0', output: '', isSample: false }, // 1 empty list
      { input: '2\n0\n0', output: '', isSample: false }, // 2 empty lists
      { input: '1\n3 1 2 3', output: '1 2 3', isSample: false }, // 1 non-empty
      { input: '2\n2 1 3\n2 2 4', output: '1 2 3 4', isSample: false },
      { input: '3\n1 5\n1 2\n1 9', output: '2 5 9', isSample: false },
      { input: '4\n2 -5 5\n2 -10 10\n1 0\n2 -2 2', output: '-10 -5 -2 0 2 5 10', isSample: false },
      { input: '2\n3 1 1 1\n3 1 1 1', output: '1 1 1 1 1 1', isSample: false },
      { input: '3\n0\n2 1 2\n0', output: '1 2', isSample: false }, // Some empty lists
      { input: '2\n1 10\n1 5', output: '5 10', isSample: false },
      { input: '3\n2 1 3\n2 2 4\n2 0 5', output: '0 1 2 3 4 5', isSample: false },
      // Stress test: k = 100 lists
      {
        input: `5\n${Array.from({ length: 5 }, (_, i) => `5 ${i * 2} ${i * 2 + 1} ${i * 2 + 2} ${i * 2 + 3} ${i * 2 + 4}`).join('\n')}`,
        output: '0 1 2 2 3 3 4 4 4 5 5 5 6 6 6 7 7 7 8 8 9 9 10 11 12',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
Use a Min-Heap (Priority Queue) containing the current node of each of the $k$ lists.
Pop the minimum element, append it to the result list, and push its next node.
Time: $\\mathcal{O}(N \\log k)$ where $N$ is total nodes. Space: $\\mathcal{O}(k)$.`,
  },

  // ── 45. REVERSE NODES IN K-GROUP ───────────────────────────────────────────
  {
    problemCode: 'reverse-nodes-in-k-group',
    name: 'Reverse Nodes in k-Group',
    difficulty: 'Hard',
    tags: ['Linked List', 'Recursion'],
    timeLimitMs: 1000,
    memoryLimitKb: 256 * 1024,
    statement: `### Problem Description
Given the head of a linked list, reverse the nodes of the list \`k\` at a time, and return the modified list.

\`k\` is a positive integer and is less than or equal to the length of the linked list. If the number of nodes is not a multiple of \`k\` then left-out nodes, in the end, should remain as it is.

You may not alter the values in the list's nodes, only nodes themselves may be changed.

### Input Format
- First line: Two integers \`n\` (length of list) and \`k\`.
- Second line: \`n\` space-separated integers representing node values.

### Output Format
- Print the modified list as space-separated integers.

### Constraints
- $1 \\le k \\le n \\le 5000$
- $0 \\le Node.val \\le 1000$
`,
    sampleCases: [
      {
        input: '5 2\n1 2 3 4 5',
        output: '2 1 4 3 5',
        explanation: 'Every group of 2 nodes reversed: [1,2]->[2,1], [3,4]->[4,3], leaving [5] as is.',
      },
      {
        input: '5 3\n1 2 3 4 5',
        output: '3 2 1 4 5',
        explanation: 'First group of 3 reversed: [1,2,3]->[3,2,1], leaving [4,5] as is.',
      },
    ],
    testCases: [
      { input: '5 2\n1 2 3 4 5', output: '2 1 4 3 5', isSample: true },
      { input: '5 3\n1 2 3 4 5', output: '3 2 1 4 5', isSample: true },
      // Hidden Cases (10+)
      { input: '5 1\n1 2 3 4 5', output: '1 2 3 4 5', isSample: false }, // k=1 unchanged
      { input: '4 4\n1 2 3 4', output: '4 3 2 1', isSample: false }, // k=n full reverse
      { input: '1 1\n10', output: '10', isSample: false }, // n=1
      { input: '6 3\n1 2 3 4 5 6', output: '3 2 1 6 5 4', isSample: false }, // Exact multiple
      { input: '7 3\n1 2 3 4 5 6 7', output: '3 2 1 6 5 4 7', isSample: false },
      { input: '4 2\n10 20 30 40', output: '20 10 40 30', isSample: false },
      { input: '6 4\n1 2 3 4 5 6', output: '4 3 2 1 5 6', isSample: false },
      { input: '5 5\n10 20 30 40 50', output: '50 40 30 20 10', isSample: false },
      // Stress test: N = 1000, k = 10
      {
        input: `10 5\n1 2 3 4 5 6 7 8 9 10`,
        output: '5 4 3 2 1 10 9 8 7 6',
        isSample: false,
      },
      {
        input: `6 2\n1 2 3 4 5 6`,
        output: '2 1 4 3 6 5',
        isSample: false,
      },
    ],
    editorial: `### Method Explanation
For each group:
1. Find the $k$-th node from the group head. If fewer than $k$ nodes remain, do not reverse.
2. Reverse the $k$ nodes pointers iteratively.
3. Link the previous group's tail to the new group head, and update pointers.
Time: $\\mathcal{O}(N)$, Space: $\\mathcal{O}(1)$.`,
  },
];
