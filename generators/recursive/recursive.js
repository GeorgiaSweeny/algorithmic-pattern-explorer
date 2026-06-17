/*
========================================
RECURSIVE ARCHETYPE
========================================
*/
import { CANVAS } from "../../core/config.js";

export function recursive(x, y, params) {
   const depth        = Math.round(params.depth        ?? 4);
   const subdivisions = Math.round(params.subdivisions ?? 3);
   const mode         = params.mode ?? "sierpinski";
   return _recurse(x / CANVAS.WIDTH, y / CANVAS.HEIGHT, depth, subdivisions, mode);
}

function _recurse(x, y, depth, sub, mode) {
   if (depth <= 0) return 1;
   const gx = Math.floor(x * sub);
   const gy = Math.floor(y * sub);

   if (mode === "sierpinski") {
      const mid = Math.floor(sub / 2);
      if (gx === mid && gy === mid) return -1;
   } else {
      // grid: remove interior cells, keep border — produces nested hollow frames
      if (gx > 0 && gy > 0 && gx < sub - 1 && gy < sub - 1) return -1;
   }

   return _recurse((x * sub) % 1, (y * sub) % 1, depth - 1, sub, mode);
}
