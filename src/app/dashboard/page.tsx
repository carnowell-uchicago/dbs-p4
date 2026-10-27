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
import { addDays, daysBetween, listDates, weekStart } from "@/lib/dates";
import { formatDay, formatDuration } from "@/lib/format";
import { getPokemon, PokemonNotFoundError, type Pokemon } from "@/lib/pokeapi";
import { startOfDay } from "@/lib/time";
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
      {/* Wide screens: the coach card and this week on the left; the battle, today's sessions
          and "add time" on the right. Phones: the right column first (Clock in at the top). */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2.4fr)]">
        <div className="flex min-w-0 flex-col gap-6 lg:col-start-2 lg:row-start-1">
          <ClockPanel
            running={running ? { id: running.id, clockIn: running.clock_in, note: running.note } : null}
            finishedTodayMs={finishedTodayMs}
            timeZone={timeZone}
            avatar={avatarOf(profile)}
            trainerName={profile.trainer_name}
            level={level}
            todaySpans={sessions.map((s) => ({ start: Date.parse(s.clock_in), end: s.clock_out ? Date.parse(s.clock_out) : null }))}
            dayStart={startOfDay(today, timeZone).getTime()}
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
          <div className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <TodaySessions sessions={sessions} timeZone={timeZone} today={today} now={now} />
            <AddTimeForm today={today} />
          </div>
        </div>
        {/* Left column: the coach card, then this week's numbers under it. */}
        <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <DailyCoachCard id={coachId} dateLabel={formatDay(today)} />
          </Suspense>
          <WeekPanel
            monday={monday}
            today={today}
            perDay={perDay}
            todayLabel={formatDuration(finishedTodayMs + runningTodayMs)}
            weekLabel={formatDuration(weekMs)}
            daysLogged={daysLogged}
          />
        </div>
      </div>
    </div>
  );
}

/** One panel: today's and this week's totals, then Mon–Sun (today highlighted, days to come as "–"). */
function WeekPanel({
  monday,
  today,
  perDay,
  todayLabel,
  weekLabel,
  daysLogged,
}: {
  monday: string;
  today: string;
  perDay: number[];
  todayLabel: string;
  weekLabel: string;
  daysLogged: number;
}) {
  const mono = { fontFamily: "var(--dp-mono)" };
  return (
    <section aria-labelledby="week-h" className="neon-panel rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) px-4 py-3">
      <h2 id="week-h" className="sr-only">
        Your week
      </h2>
      <dl className="grid grid-cols-3 gap-2 border-b-2 border-(--dk-line) pb-2 lg:grid-cols-1 lg:gap-1">
        {[
          ["Today", todayLabel],
          ["This week", weekLabel],
          ["Days", `${daysLogged} / 7`],
        ].map(([label, value]) => (
          <div key={label} className="lg:flex lg:items-baseline lg:justify-between">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-(--dk-muted)" style={mono}>
              {label}
            </dt>
            <dd className="neon-text text-lg font-bold tabular-nums" style={{ fontFamily: "var(--dp-display)" }}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <ul className="mt-2 grid grid-cols-7 gap-1 text-center text-sm tabular-nums lg:grid-cols-1 lg:gap-0.5 lg:text-left" style={mono}>
        {listDates(monday, addDays(monday, 6)).map((day, i) => {
          const future = day > today;
          return (
            <li key={day} className={`lg:flex lg:justify-between lg:gap-2 ${day === today ? "font-bold text-(--dk-gold)" : future ? "text-(--dk-muted)" : ""}`}>
              <span className="block">
                {formatDay(day).split(",")[0]}
                {day === today && <span className="sr-only"> (today)</span>}
              </span>
              <span className="block text-xs lg:text-sm">{future ? "–" : formatDuration(perDay[i] ?? 0)}</span>
            </li>
          );
        })}
      </ul>
    </section>
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
