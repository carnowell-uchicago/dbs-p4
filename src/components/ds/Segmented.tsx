"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { forceAttr, type ForcedState } from "@/lib/design-system";
import { focusRing } from "./classes";

type Option = { value: string; label: string };

// A single-choice segmented control (a radio group): "1 week · 2 weeks · Custom",
// "Starts · Ends". Arrow keys move the choice, like native radios.
export function Segmented({
  label,
  options,
  value,
  defaultValue,
  onChange,
  name,
  force,
  forceOn,
}: {
  label: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  // When set, a hidden input submits the value with a form.
  name?: string;
  // Frozen specimens on the design system page: which option to force, and how.
  force?: ForcedState;
  forceOn?: string;
}) {
  const [inner, setInner] = useState(defaultValue ?? options[0]?.value);
  const current = value ?? inner;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function choose(v: string, i: number) {
    setInner(v);
    onChange?.(v);
    refs.current[i]?.focus();
  }

  function onKey(e: KeyboardEvent, i: number) {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + options.length) % options.length;
    choose(options[next].value, next);
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-grid auto-cols-fr grid-flow-col gap-0.5 rounded-(--dk-r-md) border-2 border-(--dk-edge) bg-(--dk-panel) p-0.5"
    >
      {options.map((o, i) => {
        const checked = force === "selected" ? o.value === forceOn : o.value === current;
        const f = o.value === forceOn ? force : undefined;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={f === "disabled"}
            onClick={() => choose(o.value, i)}
            onKeyDown={(e) => onKey(e, i)}
            {...forceAttr(f)}
            className={`h-8 whitespace-nowrap rounded-[4px] px-3 text-xs font-bold uppercase tracking-[0.06em] text-(--dk-ice) transition-[background-color,box-shadow] duration-150 hover:bg-(--dk-raised) data-[force=hover]:bg-(--dk-raised) active:bg-(--dk-diamond)/25 data-[force=pressed]:bg-(--dk-diamond)/25 aria-checked:bg-(--dk-diamond) aria-checked:text-(--dk-void) aria-checked:shadow-[0_0_4px_var(--dk-diamond),0_0_14px_color-mix(in_srgb,var(--dk-diamond)_50%,transparent)] disabled:text-(--dk-muted) disabled:opacity-60 ${focusRing}`}
            style={{ fontFamily: "var(--dp-display)" }}
          >
            {o.label}
          </button>
        );
      })}
      {name && <input type="hidden" name={name} value={current} />}
    </div>
  );
}
