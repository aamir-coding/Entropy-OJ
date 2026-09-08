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

  it('should accept valid numeric millisecond timestamps (Low 3)', () => {
    const timestamp = 1757200000000;
    const date = toDate(timestamp);
    assert.strictEqual(date.getTime(), timestamp);
    assert.strictEqual(toISODateString(timestamp), new Date(timestamp).toISOString());
  });

  it('should throw for non-finite or invalid numeric timestamps (Low 3)', () => {
    assert.throws(() => toDate(NaN), {
      name: 'TypeError',
      message: /Invalid date input/,
    });
    assert.throws(() => toDate(Infinity), {
      name: 'TypeError',
      message: /Invalid date input/,
    });
  });

  it('should accept date-like objects with getTime method (cross-realm simulation) (Low 3)', () => {
    const mockCrossRealmDate = {
      getTime: () => 1757200000000,
    };
    const date = toDate(mockCrossRealmDate as any);
    assert.strictEqual((date as any).getTime(), 1757200000000);
  });
});
