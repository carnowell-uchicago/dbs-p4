import type { ButtonHTMLAttributes } from "react";
import { forceAttr, type ForcedState } from "@/lib/design-system";
import { disabledLook, focusRing } from "./classes";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
  force?: ForcedState;
};

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-(--dk-r-md) border-2 font-bold uppercase tracking-[0.08em] transition-[background-color,border-color,color,box-shadow,translate] duration-150 select-none";

const sizes = {
  md: "h-11 min-w-28 px-5 text-sm",
  sm: "h-9 px-3.5 text-xs",
};

// Watch red is the accent: only Clock in / Clock out wear it. Void text on red is 5.2:1.
const primary =
  "border-(--dk-red) bg-(--dk-red) text-(--dk-void) hover:border-(--dk-red-hot) hover:bg-(--dk-red-hot) hover:shadow-[0_0_6px_var(--dk-red),0_0_20px_color-mix(in_srgb,var(--dk-red)_55%,transparent)] data-[force=hover]:border-(--dk-red-hot) data-[force=hover]:bg-(--dk-red-hot) data-[force=hover]:shadow-[0_0_6px_var(--dk-red),0_0_20px_color-mix(in_srgb,var(--dk-red)_55%,transparent)] active:translate-y-px active:brightness-[.85] active:shadow-[inset_0_3px_0_rgb(0_0_0/0.35)] data-[force=pressed]:translate-y-px data-[force=pressed]:brightness-[.85] data-[force=pressed]:shadow-[inset_0_3px_0_rgb(0_0_0/0.35)]";

const secondary =
  "border-(--dk-edge) bg-transparent text-(--dk-ice) shadow-[0_0_8px_color-mix(in_srgb,var(--dk-sky)_22%,transparent)] hover:border-(--dk-sky) hover:bg-(--dk-raised) hover:shadow-[0_0_8px_color-mix(in_srgb,var(--dk-sky)_40%,transparent)] data-[force=hover]:border-(--dk-sky) data-[force=hover]:bg-(--dk-raised) data-[force=hover]:shadow-[0_0_8px_color-mix(in_srgb,var(--dk-sky)_40%,transparent)] active:translate-y-px active:bg-(--dk-sky)/15 data-[force=pressed]:translate-y-px data-[force=pressed]:bg-(--dk-sky)/15";

const ghost =
  "border-transparent bg-transparent text-(--dk-diamond) hover:bg-(--dk-raised) data-[force=hover]:bg-(--dk-raised) active:translate-y-px active:bg-(--dk-diamond)/15 data-[force=pressed]:translate-y-px data-[force=pressed]:bg-(--dk-diamond)/15";

const variants = { primary, secondary, ghost };

export function Button({
  variant = "secondary",
  size = "md",
  force,
  className = "",
  disabled,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || force === "disabled"}
      {...forceAttr(force)}
      className={`${base} ${sizes[size]} ${variants[variant]} ${focusRing} ${disabledLook} ${className}`}
      style={{ fontFamily: "var(--dp-display)" }}
      {...rest}
    />
  );
}
