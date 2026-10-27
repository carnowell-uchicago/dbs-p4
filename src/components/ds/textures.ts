import type { CSSProperties } from "react";

// The page background: the games' tall grass, at dusk. A 16 × 16 pixel tile (two tufts,
// offset like bricks) drawn as SVG, scaled 4× with hard edges, under a navy wash.
// Colours are chosen so every text colour still passes AA on the brightest grass pixel
// (muted on a blade tip ≈ 5.4:1); panels sit on top as solid surfaces.
//   . base   d shadow   m blade   l lit blade   t blade tip
const tuft = [
  "..t....t",
  ".tl...tl",
  ".lm.t.lm",
  "lmm.lmlm",
  "lmmdlmmm",
  "mmmdmmmd",
  "mmddmmdd",
  "dddddddd",
];

export const grassColors = {
  ".": "#08161c",
  d: "#0b2222",
  m: "#10322a",
  l: "#164532",
  t: "#1c5838",
} as const;

// Two rows of tufts; the second row is shifted by half a tuft (4px), like bricks, so the
// grass doesn't read as a grid.
const tile = Array.from({ length: 16 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => (y < 8 ? tuft[y][x % 8] : tuft[y - 8][(x + 4) % 8])).join(""),
);

function tileSvg(): string {
  const rects = tile
    .flatMap((row, y) =>
      [...row].map((ch, x) => (ch === "." ? "" : `<rect x='${x}' y='${y}' width='1' height='1' fill='${grassColors[ch as keyof typeof grassColors]}'/>`)),
    )
    .join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' shape-rendering='crispEdges'><rect width='16' height='16' fill='${grassColors["."]}'/>${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// Navy wash (the Void colour at 45%) keeps the grass quiet so neon and text stand out.
export const WASH = "rgb(11 17 48 / 0.45)";

export const grassBackground: CSSProperties = {
  backgroundColor: grassColors["."],
  backgroundImage: `linear-gradient(${WASH}, ${WASH}), ${tileSvg()}`,
  backgroundSize: "auto, 64px 64px",
  imageRendering: "pixelated",
};

// The brightest pixel the page can show (a blade tip under the wash), for the contrast check.
export function brightestGrassPixel(): string {
  const mix = (a: string, b: string, t: number) =>
    "#" +
    [1, 3, 5]
      .map((i) => Math.round(t * parseInt(a.slice(i, i + 2), 16) + (1 - t) * parseInt(b.slice(i, i + 2), 16)).toString(16).padStart(2, "0"))
      .join("");
  return mix("#0b1130", grassColors.t, 0.45);
}
