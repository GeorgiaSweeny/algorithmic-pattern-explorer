/*
========================================
NOISE (PERLIN) — ALGORITHM-SPECIFIC PROPERTIES
========================================
* Perlin noise is built by interpolating dot products of unit gradient vectors
* at lattice points, using a quintic "fade" blending curve — Perlin, K. (1985).
* "An Image Synthesizer." Computer Graphics (SIGGRAPH '85 Proceedings), 19(3),
* 287-296, for the original gradient-noise construction, and Perlin, K. (2002).
* "Improving Noise." ACM Transactions on Graphics (SIGGRAPH 2002), 21(3),
* 681-682, for the specific 6t^5-15t^4+10t^3 fade curve `patternSystems/
* noiseLib/perlinNoise.js`'s own `fade()` implements (checked directly against
* that file, not assumed — see the C2-continuity tests below). Perlin's 2002
* paper's stated motivation for replacing the 1985 paper's simpler cubic curve
* (3t^2-2t^3) was exactly the property tested in "the fade curve is C2, not
* just C1" below: eliminating a second-derivative discontinuity at cell
* boundaries that the cubic curve has but the quintic curve doesn't — this is
* the one specific, checkable mathematical claim in Perlin's own papers this
* codebase's implementation can be tested against, rather than a generic
* "looks smooth" assertion.
*
* The general claim that gradient/Perlin-type noise is smooth and
* differentiable with a bounded spatial derivative (grounding the Lipschitz
* test below) is a standard property discussed in Lagae, A., Lefebvre, S.,
* Cook, R., DeRose, T., Drettakis, G., Ebert, D., Lewis, J.P., Perlin, K., &
* Zwicker, M. (2010). "A Survey of Procedural Noise Functions." Computer
* Graphics Forum, 29(8), 2579-2600 — the standard survey of this exact
* generator family. Note the specific numeric bound (~sqrt(2) in
* noise-space, `LIPSCHITZ_K` below) is this test's own derived headroom
* figure, not a constant quoted from that survey — worth being precise
* about which part of the comment is a citation and which is this test
* suite's own reasoning, rather than implying the exact constant is
* published when it isn't.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { noise } from "../noise.js";
import { Perlin } from "../../patternSystems/noiseLib/perlinNoise.js";

// Known bound on 2D gradient-noise derivative magnitude in noise-space is ~sqrt(2)
// (see the file header for what is and isn't a cited constant here);
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

   // Perlin (2002), "Improving Noise" — the paper's own stated motivation for
   // replacing the 1985 cubic fade curve (3t^2-2t^3) with the quintic
   // 6t^5-15t^4+10t^3 this codebase's Perlin class implements
   // (patternSystems/noiseLib/perlinNoise.js's `fade()`). The cubic curve is
   // C1 (zero first derivative) but not C2 (nonzero second derivative) at
   // t=0 and t=1 — algebraically, its second derivative is 6-12t, which is
   // +/-6 at the endpoints, not 0. The quintic curve is C2 as well: its
   // second derivative, 60t(2t-1)(t-1), is exactly 0 at both t=0 and t=1.
   // That second-derivative discontinuity is what produces faint grid-
   // aligned artifacts in the noise field's curvature at integer lattice
   // boundaries with the older curve — the specific defect Perlin's 2002
   // paper fixes. This test checks the actual implementation has that
   // property, via a central-difference second-derivative estimate at
   // both endpoints, rather than assuming "uses a fade curve" is enough.
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
