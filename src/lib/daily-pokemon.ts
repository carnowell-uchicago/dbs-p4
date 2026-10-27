// The daily Pokémon: one per day, the same for everyone, no repeats until
// all 151 original Pokémon have appeared.
//
// How it works:
//   1. Turn today's date into a day number: days since DAILY_EPOCH (day 0).
//   2. Split the days into "cycles" of 151 days.
//      cycle    = floor(day / 151)   which round of 151 we are in
//      position = day % 151          which day inside that round
//   3. Each cycle has its own shuffled list of Pokédex numbers 1-151. The
//      shuffle uses a random number generator *seeded with the cycle
//      number*, so every server and browser builds the exact same list.
//   4. Today's Pokémon is list[position]. A shuffle never repeats a number,
//      so there are no repeats inside a cycle.
//
// No database or network is needed: the answer depends only on the date.

import { daysBetween } from "./dates";
import { toDateKey } from "./time";

/**
 * ASSUMPTION (student to confirm): the "day" flips at midnight Chicago time
 * for everyone, wherever they are.
 */
export const DAILY_TIMEZONE = "America/Chicago";

/** ASSUMPTION (student to confirm): day 0 of the first cycle. */
export const DAILY_EPOCH = "2026-10-27";

/** The original Pokédex: #1 Bulbasaur to #151 Mew. */
export const POKEDEX_SIZE = 151;

/**
 * mulberry32: a tiny, well-known seeded random number generator.
 * The same seed always gives the same sequence of numbers in [0, 1).
 * (Not secure, but we only need "shuffled the same way everywhere".)
 */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle of 1..151, seeded with the cycle number. Use cycleOrder() in the app; this is exported for tests. */
export function shuffleForCycle(cycle: number): number[] {
  const ids = Array.from({ length: POKEDEX_SIZE }, (_, i) => i + 1);
  const random = mulberry32(cycle);
  // Walk from the end; swap each spot with a random spot at or before it.
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

/**
 * The order of Pokémon for one cycle.
 *
 * If this cycle would start with the same Pokémon that ended the previous
 * cycle, we swap its first two entries so no Pokémon shows up two days in a
 * row. The swap only touches the first two spots, never the last, so the
 * previous cycle's last Pokémon can be read from its plain shuffle.
 */
export function cycleOrder(cycle: number): number[] {
  const order = shuffleForCycle(cycle);
  const previousLast = shuffleForCycle(cycle - 1)[POKEDEX_SIZE - 1];
  if (order[0] === previousLast) {
    [order[0], order[1]] = [order[1], order[0]];
  }
  return order;
}

/**
 * Pokédex number for a calendar date "YYYY-MM-DD".
 *
 * Dates before the epoch use the same formula with negative day numbers
 * (cycle -1, -2, ...), so they still get a fixed answer with the same
 * no-repeat guarantee. They should only appear if someone browses history.
 */
export function dailyPokemonIdForDateKey(dateKey: string): number {
  const day = daysBetween(DAILY_EPOCH, dateKey);
  const cycle = Math.floor(day / POKEDEX_SIZE);
  const position = day - cycle * POKEDEX_SIZE; // 0-150, also for negative days
  return cycleOrder(cycle)[position];
}

/** Pokédex number (1-151) of the daily Pokémon at the instant `date`. */
export function dailyPokemonId(date: Date): number {
  return dailyPokemonIdForDateKey(toDateKey(date, DAILY_TIMEZONE));
}
