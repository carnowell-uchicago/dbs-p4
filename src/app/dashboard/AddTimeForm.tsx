"use client";

// Retroactive time. It counts toward hours and the timesheet, but earns no XP.
import { useActionState } from "react";
import { Button } from "@/components/ds/Button";
import { Field } from "@/components/ds/Field";
import { TextBox } from "@/components/ds/TextBox";
import { addManualSession, type ActionResult } from "./actions";

export function AddTimeForm({ today }: { today: string }) {
  const [result, formAction, pending] = useActionState<ActionResult, FormData>(addManualSession, null);
  return (
    <details className="group rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-4">
      <summary
        className="cursor-pointer select-none text-sm font-bold uppercase tracking-[0.08em] text-(--dk-diamond) focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-(--dk-sky)"
        style={{ fontFamily: "var(--dp-display)" }}
      >
        + Add time manually
      </summary>
      <p className="mt-2 text-sm text-(--dk-muted)">
        Forgot to clock in? Add it here. It counts toward your hours and timesheet, but only live sessions earn XP.
      </p>
      <form action={formAction} className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Date" name="date" type="date" defaultValue={today} max={today} required className="col-span-2 sm:col-span-1" />
        <Field label="Start" name="start" type="time" required />
        <Field label="End" name="end" type="time" required />
        <Field label="Note (optional)" name="note" maxLength={500} placeholder="What you worked on" className="col-span-2 sm:col-span-3" />
        <div className="col-span-2 sm:col-span-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add time"}
          </Button>
        </div>
      </form>
      {result && (
        <div className="mt-3">
          <TextBox tone={result.ok ? "success" : "error"} speaker={result.ok ? "Saved" : "Can't add that"} live={result.ok ? "polite" : "assertive"}>
            {result.message}
          </TextBox>
        </div>
      )}
    </details>
  );
}
