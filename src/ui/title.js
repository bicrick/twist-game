// Title screen: black, drifting squares, a big wordmark whose "I" is a framed box holding the player bot.
import { $, el } from './dom.js';
import { piece, orient } from './pieces.js';
import { theme } from './theme.js';
import { setActiveBot } from './bot.js';
import { nav } from './nav.js';
import { openSettings } from './menus.js';
import * as progress from '../state/progress.js';

const FBOT = '<div class="bot-sq"><i class="bot-body tint"></i><div class="face"><div class="gaze"><i class="eye l"></i><i class="eye r"></i></div></div></div>';
const TINTS = ['#2f7bff', '#3ddc84', '#ff5d9e', '#18b8c9', '#ff9a35', '#8a5cf5'];
// [x%, y%, size px, tint index, float seconds, delay, shape, face]  (shapes/faces: see css/title.css)
const CROWD = [[8, 16, 70, 0, 9, 0, 'squircle', 'neutral'], [88, 14, 56, 1, 11, -3, 'circle', 'happy'],
               [12, 70, 84, 2, 12, -5, 'cloud', 'surprised'], [86, 66, 66, 3, 10, -2, 'hex', 'wide'],
               [34, 90, 48, 4, 13, -7, 'droplet', 'happy'], [68, 88, 54, 5, 9, -4, 'pebble', 'neutral']];

export function showTitle() {
  theme(null); document.body.style.setProperty('--bg', '#05070a');
  const st = $('stage'); st.innerHTML = ''; st.classList.remove('win'); st.classList.add('title-mode');
  st.style.margin = ''; st.style.setProperty('--cell', '90px');
  $('dots').innerHTML = '';
  const root = el('title', st);
  const T = Math.round(Math.min(Math.max(innerWidth * .2, 80), 210));
  root.style.setProperty('--T', T + 'px');
  for (let i = 0; i < 36; i++) {                                   // drifting squares, like the original box game
    const q = el('sq', root), s = 12 + Math.random() * 36;
    q.style.cssText = `left:${Math.random() * 100}%;top:${105 + Math.random() * 10}%;width:${s}px;height:${s}px;animation-duration:${34 + Math.random() * 40}s;animation-delay:-${Math.random() * 60}s`;
  }
  CROWD.forEach(([x, y, s, t, dur, delay, shape, face]) => {
    const b = el('fbot s-' + shape + ' f-' + face, root);
    b.style.cssText = `left:${x}%;top:${y}%;width:${s}px;height:${shape === 'capsule' ? Math.round(s * 1.3) : s}px;--bc:${TINTS[t]};animation-duration:${dur}s;animation-delay:${delay}s`;
    b.innerHTML = FBOT;
  });
  const word = el('word', root);
  el('', word).textContent = 'TW';
  const box = el('ibox', word), bot = piece('player', box, Math.round(T * .5));
  bot.style.left = bot.style.top = Math.round(T * .14) + 'px'; orient(bot, { fx: 0, fy: 0 }); setActiveBot(bot, Math.round(T * .5));
  el('', word).textContent = 'ST';
  const { solved, total } = progress.totals();
  el('count', root).textContent = solved + ' / ' + total + ' solved';
  const keys = el('keys', root);
  const start = el('kgrp', keys); start.innerHTML = '<div class="kcol"><span class="kc">Enter ↵</span><span class="kc">Space</span></div><div class="klab">Start game</div>';
  const menu = el('kgrp', keys); menu.innerHTML = '<span class="kc big">Esc</span><div class="klab">Menu</div>';
  menu.onpointerdown = e => { e.stopPropagation(); openSettings(); };
  root.addEventListener('pointerdown', () => nav.start());
}
