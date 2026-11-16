// Original OST beds (public/music/*.m4a). Web Audio player: lazy-load, gapless loop, crossfade.
// Music prefs live in localStorage `twist-music` (never written into `twist-settings`).
import { WORLDS } from '../data/worlds.js';

const KEY = 'twist-music';
const defaults = { enabled: true, volume: 0.6 };
let prefs = { ...defaults };
try { prefs = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) {}

const FILES = {
  title: 'music/title.m4a',
  hub:   'music/hub.m4a',
  pause: 'music/pause.m4a',
  twist: 'music/twist.m4a',
  slide: 'music/slide.m4a',
  warp:  'music/warp.m4a',
  gate:  'music/gate.m4a',
};
const WORLD_TRACK = { Twist: 'twist', Slide: 'slide', Warp: 'warp', Gate: 'gate' };

// Beds are already at about -20 LUFS (pause -24). This headroom keeps them under SFX.
const HEADROOM = 0.55;
const FADE = 1.25;          // seconds, track-to-track / duck-to-pause
const MICRO_XFADE = 0.008;  // seconds, hides residual AAC padding at the loop point

let ctx, master, masterEnabled = true;
const buffers = new Map();   // id -> AudioBuffer (trimmed, micro-crossfaded)
const loading = new Map();
// Two layers so a world bed can be ducked (and later resumed) under the pause bed.
const layers = {
  bed:   { id: null, source: null, gain: null, startedAt: 0, offset: 0 },
  pause: { id: null, source: null, gain: null, startedAt: 0, offset: 0 },
};

export const get = k => prefs[k];
export function set(k, v) {
  prefs[k] = v;
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {}
  applyGain();
}
export const toggle = () => { set('enabled', !prefs.enabled); return prefs.enabled; };

export function sync({ masterEnabled: on } = {}) {
  if (on != null) masterEnabled = !!on;
  applyGain();
}

export function unlock() {
  ensureCtx();
  if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
}

export function trackFor(mode, worldIndex) {
  if (mode === 'title') return 'title';
  if (mode === 'hub') return 'hub';
  if (mode === 'world' || mode === 'level') {
    const w = WORLDS[worldIndex];
    return (w && WORLD_TRACK[w.name]) || 'hub';
  }
  return 'title';
}

/** mode + world index + whether a pause/settings overlay is open. Debounced by the caller if needed. */
export function setScreen({ mode, world, menuOpen }) {
  const bedId = trackFor(mode, world);
  const wantPause = !!menuOpen;
  ensureCtx();
  if (wantPause) {
    setLayer('bed', bedId, 0);       // keep/load the world bed, ducked
    setLayer('pause', 'pause', 1);
  } else {
    setLayer('pause', null, 0);
    setLayer('bed', bedId, 1);
  }
}

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.connect(ctx.destination);
  applyGain();
  return ctx;
}

function audible() { return masterEnabled && prefs.enabled && prefs.volume > 0; }

function applyGain() {
  if (!master || !ctx) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(audible() ? prefs.volume * HEADROOM : 0, now + 0.16);
}

function urlFor(id) {
  // Vite `base: './'` — keep music URLs relative to the document so Pages / subpaths work.
  const base = document.baseURI || location.href;
  return new URL(FILES[id], base).href;
}

function decodeBuf(ab) {
  return new Promise((resolve, reject) => {
    let done = false;
    const ok = buf => { if (!done) { done = true; resolve(buf); } };
    const err = e => { if (!done) { done = true; reject(e || new Error('decode failed')); } };
    try {
      const ret = ctx.decodeAudioData(ab, ok, err);
      if (ret && typeof ret.then === 'function') ret.then(ok, err);
    } catch (e) { err(e); }
  });
}

function load(id) {
  if (buffers.has(id)) return Promise.resolve(buffers.get(id));
  if (loading.has(id)) return loading.get(id);
  const p = fetch(urlFor(id)).then(r => {
    if (!r.ok) throw new Error('music ' + id + ' ' + r.status);
    return r.arrayBuffer();
  }).then(ab => {
    ensureCtx();
    return decodeBuf(ab).then(prepareBuffer);
  }).then(buf => { buffers.set(id, buf); loading.delete(id); return buf; })
    .catch(e => { loading.delete(id); console.warn('[music]', id, e); throw e; });
  loading.set(id, p);
  return p;
}

