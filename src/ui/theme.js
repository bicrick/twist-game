// Per-world colours: a dark tinted world, bright walls. hue === null is the hub (green).
export function theme(h) {
  if (h === null) h = 150;
  const b = document.body.style;
  b.setProperty('--bg', `hsl(${h} 50% 7%)`);
  b.setProperty('--floor', `hsl(${h} 42% 14%)`);
  b.setProperty('--wall', `hsl(${h} 78% 52%)`);
  b.setProperty('--wall-shade', `hsl(${h} 70% 36%)`);
  b.setProperty('--trail', `hsl(${h} 38% 24%)`);
}
