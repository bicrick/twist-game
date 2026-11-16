// Screen router: hub -> world room -> level. Owns which screen is showing.
import { nav } from './nav.js';
import { showHub, showWorld, roomMove, roomInfo } from './rooms.js';
import * as level from './level.js';
import { bindInput } from './input.js';
import { initControls, setPadState } from './controls.js';
import { showTitle } from './title.js';
import { swap, isBusy } from './transition.js';
import { sfx } from '../audio/sfx.js';
import * as music from '../audio/music.js';
import * as progress from '../state/progress.js';
import * as settings from '../state/settings.js';
import { isOpen as menuOpen, closeMenu, menuDir, menuActivate, onStackChange } from './menu.js';
import { openPause, openSettings } from './menus.js';
import { initParticles } from './particles.js';
import { bindViewport } from './viewport.js';
import { pulse as hapticPulse } from './haptics.js';

let mode = 'title', world = 0;
let musicT = 0;
const syncMusic = () => { clearTimeout(musicT); musicT = setTimeout(() => music.setScreen({ mode, world, menuOpen: menuOpen() }), 0); };

export function startApp() {
  // going into something zooms in (from the door you chose); coming back zooms out
  const idle = () => setPadState({ undo: false, redo: false, reset: false });
  nav.title = first => swap(() => { mode = 'title'; idle(); showTitle(); syncMusic(); }, { dir: 'out', first });
  nav.start = () => {
    if (isBusy() || mode !== 'title') return; hapticPulse(); handlers.gesture(); sfx.enterWorld();
    // first ever play: straight into the first level
    if (progress.totals().solved === 0) return swap(() => { mode = 'level'; world = 0; level.start(0, 0); syncMusic(); }, { dir: 'in' });
    swap(() => { mode = 'hub'; idle(); showHub(null); syncMusic(); }, { dir: 'in' });
  };
  nav.hub = (from, first) => swap(() => { mode = 'hub'; idle(); showHub(from); syncMusic(); }, { dir: 'out', first });
  nav.world = (w, from, origin) => swap(() => { mode = 'world'; world = w; idle(); showWorld(w, from); syncMusic(); }, from == null ? { dir: 'in', origin } : { dir: 'out' });
  nav.level = (w, l, origin) => swap(() => { mode = 'level'; world = w; level.start(w, l); syncMusic(); }, { dir: 'in', origin });

  // One set of intents for keyboard, swipes and the touch pad. An open menu takes them all first.
  const handlers = {
    gesture: () => { sfx.unlock(); music.unlock(); },
    confirm: () => { if (menuOpen()) menuActivate(); else if (mode === 'title') nav.start(); },
    dir: (dr, dc) => { if (menuOpen()) return menuDir(dr, dc); if (mode === 'title') return nav.start(); hapticPulse(); if (isBusy()) return; if (mode === 'level') level.move(dr, dc); else roomMove(dr, dc); },
    undo: () => { if (menuOpen()) return closeMenu(); hapticPulse(); if (isBusy()) return; if (mode === 'level') level.undo(); else if (mode === 'hub' || mode === 'world') handlers.back(); },
    redo: () => { if (!menuOpen() && !isBusy() && mode === 'level') { hapticPulse(); level.redo(); } },
    restart: () => { if (!menuOpen() && !isBusy() && mode === 'level' && !level.isBusy()) { hapticPulse(); level.restart(); } },
    back: () => {
      if (menuOpen()) return closeMenu();
      if (isBusy()) return;
      if (mode === 'title') openSettings();
      else if (mode === 'hub') { sfx.back(); nav.title(); }
      else if (mode === 'world') { sfx.back(); nav.hub(world); }
      else if (mode === 'level' && !level.isBusy()) openPause(level);
    },
    menu: () => {
      if (menuOpen()) return closeMenu();
      if (isBusy()) return;
      if (mode === 'level' && !level.isBusy()) openPause(level); else openSettings();
    },
    mute: () => settings.toggleSound(),
  };
  // leaving the tab pauses a level that is in progress
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) handlers.gesture();
    else if (mode === 'level' && !menuOpen() && !level.isBusy() && !isBusy()) openPause(level);
  });
  addEventListener('pageshow', () => handlers.gesture());
  initParticles();
  level.hooks.onHistory = setPadState;
  initControls(handlers); // must come before the resize handler below
  bindInput(handlers);
  let rt = 0; // rebuild once resizing settles, not on every event
  const refit = () => { clearTimeout(rt); rt = setTimeout(() => swap(() => { if (mode === 'level') level.rebuild(); else if (mode === 'world') showWorld(world, null); else if (mode === 'hub') showHub(null); else showTitle(); }, { dir: 'fade' }), 120); };
  addEventListener('resize', refit);
  bindViewport(refit);

  // test hooks (used by browser checks)
  Object.assign(window, { __room: roomInfo, __level: level, __progress: progress, __enter: nav.level, __world: w => nav.world(w, null), __hub: () => nav.hub(null), __done: progress.allDone, __set: level.debugSet });
  onStackChange(syncMusic);
  nav.title(true);
}
