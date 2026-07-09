/*
========================================
WAVE — ALGORITHM-SPECIFIC PROPERTIES
========================================
* wave.js implements two independent closed forms: "wave" mode is a plain
* sin(y * frequency) stripe pattern, "rings" mode is sin(radius * frequency)
* around the canvas centre. Both are pure trig, so their defining properties —
* periodicity in the driving variable, and (for rings) radial symmetry — are
* exact, not approximate, and checked here bit-for-bit.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { wave } from "../wave.js";
import { CANVAS } from "../../config.js";

const coordArb = fc.double({ min: 0, max: 600, noNaN: true });
const freqArb = fc.double({ min: 0.005, max: 0.15, noNaN: true });

describe("wave: algorithm-specific invariants", () => {
   it("stripes mode depends only on y (translating x leaves the value unchanged)", () => {
      fc.assert(
         fc.property(coordArb, coordArb, coordArb, freqArb, (x1, x2, y, frequency) => {
            const params = { mode: "wave", frequency };
            expect(wave(x1, y, params)).toBe(wave(x2, y, params));
         })
      );
   });

   it("stripes mode is periodic in y with period 2*PI/frequency", () => {
      fc.assert(
         fc.property(coordArb, coordArb, freqArb, (x, y, frequency) => {
            const params = { mode: "wave", frequency };
            const period = (2 * Math.PI) / frequency;
            expect(wave(x, y + period, params)).toBeCloseTo(wave(x, y, params), 9);
         })
      );
   });

   it("rings mode is radially symmetric: any two points equidistant from the canvas centre agree", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: 400, noNaN: true }), // radius
            fc.double({ min: 0, max: 2 * Math.PI, noNaN: true }),
            fc.double({ min: 0, max: 2 * Math.PI, noNaN: true }),
            freqArb,
            (r, theta1, theta2, frequency) => {
               const cx = CANVAS.WIDTH / 2, cy = CANVAS.HEIGHT / 2;
               const params = { mode: "rings", frequency };
               const p1 = wave(cx + r * Math.cos(theta1), cy + r * Math.sin(theta1), params);
               const p2 = wave(cx + r * Math.cos(theta2), cy + r * Math.sin(theta2), params);
               expect(p1).toBeCloseTo(p2, 9);
            }
         )
      );
   });

   it("rings mode is periodic in radius with period 2*PI/frequency", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: 400, noNaN: true }),
            fc.double({ min: 0, max: 2 * Math.PI, noNaN: true }),
            freqArb,
            (r, theta, frequency) => {
               const cx = CANVAS.WIDTH / 2, cy = CANVAS.HEIGHT / 2;
               const params = { mode: "rings", frequency };
               const period = (2 * Math.PI) / frequency;
               const here = wave(cx + r * Math.cos(theta), cy + r * Math.sin(theta), params);
               const out  = wave(cx + (r + period) * Math.cos(theta), cy + (r + period) * Math.sin(theta), params);
               expect(out).toBeCloseTo(here, 9);
            }
         )
      );
   });

   it("unrecognised mode falls back to stripes behaviour", () => {
      fc.assert(
         fc.property(coordArb, coordArb, freqArb, (x, y, frequency) => {
            expect(wave(x, y, { mode: "not-a-real-mode", frequency }))
               .toBe(wave(x, y, { mode: "wave", frequency }));
         })
      );
   });
});
