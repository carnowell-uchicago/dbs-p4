"use client";

// The Poké Ball and the watch. The ticking is done here in the browser, but the
// start and stop times that count are set by the database (see the trigger).
import { useEffect, useState, useTransition } from "react";
import { ClockButton } from "@/components/ds/ClockButton";
import { Field } from "@/components/ds/Field";
import { TextBox } from "@/components/ds/TextBox";
import { WatchTimer } from "@/components/ds/WatchTimer";
import { formatClock, formatDuration, formatElapsed } from "@/lib/format";
import { clockIn, clockOut, type ActionResult } from "./actions";

export function ClockPanel({
  running,
  finishedTodayMs,
  timeZone,
}: {
  running: { id: string; clockIn: string; note: string | null } | null;
  finishedTodayMs: number; // today's time from sessions that have ended
  timeZone: string;
}) {
  const [now, setNow] = useState(() => Date.now());
  const [note, setNote] = useState(running?.note ?? "");
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, startTransition] = useTransition();

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
      const r = running ? await clockOut(running.id, note) : await clockIn();
      if (r?.ok && !running) setNote("");
      // Success is shown by the coach and the timer; only errors need a box here.
      if (r && !r.ok) setResult(r);
    });
  }

  return (
    <section aria-label="Clock" className="flex flex-col gap-4 rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <ClockButton running={Boolean(running)} disabled={pending} onClick={press} aria-busy={pending} />
        <div className="w-full min-w-0 flex-1">
          <WatchTimer
            running={Boolean(running)}
            elapsed={formatElapsed(runningMs)}
            caption={running ? `since ${formatClock(running.clockIn, timeZone)} · ${todayLabel}` : `Not clocked in · ${todayLabel}`}
          />
        </div>
      </div>
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
