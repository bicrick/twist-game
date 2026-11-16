# Twist

A puzzle game: a Patrick's-Parabox-style world of glued / twisted / solid edges, populated by Grok-bot-style clay bots. Static web game (vanilla JS ES modules + CSS, Vite). Plays on desktop and mobile; installable (manifest + offline service worker).
The whole idea, in the user's words: *a Grok-bot-esque twist on Patrick's Parabox*. Keep it original (not a clone): own mechanics, own title screen, own bots.

## Run / test
- `npm install`, `npm run dev` (http://localhost:5173), `npm run build` (static site in `dist/`), `npm test` (every level solvable + unique, room maps valid, groups valid).
- `npm run paths` writes `tools/paths.json` (solutions for every level). Replay them in the browser through real key events to verify a full playthrough (see "Verification").
- CI: `.github/workflows/pages.yml` tests, builds and deploys `dist/` to GitHub Pages on push to main.

## Game
Four macro worlds in unlock order, one mechanic each (a new behaviour = a new guy):
1. **Twist** (violet, blue cloud bot): edges are `none` (solid), `plain` (glued) or `twist` (glued with a flip). Crossing an `lr` twist flips `fy`; a `tb` twist flips `fx`. 10 main + 2 challenge.
2. **Slide** (green, violet teardrop bot, `slide:true` levels): a pushed block keeps sliding until a wall / solid border / another block / the player stops it; flips on twisted seams. 6 + 2.
3. **Warp** (rose, teal hexagon bot, `portals`): stepping on a portal puts you out of its partner (`flip:'x'|'y'` mirrors you on the way). Pieces too. 6 + 2.
4. **Gate** (cyan, lime triangle bot, `plates`/`gates`): a gate is open while any piece (bot or block) rests on a plate with the same id. 6 + 2.
Every piece has orientation {fx, fy}. Win: every target has a block with identical position + orientation AND the bot is on `home` (position + orientation). Blocks are little orange pebble bots (identical, identity-free). Mirror pads (`pads`) still exist in the engine but no world uses them.
- **Groups** (`groups` in a world file): levels in a group are free-order; a group opens when the previous group is fully solved (locked doors are greyed out with a lock). **Challenge levels** (`challenge:true`, listed last) are optional: they open once the world's main levels are done and never gate the next world. Finishing a main level auto-advances to the next one in its group order; the last one returns to the room/hub.
- Controls: WASD/arrows move, `z` undo, `y` redo, `r` reset level, `Esc` pause menu (in a level) / back, `Tab`/`p` menu, `n` mute, Enter/Space start. Touch: on-screen pad (below) or swipe.

## Layout (one concern per file; keep it that way)
- `index.html` shell + shared SVG defs (bot gradients, `#shapes`). `css/`: `base.css` (tokens, HUD, particles, transitions), `board.css`, `pieces.css`, `rooms.css`, `controls.css`, `title.css`, `menu.css`.
- `src/engine/engine.js`: pure rules (`parseLevel`, `nxt`, `step`, `stepSlide`, `openGates`, `stepEvents`, `isWin`). No DOM; Node tools import it.
- `src/data/worlds.js` lists the worlds; one file per world in `src/data/worlds/` (name, hue, `bot`, icon, groups, ASCII room map, levels). `src/data/roommap.js` parses room maps (crops + 1-cell margin; `.` floor `,` trail `X` back door `0-9a-z` level index; adjacent path cells are joined).
- Level: `{w,h,lr,tb,walls:[[r,c]],player:[r,c,fx,fy],home:[r,c,fx,fy],blocks:[...],targets:[...], slide?, portals?:[[r1,c1,r2,c2,flip?]], plates?:[[r,c,id]], gates?:[[r,c,id]], pads?, challenge?}`.
- `src/audio/sfx.js`: every sound by game event (Cuelume cues; seam/reflection/portal crossing and entering a world use `count`). `src/state/progress.js` (levels done, groups, `twist-done4`), `src/state/settings.js` (`twist-settings`: sound, volume, style, reduce motion, trail, haptics).
- `src/ui/`: `app.js` router + the shared intents, `title.js`, `rooms.js` (hub 2x2 + world rooms), `level.js` (play, undo/redo, gates, warp animation), `board.js` (shared board: reflections + solid-edge rims), `layout.js` (sizing), `pieces.js` + `botshape.js` + `bot.js` (bots), `fx.js` (puffs), `particles.js`, `transition.js` (`swap()`: every screen change), `menu.js` + `menus.js` (pause / settings), `controls.js` (touch pad), `input.js` (keyboard + swipe), `hud.js`, `preview.js`, `palette.js`, `theme.js`, `nav.js`.
- Test hooks on `window`: `__enter(w,l)`, `__world(w)`, `__hub()`, `__done()`, `__progress`, `__level` (`peek()`, `move/undo/redo`), `__set(f)`.

## Design: Parabox x Grok bot
- Dark, hue-tinted worlds (per-world hue in `ui/theme.js`), a white 2px bounding frame, **bright clay wall slabs that merge** with each other and with the solid-edge rim (`wn/we/ws/ww` classes in `level.js`), soft shadows, system sans. Boards are SQUARE-edged (glued worlds tile edge-to-edge with faded mirrored reflections); everything else is squircle. No seam lines. Solid edges are a flat wall rim (`.rim`, square-ended).
- Each world has its own bot: lopsided on purpose so orientation reads from the outline (cloud / teardrop / hexagon / triangle, each a different colour that never matches the world's wall hue). Eyes follow the pointer / last move, blink, idle-glance; squash + hop per step; puffs trail behind. Goals are outlines of the same bot / pebble; they turn green when matched.
- Home screen: its own identity (hero bot watching your pointer, rounded "Twist", Play, crowd of varied bots). Do NOT mimic Parabox's title (no keycaps, no gray squares, no framed-letter wordmark). Dim squircle particles drift behind every screen.
- Text only: no banners, no level title chip, no hint text. Back button is fine.
- Menu rooms are plain framed boxes, compact (doors adjacent, joined by short connectors); no reflections in menus.
- Pad (touch / narrow): D-pad (slides between directions) + Reset / Undo / Redo icon buttons (greyed when unavailable) + plain Back and Menu buttons. Landscape puts D-pad left, actions right.
- User dislikes: antenna/stripes on bots, dash-shaped faces, pink player, rounded seam lines, big titles, spacious rooms, being zoomed out.

## Content
- Levels come from random search verified by the BFS solver: `tools/gen_level.js '<cfg>' <seed>` (time-boxed; any mechanic: slide, portals, plates/gates, flips) and `tools/gen_batch.js tiers.json` (parallel). Pick by length / pushes / mechanic use; keep difficulty rising inside a group.
- `tools/lib.js` `solve(def)` BFS on the real engine. `tools/archive/` is history (old Mirror world etc.).

## Performance rules
- Reflections: just enough copies to cover the screen (`MAX_PANES` 49), sparse DOM (no nodes for empty cells), no blur / filters / animation inside `.copy`. Move pieces with `transform`, never `left/top`. Avoid per-piece forced reflows. No pop-in: build while hidden (`#stage.building`), reveal via `swap()`.

## Verification (done for the shipped build)
- Full playthrough through the real UI flow with key presses (title -> hub -> world, auto-advance, unlocks, group gating, challenges): all 36 levels solved, 0 errors. Undo/redo round trip checked via `__level`. Audited at 1440x900, 412x798, 390x844, 360x640, 844x390 (landscape pad). Median frame ~8 ms (120 Hz), worst < 10 ms.

## Ideas / next
- More levels per world; a fifth mechanic; hints; level editor; TypeScript for engine + data; sound/music pass (not heard by the author yet).
