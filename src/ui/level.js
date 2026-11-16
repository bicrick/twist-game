// Playing a level: board + pieces + target ghosts, move/undo/restart, win detection.
import { $, el } from './dom.js';
import { createBoard } from './board.js';
import { piece, orient } from './pieces.js';
import { theme } from './theme.js';
import { announce } from './hud.js';
import { celebrate } from './celebrate.js';
import { setActiveBot, stepBot } from './bot.js';
import { puff } from './fx.js';
import { levelCell, LEVEL_MARGIN } from './layout.js';
import { nav } from './nav.js';
import { swap } from './transition.js';
import { sfx } from '../audio/sfx.js';
import { WORLDS } from '../data/worlds.js';
import * as progress from '../state/progress.js';
import { parseLevel, step, stepEvents, isWin, same, openGates } from '../engine/engine.js';
import { PORTAL_COLORS, ID_COLORS } from './palette.js';

let wi = 0, li = 0, state = null, hist = [], dirs = [], prev = {}, panes = [], CELL = 64;
let curDir = [0, 0], busy = false, completed = null, decor = [], plinks = [], prevOpen, redoStack = [];
// the touch pad greys its Undo / Redo / Reset buttons from this
export const hooks = { onHistory: () => {} };
const notify = () => hooks.onHistory({ undo: !busy && hist.length > 0, redo: !busy && redoStack.length > 0, reset: !busy });

export const isBusy = () => busy;
export function start(w, l) {
  wi = w; li = l; state = parseLevel(WORLDS[w].levels[l]); hist = []; dirs = []; redoStack = []; prev = {}; busy = false;
  build(); notify();
  announce(WORLDS[w].name + ', ' + (WORLDS[w].levels[l].challenge ? 'challenge' : 'level ' + (l + 1)));
}
export const restart = () => { sfx.restart(); swap(() => start(wi, li), { dir: 'fade' }); };
export const leave = () => { sfx.leave(); nav.world(wi, li); };

// everything on the board that needs an element (empty floor needs none): walls, pads, portals, plates, gates
function levelDecor(L) {
  const out = [], pair = new Map();
  // is the cell beside (r,c) a wall? Solid edges count (so edge walls fuse with the rim); glued edges look across the seam.
  const wallAt = (r, c) => {
    if (c < 0 || c >= L.W) { if (L.lr === 'none') return true; return L.walls.has((L.lr === 'twist' ? L.H - 1 - r : r) + ',' + ((c + L.W) % L.W)); }
    if (r < 0 || r >= L.H) { if (L.tb === 'none') return true; return L.walls.has(((r + L.H) % L.H) + ',' + (L.tb === 'twist' ? L.W - 1 - c : c)); }
    return L.walls.has(r + ',' + c);
  };
  let np = 0;
  plinks = [];
  for (const [k, d] of L.portals) {
    if (pair.has(k)) continue;
    const [r0, c0] = k.split(',').map(Number);
    pair.set(k, np); pair.set(d.r + ',' + d.c, np);
    plinks.push({ a: [r0, c0], b: [d.r, d.c], color: PORTAL_COLORS[np % PORTAL_COLORS.length] }); np++;
  }
  for (let r = 0; r < L.H; r++) for (let c = 0; c < L.W; c++) {
    const k = r + ',' + c, e = { r, c, cls: [], pc: null, gid: null };
    if (L.walls.has(k)) { e.cls.push('wall'); if (wallAt(r - 1, c)) e.cls.push('wn'); if (wallAt(r + 1, c)) e.cls.push('ws'); if (wallAt(r, c - 1)) e.cls.push('ww'); if (wallAt(r, c + 1)) e.cls.push('we'); }
    if (L.pads.has(k)) e.cls.push('pad', L.pads.get(k));
    if (L.portals.has(k)) { const f = L.portals.get(k).flip; e.cls.push('portal'); if (f) e.cls.push('pf-' + f); e.pc = PORTAL_COLORS[pair.get(k) % PORTAL_COLORS.length]; }
    const pl = L.plates.find(p => p.r === r && p.c === c);
    if (pl) { e.cls.push('plate'); e.pc = ID_COLORS[pl.id % ID_COLORS.length]; }
    if (L.gates.has(k)) { e.cls.push('gate'); e.gid = L.gates.get(k); e.pc = ID_COLORS[e.gid % ID_COLORS.length]; }
    if (e.cls.length) out.push(e);
  }
  return out;
}
// a faint dashed arc between the two ends of every portal pair: shows at a glance which portal leads where
function addLinks(root) {
  if (!plinks.length) return;
  const ns = 'http://www.w3.org/2000/svg', L = state.L, svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('class', 'plinks'); svg.setAttribute('width', L.W * CELL); svg.setAttribute('height', L.H * CELL);
  for (const { a, b, color } of plinks) {
    const x1 = (a[1] + .5) * CELL, y1 = (a[0] + .5) * CELL, x2 = (b[1] + .5) * CELL, y2 = (b[0] + .5) * CELL;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, nx = -(y2 - y1) * .22, ny = (x2 - x1) * .22;     // bow the line sideways
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', `M${x1} ${y1}Q${mx + nx} ${my + ny} ${x2} ${y2}`); path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', Math.max(2, CELL * .05)); path.setAttribute('stroke-dasharray', `${CELL * .1} ${CELL * .15}`);
    svg.appendChild(path);
  }
  root.appendChild(svg);
}
function addCells(root, gates, portals) {
  addLinks(root);
  for (const e of decor) {
    const d = el('cell ' + e.cls.join(' '), root);
    d.style.left = e.c * CELL + 'px'; d.style.top = e.r * CELL + 'px';
    if (e.pc) d.style.setProperty('--pc', e.pc);
    if (e.gid !== null) gates.push({ n: d, id: e.gid });
    if (e.cls.includes('portal')) portals.set(e.r + ',' + e.c, d);
  }
}
function build() {
  const L = state.L; theme(WORLDS[wi].hue, WORLDS[wi].bot);
  CELL = levelCell(wi);
  const st = $('stage'); st.innerHTML = ''; st.classList.remove('win', 'title-mode');
  st.style.setProperty('--cell', CELL + 'px'); st.style.margin = Math.round(CELL * LEVEL_MARGIN) + 'px';
  const big = Math.round(CELL * .8), small = Math.round(CELL * .88);
  panes = []; decor = levelDecor(L); prevOpen = undefined;
  createBoard(st, { W: L.W, H: L.H, lr: L.lr, tb: L.tb }, CELL, (root, k) => {
    const gates = [], portals = new Map(); addCells(root, gates, portals);
    panes.push({ k, big, small, root, gates, portals,
      tg: L.targets.map(() => piece('ghost blk', root, big)), home: piece('ghost home', root, small),
      bl: state.blocks.map(() => piece('blk', root, big)), pl: piece('player', root, small) });
  });
  setActiveBot(panes[0].pl, small);
  const dd = $('dots'); dd.innerHTML = '';
  L.targets.forEach(() => dd.appendChild(document.createElement('i')));
  const hd = document.createElement('i'); hd.className = 'home'; dd.appendChild(hd);
  prev = {}; update(true);
}

