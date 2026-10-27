// XP and levels for the active Pokémon.
//
// Change these numbers to tune the game. With the defaults:
//   - 1 XP for every full minute worked,
//   - going from level n to n+1 costs 100 * n XP
//     (level 1 -> 2 costs 100, level 2 -> 3 costs 200, ...),
//   - Pokémon start at level 1 and stop at level 100.

export const XP_PER_MINUTE = 1;
export const XP_COST_PER_LEVEL = 100;
export const STARTING_LEVEL = 1;
export const MAX_LEVEL = 100;

export type LevelInfo = {
  level: number;
  /** XP earned since reaching the current level. */
  xpIntoLevel: number;
  /** XP needed to go from the current level to the next one (0 at max level). */
  xpForNextLevel: number;
  /** How far through the current level, from 0 to 1 (always 1 at max level). */
  progress: number;
};

/** XP earned for some minutes of work. Partial minutes don't count. */
export function xpForMinutes(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes <= 0) return 0;
  return Math.floor(minutes) * XP_PER_MINUTE;
}

/** XP it costs to go from `level` to `level + 1`. */
export function xpToLevelUp(level: number): number {
  return XP_COST_PER_LEVEL * level;
}

/** Works out the level from the total XP a Pokémon has ever earned. */
export function levelFromXp(totalXp: number): LevelInfo {
  let level = STARTING_LEVEL;
  let remaining = Math.max(0, Math.floor(totalXp));

  // Pay for each level-up in turn until we can't afford the next one.
  while (level < MAX_LEVEL && remaining >= xpToLevelUp(level)) {
    remaining -= xpToLevelUp(level);
    level += 1;
  }

  if (level === MAX_LEVEL) {
    return { level, xpIntoLevel: remaining, xpForNextLevel: 0, progress: 1 };
  }

  const xpForNextLevel = xpToLevelUp(level);
  return {
    level,
    xpIntoLevel: remaining,
    xpForNextLevel,
    progress: remaining / xpForNextLevel,
  };
}
