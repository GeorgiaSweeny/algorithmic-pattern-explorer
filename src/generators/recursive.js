/*
========================================
RECURSIVE GENERATOR
========================================
* Composition: Subdivide, applied repeatedly. See src/generators/lib/subdivide.js —
* each recursion level is one Subdivide node feeding its centre-cell test back into
* the next level's input coordinates. The repetition itself is the generic Repeat
* combinator (src/generators/lib/repeat.js).
*
* Two modes, both built from the same Repeat-over-Subdivide mechanism, differing
* only in what each level's step function does with its cell coordinates:
*
*   "sierpinski" — early-exit: a level whose cell is the centre cell stops the
*   repeat immediately and returns -1 (a hole). Reaching `depth` levels without
*   ever landing on the centre returns 1 (filled). This is what makes it a
*   *carpet* — most of the plane is holes at high depth.
*
*   "grid" — no early exit: every level's cell contributes its (gx+gy) parity
*   to a running total (mod 2), and the final parity picks the colour. Unlike
*   "sierpinski" this never removes area — it's a self-similar checkerboard,
*   where each level's contribution to the final colour is structurally
*   identical to the level above it (recursive.property.test.js checks this
*   composes correctly: the value at depth d is the value at depth d-1 on the
*   remapped point, sign-flipped iff the top level's own cell parity is odd).
*   This is genuinely different from grid.js's flat tiling (docs/nodes/computation/
*   lattice-index.md): a plain grid checkerboard only looks at one level, this
*   accumulates parity across every level of subdivision, so it's self-similar
*   the same way "sierpinski" mode is, just without holes.
*/
import { CANVAS } from "../config.js";
import { subdivideCell } from "./lib/subdivide.js";
import { repeat } from "./lib/repeat.js";

export function recursive(x, y, params) {
   const { depth = 4, subdivisions = 3, mode = "sierpinski" } = params;
   const mid = Math.floor(subdivisions / 2);

   const result = repeat(
      ({ point, parity }) => {
         const { gx, gy, x: nx, y: ny } = subdivideCell(point.x, point.y, subdivisions);
         if (mode === "sierpinski" && gx === mid && gy === mid) {
            return { stop: true, value: -1 };
         }
         return { stop: false, value: { point: { x: nx, y: ny }, parity: (parity + gx + gy) % 2 } };
      },
      // depth arrives from a continuous archetype slider (see patternRegistry.js), so
      // it is not guaranteed to be an integer; repeat()'s loop bound must be, or a
      // non-integer depth would never reach n iterations and would run forever.
      Math.round(depth),
      { point: { x: x / CANVAS.WIDTH, y: y / CANVAS.HEIGHT }, parity: 0 }
   );

   // Reaching depth iterations without ever landing on the excluded centre cell is
   // the same "not removed" result the original base case (depth === 0 -> 1) returned.
   if (result.stopped) return result.value;
   if (mode === "grid") return result.value.parity === 0 ? 1 : -1;
   return 1;
}
