// One cell size for the whole game, so zoom never jumps between screens.
// Levels all use the same size (fitted to the largest level); menu rooms use it too
// and only shrink when they cannot fit.
import { WORLDS } from '../data/worlds.js';

const MAX = 80, MIN = 24, LEVEL_PAD = 1.8;
let maxW = 0, maxH = 0;
WORLDS.forEach(w => w.levels.forEach(l => { maxW = Math.max(maxW, l.w); maxH = Math.max(maxH, l.h); }));

const fit = (W, H) => Math.floor(Math.min((innerWidth - 40) / W, (innerHeight - 150) / H));
export const baseCell = () => Math.max(MIN, Math.min(MAX, fit(maxW + LEVEL_PAD, maxH + LEVEL_PAD)));
export const levelCell = baseCell;
export const roomCell = (W, H) => Math.max(MIN, Math.min(baseCell(), fit(W, H)));
export const LEVEL_MARGIN = .3;
