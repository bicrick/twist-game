# Twist

A puzzle game about glued, twisted and solid edges, starring a cast of soft clay bots. Play it at **https://twist-game.vercel.app** (desktop or phone; installable and works offline).

Four worlds, one mechanic each, and each world has its own bot:

| World | Mechanic | Bot |
|---|---|---|
| Twist | Walk off a glued edge and come back on the other side. Twisted edges flip you (and anything you push) over. | blue cloud |
| Slide | A pushed block keeps sliding until something stops it. | violet teardrop |
| Warp | Step on a portal and come out of its partner. Some portals mirror you. | teal hexagon |
| Gate | Plates hold gates open while something rests on them. | lime triangle |

Every world also has optional **challenge levels** (9 in all) (they never block progress). Put every block on its outline, and the bot on its own outline, with the same orientation.

## Controls
- **Keyboard:** WASD / arrows move, `Z` undo, `Y` redo, `R` reset, `Esc` pause (back in menus), `Tab` menu, `N` mute.
- **Touch:** on-screen pad (D-pad, Reset, Undo, Redo, Back, Menu) or swipe.

## Testing on a real phone
Open `https://twist-game.vercel.app/?debug=1` and screenshot the small panel (frame rate, viewport, touch type, safe-area insets, installed/offline state). Add to Home Screen to try the installed version.

## Audits
`node tools/audit_levels.mjs` (level variety / difficulty ramp) and `npm i --no-save puppeteer-core && node tools/audit_touch.mjs` (real-Chrome touch audit across phone/tablet profiles; defaults to the live site).

## Develop
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # every level is solvable + unique, room maps valid
npm run build    # static site in dist/
npm run deploy   # vercel production deploy
```
Levels are found by a random search verified with a BFS solver (`tools/gen_level.js`). See `CLAUDE.md` for the architecture and design rules.
