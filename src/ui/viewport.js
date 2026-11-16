// Pin the shell to the visual viewport. in-app WKWebViews (X/Twitter on iOS) and mobile
// Safari report a layout viewport taller than the area the player can actually see.
export function bindViewport(onChange) {
  let h = -1, w = -1;
  const apply = () => {
    const vv = window.visualViewport;
    const height = vv ? vv.height : window.innerHeight;
    const width = vv ? vv.width : window.innerWidth;
    const root = document.documentElement;
    root.style.setProperty('--vv-h', Math.round(height) + 'px');
    root.style.setProperty('--vv-w', Math.round(width) + 'px');
    root.style.setProperty('--vv-top', Math.round(vv ? vv.offsetTop : 0) + 'px');
    root.style.setProperty('--vv-left', Math.round(vv ? vv.offsetLeft : 0) + 'px');
    if ((window.scrollX || window.scrollY) && typeof window.scrollTo === 'function') window.scrollTo(0, 0);
    if (h >= 0 && (Math.abs(height - h) > 1 || Math.abs(width - w) > 1) && onChange) onChange();
    h = height; w = width;
  };
  apply();
  if (window.visualViewport) {
    visualViewport.addEventListener('resize', apply);
    visualViewport.addEventListener('scroll', apply);
  }
  window.addEventListener('orientationchange', () => setTimeout(apply, 80));
}
