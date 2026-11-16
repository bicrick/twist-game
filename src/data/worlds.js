// World order = unlock order. Add a world: create worlds/<name>.js and list it here.
// (worlds/mirror.js, the mirror-pad world, is retired: the engine still supports pads, but no world uses them.)
import twist from './worlds/twist.js';
import slide from './worlds/slide.js';

export const WORLDS = [twist, slide];
