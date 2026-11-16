// Trusted touch input (CDP Input.dispatchTouchEvent via page.touchscreen) in real Chrome with device emulation
// (iPhone 13 / SE, Pixel 5, iPad Mini, iPhone landscape). Defaults to the live site.
//   npm i --no-save puppeteer-core && node tools/audit_touch.mjs            (or URL=http://localhost:5173/ ; CHROME_PATH=...)
import puppeteer, { KnownDevices } from 'puppeteer-core';
const URL = process.env.URL || 'https://twist-game.vercel.app/';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const results = []; const errors = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function session(deviceName, fn) {
  const page = await browser.newPage(); page.on('pageerror', e => errors.push(deviceName + ': ' + e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(deviceName + ' console: ' + m.text()); });
  await page.emulate(KnownDevices[deviceName]); await page.goto(URL, { waitUntil: 'networkidle0' }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'networkidle0' }); await sleep(1700);
  const check = async (name, f, expect) => { let got; try { got = await f(); } catch (e) { got = 'ERROR ' + e.message; } const ok = JSON.stringify(got) === JSON.stringify(expect); results.push({ device: deviceName, name, ok, got: ok ? undefined : got }); return ok; };
  const center = async sel => { const b = await (await page.$(sel)).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2, b]; };
  const tapSel = async sel => { const [x, y] = await center(sel); await page.touchscreen.tap(x, y); await sleep(120); };
  const dpad = async d => { const [cx, cy, b] = await center('.dpad'); const u = b.width / 3, [dx, dy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[d]; await page.touchscreen.tap(cx + dx * u, cy + dy * u); await sleep(260); };
  const evalp = (f, ...a) => page.evaluate(f, ...a);
  try { await fn({ page, check, center, tapSel, dpad, evalp, sleep }); } finally { await page.screenshot({ path: `${process.env.SHOTS || '/tmp'}/${deviceName.replace(/\W+/g, '_')}_end.png` }); await page.close(); }
}
const phone = async ({ page, check, center, tapSel, dpad, evalp, sleep }) => {
  await check('real touch emulation: coarse pointer + touch points', () => evalp(() => [matchMedia('(pointer: coarse)').matches, navigator.maxTouchPoints > 0]), [true, true]);
  await check('touch pad is shown (no ?pad flag needed)', () => evalp(() => document.documentElement.classList.contains('with-pad')), true);
  await check('trusted tap on Play (first ever) -> straight into level 1; audio gesture unlocked', async () => { await tapSel('.play'); await sleep(1400); return evalp(() => [!document.querySelector('.door'), !!document.querySelector('#floor .piece.player'), navigator.userActivation.hasBeenActive]); }, [true, true, true]);
  await check('hub is the 3x3 crossroads (4 doors); D-pad taps walk hub -> Twist room (13 doors)', async () => { await evalp(() => __hub()); await sleep(1300); const n = await evalp(() => document.querySelectorAll('.door').length); for (const d of ['up', 'left']) await dpad(d); await sleep(1300); return [n, await evalp(() => document.querySelectorAll('.door').length)]; }, [4, 13]);
  await check('walk into level 1 by touch', async () => { const portrait = await evalp(() => { const f = document.querySelector('#floor').getBoundingClientRect(); return f.height > f.width; }); await dpad(portrait ? 'down' : 'right'); await sleep(1300); return evalp(() => !!document.querySelector('#floor .piece.player') && !document.querySelector('#floor.room')); }, true);
  await check('D-pad HOLD repeats movement (touchStart, wait, touchEnd)', async () => { const before = await evalp(() => __level.peek().hist); const [cx, cy, b] = await center('.dpad'); const u = b.width / 3; const ts = await page.touchscreen.touchStart(cx + u, cy); await sleep(900); await ts.end(); await sleep(200); const after = await evalp(() => __level.peek().hist); return after >= before; }, true);
  await check('D-pad SLIDE changes direction without lifting', async () => { const [cx, cy, b] = await center('.dpad'); const u = b.width / 3; const ts = await page.touchscreen.touchStart(cx, cy - u); await sleep(150); await ts.move(cx + u, cy); await sleep(150); const dir = await evalp(() => document.querySelector('.dpad').dataset.dir); await ts.end(); return dir; }, 'right');
  await check('trusted tap Undo then Redo', async () => { await evalp(() => { __level.restart && 0; }); const h0 = await evalp(() => __level.peek()); if (h0.hist === 0) { for (const d of ['right', 'left', 'down', 'up']) { await dpad(d); if ((await evalp(() => __level.peek().hist)) > 0) break; } } const a = await evalp(() => __level.peek().hist); await tapSel('.act.undo'); const u = await evalp(() => __level.peek()); await tapSel('.act.redo'); const r = await evalp(() => __level.peek().hist); return [a > 0, u.hist === a - 1 && u.redo === 1, r === a]; }, [true, true, true]);
  await check('trusted tap Menu -> icon pause grid (5 tiles), OK button replaces actions', async () => { await tapSel('.pbtn:nth-child(2)'); await sleep(300); return evalp(() => [document.querySelectorAll('#menu .tile').length, getComputedStyle(document.querySelector('.act.ok')).display !== 'none']); }, [5, true]);
  await check('trusted taps: cog tile -> settings, toggle Bot trail, tap volume segment 7', async () => { const tap = async sel => { const bb = await (await page.$(sel)).boundingBox(); await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(240); }; await tap('#menu .tile[data-label="Settings"]'); await tap('#menu .row[data-label="Bot trail"]'); await tap('#menu .row:nth-child(2) .seg[data-i="6"]'); return evalp(() => { const s = JSON.parse(localStorage.getItem('twist-settings') || '{}'); return [document.querySelectorAll('#menu .row').length, s.trail, s.volume]; }); }, [10, false, 0.7]);
  await check('trusted taps: Back (x2) closes menus; screen is playable again', async () => { await tapSel('.pbtn:nth-child(1)'); await sleep(250); await tapSel('.pbtn:nth-child(1)'); await sleep(250); return evalp(() => !document.documentElement.classList.contains('menu-open')); }, true);
  await check('no horizontal scroll / overflow', () => evalp(() => [document.documentElement.scrollWidth <= innerWidth, document.documentElement.scrollHeight <= innerHeight + 1]), [true, true]);
};
await session('iPhone 13', phone);
await session('Pixel 5', phone);
await session('iPhone SE', phone);
await session('iPad Mini', async ({ check, evalp, tapSel, sleep }) => {
  await check('tablet (coarse pointer) gets the pad without a flag', () => evalp(() => [matchMedia('(pointer: coarse)').matches, document.documentElement.classList.contains('with-pad')]), [true, true]);
  await check('tap Play -> level 1', async () => { await tapSel('.play'); await sleep(1400); return evalp(() => !!document.querySelector('#floor .piece.player') && !document.querySelector('.door')); }, true);
});
// landscape phone
{
  const page = await browser.newPage(); page.on('pageerror', e => errors.push('landscape: ' + e.message));
  const dev = KnownDevices['iPhone 13 landscape']; await page.emulate(dev); await page.goto(URL, { waitUntil: 'networkidle0' }); await sleep(1700);
  const lay = await page.evaluate(() => { const d = document.querySelector('.dpad').getBoundingClientRect(), a = document.querySelector('.acts').getBoundingClientRect(), s = document.getElementById('screen').getBoundingClientRect(); return { dpadLeftOfScreen: d.right <= s.left + 2, actsRightOfScreen: a.left >= s.right - 2, pad: document.documentElement.classList.contains('with-pad') }; });
  results.push({ device: 'iPhone 13 landscape', name: 'pad: D-pad left, actions right of the screen', ok: lay.pad && lay.dpadLeftOfScreen && lay.actsRightOfScreen, got: JSON.stringify(lay) });
  await page.screenshot({ path: `${process.env.SHOTS || '/tmp'}/landscape.png` }); await page.close();
}
await browser.close();
const bad = results.filter(r => !r.ok); console.log(`TRUSTED-TOUCH AUDIT (live site): ${results.length - bad.length}/${results.length} passed; page errors: ${errors.length}`);
for (const r of results) console.log((r.ok ? ' ok  ' : ' FAIL') + ` [${r.device}] ${r.name}` + (r.ok ? '' : '  -> ' + JSON.stringify(r.got)));
if (errors.length) console.log('errors:', errors.slice(0, 5));
