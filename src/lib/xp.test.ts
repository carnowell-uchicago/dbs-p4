import { describe, expect, it } from "vitest";
import { MAX_LEVEL, levelFromXp, xpForMinutes, levelUpTo } from "./xp";

describe("xpForMinutes", () => {
  it("gives 1 XP per full minute", () => {
    expect(xpForMinutes(90)).toBe(90);
    expect(xpForMinutes(59.9)).toBe(59);
    expect(xpForMinutes(0)).toBe(0);
    expect(xpForMinutes(-5)).toBe(0);
  });
});

describe("levelFromXp", () => {
  it("starts at level 1 with no XP", () => {
    expect(levelFromXp(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNextLevel: 100, progress: 0 });
  });

  it("is still level 1 at 99 XP", () => {
    expect(levelFromXp(99)).toEqual({
      level: 1,
      xpIntoLevel: 99,
      xpForNextLevel: 100,
      progress: 0.99,
    });
  });

  it("reaches level 2 at exactly 100 XP", () => {
    expect(levelFromXp(100)).toEqual({
      level: 2,
      xpIntoLevel: 0,
      xpForNextLevel: 200,
      progress: 0,
    });
  });

  it("reaches level 3 at 100 + 200 = 300 XP", () => {
    expect(levelFromXp(299).level).toBe(2);
    expect(levelFromXp(300).level).toBe(3);
    expect(levelFromXp(400)).toMatchObject({ level: 3, xpIntoLevel: 100, progress: 1 / 3 });
  });

  it("caps at level 100", () => {
    // Total to reach level 100 = 100 * (1 + 2 + ... + 99) = 495,000 XP.
    expect(levelFromXp(494_999).level).toBe(99);
    expect(levelFromXp(495_000)).toEqual({
      level: MAX_LEVEL,
      xpIntoLevel: 0,
      xpForNextLevel: 0,
      progress: 1,
    });
    expect(levelFromXp(10_000_000).level).toBe(MAX_LEVEL);
  });
});

describe("levelUpTo", () => {
  it("returns the new level only when a level boundary is crossed", () => {
    expect(levelUpTo(90, 110)).toBe(2); // level 2 starts at 100 XP
    expect(levelUpTo(100, 150)).toBeNull(); // already level 2
    expect(levelUpTo(250, 320)).toBe(3); // level 3 starts at 100 + 200 = 300 XP
    expect(levelUpTo(0, 0)).toBeNull();
  });
});
