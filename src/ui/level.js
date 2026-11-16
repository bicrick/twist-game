// Playing a level: board + pieces + target ghosts, move/undo/restart, win detection.
import { $, el } from './dom.js';
import { createBoard } from './board.js';
import { piece, orient } from './pieces.js';
import { theme } from './theme.js';
import { setTitle } from './hud.js';
import { setActiveBot, stepBot } from './bot.js';
import { puff } from './fx.js';
import { levelCell, LEVEL_MARGIN } from './layout.js';
import { nav } from './nav.js';
import { swap } from './transition.js';
import { sfx } from '../audio/sfx.js';
import { WORLDS } from '../data/worlds.js';
import * as progress from '../state/progress.js';
import { parseLevel, step, stepEvents, isWin, same } from '../engine/engine.js';

let wi = 0, li = 0, state = null, hist = [], dirs = [], prev = {}, panes = [], CELL = 64;
let curDir = [0, 0], busy = false, completed = null;

export const isBusy = () => busy;
export function start(w, l) {
  wi = w; li = l; state = parseLevel(WORLDS[w].levels[l]); hist = []; dirs = []; prev = {}; busy = false;
  build();
}
export const restart = () => { sfx.restart(); swap(() => start(wi, li), { dir: 'fade' }); };
export const leave = () => { sfx.leave(); nav.world(wi, li); };

function addCells(root, L) {
  for (let r = 0; r < L.H; r++) for (let c = 0; c < L.W; c++) {
    const wall = L.walls.has(r + ',' + c), pd = L.pads.get(r + ',' + c);
    if (!wall && !pd) continue;                       // empty floor needs no element
    const d = el('cell' + (wall ? ' wall' : '') + (pd ? ' pad ' + pd : ''), root);
    d.style.left = c * CELL + 'px'; d.style.top = r * CELL + 'px';
  }
}
function build() {
  const L = state.L; theme(WORLDS[wi].hue);
  CELL = levelCell();
  const st = $('stage'); st.innerHTML = ''; st.classList.remove('win', 'title-mode');
  st.style.setProperty('--cell', CELL + 'px'); st.style.margin = Math.round(CELL * LEVEL_MARGIN) + 'px';
  const big = Math.round(CELL * .8), small = Math.round(CELL * .88);
  panes = [];
  createBoard(st, { W: L.W, H: L.H, lr: L.lr, tb: L.tb }, CELL, (root, k) => {
    addCells(root, L);
    panes.push({ k, big, small, root,
      tg: L.targets.map(() => piece('ghost blk', root, big)), home: piece('ghost home', root, small),
      bl: state.blocks.map(() => piece('blk', root, big)), pl: piece('player', root, small) });
  });
  setActiveBot(panes[0].pl, small);
  const dd = $('dots'); dd.innerHTML = '';
  L.targets.forEach(() => dd.appendChild(document.createElement('i')));
  const hd = document.createElement('i'); hd.className = 'home'; dd.appendChild(hd);
  prev = {}; update(true);
  setTitle(WORLDS[wi].name + ' ' + (li + 1));
}

