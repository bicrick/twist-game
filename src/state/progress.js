// Saved progress (localStorage). Changing the keys resets everyone's progress.
// Levels flagged `challenge: true` are optional: they never gate the next world.
import { WORLDS } from '../data/worlds.js';

// Bump these when levels are reordered/replaced (saved progress is keyed by world:level index).
const DONE = 'twist-done4';
let done = {};
try { done = JSON.parse(localStorage.getItem(DONE) || '{}'); } catch (e) {}
const save = () => { try { localStorage.setItem(DONE, JSON.stringify(done)); } catch (e) {} };
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
try { flags = JSON.parse(localStorage.getItem(FLAGS) || '{}'); } catch (e) {}
export const flag = k => !!flags[k];
export const setFlag = k => { flags[k] = 1; try { localStorage.setItem(FLAGS, JSON.stringify(flags)); } catch (e) {} };
export const allDone = () => done;
export const reset = () => { done = {}; flags = {}; save(); try { localStorage.removeItem(FLAGS); } catch (e) {} };
export const totals = () => {
  const total = WORLDS.reduce((n, w) => n + w.levels.length, 0);
  const solved = Object.keys(done).filter(k => { const [w, l] = k.split(':').map(Number); return WORLDS[w] && l < WORLDS[w].levels.length; }).length;
  return { solved, total };
};
