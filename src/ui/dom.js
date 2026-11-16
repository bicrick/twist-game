export const $ = id => document.getElementById(id);
export const el = (cls, parent) => { const d = document.createElement('div'); d.className = cls; if (parent) parent.appendChild(d); return d; };
export const svgIcon = (html, cls) => { const d = el(cls); d.innerHTML = html; return d; };
export const LOCK_SVG = '<svg viewBox="0 0 24 24" width="100%" height="100%"><rect x="4" y="10" width="16" height="11" rx="2.5" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
