// The board shared by levels and menu rooms: floor + seams + reflected copies
// of the whole board tiled out to fill the screen (flipped across twisted seams,
// fading with distance).
import { el } from './dom.js';
import { screenSize } from './layout.js';

// Seams: thin, faint lines. (Reflections already say "this edge is glued".)
function bars(floor, B, cell) {
  const { W: cw, H: ch, lr, tb } = B;
  const W = cw * cell, H = ch * cell, t = 2;
  const line = (type, css) => Object.assign(el('edge ' + type, floor).style, css);
  line(tb, { left: -t / 2 + 'px', top: -t / 2 + 'px', width: W + t + 'px', height: t + 'px' });
  line(tb, { left: -t / 2 + 'px', top: H - t / 2 + 'px', width: W + t + 'px', height: t + 'px' });
  line(lr, { left: -t / 2 + 'px', top: -t / 2 + 'px', width: t + 'px', height: H + t + 'px' });
  line(lr, { left: W - t / 2 + 'px', top: -t / 2 + 'px', width: t + 'px', height: H + t + 'px' });
}

const MAX_PANES = 49;

/**
 * spec: { W, H, lr, tb ('none'|'plain'|'twist') }
 * fillPane(root, key): populate one pane. Panes are absolutely positioned and only hold nodes
 * for things that exist (no empty-cell elements), so tiling the screen with reflections stays cheap.
 * key is 'm' for the real board. Returns the floor element.
 */
export function createBoard(stage, spec, cell, fillPane) {
  const { W: cw, H: ch, lr, tb } = spec;
  const bw = cw * cell, bh = ch * cell, [sw, sh] = screenSize();
  const floor = el('', stage); floor.id = 'floor';
  floor.style.width = bw + 'px'; floor.style.height = bh + 'px';
  // exactly enough rings of copies to cover the screen
  let nI = lr === 'none' ? 0 : Math.ceil((sw / 2 - bw / 2) / bw);
  let nJ = tb === 'none' ? 0 : Math.ceil((sh / 2 - bh / 2) / bh);
  nI = Math.max(0, nI); nJ = Math.max(0, nJ);
  while ((2 * nI + 1) * (2 * nJ + 1) > MAX_PANES && (nI > 1 || nJ > 1)) { if (nI >= nJ) nI--; else nJ--; }
  fillPane(floor, 'm');
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
  bars(floor, spec, cell);
  return floor;
}
