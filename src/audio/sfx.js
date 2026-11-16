// Every sound the game makes, by game event. Retune or swap the library here only.
// Cues come from the vendored Cuelume library (synthesized Web Audio, no files).
import { play, setEnabled, setTheme, unlock } from 'cuelume';

setTheme('press'); // material: 'default' | 'mech' | 'bubble' | 'press'

let on = true;
try { on = localStorage.getItem('twist-sound') !== 'off'; } catch (e) {}
setEnabled(on);

const cue = (name, opts) => () => play(name, opts);
export const sfx = {
  unlock: () => unlock(),
  toggle() { on = !on; setEnabled(on); try { localStorage.setItem('twist-sound', on ? 'on' : 'off'); } catch (e) {} if (on) play('toggle'); return on; },

  // level
  move:     cue('type',   { key: 'printable', emphasis: 'subtle' }),
  push:     cue('tap',    { input: 'keyboard' }),
  wrap:     cue('navigate'),                       // crossed a seam
  flip:     cue('toggle'),                         // orientation changed (twist seam or pad)
  blocked:  cue('error',  { emphasis: 'subtle' }),
  match:    cue('ready'),                          // a target / home just lit up
  win:      cue('success', { emphasis: 'strong' }),
  undo:     () => play('toggle', { direction: 'back', emphasis: 'subtle' }),
  restart:  cue('warning', { emphasis: 'subtle' }),

  // menus
  roomStep: cue('type',   { key: 'printable', emphasis: 'subtle' }),
  openDoor: cue('open'),
  back:     cue('close'),
  locked:   cue('error'),
  unlocked: cue('attention'),
};
