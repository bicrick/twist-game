import {solve,flips} from './lib.js';
const L=JSON.parse(require('fs').readFileSync(process.argv[2],'utf8'));
for(const d of L){const r=solve(d);const f=r?flips(d,r.path):{};console.log(d.name.padEnd(18),r?(r.len+' moves  blockFlips '+f.bf+'  playerFlips '+f.pf+'  explored '+r.explored+'  '+r.path):'UNSOLVABLE');}
