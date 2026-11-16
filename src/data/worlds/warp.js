// World: Warp. Level format is documented in CLAUDE.md. Levels flagged challenge are optional (listed last).
export default {
  name: "Warp",
  sub: "portals link two places",
  icon: '<svg viewBox="0 0 24 24"><circle cx="7.2" cy="12" r="4.4" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="16.8" cy="12" r="4.4" fill="currentColor"/></svg>',
  hue: 345,
  // level groups (state/progress.js): a group opens when the one before it is solved
  groups: [[0,1],[2,3],[4,5]],
  // Room map (see data/roommap.js): . floor  , trail  X back door  0-9a-z level index. Doors sit next to each other; adjacent cells are joined by a connector.
  map: [
    "X01",
    "..,",
    "432",
    ",..",
    "567",
  ],
  levels: [
  {"w":4,"h":3,"lr":"none","tb":"none","walls":[[1,3],[1,0]],"player":[0,1,0,0],"home":[0,0,0,0],"blocks":[[1,2,0,0]],"targets":[[2,1,0,0]],"portals":[[2,2,0,2]]},
  {"w":5,"h":3,"lr":"none","tb":"none","walls":[[2,0],[0,4],[1,0]],"player":[2,1,0,0],"home":[0,2,0,0],"blocks":[[2,2,0,0]],"targets":[[2,4,0,0]],"portals":[[0,3,2,3]]},
  {"w":5,"h":4,"lr":"none","tb":"none","walls":[[0,3],[1,3],[1,0]],"player":[3,1,0,0],"home":[2,4,0,0],"blocks":[[1,2,0,0]],"targets":[[2,0,0,0]],"portals":[[2,3,2,1]]},
  {"w":5,"h":4,"lr":"none","tb":"none","walls":[[3,4],[1,3],[1,1],[0,3]],"player":[3,3,0,0],"home":[2,0,0,0],"blocks":[[2,1,0,0]],"targets":[[2,3,0,0]],"portals":[[1,0,0,1],[0,2,2,2]]},
  {"w":5,"h":4,"lr":"none","tb":"none","walls":[[1,4],[0,1],[0,4],[3,4]],"player":[2,4,0,0],"home":[3,0,1,0],"blocks":[[3,1,0,0]],"targets":[[2,3,0,0]],"portals":[[2,0,3,2,"x"],[1,1,2,2]]},
  {"w":5,"h":5,"lr":"none","tb":"none","walls":[[2,0],[4,0],[1,3],[4,4],[4,1],[3,2]],"player":[3,1,0,0],"home":[0,0,0,0],"blocks":[[1,2,0,0],[2,2,0,0]],"targets":[[0,4,0,0],[3,4,0,0]],"portals":[[2,1,0,1],[0,3,2,3]]},
  {"w":5,"h":5,"lr":"none","tb":"none","walls":[[1,2],[4,2],[1,0],[3,3]],"player":[0,2,0,0],"home":[1,3,1,0],"blocks":[[0,3,0,0],[1,1,0,0]],"targets":[[0,0,0,0],[0,4,0,1]],"portals":[[3,0,0,1,"x"],[2,2,1,4,"y"]],"challenge":true},
  {"w":5,"h":5,"lr":"none","tb":"none","walls":[[4,0],[0,4],[1,0],[4,1]],"player":[4,2,0,0],"home":[0,1,0,0],"blocks":[[1,2,0,0]],"targets":[[4,4,0,0]],"slide":true,"portals":[[3,3,2,4],[3,4,2,0]],"challenge":true},
  ],
};
