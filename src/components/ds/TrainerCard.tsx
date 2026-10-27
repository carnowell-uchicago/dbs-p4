import { TrainerAvatar, type Avatar } from "./TrainerAvatar";
import { XpBar } from "./XpBar";

// The user as a trainer: avatar, name, level, and XP toward the next level.
export function TrainerCard({
  name,
  avatar,
  level,
  xpIntoLevel,
  xpForNextLevel,
  progress,
}: {
  name: string;
  avatar: Avatar;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number;
}) {
  return (
    <section
      aria-label={`Trainer ${name}`}
      className="flex items-center gap-4 rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel) neon-panel p-4"
    >
      <div className="rounded-(--dk-r-md) border-2 border-(--dk-line) bg-(--dk-void) p-2">
        <TrainerAvatar avatar={avatar} size={56} />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-lg font-bold uppercase tracking-[0.04em]" style={{ fontFamily: "var(--dp-display)" }}>
            {name}
          </p>
          <p className="shrink-0 text-sm text-(--dk-gold)" style={{ fontFamily: "var(--dp-mono)" }}>
            Lv {level}
          </p>
        </div>
        <XpBar progress={progress} label={`${xpIntoLevel} of ${xpForNextLevel} XP to level ${level + 1}`} />
        <p className="text-xs text-(--dk-muted)" style={{ fontFamily: "var(--dp-mono)" }}>
          {xpIntoLevel} / {xpForNextLevel} XP · 1 min worked = 1 XP
        </p>
      </div>
    </section>
  );
}
