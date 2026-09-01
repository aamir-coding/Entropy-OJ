import { describe, it } from 'node:test';
import assert from 'node:assert';
import { stripCodeBlocks } from '../ai/codeBlockStripper';

describe('AI Code Block Stripper Security Guardrail Tests', () => {
  it('should strip markdown fenced code blocks (``` ... ```)', () => {
    const input = `Here is your hint:
\`\`\`cpp
for (int i = 0; i < n; i++) {
    ans += nums[i];
}
\`\`\`
Think about what happens when the array is empty.`;

    const sanitized = stripCodeBlocks(input);
    assert.strictEqual(sanitized.includes('for (int i = 0'), false);
    assert.strictEqual(sanitized.includes('ans += nums[i]'), false);
    assert.strictEqual(sanitized.includes('Think about what happens when the array is empty.'), true);
  });

  it('should strip tilde fenced code blocks (~~~ ... ~~~)', () => {
    const input = `Try using this:
~~~python
def solve(x):
    return x * 2
~~~
What base case is missing?`;

    const sanitized = stripCodeBlocks(input);
    assert.strictEqual(sanitized.includes('def solve(x):'), false);
    assert.strictEqual(sanitized.includes('What base case is missing?'), true);
  });

  it('should strip inline code backticks while preserving the text', () => {
    const input = 'Check if your pointer `left` exceeds `right` during execution.';
    const sanitized = stripCodeBlocks(input);
    assert.strictEqual(sanitized.includes('`'), false);
    assert.strictEqual(sanitized.includes('left exceeds right'), true);
  });

  it('should strip HTML <code>, <pre>, and <script> tags and contents', () => {
    const input = `Look at your loop condition:
<pre><code>while (curr != NULL) { curr = curr->next; }</code></pre>
<script>alert('xss')</script>
Consider handling the head pointer when list is single-element.`;

    const sanitized = stripCodeBlocks(input);
    assert.strictEqual(sanitized.includes('curr->next'), false);
    assert.strictEqual(sanitized.includes('alert'), false);
    assert.strictEqual(sanitized.includes('<script>'), false);
    assert.strictEqual(sanitized.includes('<pre>'), false);
    assert.strictEqual(sanitized.includes('Consider handling the head pointer when list is single-element.'), true);
  });

  it('should strip direct code statements emitted without markdown fences', () => {
    const input = `You forgot an include statement:
#include <vector>
import math
int count = 0;
return ans;
Have you verified if the input size can be zero?`;

    const sanitized = stripCodeBlocks(input);
    assert.strictEqual(sanitized.includes('#include <vector>'), false);
    assert.strictEqual(sanitized.includes('int count = 0;'), false);
    assert.strictEqual(sanitized.includes('return ans;'), false);
    assert.strictEqual(sanitized.includes('Have you verified if the input size can be zero?'), true);
  });

  it('should handle empty, null, or whitespace-only inputs safely', () => {
    assert.strictEqual(stripCodeBlocks(''), '');
    assert.strictEqual(stripCodeBlocks('   '), '');
    assert.strictEqual(stripCodeBlocks(null as unknown as string), '');
  });
});
