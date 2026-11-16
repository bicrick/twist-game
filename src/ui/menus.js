// The actual menus: pause (in a level) and settings.
import { openMenu, closeMenu, closeAll } from './menu.js';
import * as settings from '../state/settings.js';
import * as progress from '../state/progress.js';
import { nav } from './nav.js';

const onOff = b => b ? 'On' : 'Off';
const cap = s => s[0].toUpperCase() + s.slice(1);

export function openSettings() {
  let confirmReset = false;
  const items = [
    { label: 'Sound', kind: 'toggle', value: () => onOff(settings.get('sound')), on: () => settings.get('sound'), act: () => settings.set('sound', !settings.get('sound')) },
    { label: 'Volume', kind: 'range', value: () => Math.round(settings.get('volume') * 100) + '%',
      step: d => settings.set('volume', Math.min(1, Math.max(0, Math.round((settings.get('volume') + d * .1) * 10) / 10))) },
    { label: 'Sound style', kind: 'choice', value: () => cap(settings.get('style')),
      step: d => { const i = settings.STYLES.indexOf(settings.get('style')); settings.set('style', settings.STYLES[(i + d + settings.STYLES.length) % settings.STYLES.length]); } },
    { label: 'Reduce motion', kind: 'toggle', value: () => onOff(settings.get('reduceMotion')), on: () => settings.get('reduceMotion'), act: () => settings.set('reduceMotion', !settings.get('reduceMotion')) },
    { label: 'Bot trail', kind: 'toggle', value: () => onOff(settings.get('trail')), on: () => settings.get('trail'), act: () => settings.set('trail', !settings.get('trail')) },
    { label: 'Haptics', kind: 'toggle', value: () => onOff(settings.get('haptics')), on: () => settings.get('haptics'), act: () => settings.set('haptics', !settings.get('haptics')) },
    { label: 'Reset progress', kind: 'button', danger: true, act() {
        if (!confirmReset) { confirmReset = true; this.label = 'Press again to erase everything'; return; }
        progress.reset(); confirmReset = false; this.label = 'Progress erased'; } },
    { label: 'Back', kind: 'button', act: () => closeMenu() },
  ];
  openMenu({ title: 'Settings', items });
}

export function openPause(level) {
  openMenu({ title: 'Paused', items: [
    { label: 'Resume', act: () => closeMenu() },
    { label: 'Restart level', act: () => { closeAll(); level.restart(); } },
    { label: 'Settings', act: () => openSettings() },
    { label: 'Level select', act: () => { closeAll(); level.leave(); } },
    { label: 'Main menu', act: () => { closeAll(); nav.title(); } },
  ] });
}
