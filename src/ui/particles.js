// Dim squircles drifting up behind every screen (tinted by the world's wall colour). Cheap: CSS transforms only.
import { el, $ } from './dom.js';
export function initParticles() {
  const root = el('', $('screen')); root.id = 'particles';
  for (let i = 0; i < 22; i++) {
    const p = el('pt', root), s = 10 + Math.random() * 34;
    p.style.cssText = `left:${Math.random() * 100}%;width:${s}px;height:${s}px;animation-duration:${40 + Math.random() * 50}s;animation-delay:-${Math.random() * 80}s`;
  }
}
