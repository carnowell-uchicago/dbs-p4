"use client";

// The Poké Ball and the watch. The ticking is done here in the browser, but the
// start and stop times that count are set by the database (see the trigger).
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { ClockStage } from "@/components/ds/ClockStage";
import type { Avatar } from "@/components/ds/TrainerAvatar";
import { Field } from "@/components/ds/Field";
import { TextBox } from "@/components/ds/TextBox";
import { WatchTimer } from "@/components/ds/WatchTimer";
import { formatClock, formatDuration, formatElapsed } from "@/lib/format";
import { clockIn, clockOut, type ActionResult } from "./actions";

export function ClockPanel({
  running,
  finishedTodayMs,
  timeZone,
  avatar,
  trainerName,
}: {
  running: { id: string; clockIn: string; note: string | null } | null;
  finishedTodayMs: number; // today's time from sessions that have ended
  timeZone: string;
  avatar: Avatar;
  trainerName: string;
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
  const todayLabel = `today ${formatDuration(finishedTodayMs + runningMs)}`;

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
    <section aria-label="Clock" className="flex flex-col gap-4 rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-4">
      <ClockStage out={out} avatar={avatar} name={trainerName} disabled={pending} onClick={press} aria-busy={pending} />
      <WatchTimer
        running={Boolean(running)}
        elapsed={formatElapsed(runningMs)}
        caption={running ? `since ${formatClock(running.clockIn, timeZone)} · ${todayLabel}` : `Not clocked in · ${todayLabel}`}
      />
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
    </section>
  );
}
