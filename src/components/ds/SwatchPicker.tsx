"use client";

import { useState } from "react";
import { forceAttr, type ForcedState } from "@/lib/design-system";
import { focusRing } from "./classes";

// Colour choice for the avatar editor: a radio group of swatches. Each swatch has a
// real name for screen readers, and the selected one gets the diamond ring + check.
export function SwatchPicker({
  label,
  hideLegend,
  colors,
  names,
  value,
  onChange,
  force,
  forceIndex = 0,
}: {
  label: string;
  hideLegend?: boolean;
  colors: readonly string[];
  names?: readonly string[];
  value?: string;
  onChange?: (hex: string) => void;
  force?: ForcedState;
  forceIndex?: number;
}) {
  const [inner, setInner] = useState(colors[0]);
  const current = value ?? inner;
  return (
    <fieldset className="relative min-w-0">
      <legend className={hideLegend ? "sr-only" : "mb-1 text-xs font-bold uppercase tracking-[0.08em] text-(--dk-muted)"} style={{ fontFamily: "var(--dp-mono)" }}>
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {colors.map((hex, i) => {
          const f = i === forceIndex ? force : undefined;
          const checked = f === "selected" || (force !== "selected" && hex === current);
          return (
            <label key={hex} className="relative">
              <input
                type="radio"
                name={label}
                value={hex}
                checked={checked}
                disabled={f === "disabled"}
                onChange={() => {
                  setInner(hex);
                  onChange?.(hex);
                }}
                {...forceAttr(f)}
                className={`peer size-8 cursor-pointer appearance-none rounded-(--dk-r-md) border-2 border-(--dk-edge) transition-shadow hover:border-(--dk-ice) data-[force=hover]:border-(--dk-ice) checked:border-(--dk-diamond) checked:shadow-[0_0_4px_var(--dk-diamond),0_0_12px_color-mix(in_srgb,var(--dk-diamond)_55%,transparent)] disabled:opacity-40 ${focusRing}`}
                style={{ background: hex }}
                aria-label={names?.[i] ?? hex}
              />
              <span aria-hidden className="pointer-events-none absolute inset-0 hidden items-center justify-center text-sm font-bold text-white [text-shadow:0_0_3px_#000,0_0_3px_#000] peer-checked:flex">
                ✓
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
