// Saved progress (localStorage). Keys are stable: changing them resets players.
import { WORLDS } from '../data/worlds.js';

const DONE = 'twist-done2', SEEN = 'twist-seen';
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
