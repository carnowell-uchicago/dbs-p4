// Reference images for the mood board: research only, never used in the app.
export type Reference = {
  src: string;
  width: number;
  height: number;
  label: string;
  alt: string;
  source: string;
  license: string;
  author: string | null;
  note: string;
};

export const references: Reference[] = [
  {
    src: "/mood-board/01-poketch-clock-night.webp",
    width: 256,
    height: 392,
    label: "The watch on the lower screen",
    alt: "Handheld game screenshot: a town street at night above a green LCD watch reading 22:00 in a blue frame with a red button",
    source: "https://en.wikipedia.org/wiki/File:Nightime_feature.jpg",
    license: "Fair use",
    author: null,
    note: "A clock app already lives in this game: green LCD, chunky digits, one red button.",
  },
  {
    src: "/mood-board/02-diamond-pearl-box-art.webp",
    width: 472,
    height: 211,
    label: "Two editions, two colours",
    alt: "Two game box covers side by side: a steel-blue dragon and a pale pink-white dragon, both with gold logos",
    source: "https://en.wikipedia.org/wiki/File:PokemonDiamondPearlBoxArt.jpg",
    license: "Fair use",
    author: null,
    note: "Diamond blue and Pearl pink as a pair; gold for something earned.",
  },
  {
    src: "/mood-board/03-battle-screen-recreation.webp",
    width: 480,
    height: 720,
    label: "Battle screen, daytime",
    alt: "Recreated battle screen: cyan sky, white name boxes with black outlines and green HP bars, and four coloured move buttons",
    source: "https://commons.wikimedia.org/wiki/File:DiamondPearlBattle.jpg",
    license: "CC BY-SA 4.0",
    author: "PatoAnidae02",
    note: "Bright sky, white boxes with hard outlines, a bar that fills: that's an XP bar.",
  },
  {
    src: "/mood-board/04-sinnoh-map.webp",
    width: 720,
    height: 560,
    label: "Region map",
    alt: "Flat map of a region: pale green land, light blue water, grey routes linking red and blue squares",
    source: "https://commons.wikimedia.org/wiki/File:Sinnoh_Map.png",
    license: "CC0",
    author: "Ztash",
    note: "Routes as lines between stops: a week of workdays could read the same way.",
  },
  {
    src: "/mood-board/05-gen4-battle-text-box.webp",
    width: 590,
    height: 452,
    label: "Gameplay · battle and text box",
    alt: "Handheld battle screenshot: a blue penguin fires a stream of water across a sunny field, with a white text box below reading 'Empoleon used Hydro Cannon!'",
    source: "https://en.wikipedia.org/wiki/File:Pokemon_Platinum_battle.png",
    license: "Fair use",
    author: null,
    note: "The real thing: the white text box with a tan frame announces what just happened. That's the voice for clock-in and level-up messages.",
  },
  {
    src: "/mood-board/06-gen4-overworld.webp",
    width: 512,
    height: 384,
    label: "Gameplay · the overworld, same engine",
    alt: "Top-down handheld screenshot: a trainer walks a rocky mountain path between trees and a pond, with an exclamation bubble over another character",
    source: "https://en.wikipedia.org/wiki/File:HGSSgameplay.jpg",
    license: "Fair use",
    author: null,
    note: "From the sister games on the same engine: soft muted greens and stone, the daytime world the bright UI sits on top of.",
  },
  {
    src: "/mood-board/07-remake-battle-menu.webp",
    width: 421,
    height: 237,
    label: "Gameplay · battle menu, remake",
    alt: "3D remake battle screenshot at night: a blue-black lion faces a jellyfish; four stacked buttons on the right are red Battle, green Pokémon, yellow Bag and blue Run",
    source: "https://en.wikipedia.org/wiki/File:Brilliant_Diamond_Pok%C3%A9mon_Battle.jpg",
    license: "Fair use",
    author: "Nintendo",
    note: "One colour per action, stacked big. Red is the main move. A model for Clock in / Switch Pokémon / Log / Settings.",
  },
  {
    src: "/mood-board/08-two-screen-handheld.webp",
    width: 640,
    height: 540,
    label: "The handheld: two screens",
    alt: "A black two-screen handheld console, open, with the top screen above a lower touch screen, a d-pad and four buttons",
    source: "https://commons.wikimedia.org/wiki/File:Nintendo-DS-Lite-Black-Open.png",
    license: "Public domain",
    author: "Evan-Amos",
    note: "Top screen to look at, bottom screen to touch. On a phone: your Pokémon on top, the clock and its button below.",
  },
];

// Gen-4 (Diamond/Pearl) sprites of original-Pokédex Pokémon, from PokéAPI's sprite set.
export const sprites = [
  { id: 1, name: "Bulbasaur" },
  { id: 4, name: "Charmander" },
  { id: 7, name: "Squirtle" },
  { id: 25, name: "Pikachu" },
  { id: 133, name: "Eevee" },
  { id: 143, name: "Snorlax" },
] as const;
