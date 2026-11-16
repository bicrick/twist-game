// Every sound the game makes, by game event. Retune or swap the library here only.
// Cues come from the vendored Cuelume library (synthesized Web Audio, no files).
import { play, setEnabled, setTheme, setVolume, unlock } from 'cuelume';

const cue = (name, opts) => () => play(name, opts);
export const sfx = {
  unlock: () => unlock(),
  // driven by state/settings.js (style: 'default' | 'mech' | 'bubble' | 'press')
  configure({ enabled, volume, style }) { setEnabled(enabled); setVolume(volume); setTheme(style); },

  // Cue choices follow Cuelume's own "which cue for what" table (node_modules/cuelume/README.md).
  // level
  move:     cue('type',   { key: 'printable', emphasis: 'subtle' }),   // a step: keystroke
  push:     cue('tap',    { input: 'keyboard' }),                      // shoving a block: direct contact
  wrap:     cue('count', { duration: 320 }),                           // crossing a seam / reflection / portal: a short rising breath
  flip:     cue('toggle'),                                             // orientation switched (twist seam / pad)
  gate:     cue('select', { emphasis: 'subtle' }),                    // a gate opened / closed
  blocked:  cue('error',  { emphasis: 'subtle' }),                     // refused move
  match:    cue('ready'),                                              // a target / home just lit up, not done yet
  win:      cue('success', { emphasis: 'strong' }),                    // level solved
  undo:     () => play('navigate', { direction: 'back', emphasis: 'subtle' }),
  restart:  cue('close',  { emphasis: 'subtle' }),                     // discard and start over

  // menus
  roomStep:   cue('type', { key: 'printable', emphasis: 'subtle', volume: .5 }),
  enterWorld: cue('count', { duration: 460 }),                         // entering a world / starting the game: the rising breath
  enterLevel: cue('open'),                                             // dive into a level
  leave:      cue('close'),                                            // leave a level
  back:       () => play('navigate', { direction: 'back' }),           // back door / Esc in a room
  locked:     cue('error'),                                            // refused: world still locked
  unlocked:   cue('ready',  { emphasis: 'strong' }),                   // a new world is available
  finale:     () => { play('success', { emphasis: 'strong' }); setTimeout(() => play('ready', { emphasis: 'strong' }), 420); },   // beat the game / 100%
};
sfx.pick = cue('select');                // a menu row moved
sfx.confirm = cue('tap', { input: 'keyboard' });   // a menu row chosen
