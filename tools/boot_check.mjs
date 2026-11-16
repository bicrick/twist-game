// Quick boot check of the live site: prints page errors, failed requests and whether the game started.
import puppeteer from 'puppeteer-core';
const URL = process.env.URL || 'https://twist-game.vercel.app/';
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const page = await b.newPage(); await page.setViewport({ width: 1280, height: 800 });
page.on('pageerror', e => console.log('PAGEERROR', e.message)); page.on('console', m => m.type() === 'error' && console.log('CONSOLE', m.text()));
page.on('requestfailed', r => console.log('REQFAIL', r.url(), r.failure() && r.failure().errorText));
await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
for (let i = 0; i < 6; i++) { await new Promise(r => setTimeout(r, 1500)); console.log(i, await page.evaluate(() => ({ lvl: typeof __level, play: !!document.querySelector('.play'), sw: !!navigator.serviceWorker.controller }))); }
await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'load', timeout: 90000 });
for (let i = 0; i < 6; i++) { await new Promise(r => setTimeout(r, 1500)); console.log('after reload', i, await page.evaluate(() => ({ lvl: typeof __level, play: !!document.querySelector('.play') }))); }
await b.close();
