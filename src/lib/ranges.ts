// Timesheet date ranges.
//
// The user picks a length (1 week, 2 weeks, or a custom number of days) and
// EITHER the first day ("start") OR the last day ("end"). We work out the
// other end. Ranges are inclusive: a 1-week range has 7 days, counting both
// the start and the end.
//
// The three ways to call buildRange:
//
//   buildRange({ preset: "1w", anchor: "end", date: "2026-10-23" })
//     -> { start: "2026-10-17", end: "2026-10-23" }
//
//   buildRange({ preset: "custom", anchor: "start", date: "2026-10-01", days: 10 })
//     -> { start: "2026-10-01", end: "2026-10-10" }
//
//   buildRange({ preset: "custom", start: "2026-10-01", end: "2026-10-31" })
//     -> { start: "2026-10-01", end: "2026-10-31" }

import { addDays, assertDateKey, daysBetween } from "./dates";

export const PRESET_DAYS = { "1w": 7, "2w": 14 } as const;
export const MIN_RANGE_DAYS = 1;
export const MAX_RANGE_DAYS = 366;

export type DateRange = { start: string; end: string }; // both YYYY-MM-DD, inclusive

export type Anchor = "start" | "end";

export type RangeInput =
  /** A fixed 1- or 2-week range, anchored on its first or last day. */
  | { preset: "1w" | "2w"; anchor: Anchor; date: string }
  /** A custom number of days (1-366), anchored on its first or last day. */
  | { preset: "custom"; anchor: Anchor; date: string; days: number }
  /** A custom range with both ends chosen by the user. */
  | { preset: "custom"; start: string; end: string };

/** Turns the user's choice into an inclusive { start, end } range. Throws on bad input. */
export function buildRange(input: RangeInput): DateRange {
  if ("start" in input) {
    assertDateKey(input.start);
    assertDateKey(input.end);
    const days = daysBetween(input.start, input.end) + 1;
    if (days < MIN_RANGE_DAYS) {
      throw new Error("The start date must be on or before the end date.");
    }
    assertDayCount(days);
    return { start: input.start, end: input.end };
  }

  assertDateKey(input.date);
  const days = input.preset === "custom" ? input.days : PRESET_DAYS[input.preset];
  assertDayCount(days);

  if (input.anchor === "start") {
    return { start: input.date, end: addDays(input.date, days - 1) };
  }
  return { start: addDays(input.date, -(days - 1)), end: input.date };
}

/** Number of days in a range, counting both ends. */
export function rangeLength(range: DateRange): number {
  return daysBetween(range.start, range.end) + 1;
}

function assertDayCount(days: number): void {
  if (!Number.isInteger(days) || days < MIN_RANGE_DAYS || days > MAX_RANGE_DAYS) {
    throw new Error(
      `A range must be a whole number of days from ${MIN_RANGE_DAYS} to ${MAX_RANGE_DAYS}.`,
    );
  }
}
