# Fisch visual reference research

## Status: references required before implementation

The requested research-first visual pass is blocked. This environment has no web search/browsing connector, and its network proxy rejected each of the requests below with HTTP 403. No page content, screenshots, or video footage was viewed. These are attempted sources, **not consulted references**.

| Attempted URL | Intended research | Observed result |
| --- | --- | --- |
| https://www.youtube.com/results?search_query=Fisch+Roblox+reeling+minigame | Gameplay footage, camera, UI proportions, and transitions | Proxy CONNECT rejected: HTTP 403 |
| https://www.google.com/search?q=Fisch+Roblox+Pinion+Aria+gameplay | Locate Pinion's Aria footage and mechanics documentation | Proxy CONNECT rejected: HTTP 403 |
| https://fisch.fandom.com/wiki/Fishing | Fishing sequence and visual reference material | Proxy CONNECT rejected: HTTP 403 |

No new visual implementation or Pinion's Aria behavior should be presented as reference-verified based on these attempts. The existing simulator remains available; its prior visual design was based on the user's written requirements.

## Reference material needed

Upload screenshots or clips directly into the conversation; external links alone may remain inaccessible in this environment. For each, include a source URL and video timestamp if available.

- Full-screen casting screenshot showing the meter, character, rod, and water.
- Full-screen SHAKE screenshot, plus footage showing prompt movement, feedback, and the transition into reeling.
- Full-screen normal reeling screenshot showing the entire track, fish indicator, control bar, progress display, and surrounding HUD.
- Catch reveal screenshot and a short cast-to-catch clip for animation timing and transitions.
- Pinion's Aria clip covering its special mechanic, including input actions and success/failure. Its behavior remains unverified; do not infer it from the name.

Keep the game viewport and HUD visible rather than cropping to an individual widget; this is necessary to measure relative positioning and scale.

## Comparison procedure once references are available

1. Record the source URL or uploaded filename, timestamp, and viewport dimensions for each reference.
2. Describe only observed layout, fonts, colors, borders, transparency, character framing, and movement behavior. Explicitly mark uncertain measurements and unseen transitions.
3. Capture the simulator at the same gameplay phases and a comparable viewport.
4. List the five largest observed visual differences, with corresponding reference and simulator captures.
5. Correct those differences using original code and art; repeat the captures and comparison.
6. Recheck mouse gameplay, simulation tests, production build, and the GitHub Pages repository base path before pushing implementation changes.

No reference comparison or native macOS browser verification has been performed for this pending visual pass.
