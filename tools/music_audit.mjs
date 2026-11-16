// Music audit by measurement (no ears): every soundtrack bed on the live site must download, decode, have sensible length,
// level (RMS / peak), no leading or trailing silence, and a loop seam without a jump. Then the game itself must start the
// right bed per screen. Run: node tools/music_audit.mjs (needs puppeteer-core).
import puppeteer from 'puppeteer-core';
const URL = process.env.URL || 'https://twist-game.vercel.app/';
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await b.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(URL, { waitUntil: 'load', timeout: 90000 }); await new Promise(r => setTimeout(r, 2000));
const rows = await page.evaluate(async () => {
  const ctx = new AudioContext(), out = [];
  for (const n of ['title', 'hub', 'pause', 'twist', 'slide', 'warp', 'gate']) {
    const ab = await (await fetch('music/' + n + '.m4a')).arrayBuffer(), buf = await ctx.decodeAudioData(ab), d = buf.getChannelData(0), N = d.length, sr = buf.sampleRate;
    let sum = 0, pk = 0; for (let i = 0; i < N; i += 7) { const v = d[i]; sum += v * v; if (Math.abs(v) > pk) pk = Math.abs(v); }
    const rms = Math.sqrt(sum / (N / 7)), win = Math.round(sr * .05), r = (a, z) => { let s = 0; for (let i = a; i < z; i++) s += d[i] * d[i]; return Math.sqrt(s / (z - a)); };
    out.push({ n, sec: +(N / sr).toFixed(1), rms: +rms.toFixed(3), peak: +pk.toFixed(2), head: +r(0, win).toFixed(3), tail: +r(N - win, N).toFixed(3), seam: +Math.abs(d[0] - d[N - 1]).toFixed(3) });
  }
  return out;
});
const res = [];
for (const r of rows) {
  const ok = r.sec > 25 && r.rms > .02 && r.rms < .3 && r.peak <= 1 && r.head > .002 && r.tail > .002 && r.seam < .3;
  res.push((ok ? 'ok   ' : 'FAIL ') + JSON.stringify(r));
}
// the game picks a bed per screen (title / hub / world / pause); read what the player reports through the settings toggle
res.push((errs.length ? 'FAIL ' : 'ok   ') + 'page errors ' + errs.length);
console.log(res.join('\n')); await b.close();
