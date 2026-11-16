// Playing a level: board + pieces + target ghosts, move/undo/restart, win detection.
import { $, el } from './dom.js';
import { createBoard } from './board.js';
import { piece, orient } from './pieces.js';
import { theme } from './theme.js';
import { banner, hideBanner } from './banner.js';
import { levelCell, LEVEL_MARGIN } from './layout.js';
import { nav } from './nav.js';
import { swap } from './transition.js';
import { sfx } from '../audio/sfx.js';
import { WORLDS } from '../data/worlds.js';
import * as progress from '../state/progress.js';
import { parseLevel, step, stepEvents, isWin, same } from '../engine/engine.js';

const RADS = ['38% 24% 34% 28% / 30% 38% 26% 36%', '26% 36% 28% 40% / 38% 26% 36% 28%',
              '32% 30% 40% 24% / 26% 40% 28% 34%', '24% 40% 26% 34% / 36% 28% 38% 30%'];
let wi = 0, li = 0, state = null, hist = [], dirs = [], prev = {}, panes = [], CELL = 64;
let curDir = [0, 0], busy = false, completed = null;

export const isBusy = () => busy;
export function start(w, l) {
  wi = w; li = l; state = parseLevel(WORLDS[w].levels[l]); hist = []; dirs = []; prev = {}; busy = false;
  hideBanner(); build();
}
export const restart = () => { sfx.restart(); swap(() => start(wi, li), { dir: 'fade' }); };
export const leave = () => { sfx.leave(); nav.world(wi, li); };

function addCells(root, L) {
  for (let r = 0; r < L.H; r++) for (let c = 0; c < L.W; c++) {
    const wall = L.walls.has(r + ',' + c), pd = L.pads.get(r + ',' + c);
    const d = el('cell' + (wall ? ' wall' : '') + (pd ? ' pad ' + pd : ''), root);
    if (wall) d.style.setProperty('--rad', RADS[(r * 3 + c * 5 + r * c) % 4]);
  }
}
function build() {
  const L = state.L; theme(WORLDS[wi].hue);
  CELL = levelCell();
  const st = $('stage'); st.innerHTML = ''; st.classList.remove('win');
  st.style.setProperty('--cell', CELL + 'px'); st.style.margin = Math.round(CELL * LEVEL_MARGIN) + 'px';
  const big = Math.round(CELL * .8), small = Math.round(CELL * .76);
  panes = [];
  createBoard(st, { W: L.W, H: L.H, lr: L.lr, tb: L.tb }, CELL, (root, k) => {
    addCells(root, L);
    panes.push({ k, big, small,
      tg: L.targets.map(() => piece('ghost blk', root, big)), home: piece('ghost home', root, small),
      bl: state.blocks.map(() => piece('blk', root, big)), pl: piece('player', root, small) });
  });
  const dd = $('dots'); dd.innerHTML = '';
  L.targets.forEach(() => dd.appendChild(document.createElement('i')));
  const hd = document.createElement('i'); hd.className = 'home'; dd.appendChild(hd);
  prev = {}; update(true);
  $('chip').textContent = WORLDS[wi].name + ' ' + (li + 1);
  $('hint').textContent = 'WASD move  ·  Z undo  ·  R restart  ·  Esc menu';
}

const at = (n, x, y) => { n.style.transform = `translate(${x}px, ${y}px)`; };
const snap = (n, x, y) => { n.style.transition = 'none'; at(n, x, y); void n.offsetWidth; n.style.transition = ''; };
function put(node, key, o, size, mobile) {
  const x = o.c * CELL + (CELL - size) / 2, y = o.r * CELL + (CELL - size) / 2, p = prev[key];
  const jumped = mobile && p && (p.r !== o.r || p.c !== o.c) && (o.r - p.r !== curDir[0] || o.c - p.c !== curDir[1]);
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
  hist.push(state); dirs.push(curDir); state = ns;
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
  if (completed !== null) {
    const w = completed; completed = null; nav.hub(w);
    const nx = WORLDS[w + 1];
    sfx.unlocked();
    banner(WORLDS[w].name + ' complete', nx ? nx.name + ' is unlocked' : 'That is every world, for now', 5000);
  } else nav.world(wi, li);
}
export const rebuild = () => build();
export const debugSet = f => { state = f(state); update(); };
