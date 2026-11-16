// World: Slide. Level format is documented in CLAUDE.md. Levels flagged challenge are optional (listed last).
export default {
  name: "Slide",
  sub: "blocks that keep going",
  icon: '<svg viewBox="0 0 24 24"><path d="M3 8h6M2 12h9M3 16h6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><rect x="13" y="6.5" width="9" height="11" rx="3.4" fill="currentColor"/></svg>',
  hue: 150,
  bot: { shape: 'droplet', color: '#8a5cf5' },   // this world's player (new behaviour = new guy)
  // level groups (state/progress.js): a group opens when the one before it is solved
  groups: [[0,1],[2,3],[4,5]],
  // Room map (see data/roommap.js): . floor  , trail  X back door  0-9a-z level index. Doors sit next to each other; adjacent cells are joined by a connector.
  map: [
    "X01,2",
    "....,",
    "5,4,3",
    ",....",
    "67...",
  ],
  levels: [
  {"w":5,"h":4,"lr":"none","tb":"none","slide":true,"walls":[[3,3],[0,1],[2,1]],"player":[0,2,0,0],"home":[3,4,0,0],"blocks":[[1,3,0,0]],"targets":[[3,2,0,0]]},
  {"w":5,"h":4,"lr":"none","tb":"none","slide":true,"walls":[[2,2],[1,4],[0,0]],"player":[2,1,0,0],"home":[1,0,0,0],"blocks":[[1,2,0,0]],"targets":[[0,4,0,0]]},
  {"w":6,"h":4,"lr":"plain","tb":"none","slide":true,"walls":[[3,4],[0,5],[3,1],[0,4]],"player":[2,4,0,0],"home":[0,0,0,0],"blocks":[[2,0,0,0]],"targets":[[0,3,0,0]]},
  {"w":5,"h":4,"lr":"twist","tb":"none","slide":true,"walls":[[0,4],[0,1],[3,1]],"player":[2,1,0,0],"home":[0,3,0,1],"blocks":[[1,2,0,0]],"targets":[[3,2,0,1]]},
  {"w":5,"h":4,"lr":"none","tb":"none","walls":[[3,4],[0,3],[1,0]],"player":[0,0,0,0],"home":[2,4,0,0],"blocks":[[2,3,0,0],[1,2,0,0]],"targets":[[3,0,0,0],[0,1,0,0]],"slide":true},
  {"w":5,"h":5,"lr":"plain","tb":"twist","slide":true,"walls":[[3,4],[2,1],[2,3],[1,4],[1,2]],"player":[4,3,0,0],"home":[4,2,1,0],"blocks":[[3,2,0,0],[0,1,0,0]],"targets":[[3,0,1,0],[0,4,1,0]]},
  {"w":6,"h":5,"lr":"none","tb":"twist","walls":[[4,0],[0,3],[1,5],[3,4],[2,5]],"player":[3,2,0,0],"home":[0,4,0,0],"blocks":[[4,1,0,0],[2,2,0,0]],"targets":[[1,4,1,0],[0,1,1,0]],"slide":true,"challenge":true},
  {"w":6,"h":5,"lr":"none","tb":"none","walls":[[2,3],[4,5],[0,1],[4,2],[4,4],[1,5],[2,5],[1,1]],"player":[2,2,0,0],"home":[1,2,0,0],"blocks":[[1,3,0,0],[2,1,0,0]],"targets":[[4,1,0,0],[4,0,0,0]],"slide":true,"challenge":true},
  ],
};
