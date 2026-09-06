/**
 * Universal Date utilities for cross-boundary conversions between wire strings and Date objects.
 */

export function toDate(value: string | Date): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new TypeError(`Invalid date input: ${String(value)}`);
    }
    return value;
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

export function toISODateString(value: string | Date): string {
  return toDate(value).toISOString();
}

export function compareDates(a: string | Date, b: string | Date): number {
  const timeA = toDate(a).getTime();
  const timeB = toDate(b).getTime();
  return timeA - timeB;
}
