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

  // Cue choices follow Cuelume's own "which cue for what" table (node_modules/cuelume/README.md).
  // level
  move:     cue('type',   { key: 'printable', emphasis: 'subtle' }),   // a step: keystroke
  push:     cue('tap',    { input: 'keyboard' }),                      // shoving a block: direct contact
  wrap:     cue('navigate'),                                           // crossing a seam: a whoosh to elsewhere
  flip:     cue('toggle'),                                             // orientation switched (twist seam / pad)
  blocked:  cue('error',  { emphasis: 'subtle' }),                     // refused move
  match:    cue('ready'),                                              // a target / home just lit up, not done yet
  win:      cue('success', { emphasis: 'strong' }),                    // level solved
  undo:     () => play('navigate', { direction: 'back', emphasis: 'subtle' }),
  restart:  cue('close',  { emphasis: 'subtle' }),                     // discard and start over

  // menus
  roomStep:   cue('type', { key: 'printable', emphasis: 'subtle', volume: .5 }),
  enterWorld: cue('navigate'),                                         // route change
  enterLevel: cue('open'),                                             // dive into a level
  leave:      cue('close'),                                            // leave a level
  back:       () => play('navigate', { direction: 'back' }),           // back door / Esc in a room
  locked:     cue('error'),                                            // refused: world still locked
  unlocked:   cue('ready',  { emphasis: 'strong' }),                   // a new world is available
};
