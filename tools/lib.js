// Level tooling: BFS solver over (player, blocks), built on the real engine module.
import * as api from '../src/engine/engine.js';
const o = a => a.r + ',' + a.c + ',' + a.fx + ',' + a.fy;
const canon = s => JSON.stringify([o(s.player), s.blocks.map(o).sort()]);
export const D = [[-1, 0, 'U'], [1, 0, 'D'], [0, -1, 'L'], [0, 1, 'R']];
export function solve(def, maxStates = 300000) {
  const s0 = api.parseLevel(def);
  const seen = new Set([canon(s0)]);
  let fr = [{ s: s0, p: '' }], n = 0;
  while (fr.length) {
    const nx = [];
    for (const { s, p } of fr) {
      if (api.isWin(s)) return { len: p.length, path: p, explored: n };
      for (const [dr, dc, nm] of D) {
        const t = api.step(s, dr, dc); if (!t) continue;
        const k = canon(t); if (seen.has(k)) continue;
        seen.add(k); if (++n > maxStates) return { len: -1, explored: n };
        nx.push({ s: t, p: p + nm });
      }
    }
    fr = nx;
  }
  return null;
}
// how many times blocks / the player get flipped along a path
export function flips(def, path) {
  let s = api.parseLevel(def), bf = 0, pf = 0;
  for (const ch of path) {
    const [dr, dc] = D.find(d => d[2] === ch);
    const t = api.step(s, dr, dc);
    t.blocks.forEach((b, i) => { bf += (b.fx !== s.blocks[i].fx) + (b.fy !== s.blocks[i].fy); });
    pf += (t.player.fx !== s.player.fx) + (t.player.fy !== s.player.fy);
    s = t;
  }
  return { bf, pf };
}
export { api, canon };
