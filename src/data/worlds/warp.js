// World: Warp. Level format is documented in CLAUDE.md. Levels flagged challenge are optional (listed last).
// 1-7: one portal pair, teaching step by step (nothing else, then a block, then small puzzles); 8 is the first two-pair level.
export default {
  name: "Warp",
  sub: "portals link two places",
  icon: '<svg viewBox="0 0 24 24"><circle cx="7.2" cy="12" r="4.4" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="16.8" cy="12" r="4.4" fill="currentColor"/></svg>',
  hue: 345,
  bot: { shape: 'hex',color: '#18c9a9' },   // this world's player (new behaviour = new guy)
  // level groups (state/progress.js): a group opens when the one before it is solved
  groups: [[0,1,2],[3,4],[5,6,7]],
  // Room map (see data/roommap.js): . floor  , trail  X back door  0-9a-z level index. Doors sit next to each other; adjacent cells are joined by a connector.
  map: [
    "X012",
    "...3",
    "7654",
    "8...",
    "9a..",
  ],
  levels: [
  {"w":5,"h":3,"lr":"none","tb":"none","walls":[[0,2],[1,2],[2,2]],"portals":[[1,1,1,3]],"player":[1,0,0,0],"home":[0,4,0,0],"blocks":[],"targets":[]},
  {"w":6,"h":3,"lr":"none","tb":"none","walls":[[0,3],[1,3],[2,3]],"portals":[[1,2,1,4]],"player":[1,0,0,0],"home":[2,4,0,0],"blocks":[[1,1,0,0]],"targets":[[1,5,0,0]]},
  {"w":5,"h":3,"lr":"none","tb":"none","walls":[[1,0],[0,4],[2,3]],"player":[1,3,0,0],"home":[0,2,0,0],"blocks":[[1,2,0,0]],"targets":[[2,0,0,0]],"portals":[[0,1,2,2]]},
  {"w":4,"h":3,"lr":"none","tb":"none","walls":[[1,3],[1,0]],"player":[0,1,0,0],"home":[0,0,0,0],"blocks":[[1,2,0,0]],"targets":[[2,1,0,0]],"portals":[[2,2,0,2]]},
  {"w":5,"h":3,"lr":"none","tb":"none","walls":[[0,3],[2,1],[2,4]],"player":[0,1,0,0],"home":[1,4,0,0],"blocks":[[1,2,0,0]],"targets":[[1,0,0,0]],"portals":[[1,1,1,3]]},
  {"w":5,"h":3,"lr":"none","tb":"none","walls":[[2,0],[0,4],[1,0]],"player":[2,1,0,0],"home":[0,2,0,0],"blocks":[[2,2,0,0]],"targets":[[2,4,0,0]],"portals":[[0,3,2,3]]},
  {"w":5,"h":4,"lr":"none","tb":"none","walls":[[0,3],[1,3],[1,0]],"player":[3,1,0,0],"home":[2,4,0,0],"blocks":[[1,2,0,0]],"targets":[[2,0,0,0]],"portals":[[2,3,2,1]]},
  {"w":5,"h":4,"lr":"none","tb":"none","walls":[[3,4],[1,3],[1,1],[0,3]],"player":[3,3,0,0],"home":[2,0,0,0],"blocks":[[2,1,0,0]],"targets":[[2,3,0,0]],"portals":[[1,0,0,1],[0,2,2,2]]},
  {"w":5,"h":4,"lr":"none","tb":"none","walls":[[1,4],[0,1],[0,4],[3,4]],"player":[2,4,0,0],"home":[3,0,1,0],"blocks":[[3,1,0,0]],"targets":[[2,3,0,0]],"portals":[[2,0,3,2,"x"],[1,1,2,2]],"challenge":true},
  {"w":5,"h":5,"lr":"none","tb":"none","walls":[[1,2],[4,2],[1,0],[3,3]],"player":[0,2,0,0],"home":[1,3,1,0],"blocks":[[0,3,0,0],[1,1,0,0]],"targets":[[0,0,0,0],[0,4,0,1]],"portals":[[3,0,0,1,"x"],[2,2,1,4,"y"]],"challenge":true},
  {"w":5,"h":5,"lr":"none","tb":"none","walls":[[4,0],[0,4],[1,0],[4,1]],"player":[4,2,0,0],"home":[0,1,0,0],"blocks":[[1,2,0,0]],"targets":[[4,4,0,0]],"slide":true,"portals":[[3,3,2,4],[3,4,2,0]],"challenge":true},
  ],
};
