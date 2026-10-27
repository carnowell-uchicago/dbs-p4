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

const hairs = {
  short: [
    "................................",
    "................................",
    "................................",
    "............oooooooo............",
    "..........oohhhhhhhhoo..........",
    ".........ohhhhhhhhhhhho.........",
    "........ohhhhhhhhhhhhhho........",
    ".......ohhhhhhhhhhhhhhhho.......",
    ".......ohhhhhhhhhhhhhhhho.......",
    "......ohhhhhhhhhhhhhhhhhho......",
    "......ohhhhhhhhhhhhhhhhhho......",
    "......ohHHHHHHHHHHHHHHHHho......",
    "......ohhhhhhhhhhhhhhhhhho......",
    "......ohhhhhhhhhhhhhhhhhho......",
    "......ohhoooooooooooooohho......",
    "......ohho............ohho......",
    "......ohho............ohho......",
    "......ohho............ohho......",
    ".......oo..............oo.......",
  ],
  long: [
    "................................",
    "................................",
    "................................",
    "............oooooooo............",
    "..........oohhhhhhhhoo..........",
    ".........ohhhhhhhhhhhho.........",
    "........ohhhhhhhhhhhhhho........",
    ".......ohhhhhhhhhhhhhhhho.......",
    ".......ohhhhhhhhhhhhhhhho.......",
    "......ohhhhhhhhhhhhhhhhhho......",
    "......ohhhhhhhhhhhhhhhhhho......",
    ".....oohHHHHHHHHHHHHHHHHhoo.....",
    "....ohhhhhhhhhhhhhhhhhhhhhho....",
    "....ohhhhhhhhhhhhhhhhhhhhhho....",
    "....ohhhhoooooooooooooohhhho....",
    "....ohhhho............ohhhho....",
    "....ohhhho............ohhhho....",
    "....ohhhho............ohhhho....",
    "....ohhhho............ohhhho....",
    "....ohhhho............ohhhho....",
    "....ohhhho............ohhhho....",
    "....ohhhho............ohhhho....",
    "....ohhhho............ohhhho....",
    "....ohhhho............ohhhho....",
    "....ohhhho............ohhhho....",
    "....ohhhho............ohhhho....",
    "....oHHHHo............oHHHHo....",
    "....oHHHHo............oHHHHo....",
    ".....oooo..............oooo.....",
  ],
  bun: [
    ".............ohhhho.............",
    "............ohhhhhho............",
    "...........ohhhhhhhho...........",
    "...........ohhhhhhhho...........",
    "..........ooHHHHHHHHoo..........",
    ".........ohhhhhhhhhhhho.........",
    "........ohhhhhhhhhhhhhho........",
    ".......ohhhhhhhhhhhhhhhho.......",
    ".......ohhhhhhhhhhhhhhhho.......",
    "......ohhhhhhhhhhhhhhhhhho......",
    "......ohhhhhhhhhhhhhhhhhho......",
    "......ohHHHHHHHHHHHHHHHHho......",
    "......ohhhhhhhhhhhhhhhhhho......",
    "......ohhhhhhhhhhhhhhhhhho......",
    "......ohhoooooooooooooohho......",
    "......ohho............ohho......",
    "......ohho............ohho......",
    "......ohho............ohho......",
    ".......oo..............oo.......",
  ],
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
  };
  const colourOf = (ch: string) => silhouette ?? colours[ch];
  const layers = [body, hairs[avatar.hair], hats[avatar.hat]];
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
