// User settings (localStorage `twist-settings`). One place to read/change them; apply() pushes them to the rest of the app.
import { sfx } from '../audio/sfx.js';
import { sync as syncMusic } from '../audio/music.js';
import { getItem, setItem } from './storage.js';

const KEY = 'twist-settings';
const prefersReduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const defaults = { sound: true, volume: 0.8, style: 'press', reduceMotion: prefersReduced, haptics: true, trail: true };
export const STYLES = ['press', 'default', 'mech', 'bubble'];
let s = { ...defaults };
try { s = { ...defaults, ...JSON.parse(getItem(KEY) || '{}') }; } catch (e) {}

export const get = k => s[k];
export function set(k, v) { s[k] = v; setItem(KEY, JSON.stringify(s)); apply(); }
export function apply() {
  sfx.configure({ enabled: s.sound, volume: s.volume, style: s.style });
  syncMusic({ masterEnabled: s.sound });
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('reduce-motion', !!s.reduceMotion);
}
export const toggleSound = () => { set('sound', !s.sound); if (s.sound) sfx.flip(); return s.sound; };
apply();
