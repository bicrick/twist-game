import { startApp } from './ui/app.js';
import { disableZoom } from './ui/nozoom.js';
disableZoom();
startApp();

// offline support in production builds only
if (import.meta.env && import.meta.env.PROD && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
