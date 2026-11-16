// Menu rooms: the hub (worlds) and a world room (levels). Same board as a level
// (twisted seams, mirrored reflections); the seams are decorative, walking stays inside the room.
import { $, el, LOCK_SVG, BACK_SVG, svgIcon } from './dom.js';
import { createBoard } from './board.js';
import { piece, orient } from './pieces.js';
import { theme } from './theme.js';
import { banner } from './banner.js';
import { setTitle } from './hud.js';
import { whenIdle } from './transition.js';
import { roomCell } from './layout.js';
import { nav } from './nav.js';
import { sfx } from '../audio/sfx.js';
import { WORLDS } from '../data/worlds.js';
import { parseMap, joined, isDoor } from '../data/roommap.js';
import { previewURL } from './preview.js';
import * as progress from '../state/progress.js';

const DECOR = { lr: 'twist', tb: 'twist' }; // decorative: copies mirror like a twisted level
let room = null, pos = [0, 0], players = [], cell = 64;

// the trails of a map as ONE svg path (one node per pane, however long the paths are)
function trailSvg(mp, spec) {
  if (!mp.d) {
    const c = n => (n + .5) * cell, segs = [];
    for (let r = 0; r < spec.H; r++) for (let q = 0; q < spec.W; q++) {
      if (q + 1 < spec.W && joined(mp.m, [r, q], [r, q + 1], mp.rows)) segs.push(`M${c(q)} ${c(r)}L${c(q + 1)} ${c(r)}`);
      if (r + 1 < spec.H && joined(mp.m, [r, q], [r + 1, q], mp.rows)) segs.push(`M${c(q)} ${c(r)}L${c(q)} ${c(r + 1)}`);
    }
    mp.d = segs.join('');
  }
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'), path = document.createElementNS(ns, 'path');
  svg.setAttribute('class', 'trails'); svg.setAttribute('width', spec.W * cell); svg.setAttribute('height', spec.H * cell);
  path.setAttribute('d', mp.d); path.setAttribute('stroke-width', Math.round(cell * .2)); svg.appendChild(path);
  return svg;
}
function addContent(root, spec) {
  const mp = spec.map; if (!mp) return;
  root.appendChild(trailSvg(mp, spec));
  for (const k of mp.m.walls) {
    const [r, c] = k.split(',').map(Number), d = el('cell wall', root);
    d.style.left = c * cell + 'px'; d.style.top = r * cell + 'px';
  }
}

// spec: { W, H, hue, doors:[{r,c,cls,color,fill(node,size),act(origin)}], map?, chip }
function build(spec) {
  room = spec; theme(spec.hue);
  cell = roomCell(spec.W, spec.H);
  const st = $('stage'); st.innerHTML = ''; st.classList.remove('win'); st.style.margin = '';
  st.style.setProperty('--cell', cell + 'px');
  const size = Math.round(cell * .86), off = (cell - size) / 2;
  players = [];
  createBoard(st, { W: spec.W, H: spec.H, ...DECOR }, cell, (root) => {
    addContent(root, spec);
    spec.doors.forEach(d => {
      const b = el('door' + (d.cls ? ' ' + d.cls : ''), root);
      b.style.width = b.style.height = size + 'px';
      b.style.left = d.c * cell + off + 'px'; b.style.top = d.r * cell + off + 'px';
      if (d.color) b.style.background = d.color;
      (d.nodes || (d.nodes = [])).push(b);
      d.fill(b, size);
    });
    const p = piece('player', root, Math.round(cell * .76)); orient(p, { fx: 0, fy: 0 });
    p.style.transition = 'left .1s ease, top .1s ease';
    players.push(p);
  });
  place();
  $('dots').innerHTML = ''; setTitle(spec.chip);
}
function place() { players.forEach(p => { p.style.left = pos[1] * cell + cell * .12 + 'px'; p.style.top = pos[0] * cell + cell * .12 + 'px'; }); }
const bump = d => d.nodes.forEach(n => { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); });

export function showHub(from) {
  pos = from == null ? [2, 2] : [2, 1 + 2 * from];
  const doors = WORLDS.map((w, i) => {
    const open = progress.worldOpen(i);
    return {
      r: 1, c: 1 + 2 * i, cls: open ? '' : 'locked', color: `hsl(${w.hue} 62% 50%)`,
      fill(b) {
        b.title = w.name; b.setAttribute('aria-label', w.name);
        if (!open) { b.appendChild(svgIcon(LOCK_SVG, 'lock')); return; }
        b.appendChild(svgIcon(w.icon, 'glyph'));
        const pips = el('pips', b), n = progress.worldCount(i);
        w.levels.forEach((_, l) => { const p = document.createElement('i'); if (l < n) p.className = 'on'; pips.appendChild(p); });
      },
      act(o) {
        if (open) { sfx.enterWorld(); nav.world(i, null, o); }
        else { bump(this); sfx.locked(); whenIdle(() => banner('Locked', 'Finish ' + WORLDS[i - 1].name + ' first', 2200)); }
      },
    };
  });
  build({ W: 2 * WORLDS.length + 1, H: 3, hue: null, doors, chip: '' });
  room.mode = 'hub';
}

export function showWorld(w, from) {
  const def = WORLDS[w], m = parseMap(def.map);
  pos = [...(from == null ? m.start : standNextTo(m, m.levels[from]))];
  const doors = def.levels.map((d, l) => ({
    r: m.levels[l][0], c: m.levels[l][1], color: `hsl(${def.hue} 62% 50%)`,
    fill(b, size) {
      const p = previewURL(d, size);
      const mini = el('mini', b); mini.style.cssText = `width:${p.w}px;height:${p.h}px;background-image:url(${p.url})`;
      el('num', b).textContent = l + 1; if (progress.isDone(w, l)) el('tick', b).textContent = '✓';
    },
    act(o) { sfx.enterLevel(); nav.level(w, l, o); },
  }));
  doors.push({ r: m.exit[0], c: m.exit[1], cls: 'exit',
    fill(b) { b.appendChild(svgIcon(BACK_SVG, 'icon')); }, act() { sfx.back(); nav.hub(w); } });
  build({ W: m.W, H: m.H, hue: def.hue, doors, map: { m, rows: m.rows }, chip: def.name });
  room.mode = 'world';
  if (!progress.introSeen(w)) { progress.markIntroSeen(w); whenIdle(() => banner(def.name, def.intro, 6500)); }
}
// a free cell beside a door, preferring below it
function standNextTo(m, [r, c]) {
  for (const [dr, dc] of [[1, 0], [0, 1], [0, -1], [-1, 0]]) {
    const rr = r + dr, cc = c + dc;
    if (rr >= 0 && cc >= 0 && rr < m.H && cc < m.W && !m.walls.has(rr + ',' + cc) && !isDoor(m, rr, cc)) return [rr, cc];
  }
  return m.start;
}

export function roomMove(dr, dc) {
  const r = pos[0] + dr, c = pos[1] + dc;
  if (r < 0 || c < 0 || r >= room.H || c >= room.W) return;
  if (room.map && room.map.m.walls.has(r + ',' + c)) return;
  const door = room.doors.find(d => d.r === r && d.c === c);
  if (door) { door.act([door.c * cell + cell / 2, door.r * cell + cell / 2]); return; }
  pos = [r, c]; place(); sfx.roomStep();
}
