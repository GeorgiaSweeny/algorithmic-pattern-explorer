/*
========================================
RECURSIVE NOISE — PERLIN-PERTURBED SIERPINSKI CARPET (HYBRID)
========================================
* Composition: Repeat-over-Subdivide (recursive.js's "sierpinski" mode),
* where each level's own coordinates are first domain-warped by a Fork over
* Noise before the centre-cell test runs. In docs/ALGORITHMIC_COMPOSITION_RESEARCH.md's
* vocabulary: Repeat, whose per-iteration step is itself a Fork (the current
* point feeds both "unwarped" and Noise, combined by addition) feeding
* Subdivide — a composition shape none of the seven base generators needed,
* built entirely from two already-existing, already-tested primitives
* (lib/fold.js via noise.js, lib/subdivide.js + lib/repeat.js via
* recursive.js's own structure) with no new bespoke math.
*
* `amplitude` is the primary composition parameter: at amplitude = 0 the warp
* is skipped entirely and this generator is byte-identical to
* `recursive(x, y, { depth, subdivisions: 3, mode: "sierpinski" })` — a free
* falsifiable baseline (see recursiveNoise.property.test.js) rather than a
* claim taken on faith. Increasing amplitude perturbs which cell each level's
* point falls into, so the carpet's holes drift off the exact fractal
* lattice — a continuous deformation from fully deterministic (amplitude = 0)
* toward noise-dominated, the stochastic/deterministic spectrum
* docs/README.md's Generative Spectrum table organises every generator
* along, demonstrated here as a single continuous parameter rather than a
* fixed per-generator position on it.
*
* `scale`/`octaves` (added 2026-08-21) are noise.js's own `scale`/`octaves`
* params, passed straight through to the same noise() calls below — not a
* re-derived pair with different units, the literal same two parameters
* noise.js's own registry entries already expose. Originally hardcoded
* (NOISE_SCALE = 0.01, NOISE_OCTAVES = 2) and explicitly "fixed, not
* exposed" to keep the entropy/structure-metric sweep
* (structureMetrics.js, docs/structure-metrics-results.md) a clean
* single-variable story against `amplitude` alone. That sweep is
* unaffected by exposing them: it calls recursiveNoise(fn, { depth,
* amplitude, seed }) and never passes scale/octaves, so it keeps using
* these params' defaults — identical to the values that used to be
* hardcoded — without needing a re-run. Exposing them gives a second,
* independent axis (how coarse/fine the warp field's own texture is,
* not just how strongly it's applied) for a richer parameter sweep than
* amplitude alone gives.
*
* `_levelAmplitude` (added 2026-08-21, follow-up): before this, `amplitude`
* was applied identically at every recursion level, so the whole carpet
* just looked shifted rather than depth having its own character —
* flagged directly as feeling redundant with plain domain-warping.
* `repeat.js`'s step function already receives its own iteration index
* `i` for free (`step(value, i)`), previously discarded here; a linear
* ramp from `0` at `i = 0` (the central square/largest scale stays crisp
* and unwarped) up to the full `amplitude` at the final level needs no
* new parameter — `amplitude` still means "how strong is the warp, at its
* strongest point." This is a genuine behaviour change, not an additive
* opt-in: output at nonzero `amplitude` differs from the old flat
* version at every level but the last. `amplitude = 0` stays an exact
* identity regardless (the ramp still multiplies to `0` everywhere), so
* the falsifiable byte-identical-to-recursive.js baseline is unaffected.
* Compositionally, this makes the Repeat step's own behaviour vary with
* iteration index, not just its input — a richer variant of Repeat than
* "the identical step every time," which is what every other use of
* `lib/repeat.js` in this codebase (`recursive.js` and this file's own
* Sierpinski scaffold) still is.
*/
import { CANVAS } from "../config.js";
import { subdivideCell } from "./lib/subdivide.js";
import { repeat } from "./lib/repeat.js";
import { noise } from "./noise.js";

// Linear ramp: 0 at the first level (i = 0), full `amplitude` at the last
// (i = depth - 1). depth <= 1 has no room for a ramp (a single level, or
// none) — falls back to 0, matching "the shallowest level is unwarped".
// Factored out (not inlined) so it's independently unit-testable.
export function _levelAmplitude(amplitude, i, depth) {
   if (depth <= 1) return 0;
   return amplitude * (i / (depth - 1));
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
            // Fork: this level's own (already-subdivided, zoomed-in) point
            // feeds both the identity and Noise, recombined by addition —
            // a fresh sample per level, at that level's own local
            // coordinates, so the warp is itself self-similar across depth
            // the same way the subdivision structure already is. Two
            // independent samples (offset in x) give an (nx, ny) warp
            // vector rather than perturbing both axes identically.
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
