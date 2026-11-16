// Prints every level's size, edges, blocks, mechanic use, solution length, pushes and flips, plus per-world difficulty ramps.
// Run: node tools/audit_levels.mjs
import { WORLDS } from '../src/data/worlds.js';
import { solve, flips, api } from './lib.js';
const D = [[-1,0,'U'],[1,0,'D'],[0,-1,'L'],[0,1,'R']];
const rows = [];
for (const [wi, w] of WORLDS.entries()) {
  console.log(`\n=== ${w.name} (${w.levels.length} levels; bot: ${w.bot.shape}) ===`);
  console.log('  #  kind   size  edges(lr/tb)  blocks walls  mech-use     moves pushes flips');
  w.levels.forEach((l, i) => {
    const r = solve(l, 400000); let s = api.parseLevel(l), pushes = 0, warps = 0, gate = 0;
    const gc = new Set((l.gates||[]).map(g => g[0]+','+g[1]));
    for (const ch of r.path) { const [dr,dc] = D.find(d => d[2]===ch), n = api.step(s, dr, dc), ev = api.stepEvents(s, n, dr, dc); if (ev.pushed) pushes++; if ((l.portals||[]).length && ev.wrapped) warps++; if (gc.size && (gc.has(n.player.r+','+n.player.c) || n.blocks.some(b=>gc.has(b.r+','+b.c)))) gate++; s = n; }
    const f = flips(l, r.path);
    const mech = [l.slide?'slide':'', (l.portals||[]).length?`portals x${(l.portals||[]).length} (${warps} warps)`:'', (l.plates||[]).length?`plates x${(l.plates||[]).length} (${gate} gate uses)`:'', (l.lr!=='none'||l.tb!=='none')?'seams':''].filter(Boolean).join(', ') || 'plain';
    rows.push({ world: w.name, challenge: !!l.challenge, moves: r.len, size: l.w+'x'+l.h, blocks: l.blocks.length, mech });
    console.log(`  ${String(i+1).padStart(2)}  ${l.challenge?'chall ':'main  '} ${(l.w+'x'+l.h).padEnd(5)} ${(l.lr+'/'+l.tb).padEnd(13)} ${String(l.blocks.length).padEnd(6)} ${String(l.walls.length).padEnd(5)} ${mech.padEnd(28)} ${String(r.len).padEnd(5)} ${String(pushes).padEnd(6)} ${f.bf}b/${f.pf}p`);
  });
}
// whole-game variety summary
const sizes = new Set(rows.map(r => r.size)), blockCounts = new Set(rows.map(r => r.blocks)), mechs = new Set(rows.map(r => r.mech.replace(/ \(.*?\)/g,'')));
const main = rows.filter(r=>!r.challenge), ch = rows.filter(r=>r.challenge);
console.log(`\nSUMMARY: ${rows.length} levels (${main.length} main, ${ch.length} challenge) | distinct board sizes: ${sizes.size} | block counts used: ${[...blockCounts].sort().join(',')} | distinct mechanic combos: ${mechs.size}`);
console.log(`moves: main ${Math.min(...main.map(r=>r.moves))}-${Math.max(...main.map(r=>r.moves))}, challenge ${Math.min(...ch.map(r=>r.moves))}-${Math.max(...ch.map(r=>r.moves))} (avg main ${Math.round(main.reduce((a,r)=>a+r.moves,0)/main.length)}, avg challenge ${Math.round(ch.reduce((a,r)=>a+r.moves,0)/ch.length)})`);
// difficulty ramp: first level of each world should be among the world's shortest; per-group means should not fall
for (const [wi,w] of WORLDS.entries()) { const lens = w.levels.map(l=>solve(l,400000).len); const groups = w.groups.map(g=>Math.round(g.reduce((a,i)=>a+lens[i],0)/g.length)); console.log(`${w.name}: group avg moves ${groups.join(' -> ')} ${groups.every((x,i)=>i===0||x>=groups[i-1])?'(rising)':'(NOT monotonic)'}; first level ${lens[0]} moves vs world median ${[...lens.slice(0,w.levels.filter(l=>!l.challenge).length)].sort((a,b)=>a-b)[Math.floor(lens.filter((_,i)=>!w.levels[i].challenge).length/2)]}`); }
