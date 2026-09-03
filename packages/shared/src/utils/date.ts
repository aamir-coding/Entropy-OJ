/**
 * Universal Date utilities for cross-boundary conversions between wire strings and Date objects.
 */

export function toDate(value: string | Date): Date {
  if (value instanceof Date) {
    return value;
  }
  return new Date(value);
}

export function toISODateString(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(value).toISOString();
}

export function compareDates(a: string | Date, b: string | Date): number {
  const timeA = toDate(a).getTime();
  const timeB = toDate(b).getTime();
  return timeA - timeB;
}
