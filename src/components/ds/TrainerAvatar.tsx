// The user's trainer: original pixel art (not game sprites) in the style of a Diamond/Pearl
// trainer, drawn as SVG rects on a 32 × 48 grid. Three layers are drawn in order (body,
// hair, hat), and each letter is a colour slot, so swapping a colour or a layer customizes
// the trainer. Capital letters are the darker shade of the same colour.
//   . nothing   o outline   e eyes   w white (eye light, cap panel, wristbands)   m mouth
//   s/S skin    t/T outfit (jacket)  u undershirt   g/G bag and strap   p/P trousers
//   k shoes     W soles     h/H hair   c/C hat   b hat brim (hat colour, shaded)

const body = [
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  ".............oooooo.............",
  "...........oossssssoo...........",
  "..........osssssssssso..........",
  ".........osssssssssssSo.........",
  "........osssssssssssssSo........",
  "........osssssssssssssSo........",
  ".......osssssssssssssssSo.......",
  ".......osssssssssssssssSo.......",
  ".......osssssssssssssssSo.......",
  "......oosssssssssssssssSoo......",
  ".....osssssssssssssssssSsso.....",
  ".....osssssewssssssewssSsso.....",
  ".....ossssseesssssseessSsso.....",
  "......oossseesssssseessSoo......",
  ".......ossseesssssseessSo.......",
  "........osssssssssssssSo........",
  "........osssssssssssssSo........",
  ".........osssssmmssssSo.........",
  "..........osssssssssSo..........",
  "...........oosssssSoo...........",
  "..........ooooSSSSoooo..........",
  ".....ooo.oggttuuuutttto.ooo.....",
  "....otttottggtuuuutttTTottto....",
  "....otttotttgguuuutttTTottto....",
  "....otttottttgguuutttTTottto....",
  "....otttotttttgguutttTTottto....",
  "....otttotttttuggutttTTottto....",
  "....otttotttttuuggtttTTottto....",
  "....otttotttttuuuggttTTottto....",
  "....otttotttttuuuuggtTTottto....",
  "....owwwotttttuuuutgggggggggo...",
  "....osssotttttttttttgggGGGggo...",
  "....osssoTTTTTTTTTTTTgggggggo...",
  ".....ooo.opppPPooPPpppggggggo...",
  ".........opppPPooPPpppGGGGGGo...",
  ".........opppPPooPPpppGGGGGGo...",
  ".........opppPPooPPpppoooooo....",
  ".........opppPPooPPpppo.........",
  ".........opppPPooPPpppo.........",
  "........okkkkkkookkkkkko........",
  "........okkkkkkookkkkkko........",
  "........oWWWWWWooWWWWWWo........",
  ".........oooooo..oooooo.........",
];

