// Little squircle puffs the bot leaves behind. DOM-light: a few absolutely positioned dots that
// remove themselves; capped so mashing keys can never pile them up.
import { el } from './dom.js';
let live = 0;
export function puff(root, x, y, size, dr, dc) {
  for (let i = 0; i < 3 && live < 30; i++) {
    const s = size * (.12 + Math.random() * .1), p = el('puff', root); live++;
    p.style.width = p.style.height = s + 'px';
    p.style.left = x - s / 2 + (Math.random() - .5) * size * .25 + 'px';
    p.style.top = y - s / 2 + (Math.random() - .5) * size * .25 + 'px';
    p.style.setProperty('--dx', (-dc * size * (.18 + Math.random() * .22) + (Math.random() - .5) * size * .2).toFixed(1) + 'px');
    p.style.setProperty('--dy', (-dr * size * (.18 + Math.random() * .22) + (Math.random() - .5) * size * .2).toFixed(1) + 'px');
    p.addEventListener('animationend', () => { p.remove(); live--; });
  }
}
