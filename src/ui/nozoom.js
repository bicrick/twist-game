// Block accidental zoom on mobile. iOS Safari ignores user-scalable=no,
// so stop pinch (gesture* events + multi-touch moves) and double-tap zoom here.
export function disableZoom() {
  const stop = (e) => e.preventDefault();
  for (const t of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(t, stop, { passive: false });
  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  let last = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - last < 350 && e.changedTouches.length === 1) e.preventDefault();
    last = now;
  }, { passive: false });
  document.addEventListener('dblclick', stop, { passive: false });
  // desktop trackpad pinch / ctrl+wheel
  document.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
}
