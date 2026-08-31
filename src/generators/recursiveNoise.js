/*
========================================
RECURSIVE NOISE — PERLIN-PERTURBED SIERPINSKI CARPET (HYBRID)
========================================
* Composition: recursive.js's "sierpinski" mode, but each level's coordinates
* are domain-warped by Noise before the centre-cell test runs. See
* docs/generators/recursive-noise.md for the amplitude spectrum this
* demonstrates (deterministic at amplitude = 0 up to noise-dominated).
*
* `scale`/`octaves` pass straight through to noise.js's own params (a second,
* independent axis: warp texture vs. warp strength).
* `_levelAmplitude` ramps the warp from LEVEL_AMPLITUDE_FLOOR (30%) up to
* 100% across levels so every level's noise step has some visible effect
* while later levels still warp more — amplitude = 0 stays an exact identity
* regardless of the floor.
*/
import { CANVAS } from "../config.js";
import { subdivideCell } from "./lib/subdivide.js";
import { repeat } from "./lib/repeat.js";
import { noise } from "./noise.js";

// Linear ramp: LEVEL_AMPLITUDE_FLOOR fraction of `amplitude` at the first
// level, full `amplitude` at the last (see header). depth <= 1 falls back
// to 0, matching "amplitude = 0 is always an exact identity."
export const LEVEL_AMPLITUDE_FLOOR = 0.3;

export function _levelAmplitude(amplitude, i, depth) {
   if (depth <= 1 || amplitude === 0) return 0;
   const t = i / (depth - 1);
   return amplitude * (LEVEL_AMPLITUDE_FLOOR + (1 - LEVEL_AMPLITUDE_FLOOR) * t);
}

export function recursiveNoise(x, y, params) {
   const { depth = 4, amplitude = 0, scale = 0.01, octaves = 2, seed = 1337 } = params;
   const subdivisions = 3; // fixed — the classic Sierpinski carpet's own split
   const mid = Math.floor(subdivisions / 2);
   const roundedDepth = Math.round(depth);

   const result = repeat(
      ({ point }, i) => {
         let px = point.x, py = point.y;
         const levelAmplitude = _levelAmplitude(amplitude, i, roundedDepth);

         if (levelAmplitude !== 0) {
            // Fresh noise sample per level at that level's own local
            // coordinates; two independent samples (offset in x) give an
            // (nx, ny) warp vector.
            const nx = noise(px * CANVAS.WIDTH, py * CANVAS.HEIGHT, {
               scale, seed, octaves,
            });
            const ny = noise(px * CANVAS.WIDTH + 999, py * CANVAS.HEIGHT + 999, {
               scale, seed: seed + 1, octaves,
            });
            px += levelAmplitude * nx;
            py += levelAmplitude * ny;
            // Wrap back into [0, 1): subdivideCell expects a unit-square
            // point, and JS's `%` keeps the sign of its left operand, so a
            // negative warp needs a true modulo, not a bare remainder.
            px = ((px % 1) + 1) % 1;
            py = ((py % 1) + 1) % 1;
         }

         const { gx, gy, x: nx2, y: ny2 } = subdivideCell(px, py, subdivisions);
         if (gx === mid && gy === mid) {
            return { stop: true, value: -1 };
         }
         return { stop: false, value: { point: { x: nx2, y: ny2 } } };
      },
      // See recursive.js: depth arrives from a continuous archetype slider,
      // so it isn't guaranteed to be an integer; repeat()'s loop bound must be.
      roundedDepth,
      { point: { x: x / CANVAS.WIDTH, y: y / CANVAS.HEIGHT } }
   );

   // Reaching depth iterations without ever landing on the excluded centre
   // cell is the same "not removed" result recursive.js's base case returns.
   return result.stopped ? result.value : 1;
}
