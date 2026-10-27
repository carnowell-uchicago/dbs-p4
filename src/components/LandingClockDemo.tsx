"use client";

// Front-page demo: the Poké Ball and the watch together, so the watch runs only while
// the trainer is out. Releases and recalls by itself every few seconds; press to try it.
// Nothing is saved.
import { useEffect, useState } from "react";
import { ClockStage } from "@/components/ds/ClockStage";
import type { Avatar } from "@/components/ds/TrainerAvatar";
import { WatchTimer } from "@/components/ds/WatchTimer";
import { formatElapsed } from "@/lib/format";

const START_MS = (2 * 3600 + 14 * 60) * 1000; // the demo session starts at 02:14:00

export function LandingClockDemo({ avatar }: { avatar: Avatar }) {
  const [out, setOut] = useState(false);
  const [elapsed, setElapsed] = useState(START_MS);

  // Swap in and out by itself, unless the visitor prefers less motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setOut((v) => !v), 4000);
    return () => clearInterval(timer);
  }, []);

  // Tick only while clocked in.
  useEffect(() => {
    if (!out) return;
    const timer = setInterval(() => setElapsed((ms) => ms + 1000), 1000);
    return () => clearInterval(timer);
  }, [out]);

  return (
    <div className="flex flex-col gap-3">
      <ClockStage out={out} avatar={avatar} name="Alex" onClick={() => setOut((v) => !v)} />
      <WatchTimer
        running={out}
        elapsed={out ? formatElapsed(elapsed) : "00:00:00"}
        caption={out ? "since 9:00 AM · demo" : "Not clocked in · press the ball"}
      />
    </div>
  );
}
