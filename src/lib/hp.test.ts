import { describe, expect, it } from "vitest";
import { playerHpAt } from "./hp";

const H = 60 * 60 * 1000;
const DAY = 0; // pretend the day starts at t = 0
const at = (hours: number) => DAY + hours * H;

describe("playerHpAt", () => {
  it("is 100 before you start, then drops 10 per hour worked", () => {
    expect(playerHpAt([], DAY, at(9)).hp).toBe(100);
    expect(playerHpAt([{ start: at(9), end: null }], DAY, at(10)).hp).toBe(90);
    expect(playerHpAt([{ start: at(9), end: null }], DAY, at(11.5)).hp).toBe(75);
  });
  it("turns yellow at 50 and red at 20, worn out from 20", () => {
    expect(playerHpAt([{ start: at(9), end: null }], DAY, at(14))).toMatchObject({ hp: 50, colour: "var(--dk-gold)", exhausted: false });
    expect(playerHpAt([{ start: at(9), end: null }], DAY, at(17))).toMatchObject({ hp: 20, colour: "var(--dk-ember)", exhausted: true });
  });
  it("never drops below 1 while working", () => {
    expect(playerHpAt([{ start: at(8), end: null }], DAY, at(22)).hp).toBe(1);
  });
  it("recovers 1 per 0.1 h clocked out, up to 100", () => {
    // 5 h of work (HP 50), then a 0.5 h break: +5
    expect(playerHpAt([{ start: at(9), end: at(14) }], DAY, at(14.5)).hp).toBe(55);
    // a long rest fills it back up, but not past 100
    expect(playerHpAt([{ start: at(9), end: at(14) }], DAY, at(23)).hp).toBe(100);
  });
  it("adds up a whole day of work and breaks", () => {
    // 9–12 work (−30 → 70), 12–13 lunch (+10 → 80), 13–17 work (−40 → 40)
    const spans = [{ start: at(9), end: at(12) }, { start: at(13), end: at(17) }];
    expect(playerHpAt(spans, DAY, at(17)).hp).toBe(40);
  });
  it("recovers from the floor after hitting 1", () => {
    // 12 h of work would be −120, but it stops at 1; a 1 h rest then gives 11
    expect(playerHpAt([{ start: at(6), end: at(18) }], DAY, at(19)).hp).toBe(11);
  });
});
