import { startApp } from './ui/app.js';
import { inAppWebView } from './ui/shell.js';

window.__BUILD__ = typeof __BUILD__ !== 'undefined' ? __BUILD__ : 'dev';
startApp();
// ?debug=1 shows a small diagnostics panel (fps, viewport, touch, safe area...) for real-device testing
if (/[?&]debug=1/.test(location.search)) import('./ui/debug.js').then(m => m.initDebug());

// offline support in production builds only. When a new version takes over (a deploy happened), reload once so a stale
// tab never lingers on the old build; never mid-puzzle (that applies on the next load instead).
// X/Twitter's iOS WKWebView and Android system WebViews mishandle service workers (blank
// reloads, failed navigations after a redirect). Play online there and drop any old worker.
if (import.meta.env && import.meta.env.PROD && 'serviceWorker' in navigator) {
  if (inAppWebView()) {
    navigator.serviceWorker.getRegistrations().then(rs => Promise.all(rs.map(r => r.unregister()))).catch(() => {});
  } else {
    const hadController = !!navigator.serviceWorker.controller; let reloaded = false;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      const inLevel = document.querySelector('#floor .piece.player') && !document.querySelector('#floor.room');
      if (hadController && !reloaded && !inLevel) { reloaded = true; location.reload(); }
    });
  }
}
