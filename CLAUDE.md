# Twist

Original tile puzzle game (Baba Is You / Patrick's Parabox spirit). Static web game: vanilla JS ES modules + CSS, built/served with Vite. Target: playable on desktop and mobile.
Controls are WASD/arrows, `z` undo, `r` restart, `Esc`/`m` back, `n` mute. On touch/small screens a GBA-style pad appears (`ui/controls.js`, `css/controls.css`; `?pad=1` forces it): D-pad = move, A = undo, B = back, Start = restart, Select = mute. Keys never invert.

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
- `src/data/worlds.js` lists worlds in unlock order; one file per world in `src/data/worlds/` (levels + room map). Level: `{w,h,lr,tb,walls:[[r,c]],pads:[[r,c,'x'|'y']],player:[r,c,fx,fy],home:[r,c,fx,fy],blocks:[...],targets:[...]}`.
- `src/audio/sfx.js`: every sound, by game event, using the `cuelume` npm package (synthesized Web Audio, "press" theme). Retune sounds only here; cue choices follow the table in node_modules/cuelume/README.md.
- `src/state/progress.js`: localStorage (`twist-done2`, `twist-seen`, `twist-sound`). Do not rename keys.
- `src/ui/`: `app.js` router (hub -> world room -> level), `rooms.js` (hub + world rooms), `level.js` (play), `board.js` (shared board: seams + tiled reflected copies; used by levels AND rooms), `layout.js` (one global cell size so zoom stays consistent), `pieces.js`, `input.js` (keyboard + swipe -> intents), `controls.js` (on-screen pad -> same intents), `transition.js` (every screen change goes through `swap()`: zoom in/out or fade, built hidden, input locked; never rebuild a screen directly), `theme.js`, `banner.js`, `nav.js` (breaks import cycles).
- Test hooks on `window`: `__enter(w,l)`, `__world(w)`, `__hub()`, `__done()`, `__set(f)`.

## Tools (tools/, run with node)
- `lib.js`: `solve(def,maxStates)` BFS solver on the real engine. `gen.js '<cfg json>' <seed>` generates levels by scrambling a solved state; `genall.js` runs all tiers.
- `paths.js` writes `tools/paths.json` (solutions); replay them through real key events in the browser after changing levels or the engine. `archive/` is history, not maintained.

## Design (Patrick's Parabox look; user wants this direction, restyle freely from the tokens)
- Flat fills only, black outlines + hard offset shadows, NO gradients/glows/blur/vignette. Zero corner radius in the game world (boards, walls, pieces, doors, goals); only the touch pad may round (`--r-ui`, A/B circles).
- Palette (tokens in `css/base.css`, per-world hues in `ui/theme.js` + `hue` in each world file): dark tinted world (`--bg`, `--floor`), bright walls with a darker band underneath (`--wall`, `--wall-shade`), player orange-red, blocks (bananas) yellow, goals = solid outlines of what belongs there turning green (`--okc`) when matched, seams mint (plain) / amber (twist) hairlines, mirror pads cyan. Hub is green, Twist blue (205), Mirror violet (285).
- Text only appears in `#top`, directly above the current board (title left, target squares right, banners above). No hint text, no instruction sidebars.
- Level doors are flat boxes with a thumbnail (canvas image, `ui/preview.js`) and a tick; world rooms are clean (no stones, no gridlines), maps get a 1-cell margin so nothing touches the border.
- Finishing a level moves straight on to the next one in the world (last level -> room, or hub + banner if the world is newly complete).
- Wants "handshake" puzzles solved by reasoning backwards, not brute force. Keep styling simple and centralized.

## Performance rules
- Reflections are decoration: max 15 panes (`MAX_PANES` in board.js), no blur/filters/shadows inside `.copy`. Move pieces with `transform`, never `left/top`. Avoid forced reflows (`offsetWidth`) per piece.
- No pop-in: build while hidden (`#stage.building` disables transitions), reveal via `swap()`.
- Seams are drawn as coloured lines only (the old edge arrows were removed on purpose).

## Next up / ideas
- Mobile UI styled like a Game Boy Advanced emulator: on-screen D-pad (WASD) + buttons (undo/restart/back), as a separate module feeding the intents in `input.js`.
- Later: TypeScript for engine + data, PWA, third world, seam stones, interior seams, orientation gates, chiral multi-cell pieces, hints, level editor.
- Corner reflections on boards with both axes twisted are decorative approximations. Generated levels are uneven in difficulty; playtest and prune.