const at = (n, x, y, sc = 1) => { n.style.transform = `translate(${x}px, ${y}px)` + (sc === 1 ? '' : ` scale(${sc})`); };
const snap = (n, x, y) => { n.style.transition = 'none'; at(n, x, y); void n.offsetWidth; n.style.transition = ''; };
function put(node, key, o, size, mobile) {
  const x = o.c * CELL + (CELL - size) / 2, y = o.r * CELL + (CELL - size) / 2, p = prev[key];
  const dr = p ? o.r - p.r : 0, dc = p ? o.c - p.c : 0;
  // a straight run along the push direction (1 cell, or a long slide) just glides; anything else crossed a seam
  const straight = curDir[0] ? dc === 0 && dr * curDir[0] > 0 : dr === 0 && dc * curDir[1] > 0;
  const jumped = mobile && p && (dr || dc) && !straight;
  node.style.transitionDuration = straight && Math.max(Math.abs(dr), Math.abs(dc)) > 1 ? (.12 + .045 * (Math.max(Math.abs(dr), Math.abs(dc)) - 1)).toFixed(2) + 's' : '';
  if (node.__done) { clearTimeout(node.__t); node.__done(); }
  if (jumped && state.L.portals.size) {
    // portal: slide into the portal it entered (found along the push direction), shrink away, pop out of the other end
    const L = state.L; let er = p.r, ec = p.c;
    for (let k = 1; k <= Math.max(L.W, L.H); k++) {
      const r = p.r + curDir[0] * k, c = p.c + curDir[1] * k;
      if (r < 0 || c < 0 || r >= L.H || c >= L.W) break;
      if (L.portals.has(r + ',' + c)) { er = r; ec = c; break; }
    }
    at(node, ec * CELL + (CELL - size) / 2, er * CELL + (CELL - size) / 2, .15); node.style.opacity = 0;
    node.__done = () => { node.__done = null; node.style.transition = 'none'; at(node, x, y, .15); node.style.opacity = 0; void node.offsetWidth; node.style.transition = ''; at(node, x, y); node.style.opacity = 1; };
    node.__t = setTimeout(node.__done, 130);
  } else if (jumped) {
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
  if (L.portals.size) {        // standing next to a portal: both ends of that pair glow, so you can see where you would come out
    const lit = new Set(), pr = state.player;
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const k = (pr.r + dr) + ',' + (pr.c + dc), pt = L.portals.get(k); if (pt) { lit.add(k); lit.add(pt.r + ',' + pt.c); } }
    for (const p of panes) for (const [k, n] of p.portals) n.classList.toggle('hint', lit.has(k));
  }
  if (L.gates.size) {
    const open = openGates(state), sig = open ? [...open].sort().join() : '';
    for (const p of panes) for (const g of p.gates) g.n.classList.toggle('open', !!(open && open.has(g.id)));
    if (prevOpen !== undefined && sig !== prevOpen) sfx.gate();
    prevOpen = sig;
  }
  for (const p of panes) {
    const main = p.k === 'm';
    L.targets.forEach((t, i) => { put(p.tg[i], p.k + 't' + i, t, p.big, false); ghostState(p.tg[i], tst[i], main); });
    put(p.home, p.k + 'h', L.home, p.small, false); ghostState(p.home, hst, main);
    state.blocks.forEach((b, i) => put(p.bl[i], p.k + 'b' + i, b, p.big, true));
    put(p.pl, p.k + 'p', state.player, p.small, true);
  }
}

