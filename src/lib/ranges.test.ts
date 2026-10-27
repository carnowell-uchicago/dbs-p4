import { describe, expect, it } from "vitest";
import { buildRange, rangeLength } from "./ranges";

describe("buildRange presets", () => {
  it("1 week anchored on the end date (Fri 2026-10-23)", () => {
    expect(buildRange({ preset: "1w", anchor: "end", date: "2026-10-23" })).toEqual({
      start: "2026-10-17",
      end: "2026-10-23",
    });
  });

  it("1 week anchored on the start date", () => {
    expect(buildRange({ preset: "1w", anchor: "start", date: "2026-10-17" })).toEqual({
      start: "2026-10-17",
      end: "2026-10-23",
    });
  });

  it("2 weeks in both directions, across a month boundary", () => {
    const fromStart = buildRange({ preset: "2w", anchor: "start", date: "2026-10-26" });
    expect(fromStart).toEqual({ start: "2026-10-26", end: "2026-11-08" });
    expect(rangeLength(fromStart)).toBe(14);

    expect(buildRange({ preset: "2w", anchor: "end", date: "2026-11-08" })).toEqual(fromStart);
  });
});

describe("buildRange custom", () => {
  it("takes a day count with either anchor", () => {
    expect(buildRange({ preset: "custom", anchor: "start", date: "2026-10-01", days: 10 })).toEqual(
      { start: "2026-10-01", end: "2026-10-10" },
    );
    expect(buildRange({ preset: "custom", anchor: "end", date: "2026-10-10", days: 10 })).toEqual({
      start: "2026-10-01",
      end: "2026-10-10",
    });
    expect(buildRange({ preset: "custom", anchor: "end", date: "2026-10-10", days: 1 })).toEqual({
      start: "2026-10-10",
      end: "2026-10-10",
    });
  });

  it("takes both start and end", () => {
    expect(buildRange({ preset: "custom", start: "2026-10-01", end: "2026-10-31" })).toEqual({
      start: "2026-10-01",
      end: "2026-10-31",
    });
  });

  it("rejects day counts outside 1-366", () => {
    for (const days of [0, -3, 367, 2.5, NaN]) {
      expect(() =>
        buildRange({ preset: "custom", anchor: "start", date: "2026-10-01", days }),
      ).toThrow();
    }
    expect(() =>
      buildRange({ preset: "custom", anchor: "start", date: "2026-01-01", days: 366 }),
    ).not.toThrow();
  });

  it("rejects backwards, too-long, or malformed ranges", () => {
    expect(() => buildRange({ preset: "custom", start: "2026-10-31", end: "2026-10-01" })).toThrow();
    expect(() => buildRange({ preset: "custom", start: "2026-01-01", end: "2027-01-02" })).toThrow();
    expect(() => buildRange({ preset: "1w", anchor: "end", date: "2026-02-30" })).toThrow();
  });
});
