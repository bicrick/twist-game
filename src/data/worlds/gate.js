// World: Gate. Level format is documented in CLAUDE.md. Levels flagged challenge are optional (listed last).
export default {
  name: "Gate",
  sub: "plates open the way",
  icon: '<svg viewBox="0 0 24 24"><rect x="2.8" y="13.6" width="8.2" height="6.4" rx="2.4" fill="none" stroke="currentColor" stroke-width="2.4"/><rect x="14" y="3" width="7.2" height="17" rx="2.6" fill="currentColor"/></svg>',
  hue: 190,
  // level groups (state/progress.js): a group opens when the one before it is solved
  groups: [[0,1],[2,3],[4,5]],
  // Room map (see data/roommap.js): . floor  , trail  X back door  0-9a-z level index. Doors sit next to each other; adjacent cells are joined by a connector.
  map: [
    "10X",
    ",..",
    "234",
    "..,",
    "765",
  ],
  levels: [
  {"w":4,"h":3,"lr":"none","tb":"none","walls":[[0,0]],"player":[0,3,0,0],"home":[2,1,0,0],"blocks":[[1,1,0,0]],"targets":[[1,3,0,0]],"plates":[[1,2,0]],"gates":[[2,2,0]]},
  {"w":5,"h":3,"lr":"none","tb":"none","walls":[[0,0],[0,3]],"player":[2,3,0,0],"home":[1,0,0,0],"blocks":[[1,1,0,0]],"targets":[[2,0,0,0]],"plates":[[2,2,0]],"gates":[[2,1,0]]},
  {"w":5,"h":4,"lr":"none","tb":"none","walls":[[3,2],[3,0],[0,3]],"player":[3,1,0,0],"home":[1,1,0,0],"blocks":[[1,3,0,0]],"targets":[[3,3,0,0]],"plates":[[2,1,0]],"gates":[[2,2,0]]},
  {"w":5,"h":4,"lr":"none","tb":"none","walls":[[3,4],[1,0],[2,4]],"player":[1,4,0,0],"home":[3,2,0,0],"blocks":[[2,3,0,0]],"targets":[[3,0,0,0]],"plates":[[1,2,0],[2,1,1]],"gates":[[2,2,0],[0,0,1]]},
  {"w":5,"h":4,"lr":"none","tb":"none","walls":[[1,3],[1,0],[0,4]],"player":[3,2,0,0],"home":[1,2,0,0],"blocks":[[2,3,0,0],[2,2,0,0]],"targets":[[3,1,0,0],[3,0,0,0]],"plates":[[2,1,0]],"gates":[[1,1,0]]},
  {"w":5,"h":5,"lr":"none","tb":"none","walls":[[3,1],[1,3],[4,1],[3,4]],"player":[1,1,0,0],"home":[4,2,0,0],"blocks":[[2,1,0,0],[3,2,0,0]],"targets":[[3,0,0,0],[1,2,0,0]],"plates":[[1,4,0],[2,2,1]],"gates":[[0,1,0],[2,0,1]]},
  {"w":5,"h":4,"lr":"twist","tb":"none","walls":[[0,4],[1,3],[0,2],[0,1]],"player":[3,4,0,0],"home":[1,4,0,1],"blocks":[[2,1,0,0]],"targets":[[3,3,0,0]],"plates":[[2,3,0],[1,2,1]],"gates":[[2,2,0],[3,0,1]],"challenge":true},
  {"w":5,"h":5,"lr":"none","tb":"none","walls":[[1,0],[0,1],[4,4],[2,4],[3,2]],"player":[3,4,0,0],"home":[4,1,0,0],"blocks":[[2,3,0,0],[2,1,0,0]],"targets":[[0,4,0,0],[1,4,0,0]],"slide":true,"plates":[[2,2,0],[4,0,1]],"gates":[[0,3,0],[0,0,1]],"challenge":true},
  ],
};
