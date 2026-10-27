import { contrastRatio } from "@/lib/contrast";

// Small labels. Type tags use the games' type colours; badges use one token each.
export const typeColors: Record<string, string> = {
  normal: "#9fa19f",
  fire: "#dc2626",
  water: "#2980ef",
  grass: "#3fa129",
  electric: "#fac000",
  ice: "#3dcef3",
  fighting: "#ff8000",
  poison: "#9141cb",
  ground: "#915121",
  flying: "#81b9ef",
  psychic: "#ef4179",
  bug: "#91a119",
  rock: "#afa981",
  ghost: "#704170",
  dragon: "#5060e1",
  steel: "#60a1b8",
  fairy: "#ef70ef",
};

// Each tag gets whichever text colour (white or void) contrasts more with its type colour.
export function tagText(bg: string): string {
  return contrastRatio("#ffffff", bg) >= contrastRatio("#0b1130", bg) ? "#ffffff" : "#0b1130";
}

const tagBase =
  "inline-flex h-6 items-center whitespace-nowrap rounded-(--dk-r-sm) border-2 border-black/30 px-2 text-[12px] font-bold uppercase tracking-[0.06em]";

export function TypeTag({ type }: { type: string }) {
  const bg = typeColors[type] ?? typeColors.normal;
  return (
    <span className={tagBase} style={{ background: bg, color: tagText(bg), fontFamily: "var(--dp-display)" }}>
      {type}
    </span>
  );
}

const badges = {
  new: "bg-(--dk-pearl) text-(--dk-void)",
  level: "bg-(--dk-gold) text-(--dk-void)",
  today: "border-(--dk-gold)! bg-transparent text-(--dk-gold)",
};

export function Badge({ kind, children }: { kind: keyof typeof badges; children: string }) {
  return (
    <span className={`${tagBase} ${badges[kind]}`} style={{ fontFamily: "var(--dp-display)" }}>
      {children}
    </span>
  );
}
