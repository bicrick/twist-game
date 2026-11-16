# Twist

Original tile puzzle game (Baba Is You / Patrick's Parabox spirit). Static web game: vanilla JS ES modules + CSS, built/served with Vite. Target: playable on desktop and mobile.
Controls are WASD/arrows, `z` undo, `r` restart, `Esc`/`m` back, `n` mute. Swipe moves on touch. Keys never invert.

## Run
- `npm install`, `npm run dev` (http://localhost:5173), `npm run build` (static site in `dist/`), `npm test` (every level solvable, no duplicates).

## Rules
- Board W x H. Each axis edge (`lr`, `tb`) is `none` (solid), `plain` (glued) or `twist` (glued with a flip).
  Crossing an `lr` twist flips `fy` and mirrors the row; crossing a `tb` twist flips `fx` and mirrors the column.
- Every piece (player, blocks) has orientation {fx, fy}. Pieces flip when crossing twisted seams.
- World 2 mechanic, mirror pads: entering a pad cell flips `fx` (pad 'x') or `fy` (pad 'y'), for the player or a pushed block.
- Pushing chains of blocks is allowed (a chain may wrap into the player's vacated cell).
- Win: every target has a block with identical position + orientation AND the player is on `home` (position + orientation).

## Layout (one concern per file; keep it that way)
- `index.html` shell only. `css/`: `base.css` (tokens + HUD, restyle from here), `board.css`, `pieces.css`, `rooms.css`.
- `src/engine/engine.js`: pure rules (parseLevel, nxt, flip, step, stepEvents, isWin). No DOM; Node tools import it directly.
- `src/data/worlds.js` lists worlds in unlock order; one file per world in `src/data/worlds/`. Level: `{w,h,lr,tb,walls:[[r,c]],pads:[[r,c,'x'|'y']],player:[r,c,fx,fy],home:[r,c,fx,fy],blocks:[...],targets:[...]}`.
- `src/audio/sfx.js`: every sound, by game event, using the `cuelume` npm package (synthesized Web Audio). Retune sounds only here.
- `src/state/progress.js`: localStorage (`twist-done2`, `twist-seen`, `twist-sound`). Do not rename keys.
- `src/ui/`: `app.js` router (hub -> world room -> level), `rooms.js` (hub + world rooms), `level.js` (play), `board.js` (shared board: seams + tiled reflected copies; used by levels AND rooms), `layout.js` (one global cell size so zoom stays consistent), `pieces.js`, `input.js` (keyboard + swipe -> intents), `theme.js`, `banner.js`, `nav.js` (breaks import cycles).
- Test hooks on `window`: `__enter(w,l)`, `__world(w)`, `__hub()`, `__done()`, `__set(f)`.

## Tools (tools/, run with node)
- `lib.js`: `solve(def,maxStates)` BFS solver on the real engine. `gen.js '<cfg json>' <seed>` generates levels by scrambling a solved state; `genall.js` runs all tiers.
- `paths.js` writes `tools/paths.json` (solutions); replay them through real key events in the browser after changing levels or the engine. `archive/` is history, not maintained.

## Design preferences (from the user)
Parabox-like flat pastel look; no instruction sidebars; no gridlines; walls are irregular rounded stones; blocks are bananas (orientation visible via ghost outline; no red error tooltips); player has no ear/blob; matched targets glow green. Keep styling simple and centralized (CSS tokens) so it is easy to change later. Wants "handshake" puzzles solved by reasoning backwards, not brute force.
Menu rooms look like levels (seams + reflections); their seams are decorative only. World 1 has 10 levels, keep worlds short.

## Next up / ideas
- Mobile UI styled like a Game Boy Advanced emulator: on-screen D-pad (WASD) + buttons (undo/restart/back), as a separate module feeding the intents in `input.js`.
- Later: TypeScript for engine + data, PWA, third world, seam stones, interior seams, orientation gates, chiral multi-cell pieces, hints, level editor.
- Corner reflections on boards with both axes twisted are decorative approximations. Generated levels are uneven in difficulty; playtest and prune.
