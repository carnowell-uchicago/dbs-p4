// The dashboard as a Pokémon battle (student's idea): the Clock is the opponent, top right;
// today's coach stands on your side, bottom left, seen from behind like your own Pokémon;
// you come out of the Poké Ball onto the platform. Name plates are drawn like the
// Diamond/Pearl ones. Pure layout: the dashboard and the preview pass the pieces in.
import type { ReactNode } from "react";
import { grassBackground } from "./textures";

const display = { fontFamily: "var(--dp-display)" };
const mono = { fontFamily: "var(--dp-mono)" };

export function BattleScene({
  opponentPlate,
  opponent,
  coach,
  stage,
  playerPlate,
  line,
}: {
  opponentPlate: ReactNode; // the Clock's name plate
  opponent: ReactNode; // the Clock itself (the watch)
  coach: ReactNode; // today's coach, from behind
  stage: ReactNode; // the Poké Ball and your trainer's spot
  playerPlate: ReactNode; // your name plate
  line: ReactNode; // what the coach says
}) {
  return (
    <section aria-label="Battle" className="overflow-hidden rounded-(--dk-r-lg) border-2 border-(--dk-edge)">
      <div className="relative" style={{ background: "linear-gradient(#0b1130, #1d2758 55%, #2a3466)" }}>
        {/* Grass on the lower part of the field. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[55%] opacity-90 [mask-image:linear-gradient(transparent,black_35%)]"
          style={grassBackground}
        />

        {/* Opponent row: plate on the left, the Clock on its platform on the right. */}
        <div className="relative grid items-center gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-6">
          <div className="max-w-sm">{opponentPlate}</div>
          <div className="relative justify-self-center sm:justify-self-end sm:pr-6">
            <Platform className="-bottom-5 left-1/2 w-[110%] -translate-x-1/2" />
            <div className="relative">{opponent}</div>
          </div>
        </div>

        {/* Your row: coach from behind, the Poké Ball, your spot; your plate on the right. */}
        <div className="relative grid items-end gap-4 px-4 pt-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:px-6">
          <div className="relative flex items-end sm:gap-2">
            <Platform className="bottom-2 left-[38%] w-[70%]" />
            {/* On phones the coach is tucked against the edge, like the games' back sprites. */}
            <div className="relative -mb-1 -ml-3 shrink-0 sm:ml-0">{coach}</div>
            <div className="relative pb-4">{stage}</div>
          </div>
          <div className="w-full pb-4 sm:w-72 sm:justify-self-end">{playerPlate}</div>
        </div>
      </div>
      <div className="border-t-2 border-(--dk-edge) bg-(--dk-panel) p-3">{line}</div>
    </section>
  );
}

function Platform({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`absolute h-8 rounded-[50%] border-2 border-[#0b2222] ${className}`}
      style={{ background: "radial-gradient(#1c5838, #10322a 70%)" }}
    />
  );
}

/** A Diamond/Pearl-style name plate: light card, dark ink, one slanted corner. */
export function NamePlate({
  name,
  tag,
  side,
  children,
}: {
  name: string;
  tag: ReactNode; // e.g. "Lv 4" or "Today"
  side: "opponent" | "player";
  children: ReactNode;
}) {
  const corner = side === "opponent" ? "rounded-[6px] rounded-br-[22px]" : "rounded-[6px] rounded-tl-[22px]";
  return (
    <div className={`border-[3px] border-[#05070d] bg-(--dk-ball) px-4 py-2.5 text-(--dk-void) shadow-[0_0_0_2px_var(--dk-edge)] ${corner}`}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="truncate text-base font-bold uppercase tracking-[0.06em]" style={display}>
          {name}
        </p>
        <p className="shrink-0 text-sm font-bold" style={{ fontFamily: "var(--dp-pixel)" }}>
          {tag}
        </p>
      </div>
      <div className="mt-1.5 space-y-1">{children}</div>
    </div>
  );
}

/** A bar like the games' HP bar. `fill` is 0–1. */
export function PlateBar({ label, fill, colour, caption }: { label: string; fill: number; colour: string; caption: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, fill)) * 100);
  return (
    <>
      <div className="flex items-center gap-2">
        <span className="w-10 shrink-0 text-[11px] font-bold text-(--dk-gold) [text-shadow:0_0_1px_#05070d]" style={mono}>
          <span className="rounded-[3px] bg-[#05070d] px-1 text-(--dk-gold)">{label}</span>
        </span>
        <span
          role="meter"
          aria-label={`${label}: ${caption}`}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2.5 flex-1 overflow-hidden rounded-full border-2 border-[#05070d] bg-[#2a3466]"
        >
          <span className="block h-full transition-[width] duration-500" style={{ width: `${pct}%`, background: colour }} />
        </span>
      </div>
      <p className="text-right text-xs tabular-nums" style={mono}>
        {caption}
      </p>
    </>
  );
}

/** The Clock's "HP": a full 8-hour shift that drains as you work. Green, then gold, then ember. */
export const SHIFT_MS = 8 * 60 * 60 * 1000;
export function shiftHp(todayMs: number): { fill: number; colour: string } {
  const fill = Math.max(0, 1 - todayMs / SHIFT_MS);
  const colour = fill > 0.5 ? "var(--dk-hp)" : fill > 0.2 ? "var(--dk-gold)" : "var(--dk-ember)";
  return { fill, colour };
}

/** Today's coach from behind, big and pixel-crisp; a "?" if PokéAPI couldn't send it. */
export function CoachFromBehind({ name, types, sprite }: { name: string; types: string[]; sprite: string | null }) {
  return (
    <div className="flex flex-col items-start gap-1">
      {/* The text box already names the coach, so on phones this label is for screen readers only. */}
      <span
        className="sr-only rounded-(--dk-r-sm) border-2 border-(--dk-gold) bg-(--dk-void)/80 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-(--dk-gold) sm:not-sr-only"
        style={display}
      >
        Coach · {name}
        {types.length > 0 && <span className="sr-only"> ({types.join(", ")} type)</span>}
      </span>
      {sprite ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={sprite} alt={`${name}, today's coach, seen from behind`} width={176} height={176} className="size-24 [image-rendering:pixelated] sm:size-44" />
      ) : (
        <span aria-label="Today's coach is unavailable" role="img" className="flex size-24 items-center justify-center text-6xl text-(--dk-muted) sm:size-44" style={display}>
          ?
        </span>
      )}
    </div>
  );
}
