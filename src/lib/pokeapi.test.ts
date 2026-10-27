/**
 * Unit tests for src/lib/pokeapi.ts. These never call the real PokéAPI:
 * `fetch` is replaced with a fake that returns tiny hand-written responses.
 *
 * Run with Vitest once it's set up: `npx vitest run src/lib/pokeapi.test.ts`
 */
import { afterEach, describe, expect, it, vi } from "vitest";

// "server-only" throws when imported outside Next's server build, and
// cacheLife only works inside Next. Neither matters for these tests.
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: vi.fn() }));

import {
  cleanFlavorText,
  formatName,
  getOriginalPokedex,
  getPokemon,
  PokeApiUnavailableError,
  PokemonNotFoundError,
  trimPokedex,
} from "./pokeapi";

// Small fake responses with only the fields the module reads.
const fakePokemon = {
  id: 122,
  name: "mr-mime",
  types: [
    { slot: 2, type: { name: "fairy" } },
    { slot: 1, type: { name: "psychic" } },
  ],
  sprites: {
    front_default: "sprite.png",
    other: { "official-artwork": { front_default: "artwork.png" } },
    versions: {
      "generation-iv": { "diamond-pearl": { front_default: "dp.png" } },
    },
  },
};

const fakeSpecies = {
  flavor_text_entries: [
    { flavor_text: "Red text.", language: { name: "en" }, version: { name: "red" } },
    { flavor_text: "Texte.", language: { name: "fr" }, version: { name: "diamond" } },
    {
      flavor_text: "It is a panto­\nmime expert\fthat can\ncreate walls.",
      language: { name: "en" },
      version: { name: "diamond" },
    },
    { flavor_text: "Sword text.", language: { name: "en" }, version: { name: "sword" } },
  ],
  genera: [
    { genus: "Pokémon Barrière", language: { name: "fr" } },
    { genus: "Barrier Pokémon", language: { name: "en" } },
  ],
};

/** Make fetch answer each URL with the given status and body. */
function mockFetch(routes: Record<string, { status: number; body: string }>) {
  const fetchMock = vi.fn(async (url: string) => {
    const path = url.replace("https://pokeapi.co/api/v2", "");
    const route = routes[path] ?? { status: 404, body: "{}" };
    return new Response(route.body, { status: route.status });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("formatName", () => {
  it("capitalises plain names", () => {
    expect(formatName("bulbasaur")).toBe("Bulbasaur");
  });

  it("handles the special Gen 1 names", () => {
    expect(formatName("mr-mime")).toBe("Mr. Mime");
    expect(formatName("nidoran-f")).toBe("Nidoran♀");
    expect(formatName("nidoran-m")).toBe("Nidoran♂");
    expect(formatName("farfetchd")).toBe("Farfetch'd");
  });
});

describe("cleanFlavorText", () => {
  it("removes line breaks, page breaks and soft hyphens", () => {
    expect(cleanFlavorText("A panto­\nmime\fexpert\nhere.")).toBe(
      "A pantomime expert here.",
    );
  });
});

describe("trimPokedex", () => {
  it("reads the id from the URL", () => {
    const list = {
      results: [{ name: "mr-mime", url: "https://pokeapi.co/api/v2/pokemon/122/" }],
    };
    expect(trimPokedex(list)).toEqual([
      { id: 122, name: "mr-mime", displayName: "Mr. Mime" },
    ]);
  });
});

describe("getPokemon", () => {
  it("trims the two responses to a small object", async () => {
    mockFetch({
      "/pokemon/122": { status: 200, body: JSON.stringify(fakePokemon) },
      "/pokemon-species/122": { status: 200, body: JSON.stringify(fakeSpecies) },
    });

    expect(await getPokemon(122)).toEqual({
      id: 122,
      name: "mr-mime",
      displayName: "Mr. Mime",
      types: ["psychic", "fairy"], // sorted by slot
      sprite: "sprite.png",
      artwork: "artwork.png",
      gen4Sprite: "dp.png",
      flavorText: "It is a pantomime expert that can create walls.", // English Diamond entry
      genus: "Barrier Pokémon",
    });
  });

  it("rejects ids outside 1–151 without calling the API", async () => {
    const fetchMock = mockFetch({});
    await expect(getPokemon(0)).rejects.toThrow(RangeError);
    await expect(getPokemon(152)).rejects.toThrow(RangeError);
    await expect(getPokemon(1.5)).rejects.toThrow(RangeError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws PokemonNotFoundError on a 404", async () => {
    mockFetch({}); // every URL answers 404
    await expect(getPokemon(1)).rejects.toThrow(PokemonNotFoundError);
  });

  it("throws PokeApiUnavailableError on a 500", async () => {
    mockFetch({
      "/pokemon/1": { status: 500, body: "oops" },
      "/pokemon-species/1": { status: 500, body: "oops" },
    });
    await expect(getPokemon(1)).rejects.toThrow(PokeApiUnavailableError);
  });

  it("throws PokeApiUnavailableError on broken JSON", async () => {
    mockFetch({
      "/pokemon/1": { status: 200, body: "{not json" },
      "/pokemon-species/1": { status: 200, body: "{not json" },
    });
    await expect(getPokemon(1)).rejects.toThrow(PokeApiUnavailableError);
  });

  it("throws PokeApiUnavailableError when the network fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    await expect(getPokemon(1)).rejects.toThrow(PokeApiUnavailableError);
  });
});

describe("getOriginalPokedex", () => {
  it("returns id, name and displayName for each entry", async () => {
    const list = {
      results: [
        { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
        { name: "nidoran-f", url: "https://pokeapi.co/api/v2/pokemon/29/" },
      ],
    };
    mockFetch({ "/pokemon?limit=151": { status: 200, body: JSON.stringify(list) } });

    expect(await getOriginalPokedex()).toEqual([
      { id: 1, name: "bulbasaur", displayName: "Bulbasaur" },
      { id: 29, name: "nidoran-f", displayName: "Nidoran♀" },
    ]);
  });

  it("throws PokeApiUnavailableError on a 503", async () => {
    mockFetch({ "/pokemon?limit=151": { status: 503, body: "down" } });
    await expect(getOriginalPokedex()).rejects.toThrow(PokeApiUnavailableError);
  });
});

/*
 * Not covered here (check by hand in the running app):
 * - Timeout: with AbortSignal.timeout(8000), a hanging PokéAPI becomes
 *   PokeApiUnavailableError after 8 s.
 * - Caching: the second request for the same id doesn't call PokéAPI, and a
 *   failed request is retried next time instead of being cached. "use cache"
 *   only works inside Next.js, so a plain unit test can't check it.
 */
