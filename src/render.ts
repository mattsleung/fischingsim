import { BAR_WIDTH, type State } from "./simulation";
export function draw(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: State,
) {
  ctx.clearRect(0, 0, w, h);
  const water = ctx.createLinearGradient(0, 0, 0, h);
  water.addColorStop(0, "#193b43");
  water.addColorStop(0.5, "#102e37");
  water.addColorStop(1, "#0a202b");
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, w, h);
  // Distant shoreline, moon, and slow water contours are drawn without image assets.
  ctx.fillStyle = "#bacfc0";
  ctx.shadowColor = "#d3edce";
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.arc(w * 0.77, h * 0.17, 23, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#102a31";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.34);
  for (let x = 0; x <= w; x += 20)
    ctx.lineTo(
      x,
      h * (0.27 + 0.045 * Math.sin(x * 0.016) + 0.022 * Math.cos(x * 0.047)),
    );
  ctx.lineTo(w, h * 0.5);
  ctx.lineTo(0, h * 0.5);
  ctx.fill();
  for (let i = 0; i < 30; i++) {
    const y = h * 0.38 + i * h * 0.022;
    const x = (Math.sin(i * 48) * 0.5 + 0.5) * w;
    ctx.strokeStyle = `rgba(121,183,181,${0.035 + (i % 3) * 0.015})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 30 + i * 3, y);
    ctx.stroke();
  }
  const cx = w * 0.5,
    cy = h * 0.53;
  for (let i = 0; i < 3; i++) {
    const r = 12 + ((s.time * 13 + i * 17) % 52);
    ctx.strokeStyle = `rgba(153,219,201,${0.3 * (1 - r / 70)})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.24, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = "#a7bcb6";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w * 0.23, h);
  ctx.quadraticCurveTo(w * 0.25, h * 0.1, cx, cy - 10);
  ctx.stroke();
  ctx.fillStyle = "#ecb295";
  ctx.beginPath();
  ctx.ellipse(cx, cy - 5, 4, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  if (s.phase === "reeling") {
    const x = w * 0.1,
      y = h * 0.75,
      tw = w * 0.8,
      th = 42;
    ctx.fillStyle = "#07191fe8";
    ctx.beginPath();
    ctx.roundRect(x - 5, y - 5, tw + 10, th + 10, 10);
    ctx.fill();
    for (let i = 0; i <= 20; i++) {
      ctx.fillStyle = "#25434a";
      ctx.fillRect(x + (tw * i) / 20, y + th - 8, 1, 8);
    }
    ctx.fillStyle = "#83d7ba55";
    ctx.strokeStyle = "#8ee4c4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x + (s.barX - BAR_WIDTH / 2) * tw, y, BAR_WIDTH * tw, th, 5);
    ctx.fill();
    ctx.stroke();
    const fx = x + s.fishX * tw;
    ctx.fillStyle = s.fish.color;
    ctx.shadowColor = s.fish.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(fx, y + 8);
    ctx.lineTo(fx + 8, y + 21);
    ctx.lineTo(fx, y + 34);
    ctx.lineTo(fx - 8, y + 21);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
