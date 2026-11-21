import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  press,
  release,
  shake,
  REQUIRED_SHAKES,
  step,
  FISH,
  BAR_WIDTH,
} from "./simulation";
function rng(seed = 73) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
test("hold, release, randomized waiting, then bite", () => {
  const s = createState();
  press(s);
  for (let i = 0; i < 10; i++) step(s, 0.1, true);
  assert.equal(s.phase, "charging");
  assert.ok(s.power > 0.9);
  release(s, () => 0.5);
  assert.equal(s.phase, "casting");
  for (let i = 0; i < 7; i++) step(s, 0.1, false);
  assert.equal(s.phase, "waiting");
  assert.equal(s.fish, FISH[4]);
  step(s, 0.1, false);
  assert.equal(s.phase, "waiting");
  for (let i = 0; i < 30; i++) step(s, 0.1, false);
  assert.equal(s.phase, "shake");
  for (let i = 0; i < REQUIRED_SHAKES; i++) shake(s, () => 0.5);
  assert.equal(s.phase, "bite");
  for (let i = 0; i < 7; i++) step(s, 0.1, false);
  assert.equal(s.phase, "reeling");
});
test("all eight fish remain bounded and move smoothly", () => {
  assert.equal(FISH.length, 8);
  for (const fish of FISH) {
    const s = createState();
    s.phase = "reeling";
    s.fish = fish;
    const random = rng();
    let distance = 0;
    for (let i = 0; i < 1800; i++) {
      const x = s.fishX;
      s.progress = 0.5;
      step(s, 1 / 120, i % 80 < 40, random);
      assert.ok(s.fishX >= 0.025 && s.fishX <= 0.975);
      assert.ok(Math.abs(s.fishX - x) < 0.01);
      assert.ok(s.barX >= BAR_WIDTH / 2 && s.barX <= 1 - BAR_WIDTH / 2);
      distance += Math.abs(s.fishX - x);
    }
    assert.ok(distance > 0.2);
  }
});
test("bar accelerates with inertia and stops at boundaries", () => {
  const s = createState();
  s.phase = "reeling";
  step(s, 0.1, true);
  assert.ok(s.barV > 0);
  const x = s.barX;
  step(s, 0.01, false);
  assert.ok(s.barX > x, "releasing should retain rightward momentum briefly");
  for (let i = 0; i < 50; i++) {
    s.progress = 0.5;
    step(s, 0.1, true);
  }
  assert.equal(s.barX, 1 - BAR_WIDTH / 2);
  assert.equal(s.barV, 0);
});
test("accurate tracking catches; sustained misses lose", () => {
  for (const catching of [true, false]) {
    const s = createState();
    s.phase = "reeling";
    s.fish = { ...FISH[0], speed: 0, acceleration: 0 };
    s.barX = BAR_WIDTH / 2;
    s.fishX = catching ? BAR_WIDTH / 2 : 0.9;
    for (let i = 0; i < 100 && s.phase === "reeling"; i++)
      step(s, 0.1, false, () => 0.5);
    assert.equal(s.phase, catching ? "caught" : "lost");
    assert.equal(s.progress, catching ? 1 : 0);
  }
});
test("physics is stable at different frame rates", () => {
  const a = createState(),
    b = createState();
  a.phase = b.phase = "reeling";
  const ra = rng(),
    rb = rng();
  for (let i = 0; i < 60; i++) step(a, 1 / 60, true, ra);
  for (let i = 0; i < 120; i++) step(b, 1 / 120, true, rb);
  assert.ok(Math.abs(a.barX - b.barX) < 0.001);
  assert.ok(Math.abs(a.fishX - b.fishX) < 0.001);
  assert.ok(Math.abs(a.progress - b.progress) < 0.001);
});

test("casts select all species and vary bite timing reproducibly", () => {
  const random = rng(42);
  const selected = new Set<string>();
  const waits = new Set<number>();
  for (let i = 0; i < 200; i++) {
    const s = createState();
    press(s);
    release(s, random);
    selected.add(s.fish.name);
    waits.add(s.wait);
    assert.ok(s.wait >= 1.5 && s.wait < 4);
  }
  assert.equal(selected.size, FISH.length);
  assert.ok(waits.size > 100);
});

test("different random seeds yield different smooth fish trajectories", () => {
  const traces = [42, 73].map((seed) => {
    const random = rng(seed);
    const s = createState();
    s.phase = "reeling";
    s.fish = FISH[7];
    const trace: number[] = [];
    for (let i = 0; i < 120; i++) {
      s.progress = 0.5;
      const previous = s.fishV;
      step(s, 1 / 120, false, random);
      // This short run remains away from the reflecting track edges.
      assert.ok(
        Math.abs(s.fishV - previous) <= s.fish.acceleration / 120 + 1e-9,
      );
      trace.push(s.fishX);
    }
    return trace;
  });
  assert.notDeepEqual(traces[0], traces[1]);
  assert.ok(new Set(FISH.map((f) => f.speed)).size >= 8);
  assert.ok(
    Math.max(...FISH.map((f) => f.difficulty)) >
      Math.min(...FISH.map((f) => f.difficulty)),
  );
});

test("casting and bite animations gate the reeling phase", () => {
  const s = createState();
  press(s);
  release(s, () => 0);
  assert.equal(s.phase, "casting");
  for (let i = 0; i < 6; i++) step(s, 0.1, false);
  assert.equal(s.phase, "casting");
  step(s, 0.1, false);
  assert.equal(s.phase, "waiting");
  for (let i = 0; i < 15; i++) step(s, 0.1, false);
  assert.equal(s.phase, "shake");
  for (let i = 0; i < REQUIRED_SHAKES; i++) shake(s, () => 0.5);
  assert.equal(s.phase, "bite");
  for (let i = 0; i < 7; i++) step(s, 0.1, false);
  assert.equal(s.phase, "reeling");
});

test("shake prompts are gated, bounded, and require three deliberate inputs", () => {
  const s = createState();
  shake(s);
  assert.equal(s.shakes, 0);
  s.phase = "shake";
  const random = rng(62);
  shake(s, random);
  assert.equal(s.phase, "shake");
  assert.equal(s.shakes, 1);
  assert.ok(
    s.shakeX >= 0.32 && s.shakeX <= 0.68 && s.shakeY >= 0.36 && s.shakeY <= 0.6,
  );
  for (let i = 0; i < 100; i++) step(s, 0.1, false);
  assert.equal(
    s.phase,
    "shake",
    "waiting does not bypass the interactive hook prompt",
  );
  shake(s, random);
  assert.equal(s.phase, "shake");
  shake(s, random);
  assert.equal(s.phase, "bite");
  shake(s);
  assert.equal(s.shakes, REQUIRED_SHAKES);
  for (let i = 0; i < 7; i++) step(s, 0.1, false);
  assert.equal(s.phase, "reeling");
});
