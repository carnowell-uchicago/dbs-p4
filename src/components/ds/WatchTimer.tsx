// The running clock, drawn as the in-game watch: green LCD, chunky pixel digits.
// Purely visual; the parent formats the times. `role="timer"` with aria-live off,
// so screen readers can read it on demand without being interrupted every second.
type Props = {
  elapsed: string; // "03:42:15"
  caption: string; // "since 9:05 AM" or "Not clocked in"
  running: boolean;
};

export function WatchTimer({ elapsed, caption, running }: Props) {
  const [hm, seconds] = [elapsed.slice(0, 5), elapsed.slice(5)];
  return (
    <div className="neon-panel rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-[#05070d] p-2">
      <div
        role="timer"
        aria-live="off"
        aria-label={`${running ? "On the clock" : "Off the clock"}: ${elapsed}, ${caption}`}
        className="rounded-[6px] bg-(--dk-lcd) px-4 py-3 text-(--dk-lcd-ink) shadow-[0_0_14px_color-mix(in_srgb,var(--dk-lcd)_55%,transparent),inset_0_0_10px_rgb(0_0_0/0.25)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #1f3a1c14 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, #1f3a1c14 0 1px, transparent 1px 4px)",
        }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.08em]" style={{ fontFamily: "var(--dp-mono)" }}>
          {running ? "● On the clock" : "Off the clock"}
        </p>
        <p className="my-1 text-4xl tabular-nums leading-none sm:text-5xl" style={{ fontFamily: "var(--dp-clock)" }}>
          {hm}
          <span className="text-xl sm:text-2xl">{seconds}</span>
        </p>
        <p className="mt-1 text-sm" style={{ fontFamily: "var(--dp-mono)" }}>
          {caption}
        </p>
      </div>
    </div>
  );
}
