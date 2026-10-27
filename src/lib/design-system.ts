// Shared contract for the design system page (/design/system) and its components.
//
//   src/components/ds/            The app's UI library, built in the Dusk theme.
//                                 Keep components generic and data-driven: the app imports them.
//   src/components/ds/tokens.ts   Palette hexes with role names: the single source for the
//                                 CSS variables and the contrast table.
//   src/app/design/system/        The spec sheet: color, type, spacing, components,
//                                 control states, UI states.
//
// Control states: each control gets its state look from BOTH the real pseudo-class and a
// forced data attribute, so one class string serves the live control and the frozen
// specimens in the states table, e.g.
//   "hover:bg-x data-[force=hover]:bg-x focus-visible:outline-3 data-[force=focus]:outline-3"
// Components take an optional `force?: ForcedState` and spread `forceAttr(force)`.
// "disabled" sets the real `disabled` attribute instead, and "selected" maps to the real
// aria-pressed / aria-checked / aria-selected.
// Tailwind v4: pair outline widths with `outline-solid`, or nothing draws.
export const forcedStates = [
  "rest",
  "hover",
  "focus",
  "pressed",
  "selected",
  "disabled",
] as const;

export type ForcedState = (typeof forcedStates)[number];

export function forceAttr(force?: ForcedState) {
  return force && force !== "rest" && force !== "disabled" && force !== "selected"
    ? { "data-force": force }
    : {};
}
