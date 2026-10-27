"use client";

// The clock as a Poké Ball release, like the anime.
//   Clock in:  the lid opens, a white beam shoots to the shadow on the grass, the trainer
//              appears as a white glow that grows into full colour, and the lid closes.
//   Clock out: the lid opens, a red beam hits the trainer, they turn red and shrink back
//              into the ball, and the lid closes. Only the shadow is left.
// It's a timeline of steps (below) played with setTimeout; CSS transitions do the motion.
// With "reduce motion" turned on, it jumps straight to the end.
import { useEffect, useRef, useState, type ButtonHTMLAttributes } from "react";
import { ClockButton } from "./ClockButton";
import { TrainerAvatar, type Avatar } from "./TrainerAvatar";

type Look = {
  lidOpen: boolean;
  beam: "none" | "white" | "red";
  trainer: "inside" | "glowSmall" | "glowFull" | "out" | "redFull" | "redSmall";
};

const INSIDE: Look = { lidOpen: false, beam: "none", trainer: "inside" };
const OUT: Look = { lidOpen: false, beam: "none", trainer: "out" };

// [time in ms, what it looks like from then on]
const RELEASE: [number, Look][] = [
  [0, { lidOpen: true, beam: "none", trainer: "inside" }],
  [250, { lidOpen: true, beam: "white", trainer: "glowSmall" }],
  [450, { lidOpen: true, beam: "white", trainer: "glowFull" }],
  [850, { lidOpen: true, beam: "none", trainer: "out" }],
  [1150, OUT],
];
const RECALL: [number, Look][] = [
  [0, { lidOpen: true, beam: "none", trainer: "out" }],
  [250, { lidOpen: true, beam: "red", trainer: "redFull" }],
  [550, { lidOpen: true, beam: "red", trainer: "redSmall" }],
  [900, { lidOpen: true, beam: "none", trainer: "inside" }],
  [1150, INSIDE],
];

const trainerStyle: Record<Look["trainer"], { wrap: string; glow: string | null; glowOpacity: string }> = {
  inside: { wrap: "scale-[0.15] -translate-x-16 opacity-0", glow: null, glowOpacity: "opacity-0" },
  glowSmall: { wrap: "scale-[0.3] opacity-100", glow: "#ffffff", glowOpacity: "opacity-100" },
  glowFull: { wrap: "scale-100 opacity-100", glow: "#ffffff", glowOpacity: "opacity-100" },
  out: { wrap: "scale-100 opacity-100", glow: "#ffffff", glowOpacity: "opacity-0" },
  redFull: { wrap: "scale-100 opacity-100", glow: "#ff3939", glowOpacity: "opacity-100" },
  redSmall: { wrap: "scale-[0.15] -translate-x-16 opacity-0", glow: "#ff3939", glowOpacity: "opacity-100" },
};

export function ClockStage({
  out,
  avatar,
  name,
  ...button
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  out: boolean; // is the trainer out of the ball (clocked in)?
  avatar: Avatar;
  name: string;
}) {
  const [look, setLook] = useState<Look>(out ? OUT : INSIDE);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timer = setTimeout(() => setLook(out ? OUT : INSIDE), 0);
      return () => clearTimeout(timer);
    }
    const timers = (out ? RELEASE : RECALL).map(([at, next]) => setTimeout(() => setLook(next), at));
    return () => timers.forEach(clearTimeout);
  }, [out]);

  const t = trainerStyle[look.trainer];
  const beamColour = look.beam === "red" ? "var(--dk-red)" : "#ffffff";
  return (
    <div className="relative mx-auto flex w-fit items-end gap-2 sm:gap-12">
      <ClockButton running={out} size="md" open={look.lidOpen} {...button} />

      {/* The beam, from the centre of the ball (64px in) to the centre of the spot (48px from the right). */}
      <span
        aria-hidden
        className={`pointer-events-none absolute bottom-[60px] left-16 right-12 h-2 origin-left rounded-full transition-[opacity,scale] duration-200 ${look.beam === "none" ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"}`}
        style={{ background: beamColour, boxShadow: `0 0 10px ${beamColour}, 0 0 24px ${beamColour}` }}
      />

      {/* The trainer's spot: a shadow on the grass, and the trainer when they're out. */}
      <div aria-hidden className="relative flex h-40 w-24 shrink-0 items-end justify-center">
        <span
          className={`absolute bottom-0 h-4 rounded-[50%] bg-black/55 blur-[1px] transition-[width,opacity] duration-300 ${look.trainer === "inside" ? "w-16 opacity-70" : "w-20 opacity-90"}`}
        />
        <div className={`relative mb-1.5 origin-bottom transition-[scale,translate,opacity] duration-300 ease-out ${t.wrap}`}>
          <TrainerAvatar avatar={avatar} size={88} />
          {t.glow && (
            <div className={`absolute inset-0 transition-opacity duration-300 ${t.glowOpacity}`} style={{ filter: `drop-shadow(0 0 6px ${t.glow})` }}>
              <TrainerAvatar avatar={avatar} size={88} silhouette={t.glow} />
            </div>
          )}
        </div>
      </div>
      <span className="sr-only">{out ? `${name} is out of the Poké Ball: you're on the clock.` : `${name} is resting in the Poké Ball.`}</span>
    </div>
  );
}
