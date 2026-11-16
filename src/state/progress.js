// Saved progress (localStorage). Changing the keys resets everyone's progress.
import { WORLDS } from '../data/worlds.js';

// Bump these when levels are reordered/replaced (saved progress is keyed by world:level index).
const DONE = 'twist-done3', SEEN = 'twist-seen2';
let done = {}, seen = {};
try { done = JSON.parse(localStorage.getItem(DONE) || '{}'); seen = JSON.parse(localStorage.getItem(SEEN) || '{}'); } catch (e) {}
const save = () => { try { localStorage.setItem(DONE, JSON.stringify(done)); localStorage.setItem(SEEN, JSON.stringify(seen)); } catch (e) {} };
const key = (w, l) => w + ':' + l;

export const isDone = (w, l) => !!done[key(w, l)];
export const markDone = (w, l) => { done[key(w, l)] = true; save(); };
export const worldCount = w => WORLDS[w].levels.filter((_, l) => isDone(w, l)).length;
export const worldDone = w => worldCount(w) === WORLDS[w].levels.length;
export const worldOpen = w => w === 0 || worldDone(w - 1);
export const introSeen = w => !!seen[w];
export const markIntroSeen = w => { seen[w] = 1; save(); };
export const allDone = () => done;
export const totals = () => {
  const total = WORLDS.reduce((n, w) => n + w.levels.length, 0);
  const solved = Object.keys(done).filter(k => { const [w, l] = k.split(':').map(Number); return WORLDS[w] && l < WORLDS[w].levels.length; }).length;
  return { solved, total };
};
