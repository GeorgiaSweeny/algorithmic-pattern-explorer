/*
========================================
FOLD (OCTAVES) — PRIMITIVE-LEVEL PROPERTIES
========================================
* Tests foldOctaves in isolation, independent of noise.js/Perlin, so the fold
* combinator itself (docs/ALGORITHMIC_COMPOSITION_RESEARCH.md) is verified
* directly rather than only through noise.js's own property tests.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { foldOctaves } from "../lib/fold.js";

describe("foldOctaves: primitive-level invariants", () => {
   it("a single octave returns exactly sample(1, 0), regardless of persistence/lacunarity", () => {
      fc.assert(
         fc.property(
            fc.double({ min: -1, max: 1, noNaN: true }),
            fc.double({ min: 0.1, max: 0.9, noNaN: true }),
            fc.double({ min: 1.0, max: 4.0, noNaN: true }),
            (sampleValue, persistence, lacunarity) => {
               const result = foldOctaves(() => sampleValue, 1, { persistence, lacunarity });
               // toBeCloseTo rather than toBe: sum starts at +0, so a -0 sample
               // value comes back as +0 (0 + -0 === 0 in IEEE 754) — not a bug.
               expect(result).toBeCloseTo(sampleValue, 9);
            }
         )
      );
   });

   it("a constant sampler returns the same constant at any octave count (normalisation cancels amplitude decay)", () => {
      fc.assert(
         fc.property(
            fc.double({ min: -1, max: 1, noNaN: true }),
            fc.integer({ min: 1, max: 8 }),
            fc.double({ min: 0.1, max: 0.9, noNaN: true }),
            fc.double({ min: 1.0, max: 4.0, noNaN: true }),
            (sampleValue, octaves, persistence, lacunarity) => {
               const result = foldOctaves(() => sampleValue, octaves, { persistence, lacunarity });
               expect(result).toBeCloseTo(sampleValue, 9);
            }
         )
      );
   });

   it("calls sample() with frequency = lacunarity^i for octave i, in order", () => {
      fc.assert(
         fc.property(
            fc.integer({ min: 1, max: 8 }),
            fc.double({ min: 1.0, max: 4.0, noNaN: true }),
            (octaves, lacunarity) => {
               const seen = [];
               foldOctaves((frequency, i) => { seen.push([frequency, i]); return 0; }, octaves, { lacunarity });
               expect(seen.map(([, i]) => i)).toEqual([...Array(octaves).keys()]);
               seen.forEach(([frequency, i]) => {
                  expect(frequency).toBeCloseTo(lacunarity ** i, 9);
               });
            }
         )
      );
   });
});
