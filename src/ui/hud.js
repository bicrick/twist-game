// The level title + target dots live in #top, which hugs the top edge of the current board.
import { $ } from './dom.js';

export const setTitle = text => { $('chip').textContent = text || ''; };

// Call after a screen is built. Uses layout offsets (not bounding rects) so it is
// correct even while the stage is mid-transition.
export function placeTop() {
  const st = $('stage'), f = $('floor'), top = $('top');
  if (!f) { top.style.display = 'none'; return; }
  top.style.display = '';
  top.style.left = st.offsetLeft + f.offsetLeft + 'px';
  top.style.width = f.offsetWidth + 'px';
  top.style.top = st.offsetTop + f.offsetTop - (+f.dataset.rimTop || 0) + 'px';   // sit above a wall rim, if any
}
