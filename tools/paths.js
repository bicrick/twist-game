// Solve every level and write tools/paths.json (used by check_levels / replays).
import fs from 'fs';
import { solve } from './lib.js';
import { WORLDS } from '../src/data/worlds.js';
const out = WORLDS.map(w => w.levels.map(l => { const r = solve(l, 400000); if (!r || r.len < 0) throw new Error('unsolvable'); return r.path; }));
fs.writeFileSync(new URL('./paths.json', import.meta.url), JSON.stringify(out));
console.log(out.map(w => w.map(p => p.length).join(',')));
