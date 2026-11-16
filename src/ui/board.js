// The board shared by levels and menu rooms: floor + seams + reflected copies
// of the whole board tiled out to fill the screen (flipped across twisted seams,
// fading with distance).
import { el } from './dom.js';
import { screenSize } from './layout.js';

function bars(floor, B, cell) {
  const { W: cw, H: ch, lr, tb } = B;
  const W = cw * cell, H = ch * cell, t = 4;
  const line = (type, css) => Object.assign(el('edge ' + type, floor).style, css);
  line(tb, { left: '-2px', top: -t / 2 + 'px', width: W + 4 + 'px', height: t + 'px' });
  line(tb, { left: '-2px', top: H - t / 2 + 'px', width: W + 4 + 'px', height: t + 'px' });
  line(lr, { left: -t / 2 + 'px', top: '-2px', width: t + 'px', height: H + 4 + 'px' });
  line(lr, { left: W - t / 2 + 'px', top: '-2px', width: t + 'px', height: H + 4 + 'px' });
}

const MAX_PANES = 15;

/**
 * spec: { W, H, lr, tb ('none'|'plain'|'twist') }
 * fillPane(root, key): populate one pane (cells, pieces...). key is 'm' for the real board.
 * Returns the floor element.
 */
export function createBoard(stage, spec, cell, fillPane) {
  const { W: cw, H: ch, lr, tb } = spec;
  const floor = el('', stage); floor.id = 'floor';
  const grid = n => { n.style.gridTemplateColumns = `repeat(${cw}, ${cell}px)`; n.style.gridAutoRows = cell + 'px'; };
  grid(floor);
  const bw = cw * cell, bh = ch * cell, [sw, sh] = screenSize();
  let nI = lr === 'none' ? 0 : Math.min(7, Math.ceil((sw / 2 - bw / 2) / bw) + 1);
  let nJ = tb === 'none' ? 0 : Math.min(7, Math.ceil((sh / 2 - bh / 2) / bh) + 1);
  // keep the pane count small: each copy costs real DOM and paint time
  while ((2 * nI + 1) * (2 * nJ + 1) > MAX_PANES && (nI > 1 || nJ > 1)) { if (nI >= nJ) nI--; else nJ--; }
  fillPane(floor, 'm');
  for (let i = -nI; i <= nI; i++) for (let j = -nJ; j <= nJ; j++) {
    if (!i && !j) continue;
    const d = Math.max(Math.abs(i), Math.abs(j));
    const cp = el('copy', floor); grid(cp);
    cp.style.left = i * bw + 'px'; cp.style.top = j * bh + 'px'; cp.style.width = bw + 'px'; cp.style.height = bh + 'px';
    cp.style.opacity = Math.max(.1, .5 * Math.pow(.66, d - 1));
    const flipY = lr === 'twist' && Math.abs(i) % 2 === 1, flipX = tb === 'twist' && Math.abs(j) % 2 === 1;
    cp.style.transform = `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`;
    fillPane(cp, `c${i},${j}`);
  }
  bars(floor, spec, cell);
  return floor;
}
