// Fails if a level is unsolvable/duplicated, or a world's room map is broken. Run: npm test
import { solve } from './lib.js';
import { WORLDS } from '../src/data/worlds.js';
import { parseMap } from '../src/data/roommap.js';
const seen = new Set(); let bad = 0;
const fail = (...a) => { console.log(...a); bad++; };
WORLDS.forEach((w, wi) => {
  w.levels.forEach((l, li) => {
    const r = solve(l, 400000), k = JSON.stringify(l);
    if (!r || r.len < 0) fail('UNSOLVABLE', wi, li);
    if (seen.has(k)) fail('DUPLICATE', wi, li); seen.add(k);
  });
  // room map: every level exactly once, start + exit present, everything reachable on foot
  const m = parseMap(w.map);
  w.levels.forEach((_, li) => { if (!m.levels[li]) fail('MAP missing level', wi, li); });
  Object.keys(m.levels).forEach(i => { if (!w.levels[i]) fail('MAP has unknown level', wi, i); });
  if (!m.start || !m.exit) fail('MAP needs S and X', wi);
  else {
    const stops = new Set([...Object.values(m.levels), m.exit].map(p => p.join())), seenC = new Set([m.start.join()]), q = [m.start];
    while (q.length) { const [r, c] = q.shift(); if (stops.has(r + ',' + c)) continue;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const rr = r + dr, cc = c + dc, k = rr + ',' + cc;
        if (rr < 0 || cc < 0 || rr >= m.H || cc >= m.W || m.walls.has(k) || seenC.has(k)) continue; seenC.add(k); q.push([rr, cc]); } }
    [...stops].forEach(s => { if (!seenC.has(s)) fail('UNREACHABLE door', wi, s); });
  }
});
console.log(bad ? bad + ' problem(s)' : 'levels solvable, unique; room maps valid and reachable'); process.exit(bad ? 1 : 0);
