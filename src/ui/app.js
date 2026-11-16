// Screen router: hub -> world room -> level. Owns which screen is showing.
import { nav } from './nav.js';
import { showHub, showWorld, roomMove } from './rooms.js';
import * as level from './level.js';
import { bindInput } from './input.js';
import { initControls } from './controls.js';
import { showTitle } from './title.js';
import { swap, isBusy } from './transition.js';
import { sfx } from '../audio/sfx.js';
import * as progress from '../state/progress.js';
import * as settings from '../state/settings.js';
import { isOpen as menuOpen, closeMenu, menuDir, menuActivate } from './menu.js';
import { openPause, openSettings } from './menus.js';
import { initParticles } from './particles.js';

let mode = 'title', world = 0;

export function startApp() {
  // going into something zooms in (from the door you chose); coming back zooms out
  nav.title = first => swap(() => { mode = 'title'; showTitle(); }, { dir: 'out', first });
  nav.start = () => { if (isBusy() || mode !== 'title') return; sfx.unlock(); sfx.enterWorld(); swap(() => { mode = 'hub'; showHub(null); }, { dir: 'in' }); };
  nav.hub = (from, first) => swap(() => { mode = 'hub'; showHub(from); }, { dir: 'out', first });
  nav.world = (w, from, origin) => swap(() => { mode = 'world'; world = w; showWorld(w, from); }, from == null ? { dir: 'in', origin } : { dir: 'out' });
  nav.level = (w, l, origin) => swap(() => { mode = 'level'; world = w; level.start(w, l); }, { dir: 'in', origin });

  // One set of intents for keyboard, swipes and the touch pad. An open menu takes them all first.
  const handlers = {
    gesture: () => sfx.unlock(),
    confirm: () => { if (menuOpen()) menuActivate(); else if (mode === 'title') nav.start(); },
    dir: (dr, dc) => { if (menuOpen()) return menuDir(dr, dc); if (isBusy()) return; if (mode === 'title') return nav.start(); if (mode === 'level') level.move(dr, dc); else roomMove(dr, dc); },
    undo: () => { if (menuOpen()) menuActivate(); else if (mode === 'title') nav.start(); else if (!isBusy() && mode === 'level') level.undo(); },   // A
    restart: () => { if (!menuOpen() && !isBusy() && mode === 'level' && !level.isBusy()) level.restart(); },                                          // Select
    back: () => {                                                                                                                                       // B / Esc
      if (menuOpen()) return closeMenu();
      if (isBusy()) return;
      if (mode === 'title') openSettings();
      else if (mode === 'hub') { sfx.back(); nav.title(); }
      else if (mode === 'world') { sfx.back(); nav.hub(world); }
      else if (mode === 'level' && !level.isBusy()) openPause(level);
    },
    menu: () => {                                                                                                                                       // Start / Tab
      if (menuOpen()) return closeMenu();
      if (isBusy()) return;
      if (mode === 'level' && !level.isBusy()) openPause(level); else openSettings();
    },
    mute: () => settings.toggleSound(),
  };
  // leaving the tab pauses a level that is in progress
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'level' && !menuOpen() && !level.isBusy() && !isBusy()) openPause(level); });
  initParticles();
  initControls(handlers); // must come before the resize handler below
  bindInput(handlers);
  let rt = 0; // rebuild once resizing settles, not on every event
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => swap(() => { if (mode === 'level') level.rebuild(); else if (mode === 'world') showWorld(world, null); else if (mode === 'hub') showHub(null); else showTitle(); }, { dir: 'fade' }), 120); });

  // test hooks (used by browser checks)
  Object.assign(window, { __progress: progress, __enter: nav.level, __world: w => nav.world(w, null), __hub: () => nav.hub(null), __done: progress.allDone, __set: level.debugSet });
  nav.title(true);
}
