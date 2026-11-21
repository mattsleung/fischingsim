import { FISH, type Fish } from "./fish";
import { updateFish } from "./fishBehavior";
export { FISH } from "./fish";
export type { Fish } from "./fish";
export type Phase =
  | "ready"
  | "charging"
  | "casting"
  | "waiting"
  | "shake"
  | "bite"
  | "reeling"
  | "caught"
  | "lost";
export type State = {
  phase: Phase;
  time: number;
  power: number;
  castPower: number;
  wait: number;
  shakes: number;
  shakeX: number;
  shakeY: number;
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
    shakes: 0,
    shakeX: 0.56,
    shakeY: 0.48,
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
    s.phase = "casting";
    s.time = 0;
    s.wait = 1.5 + rng() * 2.5;
    s.fish = FISH[Math.min(FISH.length - 1, Math.floor(rng() * FISH.length))];
  }
}
export const REQUIRED_SHAKES = 3;
export function shake(s: State, rng = Math.random) {
  if (s.phase !== "shake") return;
  s.shakes++;
  if (s.shakes >= REQUIRED_SHAKES) {
    s.phase = "bite";
    s.time = 0;
  } else {
    s.shakeX = 0.32 + rng() * 0.36;
    s.shakeY = 0.36 + rng() * 0.24;
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
    if (s.phase === "casting" && s.time >= 0.65) {
      s.phase = "waiting";
      s.time = 0;
    }
    if (s.phase === "waiting" && s.time >= s.wait) {
      s.phase = "shake";
      s.time = 0;
    }
    if (s.phase === "bite" && s.time >= 0.65) {
      s.phase = "reeling";
      s.time = 0;
      s.progress = 0.35 + s.castPower * 0.12;
    }
    if (s.phase !== "reeling") continue;
    s.elapsed += h;
    updateFish(s, h, rng);
    s.barV += ((held ? 1.8 : -1.8) - s.barV * 1.5) * h;
    s.barX += s.barV * h;
    if (s.barX < BAR_WIDTH / 2 || s.barX > 1 - BAR_WIDTH / 2) {
      s.barX = clamp(s.barX, BAR_WIDTH / 2, 1 - BAR_WIDTH / 2);
      s.barV = 0;
    }
    const overlaps = Math.abs(s.fishX - s.barX) <= BAR_WIDTH / 2;
    if (overlaps) s.inside += h;
    s.progress = clamp(s.progress + (overlaps ? 0.19 : -0.105) * h, 0, 1);
    if (s.progress >= 1) {
      s.phase = "caught";
      s.time = 0;
    } else if (s.progress <= 0) {
      s.phase = "lost";
      s.time = 0;
    }
  }
}
