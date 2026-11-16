// Fails if any level is unsolvable or duplicated. Run: npm test
import { solve } from './lib.js';
import { WORLDS } from '../src/data/worlds.js';
const seen = new Set(); let bad = 0;
WORLDS.forEach((w, wi) => w.levels.forEach((l, li) => {
  const r = solve(l, 400000), k = JSON.stringify(l);
  if (!r || r.len < 0) { console.log('UNSOLVABLE', wi, li); bad++; }
  if (seen.has(k)) { console.log('DUPLICATE', wi, li); bad++; } seen.add(k);
}));
console.log(bad ? bad + ' problem(s)' : 'all levels solvable, no duplicates'); process.exit(bad ? 1 : 0);
