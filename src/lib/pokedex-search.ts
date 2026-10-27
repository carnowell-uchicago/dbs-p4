// Searching the original 151 by name. PokéAPI has no partial or fuzzy search
// ("pika" is a 404), so the app fetches the full name list once (cached) and
// filters it here. Pure functions, no network.

export type Named = { id: number; name: string; displayName: string };

/** Lower case, letters and digits only: "Mr. Mime" -> "mrmime", "Farfetch'd" -> "farfetchd". */
export function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Entries whose name contains the query (or whose number is the query, e.g. "25" or "#025"). */
export function searchPokedex<T extends Named>(entries: T[], query: string): T[] {
  const q = normalize(query);
  if (!q) return entries;
  if (/^\d+$/.test(q)) return entries.filter((e) => e.id === Number(q));
  return entries.filter((e) => normalize(e.displayName).includes(q) || normalize(e.name).includes(q));
}

/** Edit distance: how many single letters must change to turn `a` into `b`. */
export function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const substitute = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current.push(Math.min(previous[j] + 1, current[j - 1] + 1, substitute));
    }
    previous = current;
  }
  return previous[b.length];
}

/**
 * For "nothing found": the closest name, if it's a plausible typo
 * (at most a third of the letters different). "pikahcu" -> Pikachu.
 */
export function suggestName<T extends Named>(entries: T[], query: string): T | null {
  const q = normalize(query);
  if (q.length < 3) return null;
  let best: T | null = null;
  let bestDistance = Infinity;
  for (const entry of entries) {
    const d = editDistance(q, normalize(entry.displayName));
    if (d < bestDistance) {
      best = entry;
      bestDistance = d;
    }
  }
  return bestDistance <= Math.max(2, Math.floor(q.length / 3)) ? best : null;
}
