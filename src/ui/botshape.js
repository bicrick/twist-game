// The player bot's silhouette: a lopsided cloud. Lopsided on purpose: its bumps differ left/right and its
// bottom is flat, so every orientation (mirrored / upside down) is readable from the outline alone.
// The outline is the union of a few circles + a base, traced once into a single path (drawn via <use>).
const CIRCLES = [[33, 47, 24], [60, 38, 26], [77, 58, 19], [24, 64, 17]];   // cx, cy, r  (0..100 box)
const BASE = [24, 58, 54, 28, 14];                                           // x, y, w, h, corner radius
const inside = (x, y) => CIRCLES.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r) ||
  (x >= BASE[0] && x <= BASE[0] + BASE[2] && y >= BASE[1] && y <= BASE[1] + BASE[3] && roundedOk(x, y));
function roundedOk(x, y) {
  const [bx, by, bw, bh, r] = BASE, cx = Math.min(Math.max(x, bx + r), bx + bw - r), cy = Math.min(Math.max(y, by + r), by + bh - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}
export function cloudPath() {
  const cx = 52, cy = 60, pts = [];
  for (let i = 0; i < 160; i++) {
    const a = i / 160 * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a);
    let r = 0; while (inside(cx + dx * (r + .4), cy + dy * (r + .4)) && r < 80) r += .4;
    pts.push([cx + dx * r, cy + dy * r]);
  }
  return 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
}

// Blocks are little pebble bots: a lopsided blob (bulges differ all round), so a flipped block is visibly flipped.
export function pebblePath() {
  const pts = [], cx = 50, cy = 54;
  for (let i = 0; i < 120; i++) {
    const a = i / 120 * Math.PI * 2, r = 36 + 4.5 * Math.cos(a - .7) + 3.8 * Math.cos(2 * a + .9) + 2.6 * Math.cos(3 * a - .4);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
}

// rounded polygon: corners softened with quadratic curves (used for the hexagon + triangle bots)
function roundedPoly(pts, r) {
  const n = pts.length; let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const u = (a, b) => { const dx = a[0] - b[0], dy = a[1] - b[1], l = Math.hypot(dx, dy); return [dx / l, dy / l, l]; };
    const v1 = u(p0, p1), v2 = u(p2, p1), rr = Math.min(r, v1[2] / 2.2, v2[2] / 2.2);
    const a = [p1[0] + v1[0] * rr, p1[1] + v1[1] * rr], b = [p1[0] + v2[0] * rr, p1[1] + v2[1] * rr];
    d += (i ? 'L' : 'M') + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'Q' + p1[0] + ' ' + p1[1] + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
  }
  return d + 'Z';
}
// Every shape is lopsided on purpose, so a mirrored / upside-down bot is readable from its outline alone.
export const SHAPES = {
  cloud: cloudPath(),                                                           // Twist
  droplet: 'M68 7C70 28 86 44 84 63A34 34 0 0 1 16 63C16 43 56 37 68 7Z',       // Slide: a teardrop leaning right
  hex: roundedPoly([[48, 8], [88, 24], [93, 70], [52, 93], [12, 77], [8, 29]], 11),   // Warp: an uneven hexagon
  tri: roundedPoly([[38, 8], [93, 83], [9, 88]], 13),                           // Gate: a scalene triangle
  pebble: pebblePath(),                                                         // blocks
};
