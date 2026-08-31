/*
========================================
NOISE (PERLIN) — ALGORITHM-SPECIFIC PROPERTIES
========================================
* Perlin, K. (1985). "An Image Synthesizer." SIGGRAPH '85, 19(3), 287-296 —
* the original gradient-noise construction. Perlin, K. (2002). "Improving
* Noise." SIGGRAPH 2002, 21(3), 681-682 — replaces the 1985 paper's cubic
* fade curve (3t^2-2t^3, C1 but not C2 at cell boundaries) with the quintic
* 6t^5-15t^4+10t^3 curve (C2), removing a second-derivative discontinuity
* that produced grid-aligned artifacts. The "fade curve C2 continuity"
* test below checks this codebase's own fade() has that exact property.
*
* Lagae, A. et al. (2010). "A Survey of Procedural Noise Functions."
* Computer Graphics Forum, 29(8), 2579-2600 — grounds the Lipschitz-
* continuity property checked below. LIPSCHITZ_K is this test's own
* derived headroom constant, not a value from that survey.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { noise } from "../noise.js";
import { Perlin } from "../../patternSystems/noiseLib/perlinNoise.js";

// Known bound on 2D gradient-noise derivative magnitude in noise-space is
// ~sqrt(2); LIPSCHITZ_K adds headroom without being loose enough to hide a
// real regression (e.g. an accidental octave/lacunarity blow-up).
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

   // Checks the actual fade() implementation has the C2 property Perlin's
   // 2002 paper describes, via a central-difference second-derivative
   // estimate at both cell-boundary endpoints (t=0 and t=1).
   describe("fade curve C2 continuity (Perlin 2002's improvement over 1985)", () => {
      const perlin = new Perlin(1337);
      const H = 1e-4;

      function secondDerivative(t) {
         return (perlin.fade(t + H) - 2 * perlin.fade(t) + perlin.fade(t - H)) / (H * H);
      }

      it("first derivative (slope) is ~0 at both cell boundaries (C1)", () => {
         const slopeAt0 = (perlin.fade(H) - perlin.fade(0)) / H;
         const slopeAt1 = (perlin.fade(1) - perlin.fade(1 - H)) / H;
         expect(slopeAt0).toBeCloseTo(0, 3);
         expect(slopeAt1).toBeCloseTo(0, 3);
      });

      it("second derivative (curvature) is ~0 at both cell boundaries (C2) — " +
         "the specific property the 1985 cubic curve does not have", () => {
         expect(secondDerivative(0)).toBeCloseTo(0, 1);
         expect(secondDerivative(1)).toBeCloseTo(0, 1);
      });

      it("is not C2 for the superseded 1985 cubic curve, confirming the test " +
         "above actually distinguishes the two — not a tolerance so loose it " +
         "would pass for either curve", () => {
         const cubicFade = (t) => 3 * t * t - 2 * t * t * t;
         const cubicSecondDerivative = (t) =>
            (cubicFade(t + H) - 2 * cubicFade(t) + cubicFade(t - H)) / (H * H);
         // Analytically -6 and +6; loose bound only guards against a typo
         // making this accidentally close to 0 too.
         expect(Math.abs(cubicSecondDerivative(0))).toBeGreaterThan(1);
         expect(Math.abs(cubicSecondDerivative(1))).toBeGreaterThan(1);
      });
   });
});
