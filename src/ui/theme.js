// Per-world colours. hue === null is the neutral hub palette.
export function theme(h) {
  const b = document.body.style;
  if (h === null) { b.setProperty('--bg', '#d9d2c5'); b.setProperty('--floor', '#ece6da'); b.setProperty('--wall', '#4a4338'); return; }
  b.setProperty('--bg', `hsl(${h} 34% 70%)`);
  b.setProperty('--floor', `hsl(${h} 38% 86%)`);
  b.setProperty('--wall', `hsl(${h} 28% 28%)`);
}
