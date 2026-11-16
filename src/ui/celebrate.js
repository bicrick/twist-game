// A burst of tiny bots + squircles falling across the screen: the finale (all four worlds) and 100%.
import { $, el } from './dom.js';
import * as settings from '../state/settings.js';
import { sfx } from '../audio/sfx.js';

const COLORS = ['#2f7bff', '#3ddc84', '#ff5d9e', '#18c9a9', '#ff9a35', '#8a5cf5', '#a3e635', '#ffd23f'];
export function celebrate(kind) {
  sfx.finale();
  if (settings.get('reduceMotion')) return;
  const root = el('', $('screen')); root.id = 'confetti';
  const n = kind === 'perfect' ? 46 : 34;
  for (let i = 0; i < n; i++) {
    const c = el('cf' + (i % 2 ? ' bot' : '') + (kind === 'perfect' && i % 5 === 0 ? ' gold' : ''), root), s = 14 + Math.random() * 30;
    c.style.cssText = `left:${Math.random() * 100}%;width:${s}px;height:${s}px;--c:${COLORS[i % COLORS.length]};--d:${2.6 + Math.random() * 2.2}s;--x:${(Math.random() - .5) * 140}px;--r:${(Math.random() - .5) * 560}deg;animation-delay:${Math.random() * .7}s`;
  }
  setTimeout(() => root.remove(), 6200);
}
