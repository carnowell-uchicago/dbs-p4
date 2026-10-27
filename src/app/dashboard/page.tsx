import type { Metadata } from "next";
import { Suspense } from "react";
import { Badge } from "@/components/ds/Tag";
import { CoachCard } from "@/components/ds/CoachCard";
import { Skeleton } from "@/components/ds/Skeleton";
import { TextBox } from "@/components/ds/TextBox";
import { TrainerCard } from "@/components/ds/TrainerCard";
import { coachEventFor } from "@/lib/coach-event";
import { fillCoachLine, pickCoachLine, type CoachEvent } from "@/lib/coach-lines";
import { DAILY_EPOCH, dailyPokemonId } from "@/lib/daily-pokemon";
import {
  avatarOf,
  effectiveTimeZone,
  getProfile,
  getSessionsOnDay,
  getTotalXp,
  requireUser,
  todayKey,
  type WorkSession,
} from "@/lib/data";
import { daysBetween } from "@/lib/dates";
import { formatClock, formatDay, formatDuration } from "@/lib/format";
import { getPokemon, PokemonNotFoundError, type Pokemon } from "@/lib/pokeapi";
import { splitSessionByDay } from "@/lib/time";
import { levelFromXp } from "@/lib/xp";
import { AddTimeForm } from "./AddTimeForm";
import { ClockPanel } from "./ClockPanel";
import { CreateTrainer } from "./CreateTrainer";
import { RetryButton } from "./RetryButton";

export const metadata: Metadata = { title: "Dashboard · Trainer Timesheet" };

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <h1 className="sr-only">Dashboard</h1>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

/** Milliseconds of `session` that fall on `dateKey` in `timeZone`. */
function msOnDay(session: WorkSession, dateKey: string, timeZone: string, now: Date): number {
  const s = { clockIn: new Date(session.clock_in), clockOut: session.clock_out ? new Date(session.clock_out) : null };
  return splitSessionByDay(s, timeZone, now)
    .filter((segment) => segment.date === dateKey)
    .reduce((sum, segment) => sum + segment.ms, 0);
}

async function Dashboard() {
  const { supabase } = await requireUser();
  const profile = await getProfile(supabase);
  if (!profile) return <CreateTrainer />;

  const timeZone = await effectiveTimeZone(profile);
  const now = new Date();
  const today = todayKey(timeZone, now);
  const [sessions, totalXp] = await Promise.all([getSessionsOnDay(supabase, today, timeZone), getTotalXp(supabase)]);

  const running = sessions.find((s) => s.clock_out === null) ?? null;
  const finished = sessions.filter((s) => s.clock_out !== null);
  const finishedTodayMs = finished.reduce((sum, s) => sum + msOnDay(s, today, timeZone, now), 0);
  const runningTodayMs = running ? msOnDay(running, today, timeZone, now) : 0;
  const level = levelFromXp(totalXp);

  const last = finished.at(-1);
  const event = coachEventFor({
    todayMs: finishedTodayMs + runningTodayMs,
    runningSinceMs: running ? now.getTime() - new Date(running.clock_in).getTime() : null,
    lastClockOutAgoMs: last?.clock_out ? now.getTime() - new Date(last.clock_out).getTime() : null,
    leveledUpOnLastSession: Boolean(last) && levelFromXp(totalXp - (last?.xp_minutes ?? 0)).level < level.level,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Clock column first in the page, so phones (and keyboards) reach Clock in first. */}
      <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1">
        <ClockPanel
          running={running ? { id: running.id, clockIn: running.clock_in, note: running.note } : null}
          finishedTodayMs={finishedTodayMs}
          timeZone={timeZone}
        />
        <TrainerCard
          name={profile.trainer_name}
          avatar={avatarOf(profile)}
          level={level.level}
          xpIntoLevel={level.xpIntoLevel}
          xpForNextLevel={level.xpForNextLevel}
          progress={level.progress}
        />
        <TodaySessions sessions={sessions} timeZone={timeZone} today={today} now={now} />
        <AddTimeForm today={today} />
      </div>
      <div className="lg:col-start-1 lg:row-start-1">
        {/* The coach loads on its own: PokéAPI being slow or down never blocks the clock. */}
        <Suspense fallback={<CoachSkeleton />}>
          <Coach
            event={event}
            seed={daysBetween(DAILY_EPOCH, today) + sessions.length}
            trainer={profile.trainer_name}
            hours={(finishedTodayMs + runningTodayMs) / 3_600_000}
            dateLabel={formatDay(today)}
            now={now}
          />
        </Suspense>
      </div>
    </div>
  );
}

async function Coach({
  event,
  seed,
  trainer,
  hours,
  dateLabel,
  now,
}: {
  event: CoachEvent;
  seed: number;
  trainer: string;
  hours: number;
  dateLabel: string;
  now: Date;
}) {
  const id = dailyPokemonId(now);
  // Only the PokéAPI call goes in the try: it's the part that can fail.
  let pokemon: Pokemon | null = null;
  let notFound = false;
  try {
    pokemon = await getPokemon(id);
  } catch (error) {
    notFound = error instanceof PokemonNotFoundError;
  }

  if (!pokemon) {
    return (
      <section aria-label="Today's coach" className="flex flex-col gap-3 rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-4">
        <TextBox tone="error" speaker="Today's coach" live="polite" action={<RetryButton />}>
          {notFound
            ? `Coach #${id} couldn't be found in the Pokédex today.`
            : "Today's coach couldn't make it: PokéAPI isn't answering right now."}{" "}
          Your clock still works, and your hours are saved as normal.
        </TextBox>
      </section>
    );
  }

  const line = fillCoachLine(pickCoachLine({ types: pokemon.types, event, seed }), {
    pokemon: pokemon.displayName,
    trainer,
    hours,
  });
  return (
    <CoachCard
      number={pokemon.id}
      name={pokemon.displayName}
      types={pokemon.types}
      sprite={pokemon.gen4Sprite ?? pokemon.sprite}
      line={line}
      dateLabel={dateLabel}
    />
  );
}

function TodaySessions({ sessions, timeZone, today, now }: { sessions: WorkSession[]; timeZone: string; today: string; now: Date }) {
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

function CoachSkeleton() {
  return (
    <div aria-label="Loading today's coach" role="status" className="flex flex-col gap-3 rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-4">
      <div className="flex items-end gap-4">
        <Skeleton className="size-24" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading your dashboard" className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1">
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="lg:col-start-1 lg:row-start-1">
        <CoachSkeleton />
      </div>
    </div>
  );
}
