import { describe, expect, it } from "vitest";
import { coachHistory } from "./coach-history";
import { dailyPokemonIdForDateKey } from "./daily-pokemon";
import { atWallClock } from "./time";

const TZ = "America/Chicago";
const at = (d: string, t: string) => atWallClock(d, t, TZ);

describe("coachHistory", () => {
  it("credits each worked day to that day's coach", () => {
    const sessions = [
      { clockIn: at("2026-10-27", "09:00"), clockOut: at("2026-10-27", "11:00") },
      { clockIn: at("2026-10-27", "13:00"), clockOut: at("2026-10-27", "14:00") },
      { clockIn: at("2026-10-28", "09:00"), clockOut: at("2026-10-28", "09:30") },
    ];
    const history = coachHistory(sessions, TZ, at("2026-10-29", "12:00"));
    expect(history.get(dailyPokemonIdForDateKey("2026-10-27"))).toEqual([{ date: "2026-10-27", ms: 3 * 3_600_000 }]);
    expect(history.get(dailyPokemonIdForDateKey("2026-10-28"))).toEqual([{ date: "2026-10-28", ms: 1_800_000 }]);
    expect(history.size).toBe(2);
  });
  it("is empty with no sessions", () => {
    expect(coachHistory([], TZ, new Date()).size).toBe(0);
  });
});
