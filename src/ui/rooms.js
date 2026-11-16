// Menu rooms: the hub (worlds) and a world room (levels). They use the same board
// as a level: seams, reflected copies. Seams here are decorative; walking stays inside the room.
import { $, el, LOCK_SVG, svgIcon } from './dom.js';
import { createBoard } from './board.js';
import { piece, orient } from './pieces.js';
import { theme } from './theme.js';
import { banner } from './banner.js';
import { roomCell } from './layout.js';
import { nav } from './nav.js';
import { sfx } from '../audio/sfx.js';
import { WORLDS } from '../data/worlds.js';
import * as progress from '../state/progress.js';

export const COLS = 5;
const DECOR = { lr: 'plain', tb: 'plain' };
let room = null, pos = [0, 0], players = [], cell = 64;

function preview(def, box) {
  const s = Math.max(4, Math.floor((box * .74) / Math.max(def.w, def.h)));
  const m = el('mini');
  m.style.gridTemplateColumns = `repeat(${def.w}, ${s}px)`; m.style.gridAutoRows = s + 'px';
  m.style.background = 'rgba(255,255,255,.55)';
  const edge = t => t === 'twist' ? 'var(--twist)' : t === 'plain' ? 'var(--plain)' : 'rgba(0,0,0,.55)';
  m.style.borderTop = m.style.borderBottom = `${Math.max(2, s / 4)}px solid ${edge(def.tb)}`;
  m.style.borderLeft = m.style.borderRight = `${Math.max(2, s / 4)}px solid ${edge(def.lr)}`;
  const at = a => a[0] + ',' + a[1], walls = new Set(def.walls.map(w => w.join())), blocks = new Set(def.blocks.map(at));
  const tg = new Set(def.targets.map(at)), pads = new Set((def.pads || []).map(at));
  for (let r = 0; r < def.h; r++) for (let c = 0; c < def.w; c++) {
    const k = r + ',' + c, i = document.createElement('i'), st = i.style;
    st.width = st.height = s + 'px';
    const dot = (bg, border) => { if (bg) st.background = bg; if (border) st.border = border; st.borderRadius = '30%'; st.transform = 'scale(.7)'; };
    if (walls.has(k)) { st.background = 'rgba(0,0,0,.6)'; st.borderRadius = '38%'; }
    else if (pads.has(k) && !blocks.has(k) && k !== at(def.player)) { st.background = 'var(--padc)'; st.opacity = '.55'; st.transform = 'scale(.6)'; st.borderRadius = '20%'; }
    else if (blocks.has(k)) dot('var(--block)');
    else if (k === at(def.player)) dot('var(--player)');
    else if (tg.has(k)) dot(null, '2px solid var(--block)');
    else if (k === at(def.home)) dot(null, '2px solid var(--home)');
    m.appendChild(i);
  }
  return m;
}

// spec: { W, H, hue, doors:[{r,c,cls,color,fill(node,size),act()}], chip, hint }
function build(spec) {
  room = spec; theme(spec.hue);
  cell = roomCell(spec.W, spec.H);
  const st = $('stage'); st.innerHTML = ''; st.classList.remove('win'); st.style.margin = '';
  st.style.setProperty('--cell', cell + 'px');
  const size = Math.round(cell * .86), off = (cell - size) / 2;
  players = [];
  spec.doors.forEach(d => { d.nodes = []; });
  createBoard(st, { W: spec.W, H: spec.H, ...DECOR }, cell, (root, key) => {
    for (let i = 0; i < spec.W * spec.H; i++) el('cell', root);
    spec.doors.forEach(d => {
      const b = el('door' + (d.cls ? ' ' + d.cls : ''), root); d.nodes.push(b);
      b.style.width = b.style.height = size + 'px';
      b.style.left = d.c * cell + off + 'px'; b.style.top = d.r * cell + off + 'px';
      if (d.color) b.style.background = d.color;
      d.fill(b, size);
    });
    const p = piece('player', root, Math.round(cell * .76)); orient(p, { fx: 0, fy: 0 });
    p.style.transition = 'left .1s ease, top .1s ease';
    players.push(p);
  });
  place();
  $('dots').innerHTML = ''; $('chip').textContent = spec.chip || ''; $('hint').textContent = spec.hint;
}
function place() { players.forEach(p => { p.style.left = pos[1] * cell + cell * .12 + 'px'; p.style.top = pos[0] * cell + cell * .12 + 'px'; }); }
const bump = d => d.nodes.forEach(n => { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); });

export function showHub(from) {
  pos = from == null ? [2, 2] : [2, 1 + 2 * from];
  const doors = WORLDS.map((w, i) => {
    const open = progress.worldOpen(i);
    return {
      r: 1, c: 1 + 2 * i, cls: open ? '' : 'locked', color: `hsl(${w.hue} 45% 60%)`,
      fill(b) {
        el('name', b).textContent = w.name;
        if (!open) { b.appendChild(svgIcon(LOCK_SVG, 'lock')); return; }
        const pips = el('pips', b), n = progress.worldCount(i);
        w.levels.forEach((_, l) => { const i = document.createElement('i'); if (l < n) i.className = 'on'; pips.appendChild(i); });
      },
      act() {
        if (open) { sfx.openDoor(); nav.world(i, null); }
        else { bump(this); sfx.locked(); banner('Locked', 'Finish ' + WORLDS[i - 1].name + ' first', 2200); }
      },
    };
  });
  room = null;
  build({ W: 2 * WORLDS.length + 1, H: 3, hue: null, doors, hint: 'WASD move  ·  walk into a world to enter it' });
  room.mode = 'hub';
}

export function showWorld(w, from) {
  const def = WORLDS[w], n = def.levels.length, rows = Math.ceil(n / COLS), H = 2 * rows + 1;
  pos = from == null ? [H - 1, 2] : [2 + 2 * Math.floor(from / COLS), 1 + 2 * (from % COLS)];
  const doors = def.levels.map((d, l) => ({
    r: 1 + 2 * Math.floor(l / COLS), c: 1 + 2 * (l % COLS), color: `hsl(${def.hue} 45% 58%)`,
    fill(b, size) { b.appendChild(preview(d, size)); el('num', b).textContent = l + 1; if (progress.isDone(w, l)) el('tick', b).textContent = '✓'; },
    act() { sfx.openDoor(); nav.level(w, l); },
  }));
  doors.push({ r: H - 1, c: 0, cls: 'exit', fill(b) { b.textContent = '←'; }, act() { sfx.back(); nav.hub(w); } });
  build({ W: 2 * COLS + 1, H, hue: def.hue, doors, chip: def.name, hint: 'WASD move  ·  walk into a level to enter it  ·  arrow = back' });
  room.mode = 'world';
  if (!progress.introSeen(w)) { progress.markIntroSeen(w); banner(def.name, def.intro, 6500); }
}

export function roomMove(dr, dc) {
  const r = pos[0] + dr, c = pos[1] + dc;
  if (r < 0 || c < 0 || r >= room.H || c >= room.W) return;
  const door = room.doors.find(d => d.r === r && d.c === c);
  if (door) { door.act(); return; }
  pos = [r, c]; place(); sfx.roomStep();
}
