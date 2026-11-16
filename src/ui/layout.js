// Sizing. A world's levels share one cell size (fitted to that world's largest level) so zoom stays steady
// inside a world; menu rooms are fitted to themselves. Padding is small: the reflections already fill the rest.
import { WORLDS } from '../data/worlds.js';

const MAX = 120, MIN = 22, LEVEL_PAD = 1.1;
const dims = WORLDS.map(w => w.levels.reduce((m, l) => ({ w: Math.max(m.w, l.w), h: Math.max(m.h, l.h) }), { w: 0, h: 0 }));

// the visible game area (excludes the touch pad when shown)
export const screenSize = () => { const s = document.getElementById('screen'); return [s.clientWidth, s.clientHeight]; };
const fit = (W, H, ew = 24, eh = 70) => { const [w, h] = screenSize(); return Math.floor(Math.min((w - ew) / W, (h - eh) / H)); };
export const levelCell = world => Math.max(MIN, Math.min(MAX, fit(dims[world].w + LEVEL_PAD, dims[world].h + LEVEL_PAD)));
export const roomCell = (W, H) => Math.max(MIN, Math.min(MAX, fit(W + .3, H + .3, 28, 60)));
export const LEVEL_MARGIN = .3;
