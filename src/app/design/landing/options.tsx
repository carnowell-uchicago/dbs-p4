// Three directions for the front page, all built from the Dusk components.
// The chosen one moves to src/app/page.tsx; this file is for comparing.
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Button } from "@/components/ds/Button";
import { focusRing } from "@/components/ds/classes";
import { ClockStageDemo } from "@/components/ds/ClockStageDemo";
import { CoachCard } from "@/components/ds/CoachCard";
import { TypeTag } from "@/components/ds/Tag";
import { TextBox } from "@/components/ds/TextBox";
import { avatarOptions, defaultAvatar, TrainerAvatar, type Avatar } from "@/components/ds/TrainerAvatar";
import { TrainerCard } from "@/components/ds/TrainerCard";
import { WatchTimer } from "@/components/ds/WatchTimer";

const display = { fontFamily: "var(--dp-display)" };
const mono = { fontFamily: "var(--dp-mono)" };
const pixel = { fontFamily: "var(--dp-pixel)" };

const panel = "rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel)";
const PIKACHU = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/25.png";

const trainers: Avatar[] = [
  { skin: avatarOptions.skin[4], hair: "long", hairColor: avatarOptions.hairColor[0], hat: "none", hatColor: avatarOptions.color[0], outfit: avatarOptions.color[3] },
  defaultAvatar,
  { skin: avatarOptions.skin[0], hair: "bun", hairColor: avatarOptions.hairColor[5], hat: "beanie", hatColor: avatarOptions.color[4], outfit: avatarOptions.color[6] },
  { skin: avatarOptions.skin[2], hair: "short", hairColor: avatarOptions.hairColor[2], hat: "beanie", hatColor: avatarOptions.color[2], outfit: avatarOptions.color[5] },
];

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

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-(--dk-gold)" style={mono}>
      {children}
    </p>
  );
}

const features = [
  { title: "One press", body: "Tap the Poké Ball to clock in. Tap again to clock out. That's the whole job." },
  { title: "Earn XP", body: "Every live minute is 1 XP for your trainer. Added-later time counts as hours, not XP." },
  { title: "Daily coach", body: "A new Pokémon from the original 151 coaches everyone each day, in its own voice." },
  { title: "Timesheets", body: "Export 1 week, 2 weeks, or any range as CSV, ready to send." },
];

function PrivacyNote() {
  return (
    <TextBox speaker="Prof. Willow">
      Your hours are yours. Other trainers can never see your sessions, and signed-out visitors see nothing at all.
    </TextBox>
  );
}

// ---------------------------------------------------------------------------
// A · Title screen: the game's boot screen. The animation is the hero.
// ---------------------------------------------------------------------------
export function OptionTitleScreen() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 py-14 text-center sm:px-6">
      <div className="space-y-4">
        <Eyebrow>A work-hours log · Pokémon edition</Eyebrow>
        <h1 className="text-4xl font-bold uppercase leading-[1.05] tracking-[0.06em] sm:text-6xl" style={display}>
          <span style={{ textShadow: "0 0 6px var(--dk-sky), 0 0 24px color-mix(in srgb, var(--dk-sky) 55%, transparent)" }}>Trainer</span>
          <br />
          Timesheet
        </h1>
        <p className="mx-auto max-w-xl text-lg text-(--dk-muted)">
          Clock in with one press of a Poké Ball. Your trainer comes out, today&apos;s coach cheers you on, and every live minute
          earns XP.
        </p>
      </div>

      <div className={`${panel} w-full max-w-xl px-6 pb-6 pt-8`}>
        <ClockStageDemo avatar={trainers[0]} autoplay />
        <p className="mt-4 text-xs text-(--dk-muted)" style={mono}>
          Try it: press the ball. (Demo only, nothing is saved.)
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <StartCta label="Press start" centred />
        <p className="text-sm text-(--dk-gold) motion-safe:animate-pulse" style={pixel}>
          ▸ Free · no setup · works on your phone
        </p>
      </div>

      <ul className="grid w-full gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <li key={f.title} className={`${panel} p-4`}>
            <h2 className="text-sm font-bold uppercase tracking-[0.08em]" style={display}>
              {f.title}
            </h2>
            <p className="mt-1 text-sm text-(--dk-muted)">{f.body}</p>
          </li>
        ))}
      </ul>
      <div className="w-full max-w-2xl text-left">
        <PrivacyNote />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// B · Product split: the classic SaaS hero, with the real UI as the picture.
