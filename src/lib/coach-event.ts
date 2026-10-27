// Which moment the coach is reacting to, worked out from today's sessions.
// Pure function, so it's easy to test and the same state always gives the same line.
import type { CoachEvent } from "./coach-lines";

const HOUR = 60 * 60 * 1000;
/** A clock-in or clock-out this recent still counts as "just happened". */
export const JUST_FINISHED_MS = 10 * 60 * 1000;

export function coachEventFor({
  todayMs,
  runningSinceMs,
  lastClockOutAgoMs,
  leveledUpOnLastSession,
}: {
  todayMs: number; // everything worked today, including a running session
  runningSinceMs: number | null; // how long the running session has gone, or null if not running
  lastClockOutAgoMs: number | null; // how long ago today's latest session ended, or null if none
  leveledUpOnLastSession: boolean;
}): CoachEvent {
  if (runningSinceMs !== null) {
    // "{trainer}, I choose you!" right after every clock-in, even late in the day.
    if (runningSinceMs <= JUST_FINISHED_MS) return "clockIn";
    if (todayMs >= 8 * HOUR) return "milestone8h";
    if (runningSinceMs >= 2 * HOUR) return "longStretch";
    if (todayMs >= 4 * HOUR) return "milestone4h";
    if (todayMs >= 1 * HOUR) return "milestone1h";
    return "clockIn";
  }
  if (lastClockOutAgoMs === null) return "greeting";
  if (lastClockOutAgoMs <= JUST_FINISHED_MS) return leveledUpOnLastSession ? "levelUp" : "clockOut";
  return "idle";
}
