/*
========================================
COLOUR MAPPING — PRIMITIVE-LEVEL PROPERTIES
========================================
* Tests toneSet's 2-5 generated tone counts and bandTone in isolation,
* independent of any one generator, so the primitives themselves are
* verified directly rather than only through a consuming generator's own
* property tests (islamic.js's islamic.property.test.js exercises both
* through actual rendering, but doesn't isolate their own guarantees).
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { toneSet, bandTone } from "../lib/colourMapping.js";

describe("toneSet: primitive-level invariants", () => {
   it("returns exactly `n` tones for every declared count 2-5", () => {
      for (const n of [2, 3, 4, 5]) {
         expect(toneSet(String(n))).toHaveLength(n);
      }
   });

   it("starts at 1 (background) and ends at -1 (dark) for every count", () => {
      for (const n of [2, 3, 4, 5]) {
         const shades = toneSet(String(n));
         expect(shades[0]).toBe(1);
         expect(shades[shades.length - 1]).toBe(-1);
      }
   });

   it("is evenly spaced", () => {
      for (const n of [2, 3, 4, 5]) {
         const shades = toneSet(String(n));
         const step = shades[1] - shades[0];
         for (let i = 1; i < shades.length; i++) {
            expect(shades[i] - shades[i - 1]).toBeCloseTo(step, 9);
         }
      }
   });

   it("falls back to 2 tones for anything outside 2-5 or non-numeric", () => {
      for (const bad of ["0", "1", "6", "100", "not-a-number", undefined]) {
         expect(toneSet(bad)).toEqual([1, -1]);
      }
   });
});

describe("bandTone: primitive-level invariants", () => {
   it("band 0 is always the darkest (last) tone", () => {
      for (const n of [2, 3, 4, 5]) {
         const shades = toneSet(String(n));
         expect(bandTone(shades, 0)).toBe(shades[shades.length - 1]);
      }
   });

   it("never returns the background tone (shades[0])", () => {
      fc.assert(
         fc.property(
            fc.constantFrom("2", "3", "4", "5"),
            fc.integer({ min: -20, max: 20 }),
            (tones, band) => {
               const shades = toneSet(tones);
               expect(bandTone(shades, band)).not.toBe(shades[0]);
            }
         )
      );
   });

   it("with only 2 tones, every band is the same single tone", () => {
      const shades = toneSet("2");
      fc.assert(
         fc.property(fc.integer({ min: -20, max: 20 }), (band) => {
            expect(bandTone(shades, band)).toBe(shades[1]);
         })
      );
   });

   it("with more than 2 tones, non-zero bands cycle through every tone strictly between the background and the darkest", () => {
      for (const n of [4, 5]) {
         const shades = toneSet(String(n));
         const echoTones = shades.slice(1, shades.length - 1);
         const seen = new Set();
         for (let band = 1; band <= echoTones.length * 2; band++) {
            seen.add(bandTone(shades, band));
         }
         for (const tone of echoTones) expect(seen.has(tone)).toBe(true);
      }
   });

   it("is symmetric in band sign (echoes look the same inward and outward)", () => {
      fc.assert(
         fc.property(
            fc.constantFrom("2", "3", "4", "5"),
            fc.integer({ min: 1, max: 20 }),
            (tones, band) => {
               const shades = toneSet(tones);
               expect(bandTone(shades, band)).toBe(bandTone(shades, -band));
            }
         )
      );
   });
});
