import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createState, press, release, step, type State } from "./simulation";
import { chooseScene } from "./scenes";
import { draw, drawBackground } from "./render";
import { FishArt } from "./FishArt";
import "./style.css";

function App() {
  const [scene] = useState(() => chooseScene());
  const sim = useRef(createState()),
    mouse = useRef(false),
    keyboard = useRef(false);
  const canvas = useRef<HTMLCanvasElement>(null),
    background = useRef<HTMLCanvasElement>(null),
    area = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<State>({ ...sim.current });
  const [stats, setStats] = useState({ caught: 0, lost: 0, best: 0 });
  const reset = () => {
    mouse.current = false;
    keyboard.current = false;
    sim.current = createState();
    setView({ ...sim.current });
    area.current?.focus();
  };
  useEffect(() => {
    let frame = 0,
      last = 0,
      lastUi = 0,
      backgroundKey = "";
    const tick = (now: number) => {
      const s = sim.current,
        before = s.phase;
      step(
        s,
        last ? (now - last) / 1000 : 0,
        mouse.current || keyboard.current,
      );
      last = now;
      if (before === "reeling" && (s.phase === "caught" || s.phase === "lost"))
        setStats((t) => ({
          caught: t.caught + Number(s.phase === "caught"),
          lost: t.lost + Number(s.phase === "lost"),
          best: Math.max(t.best, s.inside / s.elapsed),
        }));
      const c = canvas.current,
        bg = background.current;
      if (c && bg) {
        const r = c.getBoundingClientRect(),
          dpr = Math.min(window.devicePixelRatio || 1, 2);
        const key = `${r.width}:${r.height}:${dpr}`;
        if (key !== backgroundKey) {
          for (const layer of [c, bg]) {
            layer.width = Math.round(r.width * dpr);
            layer.height = Math.round(r.height * dpr);
          }
          const ctx = bg.getContext("2d");
          if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            drawBackground(ctx, r.width, r.height, scene);
          }
          backgroundKey = key;
        }
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          draw(ctx, r.width, r.height, s);
        }
      }
      if (now - lastUi > 32) {
        setView({ ...s });
        lastUi = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const finish = () => {
      if (!mouse.current && !keyboard.current) release(sim.current);
    };
    const up = (e: PointerEvent) => {
      if (e.button !== 0) return;
      mouse.current = false;
      finish();
    };
    const blur = () => {
      mouse.current = false;
      keyboard.current = false;
      finish();
    };
    const downKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.target instanceof HTMLButtonElement) return;
      e.preventDefault();
      if (!e.repeat) {
        keyboard.current = true;
        press(sim.current);
      }
    };
    const upKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        keyboard.current = false;
        finish();
      }
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("blur", blur);
    window.addEventListener("keydown", downKey);
    window.addEventListener("keyup", upKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("blur", blur);
      window.removeEventListener("keydown", downKey);
      window.removeEventListener("keyup", upKey);
    };
  }, [scene]);
  const down = (e: React.PointerEvent) => {
    if (
      e.button !== 0 ||
      !(e.target instanceof Element) ||
      e.target.closest("button")
    )
      return;
    e.preventDefault();
    area.current?.focus();
    e.currentTarget.setPointerCapture(e.pointerId);
    mouse.current = true;
    press(sim.current);
  };
  const active = view.phase === "reeling",
    finished = view.phase === "caught" || view.phase === "lost";
  const accurate = Math.abs(view.fishX - view.barX) <= 0.125;
  const phaseLabel = {
    ready: "READY TO CAST",
    charging: "CHARGING",
    casting: "CASTING",
    waiting: "WAITING",
    bite: "BITE",
    reeling: "REELING",
    caught: "CAUGHT",
    lost: "LOST",
  }[view.phase];
  return (
    <main
      className="game"
      ref={area}
      tabIndex={0}
      onPointerDown={down}
      onPointerCancel={() => {
        mouse.current = false;
        if (!keyboard.current) release(sim.current);
      }}
      role="application"
      aria-label="Fishing simulator. Hold left mouse or Space to charge, release to cast. During reeling hold to accelerate right, release to accelerate left."
    >
      <canvas ref={background} className="background" aria-hidden="true" />
      <canvas ref={canvas} className="foreground" aria-hidden="true" />
      <div className="screen-shade" />
      <header className="hud-top">
        <div className="brand">
          <span className="brand-mark">≈</span>
          <div>
            STILLWATER<small>A FISHING EXPEDITION</small>
          </div>
        </div>
        <div className="location">
          <span>◈</span>
          <div>
            {scene.name}
            <small>{scene.subtitle} · DUSK</small>
          </div>
        </div>
        <div className="session">
          <span className="live-dot" /> SOLO WATERS{" "}
          <span className="version">PHASE 01</span>
        </div>
      </header>
      <aside className="hud-left">
        <span className="overline">FIELD JOURNAL</span>
        <div className="journal-row">
          <span className="journal-icon">♢</span>
          <div>
            <strong>{String(stats.caught).padStart(2, "0")}</strong>
            <small>FISH LANDED</small>
          </div>
        </div>
        <div className="journal-details">
          <span>
            Escaped <b>{stats.lost}</b>
          </span>
          <span>
            Best tracking <b>{Math.round(stats.best * 100)}%</b>
          </span>
        </div>
        <div className="rod">
          <span className="overline">EQUIPPED</span>
          <strong>Wayfarer Rod</strong>
          <small>Balanced · Standard reeling</small>
          <div className="rod-rating">
            <i />
            <i />
            <i />
            <i className="dim" />
            <i className="dim" />
          </div>
        </div>
      </aside>
      <aside className="hud-right">
        <span className="overline">EXPEDITION 001</span>
        <div className="compass">
          N <span>✧</span> E
        </div>
        <small>CALM SEAS · EIGHT SPECIES</small>
      </aside>
      <span className="pill phase-badge">{phaseLabel}</span>
      {view.phase === "ready" && (
        <section className="idle-prompt">
          <div className="ornament">──── ◇ ────</div>
          <span className="overline">THERE'S A STORY BELOW THE SURFACE</span>
          <h1>One more cast.</h1>
          <p>Leave the world behind. Follow the line.</p>
          <div className="start-hint">
            <kbd>LMB</kbd>
            <span>HOLD TO CAST</span>
            <span className="hint-arrow">↑</span>
          </div>
        </section>
      )}
      {view.phase === "charging" && (
        <section className="casting-panel">
          <span className="overline">MAKE IT COUNT</span>
          <h2>Release at the peak</h2>
          <div className="charge-head">
            <span>CAST POWER</span>
            <strong>
              {Math.round(view.power * 100)}
              <small>%</small>
            </strong>
          </div>
          <div className="charge-track">
            <div style={{ width: `${view.power * 100}%` }} />
            <span className="sweet-spot" />
          </div>
          <div className="charge-ticks">
            <span>0</span>
            <span>50</span>
            <span>PERFECT</span>
          </div>
        </section>
      )}
      {view.phase === "casting" && (
        <div className="water-message cast-message">
          <span>↗</span>
          <h2>{Math.round(view.castPower * 100)}% POWER</h2>
          <p>Line away</p>
        </div>
      )}
      {view.phase === "waiting" && (
        <div className="water-message">
          <div className="waiting-orbit">◌</div>
          <h2>Patience is part of the catch.</h2>
          <p>
            Waiting for a bite<span className="dots"> ···</span>
          </p>
        </div>
      )}
      {view.phase === "bite" && (
        <div className="bite-message">
          <strong>!</strong>
          <h2>FISH ON</h2>
          <span>Get ready to reel</span>
        </div>
      )}
      {active && (
        <section className={`reel-panel ${accurate ? "tracking" : ""}`}>
          <div className="reel-top">
            <div>
              <span className="overline">FISH ON THE LINE</span>
              <h2>{view.fish.name}</h2>
            </div>
            <div className="fish-difficulty">
              <span style={{ color: view.fish.color }}>{view.fish.rarity}</span>
              <small>DIFFICULTY {view.fish.difficulty}/8</small>
            </div>
          </div>
          <div className="track-caption">
            <span>◁ RELEASE</span>
            <strong>{accurate ? "KEEP IT STEADY" : "FOLLOW THE FISH"}</strong>
            <span>HOLD ▷</span>
          </div>
          <div className="reel-track">
            <div className="track-ruler" />
            <div
              className="control-bar"
              style={{ left: `${(view.barX - 0.125) * 100}%` }}
            >
              <span>‹</span>
              <span>›</span>
            </div>
            <div
              className="fish-marker"
              style={{ left: `${view.fishX * 100}%` }}
            >
              ◆
            </div>
          </div>
          <div className="progress-label">
            <span>CATCH PROGRESS</span>
            <strong>{Math.round(view.progress * 100)}%</strong>
          </div>
          <div className="catch-meter">
            <i style={{ width: `${view.progress * 100}%` }} />
          </div>
          <p className="reel-help">
            Keep the fish inside your bar. Anticipate its movement.
          </p>
        </section>
      )}
      {finished && (
        <section
          className={`result-overlay ${view.phase}`}
          key={view.phase}
          aria-live="polite"
        >
          <div
            className="result-panel"
            style={{ "--fish-color": view.fish.color } as React.CSSProperties}
          >
            <div className="ornament">──── ◇ ────</div>
            <span className="overline">
              {view.phase === "caught"
                ? "A MOMENT WORTH KEEPING"
                : "THE WATER WINS THIS TIME"}
            </span>
            <h1>
              {view.phase === "caught" ? "Beautiful catch." : "Slipped away."}
            </h1>
            {view.phase === "caught" ? (
              <div className="fish-reveal">
                <div className="reveal-rays" />
                <FishArt fish={view.fish} />
                <span className="spark s1">✧</span>
                <span className="spark s2">✧</span>
                <span className="spark s3">·</span>
              </div>
            ) : (
              <div className="escape-art">
                ≈<span>↗</span>
              </div>
            )}
            <div className="rarity" style={{ color: view.fish.color }}>
              {view.fish.rarity.toUpperCase()}
            </div>
            <h2>{view.fish.name}</h2>
            <div className="result-meta">
              <span>
                DIFFICULTY <b>{view.fish.difficulty}/8</b>
              </span>
              <span>
                TRACKING{" "}
                <b>
                  {Math.round(
                    (view.inside / Math.max(0.01, view.elapsed)) * 100,
                  )}
                  %
                </b>
              </span>
              <span>
                TIME <b>{view.elapsed.toFixed(1)}s</b>
              </span>
            </div>
            <p>
              {view.phase === "caught"
                ? "A small discovery. An endless ocean."
                : "A lighter touch, a little patience. Try again."}
            </p>
            <button className="primary" onClick={reset}>
              Cast again <span>↗</span>
            </button>
          </div>
        </section>
      )}
      <footer className="hud-bottom">
        <div className="control-guide">
          <kbd>LMB</kbd>
          <div>
            <strong>HOLD & RELEASE</strong>
            <small>
              {active
                ? "Hold → right · Release → left"
                : "Charge your cast · Release to throw"}
            </small>
          </div>
          <span className="keyboard">or SPACE</span>
        </div>
        <span className="footer-note">
          ORIGINAL WATERS. ENDLESS POSSIBILITIES.
        </span>
        <button className="restart" onClick={reset}>
          ↻ <span>Restart</span>
        </button>
      </footer>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
