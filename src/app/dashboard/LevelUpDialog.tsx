"use client";

// The level-up celebration, shown after a clock-out that reached a new trainer level.
// A native <dialog> (focus trap, Esc closes); it opens as soon as it appears.
import { useEffect, useRef } from "react";
import { Button } from "@/components/ds/Button";
import { TrainerAvatar, type Avatar } from "@/components/ds/TrainerAvatar";

export function LevelUpDialog({ level, avatar, onClose }: { level: number; avatar: Avatar; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      aria-labelledby="levelup-h"
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-(--dk-r-lg) border-[3px] border-(--dk-gold) bg-(--dk-panel) p-6 text-center text-(--dk-ice) shadow-[0_0_24px_color-mix(in_srgb,var(--dk-gold)_55%,transparent)] backdrop:bg-[#05070d]/75 motion-safe:animate-[levelup-pop_350ms_ease-out]"
    >
      {/* Sparkles around the trainer (decorative). */}
      <div aria-hidden className="relative mx-auto flex h-40 w-40 items-end justify-center">
        {["left-2 top-4", "right-3 top-2", "left-6 bottom-10", "right-5 bottom-14", "left-1/2 top-0"].map((pos) => (
          <span key={pos} className={`absolute ${pos} size-2 rotate-45 bg-(--dk-gold) shadow-[0_0_8px_var(--dk-gold)] motion-safe:animate-pulse`} />
        ))}
        <TrainerAvatar avatar={avatar} size={96} />
      </div>
      <h2
        id="levelup-h"
        className="mt-3 text-2xl font-bold uppercase tracking-[0.1em] text-(--dk-gold) [text-shadow:0_0_10px_color-mix(in_srgb,var(--dk-gold)_70%,transparent)]"
        style={{ fontFamily: "var(--dp-display)" }}
      >
        Level up!
      </h2>
      <p className="mt-2 text-base leading-snug" style={{ fontFamily: "var(--dp-pixel)" }}>
        Congratulations, you reached level {level}. You&apos;re now a cog in the machine!
      </p>
      <div className="mt-5 flex justify-center">
        <Button autoFocus onClick={() => dialog.current?.close()}>
          Nice!
        </Button>
      </div>
    </dialog>
  );
}
