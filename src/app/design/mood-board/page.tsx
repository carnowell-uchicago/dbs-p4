import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { fontVars } from "../fonts";
import { references, sprites } from "./references";

export const metadata: Metadata = {
  title: "Mood board · Neon Arcade × Diamond/Pearl daytime",
};

// Candidate colours, sampled from the references and tuned. Nothing here is
// final; the design system picks from these.
const day = {
  "--dp-sky": "#5ce3ff", // battle-screen sky (sampled)
  "--dp-sky-pale": "#e9fbff", // page background candidate
  "--dp-cloud": "#ffffff", // text boxes
  "--dp-ink": "#0f1e3a", // text: deep navy, never pure black
  "--dp-muted": "#4b6a86",
  "--dp-line": "#bfe6f0", // dividers
  "--dp-edge": "#296798", // control edges (sampled button edge)
  "--dp-diamond": "#2f53ff", // watch frame blue (sampled)
  "--dp-pearl": "#d98cc8",
  "--dp-hp": "#57ea51", // HP bar green (sampled)
  "--dp-grass": "#2f8f3a", // a green dark enough for text
  "--dp-red": "#ff3939", // watch button red (sampled)
  "--dp-gold": "#e0b84a", // logo gold: earned things
  "--dp-lcd": "#74b774", // watch LCD (sampled)
  "--dp-lcd-ink": "#36542e", // LCD digits (sampled)
};
const dusk = {
  "--dk-void": "#0b1130",
  "--dk-panel": "#141c44",
  "--dk-road": "#3a3e6d", // night street (sampled)
  "--dk-ice": "#eafcff",
  "--dk-diamond": "#6f8cff",
  "--dk-pearl": "#ff9bd8",
  "--dk-lcd": "#8ff08f",
};

const display = { fontFamily: "var(--dp-display)" };
const body = { fontFamily: "var(--dp-body)" };
const mono = { fontFamily: "var(--dp-mono)" };
const pixel = { fontFamily: "var(--dp-pixel)" };

type Tile = { id: string; label: string; content: ReactNode };

function Caption({ children }: { children: ReactNode }) {
  return (
    <span className="text-xs uppercase tracking-[0.08em] text-(--dp-muted)" style={mono}>
      {children}
    </span>
  );
}

