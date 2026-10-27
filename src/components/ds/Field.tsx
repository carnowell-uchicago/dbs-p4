import { useId, type InputHTMLAttributes } from "react";
import { forceAttr, type ForcedState } from "@/lib/design-system";
import { focusRing } from "./classes";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  force?: ForcedState;
};

// Text and date fields. The label is always real (visually hidden when `hideLabel`),
// hints and errors are tied to the input with aria-describedby.
export function Field({ label, hideLabel, hint, error, force, className = "", disabled, ...rest }: Props) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <label
        htmlFor={id}
        className={hideLabel ? "sr-only" : "text-xs font-bold uppercase tracking-[0.08em] text-(--dk-muted)"}
        style={{ fontFamily: "var(--dp-mono)" }}
      >
        {label}
      </label>
      <input
        id={id}
        disabled={disabled || force === "disabled"}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        {...forceAttr(force)}
        className={`h-10 min-w-0 rounded-(--dk-r-md) border-2 border-(--dk-edge) bg-(--dk-panel) px-3 text-sm text-(--dk-ice) [color-scheme:dark] placeholder:text-(--dk-muted) hover:border-(--dk-diamond) data-[force=hover]:border-(--dk-diamond) focus-visible:border-(--dk-sky) data-[force=focus]:border-(--dk-sky) aria-invalid:border-(--dk-ember) disabled:border-(--dk-line) disabled:text-(--dk-muted) ${focusRing}`}
        style={{ fontFamily: "var(--dp-mono)" }}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-(--dk-muted)">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-bold text-(--dk-ember)">
          <span aria-hidden>⚠ </span>
          {error}
        </p>
      )}
    </div>
  );
}