const at = (n, x, y) => { n.style.transform = `translate(${x}px, ${y}px)`; };
const snap = (n, x, y) => { n.style.transition = 'none'; at(n, x, y); void n.offsetWidth; n.style.transition = ''; };
function put(node, key, o, size, mobile) {
  const x = o.c * CELL + (CELL - size) / 2, y = o.r * CELL + (CELL - size) / 2, p = prev[key];
  const dr = p ? o.r - p.r : 0, dc = p ? o.c - p.c : 0;
  // a straight run along the push direction (1 cell, or a long slide) just glides; anything else crossed a seam
  const straight = curDir[0] ? dc === 0 && dr * curDir[0] > 0 : dr === 0 && dc * curDir[1] > 0;
  const jumped = mobile && p && (dr || dc) && !straight;
  node.style.transitionDuration = straight && Math.max(Math.abs(dr), Math.abs(dc)) > 1 ? (.12 + .045 * (Math.max(Math.abs(dr), Math.abs(dc)) - 1)).toFixed(2) + 's' : '';
  if (node.__done) { clearTimeout(node.__t); node.__done(); }
  if (jumped) {
    // slide out through the seam into the reflected pane while a twin slides in from the far side
    const tw = node.tw || (node.tw = piece(node.className.replace('piece ', ''), node.parentNode, size));
    const ox = p.c * CELL + (CELL - size) / 2, oy = p.r * CELL + (CELL - size) / 2, dx = curDir[1] * CELL, dy = curDir[0] * CELL;
    at(node, ox, oy);
    tw.style.opacity = 0; snap(tw, x - dx, y - dy); orient(tw, o);
    void node.offsetWidth;
    at(node, ox + dx, oy + dy); node.style.opacity = 0;
    at(tw, x, y); tw.style.opacity = 1;
    node.__done = () => { node.__done = null; snap(node, x, y); node.style.transition = 'none'; node.style.opacity = 1; void node.offsetWidth; node.style.transition = ''; tw.style.transition = 'none'; tw.style.opacity = 0; void tw.offsetWidth; tw.style.transition = ''; };
    node.__t = setTimeout(node.__done, 135);
  } else at(node, x, y);
  orient(node, o); prev[key] = { r: o.r, c: o.c };
}
function status(list, t) {
  const at = list.filter(b => b.r === t.r && b.c === t.c);
  if (!at.length) return 'empty';
  return at.some(b => same(b, t)) ? 'ok' : 'wrong';
}
function ghostState(n, s, isMain) {
  const was = n.__s; n.__s = s;
  n.classList.toggle('ok', s === 'ok');
  if (isMain && was !== undefined && was !== s && s === 'ok') {
    n.classList.remove('pinging'); void n.offsetWidth; n.classList.add('pinging');
    setTimeout(() => n.classList.remove('pinging'), 700);
    sfx.match();
  }
}
function update() {
  const L = state.L, dots = $('dots').children;
  const tst = L.targets.map(t => status(state.blocks, t)), hst = status([state.player], L.home);
  [...tst, hst].forEach((s, i) => dots[i].classList.toggle('on', s === 'ok'));
  for (const p of panes) {
    const main = p.k === 'm';
    L.targets.forEach((t, i) => { put(p.tg[i], p.k + 't' + i, t, p.big, false); ghostState(p.tg[i], tst[i], main); });
    put(p.home, p.k + 'h', L.home, p.small, false); ghostState(p.home, hst, main);
    state.blocks.forEach((b, i) => put(p.bl[i], p.k + 'b' + i, b, p.big, true));
    put(p.pl, p.k + 'p', state.player, p.small, true);
  }
}

export function move(dr, dc) {
  if (busy) return;
  curDir = [dr, dc];
  const ns = step(state, dr, dc);
  if (!ns) { sfx.blocked(); return; }
  const ev = stepEvents(state, ns, dr, dc);
  const from = state.player;
  hist.push(state); dirs.push(curDir); state = ns;
  puff(panes[0].root, (from.c + .5) * CELL, (from.r + .5) * CELL, CELL, dr, dc);
  stepBot(panes[0].pl, dr, dc);
  (ev.wrapped ? sfx.wrap : ev.flipped ? sfx.flip : ev.pushed ? sfx.push : sfx.move)();
  update();
  if (isWin(state)) {
    busy = true; sfx.win();
    const was = progress.worldDone(wi); progress.markDone(wi, li);
    completed = !was && progress.worldDone(wi) ? wi : null;
    $('stage').classList.add('win');
    setTimeout(finish, 1100);
  }
}
export function undo() {
  if (busy || !hist.length) return;
  const d = dirs.pop(); curDir = [-d[0], -d[1]]; state = hist.pop(); sfx.undo(); update();
}
function finish() {
  busy = false;
  if (completed !== null) {                       // that was the last missing level of the world
    const w = completed; completed = null; nav.hub(w);
    sfx.unlocked();
  } else if (li + 1 < WORLDS[wi].levels.length) nav.level(wi, li + 1);   // carry straight on to the next one
  else nav.world(wi, li);                          // end of the world: back to its room
}
export const rebuild = () => build();
export const debugSet = f => { state = f(state); update(); };
