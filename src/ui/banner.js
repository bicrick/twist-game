import { $ } from './dom.js';
let t = 0;
export function banner(title, sub, ms) {
  const b = $('banner'); b.innerHTML = '<h1></h1><p></p>'; b.firstChild.textContent = title; b.lastChild.textContent = sub || '';
  void b.offsetWidth; b.classList.add('on'); clearTimeout(t); t = setTimeout(hideBanner, ms || 4200);
}
export function hideBanner() { $('banner').classList.remove('on'); }
