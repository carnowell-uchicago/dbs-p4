import { describe, expect, it } from "vitest";
import {
  formatTime,
  sessionDurationMs,
  sessionMinutes,
  splitSessionByDay,
  startOfDay,
  toDateKey,
  totalsByDay,
} from "./time";

const CHICAGO = "America/Chicago";
const HOUR = 60 * 60 * 1000;

describe("toDateKey / formatTime", () => {
  it("uses the time zone's calendar day, not UTC's", () => {
    // 03:00 UTC on Oct 28 is still 22:00 on Oct 27 in Chicago (CDT, UTC-5).
    const instant = new Date("2026-10-28T03:00:00Z");
    expect(toDateKey(instant, CHICAGO)).toBe("2026-10-27");
    expect(toDateKey(instant, "UTC")).toBe("2026-10-28");
    expect(formatTime(instant, CHICAGO)).toBe("22:00");
  });
});

describe("startOfDay", () => {
  it("finds local midnight on both sides of the DST change", () => {
    // Nov 1 starts in CDT (UTC-5); Nov 2 starts in CST (UTC-6).
    expect(startOfDay("2026-11-01", CHICAGO).toISOString()).toBe("2026-11-01T05:00:00.000Z");
    expect(startOfDay("2026-11-02", CHICAGO).toISOString()).toBe("2026-11-02T06:00:00.000Z");
    // Spring forward: 2027-03-14 starts in CST, 2027-03-15 in CDT.
    expect(startOfDay("2027-03-14", CHICAGO).toISOString()).toBe("2027-03-14T06:00:00.000Z");
    expect(startOfDay("2027-03-15", CHICAGO).toISOString()).toBe("2027-03-15T05:00:00.000Z");
  });
});

describe("session durations", () => {
  it("measures a finished session", () => {
    const session = {
      clockIn: new Date("2026-10-27T14:00:00Z"),
      clockOut: new Date("2026-10-27T15:30:45Z"),
    };
    expect(sessionDurationMs(session, new Date())).toBe(1.5 * HOUR + 45_000);
    expect(sessionMinutes(session, new Date())).toBe(90); // partial minute dropped
  });

  it("measures a running session up to now", () => {
    const session = { clockIn: new Date("2026-10-27T14:00:00Z"), clockOut: null };
    const now = new Date("2026-10-27T14:20:00Z");
    expect(sessionMinutes(session, now)).toBe(20);
  });

  it("rejects a session that ends before it starts", () => {
    const session = {
      clockIn: new Date("2026-10-27T15:00:00Z"),
      clockOut: new Date("2026-10-27T14:00:00Z"),
    };
    expect(() => sessionDurationMs(session, new Date())).toThrow();
  });
});

describe("splitSessionByDay / totalsByDay", () => {
  it("splits a session that crosses midnight across both days", () => {
    // 22:00 to 02:00 Chicago time (CDT, UTC-5).
    const session = {
      clockIn: new Date("2026-10-28T03:00:00Z"),
      clockOut: new Date("2026-10-28T07:00:00Z"),
    };
    const segments = splitSessionByDay(session, CHICAGO, new Date());
    expect(segments.map((s) => [s.date, s.ms / HOUR])).toEqual([
      ["2026-10-27", 2],
      ["2026-10-28", 2],
    ]);
  });

  it("counts the real elapsed hours on the DST day (2026-11-01 is 25 hours long)", () => {
    // 00:30 CDT to 03:30 CST: the clock says 3 hours, but 4 really passed.
    const shortSession = {
      clockIn: new Date("2026-11-01T05:30:00Z"),
      clockOut: new Date("2026-11-01T09:30:00Z"),
    };
    // Midnight to midnight on the DST day.
    const wholeDay = {
      clockIn: startOfDay("2026-11-01", CHICAGO),
      clockOut: startOfDay("2026-11-02", CHICAGO),
    };
    expect(totalsByDay([shortSession], CHICAGO, new Date()).get("2026-11-01")).toBe(4 * HOUR);
    const totals = totalsByDay([wholeDay], CHICAGO, new Date());
    expect(totals.get("2026-11-01")).toBe(25 * HOUR);
    expect(totals.size).toBe(1);
  });

  it("includes a running session up to now, split at midnight", () => {
    const session = { clockIn: new Date("2026-10-28T04:00:00Z"), clockOut: null }; // 23:00 CDT
    const now = new Date("2026-10-28T05:30:00Z"); // 00:30 CDT next day
    const totals = totalsByDay([session], CHICAGO, now);
    expect(totals.get("2026-10-27")).toBe(1 * HOUR);
    expect(totals.get("2026-10-28")).toBe(0.5 * HOUR);
  });

  it("adds up several sessions on the same day", () => {
    const sessions = [
      { clockIn: new Date("2026-10-27T14:00:00Z"), clockOut: new Date("2026-10-27T15:00:00Z") },
      { clockIn: new Date("2026-10-27T16:00:00Z"), clockOut: new Date("2026-10-27T18:00:00Z") },
    ];
    expect(totalsByDay(sessions, CHICAGO, new Date()).get("2026-10-27")).toBe(3 * HOUR);
  });
});
