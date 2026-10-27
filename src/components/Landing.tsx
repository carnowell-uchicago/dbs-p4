// The front page (direction B, "Product split", chosen by the student on /design/landing).
// Shared with /design/landing so the comparison stays honest.
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Button } from "@/components/ds/Button";
import { focusRing } from "@/components/ds/classes";
import { CoachCard } from "@/components/ds/CoachCard";
import { TextBox } from "@/components/ds/TextBox";
import { defaultAvatar } from "@/components/ds/TrainerAvatar";
import { TrainerCard } from "@/components/ds/TrainerCard";
import { LandingClockDemo } from "./LandingClockDemo";

const display = { fontFamily: "var(--dp-display)" };
const mono = { fontFamily: "var(--dp-mono)" };

export const panel = "rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) neon-panel";
export const PIKACHU = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/25.png";

/** Sign up when signed out; straight to the dashboard when signed in. */
export function StartCta({
  label = "Start training",
  secondary = true,
  centred = false,
}: {
  label?: string;
  secondary?: boolean;
  centred?: boolean;
}) {
  return (
    <Suspense fallback={<div className="h-11" aria-hidden />}>
      <div className={`flex flex-wrap items-center gap-3 ${centred ? "justify-center" : ""}`}>
        <Show when="signed-out">
          <SignUpButton>
            <Button className="min-w-44">{label}</Button>
          </SignUpButton>
          {secondary && (
            <SignInButton>
              <Button variant="ghost">I already have an account</Button>
            </SignInButton>
          )}
        </Show>
        <Show when="signed-in">
          <Link
            href="/dashboard"
            className={`inline-flex h-11 items-center rounded-(--dk-r-md) border-2 border-(--dk-edge) px-5 text-sm font-bold uppercase tracking-[0.08em] hover:border-(--dk-sky) hover:bg-(--dk-raised) ${focusRing}`}
            style={display}
          >
            Go to your dashboard →
          </Link>
        </Show>
      </div>
    </Suspense>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-(--dk-gold)" style={mono}>
      {children}
    </p>
  );
}

export function PrivacyNote() {
  return (
    <TextBox speaker="Prof. Willow">
      Your hours are yours. Other trainers can never see your sessions, and signed-out visitors see nothing at all.
    </TextBox>
  );
}

// ---------------------------------------------------------------------------
// B · Product split: the classic SaaS hero, with the real UI as the picture.
// ---------------------------------------------------------------------------
export function ProductSplit() {
  const day = [
    { time: "9:00 AM", tone: "coach" as const, line: "ALEX, I choose you! PIKACHU used Charge. Let's spark some focus!" },
    { time: "11:00 AM", tone: "coach" as const, line: "2 hours without a break! PIKACHU suggests a quick stretch." },
    { time: "5:00 PM", tone: "levelUp" as const, line: "That's enough, ALEX. 7.5h today, and you reached level 13!" },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <Eyebrow>Work-hours tracker for remote workers and students</Eyebrow>
          <h1 className="neon-text text-4xl font-bold uppercase leading-[1.05] tracking-[0.05em] sm:text-5xl" style={display}>
            Log your
            <br />
            work hours.
          </h1>
          <p className="max-w-lg text-lg">
            Clock in when you start working and clock out when you stop. Trainer Timesheet keeps a record of your hours, adds up
            each day and week, and turns them into a timesheet you can send to your boss, client or teacher.
          </p>
          <p className="max-w-lg text-(--dk-muted)">
            The twist: it&apos;s a Pokémon game. Your clock-in button is a Poké Ball, a new Pokémon coaches you each day, and every
            hour you log levels up your trainer.
          </p>
          <ul className="space-y-2 text-sm" style={mono}>
            <li>✓ One-press clock in and clock out, with a live timer</li>
            <li>✓ Daily and weekly totals, plus notes on what you worked on</li>
            <li>✓ Forgot to clock in? Add the hours afterwards</li>
            <li>✓ Download or print a timesheet for any week or date range</li>
          </ul>
          <StartCta label="Start logging hours" />
        </div>

        {/* The product as the picture, built from the real components. */}
        <div className="relative">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className={`${panel} p-4 sm:col-span-2`}>
              <LandingClockDemo avatar={defaultAvatar} />
            </div>
            <CoachCard number={25} name="Pikachu" types={["electric"]} sprite={PIKACHU} dateLabel="Tue, Oct 27" line="ALEX, I choose you! Let's spark some focus!" />
            <TrainerCard name="Alex" avatar={defaultAvatar} level={12} xpIntoLevel={980} xpForNextLevel={1200} progress={980 / 1200} />
          </div>
        </div>
      </div>

      <section aria-labelledby="day-h" className="mt-16">
        <h2 id="day-h" className="text-sm font-bold uppercase tracking-[0.1em]" style={display}>
          A workday, logged
        </h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {day.map((d) => (
            <li key={d.time} className="space-y-2">
              <p className="text-xs text-(--dk-gold)" style={mono}>
                {d.time}
              </p>
              <TextBox tone={d.tone} speaker="Pikachu">
                {d.line}
              </TextBox>
            </li>
          ))}
        </ol>
      </section>
      <div className="mt-10 max-w-2xl">
        <PrivacyNote />
      </div>
    </div>
  );
}

