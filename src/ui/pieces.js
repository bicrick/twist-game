import { el } from './dom.js';

const BANANA = '<svg viewBox="0 0 100 100"><path class="bb" d="M24 22 C 8 62, 40 92, 88 76 C 54 68, 38 48, 38 24 Z"/>' +
  '<path class="bs" d="M24 22 L 27 9 L 37 11 L 38 24 Z"/><circle class="bt" cx="87" cy="76" r="4.5"/></svg>';
const FACE = '<i class="eye l"></i><i class="eye r"></i><i class="cheek"></i>';

export function piece(cls, parent, size) {
  const d = el('piece ' + cls, parent);
  d.style.width = d.style.height = size + 'px';
  d.f = el('face', d);
  d.f.innerHTML = cls.includes('blk') ? BANANA : FACE;
  return d;
}
export const orient = (node, o) => { node.f.style.transform = 'scale(' + (o.fx ? -1 : 1) + ',' + (o.fy ? -1 : 1) + ')'; };
