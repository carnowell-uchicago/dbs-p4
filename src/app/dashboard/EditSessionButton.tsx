"use client";

// "Edit" for one session: a pop-up form for its start, end and note. Uses the same
// <dialog> as the delete confirmation (focus trap, Esc to close). The server checks
// every value again (updateSession), and the database has the final say.
import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ds/Button";
import { Field } from "@/components/ds/Field";
import { TextBox } from "@/components/ds/TextBox";
import { updateSession, type ActionResult } from "./actions";

export type EditableSession = {
  id: string;
  label: string; // "9:02 AM – 11:30 AM (2 h 28 min)"
  start: string; // datetime-local value in your time zone, e.g. "2026-10-27T09:02"
  end: string | null; // null while running
  note: string | null;
  source: string; // "clock" | "manual"
  max: string; // now, as a datetime-local value (no future times)
};

export function EditSessionButton({ session }: { session: EditableSession }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [result, formAction, pending] = useActionState<ActionResult, FormData>(updateSession, null);
  const running = session.end === null;

  // Close the pop-up after a successful save.
  useEffect(() => {
    if (result?.ok) dialog.current?.close();
  }, [result]);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => dialog.current?.showModal()} aria-label={`Edit session ${session.label}`}>
        Edit
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby={`edit-${session.id}`}
        className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-5 text-(--dk-ice) backdrop:bg-[#05070d]/70"
      >
        <h2 id={`edit-${session.id}`} className="text-sm font-bold uppercase tracking-[0.08em]" style={{ fontFamily: "var(--dp-display)" }}>
          Edit session
        </h2>
        <form action={formAction} className="mt-3 flex flex-col gap-3">
          <input type="hidden" name="id" value={session.id} />
          <input type="hidden" name="running" value={String(running)} />
          <Field label="Start" name="start" type="datetime-local" defaultValue={session.start} max={session.max} required />
          {running ? (
            <p className="text-sm text-(--dk-muted)">Still running: the end is set when you clock out.</p>
          ) : (
            <Field label="End" name="end" type="datetime-local" defaultValue={session.end ?? ""} max={session.max} required />
          )}
          <Field label="Note (optional)" name="note" defaultValue={session.note ?? ""} maxLength={500} placeholder="What you worked on" />
          {session.source === "clock" && (
            <p className="text-xs text-(--dk-muted)">This was clocked live. Changing its times can lower the XP it earned, never raise it.</p>
          )}
          {result && !result.ok && (
            <TextBox tone="error" speaker="Can't save" live="assertive">
              {result.message}
            </TextBox>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" onClick={() => dialog.current?.close()} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
