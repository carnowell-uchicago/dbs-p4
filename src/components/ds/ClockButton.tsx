import type { ButtonHTMLAttributes } from "react";
import { forceAttr, type ForcedState } from "@/lib/design-system";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  running: boolean;
  size?: "lg" | "md" | "sm";
  force?: ForcedState;
  // The lid swings open on its hinge (used by ClockStage while the trainer comes out or goes back).
  open?: boolean;
};

const ink = "border-[#05070d]";

// The hero control: a Poké Ball. Red lid (the accent), white base, black band, and the
// centre button carries the label. One press clocks in; the next clocks out.
// It's the only round control in the system. The lid and base are separate halves so the
// lid can open; when closed they meet and their borders make the black band.
export function ClockButton({
  running,
  size = "lg",
  force,
  open = false,
  className = "",
  disabled,
  type = "button",
  ...rest
}: Props) {
  const label = running ? "Clock out" : "Clock in";
  const dims = { lg: "h-44 w-44", md: "h-32 w-32", sm: "h-24 w-24" }[size];
  // A big centre button with big text, so the main action reads at a glance.
  const centre = { lg: "w-[58%] text-xl", md: "w-[64%] text-base", sm: "w-[70%] text-[13px] tracking-normal" }[size];
  return (
    <button
      type={type}
      aria-label={label}
      disabled={disabled || force === "disabled"}
      {...forceAttr(force)}
      className={`group relative ${dims} shrink-0 select-none rounded-full shadow-[0_0_10px_color-mix(in_srgb,var(--dk-red)_45%,transparent),0_0_26px_color-mix(in_srgb,var(--dk-red)_22%,transparent)] transition-[box-shadow,translate,filter] duration-150 hover:shadow-[0_0_8px_var(--dk-red),0_0_28px_color-mix(in_srgb,var(--dk-red)_55%,transparent)] data-[force=hover]:shadow-[0_0_8px_var(--dk-red),0_0_28px_color-mix(in_srgb,var(--dk-red)_55%,transparent)] active:translate-y-0.5 active:brightness-90 data-[force=pressed]:translate-y-0.5 data-[force=pressed]:brightness-90 focus-visible:outline-4 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-(--dk-sky) data-[force=focus]:outline-4 data-[force=focus]:outline-solid data-[force=focus]:outline-offset-4 data-[force=focus]:outline-(--dk-sky) disabled:pointer-events-none disabled:grayscale disabled:opacity-50 ${open ? "disabled:grayscale-0 disabled:opacity-100" : ""} ${className}`}
      {...rest}
    >
      {/* A slow red "breathing" glow so the ball stands out (still for reduced motion). */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -inset-1.5 rounded-full shadow-[0_0_18px_6px_color-mix(in_srgb,var(--dk-red)_45%,transparent)] motion-safe:animate-pulse ${open ? "opacity-0" : ""}`}
      />
      {/* Light inside the ball, seen when the lid is up. */}
      <span
        aria-hidden
        className={`absolute inset-x-[12%] top-1/2 h-[30%] -translate-y-1/2 rounded-[50%] bg-white blur-[6px] transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      />
      {/* Base: white bottom half. */}
      <span aria-hidden className={`absolute inset-x-0 bottom-0 h-1/2 rounded-b-full border-4 border-t-4 ${ink} bg-(--dk-ball)`} />
      {/* Lid: red top half, hinged at its back-left corner. */}
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-1/2 origin-bottom-left transition-transform duration-300 ease-out ${open ? "-rotate-[50deg]" : "rotate-0"}`}
      >
        <span className={`absolute inset-0 rounded-t-full border-4 border-b-4 ${ink} bg-(--dk-red) group-hover:bg-(--dk-red-hot) group-data-[force=hover]:bg-(--dk-red-hot)`} />
        {/* Shine. */}
        <span className="absolute left-[18%] top-[24%] h-[28%] w-[24%] rotate-[-30deg] rounded-full bg-white/35" />
      </span>
      {/* Centre button with the label; it hides while the ball is open. */}
      <span
        className={`absolute left-1/2 top-1/2 flex aspect-square -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 ${ink} bg-(--dk-ball) font-extrabold uppercase leading-[1.05] tracking-[0.03em] ${centre} text-(--dk-void) transition-[opacity,scale] duration-200 ${open ? "scale-75 opacity-0" : "opacity-100"}`}
        style={{ fontFamily: "var(--dp-display)" }}
      >
        {/* Capitals have no descenders, so the line box leaves empty space under them and
            they look high. This nudges them down to the optical centre. */}
        <span className="translate-y-[0.08em]">
          Clock
          <br />
          {running ? "out" : "in"}
        </span>
      </span>
    </button>
  );
}
