/*
========================================
RECURSIVE NOISE (PERLIN-PERTURBED SIERPINSKI) — ALGORITHM-SPECIFIC PROPERTIES
========================================
* recursiveNoise.js is recursive.js's "sierpinski" mode with each level's
* coordinates domain-warped by Noise before the centre-cell test. The
* property checked first below matters most for a hybrid built by
* composition: at every level's amplitude = 0 it must be *exactly*
* recursive.js, not merely similar.
*
* Each level's warp strength AND texture (amplitudeN/scaleN/octavesN,
* N = 1..MAX_LEVELS) is independent of every other level's — no shared
* value, no automatic ramp — so a level's own params are the only thing
* that can move its own warp. Only `seed` stays shared across levels.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { recursiveNoise, MAX_LEVELS } from "../recursiveNoise.js";
import { recursive } from "../recursive.js";
import { CANVAS } from "../../config.js";

describe("recursiveNoise: algorithm-specific invariants", () => {
   it("every level's amplitude = 0 is byte-identical to recursive.js's sierpinski mode (subdivisions = 3)", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.integer({ min: 0, max: 6 }),
            fc.integer({ min: 0, max: 99999 }),
            (x, y, depth, seed) => {
               const hybrid   = recursiveNoise(x, y, { depth, seed });
               const baseline = recursive(x, y, { depth, subdivisions: 3, mode: "sierpinski" });
               expect(hybrid).toBe(baseline);
            }
         )
      );
   });

   it("depth 0 always returns 1, regardless of position, amplitudes or seed", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.double({ min: 0, max: 0.5, noNaN: true }),
            fc.integer({ min: 0, max: 99999 }),
            (x, y, amplitude1, seed) => {
               expect(recursiveNoise(x, y, { depth: 0, amplitude1, seed })).toBe(1);
            }
         )
      );
   });

   it("a different seed can change the result at nonzero amplitude (the warp is actually seed-dependent)", () => {
      // Not true at every point, but should be true for at least one point in
      // a reasonably sized sample — otherwise seed would be silently inert.
      const depth = 5, amplitude1 = 0.4;
      let anyDifference = false;
      for (let x = 0; x < CANVAS.WIDTH && !anyDifference; x += 10) {
         for (let y = 0; y < CANVAS.HEIGHT && !anyDifference; y += 10) {
            const a = recursiveNoise(x, y, { depth, amplitude1, seed: 1 });
            const b = recursiveNoise(x, y, { depth, amplitude1, seed: 2 });
            if (a !== b) anyDifference = true;
         }
      }
      expect(anyDifference).toBe(true);
   });

   it("octaves1 (previously a hardcoded constant) actually changes the warp at nonzero amplitude", () => {
      // Same regression-guard style as the seed test above: a declared param
      // with no measurable effect would be silently inert.
      const depth = 5, amplitude1 = 0.4, seed = 7;
      let anyDifference = false;
      for (let x = 0; x < CANVAS.WIDTH && !anyDifference; x += 10) {
         for (let y = 0; y < CANVAS.HEIGHT && !anyDifference; y += 10) {
            const a = recursiveNoise(x, y, { depth, amplitude1, seed, octaves1: 1 });
            const b = recursiveNoise(x, y, { depth, amplitude1, seed, octaves1: 6 });
            if (a !== b) anyDifference = true;
         }
      }
      expect(anyDifference).toBe(true);
   });

   it("scale1/octaves1 default to the values that used to be hardcoded (NOISE_SCALE = 0.01, NOISE_OCTAVES = 2)", () => {
      // Confirms the entropy sweep (structureMetrics.js) still sees the same
      // field it always did, not a silently different default.
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.integer({ min: 1, max: 6 }),
            fc.double({ min: 0.01, max: 0.5, noNaN: true }),
            fc.integer({ min: 0, max: 99999 }),
            (x, y, depth, amplitude1, seed) => {
               const withDefaults = recursiveNoise(x, y, { depth, amplitude1, seed });
               const withExplicit = recursiveNoise(x, y, { depth, amplitude1, seed, scale1: 0.01, octaves1: 2 });
               expect(withExplicit).toBe(withDefaults);
            }
         )
      );
   });

   it("level 2's scale2/octaves2 are independent of level 1's own scale1/octaves1", () => {
      // depth = 2, both levels warped: changing level 1's texture must not
      // change what level 2's own (fixed) texture produces downstream,
      // beyond the trajectory shift amplitude1 itself already causes —
      // isolate that by holding amplitude1 at 0 (level 1 still "runs", but
      // its own texture can't move anything since its own amplitude is 0).
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.double({ min: 0.001, max: 0.05, noNaN: true }),
            fc.integer({ min: 1, max: 8 }),
            fc.integer({ min: 0, max: 99999 }),
            (x, y, scale1, octaves1, seed) => {
               const base = { depth: 2, amplitude1: 0, amplitude2: 0.4, seed };
               const a = recursiveNoise(x, y, { ...base, scale1, octaves1 });
               const b = recursiveNoise(x, y, { ...base, scale1: 0.01, octaves1: 2 });
               expect(a).toBe(b);
            }
         )
      );
   });

   it("level i's warp is driven only by amplitude(i + 1) — a level beyond `depth` never runs, so its own amplitude is provably inert", () => {
      // depth = 2 only ever runs levels 0 and 1 (amplitude1, amplitude2);
      // amplitude3..amplitude6 are never read, at any value.
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.double({ min: 0, max: 0.5, noNaN: true }),
            fc.double({ min: 0, max: 0.5, noNaN: true }),
            fc.integer({ min: 0, max: 99999 }),
            (x, y, amplitude1, amplitude3, seed) => {
               const withAmplitude3 = recursiveNoise(x, y, { depth: 2, amplitude1, amplitude3, seed });
               const withoutAmplitude3 = recursiveNoise(x, y, { depth: 2, amplitude1, amplitude3: 0, seed });
               expect(withAmplitude3).toBe(withoutAmplitude3);
            }
         )
      );
   });

   it("at depth 1, only level 0 runs — amplitude2..amplitude6 are never read, at any value", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.double({ min: 0, max: 0.5, noNaN: true }),
            fc.double({ min: 0, max: 0.5, noNaN: true }),
            fc.integer({ min: 0, max: 99999 }),
            (x, y, amplitude1, amplitude2, seed) => {
               const withAmplitude2 = recursiveNoise(x, y, { depth: 1, amplitude1, amplitude2, seed });
               const withoutAmplitude2 = recursiveNoise(x, y, { depth: 1, amplitude1, amplitude2: 0, seed });
               expect(withAmplitude2).toBe(withoutAmplitude2);
            }
         )
      );
   });

   it("level 0 IS displaced by its own amplitude1, independent of depth", () => {
      const depth = 2, amplitude1 = 0.5, seed = 3;
      let anyDifference = false;
      for (let x = 0; x < CANVAS.WIDTH && !anyDifference; x += 5) {
         for (let y = 0; y < CANVAS.HEIGHT && !anyDifference; y += 5) {
            const warped = recursiveNoise(x, y, { depth, amplitude1, seed });
            const baseline = recursive(x, y, { depth, subdivisions: 3, mode: "sierpinski" });
            if (warped !== baseline) anyDifference = true;
         }
      }
      expect(anyDifference).toBe(true);
   });

   it("MAX_LEVELS matches patternRegistry.js's depth upper bound (map: [1, 6])", () => {
      expect(MAX_LEVELS).toBe(6);
   });
});
