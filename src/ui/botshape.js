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
