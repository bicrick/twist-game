import { spawn } from 'child_process';
import fs from 'fs';
const J = JSON.stringify;
const jobs = {
  w1_tb:  [{w:[3,4],h:[4,5],lr:['none'],tb:['twist'],walls:[0,1],blocks:[1,1],scr:[12,40],minLen:6,maxLen:14,minBF:1,tries:4000,show:8}, 31],
  w1_A:   [{w:[4,5],h:[3,3],lr:['twist'],tb:['none'],walls:[0,1],blocks:[1,1],scr:[12,40],minLen:6,maxLen:16,minBF:1,tries:3000,show:8}, 4],
  w1_M:   [{w:[4,5],h:[3,3],lr:['twist'],tb:['plain'],walls:[1,2],blocks:[1,1],scr:[15,45],minLen:8,maxLen:18,minBF:1,tries:3000,show:8}, 12],
  w1_B:   [{w:[4,5],h:[3,4],lr:['twist'],tb:['twist'],walls:[0,2],blocks:[1,1],scr:[15,50],minLen:10,maxLen:24,minBF:2,tries:3000,show:8}, 8],
  w1_C:   [{w:[4,4],h:[3,3],lr:['twist','plain'],tb:['twist','none'],walls:[0,1],blocks:[2,2],scr:[20,60],minLen:12,maxLen:28,minBF:2,tries:2500,show:8}, 3],
  w2_P1:  [{w:[4,5],h:[3,3],lr:['none'],tb:['none'],walls:[1,2],pads:[1,2],blocks:[1,1],scr:[10,35],minLen:6,maxLen:16,minBF:1,needPads:true,tries:4000,show:8}, 41],
  w2_P2:  [{w:[4,5],h:[3,3],lr:['plain'],tb:['none'],walls:[1,2],pads:[1,2],blocks:[1,1],scr:[12,40],minLen:7,maxLen:18,minBF:1,needPads:true,tries:4000,show:8}, 42],
  w2_P3:  [{w:[4,5],h:[3,3],lr:['twist'],tb:['none'],walls:[0,2],pads:[1,2],blocks:[1,1],scr:[12,40],minLen:8,maxLen:20,minBF:1,needPads:true,tries:4000,show:8}, 43],
  w2_P4:  [{w:[4,4],h:[3,4],lr:['twist'],tb:['twist'],walls:[0,2],pads:[1,2],blocks:[1,1],scr:[15,45],minLen:10,maxLen:24,minBF:1,needPads:true,tries:3500,show:8}, 44],
  w2_P5:  [{w:[4,4],h:[3,3],lr:['none','plain'],tb:['none'],walls:[0,1],pads:[2,3],blocks:[2,2],scr:[18,50],minLen:11,maxLen:26,minBF:2,needPads:true,tries:2500,show:8}, 45],
};
let left = Object.keys(jobs).length;
for (const [k, [cfg, seed]] of Object.entries(jobs)) {
  const out = fs.openSync(`gen_${k}.out`, 'w');
  const p = spawn('node', ['gen.js', J(cfg), String(seed)], { stdio: ['ignore', out, 'ignore'] });
  p.on('exit', () => { if (--left === 0) console.log('all done'); });
}
