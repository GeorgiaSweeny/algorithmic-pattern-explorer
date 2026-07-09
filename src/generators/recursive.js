/*
========================================
RECURSIVE GENERATOR
========================================
*/
import { CANVAS } from "../config.js";

export function recursive(x, y, params) {
   const { depth = 4, subdivisions = 3 } = params;
   // depth arrives from a continuous archetype slider (see patternRegistry.js), so it
   // is not guaranteed to be an integer; _recurse's base case is depth === 0, which a
   // non-integer depth would never reach, recursing until the call stack overflows.
   return _recurse(x / CANVAS.WIDTH, y / CANVAS.HEIGHT, Math.round(depth), subdivisions);
}

function _recurse(x, y, depth, sub) {
   if (depth === 0) return 1;
   const mid = Math.floor(sub / 2);
   const gx  = Math.floor(x * sub);
   const gy  = Math.floor(y * sub);
   if (gx === mid && gy === mid) return -1;
   return _recurse((x * sub) % 1, (y * sub) % 1, depth - 1, sub);
}
