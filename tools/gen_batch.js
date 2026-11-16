// Runs a list of named tiers in parallel (limited concurrency); writes /tmp/lv_<name>.json. Usage: node tools/gen_batch.js tiers.json [concurrency]
import { spawn } from 'child_process'; import fs from 'fs';
const tiers = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), conc = +process.argv[3] || 6;
let i = 0, running = 0;
const next = () => {
  while (running < conc && i < tiers.length) {
    const [name, cfg, seed] = tiers[i++]; running++;
    const p = spawn('node', ['tools/gen_level.js', JSON.stringify(cfg), String(seed)]); let buf = '';
    p.stdout.on('data', d => buf += d); p.stderr.on('data', d => process.stderr.write(name + ': ' + d));
    p.on('close', () => { fs.writeFileSync('/tmp/lv_' + name + '.json', buf || '[]'); running--; console.log('done', name); next(); });
  }
};
next();
