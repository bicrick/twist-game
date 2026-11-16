// The actual menus: pause (in a level) and settings. Icon-first; see menu.js for the keys.
import { openMenu, closeMenu, closeAll } from './menu.js';
import * as settings from '../state/settings.js';
import * as progress from '../state/progress.js';
import { nav } from './nav.js';
import * as music from '../audio/music.js';

// Feather-style stroke icons (inner SVG, 24x24)
const I = {
  play: '<polygon points="7 4 19 12 7 20 7 4" fill="currentColor"/>',
  restart: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  musicOff: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="18" cy="16" r="3" fill="currentColor"/><line x1="2" y1="2" x2="22" y2="22"/>',
  levels: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  sound: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  mute: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="16" y1="9" x2="22" y2="15"/><line x1="22" y1="9" x2="16" y2="15"/>',
  volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>',
  wave: '<polyline points="2 12 6 12 9 5 13 19 16 12 22 12"/>',
  motion: '<path d="M4 8h10a3 3 0 1 0-3-3"/><path d="M2 12h16a3 3 0 1 1-3 3"/><path d="M5 16h6"/>',
  trail: '<circle cx="18" cy="12" r="3.5" fill="currentColor"/><circle cx="10" cy="12" r="2.2"/><circle cx="4.5" cy="12" r="1.2"/>',
  haptic: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M3 8v8M21 8v8"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="18" cy="16" r="3" fill="currentColor"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V3h6v3"/>',
  back: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
};
const cap = s => s[0].toUpperCase() + s.slice(1);
const flip = k => () => settings.set(k, !settings.get(k));

export function openSettings() {
  let confirmReset = false, erased = false;
  const items = [
    { icon: () => settings.get('sound') ? I.sound : I.mute, label: 'Sound', kind: 'switch', on: () => settings.get('sound'), act: flip('sound') },
    { icon: I.volume, label: () => 'Volume ' + Math.round(settings.get('volume') * 100) + '%', kind: 'bar', n: 10, at: () => Math.round(settings.get('volume') * 10),
      set: i => settings.set('volume', i / 10), step: d => settings.set('volume', Math.min(1, Math.max(0, Math.round(settings.get('volume') * 10 + d) / 10))) },
    { icon: I.music, label: 'Music', kind: 'switch', on: () => music.get('enabled'), act: () => music.toggle() },
    { icon: I.music, label: () => 'Music volume ' + Math.round(music.get('volume') * 100) + '%', kind: 'bar', n: 10, at: () => Math.round(music.get('volume') * 10),
      set: i => music.set('volume', i / 10), step: d => music.set('volume', Math.min(1, Math.max(0, Math.round(music.get('volume') * 10 + d) / 10))) },
    { icon: I.wave, label: () => 'Sound style: ' + cap(settings.get('style')), kind: 'dots', n: settings.STYLES.length, at: () => settings.STYLES.indexOf(settings.get('style')),
      set: i => settings.set('style', settings.STYLES[i]), step: d => { const n = settings.STYLES.length; settings.set('style', settings.STYLES[(settings.STYLES.indexOf(settings.get('style')) + d + n) % n]); } },
    { icon: I.motion, label: 'Reduce motion', kind: 'switch', on: () => settings.get('reduceMotion'), act: flip('reduceMotion') },
    { icon: I.trail, label: 'Bot trail', kind: 'switch', on: () => settings.get('trail'), act: flip('trail') },
    { icon: I.haptic, label: 'Haptics', kind: 'switch', on: () => settings.get('haptics'), act: flip('haptics') },
    { icon: I.trash, danger: true, label: () => erased ? 'Progress erased' : confirmReset ? 'Press again to erase everything' : 'Reset progress', kind: 'button',
      act() { if (!confirmReset) { confirmReset = true; return; } progress.reset(); confirmReset = false; erased = true; } },
    { icon: I.back, label: 'Back', kind: 'button', act: () => closeMenu() },
  ];
  openMenu({ layout: 'list', items });
}

export function openPause(level) {
  openMenu({ layout: 'grid', cols: 3, items: [
    { icon: I.play, label: 'Resume', act: () => closeMenu() },
    { icon: I.restart, label: 'Restart level', act: () => { closeAll(); level.restart(); } },
    { icon: I.cog, label: 'Settings', act: () => openSettings() },
    { icon: I.levels, label: 'Level select', act: () => { closeAll(); level.leave(); } },
    { icon: I.home, label: 'Main menu', act: () => { closeAll(); nav.title(); } },
    { icon: () => music.get('enabled') ? I.music : I.musicOff, label: () => music.get('enabled') ? 'Music on' : 'Music off', act: () => music.toggle() },
  ] });
}
