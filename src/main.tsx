import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createState,
  press,
  release,
  step,
  FISH,
  type State,
} from "./simulation";
import { draw } from "./render";
import "./style.css";
function App() {
  const sim = useRef(createState()),
    held = useRef(false),
    canvas = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<State>({ ...sim.current });
  const [stats, setStats] = useState({ caught: 0, lost: 0, best: 0 });
  const reset = () => {
    held.current = false;
    sim.current = createState();
    setView({ ...sim.current });
    canvas.current?.parentElement?.focus();
  };
  useEffect(() => {
    let frame = 0,
      last = 0,
      lastUi = 0;
    const tick = (now: number) => {
      const s = sim.current;
      const before = s.phase;
      step(s, last ? (now - last) / 1000 : 0, held.current);
      last = now;
      if (before === "reeling" && (s.phase === "caught" || s.phase === "lost"))
        setStats((t) => ({
          caught: t.caught + Number(s.phase === "caught"),
          lost: t.lost + Number(s.phase === "lost"),
          best: Math.max(t.best, s.inside / s.elapsed),
        }));
      const c = canvas.current;
      if (c) {
        const r = c.getBoundingClientRect(),
          dpr = window.devicePixelRatio || 1;
        if (
          c.width !== Math.round(r.width * dpr) ||
          c.height !== Math.round(r.height * dpr)
        ) {
          c.width = Math.round(r.width * dpr);
          c.height = Math.round(r.height * dpr);
        }
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          draw(ctx, r.width, r.height, s);
        }
      }
      if (now - lastUi > 40) {
        setView({ ...s });
        lastUi = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const up = () => {
      held.current = false;
      release(sim.current);
    };
    const blur = () => {
      held.current = false;
      if (sim.current.phase === "charging") release(sim.current);
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("blur", blur);
    const keydown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        if (!e.repeat) {
          held.current = true;
          press(sim.current);
        }
      }
    };
    const keyup = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        up();
      }
    };
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("blur", blur);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
    };
  }, []);
  const down = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    held.current = true;
    press(sim.current);
  };
  const active = view.phase === "reeling",
    finished = view.phase === "caught" || view.phase === "lost";
  const title = {
    ready: "A little patience. A great catch.",
    charging: "Find your perfect cast.",
    waiting: "Something stirs beneath the surface.",
    reeling: "Stay with the fish.",
    caught: "A catch worth the wait.",
    lost: "The ocean keeps this one.",
  }[view.phase];
  return (
    <div className="app">
      <header>
        <a className="brand" href="." aria-label="Stillwater home">
          <span className="brand-icon">≈</span> stillwater
          <span className="edition">FISHING LAB</span>
        </a>
        <span className="status">
          <i /> OFFLINE WATERS · SOLO SESSION
        </span>
      </header>
      <main>
        <div className="intro">
          <div>
            <p className="eyebrow">THE OPEN WATER / PHASE 01</p>
            <h1>Find your rhythm.</h1>
            <p>A quiet place to cast, reel, and try again.</p>
          </div>
          <div className="location">
            <span>◈</span>
            <div>
              Moonlit Cove<small>Calm waters · Endless possibilities</small>
            </div>
          </div>
        </div>
        <div className="layout">
          <section className="game-panel">
            <div className="panel-top">
              <span>
                <i /> MOONLIT COVE
              </span>
              <span>
                01 <b>/</b> FREE FISHING
              </span>
            </div>
            <div
              className="scene"
              onPointerDown={down}
              onPointerCancel={() => {
                held.current = false;
                release(sim.current);
              }}
              role="application"
              aria-label="Fishing area. Hold left mouse or Space to charge, release to cast. When reeling hold to move right and release to move left."
              tabIndex={0}
            >
              <canvas ref={canvas} />
              <div className="scene-caption">
                <span className="pill">
                  {view.phase === "ready"
                    ? "READY TO CAST"
                    : view.phase.toUpperCase()}
                </span>
                <h2>{title}</h2>
                {!active && (
                  <p>
                    {view.phase === "ready"
                      ? "Hold anywhere on the water to begin."
                      : view.phase === "charging"
                        ? "Release at the peak for a stronger start."
                        : view.phase === "waiting"
                          ? "Your line is out. Watch for a bite."
                          : view.phase === "caught"
                            ? `${view.fish.name} · Difficulty ${view.fish.difficulty}/8`
                            : "Take a breath and cast again."}
                  </p>
                )}
              </div>
              {view.phase === "charging" && (
                <div className="charge">
                  <div>
                    <span>CASTING POWER</span>
                    <b>{Math.round(view.power * 100)}%</b>
                  </div>
                  <div className="meter">
                    <i style={{ width: `${view.power * 100}%` }} />
                  </div>
                </div>
              )}
              {view.phase === "waiting" && (
                <div className="waiting">
                  ● <span>Waiting for a bite</span>
                  <span className="dots">···</span>
                </div>
              )}
              {finished && (
                <div className="result">
                  <span className="result-icon">
                    {view.phase === "caught" ? "♢" : "≈"}
                  </span>
                  <strong>
                    {view.phase === "caught" ? view.fish.name : "Fish escaped"}
                  </strong>
                  <span>
                    {view.fish.rarity} · Difficulty {view.fish.difficulty}/8
                  </span>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={reset}
                  >
                    Cast again <span>↗</span>
                  </button>
                </div>
              )}
              {active && (
                <div className="track-label">
                  <span>← RELEASE</span>
                  <span>HOLD →</span>
                </div>
              )}
              <span className="scene-coordinate">
                34° 08′ N &nbsp; 118° 19′ W
              </span>
            </div>
            <div className="game-bottom">
              <div>
                <span className="eyebrow">
                  {active ? "CATCH PROGRESS" : "YOUR NEXT CATCH AWAITS"}
                </span>
                <strong>
                  {active
                    ? `${Math.round(view.progress * 100)}%`
                    : finished
                      ? "Every cast is a new beginning."
                      : "Follow the current."}
                </strong>
              </div>
              {active ? (
                <div className="catch-meter">
                  <i style={{ width: `${view.progress * 100}%` }} />
                </div>
              ) : (
                <span className="small-label">
                  {view.phase === "waiting"
                    ? "LINE IN THE WATER"
                    : "STANDARD REELING"}
                </span>
              )}
              <button className="reset" onClick={reset}>
                ↻ <span>Restart</span>
              </button>
            </div>
            <div className="instructions">
              <span className="key">LMB</span>
              <p>
                <strong>Hold</strong> to charge a cast or move right{" "}
                <span>·</span> <strong>Release</strong> to cast or move left
              </p>
              <span className="keyboard">Space works too</span>
            </div>
          </section>
          <aside>
            <section className="card">
              <p className="eyebrow">
                YOUR SESSION <span>↗</span>
              </p>
              <h3>A good day on the water.</h3>
              <div className="stat-grid">
                <div>
                  <strong>{String(stats.caught).padStart(2, "0")}</strong>
                  <span>Fish caught</span>
                </div>
                <div>
                  <strong>{String(stats.lost).padStart(2, "0")}</strong>
                  <span>Fish escaped</span>
                </div>
              </div>
              <div className="accuracy">
                <span>Best tracking accuracy</span>
                <strong>{Math.round(stats.best * 100)}%</strong>
              </div>
            </section>
            <section className="card field">
              <p className="eyebrow">FIELD NOTES</p>
              <h3>{active ? "On the line" : "Beneath the surface"}</h3>
              {active ? (
                <>
                  <div className="fish-name" style={{ color: view.fish.color }}>
                    ♢ {view.fish.name}
                  </div>
                  <p>
                    {view.fish.rarity} · Difficulty {view.fish.difficulty}/8
                  </p>
                </>
              ) : (
                <p>
                  Eight species call these waters home. Each has a rhythm of its
                  own.
                </p>
              )}
              <div className="species">
                {FISH.map((f) => (
                  <span
                    key={f.name}
                    title={`${f.name} · Difficulty ${f.difficulty}/8`}
                    style={{ color: f.color }}
                  >
                    ◈
                  </span>
                ))}
              </div>
              <div className="tip">
                <span>✧</span>
                <p>
                  Keep the fish inside your green bar. Small, steady adjustments
                  beat chasing every movement.
                </p>
              </div>
            </section>
            <div className="mode">
              <span className="mode-icon">≋</span>
              <div>
                Standard reeling
                <small>Classic mechanics. Room to experiment.</small>
              </div>
              <span className="live">ACTIVE</span>
            </div>
          </aside>
        </div>
        <footer>
          <span>Made for the love of the catch.</span>
          <span>
            STANDALONE SIMULATOR <b>·</b> NO ROBLOX CONNECTION
          </span>
        </footer>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
