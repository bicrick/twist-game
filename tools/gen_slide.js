// Random search for Slide levels. Usage: node tools/gen_slide.js '<cfg json>' <seed> [tries]
// cfg: { w:[min,max], h:[min,max], lr:[..], tb:[..], walls:[min,max], blocks:n, flipGoals:bool, len:[min,max], minPushes:n }
import { solve, flips } from './lib.js';
import { api } from './lib.js';
const cfg = JSON.parse(process.argv[2]); let seed = +process.argv[3] || 1; const tries = +process.argv[4] || 20000;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)), pick = a => a[ri(0, a.length - 1)];
const D = [[-1, 0, 'U'], [1, 0, 'D'], [0, -1, 'L'], [0, 1, 'R']];
const out = [];
for (let t = 0; t < tries; t++) {
  const w = ri(...cfg.w), h = ri(...cfg.h), used = new Set();
  const free = () => { for (let k = 0; k < 60; k++) { const r = ri(0, h - 1), c = ri(0, w - 1), key = r + ',' + c; if (!used.has(key)) { used.add(key); return [r, c]; } } return null; };
  const walls = []; for (let i = ri(...cfg.walls); i > 0; i--) { const p = free(); if (p) walls.push(p); }
  const o = () => cfg.flipGoals ? [ri(0, 1), ri(0, 1)] : [0, 0];
  const player = free(), home = free(); const blocks = [], targets = [];
  for (let i = 0; i < cfg.blocks; i++) { blocks.push(free()); targets.push(free()); }
  if ([player, home, ...blocks, ...targets].some(x => !x)) continue;
  const def = { name: '', w, h, lr: pick(cfg.lr), tb: pick(cfg.tb), slide: true, walls,
    player: [...player, 0, 0], home: [...home, ...o()], blocks: blocks.map(b => [...b, 0, 0]), targets: targets.map(x => [...x, ...o()]) };
  const r = solve(def, 60000);
  if (!r || r.len < cfg.len[0] || r.len > cfg.len[1]) continue;
  // count pushes: steps where a block moved
  let s = api.parseLevel(def), pushes = 0;
  for (const ch of r.path) { const [dr, dc] = D.find(d => d[2] === ch), n = api.step(s, dr, dc); if (api.stepEvents(s, n, dr, dc).pushed) pushes++; s = n; }
  if (pushes < cfg.minPushes) continue;
  const f = flips(def, r.path);
  if (cfg.flipGoals && f.bf < 1) continue;
  out.push({ len: r.len, pushes, bf: f.bf, def });
}
out.sort((a, b) => b.len - a.len);
console.log(JSON.stringify(out.slice(0, 6)));
