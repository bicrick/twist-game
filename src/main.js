import { startApp } from './ui/app.js';

window.__BUILD__ = typeof __BUILD__ !== 'undefined' ? __BUILD__ : 'dev';
startApp();
// ?debug=1 shows a small diagnostics panel (fps, viewport, touch, safe area...) for real-device testing
if (/[?&]debug=1/.test(location.search)) import('./ui/debug.js').then(m => m.initDebug());

// offline support in production builds only
if (import.meta.env && import.meta.env.PROD && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
