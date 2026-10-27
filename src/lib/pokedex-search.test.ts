import { describe, expect, it } from "vitest";
import { editDistance, normalize, searchPokedex, suggestName } from "./pokedex-search";

const dex = [
  { id: 1, name: "bulbasaur", displayName: "Bulbasaur" },
  { id: 25, name: "pikachu", displayName: "Pikachu" },
  { id: 26, name: "raichu", displayName: "Raichu" },
  { id: 83, name: "farfetchd", displayName: "Farfetch'd" },
  { id: 122, name: "mr-mime", displayName: "Mr. Mime" },
];

describe("searchPokedex", () => {
  it("matches part of a name, ignoring case and punctuation", () => {
    expect(searchPokedex(dex, "pika").map((e) => e.id)).toEqual([25]);
    expect(searchPokedex(dex, "CHU").map((e) => e.id)).toEqual([25, 26]);
    expect(searchPokedex(dex, "mr mime").map((e) => e.id)).toEqual([122]);
    expect(searchPokedex(dex, "farfetch'd").map((e) => e.id)).toEqual([83]);
  });
  it("finds by number, with or without # and zeros", () => {
    expect(searchPokedex(dex, "25").map((e) => e.id)).toEqual([25]);
    expect(searchPokedex(dex, "#001").map((e) => e.id)).toEqual([1]);
  });
  it("returns everything for an empty query, nothing for no match", () => {
    expect(searchPokedex(dex, "  ")).toHaveLength(5);
    expect(searchPokedex(dex, "zzz")).toEqual([]);
  });
});

describe("suggestName", () => {
  it("suggests the closest name for a typo", () => {
    expect(suggestName(dex, "pikahcu")?.displayName).toBe("Pikachu");
    expect(suggestName(dex, "bulbasor")?.displayName).toBe("Bulbasaur");
  });
  it("doesn't suggest for nonsense or very short queries", () => {
    expect(suggestName(dex, "qwertyuiop")).toBeNull();
    expect(suggestName(dex, "zz")).toBeNull();
  });
});

describe("helpers", () => {
  it("normalizes and measures edit distance", () => {
    expect(normalize("Mr. Mime")).toBe("mrmime");
    expect(editDistance("kitten", "sitting")).toBe(3);
    expect(editDistance("", "abc")).toBe(3);
  });
});
