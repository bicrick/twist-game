# Twist

Original tile puzzle game about glued, twisted and solid edges (Patrick's Parabox spirit, own mechanics). Static web game: vanilla JS ES modules + CSS, built/served with Vite. Target: playable on desktop and mobile.
Controls are WASD/arrows, `z` undo, `r` restart, `Esc`/`m` back, `n` mute. On touch/small screens a GBA-style pad appears (`ui/controls.js`, `css/controls.css`; `?pad=1` forces it): D-pad = move, A = undo, B = back, Start = restart, Select = mute. Keys never invert.

## Run
- `npm install`, `npm run dev` (http://localhost:5173), `npm run build` (static site in `dist/`), `npm test` (every level solvable, no duplicates).

## Rules
- Board W x H. Each axis edge (`lr`, `tb`) is `none` (solid), `plain` (glued) or `twist` (glued with a flip).
  Crossing an `lr` twist flips `fy` and mirrors the row; crossing a `tb` twist flips `fx` and mirrors the column.
- Every piece (player, blocks) has orientation {fx, fy}. Pieces flip when crossing twisted seams.
- World 2 (Slide, `slide:true` levels): a pushed block keeps sliding until a wall, solid border or another block stops it (it still flips on twisted seams); blocks never push each other. Mirror pads (`pads`) are still supported by the engine but no world uses them (the Mirror world was retired).
- Pushing chains of blocks is allowed in normal levels (a chain may wrap into the player's vacated cell).
- Win: every target has a block with identical position + orientation AND the player is on `home` (position + orientation).

## Layout (one concern per file; keep it that way)
- `index.html` shell only. `css/`: `base.css` (tokens + HUD, restyle from here), `board.css`, `pieces.css`, `rooms.css`.
- `src/engine/engine.js`: pure rules (parseLevel, nxt, flip, step, stepEvents, isWin). No DOM; Node tools import it directly.
- `src/data/worlds.js` lists worlds in unlock order; one file per world in `src/data/worlds/` (levels + room map). Level: `{w,h,lr,tb,walls:[[r,c]],pads:[[r,c,'x'|'y']],player:[r,c,fx,fy],home:[r,c,fx,fy],blocks:[...],targets:[...]}`.
- `src/audio/sfx.js`: every sound, by game event, using the `cuelume` npm package (synthesized Web Audio, "press" theme). Retune sounds only here; cue choices follow the table in node_modules/cuelume/README.md.
- `src/state/progress.js`: localStorage (`twist-done3`, `twist-seen2`, `twist-sound`). Do not rename keys.
- `src/ui/`: `app.js` router (hub -> world room -> level), `rooms.js` (hub + world rooms), `title.js`, `hud.js`, `fx.js`, `bot.js`, `botshape.js`, `preview.js`, `level.js` (play), `board.js` (shared board: seams + tiled reflected copies; used by levels AND rooms), `layout.js` (one global cell size so zoom stays consistent), `pieces.js`, `input.js` (keyboard + swipe -> intents), `controls.js` (on-screen pad -> same intents), `transition.js` (every screen change goes through `swap()`: zoom in/out or fade, built hidden, input locked; never rebuild a screen directly), `theme.js`, `nav.js` (breaks import cycles).
- Test hooks on `window`: `__enter(w,l)`, `__world(w)`, `__hub()`, `__done()`, `__set(f)`.

## Tools (tools/, run with node)
- `lib.js`: `solve(def,maxStates)` BFS solver on the real engine. `gen_slide.js '<cfg json>' <seed> [tries]` random-searches Slide levels (solvable, min pushes, length window) and prints the best; `gen.js`/`genall.js` are the older scramble generators.
- `paths.js` writes `tools/paths.json` (solutions); replay them through real key events in the browser after changing levels or the engine. `archive/` is history, not maintained.

## Design (light, soft clay squircles; inspired by the Grok Bot app / grokbots.ai studio)
- Tokens live in `css/base.css`; per-world colours in `ui/theme.js` + `hue` in each world file (Twist blue 215, Slide green 150, hub neutral). Light airy backdrop, near-white board, vivid clay walls with a darker underside, soft shadows, no hard outlines, system sans.
- Everything is a squircle EXCEPT the boards: board edges are square so a glued world tiles edge-to-edge with its mirrored reflections. Solid edges are drawn as a clay wall rim (`.rim`, `board.js`); glued edges have no line at all. Never put rounded corners or seam lines on the board.
- The player is a pink clay CLOUD with white capsule eyes (`ui/botshape.js` traces the lopsided outline once; `ui/pieces.js`, `ui/bot.js`). The silhouette is deliberately lopsided so mirrored / upside-down is readable with no extra marks (no antenna, no stripes: the user hated those). Eyes follow the pointer / last move, blink, idle-glance; it squashes + hops per step and leaves puffs (`ui/fx.js`). Its goal is an outline of the same cloud; blocks are clay carrots (asymmetric: leaves + tip).
- Title screen (`ui/title.js`): hero bot + drifting bots in varied shapes/faces. No dash-shaped (sleepy/wink) faces.
- Text: only the small level title + target dots above the board (`#top`). NO banners, big titles, hint text or instruction sidebars. Back button is fine.
- World rooms are clean (no stones, no gridlines), 1-cell margin, player starts on the back button. Finishing a level moves straight to the next one in the world.
- Wants "handshake" puzzles solved by reasoning backwards, not brute force. Keep styling simple and centralized.

## Performance rules
- Reflections are decoration: tile just enough copies to cover the screen (`MAX_PANES` 49 in board.js), sparse DOM (no nodes for empty cells), no blur/filters/animation inside `.copy`. Move pieces with `transform`, never `left/top`. Avoid forced reflows (`offsetWidth`) per piece.
- No pop-in: build while hidden (`#stage.building` disables transitions), reveal via `swap()`.

## Next up / ideas
- Playtest + rebalance difficulty/order (Twist levels come from the generator; Slide has 4 hand-picked search results). More Slide levels via `gen_slide.js`; a third mechanic/world.
- Later: TypeScript for engine + data, PWA, seam stones, interior seams, orientation gates, chiral multi-cell pieces, hints, level editor.
- Landscape touch layout (D-pad left / buttons right) is written but not checked on a real device.
