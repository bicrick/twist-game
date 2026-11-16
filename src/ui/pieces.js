import { el } from './dom.js';
import { cloudPath, pebblePath } from './botshape.js';

document.getElementById('cloudShape').setAttribute('d', cloudPath());
document.getElementById('pebbleShape').setAttribute('d', pebblePath());

// The bot: a lopsided cloud (see botshape.js). The whole drawing lives in .face, which fx/fy mirror, so the
// silhouette itself shows the orientation. .gaze moves the eyes (bot.js).
export const BOT = '<div class="bot-sq"><div class="face"><svg class="bot-svg" viewBox="0 0 100 100"><use href="#cloudShape" class="cb"/></svg>' +
  '<div class="gaze"><i class="eye l"></i><i class="eye r"></i></div></div></div>';
const BLOCK = BOT.replace('#cloudShape" class="cb"', '#pebbleShape" class="cb pb"');

export function piece(cls, parent, size) {
  const d = el('piece ' + cls, parent);
  d.style.width = d.style.height = size + 'px';
  { d.innerHTML = cls.includes('blk') ? BLOCK : BOT; d.f = d.querySelector('.face'); d.g = d.querySelector('.gaze'); d.sq = d.querySelector('.bot-sq'); d.sx = d.sy = 1; }
  return d;
}
export const orient = (node, o) => { node.sx = o.fx ? -1 : 1; node.sy = o.fy ? -1 : 1; node.f.style.transform = 'scale(' + (o.fx ? -1 : 1) + ',' + (o.fy ? -1 : 1) + ')'; };
