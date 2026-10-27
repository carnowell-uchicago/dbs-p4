// Work sessions and time zones.
//
// A session is stored as two instants (exact moments in time, like the
// timestamps in the database). To answer "how much did I work on Monday?"
// we need to know when Monday starts and ends *in the user's time zone*,
// and that is where daylight saving time (DST) makes things tricky:
// in America/Chicago, 2026-11-01 is 25 hours long.
//
// We use the built-in Intl.DateTimeFormat for all time zone work, so we
// don't need a date library.

import { addDays, formatDateKey, parseDateKey } from "./dates";

export const MS_PER_MINUTE = 60 * 1000;

export type Session = {
  clockIn: Date;
  /** null means the session is still running (the user hasn't clocked out). */
  clockOut: Date | null;
};

/** One piece of a session that falls inside a single calendar day. */
export type DaySegment = {
  date: string; // YYYY-MM-DD in the chosen time zone
  start: Date;
  end: Date;
  ms: number;
};

/**
 * Reads the wall-clock date and time of an instant in a time zone.
 * Example: 2026-10-27T15:00Z in "America/Chicago" -> 2026-10-27 10:00:00.
 */
function wallClockParts(instant: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23", // 0-23, never "24"
  });
  const parts: Record<string, number> = {};
  for (const part of formatter.formatToParts(instant)) {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
  }
  return parts as {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
  };
}

/** The calendar date (YYYY-MM-DD) of an instant, as seen in `timeZone`. */
export function toDateKey(instant: Date, timeZone: string): string {
  const { year, month, day } = wallClockParts(instant, timeZone);
  return formatDateKey(year, month, day);
}

/** The local time "HH:MM" (24-hour) of an instant, as seen in `timeZone`. */
export function formatTime(instant: Date, timeZone: string): string {
  const { hour, minute } = wallClockParts(instant, timeZone);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * How far ahead of UTC the time zone is at that instant, in milliseconds.
 * Chicago in summer (CDT) -> -5 hours; in winter (CST) -> -6 hours.
 */
function utcOffsetMs(instant: Date, timeZone: string): number {
  const p = wallClockParts(instant, timeZone);
  const wallClockAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const instantToTheSecond = Math.floor(instant.getTime() / 1000) * 1000;
  return wallClockAsUtc - instantToTheSecond;
}

/**
 * The instant when the calendar day `dateKey` begins (00:00) in `timeZone`.
 *
 * We first pretend the zone is UTC, then correct by the zone's offset.
 * The offset can differ before and after a DST change, so we check it a
 * second time at our answer and correct again if needed.
 *
 * Assumes midnight exists in the zone. That's true for America/Chicago and
 * other US zones, which change clocks at 2 AM.
 */
export function startOfDay(dateKey: string, timeZone: string): Date {
  const { year, month, day } = parseDateKey(dateKey);
  const midnightIfUtc = Date.UTC(year, month - 1, day);
  const firstOffset = utcOffsetMs(new Date(midnightIfUtc), timeZone);
  let guess = midnightIfUtc - firstOffset;
  const secondOffset = utcOffsetMs(new Date(guess), timeZone);
  if (secondOffset !== firstOffset) {
    guess = midnightIfUtc - secondOffset;
  }
  return new Date(guess);
}

/** The end of a session: its clock-out, or `now` if it is still running. */
export function sessionEnd(session: Session, now: Date): Date {
  return session.clockOut ?? now;
}

/** Length of a session in milliseconds. A running session counts up to `now`. */
export function sessionDurationMs(session: Session, now: Date): number {
  const end = sessionEnd(session, now);
  const ms = end.getTime() - session.clockIn.getTime();
  if (ms < 0) {
    throw new Error("A session cannot end before it starts.");
  }
  return ms;
}

/** Full minutes worked in a session (partial minutes are dropped). */
export function sessionMinutes(session: Session, now: Date): number {
  return Math.floor(sessionDurationMs(session, now) / MS_PER_MINUTE);
}

/**
 * Cuts a session into one piece per calendar day in `timeZone`.
 * A session from 22:00 to 02:00 becomes 22:00-24:00 on day 1 and
 * 00:00-02:00 on day 2.
 */
export function splitSessionByDay(session: Session, timeZone: string, now: Date): DaySegment[] {
  const end = sessionEnd(session, now);
  sessionDurationMs(session, now); // throws if the session is backwards

  const segments: DaySegment[] = [];
  let pieceStart = session.clockIn;
  while (pieceStart < end) {
    const date = toDateKey(pieceStart, timeZone);
    const nextMidnight = startOfDay(addDays(date, 1), timeZone);
    const pieceEnd = end < nextMidnight ? end : nextMidnight;
    segments.push({
      date,
      start: pieceStart,
      end: pieceEnd,
      ms: pieceEnd.getTime() - pieceStart.getTime(),
    });
    pieceStart = pieceEnd;
  }
  return segments;
}

/** Total milliseconds worked per calendar day, e.g. Map { "2026-10-27" => 3600000 }. */
export function totalsByDay(sessions: Session[], timeZone: string, now: Date): Map<string, number> {
  const totals = new Map<string, number>();
  for (const session of sessions) {
    for (const segment of splitSessionByDay(session, timeZone, now)) {
      totals.set(segment.date, (totals.get(segment.date) ?? 0) + segment.ms);
    }
  }
  return totals;
}
