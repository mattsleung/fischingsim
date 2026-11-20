import type { State } from "./simulation";
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

// Choose target velocities, never target positions: even erratic fish accelerate smoothly.
export function updateFish(s: State, dt: number, random: () => number) {
  s.nextChange -= dt;
  if (s.nextChange <= 0) {
    const direction = random() * 2 - 1;
    const behavior = s.fish.behavior;
    s.target = direction * s.fish.speed;
    if (behavior === "dart")
      s.target =
        Math.sign(direction) * Math.sqrt(Math.abs(direction)) * s.fish.speed;
    if (behavior === "surge")
      s.target *= 0.65 + 0.35 * Math.sin(s.elapsed * 2) ** 2;
    s.nextChange = (0.45 + random()) / s.fish.changes;
  }
  s.fishV += clamp(
    s.target - s.fishV,
    -s.fish.acceleration * dt,
    s.fish.acceleration * dt,
  );
  s.fishX += s.fishV * dt;
  if (s.fishX < 0.025 || s.fishX > 0.975) {
    s.fishX = clamp(s.fishX, 0.025, 0.975);
    s.fishV *= -0.65;
    s.target = -s.target;
  }
}
