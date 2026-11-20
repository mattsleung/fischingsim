import type { State } from "./simulation";
import type { Scene } from "./scenes";

function polygon(
  c: CanvasRenderingContext2D,
  points: number[][],
  fill: string,
) {
  c.fillStyle = fill;
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fill();
}
// A fixed, cached scene. No camera movement, animated scenery, or random draws per frame.
export function drawBackground(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  scene: Scene,
) {
  const sky = c.createLinearGradient(0, 0, 0, h * 0.56);
  sky.addColorStop(0, scene.sky[0]);
  sky.addColorStop(1, scene.sky[1]);
  c.fillStyle = sky;
  c.fillRect(0, 0, w, h);
  if (scene.moon) {
    for (let i = 0; i < 75; i++) {
      const x = (Math.sin(i * 39 + scene.seed) * 0.5 + 0.5) * w,
        y = (Math.cos(i * 17) * 0.5 + 0.5) * h * 0.4;
      c.fillStyle = `rgba(233,239,219,${0.2 + (i % 4) * 0.12})`;
      c.fillRect(x, y, i % 5 === 0 ? 2 : 1, 1);
    }
  }
  c.fillStyle = scene.glow;
  c.shadowColor = scene.glow;
  c.shadowBlur = 60;
  c.beginPath();
  c.arc(w * 0.66, h * 0.22, Math.min(w, h) * 0.037, 0, Math.PI * 2);
  c.fill();
  c.shadowBlur = 0;
  const water = c.createLinearGradient(0, h * 0.47, 0, h);
  water.addColorStop(0, scene.water[0]);
  water.addColorStop(1, scene.water[1]);
  c.fillStyle = water;
  c.fillRect(0, h * 0.47, w, h * 0.53);
  for (let layer = 0; layer < 3; layer++) {
    const base = h * (0.46 + layer * 0.035),
      pts: number[][] = [[0, base]];
    for (let i = 0; i <= 18; i++)
      pts.push([
        (w * i) / 18,
        base -
          h *
            (0.03 + Math.abs(Math.sin(i * 0.53 + scene.seed + layer)) * 0.14) *
            (layer === 0 ? 1 : 0.6),
      ]);
    pts.push([w, h * 0.55], [0, h * 0.55]);
    polygon(
      c,
      pts,
      layer === 0 ? scene.cliff : layer === 1 ? scene.near : scene.water[0],
    );
  }
  // Original low-poly shore silhouettes and evergreens.
  polygon(
    c,
    [
      [0, h * 0.29],
      [w * 0.06, h * 0.33],
      [w * 0.12, h * 0.48],
      [w * 0.2, h * 0.54],
      [w * 0.17, h * 0.65],
      [0, h * 0.71],
    ],
    scene.near,
  );
  polygon(
    c,
    [
      [w, h * 0.24],
      [w * 0.92, h * 0.32],
      [w * 0.87, h * 0.43],
      [w * 0.79, h * 0.53],
      [w * 0.85, h * 0.6],
      [w, h * 0.64],
    ],
    scene.near,
  );
  for (let side = 0; side < 2; side++)
    for (let i = 0; i < 11; i++) {
      const x = side ? w - w * (i * 0.011 + 0.005) : w * (i * 0.012 + 0.008),
        y = h * (0.33 + i * 0.016),
        size = h * (0.07 + Math.sin(i * 4) ** 2 * 0.055);
      c.fillStyle = "#0b2229";
      c.fillRect(x - 2, y - size, 4, size * 1.2);
      for (let n = 0; n < 3; n++)
        polygon(
          c,
          [
            [x, y - size * 1.5 + n * size * 0.28],
            [x - size * (0.25 + n * 0.08), y - size * 0.55 + n * size * 0.28],
            [x + size * (0.25 + n * 0.08), y - size * 0.55 + n * size * 0.28],
          ],
          "#102a30",
        );
    }
  for (let i = 0; i < 110; i++) {
    const y = h * (0.55 + 0.45 * (i / 110) ** 0.7),
      x = (Math.sin(i * 48 + scene.seed) * 0.5 + 0.5) * w;
    c.strokeStyle = `rgba(193,217,211,${0.025 + (i % 5) * 0.012})`;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + w * (0.01 + i * 0.0007), y);
    c.stroke();
  }
  // Moon/sunset reflection remains static with the chosen background.
  for (let i = 0; i < 35; i++) {
    const y = h * (0.53 + i * 0.008),
      span = (5 + i * 2) * (1 + 0.4 * Math.sin(i * 7));
    c.fillStyle = scene.glow + "15";
    c.fillRect(w * 0.66 - span / 2, y, span, 2);
  }
  const vignette = c.createRadialGradient(
    w * 0.5,
    h * 0.45,
    h * 0.1,
    w * 0.5,
    h * 0.5,
    w * 0.7,
  );
  vignette.addColorStop(0, "#00000000");
  vignette.addColorStop(1, "#020c17b0");
  c.fillStyle = vignette;
  c.fillRect(0, 0, w, h);
  // Dock corners frame a stationary first-person fishing viewpoint.
  polygon(
    c,
    [
      [0, h],
      [0, h * 0.91],
      [w * 0.13, h * 0.87],
      [w * 0.34, h],
    ],
    "#252c30",
  );
  for (let i = 0; i < 6; i++) {
    c.strokeStyle = "#72756b33";
    c.beginPath();
    c.moveTo(0, h * (0.93 + i * 0.025));
    c.lineTo(w * (0.16 + i * 0.03), h);
    c.stroke();
  }
  polygon(
    c,
    [
      [w, h],
      [w, h * 0.93],
      [w * 0.9, h * 0.9],
      [w * 0.72, h],
    ],
    "#242c30",
  );
}

