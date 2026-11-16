// /embed is the full game (same levels and save as /), not the retired 4-level taster.
// First visit still opens level 1. /embed/ must load with no redirect. Run: node tools/embed_check.mjs
import puppeteer from 'puppeteer-core';
const BASE = process.env.BASE || 'https://twist-game.vercel.app';
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const page = await b.newPage(); await page.setViewport({ width: 1280, height: 800 });
const errs = []; page.on('pageerror', e => errs.push(e.message));
const sl = ms => new Promise(r => setTimeout(r, ms)), res = [], ck = (n, ok, g) => res.push((ok ? 'ok   ' : 'FAIL ') + n + (ok ? '' : ' -> ' + JSON.stringify(g)));
await page.goto(BASE + '/embed', { waitUntil: 'networkidle0' }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'networkidle0' }); await sl(1500);
ck('/embed loads the game (title)', await page.evaluate(() => !!document.querySelector('.play')));
ck('full game (39 levels), not the 4-level taster', (await page.evaluate(() => __progress.totals().total)) === 39);
await page.keyboard.press('Space'); await sl(1800);
ck('first Space -> level 1, no hub', await page.evaluate(() => !document.querySelector('.door') && !!document.querySelector('#floor .piece.player')));
await page.evaluate(() => __progress.markDone(0, 0));
ck('embed writes the main save, not twist-embed-done', await page.evaluate(() => !!localStorage.getItem('twist-done4') && !localStorage.getItem('twist-embed-done')));
const slash = await page.goto(BASE + '/embed/', { waitUntil: 'networkidle0' });
ck('/embed/ serves the game without an error status', slash && slash.status() < 400 && await page.evaluate(() => !!document.querySelector('.play') && __progress.totals().total === 39), slash && slash.status());
ck('page errors 0', errs.length === 0, errs.slice(0, 3));
console.log(res.join('\n')); await b.close();
process.exit(res.some(l => l.startsWith('FAIL')) ? 1 : 0);
