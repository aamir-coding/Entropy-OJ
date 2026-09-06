import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toDate, toISODateString, compareDates } from '../utils/date';

describe('Universal Date Utilities Tests', () => {
  it('should correctly parse valid ISO date strings', () => {
    const isoString = '2026-09-06T12:00:00.000Z';
    const date = toDate(isoString);
    assert.ok(date instanceof Date);
    assert.strictEqual(date.toISOString(), isoString);
  });

  it('should return the same Date object if already a Date instance', () => {
    const original = new Date('2026-01-01T00:00:00.000Z');
    const result = toDate(original);
    assert.strictEqual(result, original);
  });

  it('should throw a TypeError when given an invalid date string', () => {
    assert.throws(() => toDate('not-a-real-date'), {
      name: 'TypeError',
      message: /Invalid date input/,
    });
  });

  it('should throw a TypeError when given an empty string or invalid type', () => {
    assert.throws(() => toDate(''), {
      name: 'TypeError',
      message: /Invalid date input/,
    });
    assert.throws(() => toDate(null as any), {
      name: 'TypeError',
      message: /Invalid date input/,
    });
    assert.throws(() => toDate(undefined as any), {
      name: 'TypeError',
      message: /Invalid date input/,
    });
  });

  it('should throw a TypeError when given an invalid Date instance (NaN time)', () => {
    const invalidDate = new Date('invalid');
    assert.throws(() => toDate(invalidDate), {
      name: 'TypeError',
      message: /Invalid date input/,
    });
  });

  it('toISODateString should return a valid ISO string', () => {
    const date = new Date('2026-05-15T08:30:00.000Z');
    assert.strictEqual(toISODateString(date), '2026-05-15T08:30:00.000Z');
    assert.strictEqual(toISODateString('2026-05-15T08:30:00.000Z'), '2026-05-15T08:30:00.000Z');
  });

  it('compareDates should accurately order dates', () => {
    const earlier = '2026-01-01T00:00:00.000Z';
    const later = '2026-02-01T00:00:00.000Z';

    assert.ok(compareDates(earlier, later) < 0);
    assert.ok(compareDates(later, earlier) > 0);
    assert.strictEqual(compareDates(earlier, earlier), 0);
  });
});
