// The user's trainer: original pixel art (not game sprites), drawn as SVG rects on a
// 16 × 24 grid. Three layers are drawn in order (body, hair, hat), and each letter in
// a layer is a colour slot, so swapping a colour or a layer customizes the trainer.
//   . nothing   o outline   s skin   e eyes   t outfit   p trousers   k shoes
//   h hair      c hat       b hat brim (hat colour, shaded)

const body = [
  "................",
  "................",
  "................",
  ".....oooooo.....",
  "....osssssso....",
  "...osssssssso...",
  "...osssssssso...",
  "...ossessesso...",
  "...ossessesso...",
  "...osssssssso...",
  "....osssssso....",
  ".....oossoo.....",
  "...otttttttto...",
  "..otttttttttto..",
  ".osttttttttttso.",
  ".osttttttttttso.",
  ".oottttttttttoo.",
  "...otttttttto...",
  "...oppppppppo...",
  "...opppoopppo...",
  "...opppoopppo...",
  "...opppoopppo...",
  "...okkkookkko...",
  "...oooo..oooo...",
];

const hairTop = [
  "................",
  "................",
  "....oooooooo....",
  "...ohhhhhhhho...",
  "..ohhhhhhhhhho..",
  "..ohh......hho..",
  "..oh........ho..",
];

const hairs = {
  short: hairTop,
  long: [
    ...hairTop,
    "..oh........ho..",
    "..oh........ho..",
    "..oh........ho..",
    "..ohh......hho..",
    "...oo......oo...",
  ],
  bun: ["......oooo......", ".....ohhhho.....", ...hairTop.slice(2)],
} as const;

const hats = {
  none: [] as string[],
  cap: [
    "................",
    "....oooooooo....",
    "...occcccccco...",
    "..occcccccccco..",
    "..obbbbbbbbbbbo.",
  ],
  beanie: [
    "................",
    ".....oooooo.....",
    "...occcccccco...",
    "..occcccccccco..",
    "..obbbbbbbbbbo..",
  ],
} as const;

export const avatarOptions = {
  skin: ["#ffe0bd", "#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#5a3825"],
  hair: Object.keys(hairs) as (keyof typeof hairs)[],
  hairColor: ["#2b2b3a", "#6b4226", "#e8c35a", "#c4452b", "#3b5bd9", "#ff8fc8", "#e8e8f0"],
  hat: Object.keys(hats) as (keyof typeof hats)[],
  // Outfit and hat share one palette: the game's type colours, softened.
  color: ["#ff3939", "#2f53ff", "#3fa34d", "#f2c230", "#8a5cf6", "#2a2a3a", "#f4f6ff"],
} as const;

export type Avatar = {
  skin: string;
  hair: keyof typeof hairs;
  hairColor: string;
  hat: keyof typeof hats;
  hatColor: string;
  outfit: string;
};

export const defaultAvatar: Avatar = {
  skin: avatarOptions.skin[1],
  hair: "short",
  hairColor: avatarOptions.hairColor[0],
  hat: "cap",
  hatColor: avatarOptions.color[0],
  outfit: avatarOptions.color[1],
};

function cells(rows: readonly string[]) {
  return rows.flatMap((row, y) => [...row].map((ch, x) => ({ ch, x, y })).filter((c) => c.ch !== "."));
}

export function TrainerAvatar({
  avatar,
  size = 96,
  label,
  silhouette,
}: {
  avatar: Avatar;
  size?: number;
  // Pass a label when the avatar carries meaning on its own; otherwise it's decorative.
  label?: string;
  // Draw every pixel in one colour: the white/red glow of a Poké Ball release or recall.
  silhouette?: string;
}) {
  const colours: Record<string, string> = {
    o: "#1a1530",
    e: "#1a1530",
    s: avatar.skin,
    t: avatar.outfit,
    p: "#3a3f6b",
    k: "#2a2a3a",
    h: avatar.hairColor,
    c: avatar.hatColor,
    b: avatar.hatColor,
  };
  const colourOf = (ch: string) => silhouette ?? colours[ch];
  const layers = [body, hairs[avatar.hair], hats[avatar.hat]];
  return (
    <svg
      viewBox="0 0 16 24"
      width={size}
      height={(size * 24) / 16}
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {layers.map((layer, i) =>
        cells(layer).map(({ ch, x, y }) => (
          <g key={`${i}-${x}-${y}`}>
            <rect x={x} y={y} width={1} height={1} fill={colourOf(ch)} />
            {/* The brim is the hat colour, shaded. */}
            {ch === "b" && !silhouette && <rect x={x} y={y} width={1} height={1} fill="#000" opacity={0.28} />}
          </g>
        )),
      )}
    </svg>
  );
}
