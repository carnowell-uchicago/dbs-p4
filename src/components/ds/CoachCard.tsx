import Image from "next/image";
import type { ReactNode } from "react";
import { Badge, TypeTag } from "./Tag";
import { TextBox } from "./TextBox";

// Today's coach: the daily Pokémon, its types, and what it's saying to you.
export function CoachCard({
  number,
  name,
  types,
  sprite,
  line,
  dateLabel,
}: {
  number: number;
  name: string;
  types: string[];
  sprite: string | null;
  line: ReactNode;
  dateLabel: string;
}) {
  return (
    <section
      aria-label={`Today's coach: ${name}`}
      className="overflow-hidden rounded-(--dk-r-lg) border-2 border-(--dk-edge) bg-(--dk-panel)"
    >
      <div
        className="relative flex items-end gap-4 px-4 pb-3 pt-4"
        style={{
          background:
            "repeating-linear-gradient(0deg, #2a346655 0 2px, transparent 2px 22px), repeating-linear-gradient(90deg, #2a346655 0 2px, transparent 2px 22px), linear-gradient(#141c44, #1d2758)",
        }}
      >
        <div className="flex size-24 shrink-0 items-center justify-center">
          {sprite ? (
            <Image src={sprite} alt="" width={96} height={96} unoptimized className="[image-rendering:pixelated]" />
          ) : (
            <span aria-hidden className="text-4xl text-(--dk-muted)">?</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5 pb-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge kind="today">Today&apos;s coach</Badge>
            <span className="text-xs text-(--dk-muted)" style={{ fontFamily: "var(--dp-mono)" }}>
              {dateLabel} · #{String(number).padStart(3, "0")}
            </span>
          </div>
          <h2 className="truncate text-2xl font-bold uppercase tracking-[0.06em]" style={{ fontFamily: "var(--dp-display)" }}>
            {name}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <TypeTag key={t} type={t} />
            ))}
          </div>
        </div>
      </div>
      <div className="p-3">
        <TextBox speaker={name} live="polite">
          {line}
        </TextBox>
      </div>
    </section>
  );
}
