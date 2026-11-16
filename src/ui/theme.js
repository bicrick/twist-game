// Per-world colours (Parabox x Grok bot): a dark world tinted with the world's hue, bright clay walls.
// hue === null is the hub (a deep teal). The title screen is plain black (title.css).
export function theme(h, bot) {
  const b = document.body.style;
  // each world has its own bot (shape + colour): a new behaviour needs a new guy
  document.body.dataset.bot = bot ? bot.shape : 'cloud';
  b.setProperty('--player', bot ? bot.color : '#2f7bff'); b.setProperty('--home', 'var(--player)');
  if (h === null) h = 168;
  b.setProperty('--bg', `hsl(${h} 46% 7%)`);
  b.setProperty('--floor', `hsl(${h} 40% 14%)`);
  b.setProperty('--wall', `hsl(${h} 80% 55%)`);
  b.setProperty('--wall-shade', `hsl(${h} 72% 36%)`);
  b.setProperty('--trail', `hsl(${h} 36% 24%)`);
}