function checkWin() {
  if (!isWin(state)) return;
  busy = true; sfx.win(); notify(); announce('Solved');
  const was = progress.worldDone(wi); progress.markDone(wi, li);
  completed = !was && progress.worldDone(wi) ? wi : null;           // optional challenge levels never complete a world
  $('stage').classList.add('win');
  setTimeout(finish, 1100);
}
export function move(dr, dc) {
  if (busy) return;
  curDir = [dr, dc];
  const ns = step(state, dr, dc);
  if (!ns) { sfx.blocked(); return; }
  const ev = stepEvents(state, ns, dr, dc);
  const from = state.player;
  hist.push(state); dirs.push(curDir); redoStack.length = 0; state = ns;
  puff(panes[0].root, (from.c + .5) * CELL, (from.r + .5) * CELL, CELL, dr, dc);
  stepBot(panes[0].pl, dr, dc);
  (ev.wrapped ? sfx.wrap : ev.flipped ? sfx.flip : ev.pushed ? sfx.push : sfx.move)();
  update(); notify();
  if (state.L.portals.size && ev.wrapped) {          // ripple at both ends of the portal you just used
    const e = (from.r + dr) + ',' + (from.c + dc), pt = state.L.portals.get(e);
    if (pt) for (const k of [e, pt.r + ',' + pt.c]) for (const p of panes) { const n = p.portals.get(k); if (n) { n.classList.remove('zap'); void n.offsetWidth; n.classList.add('zap'); setTimeout(() => n.classList.remove('zap'), 650); } }
  }
  checkWin();
}
export function undo() {
  if (busy || !hist.length) return;
  const d = dirs.pop(); redoStack.push({ s: state, d }); curDir = [-d[0], -d[1]]; state = hist.pop(); sfx.undo(); update(); notify();
}
export function redo() {
  if (busy || !redoStack.length) return;
  const r = redoStack.pop(); hist.push(state); dirs.push(r.d); curDir = r.d; state = r.s;
  stepBot(panes[0].pl, r.d[0], r.d[1]); sfx.move(); update(); notify(); checkWin();
}
function finish() {
  busy = false;
  const levels = WORLDS[wi].levels, next = li + 1;
  const last = WORLDS.length - 1;
  // one-time moments: beating the last world, and 100% of everything
  const finale = completed === last && !progress.flag('finale'), perfect = progress.allPerfect() && !progress.flag('perfect');
  if (finale) progress.setFlag('finale'); if (perfect) progress.setFlag('perfect');
  if (completed !== null) {                       // that was the last missing main level of the world
    const w = completed; completed = null; nav.hub(w);
    sfx.unlocked();
  } else if (next < levels.length && !levels[next].challenge && !levels[li].challenge) nav.level(wi, next);   // carry straight on
  else nav.world(wi, li);                          // end of the main run, or a challenge: back to the room
  if (finale || perfect) setTimeout(() => celebrate(perfect ? 'perfect' : 'clear'), 750);
}
export const rebuild = () => build();
export const peek = () => ({ player: state.player, blocks: state.blocks, hist: hist.length, redo: redoStack.length });   // for tests
export const debugSet = f => { state = f(state); update(); };
