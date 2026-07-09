/*
========================================
RECURSIVE GENERATOR
========================================
* Composition: Subdivide, applied recursively. See src/generators/lib/subdivide.js —
* each recursion level is one Subdivide node feeding its centre-cell test back into
* the next level's input coordinates.
*/
import { CANVAS } from "../config.js";
import { subdivideCell } from "./lib/subdivide.js";

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
   const { gx, gy, x: nx, y: ny } = subdivideCell(x, y, sub);
   if (gx === mid && gy === mid) return -1;
   return _recurse(nx, ny, depth - 1, sub);
}
