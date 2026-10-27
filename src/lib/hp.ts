// The trainer's HP over a working day (student's rules):
//   - each day starts at 100;
//   - clocked in, it drops 10 per hour (1 per 0.1 h), never below 1;
//   - clocked out (breaks, and after work), it recovers 10 per hour (1 per 0.1 h), up to 100.
// Yellow from 50, red from 20, and at 20 or less the trainer looks worn out.
const HOUR = 60 * 60 * 1000;
const PER_HOUR = 10;

export type PlayerHp = { hp: number; colour: string; exhausted: boolean };

/** One stretch of work today, in ms since 1970. `end: null` means still clocked in. */
export type Span = { start: number; end: number | null };

/** Walk through today: rest until the first session, work, rest in the gap, work, ... up to now. */
export function playerHpAt(spans: Span[], dayStart: number, now: number): PlayerHp {
  let hp = 100;
  let t = dayStart;
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  for (const span of sorted) {
    const start = Math.min(Math.max(span.start, dayStart), now);
    const end = Math.min(span.end ?? now, now);
    if (start > t) hp = Math.min(100, hp + (PER_HOUR * (start - t)) / HOUR); // resting before it
    if (end > start) hp = Math.max(1, hp - (PER_HOUR * (end - start)) / HOUR); // working
    t = Math.max(t, end);
  }
  if (now > t) hp = Math.min(100, hp + (PER_HOUR * (now - t)) / HOUR); // resting since the last one
  return describe(hp);
}

function describe(raw: number): PlayerHp {
  const hp = Math.max(1, Math.min(100, Math.floor(raw + 1e-9))); // whole points, 1 per 0.1 h
  const colour = hp > 50 ? "var(--dk-hp)" : hp > 20 ? "var(--dk-gold)" : "var(--dk-ember)";
  return { hp, colour, exhausted: hp <= 20 };
}
