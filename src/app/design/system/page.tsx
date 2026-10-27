import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ds/Button";
import { ClockButton } from "@/components/ds/ClockButton";
import { ClockStageDemo } from "@/components/ds/ClockStageDemo";
import { CoachCard } from "@/components/ds/CoachCard";
import { Field } from "@/components/ds/Field";
import { fontVars } from "@/components/ds/fonts";
import { Segmented } from "@/components/ds/Segmented";
import { Skeleton } from "@/components/ds/Skeleton";
import { SwatchPicker } from "@/components/ds/SwatchPicker";
import { Badge, TypeTag, typeColors, tagText } from "@/components/ds/Tag";
import { TextBox } from "@/components/ds/TextBox";
import { avatarOptions, defaultAvatar, TrainerAvatar, type Avatar } from "@/components/ds/TrainerAvatar";
import { TrainerCard } from "@/components/ds/TrainerCard";
import { brightestGrassPixel, grassBackground } from "@/components/ds/textures";
import { colors, hex, paletteVars, radii, spacing } from "@/components/ds/tokens";
import { WatchTimer } from "@/components/ds/WatchTimer";
import { XpBar } from "@/components/ds/XpBar";
import { contrastRatio, formatRatio, wcagLevel } from "@/lib/contrast";
import { forcedStates, type ForcedState } from "@/lib/design-system";

export const metadata: Metadata = {
  title: "Dusk · Design System",
};

const mono = { fontFamily: "var(--dp-mono)" };
const display = { fontFamily: "var(--dp-display)" };

