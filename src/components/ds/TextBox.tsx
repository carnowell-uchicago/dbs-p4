import type { ReactNode } from "react";

// The game's text box: white box, hard dark outline, red bars at the ends. The coach
// speaks in it, and so do the app's own messages (success, level-up, error).
type Tone = "coach" | "success" | "levelUp" | "error";

const bars: Record<Tone, string> = {
  coach: "bg-(--dk-red)",
  success: "bg-(--dk-hp)",
  levelUp: "bg-(--dk-gold)",
  error: "bg-(--dk-ember)",
};

export function TextBox({
  tone = "coach",
  speaker,
  children,
  action,
  live,
}: {
  tone?: Tone;
  // The coach's name, written in capitals like the game does.
  speaker?: string;
  children: ReactNode;
  action?: ReactNode;
  // "polite" for status updates, "assertive" only for errors that block the user.
  live?: "polite" | "assertive";
}) {
  return (
    <div
      role={live === "assertive" ? "alert" : live ? "status" : undefined}
      className="flex overflow-hidden rounded-(--dk-r-md) border-[3px] border-[#05070d] bg-(--dk-ball) text-(--dk-void) shadow-[0_0_0_2px_var(--dk-edge)]"
    >
      <span aria-hidden className={`w-2 shrink-0 ${bars[tone]}`} />
      <div className="min-w-0 flex-1 px-4 py-3">
        {speaker && (
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-(--dk-void)/70" style={{ fontFamily: "var(--dp-mono)" }}>
            {tone === "error" && <span aria-hidden>⚠ </span>}
            {speaker}
          </p>
        )}
        <div className="text-lg leading-snug" style={{ fontFamily: "var(--dp-pixel)" }}>
          {children}
        </div>
        {action && <div className="mt-2 flex flex-wrap gap-2">{action}</div>}
      </div>
      <span aria-hidden className={`w-2 shrink-0 ${bars[tone]}`} />
    </div>
  );
}
