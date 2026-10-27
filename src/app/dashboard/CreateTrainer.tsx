"use client";

// First visit: no profile yet, so ask for a trainer name before anything else.
import { useActionState } from "react";
import { Button } from "@/components/ds/Button";
import { Field } from "@/components/ds/Field";
import { TextBox } from "@/components/ds/TextBox";
import { createProfile, type ActionResult } from "./actions";

export function CreateTrainer() {
  const [result, formAction, pending] = useActionState<ActionResult, FormData>(createProfile, null);
  return (
    <section className="mx-auto flex max-w-md flex-col gap-4 rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) neon-panel p-6">
      <TextBox speaker="Prof. Willow">Welcome! Before your first shift, what should your coaches call you?</TextBox>
      <form action={formAction} className="flex flex-col gap-3">
        <Field label="Trainer name" name="trainerName" required minLength={1} maxLength={40} autoComplete="nickname" error={result && !result.ok ? result.message : undefined} />
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Saving…" : "Start training"}
        </Button>
      </form>
      <p className="text-xs text-(--dk-muted)">You can customise your avatar on your profile later.</p>
    </section>
  );
}