function Swatches({
  title,
  dark = false,
  items,
}: {
  title: string;
  dark?: boolean;
  items: [string, string, string][];
}) {
  return (
    <div className={`p-3 ${dark ? "bg-(--dk-void)" : ""}`}>
      <p
        className={`mb-2 text-sm font-bold ${dark ? "text-(--dk-ice)" : "text-(--dp-ink)"}`}
        style={display}
      >
        {title}
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {items.map(([name, hex, use]) => (
          <div key={name}>
            <div
              className="h-10 rounded-[4px] border-2 border-black/10"
              style={{ background: hex }}
            />
            <p
              className={`mt-1 text-[12px] leading-tight ${dark ? "text-(--dk-ice)" : "text-(--dp-ink)"}`}
              style={mono}
            >
              {name}
              <br />
              <span className={dark ? "text-(--dk-ice)/70" : "text-(--dp-muted)"}>
                {hex}
              </span>
            </p>
            <p className={`text-[12px] leading-tight ${dark ? "text-(--dk-ice)/70" : "text-(--dp-muted)"}`}>
              {use}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function XpBar({ pct, tone = "var(--dp-hp)" }: { pct: number; tone?: string }) {
  return (
    <div className="h-3 w-full rounded-[3px] border-2 border-(--dp-ink) bg-(--dp-ink)/10">
      <div className="h-full rounded-[1px]" style={{ width: `${pct}%`, background: tone }} />
    </div>
  );
}

function PokeBall({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
      <path d="M4 50h34M62 50h34" stroke="currentColor" strokeWidth="6" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="6" />
    </svg>
  );
}

const tiles: Tile[] = [
  {
    id: "palette-day",
    label: "Palette A · Town at noon (light)",
    content: (
      <Swatches
        title="Daylight: neon lines on a bright sky"
        items={[
          ["Sky pale", day["--dp-sky-pale"], "Page"],
          ["Cloud", day["--dp-cloud"], "Boxes"],
          ["Ink", day["--dp-ink"], "Text"],
          ["Sky", day["--dp-sky"], "Glow, header"],
          ["Diamond", day["--dp-diamond"], "Focus, links"],
          ["Watch red", day["--dp-red"], "Clock in?"],
          ["HP green", day["--dp-hp"], "XP fill"],
          ["Gold", day["--dp-gold"], "Level up"],
          ["Edge", day["--dp-edge"], "Control edges"],
        ]}
      />
    ),
  },
  {
    id: "type",
    label: "Type: Neon Arcade's faces, kept",
    content: (
      <div className="space-y-2 p-4">
        <p className="text-3xl font-bold uppercase tracking-wider text-(--dp-ink)" style={display}>
          Clock in
        </p>
        <p className="text-sm text-(--dp-muted)" style={mono}>
          Oxanium · display, buttons
        </p>
        <p className="text-base text-(--dp-ink)" style={body}>
          You worked 6 h 40 m today. Pikachu earned 400 XP.
        </p>
        <p className="text-sm text-(--dp-muted)" style={mono}>
          Exo 2 · reading
        </p>
        <p className="text-2xl tabular-nums text-(--dp-ink)" style={mono}>
          07:42:15
        </p>
        <p className="text-sm text-(--dp-muted)" style={mono}>
          JetBrains Mono · times, hours
        </p>
        <p className="text-xl text-(--dp-ink)" style={pixel}>
          Eevee grew to Lv. 13!
        </p>
        <p className="text-sm text-(--dp-muted)" style={mono}>
          Pixelify Sans · candidate for game moments only
        </p>
      </div>
    ),
  },
  {
    id: "lcd-timer",
    label: "Hero idea: the running clock as a watch",
    content: (
      <div className="flex items-stretch gap-2 bg-(--dp-diamond) p-3">
        <div className="flex-1 rounded-[6px] border-4 border-black bg-(--dp-lcd) p-3">
          <p className="text-xs uppercase tracking-[0.08em] text-(--dp-lcd-ink)" style={mono}>
            On the clock
          </p>
          <p
            className="text-4xl font-bold tabular-nums text-(--dp-lcd-ink)"
            style={{ ...pixel, letterSpacing: "0.04em" }}
          >
            03:42
            <span className="text-2xl">:15</span>
          </p>
          <p className="text-xs text-(--dp-lcd-ink)" style={mono}>
            since 9:05 AM
          </p>
        </div>
        <div className="flex w-16 flex-col items-center justify-center gap-1">
          <span className="flex h-20 w-10 items-center justify-center rounded-full border-4 border-black bg-(--dp-red) shadow-[inset_0_6px_0_#ff7573]" />
          <span className="text-xs font-bold text-white" style={display}>
            OUT
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "buttons-day",
    label: "Clock in button: rest, hover glow, pressed",
    content: (
      <div className="grid grid-cols-3 gap-2 bg-(--dp-sky-pale) px-3 py-5">
        {[
          ["Rest", "border-(--dp-edge) bg-(--dp-red) text-white"],
          [
            "Hover",
            "border-(--dp-ink) bg-[#ff5757] text-white shadow-[0_0_6px_var(--dp-sky),0_0_18px_var(--dp-sky)]",
          ],
          ["Pressed", "border-(--dp-ink) bg-[#d92a2a] text-white translate-y-px"],
        ].map(([state, cls]) => (
          <div key={state} className="flex flex-col items-center gap-2">
            <span
              className={`flex h-10 w-full items-center justify-center rounded-[6px] border-2 text-xs font-bold tracking-[0.08em] ${cls}`}
              style={display}
            >
              CLOCK IN
            </span>
            <Caption>{state}</Caption>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "glow-test",
    label: "Test: does neon glow survive daylight?",
    content: (
      <div className="grid grid-cols-2">
        <div className="flex flex-col items-center gap-2 bg-white p-4">
          <span
            className="rounded-[6px] border-2 border-(--dp-sky) px-3 py-2 text-sm font-bold text-(--dp-ink) shadow-[0_0_6px_var(--dp-sky),0_0_20px_var(--dp-sky)]"
            style={display}
          >
            ACTIVE
          </span>
          <Caption>Cyan on white: soft, washes out</Caption>
          <span
            className="rounded-[6px] border-2 border-(--dp-diamond) px-3 py-2 text-sm font-bold text-(--dp-diamond) shadow-[0_0_4px_var(--dp-diamond),0_0_16px_color-mix(in_srgb,var(--dp-diamond)_55%,transparent)]"
            style={display}
          >
            ACTIVE
          </span>
          <Caption>Diamond blue on white: holds</Caption>
        </div>
        <div className="flex flex-col items-center gap-2 bg-(--dk-void) p-4">
          <span
            className="rounded-[6px] border-2 border-(--dp-sky) px-3 py-2 text-sm font-bold text-(--dk-ice) shadow-[0_0_6px_var(--dp-sky),0_0_20px_var(--dp-sky)]"
            style={display}
          >
            ACTIVE
          </span>
          <span className="text-xs uppercase tracking-[0.08em] text-(--dk-ice)/70" style={mono}>
            Cyan at dusk: pure Neon Arcade
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "palette-dusk",
    label: "Palette B · Route at dusk (dark)",
    content: (
      <Swatches
        dark
        title="Dusk: Neon Arcade's dark, game colours as light"
        items={[
          ["Void", dusk["--dk-void"], "Page"],
          ["Panel", dusk["--dk-panel"], "Cards"],
          ["Road", dusk["--dk-road"], "Lines"],
          ["Ice", dusk["--dk-ice"], "Text"],
          ["Diamond", dusk["--dk-diamond"], "Focus"],
          ["Pearl", dusk["--dk-pearl"], "Badges"],
          ["LCD glow", dusk["--dk-lcd"], "XP, timer"],
          ["Sky", day["--dp-sky"], "Selection"],
          ["Watch red", day["--dp-red"], "Clock in"],
        ]}
      />
    ),
  },
  {
    id: "active-card",
    label: "Active Pokémon as a battle box",
    content: (
      <div className="bg-(--dp-sky) p-3">
        <div className="flex items-center gap-3 rounded-[6px] border-[3px] border-(--dp-ink) bg-(--dp-cloud) p-3">
          <Image
            src="/mood-board/sprite-25.png"
            alt=""
            width={67}
            height={66}
            className="[image-rendering:pixelated]"
          />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-bold uppercase text-(--dp-ink)" style={display}>
                Pikachu
              </p>
              <p className="text-sm text-(--dp-ink)" style={mono}>
                Lv 12
              </p>
            </div>
            <XpBar pct={64} />
            <p className="text-xs text-(--dp-muted)" style={mono}>
              320 / 500 XP · 1 h = 60 XP
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "xp-states",
    label: "XP bar: early, most of the way, ready to level",
    content: (
      <div className="space-y-3 bg-(--dp-cloud) p-4">
        {[
          [18, "var(--dp-hp)", "90 / 500"],
          [72, "var(--dp-hp)", "360 / 500"],
          [100, "var(--dp-gold)", "Level up!"],
        ].map(([pct, tone, text]) => (
          <div key={String(text)} className="flex items-center gap-3">
            <span className="w-8 text-xs font-bold text-(--dp-red)" style={mono}>
              XP
            </span>
            <XpBar pct={Number(pct)} tone={String(tone)} />
            <span className="w-24 shrink-0 whitespace-nowrap text-right text-xs text-(--dp-ink)" style={mono}>
              {text}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "daily",
    label: "Today's Pokémon: same for everyone",
    content: (
      <div className="relative overflow-hidden bg-linear-to-b from-(--dp-sky) to-(--dp-sky-pale) p-4 text-center">
        <PokeBall className="absolute -right-6 -top-6 h-28 w-28 text-white/60" />
        <p className="text-xs uppercase tracking-[0.08em] text-(--dp-ink)" style={mono}>
          Tue Oct 27 · #133
        </p>
        <Image
          src="/mood-board/sprite-133.png"
          alt=""
          width={126}
          height={129}
          className="mx-auto my-2 [image-rendering:pixelated]"
        />
        <p className="text-2xl font-bold uppercase tracking-wider text-(--dp-ink)" style={display}>
          Eevee
        </p>
        <p className="text-sm text-(--dp-ink)" style={body}>
          Day 47 of 151. Log in to add it to your team.
        </p>
      </div>
    ),
  },
  {
    id: "week-route",
    label: "A week as a route between towns",
    content: (
      <div className="bg-[#d3f9be] p-4">
        <svg viewBox="0 0 300 70" className="w-full" aria-hidden>
          <path d="M20 35H280" stroke="#9aa5ad" strokeWidth="10" strokeLinecap="round" />
          <path d="M20 35H280" stroke="white" strokeWidth="4" strokeLinecap="round" />
          {[
            ["Mon", 20, "7.5", "#ff3939"],
            ["Tue", 85, "8.0", "#ff3939"],
            ["Wed", 150, "6.2", "#ff3939"],
            ["Thu", 215, "—", "#2f53ff"],
            ["Fri", 280, "—", "#2f53ff"],
          ].map(([d, x, h, c]) => (
            <g key={String(d)}>
              <rect x={Number(x) - 10} y="25" width="20" height="20" fill={String(c)} stroke="#555" strokeWidth="2" />
              <text x={Number(x)} y="16" textAnchor="middle" fontSize="11" fill="#0f1e3a" fontFamily="var(--dp-mono)">
                {d}
              </text>
              <text x={Number(x)} y="62" textAnchor="middle" fontSize="11" fill="#0f1e3a" fontFamily="var(--dp-mono)">
                {h}
              </text>
            </g>
          ))}
        </svg>
        <p className="text-center text-xs text-(--dp-ink)" style={mono}>
          Red = worked · Blue = ahead · 21.7 h so far
        </p>
      </div>
    ),
  },
  {
    id: "timesheet",
    label: "Timesheet rows: plain, printable",
    content: (
      <div className="bg-(--dp-cloud) p-3">
        <table className="w-full text-left text-sm text-(--dp-ink)" style={mono}>
          <thead>
            <tr className="border-b-2 border-(--dp-ink) text-xs uppercase tracking-[0.08em]">
              <th className="py-1">Date</th>
              <th>In</th>
              <th>Out</th>
              <th className="text-right">Hours</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Mon 10/19", "9:02", "5:31", "7.98"],
              ["Tue 10/20", "8:47", "4:50", "7.55"],
              ["Wed 10/21", "9:15", "3:20", "5.58"],
            ].map((r) => (
              <tr key={r[0]} className="border-b border-(--dp-line)">
                {r.map((c, i) => (
                  <td key={i} className={`py-1 ${i === 3 ? "text-right tabular-nums" : ""}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="font-bold">
              <td className="py-1" colSpan={3}>
                Total
              </td>
              <td className="text-right">21.11</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "range",
    label: "Log range: 1 week, 2 weeks, custom; anchor start or end",
    content: (
      <div className="space-y-3 bg-(--dp-sky-pale) p-4">
        <div className="grid grid-cols-3 rounded-[6px] border-2 border-(--dp-edge) bg-white p-0.5 text-center text-xs font-bold" style={display}>
          <span className="rounded-[4px] bg-(--dp-diamond) py-1.5 text-white shadow-[0_0_8px_color-mix(in_srgb,var(--dp-diamond)_60%,transparent)]">
            1 WEEK
          </span>
          <span className="py-1.5 text-(--dp-ink)">2 WEEKS</span>
          <span className="py-1.5 text-(--dp-ink)">CUSTOM</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-(--dp-ink)" style={body}>
          <span className="rounded-[4px] border-2 border-(--dp-diamond) bg-white px-2 py-0.5 font-bold">Ends</span>
          <span className="rounded-[4px] border-2 border-(--dp-line) bg-white px-2 py-0.5 text-(--dp-muted)">Starts</span>
          <span style={mono} className="ml-auto rounded-[4px] border-2 border-(--dp-edge) bg-white px-2 py-0.5">
            Fri 10/23
          </span>
        </div>
        <p className="text-xs text-(--dp-muted)" style={mono}>
          → Sat 10/17 – Fri 10/23 · 7 days
        </p>
      </div>
    ),
  },
  {
    id: "lcd-palette",
    label: "Palette C · The watch's greens",
    content: (
      <div className="grid grid-cols-4">
        {[
          ["#0e1a0c", "Shell"],
          ["#36542e", "Digits"],
          ["#74b774", "Screen"],
          ["#a9d8a1", "Glare"],
        ].map(([hex, name]) => (
          <div key={hex} className="flex h-24 flex-col justify-end p-2" style={{ background: hex }}>
            <span className="text-[12px] leading-tight" style={{ ...mono, color: hex === "#a9d8a1" || hex === "#74b774" ? "#0e1a0c" : "#d8f2d2" }}>
              {name}
              <br />
              {hex}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "tags",
    label: "Type colours as project tags",
    content: (
      <div className="flex flex-wrap gap-2 bg-(--dp-cloud) p-4">
        {[
          ["Client A", "#3fa129", "Grass"],
          ["Deep work", "#2980ef", "Water"],
          ["Meetings", "#e62829", "Fire"],
          ["Study", "#fac000", "Electric", true],
          ["Admin", "#9fa19f", "Normal"],
        ].map(([t, c, type, darkText]) => (
          <span
            key={String(t)}
            className="rounded-[4px] border-2 border-black/30 px-2 py-0.5 text-xs font-bold uppercase"
            style={{ ...display, background: String(c), color: darkText ? "#0f1e3a" : "white" }}
            title={String(type)}
          >
            {t}
          </span>
        ))}
        <p className="w-full text-xs text-(--dp-muted)" style={mono}>
          Optional: maybe later
        </p>
      </div>
    ),
  },
  {
    id: "grid-sky",
    label: "Texture: Neon Arcade grid, drawn in daylight",
    content: (
      <div
        className="h-36"
        style={{
          background:
            "linear-gradient(#ffffff00 0 0), repeating-linear-gradient(0deg, #ffffff99 0 2px, transparent 2px 24px), repeating-linear-gradient(90deg, #ffffff99 0 2px, transparent 2px 24px), linear-gradient(#5ce3ff, #e9fbff)",
        }}
      />
    ),
  },
  {
    id: "lcd-texture",
    label: "Texture: LCD pixel grid",
    content: (
      <div
        className="flex h-32 items-center justify-center"
        style={{
          background:
            "repeating-linear-gradient(0deg, #36542e22 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, #36542e22 0 1px, transparent 1px 4px), #74b774",
        }}
      >
        <span className="text-5xl font-bold text-[#36542e]" style={pixel}>
          8.0h
        </span>
      </div>
    ),
  },
  {
    id: "levelup",
    label: "Level-up moment: the text box",
    content: (
      <div className="bg-(--dp-sky) p-3">
        <div className="flex rounded-[6px] border-[3px] border-(--dp-ink) bg-white">
          <span className="w-2 bg-(--dp-red)" />
          <p className="flex-1 p-3 text-lg leading-snug text-(--dp-ink)" style={pixel}>
            Pikachu grew to Lv. 13!
            <br />
            <span className="text-(--dp-muted)">12 h 30 m worked together.</span>
          </p>
          <span className="w-2 bg-(--dp-red)" />
        </div>
      </div>
    ),
  },
  {
    id: "api-down",
    label: "Error state in the same voice",
    content: (
      <div className="space-y-2 bg-(--dp-sky-pale) p-3">
        <div className="rounded-[6px] border-2 border-(--dp-red) bg-white p-3">
          <p className="text-sm font-bold text-(--dp-ink)" style={display}>
            Can&apos;t reach the Pokédex right now
          </p>
          <p className="text-sm text-(--dp-ink)" style={body}>
            Your hours are still being saved. Today&apos;s Pokémon will show up when it&apos;s back.
          </p>
          <span className="mt-2 inline-block rounded-[6px] border-2 border-(--dp-edge) px-3 py-1 text-xs font-bold text-(--dp-ink)" style={display}>
            TRY AGAIN
          </span>
        </div>
        <Caption>Clocking in never depends on the API</Caption>
      </div>
    ),
  },
  {
    id: "sprites",
    label: "Gen-4 sprites of the original 151, crisp",
    content: (
      <div className="grid grid-cols-3 items-end gap-2 bg-(--dp-cloud) p-3">
        {sprites.map((s) => (
          <Image
            key={s.id}
            src={`/mood-board/sprite-${s.id}.png`}
            alt=""
            width={s.id === 143 ? 64 : 48}
            height={s.id === 143 ? 69 : 50}
            className="mx-auto h-auto [image-rendering:pixelated]"
          />
        ))}
      </div>
    ),
  },
  {
    id: "time-of-day",
    label: "The game's day clock: a tint for each time",
    content: (
      <div className="grid grid-cols-4 text-center text-xs" style={mono}>
        {[
          ["Morning", "#ffd9a8", "#0f1e3a"],
          ["Day", "#5ce3ff", "#0f1e3a"],
          ["Evening", "#ff9a6a", "#0f1e3a"],
          ["Night", "#2a2f66", "#eafcff"],
        ].map(([t, bg, fg]) => (
          <div key={t} className="flex h-24 items-end justify-center pb-2" style={{ background: bg, color: fg }}>
            {t}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "parent",
    label: "The parent: Neon Arcade, unchanged",
    content: (
      <div className="flex flex-col items-center gap-3 bg-[#05070d] p-5">
        <span
          className="rounded-[6px] border-2 border-[#4df3ff] px-5 py-2 text-sm font-bold tracking-[0.08em] text-[#e6fbff] shadow-[0_0_10px_#4df3ff,0_0_24px_#4df3ff]"
          style={display}
        >
          PLAY
        </span>
        <span className="rounded-[6px] border-2 border-[#ff9a3c] bg-[#ff9a3c] px-5 py-2 text-sm font-bold tracking-[0.08em] text-[#05070d]" style={display}>
          PRIMARY
        </span>
        <span className="text-xs uppercase tracking-[0.08em] text-[#7f9bb3]" style={mono}>
          Keep: 2px lines, 4/6/10 corners, glow on hover/focus/selection only
        </span>
      </div>
    ),
  },
];

// References interleave with the built tiles so each idea sits near its source.
const order: (Tile | (typeof references)[number])[] = [
  references[0],
  tiles[0],
  tiles[2],
  tiles[1],
  references[2],
  tiles[3],
  tiles[4],
  tiles[6],
  tiles[5],
  references[1],
  tiles[8],
  tiles[7],
  tiles[16],
  references[3],
  tiles[9],
  tiles[11],
  tiles[10],
  tiles[12],
  tiles[15],
  tiles[14],
  tiles[17],
  tiles[18],
  tiles[19],
  tiles[13],
  tiles[20],
];

export default function MoodBoard() {
  return (
    <div
      style={{ ...day, ...dusk } as CSSProperties}
      className={`${fontVars} flex-1 bg-(--dp-sky-pale) text-(--dp-ink)`}
    >
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8 sm:py-14" style={body}>
        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.08em] text-(--dp-muted)" style={mono}>
            Mood board · before the design system
          </p>
          <h1
            className="text-4xl font-bold uppercase tracking-wider text-(--dp-ink) sm:text-6xl"
            style={{ ...display, textShadow: "0 0 6px var(--dp-sky), 0 0 22px var(--dp-sky)" }}
          >
            Neon Arcade at noon
          </h1>
          <p className="max-w-2xl text-lg">
            A spinoff of Neon Arcade for a work-hours log with a Pokémon companion. It keeps the
            firm lines, soft corners and glow-on-interaction, and swaps the dark grid for a handheld
            game&apos;s daytime palette: bright sky, white boxes, hard outlines, a green watch.
          </p>
          <p className="max-w-2xl text-sm text-(--dp-muted)">
            Three directions to react to: <b className="text-(--dp-ink)">A</b> light daytime,{" "}
            <b className="text-(--dp-ink)">B</b> dark dusk, <b className="text-(--dp-ink)">C</b> the
            watch&apos;s greens as an accent.
          </p>
        </header>

        <section aria-label="Artifacts" className="mt-10 columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
          {order.map((item, i) => {
            const isRef = "src" in item;
            return (
              <figure
                key={isRef ? item.src : item.id}
                className="mb-3 break-inside-avoid overflow-hidden rounded-[10px] border-2 border-(--dp-edge)/40 bg-white"
              >
                {isRef ? (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    loading={i === 0 ? "eager" : "lazy"}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-auto w-full"
                  />
                ) : (
                  <div>{item.content}</div>
                )}
                <figcaption className="flex gap-2 border-t-2 border-(--dp-line) px-3 py-2 text-xs uppercase tracking-[0.08em] text-(--dp-muted)" style={mono}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    {isRef ? "Ref · " : ""}
                    {item.label}
                  </span>
                </figcaption>
                {isRef && (
                  <p className="px-3 pb-3 text-sm text-(--dp-ink)" style={body}>
                    {item.note}
                  </p>
                )}
              </figure>
            );
          })}
        </section>

        <footer className="mt-12 border-t-2 border-(--dp-line) pt-6">
          <h2 className="text-xs uppercase tracking-[0.08em] text-(--dp-muted)" style={mono}>
            Image credits
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-(--dp-muted)">
            Reference images are research only and never appear in the app. Sprites are from
            PokéAPI&apos;s sprite set. Everything else is built in code. Pokémon and Pokémon character
            names are trademarks of Nintendo.
          </p>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {references.map((ref) => (
              <li key={ref.src} className="text-(--dp-muted)">
                <a href={ref.source} className="text-(--dp-ink) underline underline-offset-4 hover:text-(--dp-diamond)">
                  {ref.label}
                </a>
                {ref.author ? `, ${ref.author}` : ""} · {ref.license}
              </li>
            ))}
          </ul>
        </footer>
      </main>
    </div>
  );
}
