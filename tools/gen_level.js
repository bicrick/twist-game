// Random search for levels of any mechanic, verified by the BFS solver. Time-boxed.
// Usage: node tools/gen_level.js '<cfg json>' <seed>   (prints the best few as JSON)
// cfg: { w:[a,b], h:[a,b], lr:[..], tb:[..], walls:[a,b], blocks:n, flipGoals:bool, slide:bool,
//        pairs:n (portal pairs), flipPortal:0..1, ids:n (plate+gate pairs), len:[a,b], minPushes:n, minUse:n, secs:n, keep:n }
import { solve, flips, api } from './lib.js';
const cfg = JSON.parse(process.argv[2]); let seed = +process.argv[3] || 1;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)), pick = a => a[ri(0, a.length - 1)];
const D = [[-1, 0, 'U'], [1, 0, 'D'], [0, -1, 'L'], [0, 1, 'R']];
const out = [], t0 = Date.now(), until = t0 + (cfg.secs || 60) * 1000;
let tried = 0;
while (Date.now() < until) {
  tried++;
  const w = ri(...cfg.w), h = ri(...cfg.h), used = new Set();
  const free = () => { for (let k = 0; k < 80; k++) { const r = ri(0, h - 1), c = ri(0, w - 1), key = r + ',' + c; if (!used.has(key)) { used.add(key); return [r, c]; } } return null; };
  const walls = []; for (let i = ri(...cfg.walls); i > 0; i--) { const p = free(); if (p) walls.push(p); }
  const o = () => cfg.flipGoals ? [ri(0, 1), ri(0, 1)] : [0, 0];
  const player = free(), home = free(), blocks = [], targets = [], portals = [], plates = [], gates = [];
  for (let i = 0; i < cfg.blocks; i++) { blocks.push(free()); targets.push(free()); }
  for (let i = 0; i < (cfg.pairs || 0); i++) { const a = free(), b = free(); if (a && b) portals.push([...a, ...b, ...(rnd() < (cfg.flipPortal || 0) ? [pick(['x', 'y'])] : [])]); }
  for (let i = 0; i < (cfg.ids || 0); i++) { const a = free(), b = free(); if (a && b) { plates.push([...a, i]); gates.push([...b, i]); } }
  if ([player, home, ...blocks, ...targets].some(x => !x)) continue;
  const def = { w, h, lr: pick(cfg.lr), tb: pick(cfg.tb), walls, player: [...player, 0, 0], home: [...home, ...o()],
    blocks: blocks.map(b => [...b, 0, 0]), targets: targets.map(x => [...x, ...o()]) };
  if (cfg.slide) def.slide = true; if (portals.length) def.portals = portals; if (plates.length) { def.plates = plates; def.gates = gates; }
  const r = solve(def, cfg.states || 60000);
  if (!r || r.len < cfg.len[0] || r.len > cfg.len[1]) continue;
  let s = api.parseLevel(def), pushes = 0, use = 0;
  const gateCells = new Set(gates.map(g => g[0] + ',' + g[1]));
  for (const ch of r.path) {
    const [dr, dc] = D.find(d => d[2] === ch), n = api.step(s, dr, dc), ev = api.stepEvents(s, n, dr, dc);
    if (ev.pushed) pushes++;
    if (portals.length && ev.wrapped) use++;
    if (gateCells.size && (gateCells.has(n.player.r + ',' + n.player.c) || n.blocks.some(b => gateCells.has(b.r + ',' + b.c)))) use++;
    s = n;
  }
  if (pushes < (cfg.minPushes || 0) || use < (cfg.minUse || 0)) continue;
  const f = flips(def, r.path);
  if (cfg.flipGoals && f.bf < 1) continue;
  out.push({ len: r.len, pushes, use, bf: f.bf, def });
  out.sort((a, b) => b.len - a.len || b.use - a.use); if (out.length > (cfg.keep || 6)) out.length = cfg.keep || 6;
}
console.error('tried', tried, 'kept', out.length);
console.log(JSON.stringify(out));
