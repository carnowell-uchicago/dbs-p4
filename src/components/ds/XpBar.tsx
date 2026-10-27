// The trainer's XP bar, styled like the game's HP bar. Gold when a level is complete.
export function XpBar({
  progress,
  label,
}: {
  progress: number; // 0–1
  label: string; // read by screen readers, e.g. "320 of 500 XP to level 13"
}) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden className="text-xs font-bold text-(--dk-gold)" style={{ fontFamily: "var(--dp-mono)" }}>
        XP
      </span>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="h-3 flex-1 rounded-(--dk-r-sm) border-2 border-(--dk-edge) bg-(--dk-void)"
      >
        <div
          className={`h-full rounded-[1px] ${pct >= 100 ? "bg-(--dk-gold)" : "bg-(--dk-hp)"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
