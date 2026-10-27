// Which coaches have trained you: every day you logged time had a coach (that day's
// daily Pokémon), so we can work it out from your sessions. Nothing extra is stored.
import { dailyPokemonIdForDateKey } from "./daily-pokemon";
import { totalsByDay, type Session } from "./time";

export type CoachDay = { date: string; ms: number };

/** Map of Pokémon id -> the days it coached you (oldest first) and how long you worked. */
export function coachHistory(sessions: Session[], timeZone: string, now: Date): Map<number, CoachDay[]> {
  const history = new Map<number, CoachDay[]>();
  const days = [...totalsByDay(sessions, timeZone, now)].filter(([, ms]) => ms > 0).sort(([a], [b]) => a.localeCompare(b));
  for (const [date, ms] of days) {
    const id = dailyPokemonIdForDateKey(date);
    history.set(id, [...(history.get(id) ?? []), { date, ms }]);
  }
  return history;
}
