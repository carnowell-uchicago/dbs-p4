import { describe, expect, it } from "vitest";
import {
  COACH_EVENTS,
  COACH_TYPES,
  coachLines,
  coachTypeFor,
  fillCoachLine,
  formatCoachHours,
  pickCoachLine,
} from "./coach-lines";

const ALLOWED_PLACEHOLDERS = ["{pokemon}", "{trainer}", "{hours}"];

// Every line as [type, event, line], so each check below covers all of them.
const allLines = COACH_TYPES.flatMap((type) =>
  COACH_EVENTS.flatMap((event) => coachLines[type][event].map((line) => ({ type, event, line }))),
);

describe("coachLines table", () => {
  it("has 17 types and 9 events", () => {
    expect(COACH_TYPES).toHaveLength(17);
    expect(COACH_EVENTS).toHaveLength(9);
  });

  it("has exactly 3 non-empty lines for every type and event", () => {
    for (const type of COACH_TYPES) {
      for (const event of COACH_EVENTS) {
        const lines = coachLines[type][event];
        expect(lines, `${type}.${event}`).toHaveLength(3);
        for (const line of lines) expect(line.trim(), `${type}.${event}`).not.toBe("");
      }
    }
  });

  it("has no extra types beyond COACH_TYPES", () => {
    expect(Object.keys(coachLines).sort()).toEqual([...COACH_TYPES].sort());
  });

  it("keeps every line at 110 characters or fewer", () => {
    for (const { type, event, line } of allLines) {
      expect(line.length, `${type}.${event}: ${line}`).toBeLessThanOrEqual(110);
    }
  });

  it("only uses the three allowed placeholders", () => {
    for (const { type, event, line } of allLines) {
      for (const placeholder of line.match(/\{[^}]*\}/g) ?? []) {
        expect(ALLOWED_PLACEHOLDERS, `${type}.${event}: ${line}`).toContain(placeholder);
      }
    }
  });

  it("has no duplicate lines inside a type and event", () => {
    for (const type of COACH_TYPES) {
      for (const event of COACH_EVENTS) {
        const lines = coachLines[type][event];
        expect(new Set(lines).size, `${type}.${event}`).toBe(lines.length);
      }
    }
  });
});

describe("coachTypeFor", () => {
  it("uses the first type", () => {
    expect(coachTypeFor(["grass", "poison"])).toBe("grass");
    expect(coachTypeFor(["Fire"])).toBe("fire");
  });

  it("falls back to normal for unknown or missing types", () => {
    expect(coachTypeFor(["shadow"])).toBe("normal");
    expect(coachTypeFor([])).toBe("normal");
  });
});

describe("pickCoachLine", () => {
  it("is deterministic: same inputs give the same line", () => {
    const a = pickCoachLine({ types: ["water"], event: "clockIn", seed: 42 });
    const b = pickCoachLine({ types: ["water"], event: "clockIn", seed: 42 });
    expect(a).toBe(b);
  });

  it("picks lines[seed mod 3], so different seeds give different lines", () => {
    const lines = coachLines.fire.greeting;
    expect(pickCoachLine({ types: ["fire"], event: "greeting", seed: 0 })).toBe(lines[0]);
    expect(pickCoachLine({ types: ["fire"], event: "greeting", seed: 1 })).toBe(lines[1]);
    expect(pickCoachLine({ types: ["fire"], event: "greeting", seed: 5 })).toBe(lines[2]);
  });

  it("handles negative, fractional and non-finite seeds", () => {
    const lines = coachLines.rock.idle;
    expect(lines).toContain(pickCoachLine({ types: ["rock"], event: "idle", seed: -7 }));
    expect(lines).toContain(pickCoachLine({ types: ["rock"], event: "idle", seed: 2.9 }));
    expect(pickCoachLine({ types: ["rock"], event: "idle", seed: NaN })).toBe(lines[0]);
  });

  it("uses the first type of a dual-type Pokémon", () => {
    const line = pickCoachLine({ types: ["grass", "poison"], event: "levelUp", seed: 4 });
    expect(line).toBe(coachLines.grass.levelUp[1]);
  });

  it("falls back to normal for an unknown type", () => {
    const line = pickCoachLine({ types: ["shadow"], event: "milestone4h", seed: 2 });
    expect(line).toBe(coachLines.normal.milestone4h[2]);
  });
});

describe("formatCoachHours", () => {
  it("shows whole hours without decimals and others with one", () => {
    expect(formatCoachHours(1)).toBe("1");
    expect(formatCoachHours(2.5)).toBe("2.5");
    expect(formatCoachHours(2.04)).toBe("2");
    expect(formatCoachHours(7.96)).toBe("8");
  });

  it("uses 0 for missing or invalid hours", () => {
    expect(formatCoachHours(undefined)).toBe("0");
    expect(formatCoachHours(-1)).toBe("0");
    expect(formatCoachHours(NaN)).toBe("0");
  });
});

describe("fillCoachLine", () => {
  it("fills every placeholder and upper-cases the Pokémon", () => {
    const filled = fillCoachLine("{pokemon} cheers! {hours}h logged, {trainer}!", {
      pokemon: "Pikachu",
      trainer: "Ash",
      hours: 2.5,
    });
    expect(filled).toBe("PIKACHU cheers! 2.5h logged, Ash!");
  });

  it("does not upper-case the trainer name", () => {
    expect(fillCoachLine("Hi, {trainer}!", { pokemon: "mew", trainer: "Sam" })).toBe("Hi, Sam!");
  });

  it("never leaves braces, even with no hours or an unknown placeholder", () => {
    const filled = fillCoachLine("{pokemon} {hours} {mystery}", { pokemon: "eevee", trainer: "T" });
    expect(filled).toBe("EEVEE 0 ");
    expect(filled).not.toMatch(/[{}]/);
  });

  it("leaves no braces in any real line", () => {
    for (const { line } of allLines) {
      const filled = fillCoachLine(line, { pokemon: "Mr. Mime", trainer: "Jordan", hours: 4 });
      expect(filled, line).not.toMatch(/[{}]/);
      expect(filled).not.toContain("Mr. Mime");
    }
  });
});
