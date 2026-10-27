"use client";

// ClockStage without a server: press to release or recall the trainer. With `autoplay`,
// it does it by itself every few seconds (for the front page). Nothing is saved.
import { useEffect, useState } from "react";
import { ClockStage } from "./ClockStage";
import { defaultAvatar, type Avatar } from "./TrainerAvatar";

export function ClockStageDemo({ avatar = defaultAvatar, autoplay = false }: { avatar?: Avatar; autoplay?: boolean }) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    if (!autoplay || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setOut((v) => !v), 3200);
    return () => clearInterval(timer);
  }, [autoplay]);
  return <ClockStage out={out} avatar={avatar} name="Your trainer" onClick={() => setOut((v) => !v)} />;
}
