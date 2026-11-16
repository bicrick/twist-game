// World: Slide. Pushed blocks keep sliding until something stops them. Level format is in CLAUDE.md.
export default {
  name: "Slide",
  sub: "blocks that keep going",
  icon: '<svg viewBox="0 0 24 24"><path d="M3 8h6M2 12h9M3 16h6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><rect x="13" y="6.5" width="9" height="11" rx="3.4" fill="currentColor"/></svg>',
  hue: 150,
  intro: "Push a carrot and it keeps sliding until something stops it. Seams still turn it over.",
  // Room map (see ui/rooms.js): . floor  , trail  X back door  0-9a-z level index
  map: [
    "X,0,1",
    "....,",
    "..3,2",
  ],
  levels: [
  {"w":5,"h":4,"lr":"none","tb":"none","slide":true,"walls":[[3,3],[0,1],[2,1]],"player":[0,2,0,0],"home":[3,4,0,0],"blocks":[[1,3,0,0]],"targets":[[3,2,0,0]]},
  {"w":5,"h":4,"lr":"none","tb":"none","slide":true,"walls":[[2,2],[1,4],[0,0]],"player":[2,1,0,0],"home":[1,0,0,0],"blocks":[[1,2,0,0]],"targets":[[0,4,0,0]]},
  {"w":5,"h":4,"lr":"twist","tb":"none","slide":true,"walls":[[0,4],[0,1],[3,1]],"player":[2,1,0,0],"home":[0,3,0,1],"blocks":[[1,2,0,0]],"targets":[[3,2,0,1]]},
  {"w":5,"h":5,"lr":"plain","tb":"twist","slide":true,"walls":[[3,4],[2,1],[2,3],[1,4],[1,2]],"player":[4,3,0,0],"home":[4,2,1,0],"blocks":[[3,2,0,0],[0,1,0,0]],"targets":[[3,0,1,0],[0,4,1,0]]},
  ],
};
