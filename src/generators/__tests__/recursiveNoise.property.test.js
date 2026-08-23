/*
========================================
RECURSIVE NOISE (PERLIN-PERTURBED SIERPINSKI) — ALGORITHM-SPECIFIC PROPERTIES
========================================
* recursiveNoise.js is recursive.js's "sierpinski" mode with each level's
* coordinates domain-warped by Noise before the centre-cell test — see its
* header comment. The property that matters most for a hybrid built by
* composition is the one checked first below: at amplitude = 0 it must be
* *exactly* recursive.js, not merely similar — a falsifiable baseline for
* the composition claim, not one taken on faith.
*
* Extended 2026-08-21 for the depth-dependent warp ramp (_levelAmplitude):
* the shallowest level (i = 0) must stay exactly unwarped regardless of
* amplitude — checked both on the helper directly and on the generator's
* own depth = 1 output (where level 0 is the *only* level), so the ramp's
* effect on the actual generator is checked, not just the helper in
* isolation.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { recursiveNoise, _levelAmplitude } from "../recursiveNoise.js";
import { recursive } from "../recursive.js";
import { CANVAS } from "../../config.js";

describe("recursiveNoise: algorithm-specific invariants", () => {
   it("amplitude = 0 is byte-identical to recursive.js's sierpinski mode (subdivisions = 3)", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.integer({ min: 0, max: 6 }),
            fc.integer({ min: 0, max: 99999 }),
            (x, y, depth, seed) => {
               const hybrid   = recursiveNoise(x, y, { depth, amplitude: 0, seed });
               const baseline = recursive(x, y, { depth, subdivisions: 3, mode: "sierpinski" });
               expect(hybrid).toBe(baseline);
            }
         )
      );
   });

   it("depth 0 always returns 1, regardless of position, amplitude or seed", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.double({ min: 0, max: 0.5, noNaN: true }),
            fc.integer({ min: 0, max: 99999 }),
            (x, y, amplitude, seed) => {
               expect(recursiveNoise(x, y, { depth: 0, amplitude, seed })).toBe(1);
            }
         )
      );
   });

   it("is deterministic: the same seed always warps the same way", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.integer({ min: 1, max: 6 }),
            fc.double({ min: 0.01, max: 0.5, noNaN: true }),
            fc.integer({ min: 0, max: 99999 }),
            (x, y, depth, amplitude, seed) => {
               const a = recursiveNoise(x, y, { depth, amplitude, seed });
               const b = recursiveNoise(x, y, { depth, amplitude, seed });
               expect(a).toBe(b);
            }
         )
      );
   });

   it("a different seed can change the result at nonzero amplitude (the warp is actually seed-dependent)", () => {
      // Not true for every point (noise can coincidentally agree), but should be
      // true for at least one point in a reasonably sized sample — otherwise the
      // seed parameter would be silently inert, which is the failure mode this
      // guards against (contract.generic.test.js only checks range/determinism,
      // not that declared params actually influence the output beyond the
      // source-text check registry.params-consistency.test.js already does).
      const depth = 5, amplitude = 0.4;
      let anyDifference = false;
      for (let x = 0; x < CANVAS.WIDTH && !anyDifference; x += 10) {
         for (let y = 0; y < CANVAS.HEIGHT && !anyDifference; y += 10) {
            const a = recursiveNoise(x, y, { depth, amplitude, seed: 1 });
            const b = recursiveNoise(x, y, { depth, amplitude, seed: 2 });
            if (a !== b) anyDifference = true;
         }
      }
      expect(anyDifference).toBe(true);
   });

   it("octaves (added 2026-08-21, previously a hardcoded constant) actually changes the warp at nonzero amplitude", () => {
      // Same regression-guard style as the seed test above: a declared param
      // with no measurable effect would be silently inert. scale/octaves
      // used to be the module-level NOISE_SCALE/NOISE_OCTAVES constants;
      // this checks the exposed params actually reach the noise() calls.
      const depth = 5, amplitude = 0.4, seed = 7;
      let anyDifference = false;
      for (let x = 0; x < CANVAS.WIDTH && !anyDifference; x += 10) {
         for (let y = 0; y < CANVAS.HEIGHT && !anyDifference; y += 10) {
            const a = recursiveNoise(x, y, { depth, amplitude, seed, octaves: 1 });
            const b = recursiveNoise(x, y, { depth, amplitude, seed, octaves: 6 });
            if (a !== b) anyDifference = true;
         }
      }
      expect(anyDifference).toBe(true);
   });

   it("scale/octaves default to the values that used to be hardcoded (NOISE_SCALE = 0.01, NOISE_OCTAVES = 2)", () => {
      // Confirms the entropy sweep (structureMetrics.js, which never passes
      // scale/octaves) still sees the same field it always did, not a
      // silently different default introduced by exposing these params.
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.integer({ min: 1, max: 6 }),
            fc.double({ min: 0.01, max: 0.5, noNaN: true }),
            fc.integer({ min: 0, max: 99999 }),
            (x, y, depth, amplitude, seed) => {
               const withDefaults = recursiveNoise(x, y, { depth, amplitude, seed });
               const withExplicit = recursiveNoise(x, y, { depth, amplitude, seed, scale: 0.01, octaves: 2 });
               expect(withExplicit).toBe(withDefaults);
            }
         )
      );
   });

   it("_levelAmplitude (added 2026-08-21 follow-up): 0 at level 0, exactly `amplitude` at the final level", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: 0.5, noNaN: true }),
            fc.integer({ min: 2, max: 8 }),
            (amplitude, depth) => {
               expect(_levelAmplitude(amplitude, 0, depth)).toBe(0);
               expect(_levelAmplitude(amplitude, depth - 1, depth)).toBeCloseTo(amplitude, 10);
            }
         )
      );
   });

   it("_levelAmplitude ramps monotonically between levels 0 and depth - 1", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0.01, max: 0.5, noNaN: true }),
            fc.integer({ min: 3, max: 8 }),
            (amplitude, depth) => {
               for (let i = 1; i < depth; i++) {
                  expect(_levelAmplitude(amplitude, i, depth)).toBeGreaterThan(
                     _levelAmplitude(amplitude, i - 1, depth)
                  );
               }
            }
         )
      );
   });

   it("_levelAmplitude is 0 for depth <= 1 regardless of level or amplitude (no room for a ramp)", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: 0.5, noNaN: true }),
            fc.constantFrom(0, 1),
            (amplitude, depth) => {
               expect(_levelAmplitude(amplitude, 0, depth)).toBe(0);
            }
         )
      );
   });

   it("level 0's own point is never displaced by the warp, regardless of amplitude (the ramp actually reaches the generator, not just the helper)", () => {
      // Depth 1: the only level is level 0, which _levelAmplitude always
      // zeroes — so recursiveNoise at depth 1 must be amplitude-invariant,
      // and (by the amplitude=0 baseline test above) exactly recursive.js's
      // own depth-1 output.
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.double({ min: 0, max: 0.5, noNaN: true }),
            fc.integer({ min: 0, max: 99999 }),
            (x, y, amplitude, seed) => {
               const warped = recursiveNoise(x, y, { depth: 1, amplitude, seed });
               const baseline = recursive(x, y, { depth: 1, subdivisions: 3, mode: "sierpinski" });
               expect(warped).toBe(baseline);
            }
         )
      );
   });
});