function Section({ n, id, title, caption, children }: { n: number; id: string; title: string; caption?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="min-w-0">
      <h2 id={`${id}-h`} className="flex items-baseline gap-3 text-sm font-bold uppercase tracking-[0.08em]" style={display}>
        <span className="text-(--dk-muted)" style={mono}>
          {String(n).padStart(2, "0")}
        </span>
        {title}
      </h2>
      {caption && <p className="mt-1 text-sm text-(--dk-muted)">{caption}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const surfaces = { void: hex("--dk-void"), panel: hex("--dk-panel"), red: hex("--dk-red"), lcd: hex("--dk-lcd") };

function ColorSection() {
  return (
    <Section n={1} id="color" title="Color" caption="One job per colour. Ratios are computed against the surface each colour sits on.">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {colors.map((c) => {
          const bg = surfaces[c.on];
          const ratio = contrastRatio(c.hex, bg);
          const isSurface = c.role.startsWith("Background") || c.role.startsWith("Surface") || c.role === "Divider";
          return (
            <li key={c.token} className="overflow-hidden rounded-(--dk-r-md) border-2 border-(--dk-line) bg-(--dk-panel)">
              <div className="h-10" style={{ background: c.hex }} />
              <div className="space-y-0.5 p-2 text-[12px] leading-snug">
                <p className="font-bold" style={display}>
                  {c.name} <span className="font-normal text-(--dk-muted)">· {c.role}</span>
                </p>
                <p style={mono}>{c.hex}</p>
                <p className="text-(--dk-muted)">{c.purpose}</p>
                {!isSurface && (
                  <p style={mono} className={wcagLevel(ratio) === "Fail" ? "text-(--dk-ember)" : "text-(--dk-ice)"}>
                    {formatRatio(ratio)} on {c.on} · {wcagLevel(ratio)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex items-center gap-3 rounded-(--dk-r-md) border-2 border-(--dk-line) bg-(--dk-panel) p-2">
        <span className="size-16 shrink-0 rounded-(--dk-r-sm) border-2 border-(--dk-line)" style={grassBackground} />
        <p className="text-[12px] leading-snug" style={mono}>
          <span className="font-bold">Tall grass · page background</span>
          <br />
          <span className="text-(--dk-muted)">
            Brightest blade {brightestGrassPixel()}: muted {formatRatio(contrastRatio(hex("--dk-muted"), brightestGrassPixel()))}, ice{" "}
            {formatRatio(contrastRatio(hex("--dk-ice"), brightestGrassPixel()))}, sky {formatRatio(contrastRatio(hex("--dk-sky"), brightestGrassPixel()))}
          </span>
        </p>
      </div>
      <p className="mt-3 text-[12px] text-(--dk-muted)" style={mono}>
        Clock button label: void on red {formatRatio(contrastRatio(hex("--dk-void"), hex("--dk-red")))} · LCD digits{" "}
        {formatRatio(contrastRatio(hex("--dk-lcd-ink"), hex("--dk-lcd")))}
      </p>
    </Section>
  );
}

function TypeSection() {
  const rows: [string, string, ReactNode][] = [
    ["Display", "Oxanium · 32 · 700", <span key="d" className="text-[32px] font-bold uppercase leading-none tracking-[0.06em]" style={display}>Clock in</span>],
    ["Heading", "Oxanium · 20 · 700", <span key="h" className="text-xl font-bold uppercase tracking-[0.04em]" style={display}>This week</span>],
    ["Body", "Exo 2 · 16 · 400", <span key="b" className="text-base">You worked 6 h 40 m today.</span>],
    ["Numbers", "JetBrains Mono · 14 · 400", <span key="n" className="text-sm tabular-nums" style={mono}>9:05 AM – 3:45 PM · 6.67 h</span>],
    ["Game voice", "Silkscreen · 16 · 400", <span key="p" className="text-base" style={{ fontFamily: "var(--dp-pixel)" }}>PIKACHU is fired up!</span>],
    ["Label", "JetBrains Mono · 12 · 700 · caps", <span key="l" className="text-xs font-bold uppercase tracking-[0.08em] text-(--dk-muted)" style={mono}>Starts on</span>],
  ];
  return (
    <Section n={2} id="type" title="Type" caption="Neon Arcade's three faces, plus Silkscreen only for things the coach or the game says.">
      <ul className="divide-y-2 divide-(--dk-line) rounded-(--dk-r-md) border-2 border-(--dk-line)">
        {rows.map(([role, spec, sample]) => (
          <li key={role} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-3 py-2.5">
            {sample}
            <span className="text-[12px] text-(--dk-muted)" style={mono}>
              {role} · {spec}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function SpacingSection() {
  return (
    <Section n={3} id="spacing" title="Spacing & shape" caption="4px base. Soft corners by size. 2px lines, 3px focus.">
      <div className="space-y-1.5">
        {spacing.map((px) => (
          <div key={px} className="flex items-center gap-3 text-[12px]" style={mono}>
            <span className="w-8 text-right text-(--dk-muted)">{px}</span>
            <span className="h-3 rounded-[2px] bg-(--dk-diamond)" style={{ width: px * 3 }} />
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-4">
        {radii.map((r) => (
          <div key={r.token} className="flex flex-col items-center gap-1.5 text-center text-[12px]" style={mono}>
            <span className="size-14 border-2 border-(--dk-edge) bg-(--dk-panel)" style={{ borderRadius: r.px }} />
            {r.px}px
            <span className="max-w-24 text-(--dk-muted)">{r.use}</span>
          </div>
        ))}
        <div className="flex flex-col items-center gap-1.5 text-center text-[12px]" style={mono}>
          <span className="size-14 rounded-full border-4 border-[#05070d] bg-(--dk-red)" />
          round
          <span className="max-w-24 text-(--dk-muted)">Clock button only</span>
        </div>
      </div>
      <div className="mt-5 space-y-2 text-[12px]" style={mono}>
        <div className="flex items-center gap-3">
          <span className="h-0.5 w-16 bg-(--dk-line)" /> 2px line · dividers
        </div>
        <div className="flex items-center gap-3">
          <span className="h-0.5 w-16 bg-(--dk-edge)" /> 2px edge · controls
        </div>
        <div className="flex items-center gap-3">
          <span className="h-[3px] w-16 bg-(--dk-sky)" /> 3px sky · focus
        </div>
        <div className="flex items-center gap-3">
          <span className="h-3 w-16 rounded-[2px] border-2 border-(--dk-diamond) shadow-[0_0_4px_var(--dk-diamond),0_0_14px_color-mix(in_srgb,var(--dk-diamond)_50%,transparent)]" /> glow · hover, focus, selected only
        </div>
      </div>
    </Section>
  );
}

const sampleAvatars: Avatar[] = [
  defaultAvatar,
  { skin: avatarOptions.skin[4], hair: "long", hairColor: avatarOptions.hairColor[0], hat: "none", hatColor: avatarOptions.color[0], outfit: avatarOptions.color[3] },
  { skin: avatarOptions.skin[0], hair: "bun", hairColor: avatarOptions.hairColor[5], hat: "beanie", hatColor: avatarOptions.color[4], outfit: avatarOptions.color[6] },
  { skin: avatarOptions.skin[2], hair: "short", hairColor: avatarOptions.hairColor[2], hat: "beanie", hatColor: avatarOptions.color[2], outfit: avatarOptions.color[5] },
];

function ComponentsSection() {
  return (
    <Section n={4} id="components" title="Components" caption="Live: every control here works.">
      <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-4 rounded-(--dk-r-lg) border-2 border-(--dk-line) p-4">
          <ClockStageDemo avatar={sampleAvatars[1]} />
          <p className="max-w-56 text-center text-[12px] text-(--dk-muted)" style={mono}>
            Clock stage · press the ball: the trainer comes out, press again to recall them
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <WatchTimer elapsed="03:42:15" caption="since 9:05 AM" running />
          <TrainerCard name="Jacob" avatar={defaultAvatar} level={12} xpIntoLevel={640} xpForNextLevel={1200} progress={640 / 1200} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CoachCard
          number={25}
          name="PIKACHU"
          types={["electric"]}
          sprite="/mood-board/sprite-25.png"
          dateLabel="Tue Oct 27"
          line={<>Zap! Let&apos;s charge through that inbox, Jacob!</>}
        />
        <div className="flex flex-col gap-3">
          <TextBox tone="levelUp" speaker="Level up">
            Jacob grew to Lv. 13!
          </TextBox>
          <TextBox tone="success" speaker="Saved">
            Clocked out. 7 h 32 m logged today.
          </TextBox>
          <TextBox tone="error" speaker="Can't reach the Pokédex">
            Your hours are still saved. Today&apos;s coach will be back soon.
          </TextBox>
        </div>
      </div>

      <div className="mt-4 grid gap-4 rounded-(--dk-r-lg) border-2 border-(--dk-line) p-4 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Segmented
            label="Log range"
            options={[
              { value: "1w", label: "1 week" },
              { value: "2w", label: "2 weeks" },
              { value: "custom", label: "Custom" },
            ]}
          />
          <div className="flex flex-wrap items-end gap-3">
            <Segmented
              label="The date you pick is the"
              options={[
                { value: "end", label: "End" },
                { value: "start", label: "Start" },
              ]}
            />
            <Field label="End date" type="date" defaultValue="2026-10-23" className="w-44" />
          </div>
          <p className="text-[12px] text-(--dk-muted)" style={mono}>
            → Sat 10/17 – Fri 10/23 · 7 days
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Clock in</Button>
            <Button>Generate log</Button>
            <Button variant="ghost">Download CSV</Button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Field label="Trainer name" defaultValue="Jacob" hint="Shown on your trainer card and in the coach's lines." />
          <SwatchPicker label="Outfit" colors={avatarOptions.color} names={["Red", "Blue", "Green", "Yellow", "Purple", "Black", "White"]} />
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.keys(typeColors).slice(0, 8).map((t) => (
              <TypeTag key={t} type={t} />
            ))}
            <Badge kind="new">New</Badge>
            <Badge kind="level">Lv 13</Badge>
          </div>
          <XpBar progress={0.72} label="72% to the next level" />
        </div>
      </div>

      <div className="mt-4 rounded-(--dk-r-lg) border-2 border-(--dk-line) p-4">
        <p className="mb-3 text-[12px] text-(--dk-muted)" style={mono}>
          Trainer avatar · skin, hair, hair colour, hat, hat colour, outfit
        </p>
        <div className="flex flex-wrap items-end gap-6">
          {sampleAvatars.map((a, i) => (
            <TrainerAvatar key={i} avatar={a} size={64} label={`Sample trainer ${i + 1}`} />
          ))}
        </div>
      </div>
    </Section>
  );
}

type Row = { name: string; states: readonly ForcedState[]; render: (s: ForcedState) => ReactNode };
const noSelect = ["rest", "hover", "focus", "pressed", "disabled"] as const;

const stateRows: Row[] = [
  { name: "Clock button", states: noSelect, render: (s) => <ClockButton running={false} size="sm" force={s} /> },
  { name: "Primary", states: noSelect, render: (s) => <Button variant="primary" size="sm" force={s}>Clock in</Button> },
  { name: "Secondary", states: noSelect, render: (s) => <Button size="sm" force={s}>Generate</Button> },
  { name: "Ghost", states: noSelect, render: (s) => <Button variant="ghost" size="sm" force={s}>CSV</Button> },
  {
    name: "Segment",
    states: forcedStates,
    render: (s) => (
      <Segmented
        label={`Segment ${s}`}
        options={[
          { value: "a", label: "1 wk" },
          { value: "b", label: "2 wk" },
        ]}
        defaultValue={s === "selected" ? "b" : "a"}
        force={s}
        forceOn="b"
      />
    ),
  },
  { name: "Field", states: ["rest", "hover", "focus", "disabled"], render: (s) => <Field label={`Date ${s}`} hideLabel type="date" defaultValue="2026-10-23" force={s} className="w-36" /> },
  {
    name: "Swatch",
    states: forcedStates,
    render: (s) => <SwatchPicker label={`Swatch ${s}`} hideLegend colors={["#2f53ff"]} force={s} forceIndex={0} value={s === "selected" ? "#2f53ff" : ""} />,
  },
];

function StatesSection() {
  return (
    <Section n={5} id="states" title="Control states" caption="Frozen specimens. Glow appears only on hover, focus and selection.">
      <div className="relative overflow-x-auto rounded-(--dk-r-md) border-2 border-(--dk-line)">
        <table inert className="w-full min-w-[44rem] text-left">
          <thead>
            <tr className="border-b-2 border-(--dk-line)">
              <th className="px-3 py-2 text-[12px] font-normal uppercase tracking-[0.06em] text-(--dk-muted)" style={mono}>
                Control
              </th>
              {forcedStates.map((s) => (
                <th key={s} className="px-3 py-2 text-[12px] font-normal uppercase tracking-[0.06em] text-(--dk-muted)" style={mono}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stateRows.map((row) => (
              <tr key={row.name} className="border-b-2 border-(--dk-line) last:border-0">
                <th scope="row" className="px-3 py-3 text-[12px] font-bold uppercase tracking-[0.06em]" style={mono}>
                  {row.name}
                </th>
                {forcedStates.map((s) => (
                  <td key={s} className="px-3 py-3 align-middle">
                    {row.states.includes(s) ? row.render(s) : <span className="text-(--dk-muted)">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function UiStatesSection() {
  return (
    <Section n={6} id="ui-states" title="UI states" caption="Clocking in never waits on the API; only the coach does.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-2 rounded-(--dk-r-lg) border-2 border-(--dk-line) p-3">
          <span className="self-start"><Badge kind="new">Empty</Badge></span>
          <p className="font-bold" style={display}>No hours yet</p>
          <p className="text-sm text-(--dk-muted)">Your log fills in as you clock in. Today&apos;s coach is ready when you are.</p>
          <Button variant="primary" size="sm">Clock in</Button>
        </div>
        <div className="flex flex-col gap-2 rounded-(--dk-r-lg) border-2 border-(--dk-line) p-3" aria-busy="true">
          <span className="text-[12px] uppercase tracking-[0.08em] text-(--dk-muted)" style={mono}>Loading coach…</span>
          <div className="flex items-center gap-3">
            <Skeleton className="size-16" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="flex flex-col gap-2 rounded-(--dk-r-lg) border-2 border-(--dk-line) p-3">
          <TextBox tone="error" speaker="Can't reach the Pokédex">
            The coach is resting. Your hours are safe.
          </TextBox>
          <Button size="sm">Try again</Button>
        </div>
        <div className="flex flex-col gap-2 rounded-(--dk-r-lg) border-2 border-(--dk-line) p-3">
          <TextBox tone="success" speaker="Saved">
            Clocked out at 5:31 PM. 8.0 h today.
          </TextBox>
          <TextBox tone="coach" speaker="Pikachu">
            Shocking work today, Jacob!
          </TextBox>
        </div>
      </div>
      <p className="mt-3 text-[12px] text-(--dk-muted)" style={mono}>
        Type tags pick white or void text by contrast (e.g. fire {tagText(typeColors.fire)}, electric {tagText(typeColors.electric)}).
      </p>
    </Section>
  );
}

export default function DuskDesignSystem() {
  return (
    <div
      style={{ ...paletteVars, ...grassBackground }}
      className={`${fontVars} flex-1 bg-(--dk-void) text-(--dk-ice) [color-scheme:dark] selection:bg-(--dk-sky) selection:text-(--dk-void)`}
    >
      <main className="mx-auto w-full max-w-[88rem] px-4 py-8 sm:px-8 sm:py-10" style={{ fontFamily: "var(--dp-body)" }}>
        <header className="flex flex-col gap-3 border-b-2 border-(--dk-line) pb-6">
          <Link href="/design/mood-board" className="self-start text-sm text-(--dk-diamond) underline underline-offset-4 hover:text-(--dk-ice) focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-(--dk-sky)" style={mono}>
            ← Mood board
          </Link>
          <h1 className="text-2xl font-bold uppercase leading-tight tracking-[0.06em] sm:text-[2rem]" style={display}>
            <span style={{ textShadow: "0 0 6px var(--dk-sky), 0 0 20px color-mix(in srgb, var(--dk-sky) 55%, transparent)" }}>Dusk</span>
            <span className="text-(--dk-muted)"> · </span>Design System
          </h1>
          <p className="max-w-2xl text-(--dk-muted)">
            Neon Arcade&apos;s neon over the games&apos; tall grass at dusk. The watch red is the one accent, worn by the
            Poké Ball clock button; the coach speaks in the game&apos;s text box.
          </p>
        </header>
        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
          <div className="flex min-w-0 flex-col gap-10">
            <ColorSection />
            <TypeSection />
            <SpacingSection />
          </div>
          <div className="flex min-w-0 flex-col gap-10">
            <ComponentsSection />
          </div>
        </div>
        {/* Full width: the states table needs room for six columns. */}
        <div className="mt-12 flex min-w-0 flex-col gap-10">
          <StatesSection />
          <UiStatesSection />
        </div>
      </main>
    </div>
  );
}
