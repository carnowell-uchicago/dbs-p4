// Calendar-date helpers for "YYYY-MM-DD" strings (we call these "date keys").
//
// A date key is a day on the calendar, with no time and no time zone.
// To do arithmetic on one we treat it as midnight UTC. UTC has no daylight
// saving time, so every UTC day is exactly 24 hours and the maths stays simple.

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True if `value` looks like YYYY-MM-DD and is a real date (no 2026-02-30). */
export function isValidDateKey(value: string): boolean {
  const match = DATE_KEY_PATTERN.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const asDate = new Date(Date.UTC(year, month - 1, day));
  return (
    asDate.getUTCFullYear() === year &&
    asDate.getUTCMonth() === month - 1 &&
    asDate.getUTCDate() === day
  );
}

/** Throws a clear error if `value` is not a valid date key. */
export function assertDateKey(value: string): void {
  if (!isValidDateKey(value)) {
    throw new Error(`Invalid date "${value}". Expected YYYY-MM-DD.`);
  }
}

/** Splits a date key into numbers: "2026-10-23" -> { year: 2026, month: 10, day: 23 }. */
export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  assertDateKey(dateKey);
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

/** Builds a date key from numbers, zero-padding month and day. */
export function formatDateKey(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${String(year).padStart(4, "0")}-${mm}-${dd}`;
}

/** Midnight UTC of a date key, in milliseconds. Only used for day arithmetic. */
function toUtcMs(dateKey: string): number {
  const { year, month, day } = parseDateKey(dateKey);
  return Date.UTC(year, month - 1, day);
}

/** Adds (or subtracts, if negative) whole days: addDays("2026-10-31", 1) -> "2026-11-01". */
export function addDays(dateKey: string, days: number): string {
  const result = new Date(toUtcMs(dateKey) + days * MS_PER_DAY);
  return formatDateKey(result.getUTCFullYear(), result.getUTCMonth() + 1, result.getUTCDate());
}

/** Whole days from `from` to `to`: daysBetween("2026-10-27", "2026-10-28") -> 1. */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

/** Every date key from `start` to `end`, both included. */
export function listDates(start: string, end: string): string[] {
  const count = daysBetween(start, end) + 1;
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    dates.push(addDays(start, i));
  }
  return dates;
}

/** The Monday of the week that `dateKey` is in: weekStart("2026-10-29") (a Thursday) -> "2026-10-26". */
export function weekStart(dateKey: string): string {
  const weekday = new Date(toUtcMs(dateKey)).getUTCDay(); // 0 = Sunday … 6 = Saturday
  const daysSinceMonday = (weekday + 6) % 7;
  return addDays(dateKey, -daysSinceMonday);
}
