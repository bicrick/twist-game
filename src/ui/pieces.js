import { el } from './dom.js';
import { cloudPath } from './botshape.js';

document.getElementById('cloudShape').setAttribute('d', cloudPath());

// blocks are carrots: leafy top + pointed tip, so a flipped block is visibly flipped. Set on a diagonal.
const CARROT = '<svg viewBox="0 0 100 100"><g transform="rotate(38 50 52)">' +
  '<path class="bs" d="M50 24C41 15 37 6 41 0C49 4 53 13 50 24ZM50 24C50 12 55 4 62 2C64 10 58 19 50 24ZM50 24C46 14 47 6 50 -3C53 4 54 14 50 24Z"/>' +
  '<path class="bb" d="M33 30C33 20 67 20 67 30C67 56 57 80 50 96C43 80 33 56 33 30Z"/>' +
  '<path class="bh" d="M40 32C40 26 46 25 47 31C46 48 44 60 41 66C38 56 38 42 40 32Z"/>' +
  '<path class="br" d="M55 42h7M52 56h6M50 70h4"/></g></svg>';
// The bot: a lopsided cloud (see botshape.js). The whole drawing lives in .face, which fx/fy mirror, so the
// silhouette itself shows the orientation. .gaze moves the eyes (bot.js).
export const BOT = '<div class="bot-sq"><div class="face"><svg class="bot-svg" viewBox="0 0 100 100"><use href="#cloudShape" class="cb"/></svg>' +
  '<div class="gaze"><i class="eye l"></i><i class="eye r"></i></div></div></div>';

export function piece(cls, parent, size) {
  const d = el('piece ' + cls, parent);
  d.style.width = d.style.height = size + 'px';
  if (cls.includes('blk')) { d.f = el('face', d); d.f.innerHTML = CARROT; }
  else { d.innerHTML = BOT; d.f = d.querySelector('.face'); d.g = d.querySelector('.gaze'); d.sq = d.querySelector('.bot-sq'); d.sx = d.sy = 1; }
  return d;
}
export const orient = (node, o) => { node.sx = o.fx ? -1 : 1; node.sy = o.fy ? -1 : 1; node.f.style.transform = 'scale(' + (o.fx ? -1 : 1) + ',' + (o.fy ? -1 : 1) + ')'; };
