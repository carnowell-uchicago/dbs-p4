import { describe, expect, it } from "vitest";
import { coachEventFor } from "./coach-event";

const H = 60 * 60 * 1000;
const base = { todayMs: 0, runningSinceMs: null, lastClockOutAgoMs: null, leveledUpOnLastSession: false };

describe("coachEventFor", () => {
  it("greets you before your first session of the day", () => {
    expect(coachEventFor(base)).toBe("greeting");
  });
  it("cheers when you clock in, then marks 1 h, 4 h and 8 h", () => {
    expect(coachEventFor({ ...base, runningSinceMs: 60_000, todayMs: 60_000 })).toBe("clockIn");
    expect(coachEventFor({ ...base, runningSinceMs: 0.5 * H, todayMs: 1.2 * H })).toBe("milestone1h");
    expect(coachEventFor({ ...base, runningSinceMs: 1 * H, todayMs: 4.5 * H })).toBe("milestone4h");
    expect(coachEventFor({ ...base, runningSinceMs: 3 * H, todayMs: 8 * H })).toBe("milestone8h");
  });
  it("suggests a break after 2 h without one", () => {
    expect(coachEventFor({ ...base, runningSinceMs: 2 * H, todayMs: 2 * H })).toBe("longStretch");
  });
  it("reacts to a clock-out, or a level-up, for 10 minutes, then goes idle", () => {
    expect(coachEventFor({ ...base, todayMs: H, lastClockOutAgoMs: 60_000 })).toBe("clockOut");
    expect(coachEventFor({ ...base, todayMs: H, lastClockOutAgoMs: 60_000, leveledUpOnLastSession: true })).toBe("levelUp");
    expect(coachEventFor({ ...base, todayMs: H, lastClockOutAgoMs: 11 * 60_000 })).toBe("idle");
  });
});
