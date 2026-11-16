// World: Twist. Level format is documented in CLAUDE.md.
export default {
  name: "Twist",
  sub: "edges that flip you over",
  icon: '<svg viewBox="0 0 24 24"><path d="M3 7c6 0 12 10 18 10M3 17c6 0 12-10 18-10" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/></svg>',
  hue: 205,
  intro: "Walk off an edge and come back on the other side. Violet seams turn you — and anything you push — over.",
  // Room map (see ui/rooms.js): # stone  . floor  , trail  S start  X back door  0-9a-z level index
  map: [
    'XS.........',
    '.0,1,2,3..#',
    '.......,..#',
    '....4,,,,,6',
    '.##.,.##..,',
    '.##.5.##..7',
    '..#.,.....,',
    '....,,,,,,,',
    '......8.9..',
  ],
  levels: [
  {"w":5,"h":1,"lr":"plain","tb":"none","walls":[],"player":[0,2],"blocks":[[0,1]],"targets":[[0,4]],"home":[0,1]},
  {"w":5,"h":3,"lr":"twist","tb":"none","walls":[],"player":[0,2],"blocks":[[0,3]],"targets":[[2,0,0,1]],"home":[2,2,0,1]},
  {"w":5,"h":3,"lr":"twist","tb":"plain","walls":[[1,0]],"player":[2,2,0,1],"home":[0,0,0,1],"blocks":[[0,4,0,0]],"targets":[[0,1,0,0]]},
  {"w":5,"h":3,"lr":"twist","tb":"none","walls":[],"pads":[],"player":[1,0,1,1],"home":[2,4,1,0],"blocks":[[0,3,1,0]],"targets":[[0,0,1,0]]},
  {"w":4,"h":4,"lr":"none","tb":"twist","walls":[],"pads":[],"player":[1,0,0,1],"home":[0,0,1,1],"blocks":[[0,2,0,0]],"targets":[[3,2,0,0]]},
  {"w":4,"h":4,"lr":"none","tb":"twist","walls":[[0,3]],"pads":[],"player":[2,1,0,1],"home":[0,0,0,1],"blocks":[[0,2,0,1]],"targets":[[0,1,0,1]]},
  {"w":4,"h":4,"lr":"twist","tb":"twist","walls":[[1,1]],"player":[2,0,0,1],"home":[0,1,1,0],"blocks":[[3,0,1,1]],"targets":[[3,2,1,0]]},
  {"w":4,"h":4,"lr":"twist","tb":"twist","walls":[[2,0]],"player":[0,1,1,1],"home":[3,2,0,0],"blocks":[[3,0,0,1]],"targets":[[0,3,1,1]]},
  {"w":4,"h":3,"lr":"twist","tb":"twist","walls":[[0,2]],"player":[2,1,0,0],"home":[2,0,1,1],"blocks":[[2,0,1,0],[1,3,1,0]],"targets":[[2,1,1,0],[1,1,0,0]]},
  {"w":4,"h":3,"lr":"twist","tb":"twist","walls":[[0,2]],"player":[2,2,1,1],"home":[1,3,1,1],"blocks":[[1,2,1,1],[0,3,0,1]],"targets":[[2,3,0,0],[2,0,0,0]]},
  ],
};
