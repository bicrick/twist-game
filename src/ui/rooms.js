// Menu rooms: the hub (worlds) and a world room (levels). Same board as a level
// (twisted seams, mirrored reflections); the seams are decorative, walking stays inside the room.
import { $, el, LOCK_SVG, BACK_SVG, svgIcon } from './dom.js';
import { createBoard } from './board.js';
import { piece, orient } from './pieces.js';
import { theme } from './theme.js';
import { roomCell, screenSize } from './layout.js';
import { nav } from './nav.js';
import { sfx } from '../audio/sfx.js';
import { WORLDS } from '../data/worlds.js';
import { parseMap, transpose, joined, isDoor } from '../data/roommap.js';
import { previewURL } from './preview.js';
import { setActiveBot, stepBot } from './bot.js';
import { announce } from './hud.js';
import { puff } from './fx.js';
import * as progress from '../state/progress.js';

let room = null, pos = [0, 0], players = [], cell = 64;

// the trails of a map as ONE svg path (one node per pane, however long the paths are)
function trailSvg(mp, spec) {
  if (!mp.d) {
    const c = n => (n + .5) * cell, segs = [];
    for (let r = 0; r < spec.H; r++) for (let q = 0; q < spec.W; q++) {
      if (q + 1 < spec.W && joined(mp.m, [r, q], [r, q + 1])) segs.push(`M${c(q)} ${c(r)}L${c(q + 1)} ${c(r)}`);
      if (r + 1 < spec.H && joined(mp.m, [r, q], [r + 1, q])) segs.push(`M${c(q)} ${c(r)}L${c(q)} ${c(r + 1)}`);
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

// spec: { W, H, hue, doors:[{r,c,cls,color,fill(node,size),act(origin)}], map? }
function build(spec) {
  room = spec; theme(spec.hue, spec.bot);
  cell = roomCell(spec.W, spec.H);
  const st = $('stage'); st.innerHTML = ''; st.classList.remove('win', 'title-mode'); st.style.margin = '';
  st.style.setProperty('--cell', cell + 'px');
  const size = Math.round(cell * .76), off = (cell - size) / 2;
  players = [];
  createBoard(st, { W: spec.W, H: spec.H, lr: 'none', tb: 'none' }, cell, (root) => {
    addContent(root, spec);
    spec.doors.forEach(d => {
      const b = el('door' + (d.cls ? ' ' + d.cls : ''), root);
      b.style.width = b.style.height = size + 'px';
      b.style.left = d.c * cell + off + 'px'; b.style.top = d.r * cell + off + 'px';
      if (d.color) b.style.background = d.color;
      (d.nodes || (d.nodes = [])).push(b);
      d.fill(b, size);
    });
    const p = piece("player", root, Math.round(cell * .8)); orient(p, { fx: 0, fy: 0 });
    p.style.transition = 'left .1s ease, top .1s ease';
    players.push(p);
  }, { flat: true });
  place(); setActiveBot(players[0], Math.round(cell * .8));
  $('dots').innerHTML = '';
}
function place() { players.forEach(p => { p.style.left = pos[1] * cell + cell * .12 + 'px'; p.style.top = pos[0] * cell + cell * .12 + 'px'; }); }
const bump = d => d.nodes.forEach(n => { n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); });

// The hub is a compact 3x3 crossroads: a world door in each corner, a plus-shaped trail, you start in the centre.
const CORNERS = [[0, 0], [0, 2], [2, 0], [2, 2]], EDGES = [[0, 1], [1, 0], [1, 2], [2, 1]];
export function showHub(from) {
  // coming back, stand on the edge cell beside the door you left
  pos = from == null ? [1, 1] : [CORNERS[from][0], 1];
  const doors = WORLDS.map((w, i) => {
    const open = progress.worldOpen(i), [r, c] = CORNERS[i];
    return {
      r, c, cls: open ? '' : 'locked', color: `hsl(${w.hue} 85% 56%)`,
      fill(b) {
        b.title = w.name; b.setAttribute('aria-label', w.name);
        if (!open) { b.appendChild(svgIcon(LOCK_SVG, 'lock')); return; }
        b.appendChild(svgIcon(w.icon, 'glyph'));
        if (progress.worldPerfect(i)) el('star', b).textContent = '\u2605';       // every level incl. challenges
        const pips = el('pips', b), cnt = progress.worldCount(i), tot = progress.mainTotal(i);
        for (let l = 0; l < tot; l++) { const p = document.createElement('i'); if (l < cnt) p.className = 'on'; pips.appendChild(p); }
      },
      act(o) {
        if (open) { sfx.enterWorld(); nav.world(i, null, o); }
        else { bump(this); sfx.locked(); }
      },
    };
  });
  const path = new Set([[1, 1], ...EDGES].map(([r, c]) => r + ',' + c));
  room = null;
  build({ W: 3, H: 3, hue: null, doors, map: { m: { walls: new Set(), path } } });
  room.mode = 'hub'; announce('Choose a world');
}

export function showWorld(w, from) {
  const def = WORLDS[w]; let m = parseMap(def.map);
  const [sw, sh] = screenSize();
  if (m.W !== m.H && (m.W > m.H) !== (sw > sh)) m = parseMap(transpose(m.rows));   // match the screen's orientation
  pos = [...(from == null ? m.start : standNextTo(m, m.levels[from]))];
  const doors = def.levels.map((d, l) => {
    const open = progress.levelOpen(w, l);
    return {
      r: m.levels[l][0], c: m.levels[l][1], color: `hsl(${def.hue} 85% 56%)`, cls: (open ? '' : 'locked') + (d.challenge ? ' challenge' : ''),
      fill(b, size) {
        if (!open) { b.appendChild(svgIcon(LOCK_SVG, 'lock')); return; }       // greyed out until its group is reachable
        const p = previewURL(d, size);
        const mini = el('mini', b); mini.style.cssText = `width:${p.w}px;height:${p.h}px;background-image:url(${p.url})`;
        el('num', b).textContent = d.challenge ? '\u2605' : l + 1;
        if (progress.isDone(w, l)) el('tick', b).textContent = '\u2713';
      },
      act(o) { if (open) { sfx.enterLevel(); nav.level(w, l, o); } else { bump(this); sfx.locked(); } },
    };
  });
  doors.push({ r: m.exit[0], c: m.exit[1], cls: 'exit',
    fill(b) { b.appendChild(svgIcon(BACK_SVG, 'icon')); }, act() { sfx.back(); nav.hub(w); } });
  build({ W: m.W, H: m.H, hue: def.hue, bot: def.bot, doors, map: { m, rows: m.rows } });
  room.mode = 'world'; announce(def.name + ': choose a level');
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
  puff(players[0].parentNode, (pos[1] + .5) * cell, (pos[0] + .5) * cell, cell, dr, dc);
  pos = [r, c]; place(); stepBot(players[0], dr, dc); sfx.roomStep();
}
