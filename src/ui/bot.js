// The player bot: a cream squircle with tilted capsule eyes (see css/pieces.css).
// This file only drives behaviour: where the eyes look, the hop when it moves, the idle glances.
//   look: pointer (desktop) > direction it just moved > small idle wander
let bot = null, size = 64, px = null, py = null, lastPointer = 0, lastMove = 0, moveDir = [0, 0], raf = 0, wander = [0, 0];

export function setActiveBot(node, sz) { bot = node; size = sz; aim(); }

function aim() {
  raf = 0; if (!bot || !bot.g) return;
  let vx = 0, vy = 0; const now = performance.now();
  if (now - lastMove < 700) { vx = moveDir[1]; vy = moveDir[0]; }
  else if (px !== null && now - lastPointer < 4000) {
    const r = bot.getBoundingClientRect(), dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / (size * 2.5)); vx = dx / d * k; vy = dy / d * k;
  } else { vx = wander[0]; vy = wander[1]; }
  const m = size * .1;
  // the gaze lives inside the mirrored face, so undo the mirroring to look the right way on screen
  bot.g.style.transform = `translate(${(vx * m * (bot.sx || 1)).toFixed(1)}px, ${(vy * m * (bot.sy || 1)).toFixed(1)}px)`;
  bot.sq.style.setProperty('--tilt', (vx * 4).toFixed(1) + 'deg');
}
const schedule = () => { if (!raf) raf = requestAnimationFrame(aim); };

// called when the bot steps (dr, dc): look that way and hop
export function stepBot(node, dr, dc) {
  moveDir = [dr, dc]; lastMove = performance.now();
  node.sq.style.setProperty('--lx', dc); node.sq.style.setProperty('--ly', dr);
  node.sq.classList.remove('hop'); void node.sq.offsetWidth; node.sq.classList.add('hop');
  schedule(); setTimeout(schedule, 720);
}

// a refused move: shove toward the obstacle and bounce back
export function bonkBot(node, dr, dc) {
  moveDir = [dr, dc]; lastMove = performance.now();
  const q = node.sq.style; q.setProperty('--lx', dc); q.setProperty('--ly', dr); q.setProperty('--ax', Math.abs(dc)); q.setProperty('--ay', Math.abs(dr));
  node.sq.classList.remove('hop', 'bonk'); void node.sq.offsetWidth; node.sq.classList.add('bonk');
  schedule(); setTimeout(schedule, 720);
}

if (typeof window !== 'undefined') {
  addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; lastPointer = performance.now(); schedule(); });
  // idle: every couple of seconds glance somewhere small, so it never looks frozen
  setInterval(() => {
    if (!bot) return;
    const a = Math.random() * Math.PI * 2, r = Math.random() < .35 ? 0 : .35 + Math.random() * .5;
    wander = [Math.cos(a) * r, Math.sin(a) * r * .6]; schedule();
  }, 1900);
}
