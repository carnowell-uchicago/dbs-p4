import type { ButtonHTMLAttributes } from "react";
import { forceAttr, type ForcedState } from "@/lib/design-system";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  running: boolean;
  size?: "lg" | "md" | "sm";
  force?: ForcedState;
};

// The hero control: a Poké Ball. Red top (the accent), white bottom, black band, and
// the centre button carries the label. One press clocks in; the next clocks out.
// It's the only round control in the system.
export function ClockButton({
  running,
  size = "lg",
  force,
  className = "",
  disabled,
  type = "button",
  ...rest
}: Props) {
  const label = running ? "Clock out" : "Clock in";
  const dims = { lg: "h-44 w-44", md: "h-32 w-32", sm: "h-24 w-24" }[size];
  // The centre button grows on smaller balls so the 12px label still fits.
  const centre = { lg: "w-[46%] text-sm", md: "w-[54%] text-[12px]", sm: "w-[62%] text-[12px] tracking-normal" }[size];
  return (
    <button
      type={type}
      aria-label={label}
      disabled={disabled || force === "disabled"}
      {...forceAttr(force)}
      className={`group relative ${dims} shrink-0 select-none overflow-hidden rounded-full border-4 border-[#05070d] transition-[box-shadow,translate,filter] duration-150 hover:shadow-[0_0_8px_var(--dk-red),0_0_28px_color-mix(in_srgb,var(--dk-red)_55%,transparent)] data-[force=hover]:shadow-[0_0_8px_var(--dk-red),0_0_28px_color-mix(in_srgb,var(--dk-red)_55%,transparent)] active:translate-y-0.5 active:brightness-90 data-[force=pressed]:translate-y-0.5 data-[force=pressed]:brightness-90 focus-visible:outline-4 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-(--dk-sky) data-[force=focus]:outline-4 data-[force=focus]:outline-solid data-[force=focus]:outline-offset-4 data-[force=focus]:outline-(--dk-sky) disabled:pointer-events-none disabled:grayscale disabled:opacity-50 ${className}`}
      {...rest}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-(--dk-red) group-hover:bg-(--dk-red-hot) group-data-[force=hover]:bg-(--dk-red-hot)" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-(--dk-ball)" />
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 bg-[#05070d]" />
      {/* Shine on the red half. */}
      <span aria-hidden className="absolute left-[18%] top-[12%] h-[14%] w-[24%] rotate-[-30deg] rounded-full bg-white/35" />
      <span
        className={`absolute left-1/2 top-1/2 flex aspect-square -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-[#05070d] bg-(--dk-ball) font-bold uppercase leading-tight tracking-[0.04em] ${centre} text-(--dk-void)`}
        style={{ fontFamily: "var(--dp-display)" }}
      >
        {running ? (
          <>
            Clock
            <br />
            out
          </>
        ) : (
          <>
            Clock
            <br />
            in
          </>
        )}
      </span>
    </button>
  );
}
