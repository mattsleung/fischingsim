# Stillwater — Fisching Simulator

A standalone 2D fishing mechanics sandbox inspired by Fisch. Built with TypeScript, React, Vite, and HTML Canvas. It does not connect to Roblox.

## Play immediately without installation

Download the supplied `stillwater.html` file and double-click it to open in Chrome or Safari. It contains the production app, styles, and Canvas scenery in a single file. No server or network connection is required. If your browser displays source text, make sure the filename ends in `.html`, then use the browser's File → Open File menu.

To regenerate this export from source, run `npm ci` followed by `npm run export:play`. The result is `dist/stillwater.html`.

## Run locally (Apple M4 / macOS)

Install the native Apple Silicon **Node.js 22 or 24 LTS** from https://nodejs.org (choose the macOS ARM64 installer). No Rosetta, Xcode, or backend service is required.

Use the complete project folder from this workspace (or download and extract the supplied project ZIP). These files must be copied to your Mac; cloning GitHub only includes changes after they have been committed and pushed.

In Terminal, replace the example path with the folder you extracted:

```sh
cd ~/Downloads/fischingsim
node --version
npm ci
npm run dev -- --host 127.0.0.1
```

Open the local URL printed by Vite (normally `http://localhost:5173/fischingsim/`). Use a current Safari, Chrome, or Firefox. On a Mac trackpad, click and hold with one finger, or use Space for the same controls.

```sh
npm test          # deterministic simulation tests
npm run build     # strict TypeScript check + production bundle
npm run preview   # serve the built production bundle
```

## Play

The camera is fixed and there is no player movement. A softly blurred, original block-shaped angler is drawn into the static third-person dock backdrop. Only the rod, line, bobber, and fishing overlays animate. One of three original coastal scene presets is selected at page load; it remains unchanged when you restart or fish again. Reload the page for another random selection.

1. Hold the left mouse button on the water (or hold Space) to charge. Release near the power meter's peak to cast. Power gives a modest initial catch-progress bonus.
2. Watch the 0.65-second casting animation, then wait 1.5–4 seconds for a bite. Click the moving **SHAKE** circle three times to set the hook; the FISH ON cue then leads into reeling. Space also activates a shake prompt, and a focused prompt supports Enter. There is no timer on the shake phase. A fish is chosen at cast time from eight fictional species.
3. Keep the glowing fish diamond inside the white control bar. Hold to accelerate right; release to accelerate left. The bar retains momentum, has drag, and stops at track boundaries.
4. Tracking fills catch progress; missing drains it. Full progress catches the fish; zero loses it.
5. A successful catch reveals an original illustrated fish, rarity, difficulty, tracking accuracy, and fight time. An escape has its own result animation. Select **Cast again** or **Restart**. Restart cancels the current attempt while preserving session statistics. Reloading clears session statistics.

Best tracking accuracy is the highest percentage of reeling time spent overlapping the fish in a completed attempt, including escaped fish. Difficulty runs from 1–8.

## Structure

- `src/fish.ts`: eight species definitions, rarity, difficulty, color, speed, acceleration, direction-change frequency, and drift/dart/surge behavior.
- `src/fishBehavior.ts`: smooth randomized target velocities with species-specific movement profiles.
- `src/scenes.ts`: three session-level static scene presets.
- `src/FishArt.tsx`: original geometric SVG fish illustrations and species markings.
- `src/simulation.ts`: independent state machine and fish/player physics; injectable randomness enables deterministic tests. Positions are normalized, movement uses acceleration and velocity, and delta time is capped at 100 ms with 120 Hz substeps to avoid jumps after a hidden tab resumes.
- `src/render.ts`: original Canvas scenery cached on a background layer, plus a separate animated rod, line, and bobber layer. The React HUD renders the normalized fishing track for crisp responsive controls.
- `src/main.tsx`: pointer/keyboard input, requestAnimationFrame loop, responsive high-DPI canvas sizing, React interface, and session statistics. UI snapshots update at about 25 Hz; simulation and canvas run on each animation frame.
- `src/simulation.test.ts`: casting, bite timing, shake gating and prompt positions, all fish movement, boundaries, inertia, win/loss, and frame-rate consistency tests.
- `src/style.css`: responsive ocean interface with no required remote assets.

All scene art, fish illustrations, and interface elements are original code-drawn artwork; no Roblox or Fisch assets are included.

Future modes can reuse the input/render loop and introduce their own simulation state. Phase 1 includes standard reeling only; Pinion's Aria, adjustable rod settings, persistent catch history, and alternative casting modes are intentionally deferred.

No credentials, database, external API, or runtime network connection is required. Vite binds to all interfaces for cloud development; use `npm run dev -- --host 127.0.0.1` if you want local-only access.

Stop the server with **Control-C** in Terminal. Start it again with the same `npm run dev` command; dependencies only need reinstalling when the lockfile changes. If port 5173 is occupied, use the URL Vite prints instead. If `node` or `npm` is not found after installation, open a new Terminal window. Do not open `index.html` directly in Finder; Vite must serve the app.

## Deploy to GitHub Pages

This project is configured for **mattsleung/fischingsim**, with Vite's base path `/fischingsim/`. The expected site address after a successful deployment is:

https://mattsleung.github.io/fischingsim/

1. Open this repository on GitHub and go to **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**. Do not select a branch publishing source.
3. In **Settings → Actions → General**, ensure GitHub Actions is enabled and the actions in `.github/workflows/pages.yml` are permitted. The workflow grants the deployment job `pages: write` and `id-token: write`; no personal access token or repository secret is needed.
4. Merge the deployment pull request into **main**. Every push to main tests, builds, and deploys the `dist` folder. Pull requests run tests and build only; they do not publish.
5. Open **Actions → Deploy simulator to GitHub Pages** and wait for both jobs to pass. Open the URL in the deployment summary. If you enabled Pages after merging, select **Run workflow** with branch **main**.

For a private repository, your GitHub plan must support Pages. If deployment is awaiting environment approval, approve it in the workflow run according to the repository's `github-pages` environment rules. Only this simulator repository is involved.

To check the production site locally, run `npm run build` then `npm run preview`, and open `http://localhost:4173/fischingsim/`. The app targets current Chrome and Safari (Safari 16.4+ for Canvas roundRect). Validate mouse hold/release and a complete catch on both browsers on your Mac; Linux Chromium checks do not establish native macOS Safari compatibility.

If the repository is renamed, update `base` in `vite.config.ts` and the prefix removed by `scripts/export-standalone.mjs`. The standalone HTML export remains available through `npm run export:play`.

## Visual direction

The current presentation uses a fixed, softly blurred third-person angler, high-contrast outlined fishing text, an interactive circle prompt, a horizontal white catch bar, a dark fish marker, and a green progress meter. All geometry and illustrations are original. No reference screenshots were attached in the implementation conversation, so exact screenshot layout comparisons remain pending. The reference game is not connected to this app.
