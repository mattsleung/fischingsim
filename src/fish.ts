export type Fish = {
  name: string;
  rarity: string;
  speed: number;
  acceleration: number;
  changes: number;
  difficulty: number;
  color: string;
  behavior: "drift" | "dart" | "surge";
};
export const FISH: Fish[] = [
  {
    name: "Moonfin Minnow",
    rarity: "Common",
    speed: 0.19,
    acceleration: 0.4,
    changes: 0.6,
    difficulty: 1,
    color: "#83d7cc",
    behavior: "drift",
  },
  {
    name: "Glasswater Perch",
    rarity: "Common",
    speed: 0.23,
    acceleration: 0.5,
    changes: 0.75,
    difficulty: 2,
    color: "#b4ded5",
    behavior: "drift",
  },
  {
    name: "Ember Gill",
    rarity: "Uncommon",
    speed: 0.28,
    acceleration: 0.7,
    changes: 0.9,
    difficulty: 3,
    color: "#f0ac79",
    behavior: "dart",
  },
  {
    name: "Velvet Koi",
    rarity: "Uncommon",
    speed: 0.3,
    acceleration: 0.45,
    changes: 0.55,
    difficulty: 3,
    color: "#dca8c3",
    behavior: "drift",
  },
  {
    name: "Tidal Wisp",
    rarity: "Rare",
    speed: 0.36,
    acceleration: 0.8,
    changes: 1.2,
    difficulty: 4,
    color: "#8dcde9",
    behavior: "dart",
  },
  {
    name: "Stormstripe Bass",
    rarity: "Rare",
    speed: 0.4,
    acceleration: 1.1,
    changes: 1.4,
    difficulty: 5,
    color: "#b8bef4",
    behavior: "surge",
  },
  {
    name: "Lantern Ray",
    rarity: "Epic",
    speed: 0.43,
    acceleration: 0.65,
    changes: 0.8,
    difficulty: 6,
    color: "#f0d68e",
    behavior: "surge",
  },
  {
    name: "Abyssal Crown",
    rarity: "Legendary",
    speed: 0.5,
    acceleration: 1.4,
    changes: 1.8,
    difficulty: 8,
    color: "#c9a5ef",
    behavior: "dart",
  },
];
