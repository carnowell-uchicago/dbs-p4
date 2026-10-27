// Today's sessions as a list. Pure display: the page passes the rows in.
import { Badge } from "@/components/ds/Tag";
import type { Tables } from "@/lib/supabase/database.types";

type WorkSession = Tables<"work_sessions">;
import { formatClock, formatDay, formatDuration } from "@/lib/format";
import { splitSessionByDay } from "@/lib/time";

/** Milliseconds of `session` that fall on `dateKey` in `timeZone`. */
export function msOnDay(session: WorkSession, dateKey: string, timeZone: string, now: Date): number {
  const s = { clockIn: new Date(session.clock_in), clockOut: session.clock_out ? new Date(session.clock_out) : null };
  return splitSessionByDay(s, timeZone, now)
    .filter((segment) => segment.date === dateKey)
    .reduce((sum, segment) => sum + segment.ms, 0);
}

export function TodaySessions({ sessions, timeZone, today, now }: { sessions: WorkSession[]; timeZone: string; today: string; now: Date }) {
  return (
    <section aria-labelledby="today-h" className="rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-4">
      <h2 id="today-h" className="text-sm font-bold uppercase tracking-[0.08em]" style={{ fontFamily: "var(--dp-display)" }}>
        Today · {formatDay(today)}
      </h2>
      {sessions.length === 0 ? (
        <p className="mt-2 text-sm text-(--dk-muted)">No time logged today yet. Press the Poké Ball to start your first session.</p>
      ) : (
        <ul className="mt-3 divide-y-2 divide-(--dk-line)">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 text-sm">
              <span className="tabular-nums" style={{ fontFamily: "var(--dp-mono)" }}>
                {formatClock(s.clock_in, timeZone)} – {s.clock_out ? formatClock(s.clock_out, timeZone) : "now"}
              </span>
              <span className="text-(--dk-muted)" style={{ fontFamily: "var(--dp-mono)" }}>
                {formatDuration(msOnDay(s, today, timeZone, now))}
              </span>
              {s.clock_out === null && <Badge kind="today">Running</Badge>}
              {s.source === "manual" && <Badge kind="new">Manual · no XP</Badge>}
              {s.note && <span className="basis-full text-(--dk-muted)">{s.note}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

