"use client";

// A small "Delete" button for one session, with a confirmation pop-up first.
// Uses the browser's <dialog>: it traps focus, closes on Esc, and is announced
// to screen readers. Nothing is deleted until you press "Yes, delete it".
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ds/Button";
import { TextBox } from "@/components/ds/TextBox";
import { deleteSession } from "./actions";

export function DeleteSessionButton({
  sessionId,
  label, // e.g. "9:02 AM – 11:30 AM (2 h 28 min)"
  xp, // XP this session earned; deleting removes it
  running,
}: {
  sessionId: string;
  label: string;
  xp: number;
  running: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    startTransition(async () => {
      const r = await deleteSession(sessionId);
      if (r && !r.ok) setError(r.message);
      else dialog.current?.close();
    });
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => dialog.current?.showModal()} aria-label={`Delete session ${label}`}>
        Delete
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby={`del-${sessionId}`}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-5 text-(--dk-ice) backdrop:bg-[#05070d]/70"
      >
        <h2 id={`del-${sessionId}`} className="text-sm font-bold uppercase tracking-[0.08em]" style={{ fontFamily: "var(--dp-display)" }}>
          Delete this session?
        </h2>
        <p className="mt-2 text-sm" style={{ fontFamily: "var(--dp-mono)" }}>
          {label}
        </p>
        <p className="mt-2 text-sm text-(--dk-muted)">
          {running ? "This session is still running. Deleting it cancels your clock-in. " : ""}
          {xp > 0 ? `It earned ${xp} XP, which you'll lose. ` : ""}
          This can&apos;t be undone.
        </p>
        {error && (
          <div className="mt-3">
            <TextBox tone="error" speaker="Can't delete" live="assertive">
              {error}
            </TextBox>
          </div>
        )}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {/* Cancel first and focused by default, so Enter never deletes by accident. */}
          <Button autoFocus onClick={() => dialog.current?.close()} disabled={pending}>
            Keep it
          </Button>
          <Button
            onClick={confirm}
            disabled={pending}
            className="border-(--dk-ember)! text-(--dk-ember)! hover:bg-(--dk-ember)/15!"
          >
            {pending ? "Deleting…" : "Yes, delete it"}
          </Button>
        </div>
      </dialog>
    </>
  );
}