// ---------------------------------------------------------------------------
export function OptionProductSplit() {
  const day = [
    { time: "9:00 AM", tone: "coach" as const, line: "ALEX, I choose you! PIKACHU used Charge. Let's spark some focus!" },
    { time: "11:00 AM", tone: "coach" as const, line: "2 hours without a break! PIKACHU suggests a quick stretch." },
    { time: "5:00 PM", tone: "levelUp" as const, line: "That's enough, ALEX. 7.5h today, and you reached level 13!" },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <Eyebrow>For remote workers and students</Eyebrow>
          <h1 className="text-4xl font-bold uppercase leading-[1.05] tracking-[0.05em] sm:text-5xl" style={display}>
            Your hours,
            <br />
            logged in one press.
          </h1>
          <p className="max-w-lg text-lg text-(--dk-muted)">
            A timesheet you&apos;ll actually keep. Clock in with a Poké Ball, get coached by a new Pokémon every day, and level up
            your trainer as the hours add up.
          </p>
          <ul className="space-y-2 text-sm" style={mono}>
            <li>✓ Live timer, notes on every session</li>
            <li>✓ Forgot to clock in? Add time later</li>
            <li>✓ CSV timesheet for any week or range</li>
          </ul>
          <StartCta />
        </div>

        {/* The product as the picture, built from the real components. */}
        <div className="relative">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className={`${panel} flex flex-col gap-3 p-4 sm:col-span-2`}>
              <ClockStageDemo avatar={trainers[1]} autoplay />
              <WatchTimer elapsed="02:14:09" caption="since 9:00 AM · today 6 h 40 min" running />
            </div>
            <CoachCard number={25} name="Pikachu" types={["electric"]} sprite={PIKACHU} dateLabel="Tue, Oct 27" line="ALEX, I choose you! Let's spark some focus!" />
            <TrainerCard name="Alex" avatar={trainers[1]} level={12} xpIntoLevel={980} xpForNextLevel={1200} progress={980 / 1200} />
          </div>
        </div>
      </div>

      <section aria-labelledby="day-h" className="mt-16">
        <h2 id="day-h" className="text-sm font-bold uppercase tracking-[0.1em]" style={display}>
          A day with your coach
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

// ---------------------------------------------------------------------------
// C · Professor intro: the games' opening monologue, as a guided story.
// ---------------------------------------------------------------------------
export function OptionProfessorIntro() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <div className="grid items-end gap-8 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="flex justify-center gap-3 md:flex-col">
          {trainers.slice(0, 3).map((a, i) => (
            <div key={i} className="rounded-(--dk-r-md) border-2 border-(--dk-line) bg-(--dk-void) p-2">
              <TrainerAvatar avatar={a} size={44} />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <Eyebrow>Chapter 1 · A new trainer</Eyebrow>
          <h1 className="text-4xl font-bold uppercase leading-[1.05] tracking-[0.05em] sm:text-5xl" style={display}>
            Welcome to the world of timesheets!
          </h1>
          <TextBox speaker="Prof. Willow">
            Hello there! In this world, hours worked are tracked by trainers like you. Every live minute earns XP, and a different
            Pokémon coaches you each day.
          </TextBox>
          <TextBox speaker="Prof. Willow">First, tell me: what will you be training for?</TextBox>
          <Suspense fallback={<div className="h-11" aria-hidden />}>
            <div className="flex flex-wrap gap-3">
              <Show when="signed-out">
                <SignUpButton>
                  <Button className="min-w-44">▸ Remote work</Button>
                </SignUpButton>
                <SignUpButton>
                  <Button className="min-w-44">▸ Studying</Button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <StartCta />
              </Show>
            </div>
          </Suspense>
        </div>
      </div>

      <ol className="mt-14 grid gap-4 md:grid-cols-3">
        <li className={`${panel} space-y-3 p-4`}>
          <p className="text-xs text-(--dk-gold)" style={mono}>
            Step 1
          </p>
          <h2 className="text-sm font-bold uppercase tracking-[0.08em]" style={display}>
            Throw the ball
          </h2>
          <div className="origin-top-left scale-[0.8]">
            <ClockStageDemo avatar={trainers[2]} autoplay />
          </div>
        </li>
        <li className={`${panel} space-y-3 p-4`}>
          <p className="text-xs text-(--dk-gold)" style={mono}>
            Step 2
          </p>
          <h2 className="text-sm font-bold uppercase tracking-[0.08em]" style={display}>
            Meet today&apos;s coach
          </h2>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PIKACHU} alt="" width={64} height={64} className="[image-rendering:pixelated] brightness-0" />
            <div>
              <p className="text-sm" style={pixel}>
                Who&apos;s that Pokémon?
              </p>
              <p className="text-xs text-(--dk-muted)">A new one each day, from the original 151.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["electric", "fire", "water", "grass"].map((t) => (
              <TypeTag key={t} type={t} />
            ))}
          </div>
        </li>
        <li className={`${panel} space-y-3 p-4`}>
          <p className="text-xs text-(--dk-gold)" style={mono}>
            Step 3
          </p>
          <h2 className="text-sm font-bold uppercase tracking-[0.08em]" style={display}>
            Level up, send the sheet
          </h2>
          <TrainerCard name="Sam" avatar={trainers[2]} level={4} xpIntoLevel={210} xpForNextLevel={400} progress={210 / 400} />
          <p className="text-xs text-(--dk-muted)">Export any week as a CSV timesheet.</p>
        </li>
      </ol>
      <div className="mt-10">
        <PrivacyNote />
      </div>
    </div>
  );
}
