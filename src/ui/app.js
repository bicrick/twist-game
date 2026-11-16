// Screen router: hub -> world room -> level. Owns which screen is showing.
import { nav } from './nav.js';
import { showHub, showWorld, roomMove } from './rooms.js';
import * as level from './level.js';
import { bindInput } from './input.js';
import { sfx } from '../audio/sfx.js';
import * as progress from '../state/progress.js';

let mode = 'hub', world = 0;

export function startApp() {
  nav.hub = from => { mode = 'hub'; showHub(from); };
  nav.world = (w, from) => { mode = 'world'; world = w; showWorld(w, from); };
  nav.level = (w, l) => { mode = 'level'; world = w; level.start(w, l); };

  bindInput({
    gesture: () => sfx.unlock(),
    dir: (dr, dc) => { if (mode === 'level') level.move(dr, dc); else roomMove(dr, dc); },
    undo: () => mode === 'level' && level.undo(),
    restart: () => mode === 'level' && !level.isBusy() && level.restart(),
    back: () => { if (mode === 'level' && !level.isBusy()) level.leave(); else if (mode === 'world') { sfx.back(); nav.hub(world); } },
    mute: () => sfx.toggle(),
  });
  addEventListener('resize', () => { if (mode === 'level') level.rebuild(); else if (mode === 'world') showWorld(world, null); else showHub(null); });

  // test hooks (used by browser checks)
  Object.assign(window, { __enter: nav.level, __world: w => nav.world(w, null), __hub: () => nav.hub(null), __done: progress.allDone, __set: level.debugSet });
  nav.hub(null);
}
