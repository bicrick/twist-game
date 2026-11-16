import { startApp } from './ui/app.js';

window.__BUILD__ = typeof __BUILD__ !== 'undefined' ? __BUILD__ : 'dev';
startApp();
// ?debug=1 shows a small diagnostics panel (fps, viewport, touch, safe area...) for real-device testing
if (/[?&]debug=1/.test(location.search)) import('./ui/debug.js').then(m => m.initDebug());

// offline support in production builds only. When a new version takes over (a deploy happened), reload once so a stale
// tab never lingers on the old build; never mid-puzzle (that applies on the next load instead).
if (import.meta.env && import.meta.env.PROD && 'serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller; let reloaded = false;
  navigator.serviceWorker.register('sw.js').catch(() => {});
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const inLevel = document.querySelector('#floor .piece.player') && !document.querySelector('#floor.room');
    if (hadController && !reloaded && !inLevel) { reloaded = true; location.reload(); }
  });
}
