import type { CSSProperties } from "react";

// Dusk: Neon Arcade's dark grid with a handheld game's colours as the light.
// One job per colour. The CSS variables and the contrast table both read from here.
export type ColorToken = {
  token: `--dk-${string}`;
  name: string;
  hex: string;
  role: string;
  purpose: string;
  // The surface this colour is checked against on the design system page.
  on: "void" | "panel" | "red" | "lcd";
};

export const colors = [
  { token: "--dk-void", name: "Void", hex: "#0b1130", role: "Background", purpose: "The night sky the light is drawn on.", on: "void" },
  { token: "--dk-panel", name: "Panel", hex: "#141c44", role: "Surface", purpose: "Cards, fields, dialogs.", on: "void" },
  { token: "--dk-raised", name: "Raised", hex: "#1d2758", role: "Surface, hover", purpose: "A surface under the pointer.", on: "void" },
  { token: "--dk-ice", name: "Ice", hex: "#eafcff", role: "Text", purpose: "Titles and body copy.", on: "panel" },
  { token: "--dk-muted", name: "Muted", hex: "#9aa7d6", role: "Muted text", purpose: "Dates, captions, units.", on: "panel" },
  { token: "--dk-line", name: "Line", hex: "#2a3466", role: "Divider", purpose: "Dividers and grid lines only.", on: "void" },
  { token: "--dk-edge", name: "Edge", hex: "#6270b4", role: "Border", purpose: "Edges of controls you can use.", on: "panel" },
  { token: "--dk-sky", name: "Sky", hex: "#5ce3ff", role: "Focus", purpose: "Focus ring and glow. Nothing else.", on: "void" },
  { token: "--dk-diamond", name: "Diamond", hex: "#8ea4ff", role: "Selection, links", purpose: "Selected options, links.", on: "panel" },
  { token: "--dk-red", name: "Watch red", hex: "#ff3939", role: "Primary action", purpose: "Clock in / Clock out only.", on: "void" },
  { token: "--dk-red-hot", name: "Red hot", hex: "#ff5c5c", role: "Primary, hover", purpose: "The clock button under the pointer.", on: "void" },
  { token: "--dk-hp", name: "HP green", hex: "#57ea51", role: "XP, success", purpose: "XP fill and confirmations.", on: "panel" },
  { token: "--dk-gold", name: "Gold", hex: "#e0b84a", role: "Earned", purpose: "Trainer level-ups and today's coach.", on: "panel" },
  { token: "--dk-pearl", name: "Pearl", hex: "#ff9bd8", role: "New badge", purpose: "Marks something new. Nothing else.", on: "panel" },
  { token: "--dk-ember", name: "Ember", hex: "#ff8a5c", role: "Error", purpose: "Failures and their fix, always with an icon.", on: "panel" },
  { token: "--dk-lcd", name: "LCD", hex: "#74b774", role: "Watch screen", purpose: "The running clock's screen.", on: "void" },
  { token: "--dk-lcd-ink", name: "LCD ink", hex: "#1f3a1c", role: "Watch digits", purpose: "Digits on the watch screen.", on: "lcd" },
  { token: "--dk-ball", name: "Ball white", hex: "#f4f6ff", role: "Ball lower half", purpose: "The Clock button's lower half.", on: "void" },
] as const satisfies readonly ColorToken[];

type TokenName = (typeof colors)[number]["token"];

export function hex(token: TokenName): string {
  return colors.find((c) => c.token === token)!.hex;
}

// Neon Arcade's shape, kept: three radii by size, never pills (the round clock button
// and the switch thumb excepted). A part nested in a frame uses the frame's radius
// minus the gap, so corners stay parallel.
export const radii = [
  { token: "--dk-r-sm", px: 4, use: "Tags, badges, XP bar" },
  { token: "--dk-r-md", px: 6, use: "Buttons, fields, segments, rows" },
  { token: "--dk-r-lg", px: 10, use: "Cards, panels, the watch" },
] as const;

// 4px base. The app uses Tailwind's matching steps (1 = 4px).
export const spacing = [4, 8, 12, 16, 24, 32, 48] as const;

export const paletteVars = Object.fromEntries([
  ...colors.map((c) => [c.token, c.hex]),
  ...radii.map((r) => [r.token, `${r.px}px`]),
]) as CSSProperties;

export const font = {
  display: { fontFamily: "var(--dp-display)" },
  body: { fontFamily: "var(--dp-body)" },
  mono: { fontFamily: "var(--dp-mono)" },
  pixel: { fontFamily: "var(--dp-pixel)" },
} satisfies Record<string, CSSProperties>;
