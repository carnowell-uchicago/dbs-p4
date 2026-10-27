// Shared class fragments. Each pairs the real pseudo-class with its forced `data-force`
// twin (see src/lib/design-system.ts). Written out in full so Tailwind can find them.

// 3px sky outline, a step heavier than the 2px borders: 12.2:1 on Void, so focus never
// relies on glow alone.
export const focusRing =
  "focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-(--dk-sky) data-[force=focus]:outline-3 data-[force=focus]:outline-solid data-[force=focus]:outline-offset-2 data-[force=focus]:outline-(--dk-sky)";

// Glow levels: rest is crisp, hover gets a soft bloom, selection a stronger one.
export const glowHover = "shadow-[0_0_8px_color-mix(in_srgb,var(--dk-sky)_40%,transparent)]";
export const glowSelected =
  "shadow-[0_0_4px_var(--dk-diamond),0_0_16px_color-mix(in_srgb,var(--dk-diamond)_50%,transparent)]";

export const disabledLook =
  "disabled:pointer-events-none disabled:border-(--dk-line) disabled:bg-transparent disabled:text-(--dk-muted) disabled:shadow-none";