export function draw(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: State,
) {
  c.clearRect(0, 0, w, h);
  const lineOut = [
    "casting",
    "waiting",
    "bite",
    "reeling",
    "caught",
    "lost",
  ].includes(s.phase);
  const cast = s.phase === "casting" ? Math.min(1, s.time / 0.65) : 1;
  const launch = 1 - (1 - cast) ** 2;
  let bx = w * (0.53 - 0.19 * (1 - launch)),
    by = h * (0.55 + 0.32 * (1 - launch)) - Math.sin(cast * Math.PI) * h * 0.22;
  if (s.phase === "caught") {
    by -= Math.min(1, s.time / 0.7) * h * 0.16;
  }
  const tipX = w * 0.39,
    tipY = h * (s.phase === "charging" ? 0.57 + s.power * 0.07 : 0.57);
  c.lineCap = "round";
  c.strokeStyle = "#15212b";
  c.lineWidth = 9;
  c.beginPath();
  c.moveTo(w * 0.22, h * 1.08);
  c.quadraticCurveTo(w * 0.3, h * 0.72, tipX, tipY);
  c.stroke();
  c.strokeStyle = "#b0a687";
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(w * 0.22, h * 1.08);
  c.quadraticCurveTo(w * 0.3, h * 0.72, tipX, tipY);
  c.stroke();
  if (lineOut) {
    c.strokeStyle = "#d6e6df77";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(tipX, tipY);
    c.quadraticCurveTo((tipX + bx) / 2, h * 0.39, bx, by);
    c.stroke();
    if (s.phase !== "lost" && s.phase !== "caught") {
      const ripple = s.phase === "waiting" ? s.time * 12 : s.time * 30;
      for (let i = 0; i < 3; i++) {
        const r = 8 + ((ripple + i * 12) % 42);
        c.strokeStyle = `rgba(217,235,221,${0.35 * (1 - r / 55)})`;
        c.beginPath();
        c.ellipse(bx, by + 7, r, r * 0.23, 0, 0, Math.PI * 2);
        c.stroke();
      }
      const bob =
        s.phase === "waiting"
          ? Math.sin(s.time * 3) * 2
          : s.phase === "bite"
            ? Math.sin(s.time * 25) * 5
            : 0;
      c.fillStyle = "#f8e3b5";
      c.beginPath();
      c.ellipse(bx, by + bob, 4, 8, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#ee906b";
      c.fillRect(bx - 3, by + bob, 6, 7);
    }
    if (s.phase === "casting" && cast > 0.75) {
      c.strokeStyle = "#d6e6df77";
      c.beginPath();
      c.ellipse(bx, by, 20 * cast, 5 * cast, 0, 0, Math.PI * 2);
      c.stroke();
    }
  }
}
