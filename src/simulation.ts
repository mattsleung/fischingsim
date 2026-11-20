export type Fish = {
  name: string;
  rarity: string;
  speed: number;
  acceleration: number;
  changes: number;
  difficulty: number;
  color: string;
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
  },
  {
    name: "Glasswater Perch",
    rarity: "Common",
    speed: 0.23,
    acceleration: 0.5,
    changes: 0.75,
    difficulty: 2,
    color: "#b4ded5",
  },
  {
    name: "Ember Gill",
    rarity: "Uncommon",
    speed: 0.28,
    acceleration: 0.7,
    changes: 0.9,
    difficulty: 3,
    color: "#f0ac79",
  },
  {
    name: "Velvet Koi",
    rarity: "Uncommon",
    speed: 0.3,
    acceleration: 0.45,
    changes: 0.55,
    difficulty: 3,
    color: "#dca8c3",
  },
  {
    name: "Tidal Wisp",
    rarity: "Rare",
    speed: 0.36,
    acceleration: 0.8,
    changes: 1.2,
    difficulty: 4,
    color: "#8dcde9",
  },
  {
    name: "Stormstripe Bass",
    rarity: "Rare",
    speed: 0.4,
    acceleration: 1.1,
    changes: 1.4,
    difficulty: 5,
    color: "#b8bef4",
  },
  {
    name: "Lantern Ray",
    rarity: "Epic",
    speed: 0.43,
    acceleration: 0.65,
    changes: 0.8,
    difficulty: 6,
    color: "#f0d68e",
  },
  {
    name: "Abyssal Crown",
    rarity: "Legendary",
    speed: 0.5,
    acceleration: 1.4,
    changes: 1.8,
    difficulty: 8,
    color: "#c9a5ef",
  },
];
export type Phase =
  "ready" | "charging" | "waiting" | "reeling" | "caught" | "lost";
export type State = {
  phase: Phase;
  time: number;
  power: number;
  castPower: number;
  wait: number;
  fish: Fish;
  fishX: number;
  fishV: number;
  target: number;
  nextChange: number;
  barX: number;
  barV: number;
  progress: number;
  elapsed: number;
  inside: number;
};
export const BAR_WIDTH = 0.25;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export function createState(): State {
  return {
    phase: "ready",
    time: 0,
    power: 0,
    castPower: 0,
    wait: 0,
    fish: FISH[0],
    fishX: 0.5,
    fishV: 0,
    target: 0,
    nextChange: 0,
    barX: 0.5,
    barV: 0,
    progress: 0.35,
    elapsed: 0,
    inside: 0,
  };
}
export function press(s: State) {
  if (s.phase === "ready") {
    s.phase = "charging";
    s.time = 0;
  }
}
export function release(s: State, rng = Math.random) {
  if (s.phase === "charging") {
    s.castPower = s.power;
    s.phase = "waiting";
    s.time = 0;
    s.wait = 1.5 + rng() * 2.5;
    s.fish = FISH[Math.min(FISH.length - 1, Math.floor(rng() * FISH.length))];
  }
}
// All positions are normalized. Small substeps make acceleration independent of display refresh rate.
export function step(s: State, dt: number, held: boolean, rng = Math.random) {
  let remaining = clamp(dt, 0, 0.1);
  while (remaining > 1e-9) {
    const h = Math.min(remaining, 1 / 120);
    remaining -= h;
    s.time += h;
    if (s.phase === "charging") s.power = (1 - Math.cos(s.time * 3.4)) / 2;
    if (s.phase === "waiting" && s.time >= s.wait) {
      s.phase = "reeling";
      s.time = 0;
      s.progress = 0.35 + s.castPower * 0.12;
    }
    if (s.phase !== "reeling") continue;
    s.elapsed += h;
    s.nextChange -= h;
    if (s.nextChange <= 0) {
      s.target = (rng() * 2 - 1) * s.fish.speed;
      s.nextChange = (0.45 + rng()) / s.fish.changes;
    }
    s.fishV += clamp(
      s.target - s.fishV,
      -s.fish.acceleration * h,
      s.fish.acceleration * h,
    );
    s.fishX += s.fishV * h;
    if (s.fishX < 0.025 || s.fishX > 0.975) {
      s.fishX = clamp(s.fishX, 0.025, 0.975);
      s.fishV *= -0.65;
      s.target = -s.target;
    }
    s.barV += ((held ? 1.8 : -1.8) - s.barV * 1.5) * h;
    s.barX += s.barV * h;
    if (s.barX < BAR_WIDTH / 2 || s.barX > 1 - BAR_WIDTH / 2) {
      s.barX = clamp(s.barX, BAR_WIDTH / 2, 1 - BAR_WIDTH / 2);
      s.barV = 0;
    }
    const overlaps = Math.abs(s.fishX - s.barX) <= BAR_WIDTH / 2;
    if (overlaps) s.inside += h;
    s.progress = clamp(s.progress + (overlaps ? 0.19 : -0.105) * h, 0, 1);
    if (s.progress >= 1) s.phase = "caught";
    else if (s.progress <= 0) s.phase = "lost";
  }
}
