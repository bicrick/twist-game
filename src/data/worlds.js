// World order = unlock order. Add a world: create worlds/<name>.js and list it here.
// Four macro worlds, one mechanic each: Twist (glued/twisted edges), Slide (momentum), Warp (portals), Gate (plates + gates).
// (Mirror pads still exist in the engine but no world uses them; the retired world is in tools/archive/.)
import twist from './worlds/twist.js';
import slide from './worlds/slide.js';
import warp from './worlds/warp.js';
import gate from './worlds/gate.js';

// /embed is this same list. It used to be a 4-level Twist taster (own save) for social links.
// The card image (og.png) is unchanged; the page is the full game so an in-app browser can play it.
export const WORLDS = [twist, slide, warp, gate];
