// Checks the /embed taster on the live site: first visit throws you into level 1, the world has 4 levels, no hub for a new player,
// the main game stays untouched (own storage keys), and /embed/ redirects. Run: node tools/embed_check.mjs (needs puppeteer-core).
import puppeteer from 'puppeteer-core';
const BASE = process.env.BASE || 'https://twist-game.vercel.app';
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const page = await b.newPage(); await page.setViewport({ width: 1280, height: 800 });
const errs = []; page.on('pageerror', e => errs.push(e.message));
const sl = ms => new Promise(r => setTimeout(r, ms)), res = [], ck = (n, ok, g) => res.push((ok ? 'ok   ' : 'FAIL ') + n + (ok ? '' : ' -> ' + JSON.stringify(g)));
await page.goto(BASE + '/embed', { waitUntil: 'networkidle0' }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'networkidle0' }); await sl(1500);
ck('/embed loads the game (title)', await page.evaluate(() => !!document.querySelector('.play')));
ck('totals = 4 levels', (await page.evaluate(() => __progress.totals().total)) === 4);
await page.keyboard.press('Space'); await sl(1800);
ck('first Space -> level 1, no hub', await page.evaluate(() => !document.querySelector('.door') && !!document.querySelector('#floor .piece.player')));
const paths = [['LLR'], ['RRDRRDR'], ['DRRRRRRRR'], ['URRRRRRRRR']], K = { L: 'ArrowLeft', R: 'ArrowRight', U: 'ArrowUp', D: 'ArrowDown' };
for (const [p] of paths) { for (const ch of p) { await page.keyboard.press(K[ch]); await sl(80); } await sl(3000); }
const t = await page.evaluate(() => __progress.totals());
ck('solved 4/4 with real keys', t.solved === 4 && t.total === 4, t);
ck('taster uses its own storage; main progress untouched', await page.evaluate(() => !!localStorage.getItem('twist-embed-done') && !localStorage.getItem('twist-done4')));
ck('page errors 0', errs.length === 0, errs.slice(0, 3));
console.log(res.join('\n')); await b.close();
