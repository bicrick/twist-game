// Title screen: a hero bot that watches your pointer, drifting coloured bots behind it, Start.
import { $, el } from './dom.js';
import { piece, orient } from './pieces.js';
import { theme } from './theme.js';
import { setTitle } from './hud.js';
import { setActiveBot } from './bot.js';
import { nav } from './nav.js';
import * as progress from '../state/progress.js';

const FBOT = '<div class="bot-sq"><i class="bot-body tint"></i><div class="face"><div class="gaze"><i class="eye l"></i><i class="eye r"></i></div></div></div>';
const TINTS = ['#2f7bff', '#1fc46b', '#ff5d9e', '#18b8c9', '#ff9a35', '#8a5cf5', '#1d1d20'];
// [x%, y%, size px, tint index, float seconds, delay, shape, face]  (shapes/faces: see css/title.css)
const FLOAT = [[7, 13, 88, 0, 9, 0, 'squircle', 'neutral'], [86, 11, 66, 1, 11, -3, 'circle', 'happy'],
               [13, 70, 104, 2, 12, -5, 'cloud', 'surprised'], [80, 66, 80, 3, 10, -2, 'hex', 'wide'],
               [31, 88, 60, 4, 13, -7, 'droplet', 'happy'], [66, 85, 66, 5, 9, -4, 'pebble', 'happy'],
               [92, 39, 54, 6, 12, -1, 'triangle', 'neutral'], [3, 43, 58, 4, 10, -6, 'capsule', 'wide'],
               [25, 8, 52, 1, 14, -8, 'triangle', 'happy'], [72, 30, 48, 2, 11, -9, 'circle', 'surprised']];

export function showTitle() {
  theme(null);
  const st = $('stage'); st.innerHTML = ''; st.classList.remove('win'); st.classList.add('title-mode');
  st.style.margin = ''; st.style.setProperty('--cell', '90px');
  $('dots').innerHTML = ''; setTitle('');
  const root = el('title', st);
  FLOAT.forEach(([x, y, s, t, dur, delay, shape, face]) => {
    const b = el('fbot s-' + shape + ' f-' + face, root);
    b.style.cssText = `left:${x}%;top:${y}%;width:${s}px;height:${shape === 'capsule' ? Math.round(s * 1.3) : s}px;--bc:${TINTS[t]};animation-duration:${dur}s;animation-delay:${delay}s`;
    b.innerHTML = FBOT;
  });
  const hero = el('hero', root), bot = piece('player', hero, 104);
  bot.style.left = '0'; bot.style.top = '0'; orient(bot, { fx: 0, fy: 0 }); setActiveBot(bot, 104);
  el('word', root).textContent = 'Twist';
  el('tag', root).textContent = 'a puzzle about edges';
  const go = el('go', root); go.innerHTML = 'Start <kbd>↵</kbd>';
  const { solved, total } = progress.totals();
  el('count', root).textContent = solved + ' / ' + total + ' solved';
  el('keys', root).innerHTML = '<span>Move <kbd>WASD</kbd></span><span>Undo <kbd>Z</kbd></span><span>Restart <kbd>R</kbd></span><span>Back <kbd>Esc</kbd></span><span>Sound <kbd>N</kbd></span>';
  root.addEventListener('pointerdown', () => nav.start());
}
