// Today's sessions as a list. Pure display: the page passes the rows in.
import Link from "next/link";
import { Badge } from "@/components/ds/Tag";
import type { Tables } from "@/lib/supabase/database.types";

type WorkSession = Tables<"work_sessions">;
import { formatClock, formatDay, formatDuration } from "@/lib/format";
import { splitSessionByDay } from "@/lib/time";
import { DeleteSessionButton } from "./DeleteSessionButton";

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="today-h" className="text-sm font-bold uppercase tracking-[0.08em]" style={{ fontFamily: "var(--dp-display)" }}>
          Today · {formatDay(today)}
        </h2>
        <Link
          href="/log"
          className="rounded-(--dk-r-md) border-2 border-(--dk-edge) px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-(--dk-ice) hover:border-(--dk-sky) hover:bg-(--dk-raised) focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-(--dk-sky)"
          style={{ fontFamily: "var(--dp-display)" }}
        >
          Timesheet · print / CSV →
        </Link>
      </div>
      {sessions.length === 0 ? (
        <p className="mt-2 text-sm text-(--dk-muted)">No time logged today yet. Press the Poké Ball to start your first session.</p>
      ) : (
        <ul className="mt-3 divide-y-2 divide-(--dk-line)">
          {sessions.map((s) => {
            const range = `${formatClock(s.clock_in, timeZone)} – ${s.clock_out ? formatClock(s.clock_out, timeZone) : "now"}`;
            const length = formatDuration(msOnDay(s, today, timeZone, now));
            return (
              <li key={s.id} className="flex items-start gap-3 py-2 text-sm">
                <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="tabular-nums" style={{ fontFamily: "var(--dp-mono)" }}>
                    {range}
                  </span>
                  <span className="text-(--dk-muted)" style={{ fontFamily: "var(--dp-mono)" }}>
                    {length}
                  </span>
                  {s.clock_out === null && <Badge kind="today">Running</Badge>}
                  {s.source === "manual" && <Badge kind="new">Manual · no XP</Badge>}
                  {s.note && <span className="basis-full text-(--dk-muted)">{s.note}</span>}
                </div>
                <DeleteSessionButton sessionId={s.id} label={`${range} (${length})`} xp={s.xp_minutes ?? 0} running={s.clock_out === null} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

