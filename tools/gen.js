import { api, solve, flips } from './lib.js';
let seed = +process.argv[3] || 1;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const pick = a => a[ri(0, a.length - 1)];
const cfg = JSON.parse(process.argv[2]);
function make() {
  const w = ri(cfg.w[0], cfg.w[1]), h = ri(cfg.h[0], cfg.h[1]);
  const lr = pick(cfg.lr), tb = pick(cfg.tb);
  const walls = [], used = new Set();
  const free = () => { for (let t = 0; t < 50; t++) { const r = ri(0, h - 1), c = ri(0, w - 1); if (!used.has(r + ',' + c)) return [r, c]; } return null; };
  for (let i = 0; i < ri(cfg.walls[0], cfg.walls[1]); i++) { const p = free(); if (!p) return null; used.add(p.join()); walls.push(p); }
  const pads = [];
  const np = cfg.pads ? ri(cfg.pads[0], cfg.pads[1]) : 0;
  for (let i = 0; i < np; i++) { const p = free(); if (!p) return null; used.add(p.join()); pads.push([...p, pick(cfg.padTypes || ['x', 'y'])]); }
  const nb = ri(cfg.blocks[0], cfg.blocks[1]), targets = [], blocks = [];
  for (let i = 0; i < nb; i++) { const p = free(); if (!p) return null; used.add(p.join());
    const fx = ri(0, 1), fy = ri(0, 1); targets.push([...p, fx, fy]); blocks.push([...p, fx, fy]); }
  const p = free(); if (!p) return null;
  const home = [...p, ri(0, 1), ri(0, 1)];
  return { name: '', w, h, lr, tb, walls, pads, player: home.slice(), home, blocks, targets };
}
const out = [];
for (let t = 0; t < cfg.tries; t++) {
  const d = make(); if (!d) continue;
  let s = api.parseLevel(d);
  const n = ri(cfg.scr[0], cfg.scr[1]);
  for (let i = 0; i < n; i++) { const dd = [[1,0],[-1,0],[0,1],[0,-1]][ri(0, 3)]; const x = api.step(s, dd[0], dd[1]); if (x) s = x; }
  if (api.isWin(s)) continue;
  const o = a => [a.r, a.c, a.fx, a.fy];
  const sc = { ...d, player: o(s.player), blocks: s.blocks.map(o) };
  const r = solve(sc, 120000);
  if (!r || r.len < 0 || r.len < cfg.minLen || r.len > cfg.maxLen) continue;
  const f = flips(sc, r.path);
  if (f.bf < cfg.minBF) continue;
  if (cfg.needPads) { const np = solve({ ...sc, pads: [] }, 60000); if (np && np.len >= 0 && np.len <= r.len + 2) continue; }
  out.push({ d: sc, r, f });
}
out.sort((a, b) => b.f.bf - a.f.bf || b.r.explored - a.r.explored);
function ascii(d) {
  const M = Array.from({ length: d.h }, () => Array.from({ length: d.w }, () => '.'));
  d.walls.forEach(([r, c]) => M[r][c] = '#');
  const g = a => 'FJLT'[(a[2] || 0) + 2 * (a[3] || 0)];   // F normal, J = fx, L = fy, T = both (stand-ins)
  d.targets.forEach(a => M[a[0]][a[1]] = g(a).toLowerCase());
  d.blocks.forEach(a => M[a[0]][a[1]] = g(a));
  M[d.home[0]][d.home[1]] = 'H';
  M[d.player[0]][d.player[1]] = '@';
  return `lr=${d.lr} tb=${d.tb}\n` + M.map(r => r.join(' ')).join('\n');
}
for (const { d, r, f } of out.slice(0, cfg.show)) {
  console.log(JSON.stringify(d)); console.log(ascii(d));
  console.log('len', r.len, 'blockFlips', f.bf, 'playerFlips', f.pf, 'explored', r.explored, r.path, '\n');
}
console.log('found', out.length);
