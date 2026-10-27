import { describe, expect, it } from "vitest";
import { buildRange } from "./ranges";
import { buildTimesheet, csvField, toCsv } from "./timesheet";

const CHICAGO = "America/Chicago";
const NOW = new Date("2026-10-30T20:00:00Z");

function session(clockIn: string, clockOut: string | null) {
  return { clockIn: new Date(clockIn), clockOut: clockOut ? new Date(clockOut) : null };
}

describe("buildTimesheet", () => {
  const range = buildRange({ preset: "custom", anchor: "start", date: "2026-10-26", days: 4 });

  it("makes one row per day, with empty days as 0", () => {
    const sheet = buildTimesheet([], range, CHICAGO, NOW);
    expect(sheet.rows.map((r) => r.date)).toEqual([
      "2026-10-26",
      "2026-10-27",
      "2026-10-28",
      "2026-10-29",
    ]);
    expect(sheet.rows[0]).toEqual({
      date: "2026-10-26",
      firstClockIn: null,
      lastClockOut: null,
      running: false,
      sessions: 0,
      minutes: 0,
      hours: 0,
    });
    expect(sheet.totalMinutes).toBe(0);
  });

  it("sums sessions per day and gives first in / last out in local time", () => {
    const sheet = buildTimesheet(
      [
        session("2026-10-27T14:00:00Z", "2026-10-27T16:00:00Z"), // 09:00-11:00 CDT
        session("2026-10-27T17:00:00Z", "2026-10-27T18:35:00Z"), // 12:00-13:35 CDT
      ],
      range,
      CHICAGO,
      NOW,
    );
    expect(sheet.rows[1]).toEqual({
      date: "2026-10-27",
      firstClockIn: "09:00",
      lastClockOut: "13:35",
      running: false,
      sessions: 2,
      minutes: 215,
      hours: 3.58,
    });
    expect(sheet.totalMinutes).toBe(215);
    expect(sheet.totalHours).toBe(3.58);
  });

  it("splits a session across midnight between the two days", () => {
    // 22:00 to 01:30 CDT.
    const sheet = buildTimesheet(
      [session("2026-10-28T03:00:00Z", "2026-10-28T06:30:00Z")],
      range,
      CHICAGO,
      NOW,
    );
    expect(sheet.rows[1]).toMatchObject({
      firstClockIn: "22:00",
      lastClockOut: "24:00",
      sessions: 1,
      minutes: 120,
    });
    expect(sheet.rows[2]).toMatchObject({
      firstClockIn: "00:00",
      lastClockOut: "01:30",
      sessions: 1,
      minutes: 90,
    });
    expect(sheet.totalMinutes).toBe(210);
  });

  it("shows a running session up to now", () => {
    const now = new Date("2026-10-29T15:45:00Z"); // 10:45 CDT
    const sheet = buildTimesheet([session("2026-10-29T14:00:00Z", null)], range, CHICAGO, now);
    expect(sheet.rows[3]).toMatchObject({
      firstClockIn: "09:00",
      lastClockOut: null,
      running: true,
      minutes: 105,
      hours: 1.75,
    });
  });

  it("ignores sessions outside the range", () => {
    const sheet = buildTimesheet(
      [session("2026-10-20T14:00:00Z", "2026-10-20T15:00:00Z")],
      range,
      CHICAGO,
      NOW,
    );
    expect(sheet.totalMinutes).toBe(0);
  });

  it("counts 25 hours on the DST day 2026-11-01", () => {
    const dstRange = buildRange({ preset: "custom", start: "2026-11-01", end: "2026-11-01" });
    const sheet = buildTimesheet(
      [session("2026-11-01T05:00:00Z", "2026-11-02T06:00:00Z")], // local midnight to midnight
      dstRange,
      CHICAGO,
      NOW,
    );
    expect(sheet.rows[0]).toMatchObject({
      firstClockIn: "00:00",
      lastClockOut: "24:00",
      minutes: 25 * 60,
      hours: 25,
    });
  });
});

describe("CSV", () => {
  it("quotes fields only when needed (RFC 4180)", () => {
    expect(csvField("plain")).toBe("plain");
    expect(csvField(42)).toBe("42");
    expect(csvField("a,b")).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField("line1\nline2")).toBe('"line1\nline2"');
    expect(csvField("")).toBe("");
  });

  it("writes a header and one CRLF-terminated line per row", () => {
    const range = buildRange({ preset: "custom", start: "2026-10-27", end: "2026-10-28" });
    const now = new Date("2026-10-28T15:00:00Z");
    const sheet = buildTimesheet(
      [
        session("2026-10-27T14:00:00Z", "2026-10-27T15:30:00Z"),
        session("2026-10-28T14:00:00Z", null),
      ],
      range,
      CHICAGO,
      now,
    );
    expect(toCsv(sheet.rows)).toBe(
      "Date,First clock-in,Last clock-out,Sessions,Hours,Minutes\r\n" +
        "2026-10-27,09:00,10:30,1,1.50,90\r\n" +
        "2026-10-28,09:00,running,1,1.00,60\r\n",
    );
  });
});

describe("toCsv with notes", () => {
  it("adds a Notes column, quoting notes that contain commas", () => {
    const rows = [
      { date: "2026-10-26", firstClockIn: "09:00", lastClockOut: "10:00", running: false, sessions: 1, minutes: 60, hours: 1 },
      { date: "2026-10-27", firstClockIn: null, lastClockOut: null, running: false, sessions: 0, minutes: 0, hours: 0 },
    ];
    const notes = new Map([["2026-10-26", ["Q3 report", "Call with Sam, Ana"]]]);
    expect(toCsv(rows, notes)).toBe(
      "Date,First clock-in,Last clock-out,Sessions,Hours,Minutes,Notes\r\n" +
        '2026-10-26,09:00,10:00,1,1.00,60,"Q3 report; Call with Sam, Ana"\r\n' +
        "2026-10-27,,,0,0.00,0,\r\n",
    );
  });
});

describe("csvField formula injection", () => {
  it("neutralises text a spreadsheet would run as a formula", () => {
    expect(csvField("=HYPERLINK(\"http://evil\")")).toBe(`"'=HYPERLINK(""http://evil"")"`);
    expect(csvField("+1")).toBe("'+1");
    expect(csvField("-cmd")).toBe("'-cmd");
    expect(csvField("@SUM(A1)")).toBe("'@SUM(A1)");
  });
  it("leaves normal text and numbers alone", () => {
    expect(csvField("Q3 report")).toBe("Q3 report");
    expect(csvField(-1)).toBe("-1");
    expect(csvField("2026-10-27")).toBe("2026-10-27");
  });
});
