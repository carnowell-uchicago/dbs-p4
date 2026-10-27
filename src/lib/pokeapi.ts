/**
 * PokéAPI helper: the ONLY place in the app that talks to https://pokeapi.co.
 *
 * Why this runs on the server, not in the browser:
 * 1. Caching (fair use). PokéAPI asks every app to "locally cache resources
 *    whenever you request them" and bans IPs that don't. If browsers called it,
 *    every visitor would make their own requests. On the server, Next.js caches
 *    each answer once and every user is served from that cache.
 * 2. Trimming. A /pokemon response is about 300 KB. We keep the handful of
 *    fields the UI needs, so the browser only gets a few hundred bytes.
 * 3. One place for errors. Timeouts, 404s, 5xx and broken JSON are all handled
 *    here and become two clear error types the UI can show different states for.
 *
 * `import "server-only"` makes the build fail if a Client Component imports
 * this file by mistake.
 */
import "server-only";
import { cacheLife } from "next/cache";

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/** Give up on a PokéAPI request after 8 seconds. */
const TIMEOUT_MS = 8000;

/** The original Pokédex: #1 Bulbasaur to #151 Mew. */
export const FIRST_ID = 1;
export const LAST_ID = 151;

// ---------------------------------------------------------------------------
// Types: the small objects the rest of the app uses
// ---------------------------------------------------------------------------

export type Pokemon = {
  id: number;
  name: string; // API name, e.g. "mr-mime"
  displayName: string; // for people, e.g. "Mr. Mime"
  types: string[]; // e.g. ["grass", "poison"]
  sprite: string | null; // small pixel sprite
  artwork: string | null; // large official artwork
  gen4Sprite: string | null; // Diamond/Pearl sprite
  backSprite: string | null; // seen from behind (Diamond/Pearl if there is one), for the battle scene
  flavorText: string; // Pokédex entry, English
  genus: string; // e.g. "Seed Pokémon"
};

export type PokedexEntry = {
  id: number;
  name: string;
  displayName: string;
};

// ---------------------------------------------------------------------------
// Errors: the UI checks `instanceof` to choose which state to show
// ---------------------------------------------------------------------------

/** PokéAPI answered 404: there is no such Pokémon. Show "nothing found". */
export class PokemonNotFoundError extends Error {
  constructor(what: string) {
    super(`PokéAPI has no Pokémon for ${what}.`);
    this.name = "PokemonNotFoundError";
  }
}

/** Network error, timeout, 5xx or broken JSON. Show "API down, try again". */
export class PokeApiUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("PokéAPI is unavailable right now. Please try again later.", {
      cause,
    });
    this.name = "PokeApiUnavailableError";
  }
}

// ---------------------------------------------------------------------------
// Pure helpers (no network, so they're easy to test)
// ---------------------------------------------------------------------------

/** Names in #1–151 that a simple "capitalise each word" gets wrong. */
const SPECIAL_NAMES: Record<string, string> = {
  "nidoran-f": "Nidoran♀",
  "nidoran-m": "Nidoran♂",
  "mr-mime": "Mr. Mime",
  farfetchd: "Farfetch'd",
};

/** "bulbasaur" -> "Bulbasaur", "mr-mime" -> "Mr. Mime". */
export function formatName(name: string): string {
  if (SPECIAL_NAMES[name]) {
    return SPECIAL_NAMES[name];
  }
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Pokédex text comes with game line breaks (\n), page breaks (\f) and
 * soft hyphens (­). Turn it into one normal sentence.
 */
export function cleanFlavorText(text: string): string {
  return text
    .replace(/­\s*/g, "") // soft hyphen (+ the line break after it): join the word
    .replace(/\s+/g, " ") // \n, \f and repeated spaces -> one space
    .trim();
}

/** Throws unless id is a whole number from 1 to 151. */
export function assertValidId(id: number): void {
  if (!Number.isInteger(id) || id < FIRST_ID || id > LAST_ID) {
    throw new RangeError(
      `Pokémon id must be a whole number from ${FIRST_ID} to ${LAST_ID}, got ${id}.`,
    );
  }
}

// Only the parts of the PokéAPI responses we read. The real ones are huge.
type PokemonResponse = {
  id: number;
  name: string;
  types: { slot: number; type: { name: string } }[];
  sprites: {
    front_default: string | null;
    back_default?: string | null;
    other?: { "official-artwork"?: { front_default: string | null } };
    versions?: {
      "generation-iv"?: { "diamond-pearl"?: { front_default: string | null; back_default?: string | null } };
    };
  };
};

type SpeciesResponse = {
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }[];
  genera: { genus: string; language: { name: string } }[];
};

type ListResponse = {
  results: { name: string; url: string }[];
};

