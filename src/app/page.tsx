import { Show, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ds/Button";
import { focusRing } from "@/components/ds/classes";
import { TextBox } from "@/components/ds/TextBox";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold uppercase leading-tight tracking-[0.06em] sm:text-4xl" style={{ fontFamily: "var(--dp-display)" }}>
        Log your hours.
        <br />
        Level up as a trainer.
      </h1>
      <p className="max-w-xl text-lg text-(--dk-muted)">
        One press of the Poké Ball clocks you in. Every live minute earns trainer XP, a different Pokémon coaches you each day,
        and you can export a timesheet for any week.
      </p>
      <TextBox speaker="Today's coach">Ready when you are, trainer! Let&apos;s make today count.</TextBox>
      <Suspense fallback={<div className="h-11" aria-hidden />}>
        <Show when="signed-out">
          <SignUpButton>
            <Button className="self-start">Start training</Button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <Link
            href="/dashboard"
            className={`self-start rounded-(--dk-r-md) border-2 border-(--dk-edge) px-5 py-2.5 text-sm font-bold uppercase tracking-[0.08em] hover:border-(--dk-sky) hover:bg-(--dk-raised) ${focusRing}`}
            style={{ fontFamily: "var(--dp-display)" }}
          >
            Go to your dashboard →
          </Link>
        </Show>
      </Suspense>
    </main>
  );
}
