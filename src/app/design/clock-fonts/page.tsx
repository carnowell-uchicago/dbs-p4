// Which font should the watch's digits use? Each candidate is drawn in the real LCD
// colours with the digit pairs that are easy to mix up: 4/9, 5/S, 1/7, 0/8/6.
import type { Metadata } from "next";
import {
  DotGothic16,
  Doto,
  Handjet,
  Jersey_10,
  Micro_5,
  Press_Start_2P,
  Share_Tech_Mono,
  Silkscreen,
  Sixtyfour,
  VT323,
  Workbench,
} from "next/font/google";

export const metadata: Metadata = { title: "Clock font comparison · Dusk" };

const silkscreen = Silkscreen({ subsets: ["latin"], weight: ["400", "700"] });
const vt323 = VT323({ subsets: ["latin"], weight: "400" });
const pressStart = Press_Start_2P({ subsets: ["latin"], weight: "400" });
const jersey = Jersey_10({ subsets: ["latin"], weight: "400" });
const dotGothic = DotGothic16({ subsets: ["latin"], weight: "400" });
const shareTech = Share_Tech_Mono({ subsets: ["latin"], weight: "400" });
const doto = Doto({ subsets: ["latin"], weight: "900" });
const micro = Micro_5({ subsets: ["latin"], weight: "400" });
const handjet = Handjet({ subsets: ["latin"], weight: "700" });
const workbench = Workbench({ subsets: ["latin"] });
const sixtyfour = Sixtyfour({ subsets: ["latin"] });

const candidates = [
  { name: "Silkscreen (current)", font: silkscreen, note: "The game voice. Its 4 is a block on a stem, so it reads like a 9.", bold: true },
  { name: "VT323", font: vt323, note: "Old terminal pixels. Open 4, clear 1 vs 7. Tall and narrow." },
  { name: "Press Start 2P", font: pressStart, note: "The classic 8-bit arcade font. Very clear, but wide and heavy." },
  { name: "Jersey 10", font: jersey, note: "Pixel sports-scoreboard digits. Clear and compact." },
  { name: "DotGothic16", font: dotGothic, note: "Dot-matrix, like Japanese handhelds. Thin." },
  { name: "Share Tech Mono", font: shareTech, note: "Clean digital-watch monospace. Not pixel art, but very readable." },
  { name: "Doto", font: doto, note: "Round dot matrix, like an LCD segment display." },
  { name: "Micro 5", font: micro, note: "A tiny 5-pixel font scaled up. Chunky and charming." },
  { name: "Handjet", font: handjet, note: "Built from dots, adjustable. Condensed." },
  { name: "Workbench", font: workbench, note: "Retro-computer pixels with soft scanlines." },
  { name: "Sixtyfour", font: sixtyfour, note: "Commodore-64 style. Very legible, very wide." },
];

const samples = ["04:49:94", "05:55:85", "11:17:71", "08:06:30"];

export default function ClockFonts() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="neon-text text-2xl font-bold uppercase tracking-[0.06em]" style={{ fontFamily: "var(--dp-display)" }}>
        Clock digits: pick a font
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-(--dk-muted)">
        Each row is the real watch screen. Look at the 4 vs 9, 5 vs S, 1 vs 7, and 0 vs 8 vs 6. The game voice (text boxes) can stay
        Silkscreen; this only changes the numbers on the clock.
      </p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {candidates.map((c) => (
          <li key={c.name} className="neon-panel rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) p-4">
            <p className="text-sm font-bold uppercase tracking-[0.08em]" style={{ fontFamily: "var(--dp-display)" }}>
              {c.name}
            </p>
            <p className="mt-1 text-xs text-(--dk-muted)">{c.note}</p>
            <div className="mt-3 rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-[#05070d] p-2">
              <div className="rounded-[6px] bg-(--dk-lcd) px-4 py-3 text-(--dk-lcd-ink)">
                <p className={`${c.font.className} text-5xl leading-none tabular-nums ${c.bold ? "font-bold" : ""}`}>
                  04:49<span className="text-3xl">:94</span>
                </p>
                <p className={`${c.font.className} mt-2 flex flex-wrap gap-x-4 text-xl tabular-nums ${c.bold ? "font-bold" : ""}`}>
                  {samples.slice(1).map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </p>
                <p className={`${c.font.className} mt-1 text-xl tracking-[0.15em] ${c.bold ? "font-bold" : ""}`}>0123456789 S</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
