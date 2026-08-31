/*
========================================
RECURSIVE NOISE (PERLIN-PERTURBED SIERPINSKI) — ALGORITHM-SPECIFIC PROPERTIES
========================================
* recursiveNoise.js is recursive.js's "sierpinski" mode with each level's
* coordinates domain-warped by Noise before the centre-cell test. The
* property checked first below matters most for a hybrid built by
* composition: at amplitude = 0 it must be *exactly* recursive.js, not
* merely similar.
*
* _levelAmplitude ramps the warp with depth, from LEVEL_AMPLITUDE_FLOOR
* (not 0 — a zero floor made the first Noise node in the workflow view
* look broken, with no visible effect at shallow levels) up to full
* amplitude at the final level. depth <= 1 is the one case still exactly
* amplitude-invariant, since a single level has no room for a ramp.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { recursiveNoise, _levelAmplitude, LEVEL_AMPLITUDE_FLOOR } from "../recursiveNoise.js";
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

   it("a different seed can change the result at nonzero amplitude (the warp is actually seed-dependent)", () => {
      // Not true at every point, but should be true for at least one point in
      // a reasonably sized sample — otherwise seed would be silently inert.
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

   it("octaves (previously a hardcoded constant) actually changes the warp at nonzero amplitude", () => {
      // Same regression-guard style as the seed test above: a declared param
      // with no measurable effect would be silently inert.
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
      // Confirms the entropy sweep (structureMetrics.js) still sees the same
      // field it always did, not a silently different default.
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

   it("_levelAmplitude: LEVEL_AMPLITUDE_FLOOR fraction of `amplitude` at level 0, exactly `amplitude` at the final level", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: 0.5, noNaN: true }),
            fc.integer({ min: 2, max: 8 }),
            (amplitude, depth) => {
               expect(_levelAmplitude(amplitude, 0, depth)).toBeCloseTo(amplitude * LEVEL_AMPLITUDE_FLOOR, 10);
               expect(_levelAmplitude(amplitude, depth - 1, depth)).toBeCloseTo(amplitude, 10);
            }
         )
      );
   });

   it("level 0 IS displaced by the warp when depth > 1 (the floor actually reaches the generator, not just the helper)", () => {
      // Depth > 1: level 0 gets LEVEL_AMPLITUDE_FLOOR's worth of warp, so
      // recursiveNoise should differ from the amplitude=0 baseline somewhere
      // across a sample grid, at depth 2 (exactly two levels: 0 and 1).
      const depth = 2, amplitude = 0.5, seed = 3;
      let anyDifference = false;
      for (let x = 0; x < CANVAS.WIDTH && !anyDifference; x += 5) {
         for (let y = 0; y < CANVAS.HEIGHT && !anyDifference; y += 5) {
            const warped = recursiveNoise(x, y, { depth, amplitude, seed });
            const baseline = recursive(x, y, { depth, subdivisions: 3, mode: "sierpinski" });
            if (warped !== baseline) anyDifference = true;
         }
      }
      expect(anyDifference).toBe(true);
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

   it("at depth <= 1, the single level is never displaced by the warp regardless of amplitude (the only case still exactly amplitude-invariant)", () => {
      // _levelAmplitude always zeroes at depth <= 1 (no room for a ramp), so
      // recursiveNoise at depth 1 must be amplitude-invariant and exactly
      // recursive.js's own depth-1 output.
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
