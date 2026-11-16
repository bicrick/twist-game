// Regenerates public/og.png (the 1200x630 link-preview card) from the live title screen.
//   npm i --no-save puppeteer-core && node tools/og.mjs   (URL=... CHROME_PATH=... to override)
import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const page = await b.newPage(); await page.setViewport({ width: 1200, height: 630 });
await page.goto(process.env.URL || 'https://twist-game.vercel.app/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2500));
await page.screenshot({ path: new URL('../public/og.png', import.meta.url).pathname });
await b.close();
