// Saved progress (localStorage, with a session/memory fallback). Changing the keys resets everyone's progress.
// Levels flagged `challenge: true` are optional: they never gate the next world.
import { WORLDS } from '../data/worlds.js';
import { getItem, setItem, removeItem } from './storage.js';

// Bump these when levels are reordered/replaced (saved progress is keyed by world:level index).
const DONE = 'twist-done4';
let done = {};
try { done = JSON.parse(getItem(DONE) || '{}'); } catch (e) {}
const save = () => setItem(DONE, JSON.stringify(done));
// The retired /embed taster kept its own save of Twist 1-4. Fold it into the main save once.
if (!Object.keys(done).length) {
  try {
    const old = JSON.parse(getItem('twist-embed-done') || '{}');
    if (old && typeof old === 'object' && Object.keys(old).length) { done = old; save(); }
  } catch (e) {}
}
const key = (w, l) => w + ':' + l;

export const isChallenge = (w, l) => !!WORLDS[w].levels[l].challenge;
export const isDone = (w, l) => !!done[key(w, l)];
export const markDone = (w, l) => { done[key(w, l)] = true; save(); };
const mainLevels = w => WORLDS[w].levels.map((d, l) => l).filter(l => !isChallenge(w, l));
export const mainTotal = w => mainLevels(w).length;
export const worldCount = w => mainLevels(w).filter(l => isDone(w, l)).length;          // main levels solved
export const worldDone = w => worldCount(w) === mainTotal(w);                            // challenges are optional
export const worldOpen = w => w === 0 || worldDone(w - 1);
// Level groups (world.groups = [[level idx...], ...]): a group opens when the previous group's levels are all solved.
// Challenge levels open once every main level of the world is solved. Missing `groups` = one open group.
export const groupsOf = w => WORLDS[w].groups || [mainLevels(w)];
export const levelOpen = (w, l) => {
  if (isChallenge(w, l)) return worldDone(w);
  const gs = groupsOf(w), gi = gs.findIndex(g => g.includes(l));
  return gi <= 0 || gs[gi - 1].every(x => isDone(w, x));
};
export const challengeCount = w => WORLDS[w].levels.filter((d, l) => d.challenge && isDone(w, l)).length;
export const worldPerfect = w => WORLDS[w].levels.every((_, l) => isDone(w, l));   // main + challenges
export const allPerfect = () => WORLDS.every((_, w) => worldPerfect(w));
// one-time moments (the finale, 100%) so they only play once
const FLAGS = 'twist-flags'; let flags = {};
try { flags = JSON.parse(getItem(FLAGS) || '{}'); } catch (e) {}
if (!Object.keys(flags).length) {
  try {
    const old = JSON.parse(getItem('twist-embed-flags') || '{}');
    if (old && typeof old === 'object' && Object.keys(old).length) { flags = old; setItem(FLAGS, JSON.stringify(flags)); }
  } catch (e) {}
}
export const flag = k => !!flags[k];
export const setFlag = k => { flags[k] = 1; setItem(FLAGS, JSON.stringify(flags)); };
export const allDone = () => done;
export const reset = () => { done = {}; flags = {}; save(); removeItem(FLAGS); };
export const totals = () => {
  const total = WORLDS.reduce((n, w) => n + w.levels.length, 0);
  const solved = Object.keys(done).filter(k => { const [w, l] = k.split(':').map(Number); return WORLDS[w] && l < WORLDS[w].levels.length; }).length;
  return { solved, total };
};
