import { describe, it } from 'node:test';
import assert from 'node:assert';
import { diffOutput, normalizeOutput } from './diffOutput';

describe('diffOutput & normalizeOutput Tests', () => {
  it('should treat exact string matches as valid', () => {
    const actual = 'hello world\n1 2 3';
    const expected = 'hello world\n1 2 3';
    const result = diffOutput(actual, expected);
    assert.strictEqual(result.isMatch, true);
  });

  it('should ignore CRLF vs LF differences', () => {
    const actual = 'line1\r\nline2\r\n';
    const expected = 'line1\nline2\n';
    const result = diffOutput(actual, expected);
    assert.strictEqual(result.isMatch, true);
  });

  it('should trim trailing whitespace on lines (Decision R2)', () => {
    const actual = '1 2 3   \n4 5   ';
    const expected = '1 2 3\n4 5';
    const result = diffOutput(actual, expected);
    assert.strictEqual(result.isMatch, true);
  });

  it('should trim trailing empty lines at EOF (Decision R2)', () => {
    const actual = 'Accepted\n\n\n';
    const expected = 'Accepted';
    const result = diffOutput(actual, expected);
    assert.strictEqual(result.isMatch, true);
  });

  it('should preserve internal whitespace differences', () => {
    const actual = '1   2 3';
    const expected = '1 2 3';
    const result = diffOutput(actual, expected);
    assert.strictEqual(result.isMatch, false);
    assert.strictEqual(result.diffLineIndex, 1);
  });

  it('should identify mismatch line and line content', () => {
    const actual = '42\n100\n200';
    const expected = '42\n999\n200';
    const result = diffOutput(actual, expected);
    assert.strictEqual(result.isMatch, false);
    assert.strictEqual(result.diffLineIndex, 2);
    assert.strictEqual(result.actualLine, '100');
    assert.strictEqual(result.expectedLine, '999');
  });

  it('should handle empty strings and whitespace-only outputs gracefully', () => {
    assert.strictEqual(diffOutput('', '').isMatch, true);
    assert.strictEqual(diffOutput('   \n\n  ', '').isMatch, true);
    assert.strictEqual(diffOutput('', 'expected').isMatch, false);
  });
});
