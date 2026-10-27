// Display helpers shared by server and client components.
import { parseDateKey } from "./dates";

/** "9:05 AM" for an instant, in `timeZone`. */
export function formatClock(instant: Date | string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(new Date(instant));
}

/** "Tue, Oct 27" for a YYYY-MM-DD key. */
export function formatDay(dateKey: string): string {
  const { year, month, day } = parseDateKey(dateKey);
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

/** "2 h 30 min", "45 min", "0 min". */
export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** "03:42:15" for the watch. */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}
