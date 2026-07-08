/*
========================================
NOISE (PERLIN) — ALGORITHM-SPECIFIC PROPERTIES
========================================
* Perlin noise is built by interpolating dot products of unit gradient vectors, which
* bounds its derivative: the field cannot jump discontinuously the way raw random
* per-pixel noise would. We check this Lipschitz-style bound directly rather than
* just asserting "it looks smooth".
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { noise } from "../noise.js";

// Known bound on 2D gradient-noise derivative magnitude in noise-space is ~sqrt(2);
// LIPSCHITZ_K adds headroom for the interpolation curve without being loose enough
// to hide a real regression (e.g. an accidental octave/lacunarity blow-up).
const LIPSCHITZ_K = 5;
const DX = 1e-3; // pixels

describe("noise: algorithm-specific invariants", () => {
   it("is Lipschitz-continuous in x for a single octave (no gradient jumps)", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: 600, noNaN: true }),
            fc.double({ min: 0, max: 600, noNaN: true }),
            fc.double({ min: 0.001, max: 0.05, noNaN: true }),
            fc.integer({ min: 0, max: 999999 }),
            (x, y, scale, seed) => {
               const params = { scale, seed, octaves: 1, mode: "standard" };
               const a = noise(x, y, params);
               const b = noise(x + DX, y, params);
               expect(Math.abs(b - a)).toBeLessThanOrEqual(LIPSCHITZ_K * scale * DX + 1e-9);
            }
         )
      );
   });

   it("ridge mode is a deterministic transform of standard mode: 1 - 2|standard|", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: 600, noNaN: true }),
            fc.double({ min: 0, max: 600, noNaN: true }),
            fc.double({ min: 0.001, max: 0.05, noNaN: true }),
            fc.integer({ min: 0, max: 999999 }),
            (x, y, scale, seed) => {
               const base = { scale, seed, octaves: 1 };
               const standard = noise(x, y, { ...base, mode: "standard" });
               const ridge = noise(x, y, { ...base, mode: "ridge" });
               expect(ridge).toBeCloseTo(1 - 2 * Math.abs(standard), 10);
            }
         )
      );
   });
});
