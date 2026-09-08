/**
 * Universal Date utilities for cross-boundary conversions between wire strings, numbers, and Date objects.
 */

function isDateLike(value: unknown): value is Date {
  return (
    value instanceof Date ||
    Object.prototype.toString.call(value) === '[object Date]' ||
    (typeof value === 'object' && value !== null && typeof (value as any).getTime === 'function')
  );
}

export function toDate(value: string | Date | number): Date {
  if (isDateLike(value)) {
    if (Number.isNaN(value.getTime())) {
      throw new TypeError(`Invalid date input: ${String(value)}`);
    }
    return value;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError(`Invalid date input: ${String(value)}`);
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      throw new TypeError(`Invalid date input: ${String(value)}`);
    }
    return d;
  }

  if (!value || typeof value !== 'string') {
    throw new TypeError(`Invalid date input: ${String(value)}`);
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new TypeError(`Invalid date input: ${String(value)}`);
  }
  return d;
}

export function toISODateString(value: string | Date | number): string {
  return toDate(value).toISOString();
}

export function compareDates(a: string | Date | number, b: string | Date | number): number {
  const timeA = toDate(a).getTime();
  const timeB = toDate(b).getTime();
  return timeA - timeB;
}
