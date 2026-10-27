"use client";

// The battle scene's moving parts: the Poké Ball, the watch, the plates' bars, and the
// note. The ticking is done here in the browser, but the start and stop times that count
// are set by the database (see the trigger). The coach and its line come from the server
// (`coach`, `line`) because they need PokéAPI.
import { useEffect, useOptimistic, useState, useTransition, type ReactNode } from "react";
import { BattleScene, NamePlate, PlateBar, shiftHp } from "@/components/ds/BattleScene";
import { ClockStage } from "@/components/ds/ClockStage";
import { Field } from "@/components/ds/Field";
import { TextBox } from "@/components/ds/TextBox";
import type { Avatar } from "@/components/ds/TrainerAvatar";
import { WatchTimer } from "@/components/ds/WatchTimer";
import { formatClock, formatDuration, formatElapsed } from "@/lib/format";
import { playerHpAt, type Span } from "@/lib/hp";
import type { LevelInfo } from "@/lib/xp";
import { clockIn, clockOut, type ActionResult } from "./actions";
import { LevelUpDialog } from "./LevelUpDialog";

export function ClockPanel({
  running,
  finishedTodayMs,
  timeZone,
  avatar,
  trainerName,
  level,
  todaySpans,
  dayStart,
  coach,
  line,
}: {
  running: { id: string; clockIn: string; note: string | null } | null;
  finishedTodayMs: number; // today's time from sessions that have ended
  timeZone: string;
  avatar: Avatar;
  trainerName: string;
  level: LevelInfo;
  todaySpans: Span[]; // today's sessions (for HP: drains while working, recovers on breaks)
  dayStart: number; // when today began, in your time zone
  coach: ReactNode;
  line: ReactNode;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [note, setNote] = useState(running?.note ?? "");
  const [result, setResult] = useState<ActionResult>(null);
  const [newLevel, setNewLevel] = useState<number | null>(null); // set when a clock-out levels you up
  const [pending, startTransition] = useTransition();
  // Flips the moment you press, so the Poké Ball animates straight away. If the server
  // says no, React puts it back when the transition ends (and the ball plays in reverse).
  const [out, setOut] = useOptimistic(Boolean(running));

  // Tick every second: the watch runs while clocked in, and HP recovers while clocked out.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const runningMs = running ? Math.max(0, now - new Date(running.clockIn).getTime()) : 0;
  const todayMs = finishedTodayMs + runningMs;
  const hp = shiftHp(todayMs);
  const player = playerHpAt(todaySpans, dayStart, now); // −1 per 0.1 h worked, +1 per 0.1 h off

  function press() {
    setResult(null);
    startTransition(async () => {
      setOut(!running);
      const r = running ? await clockOut(running.id, note) : await clockIn();
      if (r?.ok && !running) setNote("");
      if (r?.ok && r.levelUp) setNewLevel(r.levelUp);
      // Success is shown by the coach and the timer; only errors need a box here.
      if (r && !r.ok) setResult(r);
    });
  }

  return (
    <>
      {newLevel && <LevelUpDialog level={newLevel} avatar={avatar} onClose={() => setNewLevel(null)} />}
      <BattleScene
        opponentPlate={
          <NamePlate name="The Clock" tag="Today" side="opponent">
            <PlateBar
              label="HP"
              fill={hp.fill}
              colour={hp.colour}
              caption={hp.fill === 0 ? `${formatDuration(todayMs)} · full day done!` : `${formatDuration(todayMs)} of an 8 h day`}
            />
          </NamePlate>
        }
        opponent={
          <WatchTimer
            running={Boolean(running)}
            elapsed={formatElapsed(runningMs)}
            caption={running ? `since ${formatClock(running.clockIn, timeZone)}` : "Not clocked in"}
          />
        }
        coach={coach}
        stage={<ClockStage out={out} exhausted={player.exhausted} avatar={avatar} name={trainerName} disabled={pending} onClick={press} aria-busy={pending} />}
        playerPlate={
          <NamePlate name={trainerName} tag={`Lv ${level.level}`} side="player">
            {/* Like the games: your HP sits above your XP. It wears down as the day goes on. */}
            <PlateBar label="HP" fill={player.hp / 100} colour={player.colour} caption={player.exhausted ? `${player.hp} / 100 · tired!` : `${player.hp} / 100`} />
            <PlateBar
              label="XP"
              fill={level.progress}
              colour="var(--dk-hp)"
              caption={level.xpForNextLevel ? `${level.xpIntoLevel} / ${level.xpForNextLevel} XP` : "Max level!"}
            />
          </NamePlate>
        }
        line={
          <div className="flex flex-col gap-3">
            {line}
            {running && (
              <Field
                label="What are you working on? (optional)"
                hint="Saved with this session when you clock out."
                maxLength={500}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            )}
            {result && !result.ok && (
              <TextBox tone="error" speaker="Clock" live="assertive">
                {result.message}
              </TextBox>
            )}
          </div>
        }
      />
    </>
  );
}