/** Prefer the Diamond (then Pearl) entry, else the newest English one. */
function pickFlavorText(entries: SpeciesResponse["flavor_text_entries"]) {
  const english = entries.filter((entry) => entry.language.name === "en");
  const chosen =
    english.find((entry) => entry.version.name === "diamond") ??
    english.find((entry) => entry.version.name === "pearl") ??
    english[english.length - 1]; // the API lists versions oldest -> newest
  return chosen ? cleanFlavorText(chosen.flavor_text) : "";
}

/** Turn the two big responses into our small Pokemon object. */
export function trimPokemon(
  pokemon: PokemonResponse,
  species: SpeciesResponse,
): Pokemon {
  const types = [...pokemon.types]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name);
  const genus =
    species.genera.find((g) => g.language.name === "en")?.genus ?? "";

  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: formatName(pokemon.name),
    types,
    sprite: pokemon.sprites.front_default ?? null,
    artwork: pokemon.sprites.other?.["official-artwork"]?.front_default ?? null,
    gen4Sprite:
      pokemon.sprites.versions?.["generation-iv"]?.["diamond-pearl"]
        ?.front_default ?? null,
    backSprite:
      pokemon.sprites.versions?.["generation-iv"]?.["diamond-pearl"]?.back_default ??
      pokemon.sprites.back_default ??
      null,
    flavorText: pickFlavorText(species.flavor_text_entries),
    genus,
  };
}

/** Turn the list response into [{ id, name, displayName }]. */
export function trimPokedex(list: ListResponse): PokedexEntry[] {
  return list.results.map((item) => {
    // The id is the last number in the URL: ".../pokemon/25/" -> 25
    const id = Number(item.url.split("/").filter(Boolean).pop());
    return { id, name: item.name, displayName: formatName(item.name) };
  });
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

/**
 * GET one PokéAPI path and parse the JSON.
 * Returns null on 404. Throws on anything else that isn't a 200 with valid JSON
 * (network error, timeout, 5xx, broken JSON).
 */
async function fetchJson<T>(path: string): Promise<T | null> {
  const response = await fetch(`${POKEAPI_BASE_URL}${path}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`PokéAPI ${path} answered HTTP ${response.status}`);
  }
  return (await response.json()) as T; // throws if the JSON is broken
}

/*
 * How the caching works ("use cache", from the Next.js 16 caching docs):
 * - The first call for an id runs the function, and Next.js stores the small
 *   trimmed result. Later calls get the stored copy and PokéAPI isn't called.
 * - cacheLife("max") keeps a good result for up to 30 days before Next.js
 *   refreshes it in the background (it expires after 1 year). Pokémon data
 *   basically never changes.
 * - A 404 returns null, which is cached for just a few minutes
 *   (cacheLife("minutes")).
 * - Any other failure THROWS. Next.js never stores a result that threw, so an
 *   outage is never cached and the next request tries PokéAPI again.
 *
 * Errors thrown inside a "use cache" function lose their class on the way
 * out. So these functions only return data or null, or throw a plain error.
 * The public functions below turn that into our two error classes.
 */
async function loadPokemon(id: number): Promise<Pokemon | null> {
  "use cache";
  const [pokemon, species] = await Promise.all([
    fetchJson<PokemonResponse>(`/pokemon/${id}`),
    fetchJson<SpeciesResponse>(`/pokemon-species/${id}`),
  ]);
  if (!pokemon || !species) {
    cacheLife("minutes");
    return null;
  }
  cacheLife("max");
  return trimPokemon(pokemon, species);
}

async function loadOriginalPokedex(): Promise<PokedexEntry[]> {
  "use cache";
  cacheLife("max");
  const list = await fetchJson<ListResponse>(`/pokemon?limit=${LAST_ID}`);
  if (!list) {
    // The list endpoint should never 404, so treat it as an outage (not cached).
    throw new Error("PokéAPI list endpoint answered 404");
  }
  return trimPokedex(list);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * One Pokémon from the original 151, trimmed to the fields the UI needs.
 * @throws RangeError if id isn't a whole number from 1 to 151
 * @throws PokemonNotFoundError if PokéAPI answers 404
 * @throws PokeApiUnavailableError for network errors, timeouts, 5xx, broken JSON
 */
export async function getPokemon(id: number): Promise<Pokemon> {
  assertValidId(id);
  let result: Pokemon | null;
  try {
    result = await loadPokemon(id);
  } catch (error) {
    throw new PokeApiUnavailableError(error);
  }
  if (!result) {
    throw new PokemonNotFoundError(`#${id}`);
  }
  return result;
}

/**
 * The original Pokédex (#1–151) as { id, name, displayName }, for search and
 * selection lists. PokéAPI has no fuzzy search, so the UI filters this list.
 * @throws PokeApiUnavailableError if PokéAPI can't be reached
 */
export async function getOriginalPokedex(): Promise<PokedexEntry[]> {
  try {
    return await loadOriginalPokedex();
  } catch (error) {
    throw new PokeApiUnavailableError(error);
  }
}
