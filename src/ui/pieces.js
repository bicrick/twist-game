import { el } from './dom.js';
import { SHAPES } from './botshape.js';

// register every bot outline once; bots draw them with <use>
const defs = document.getElementById('shapes');
for (const [name, d] of Object.entries(SHAPES)) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.id = 'shape-' + name; p.setAttribute('d', d); defs.appendChild(p);
}

// The bot: a lopsided shape per world (see botshape.js; the world's bot is body[data-bot]). The whole drawing lives in .face, which fx/fy mirror, so the
// silhouette itself shows the orientation. .gaze moves the eyes (bot.js).
const botMarkup = shape => '<div class="bot-sq"><div class="face"><svg class="bot-svg" viewBox="0 0 100 100"><use href="#shape-' + shape + '" class="cb' + (shape === 'pebble' ? ' pb' : '') + '"/></svg>' +
  '<div class="gaze"><i class="eye l"></i><i class="eye r"></i></div></div></div>';

export function piece(cls, parent, size) {
  const d = el('piece ' + cls, parent);
  d.style.width = d.style.height = size + 'px';
  const shape = cls.includes('blk') ? 'pebble' : (document.body.dataset.bot || 'cloud');
  d.classList.add('sh-' + shape);
  { d.innerHTML = botMarkup(shape); d.f = d.querySelector('.face'); d.g = d.querySelector('.gaze'); d.sq = d.querySelector('.bot-sq'); d.sx = d.sy = 1; }
  return d;
}
export const orient = (node, o) => { node.sx = o.fx ? -1 : 1; node.sy = o.fy ? -1 : 1; node.f.style.transform = 'scale(' + (o.fx ? -1 : 1) + ',' + (o.fy ? -1 : 1) + ')'; };