// AAC often appends a short pad (or, in some browsers, a priming delay). Trim to the
// loop point that best matches the first sample, then bake a tiny equal-power seam.
function prepareBuffer(src) {
  const n = src.length, chN = src.numberOfChannels, sr = src.sampleRate;
  const chs = Array.from({ length: chN }, (_, i) => src.getChannelData(i));
  const win = Math.min(4096, n >> 3);
  let bestS = 0, bestE = n, best = Infinity;
  for (let s = 0; s <= 128; s++) {
    const a0 = chs[0][s];
    for (let e = n; e >= n - win && e > s + sr; e--) {
      const sc = Math.abs(chs[0][e - 1] - a0);
      if (sc < best) { best = sc; bestS = s; bestE = e; if (sc < 1e-5) break; }
    }
    if (best < 1e-5) break;
  }
  const len = bestE - bestS;
  const out = ctx.createBuffer(chN, len, sr);
  const xf = Math.min(Math.round(MICRO_XFADE * sr), len >> 3);
  for (let c = 0; c < chN; c++) {
    const srcC = chs[c].subarray(bestS, bestE);
    const dst = out.getChannelData(c);
    dst.set(srcC);
    for (let i = 0; i < xf; i++) {
      const fo = Math.cos((i / (xf - 1)) * Math.PI / 2);
      const fi = Math.sin((i / (xf - 1)) * Math.PI / 2);
      // mix the last xf samples toward the first xf, so looping is click-free
      const k = len - xf + i;
      dst[k] = srcC[k] * fo + srcC[i] * fi;
    }
  }
  return out;
}

function setLayer(name, id, target) {
  const layer = layers[name];
  layer.target = target;
  if (!id) { layer.wanted = null; fadeTo(layer, 0); return; }
  layer.wanted = id;
  if (!ctx) return;
  if (layer.id === id && layer.source) { fadeTo(layer, target); tryStart(); return; }
  load(id).then(buf => {
    if (layer.wanted !== id) return;
    startSource(layer, id, buf, layer.target);
  }).catch(() => {});
}

function startSource(layer, id, buf, target) {
  if (!ctx) return;
  // drop the previous source (fade first if it was audible)
  if (layer.source) {
    fadeTo(layer, 0);
    const old = layer;
    // actually we need to fade the OLD gain and start a new one — replace layer slots
    const prevGain = layer.gain, prevSrc = layer.source;
    const stopAt = ctx.currentTime + FADE + 0.05;
    try { prevSrc.stop(stopAt); } catch (e) {}
    // disconnect later
    setTimeout(() => { try { prevSrc.disconnect(); prevGain.disconnect(); } catch (e) {} }, (FADE + 0.2) * 1000);
  }
  const gain = ctx.createGain();
  const startVal = target > 0 ? 0 : 0;
  gain.gain.value = startVal;
  gain.connect(master);
  const source = ctx.createBufferSource();
  source.buffer = buf;
  source.loop = true;
  source.connect(gain);
  const offset = 0;
  tryStart();
  try { source.start(0, offset % buf.duration); } catch (e) { return; }
  layer.id = id; layer.source = source; layer.gain = gain;
  layer.startedAt = ctx.currentTime; layer.offset = offset;
  fadeTo(layer, layer.target != null ? layer.target : target);
}

function fadeTo(layer, target) {
  if (!layer.gain || !ctx) return;
  const now = ctx.currentTime;
  const g = layer.gain.gain;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(target, now + FADE);
}

function tryStart() {
  if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
}

// Prefetch the title bed so the first gesture can start quickly.
if (typeof window !== 'undefined') {
  const boot = () => { ensureCtx(); load('title').catch(() => {}); };
  if (document.readyState === 'complete') boot();
  else addEventListener('load', boot, { once: true });
}
