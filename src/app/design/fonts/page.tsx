import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  DotGothic16,
  Doto,
  Handjet,
  Jersey_15,
  Kode_Mono,
  Pixelify_Sans,
  Press_Start_2P,
  Silkscreen,
  Tiny5,
  VT323,
} from "next/font/google";
import { fontVars } from "@/components/ds/fonts";
import { TextBox } from "@/components/ds/TextBox";
import { paletteVars } from "@/components/ds/tokens";

export const metadata: Metadata = { title: "Pixel font options · Dusk" };

// Candidates for the "game voice" (what the coach and the game say). Loaded only on
// this page. Every one is a Google Font.
const pixelify = Pixelify_Sans({ subsets: ["latin"] });
const vt323 = VT323({ subsets: ["latin"], weight: "400" });
const silkscreen = Silkscreen({ subsets: ["latin"], weight: "400" });
const pressStart = Press_Start_2P({ subsets: ["latin"], weight: "400" });
const dotGothic = DotGothic16({ subsets: ["latin"], weight: "400" });
const jersey = Jersey_15({ subsets: ["latin"], weight: "400" });
const tiny5 = Tiny5({ subsets: ["latin"], weight: "400" });
const handjet = Handjet({ subsets: ["latin"] });
const doto = Doto({ subsets: ["latin"], weight: "700" });
const kodeMono = Kode_Mono({ subsets: ["latin"] });

const options = [
  { name: "Pixelify Sans", family: pixelify.style.fontFamily, size: 18, note: "Previous choice. At text size its 5 and S look alike (\"7.5\" reads as \"7.S\"), and the stepped strokes blur a, e and s." },
  { name: "VT323", family: vt323.style.fontFamily, size: 24, note: "Old terminal font. Tall, thin and very clear; needs a larger size (24px) because it's small for its size." },
  { name: "DotGothic16", family: dotGothic.style.fontFamily, size: 18, note: "Based on Japanese handheld-era bitmap fonts: the closest to the real games' text box. Thin, airy and clear; 5 and S stay distinct." },
  { name: "Jersey 15", family: jersey.style.fontFamily, size: 22, note: "Chunky, condensed pixel sans with a big x-height. Easy to read in short lines." },
  { name: "Tiny5", family: tiny5.style.fontFamily, size: 20, note: "A 5-pixel-tall bitmap face. Crisp and bold, but like Pixelify its 5 and S are hard to tell apart." },
  { name: "Silkscreen (chosen)", family: silkscreen.style.fontFamily, size: 16, note: "Chosen. Very crisp, but lower case is drawn as small capitals, so sentences read as all caps." },
  { name: "Press Start 2P", family: pressStart.style.fontFamily, size: 14, note: "The classic arcade look. Wide and heavy; tiring in more than a few words." },
  { name: "Handjet", family: handjet.style.fontFamily, size: 22, note: "Pixel grid with rounded dots and many weights. Modern and friendly." },
  { name: "Doto", family: doto.style.fontFamily, size: 20, note: "Dot-matrix, like an LCD. Fun for numbers, harder for long text." },
  { name: "Kode Mono (smooth)", family: kodeMono.style.fontFamily, size: 18, note: "Not pixel: a smooth mono with square, techy shapes. The most readable fallback." },
];

const lines = [
  "The quick brown fox jumps over the lazy dog.",
  "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG!",
  "0123456789  7.5 h · 9:05 AM · Lv. 13 · 100% ?",
];

const mono = { fontFamily: "var(--dp-mono)" };

export default function FontOptions() {
  return (
    <div style={paletteVars} className={`${fontVars} flex-1 bg-(--dk-void) text-(--dk-ice) [color-scheme:dark]`}>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10" style={{ fontFamily: "var(--dp-body)" }}>
        <header className="flex flex-col gap-3 border-b-2 border-(--dk-line) pb-6">
          <Link href="/design/system" className="self-start text-sm text-(--dk-diamond) underline underline-offset-4 hover:text-(--dk-ice)" style={mono}>
            ← Design system
          </Link>
          <h1 className="text-2xl font-bold uppercase tracking-[0.06em] sm:text-[2rem]" style={{ fontFamily: "var(--dp-display)" }}>
            Game-voice font options
          </h1>
          <p className="max-w-2xl text-(--dk-muted)">
            Each Google Font is shown in the coach&apos;s text box at the size it reads best, then with every letter
            (lower and upper case) and every digit.
          </p>
        </header>

        <ol className="mt-8 grid gap-4 md:grid-cols-2">
          {options.map((o, i) => (
            <li key={o.name} className="flex flex-col gap-3 rounded-(--dk-r-lg) border-2 border-(--dk-line) bg-(--dk-panel) p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-bold" style={{ fontFamily: "var(--dp-display)" }}>
                  <span className="text-(--dk-muted)" style={mono}>
                    {String(i + 1).padStart(2, "0")}{" "}
                  </span>
                  {o.name}
                </h2>
                <span className="shrink-0 text-[12px] text-(--dk-muted)" style={mono}>
                  {o.size}px
                </span>
              </div>
              <p className="text-sm text-(--dk-muted)">{o.note}</p>
              {/* Override the text box's pixel font for this sample. */}
              <div style={{ "--dp-pixel": o.family, fontSize: o.size } as CSSProperties} className="[&_.text-lg]:text-[length:inherit]">
                <TextBox speaker="Pikachu">
                  PIKACHU used Thunderbolt! You&apos;ve logged 7.5 hours today, Jacob. Great job!
                </TextBox>
              </div>
              <div className="space-y-1 rounded-(--dk-r-md) bg-(--dk-ball) px-3 py-2 text-(--dk-void)" style={{ fontFamily: o.family, fontSize: o.size }}>
                {lines.map((l) => (
                  <p key={l} className="leading-snug">
                    {l}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
