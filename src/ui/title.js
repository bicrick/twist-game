// Title screen: a big friendly bot that watches your pointer, a rounded wordmark, Play, and a crowd of bots.
import { $, el } from './dom.js';
import { piece, orient } from './pieces.js';
import { theme } from './theme.js';
import { setActiveBot } from './bot.js';
import { nav } from './nav.js';
import { openSettings } from './menus.js';
import * as progress from '../state/progress.js';

const FBOT = '<div class="bot-sq"><i class="bot-body tint"></i><div class="face"><div class="gaze"><i class="eye l"></i><i class="eye r"></i></div></div></div>';
const TINTS = ['#2f7bff', '#3ddc84', '#ff5d9e', '#18c9a9', '#ff9a35', '#8a5cf5', '#a3e635'];
// [x%, y%, size px, tint index, float seconds, delay, shape, face]  (shapes/faces: css/title.css)
const CROWD = [[7, 12, 74, 0, 9, 0, 'squircle', 'neutral'], [86, 10, 60, 1, 11, -3, 'circle', 'happy'],
               [4, 52, 88, 2, 12, -5, 'cloud', 'surprised'], [88, 54, 70, 3, 10, -2, 'hex', 'wide'],
               [22, 82, 56, 4, 13, -7, 'droplet', 'happy'], [74, 84, 62, 5, 9, -4, 'pebble', 'neutral'],
               [28, 22, 40, 6, 14, -6, 'circle', 'neutral'], [70, 26, 44, 1, 12, -1, 'squircle', 'happy']];

export function showTitle() {
  theme(null); document.body.style.setProperty('--bg', '#080d14');
  const st = $('stage'); st.innerHTML = ''; st.classList.remove('win'); st.classList.add('title-mode');
  st.style.margin = ''; st.style.setProperty('--cell', '90px');
  $('dots').innerHTML = '';
  const root = el('title', st);
  CROWD.forEach(([x, y, s, t, dur, delay, shape, face]) => {
    const b = el('fbot s-' + shape + ' f-' + face, root);
    b.style.cssText = `left:${x}%;top:${y}%;width:${s}px;height:${shape === 'capsule' ? Math.round(s * 1.3) : s}px;--bc:${TINTS[t]};animation-duration:${dur}s;animation-delay:${delay}s`;
    b.innerHTML = FBOT;
  });
  const H = Math.round(Math.min(Math.max(Math.min(innerWidth, innerHeight) * .3, 96), 190));
  const hero = el('hero', root), bot = piece('player', hero, H);
  hero.style.width = hero.style.height = H + 'px'; hero.style.setProperty('--cell', H + 'px');
  bot.style.left = bot.style.top = '0'; orient(bot, { fx: 0, fy: 0 }); setActiveBot(bot, H);
  el('word', root).textContent = 'Twist';
  const play = el('play', root); play.textContent = 'Play';
  const sub = el('sub', root); sub.textContent = 'Settings'; sub.onpointerdown = e => { e.stopPropagation(); openSettings(); };
  const { solved, total } = progress.totals();
  if (solved) el('count', root).textContent = solved + ' of ' + total + ' solved';
  root.addEventListener('pointerdown', () => nav.start());
}
