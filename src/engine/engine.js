// Pure game rules. No DOM. Node tools (tools/lib.js) import this file directly.
export function parseLevel(d) {
  const walls = new Set((d.walls || []).map(w => w[0] + ',' + w[1]));
  const o = a => ({ r: a[0], c: a[1], fx: a[2] || 0, fy: a[3] || 0 });
  return {
    L: { W: d.w, H: d.h, walls, lr: d.lr, tb: d.tb, targets: d.targets.map(o), home: o(d.home),
         pads: new Map((d.pads || []).map(p => [p[0] + ',' + p[1], p[2]])), slide: !!d.slide },
    player: o(d.player), blocks: d.blocks.map(o)
  };
}
// neighbour of (r,c) in direction (dr,dc), through glued edges. tw says which twisted seam was crossed.
export function nxt(L, r, c, dr, dc) {
  let nr = r + dr, nc = c + dc, tw = null;
  if (nc < 0 || nc >= L.W) {
    if (L.lr === 'none') return null;
    nc = (nc + L.W) % L.W;
    if (L.lr === 'twist') { nr = L.H - 1 - nr; tw = 'lr'; }
  } else if (nr < 0 || nr >= L.H) {
    if (L.tb === 'none') return null;
    nr = (nr + L.H) % L.H;
    if (L.tb === 'twist') { nc = L.W - 1 - nc; tw = 'tb'; }
  }
  if (L.walls.has(nr + ',' + nc)) return null;
  return { r: nr, c: nc, tw, pad: L.pads.get(nr + ',' + nc) || null };
}
// a piece flips when it crosses a twisted seam, and when it enters a mirror pad (x: left-right, y: up-down)
export function flip(o, tw, pad) {
  let fx = o.fx, fy = o.fy;
  if (tw === 'tb') fx ^= 1;
  if (tw === 'lr') fy ^= 1;
  if (pad === 'x') fx ^= 1;
  if (pad === 'y') fy ^= 1;
  return { ...o, fx, fy };
}
// keys always mean the same direction; only orientation of pieces changes at twisted seams
export function step(s, dr, dc) {
  const L = s.L, p = s.player;
  const n = nxt(L, p.r, p.c, dr, dc);
  if (!n) return null;
  const at = (r, c) => s.blocks.findIndex(b => b.r === r && b.c === c);
  if (L.slide) return stepSlide(s, dr, dc, n, at);
  const moves = [];
  let cur = n, guard = 0;
  while (at(cur.r, cur.c) >= 0) {
    if (++guard > L.W * L.H) return null;
    const m = nxt(L, cur.r, cur.c, dr, dc);
    if (!m) return null;
    moves.push([at(cur.r, cur.c), m]);
    cur = m;
  }
  const blocks = s.blocks.map(b => ({ ...b }));
  for (const [i, m] of moves) blocks[i] = { ...flip(blocks[i], m.tw, m.pad), r: m.r, c: m.c };
  const player = { ...flip(p, n.tw, n.pad), r: n.r, c: n.c };
  return { ...s, player, blocks };
}
// Slide levels: a pushed block keeps going until something stops it (wall, solid border, another block,
// or the player). It flips on twisted seams as it passes them. Blocks never push each other.
function stepSlide(s, dr, dc, n, at) {
  const L = s.L, p = s.player, bi = at(n.r, n.c);
  const player = { ...flip(p, n.tw, n.pad), r: n.r, c: n.c };
  if (bi < 0) return { ...s, player };
  let cur = n, cb = { ...s.blocks[bi] }, steps = 0;
  for (;;) {
    const m = nxt(L, cur.r, cur.c, dr, dc);
    if (!m || (m.r === n.r && m.c === n.c)) break;
    const o = at(m.r, m.c); if (o >= 0 && o !== bi) break;
    cb = { ...flip(cb, m.tw, m.pad), r: m.r, c: m.c }; cur = m;
    if (++steps > L.W * L.H) return null;          // would circle forever
  }
  if (!steps) return null;                          // blocked: nothing to slide into
  const blocks = s.blocks.map((b, i) => i === bi ? cb : { ...b });
  return { ...s, player, blocks };
}
export const same = (a, b) => a.r === b.r && a.c === b.c && a.fx === b.fx && a.fy === b.fy;
export function targetDone(s, t) { return s.blocks.some(b => same(b, t)); }
export function homeDone(s) { return same(s.player, s.L.home); }
export function isWin(s) { return s.L.targets.every(t => targetDone(s, t)) && homeDone(s); }

// What happened in a step, for sound/feedback. Pure: compares two states.
export function stepEvents(s, ns, dr, dc) {
  const o = (a, b) => a.fx !== b.fx || a.fy !== b.fy;
  const flipped = o(s.player, ns.player) || s.blocks.some((b, i) => o(b, ns.blocks[i]));
  const pushed = s.blocks.some((b, i) => b.r !== ns.blocks[i].r || b.c !== ns.blocks[i].c);
  const wrapped = ns.player.r !== s.player.r + dr || ns.player.c !== s.player.c + dc;
  return { flipped, pushed, wrapped };
}
