import type { Metadata } from "next";
import { Suspense } from "react";
import { CoachFromBehind } from "@/components/ds/BattleScene";
import { CoachCard } from "@/components/ds/CoachCard";
import { Skeleton } from "@/components/ds/Skeleton";
import { TextBox } from "@/components/ds/TextBox";
import { coachEventFor } from "@/lib/coach-event";
import { fillCoachLine, pickCoachLine, type CoachEvent } from "@/lib/coach-lines";
import { DAILY_EPOCH, dailyPokemonId } from "@/lib/daily-pokemon";
import { avatarOf, effectiveTimeZone, getProfile, getSessionsBetween, getTotalXp, requireUser, todayKey } from "@/lib/data";
import { daysBetween, listDates, weekStart } from "@/lib/dates";
import { formatDay, formatDuration } from "@/lib/format";
import { getPokemon, PokemonNotFoundError, type Pokemon } from "@/lib/pokeapi";
import { levelFromXp } from "@/lib/xp";
import { AddTimeForm } from "./AddTimeForm";
import { ClockPanel } from "./ClockPanel";
import { CreateTrainer } from "./CreateTrainer";
import { RetryButton } from "./RetryButton";
import { msOnDay, TodaySessions } from "./TodaySessions";

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

async function Dashboard() {
  const { supabase } = await requireUser();
  const profile = await getProfile(supabase);
  if (!profile) return <CreateTrainer />;

  const timeZone = await effectiveTimeZone(profile);
  const now = new Date();
  const today = todayKey(timeZone, now);
  const monday = weekStart(today);
  const [weekSessions, totalXp] = await Promise.all([getSessionsBetween(supabase, monday, today, timeZone), getTotalXp(supabase)]);

  const sessions = weekSessions.filter((s) => s.clock_out === null || msOnDay(s, today, timeZone, now) > 0);
  const running = sessions.find((s) => s.clock_out === null) ?? null;
  const finished = sessions.filter((s) => s.clock_out !== null);
  const finishedTodayMs = finished.reduce((sum, s) => sum + msOnDay(s, today, timeZone, now), 0);
  const runningTodayMs = running ? msOnDay(running, today, timeZone, now) : 0;
  const level = levelFromXp(totalXp);

  // This week: total time, and how many days had any.
  const perDay = listDates(monday, today).map((day) => weekSessions.reduce((sum, s) => sum + msOnDay(s, day, timeZone, now), 0));
  const weekMs = perDay.reduce((a, b) => a + b, 0);
  const daysLogged = perDay.filter((ms) => ms > 0).length;

  const last = finished.at(-1);
  const event = coachEventFor({
    todayMs: finishedTodayMs + runningTodayMs,
    runningSinceMs: running ? now.getTime() - new Date(running.clock_in).getTime() : null,
    lastClockOutAgoMs: last?.clock_out ? now.getTime() - new Date(last.clock_out).getTime() : null,
    leveledUpOnLastSession: Boolean(last) && levelFromXp(totalXp - (last?.xp_minutes ?? 0)).level < level.level,
  });
  const coachId = dailyPokemonId(now);

  return (
    <div className="flex flex-col gap-6">
      {/* Wide screens: today's coach card on the left, the battle on the right. Phones: the
          battle first (so Clock in is at the top), then the card. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.3fr)]">
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          <ClockPanel
            running={running ? { id: running.id, clockIn: running.clock_in, note: running.note } : null}
            finishedTodayMs={finishedTodayMs}
            timeZone={timeZone}
            avatar={avatarOf(profile)}
            trainerName={profile.trainer_name}
            level={level}
            // The coach loads on its own: PokéAPI being slow or down never blocks the clock.
            coach={
              <Suspense fallback={<Skeleton className="size-24 sm:size-44" />}>
                <Coach id={coachId} />
              </Suspense>
            }
            line={
              <Suspense fallback={<TextBox speaker="Today's coach">…</TextBox>}>
                <CoachLine
                  id={coachId}
                  event={event}
                  seed={daysBetween(DAILY_EPOCH, today) + sessions.length}
                  trainer={profile.trainer_name}
                  hours={(finishedTodayMs + runningTodayMs) / 3_600_000}
                />
              </Suspense>
            }
          />
        </div>
        <div className="lg:col-start-1 lg:row-start-1">
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <DailyCoachCard id={coachId} dateLabel={formatDay(today)} />
          </Suspense>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3">
        <Stat label="Today" value={formatDuration(finishedTodayMs + runningTodayMs)} />
        <Stat label="This week" value={formatDuration(weekMs)} />
        <Stat label="Days this week" value={`${daysLogged} / 7`} />
      </dl>

      <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <TodaySessions sessions={sessions} timeZone={timeZone} today={today} now={now} />
        <AddTimeForm today={today} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) neon-panel px-4 py-3">
      <dt className="text-xs font-bold uppercase tracking-[0.08em] text-(--dk-muted)" style={{ fontFamily: "var(--dp-mono)" }}>
        {label}
      </dt>
      <dd className="neon-text mt-1 text-lg font-bold tabular-nums sm:text-xl" style={{ fontFamily: "var(--dp-display)" }}>
        {value}
      </dd>
    </div>
  );
}

/** Ask PokéAPI for today's coach. Only this call goes in the try: it's the part that can fail. */
async function loadCoach(id: number): Promise<{ pokemon: Pokemon | null; notFound: boolean }> {
  try {
    return { pokemon: await getPokemon(id), notFound: false };
  } catch (error) {
    return { pokemon: null, notFound: error instanceof PokemonNotFoundError };
  }
}

async function Coach({ id }: { id: number }) {
  const { pokemon } = await loadCoach(id);
  if (!pokemon) return <CoachFromBehind name="???" types={[]} sprite={null} />;
  return <CoachFromBehind name={pokemon.displayName} types={pokemon.types} sprite={pokemon.backSprite ?? pokemon.sprite} />;
}

async function CoachLine({ id, event, seed, trainer, hours }: { id: number; event: CoachEvent; seed: number; trainer: string; hours: number }) {
  const { pokemon, notFound } = await loadCoach(id);
  if (!pokemon) {
    return (
      <TextBox tone="error" speaker="Today's coach" live="polite" action={<RetryButton />}>
        {notFound ? `Coach #${id} couldn't be found in the Pokédex today.` : "Today's coach couldn't make it: PokéAPI isn't answering right now."}{" "}
        Your clock still works, and your hours are saved as normal.
      </TextBox>
    );
  }
  const text = fillCoachLine(pickCoachLine({ types: pokemon.types, event, seed }), { pokemon: pokemon.displayName, trainer, hours });
  return (
    <TextBox speaker={pokemon.displayName} live="polite">
      {text}
    </TextBox>
  );
}

/** The front page's "Today's coach" card, with the coach's Pokédex entry in its text box. */
async function DailyCoachCard({ id, dateLabel }: { id: number; dateLabel: string }) {
  const { pokemon } = await loadCoach(id);
  if (!pokemon) {
    return (
      <section aria-label="Today's coach" className="neon-panel rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-4">
        <TextBox tone="error" speaker="Today's coach" live="polite" action={<RetryButton />}>
          PokéAPI isn&apos;t answering, so today&apos;s coach card can&apos;t load. Your clock still works.
        </TextBox>
      </section>
    );
  }
  return (
    <CoachCard
      number={pokemon.id}
      name={pokemon.displayName}
      types={pokemon.types}
      sprite={pokemon.gen4Sprite ?? pokemon.sprite}
      dateLabel={dateLabel}
      line={pokemon.genus ? `${pokemon.genus}. ${pokemon.flavorText}` : pokemon.flavorText}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading your dashboard" className="flex flex-col gap-6">
      <Skeleton className="h-[30rem] w-full" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}
