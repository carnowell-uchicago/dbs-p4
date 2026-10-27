import { describe, expect, it } from "vitest";
import { addDays } from "./dates";
import {
  DAILY_EPOCH,
  POKEDEX_SIZE,
  cycleOrder,
  dailyPokemonId,
  dailyPokemonIdForDateKey,
  shuffleForCycle,
} from "./daily-pokemon";

function idsForDays(firstDate: string, count: number): number[] {
  return Array.from({ length: count }, (_, i) => dailyPokemonIdForDateKey(addDays(firstDate, i)));
}

describe("dailyPokemonId", () => {
  it("gives 151 distinct ids, all 1-151, over the first 151 days", () => {
    const ids = idsForDays(DAILY_EPOCH, POKEDEX_SIZE);
    expect(new Set(ids).size).toBe(POKEDEX_SIZE);
    expect(Math.min(...ids)).toBe(1);
    expect(Math.max(...ids)).toBe(POKEDEX_SIZE);
  });

  it("gives 151 distinct ids in later cycles and before the epoch too", () => {
    expect(new Set(idsForDays(addDays(DAILY_EPOCH, 151 * 7), 151)).size).toBe(151);
    expect(new Set(idsForDays(addDays(DAILY_EPOCH, -151), 151)).size).toBe(151);
  });

  it("gives the same id for the same date, every time", () => {
    expect(dailyPokemonIdForDateKey("2026-12-25")).toBe(dailyPokemonIdForDateKey("2026-12-25"));
  });

  it("gives the same id all day long in Chicago, whatever the UTC date", () => {
    // 00:01 and 23:59 Chicago time on 2026-10-27 (CDT, UTC-5).
    const early = new Date("2026-10-27T05:01:00Z");
    const late = new Date("2026-10-28T04:59:00Z");
    expect(dailyPokemonId(early)).toBe(dailyPokemonIdForDateKey("2026-10-27"));
    expect(dailyPokemonId(late)).toBe(dailyPokemonId(early));
    // One minute later it is the 28th in Chicago, so the answer moves on.
    expect(dailyPokemonId(new Date("2026-10-28T05:00:00Z"))).toBe(
      dailyPokemonIdForDateKey("2026-10-28"),
    );
  });

  it("never shows the same Pokémon two days in a row, including across cycles", () => {
    // 40 cycles in each direction around the epoch.
    for (let cycle = -40; cycle < 40; cycle++) {
      const lastOfThis = cycleOrder(cycle)[POKEDEX_SIZE - 1];
      const firstOfNext = cycleOrder(cycle + 1)[0];
      expect(firstOfNext).not.toBe(lastOfThis);
    }
    const ids = idsForDays(addDays(DAILY_EPOCH, -151 * 5), 151 * 10);
    for (let i = 1; i < ids.length; i++) {
      expect(ids[i]).not.toBe(ids[i - 1]);
    }
  });

  it("fixes a cycle whose plain shuffle would repeat the previous day's Pokémon", () => {
    // Find a real cycle where the raw shuffle collides (about 1 in 151 do).
    let collidingCycle: number | null = null;
    for (let cycle = 1; cycle < 5000 && collidingCycle === null; cycle++) {
      if (shuffleForCycle(cycle)[0] === shuffleForCycle(cycle - 1)[POKEDEX_SIZE - 1]) {
        collidingCycle = cycle;
      }
    }
    expect(collidingCycle).not.toBeNull();
    const cycle = collidingCycle as number;
    const raw = shuffleForCycle(cycle);
    const fixed = cycleOrder(cycle);
    expect(fixed[0]).toBe(raw[1]);
    expect(fixed[1]).toBe(raw[0]);
    expect(fixed[0]).not.toBe(cycleOrder(cycle - 1)[POKEDEX_SIZE - 1]);
  });

  it("each cycle is a full shuffle of 1-151", () => {
    const sorted = [...cycleOrder(3)].sort((a, b) => a - b);
    expect(sorted).toEqual(Array.from({ length: 151 }, (_, i) => i + 1));
  });
});
