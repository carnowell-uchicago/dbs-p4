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
import type { LevelInfo } from "@/lib/xp";
import { clockIn, clockOut, type ActionResult } from "./actions";

export function ClockPanel({
  running,
  finishedTodayMs,
  timeZone,
  avatar,
  trainerName,
  level,
  coach,
  line,
}: {
  running: { id: string; clockIn: string; note: string | null } | null;
  finishedTodayMs: number; // today's time from sessions that have ended
  timeZone: string;
  avatar: Avatar;
  trainerName: string;
  level: LevelInfo;
  coach: ReactNode;
  line: ReactNode;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [note, setNote] = useState(running?.note ?? "");
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, startTransition] = useTransition();
  // Flips the moment you press, so the Poké Ball animates straight away. If the server
  // says no, React puts it back when the transition ends (and the ball plays in reverse).
  const [out, setOut] = useOptimistic(Boolean(running));

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const runningMs = running ? Math.max(0, now - new Date(running.clockIn).getTime()) : 0;
  const todayMs = finishedTodayMs + runningMs;
  const hp = shiftHp(todayMs);

  function press() {
    setResult(null);
    startTransition(async () => {
      setOut(!running);
      const r = running ? await clockOut(running.id, note) : await clockIn();
      if (r?.ok && !running) setNote("");
      // Success is shown by the coach and the timer; only errors need a box here.
      if (r && !r.ok) setResult(r);
    });
  }

  return (
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
      stage={<ClockStage out={out} avatar={avatar} name={trainerName} disabled={pending} onClick={press} aria-busy={pending} />}
      playerPlate={
        <NamePlate name={trainerName} tag={`Lv ${level.level}`} side="player">
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
  );
}
