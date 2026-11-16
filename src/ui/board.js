// The board shared by levels and menu rooms: floor + seams + reflected copies
// of the whole board tiled out to fill the screen (flipped across twisted seams,
// fading with distance).
import { el } from './dom.js';
import { screenSize } from './layout.js';

const MAX_PANES = 49;

// Solid ('none') edges get a wall rim just outside the board. The rim is ONE bar at full brightness that runs the
// whole length across all the reflections (never faded, never cut at the board edge).
function rims(root, spec, cell, nI, nJ) {
  const { W: cw, H: ch, lr, tb } = spec, W = cw * cell, H = ch * cell, t = Math.round(cell * .22);
  const lrN = lr === 'none', tbN = tb === 'none';
  const bar = (x, y, w, h) => { const d = el('rim', root); Object.assign(d.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); };
  const x0 = lrN ? -t : -(nI + 1) * W, x1 = lrN ? W + t : (nI + 2) * W;     // horizontal extent (top / bottom bars)
  const y0 = tbN ? -t : -(nJ + 1) * H, y1 = tbN ? H + t : (nJ + 2) * H;     // vertical extent (side bars)
  if (tbN) { bar(x0, -t, x1 - x0, t); bar(x0, H, x1 - x0, t); }
  if (lrN) { bar(-t, y0, t, y1 - y0); bar(W, y0, t, y1 - y0); }
}

/**
 * spec: { W, H, lr, tb ('none'|'plain'|'twist') }
 * fillPane(root, key): populate one pane. Panes are absolutely positioned and only hold nodes
 * for things that exist (no empty-cell elements), so tiling the screen with reflections stays cheap.
 * key is 'm' for the real board. Returns the floor element.
 */
export function createBoard(stage, spec, cell, fillPane, opts = {}) {
  const { W: cw, H: ch, lr, tb } = spec;
  const bw = cw * cell, bh = ch * cell, [sw, sh] = screenSize();
  const floor = el('', stage); floor.id = 'floor';
  if (opts.flat) floor.classList.add('room');          // menu rooms: a plain rounded card, no reflections
  floor.style.width = bw + 'px'; floor.style.height = bh + 'px';
  // exactly enough rings of copies to cover the screen
  let nI = opts.flat || lr === 'none' ? 0 : Math.ceil((sw / 2 - bw / 2) / bw);
  let nJ = opts.flat || tb === 'none' ? 0 : Math.ceil((sh / 2 - bh / 2) / bh);
  nI = Math.max(0, nI); nJ = Math.max(0, nJ);
  while ((2 * nI + 1) * (2 * nJ + 1) > MAX_PANES && (nI > 1 || nJ > 1)) { if (nI >= nJ) nI--; else nJ--; }
  fillPane(floor, 'm');
  const solid = !opts.flat && lr === 'none' && tb === 'none';       // no reflections at all: a rounded box with a wall ring
  if (solid) floor.classList.add('solid');
  else if (!opts.flat) rims(floor, spec, cell, nI, nJ);
  floor.dataset.rimTop = !opts.flat && tb === 'none' ? Math.round(cell * .22) : 0;
  for (let i = -nI; i <= nI; i++) for (let j = -nJ; j <= nJ; j++) {
    if (!i && !j) continue;
    const d = Math.max(Math.abs(i), Math.abs(j));
    const cp = el('copy', floor);
    cp.style.left = i * bw + 'px'; cp.style.top = j * bh + 'px'; cp.style.width = bw + 'px'; cp.style.height = bh + 'px';
    cp.style.opacity = Math.max(.12, .48 * Math.pow(.62, d - 1));
    const flipY = lr === 'twist' && Math.abs(i) % 2 === 1, flipX = tb === 'twist' && Math.abs(j) % 2 === 1;
    cp.style.transform = `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`;
    fillPane(cp, `c${i},${j}`);
  }
  return floor;
}
