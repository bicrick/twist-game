// Parses a world's ASCII room map. Pure (no DOM); tools/check_levels.js validates every map with it.
//   #  stone (blocks walking)   .  floor   ,  trail (decorative path, walkable)
//   S  where the player stands on entry   X  back door   0-9a-z  level index (base 36)
export function parseMap(rows) {
  const H = rows.length, W = rows[0].length;
  const m = { W, H, walls: new Set(), doors: [], levels: {}, start: null, exit: null, path: new Set() };
  rows.forEach((row, r) => {
    if (row.length !== W) throw new Error('map row ' + r + ' has wrong length');
    [...row].forEach((ch, c) => {
      const k = r + ',' + c;
      if (ch === '#') m.walls.add(k);
      else if (ch === 'S') { m.start = [r, c]; m.path.add(k); }
      else if (ch === 'X') { m.exit = [r, c]; m.path.add(k); }
      else if (ch === ',') m.path.add(k);
      else if (/[0-9a-z]/.test(ch)) { m.levels[parseInt(ch, 36)] = [r, c]; m.path.add(k); }
    });
  });
  return m;
}
// two path cells are visibly joined by a trail segment
export function joined(m, a, b, rows) {
  const ch = p => rows[p[0]][p[1]];
  const ka = a[0] + ',' + a[1], kb = b[0] + ',' + b[1];
  if (!m.path.has(ka) || !m.path.has(kb)) return false;
  const x = ch(a), y = ch(b);
  return x === ',' || y === ',' || x === 'S' || y === 'S';
}
// cells the player can stand on (not stone, not a door)
export function isDoor(m, r, c) {
  return (m.exit && m.exit[0] === r && m.exit[1] === c) || Object.values(m.levels).some(p => p[0] === r && p[1] === c);
}
