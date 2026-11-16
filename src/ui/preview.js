// Level thumbnails for the world rooms. Each is drawn once to a canvas and used as an image,
// so every reflected copy of a room reuses it for the price of one element.
const cache = new WeakMap();
// theme vars live on <body> (per world), the rest on <html>
const css = n => getComputedStyle(document.body).getPropertyValue(n).trim();

export function previewURL(def, box) {
  const s = Math.max(4, Math.floor((box * .74) / Math.max(def.w, def.h)));
  const hit = cache.get(def); if (hit && hit.s === s) return hit;
  const e = Math.max(2, s / 4), w = def.w * s + 2 * e, h = def.h * s + 2 * e, dpr = Math.min(2, window.devicePixelRatio || 1);
  const cv = document.createElement('canvas'); cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const edge = t => t === 'twist' ? css('--twist') : t === 'plain' ? css('--plain') : '#000';
  const rr = (x, y, ww, hh, r, fill) => { g.beginPath(); g.roundRect(x, y, ww, hh, r); g.fillStyle = fill; g.fill(); };
  g.fillStyle = css('--floor'); g.fillRect(0, 0, w, h);
  g.fillStyle = edge(def.tb); g.fillRect(0, 0, w, e); g.fillRect(0, h - e, w, e);
  g.fillStyle = edge(def.lr); g.fillRect(0, 0, e, h); g.fillRect(w - e, 0, e, h);
  const at = a => a[0] + ',' + a[1], walls = new Set(def.walls.map(at)), blocks = new Set(def.blocks.map(at));
  const tg = new Set(def.targets.map(at)), pads = new Set((def.pads || []).map(at)), pk = at(def.player), hk = at(def.home);
  const ring = (x, y, k, col) => { g.beginPath(); g.roundRect(x + s * .14 + 1, y + s * .14 + 1, s * .72 - 2, s * .72 - 2, s * .26); g.strokeStyle = col; g.lineWidth = 2; g.stroke(); };
  for (let r = 0; r < def.h; r++) for (let c = 0; c < def.w; c++) {
    const k = r + ',' + c, x = e + c * s, y = e + r * s;
    if (walls.has(k)) (g.fillStyle = css('--wall'), g.fillRect(x, y, s, s));
    else if (pads.has(k) && !blocks.has(k) && k !== pk) { g.fillStyle = css('--padc'); g.fillRect(x + s * .25, y + s * .25, s * .5, s * .5); }
    else if (blocks.has(k)) rr(x + s * .12, y + s * .12, s * .76, s * .76, s * .3, css('--block'));
    else if (k === pk) rr(x + s * .12, y + s * .12, s * .76, s * .76, s * .3, css('--player'));
    else if (tg.has(k)) ring(x, y, k, css('--block'));
    else if (k === hk) ring(x, y, k, css('--player'));
  }
  const out = { s, w, h, url: cv.toDataURL() }; cache.set(def, out); return out;
}
