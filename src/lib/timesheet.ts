// Timesheets: one row per day in a date range, plus a total, and CSV export.
//
// Rules:
//   - Every day in the range gets a row, even days with no work (0 minutes).
//   - A session that crosses midnight is split: each day only gets its own
//     part. On the first day its last clock-out shows as "24:00", and on the
//     second day its first clock-in shows as "00:00". It counts as a session
//     on both days.
//   - A session that is still running counts up to `now`, and its day's
//     last clock-out is null with `running: true`.
//   - Minutes are full minutes per day (partial minutes dropped). Hours are
//     minutes / 60, rounded to 2 decimal places. The total is the sum of the
//     rows' minutes, so the rows always add up to the total.

import { addDays, listDates } from "./dates";
import { DateRange } from "./ranges";
import {
  MS_PER_MINUTE,
  Session,
  formatTime,
  sessionEnd,
  splitSessionByDay,
  startOfDay,
} from "./time";

export type TimesheetRow = {
  date: string; // YYYY-MM-DD
  firstClockIn: string | null; // "HH:MM" local time, null if no work that day
  lastClockOut: string | null; // "HH:MM" local time ("24:00" = midnight), null if none or running
  running: boolean; // true if the day's last session is still running
  sessions: number;
  minutes: number;
  hours: number; // 2 decimal places
};

export type Timesheet = {
  rows: TimesheetRow[];
  totalMinutes: number;
  totalHours: number;
};

/** Rounds hours to 2 decimal places: 95 minutes -> 1.58. */
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

/** Builds the timesheet for `range`, using calendar days in `timeZone`. */
export function buildTimesheet(
  sessions: Session[],
  range: DateRange,
  timeZone: string,
  now: Date,
): Timesheet {
  // Start with an empty entry for every day in the range.
  type DayTotals = {
    firstStart: Date | null;
    lastEnd: Date | null;
    running: boolean;
    sessions: number;
    ms: number;
  };
  const days = new Map<string, DayTotals>();
  for (const date of listDates(range.start, range.end)) {
    days.set(date, { firstStart: null, lastEnd: null, running: false, sessions: 0, ms: 0 });
  }

  // Add each day-piece of each session to its day (if that day is in range).
  for (const session of sessions) {
    const end = sessionEnd(session, now);
    for (const segment of splitSessionByDay(session, timeZone, now)) {
      const day = days.get(segment.date);
      if (!day) continue; // outside the range

      day.sessions += 1;
      day.ms += segment.ms;
      if (day.firstStart === null || segment.start < day.firstStart) {
        day.firstStart = segment.start;
      }
      if (day.lastEnd === null || segment.end >= day.lastEnd) {
        day.lastEnd = segment.end;
        const isSessionsLastPiece = segment.end.getTime() === end.getTime();
        day.running = session.clockOut === null && isSessionsLastPiece;
      }
    }
  }

  // Turn the totals into display rows.
  const rows: TimesheetRow[] = [];
  for (const [date, day] of days) {
    const minutes = Math.floor(day.ms / MS_PER_MINUTE);
    rows.push({
      date,
      firstClockIn: day.firstStart ? formatTime(day.firstStart, timeZone) : null,
      lastClockOut:
        day.lastEnd && !day.running ? formatClockOut(day.lastEnd, date, timeZone) : null,
      running: day.running,
      sessions: day.sessions,
      minutes,
      hours: minutesToHours(minutes),
    });
  }

  const totalMinutes = rows.reduce((sum, row) => sum + row.minutes, 0);
  return { rows, totalMinutes, totalHours: minutesToHours(totalMinutes) };
}

/** Like formatTime, but a piece that ends at the next midnight shows "24:00". */
function formatClockOut(end: Date, date: string, timeZone: string): string {
  const nextMidnight = startOfDay(addDays(date, 1), timeZone);
  return end.getTime() === nextMidnight.getTime() ? "24:00" : formatTime(end, timeZone);
}

/**
 * Quotes one CSV field following RFC 4180: if it contains a comma, a double
 * quote, or a line break, wrap it in double quotes and double any quotes
 * inside it. Otherwise leave it as it is. Text that a spreadsheet would run
 * as a formula gets a leading ' first.
 */
export function csvField(value: string | number): string {
  // Spreadsheets run text starting with = + - @ (or a tab / carriage return) as a formula.
  // A leading ' makes them show it as plain text instead (from /security-review).
  const text = typeof value === "string" && /^[=+\-@\t\r]/.test(value) ? `'${value}` : String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export const CSV_HEADER = [
  "Date",
  "First clock-in",
  "Last clock-out",
  "Sessions",
  "Hours",
  "Minutes",
];

/**
 * Turns timesheet rows into CSV text (header first, lines end with CRLF as RFC 4180 says).
 * Pass `notesByDate` to add a last "Notes" column (that day's session notes, joined with "; ").
 */
export function toCsv(rows: TimesheetRow[], notesByDate?: Map<string, string[]>): string {
  const header = notesByDate ? [...CSV_HEADER, "Notes"] : CSV_HEADER;
  const lines = [header.map(csvField).join(",")];
  for (const row of rows) {
    const fields: (string | number)[] = [
      row.date,
      row.firstClockIn ?? "",
      row.running ? "running" : (row.lastClockOut ?? ""),
      row.sessions,
      row.hours.toFixed(2),
      row.minutes,
    ];
    if (notesByDate) fields.push((notesByDate.get(row.date) ?? []).join("; "));
    lines.push(fields.map(csvField).join(","));
  }
  return lines.join("\r\n") + "\r\n";
}
