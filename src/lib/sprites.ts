// Sprite image URLs can be built from the Pokédex number, so the list page doesn't
// need one PokéAPI call per Pokémon (fair use). These are static files on GitHub.
const SPRITES = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

/** The small front sprite for Pokédex number `id`. */
export function spriteUrl(id: number): string {
  return `${SPRITES}/${id}.png`;
}
