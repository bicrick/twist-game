// World: Mirror. Level format is documented in CLAUDE.md.
export default {
  name: "Mirror",
  sub: "floors that flip you over",
  hue: 335,
  intro: "Mirror pads flip whatever steps onto them — you, or the thing you push.",
  // Room map (see ui/rooms.js): # stone  . floor  , trail  S start  X back door  0-9a-z level index
  map: [
    '..a.9.8....',
    ',,,,,,,....',
    ',.....,.#..',
    '7..##.5.##.',
    ',..##.,.##.',
    '6,,,,,4....',
    '#..,.......',
    '#..3,2,1,0.',
    '.........SX',
  ],
  levels: [
  {"w":5,"h":1,"lr":"none","tb":"none","walls":[],"pads":[[0,2,"x"]],"player":[0,0],"blocks":[[0,1]],"targets":[[0,3,1,0]],"home":[0,2,1,0]},
  {"w":5,"h":3,"lr":"none","tb":"none","walls":[[2,4],[2,0]],"pads":[[0,2,"x"]],"player":[1,3,0,1],"home":[1,0,0,1],"blocks":[[0,3,1,0]],"targets":[[0,1,0,0]]},
  {"w":5,"h":3,"lr":"none","tb":"none","walls":[[2,0]],"pads":[[2,3,"x"],[1,2,"x"]],"player":[2,4,1,1],"home":[2,1,0,1],"blocks":[[2,2,1,0]],"targets":[[2,2,0,0]]},
  {"w":4,"h":3,"lr":"twist","tb":"none","walls":[[0,1]],"pads":[[0,3,"x"]],"player":[1,3,0,1],"home":[1,0,0,1],"blocks":[[0,3,1,0]],"targets":[[2,0,0,1]]},
  {"w":4,"h":3,"lr":"plain","tb":"none","walls":[[1,1],[0,2]],"pads":[[2,3,"y"],[2,2,"x"]],"player":[2,0,0,0],"home":[1,3,0,1],"blocks":[[2,3,0,0]],"targets":[[2,0,0,1]]},
  {"w":5,"h":3,"lr":"plain","tb":"none","walls":[[1,2]],"pads":[[2,2,"y"],[2,1,"x"]],"player":[0,2,1,0],"home":[2,0,1,1],"blocks":[[2,2,1,0]],"targets":[[2,4,0,1]]},
  {"w":4,"h":3,"lr":"twist","tb":"none","walls":[],"pads":[[2,1,"x"],[2,0,"y"]],"player":[1,0,1,1],"home":[0,3,0,1],"blocks":[[0,2,1,0]],"targets":[[0,2,0,1]]},
  {"w":4,"h":4,"lr":"twist","tb":"twist","walls":[[1,0]],"pads":[[2,3,"y"],[0,2,"y"]],"player":[2,0,0,0],"home":[3,2,1,1],"blocks":[[3,1,1,0]],"targets":[[3,0,0,0]]},
  {"w":4,"h":3,"lr":"twist","tb":"twist","walls":[[1,3],[0,2]],"pads":[[0,0,"x"],[1,2,"x"]],"player":[0,3,1,1],"home":[2,3,1,0],"blocks":[[2,1,1,1]],"targets":[[0,1,1,1]]},
  {"w":4,"h":3,"lr":"plain","tb":"none","walls":[],"pads":[[0,3,"x"],[0,0,"y"],[2,1,"y"]],"player":[0,2,1,1],"home":[2,3,0,0],"blocks":[[0,0,0,0],[0,3,0,1]],"targets":[[0,2,1,1],[0,1,1,1]]},
  {"w":4,"h":3,"lr":"plain","tb":"none","walls":[[1,0]],"pads":[[2,3,"y"],[2,0,"x"],[1,2,"x"]],"player":[0,0,1,1],"home":[0,1,0,0],"blocks":[[0,3,1,1],[2,0,1,0]],"targets":[[0,2,1,1],[2,2,0,0]]},
  ],
};
