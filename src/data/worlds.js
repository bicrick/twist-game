// World order = unlock order. Add a world: create worlds/<name>.js and list it here.
// Four macro worlds, one mechanic each: Twist (glued/twisted edges), Slide (momentum), Warp (portals), Gate (plates + gates).
// (Mirror pads still exist in the engine but no world uses them; the retired world is in tools/archive/.)
import twist from './worlds/twist.js';
import slide from './worlds/slide.js';
import warp from './worlds/warp.js';
import gate from './worlds/gate.js';

// The taster at /embed (or ?embed) is a short version for links / social cards: just the first four Twist levels.
export const EMBED = typeof location !== 'undefined' && (/\/embed\/?$/.test(location.pathname) || /[?&]embed\b/.test(location.search));
const taster = { ...twist, levels: twist.levels.slice(0, 4), groups: [[0, 1, 2, 3]], map: ['X0123'] };
export const WORLDS = EMBED ? [taster] : [twist, slide, warp, gate];