// Each hair style has a back part (drawn behind the body, for long hair and the bun) and
// a front part (drawn over the face: the fringe and side locks).
const hairs = {
  short: {
    back: [] as string[],
    front: [
      "................oo..............",
      "............oo.ohHoo............",
      "..........oohhoohhhHooo.........",
      ".........ohhhhhhhhhhhhHo........",
      "........ohhhhhhhhhhhhhhHo.......",
      ".......ohhhhhhhhhhhhhhhHo.......",
      ".......ohhhhhhhhhhhhhhhhHo......",
      ".......ohhhhhhhhhhhhhhhhHo......",
      "......ohhhhhhhhhhhhhhhhhHo......",
      "......ohhhhhhhhhhhhhhhhhHo......",
      "......ohhhhhhhhhhhhhhhhhhHo.....",
      ".....ohhhhhhhhHHhhhhhhhhhHo.....",
      ".....ohhhhHHhhoohhhhHHhhhHo.....",
      ".....ohhhhoohhooHHhhoohhhHo.....",
      ".....ohhHHooHHo.ooHHooHhhHo.....",
      ".....ohhoo..oo....oo..oHhHo.....",
      ".....ohHo..............oHHo.....",
      ".....oHo................oHo.....",
      "......o..................o......",
    ],
  },
  long: {
    back: [
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "......oooooooooooooooooooo......",
      ".....ohhhhhhhhhhhhhhhhhhhho.....",
      ".....ohhhhhhhhhhhhhhhhhhhho.....",
      ".....ohhhhhhhhhhhhhhhhhhhho.....",
      ".....ohhhhhhhhhhhhhhhhhhhho.....",
      ".....ohhhhhhhhhhhhhhhhhhhho.....",
      ".....ohhhhhhhhhhhhhhhhhhhho.....",
      ".....ohhhhhhhhhhhhhhhhhhhho.....",
      ".....ohhhhhhhhhhhhhhhhhhhho.....",
      ".....ohhhhhhhhhhhhhhhhhhhho.....",
      ".....ohhhhhhhhhhhhhhhhhhhho.....",
      ".....ohhhhhhhhhhhhhhhhhhhho.....",
      "....ohhhhhhhhhhhhhhhhhhhhhho....",
      "....ohhhhhhhhhhhhhhhhhhhhhho....",
      "....ohhhhhhhhhhhhhhhhhhhhhho....",
      "....ohhhhhhhhhhhhhhhhhhhhhho....",
      "....ohhhhhhhhhhhhhhhhhhhhhho....",
      "...ohhhhhhhhhhhhhhhhhhhhhhhho...",
      "...ohhhhhhhhhhhhhhhhhhhhhhhho...",
      "...ohhhhhhhhhhhhhhhhhhHhhHHHo...",
      "...oHHhHHhhHHHhhHHhhHHoHHooo....",
      "....ooHooHHoooHHooHHoo.oo.......",
      "......o..oo...oo..oo............",
    ],
    front: [
      "................................",
      "................................",
      ".............oooooo.............",
      "..........ooohhhhhHooo..........",
      ".........ohhhhhhhhhhhHo.........",
      "........ohhhhhhhhhhhhhHo........",
      ".......ohhhhhhhhhhhhhhhHo.......",
      "......ohhhhhhhhhhhhhhhhhHo......",
      "......ohhhhhhhhhhhhhhhhhHo......",
      "......ohhhhhhhhhhhhhhhhhHo......",
      ".....ohhhhhhhhhhhhhhhhhhhHo.....",
      ".....ohhhhHHhhHHhhhhHHhhhHo.....",
      ".....ohhhhoohhooHHhhoohhhHo.....",
      ".....ohhHHooHHo.ooHHooHhhHo.....",
      ".....ohhoo..oo....oo..oHhho.....",
      ".....ohho..............ohho.....",
      ".....ohho..............ohho.....",
      ".....ohho..............ohho.....",
      ".....ohho..............ohho.....",
      ".....ohho..............ohho.....",
      ".....ohho..............ohho.....",
      ".....ohho..............ohho.....",
      ".....oHho..............ohHo.....",
      "......oho..............oho......",
      "......oho..............oho......",
      "......oHo..............oHo......",
      ".......o................o.......",
    ],
  },
  bun: {
    back: [
      ".............ohhhho.............",
      "............ohhhhhho............",
      "...........ohhhhhhhho...........",
      "...........ohhhhhhhho...........",
      "...........ohhhhhhhho...........",
      "...........oHHHHHHHHo...........",
      "...........oHHHHHHHHo...........",
      "............oooooooo............",
    ],
    front: [
      "................................",
      "................................",
      ".............oooooo.............",
      "..........ooohhhhhHooo..........",
      ".........ohhhhhhhhhhhHo.........",
      "........ohhhhhhhhhhhhhHo........",
      ".......ohhhhhhhhhhhhhhhHo.......",
      "......ohhhhhhhhhhhhhhhhhHo......",
      "......ohhhhhhhhhhhhhhhhhHo......",
      "......ohhhhhhhhhhhhhhhhhHo......",
      ".....ohhhhhhhhhhhhhhhhhhhHo.....",
      ".....ohhhhhhhhHHhhhhhhhhhHo.....",
      ".....ohhhhHHhhoohhhhHHhhhHo.....",
      ".....ohhhhoohhooHHhhoohhhHo.....",
      ".....ohhHHooHHo.ooHHooHhhHo.....",
      ".....ohhoo..oo....oo..oHhHo.....",
      ".....ohHo..............oHHo.....",
      ".....oHo................oHo.....",
      "......o..................o......",
    ],
  },
} as const;

