// Per-world colours (the Grok-Bot-app look): a pale tinted backdrop, a white-ish board, vivid clay walls.
// hue === null is the neutral hub.
export function theme(h) {
  const b = document.body.style;
  if (h === null) {
    b.setProperty('--bg', '#eef0f3'); b.setProperty('--floor', '#fbfcfd'); b.setProperty('--wall', '#8d97a6');
    b.setProperty('--wall-shade', '#6c7686'); b.setProperty('--trail', '#e3e8ef'); return;
  }
  b.setProperty('--bg', `hsl(${h} 38% 92%)`);
  b.setProperty('--floor', `hsl(${h} 50% 98%)`);
  b.setProperty('--wall', `hsl(${h} 92% 56%)`);
  b.setProperty('--wall-shade', `hsl(${h} 78% 41%)`);
  b.setProperty('--trail', `hsl(${h} 34% 90%)`);
}