const hats = {
  none: [] as string[],
  cap: [
    "................................",
    "................................",
    "............oooooooo............",
    "..........ooccccccccoo..........",
    ".........occwwwwwwwwcco.........",
    "........occcwwccccwwccco........",
    ".......occccwwccccwwcccCo.......",
    ".......occccwwowwowwcccCo.......",
    "......occcccwwwwwwwwcccCco......",
    "......occcccwwwwwwwwcccCco......",
    "....oooccccccccccccccccCco......",
    "...obbbbbbbbbbbbbbbbbbboo.......",
    "...obbbbbbbbbbbbbbbbbbbo........",
    "....ooooooooooooooooooo.........",
  ],
  beanie: [
    "..............owwo..............",
    ".............owwwwo.............",
    "...........ooowwwwooo...........",
    ".........ooccccwwccccoo.........",
    "........occcccccccccccco........",
    ".......occcccccccccccccco.......",
    "......occcccccccccccccccco......",
    "......occcccccccccccccccco......",
    ".....occcccccccccccccccccco.....",
    ".....occcccccccccccccccccco.....",
    ".....occcccccccccccccccccco.....",
    ".....oCCCCCCCCCCCCCCCCCCCCo.....",
    ".....oCcCcCcCcCcCcCcCcCcCCo.....",
    ".....oCCCCCCCCCCCCCCCCCCCCo.....",
    "......oooooooooooooooooooo......",
  ],
} as const;

// Drawn on top when the trainer is worn out (HP at 20% or less): drooping eyelids, a flat
// mouth and a sweat drop.  d = sweat
const tired = [
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "..........................o.....",
  ".........................odo....",
  ".........................wddo...",
  "........................odddo...",
  "........................odddo...",
  ".........................odo....",
  "..........................o.....",
  "................................",
  "................................",
  "...........ss......ss...........",
  "..........oooo....oooo..........",
  "................................",
  "................................",
  "................................",
  "................................",
  "..............mmmm..............",
];

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

/** The same colour, 22% darker: used for the capital-letter shade slots. */
function shade(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const dark = (v: number) => Math.round(v * 0.78);
  return `rgb(${dark(n >> 16)} ${dark((n >> 8) & 255)} ${dark(n & 255)})`;
}

function cells(rows: readonly string[]) {
  return rows.flatMap((row, y) => [...row].map((ch, x) => ({ ch, x, y })).filter((c) => c.ch !== "."));
}

export function TrainerAvatar({
  avatar,
  size = 96,
  label,
  silhouette,
  exhausted = false,
}: {
  avatar: Avatar;
  size?: number;
  // Pass a label when the avatar carries meaning on its own; otherwise it's decorative.
  label?: string;
  // Draw every pixel in one colour: the white/red glow of a Poké Ball release or recall.
  silhouette?: string;
  // Show signs of exhaustion (droopy eyes, sweat drop).
  exhausted?: boolean;
}) {
  const colours: Record<string, string> = {
    o: "#1a1530",
    e: "#1a1530",
    w: "#f4f6ff",
    m: "#a0464b",
    s: avatar.skin,
    S: shade(avatar.skin),
    t: avatar.outfit,
    T: shade(avatar.outfit),
    u: "#2a2a3a",
    g: "#c98a3a",
    G: shade("#c98a3a"),
    p: "#3a3f6b",
    P: shade("#3a3f6b"),
    k: "#2a2a3a",
    W: "#f4f6ff",
    h: avatar.hairColor,
    H: shade(avatar.hairColor),
    c: avatar.hatColor,
    C: shade(avatar.hatColor),
    b: shade(avatar.hatColor),
    d: "#8fd8ff",
  };
  const colourOf = (ch: string) => silhouette ?? colours[ch];
  // Under a cap or beanie, hair above row 10 is hidden so tufts don't poke through the hat.
  const hair = hairs[avatar.hair];
  const underHat = (rows: readonly string[]) => (avatar.hat === "none" ? rows : rows.map((r, y) => (y < 10 ? ".".repeat(r.length) : r)));
  const layers = [underHat(hair.back), body, underHat(hair.front), hats[avatar.hat], exhausted ? tired : []];
  return (
    <svg
      viewBox="0 0 32 48"
      width={size}
      height={(size * 48) / 32}
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
