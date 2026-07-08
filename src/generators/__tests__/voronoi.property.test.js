/*
========================================
VORONOI — ALGORITHM-SPECIFIC PROPERTIES
========================================
* Unlike grid.js, voronoi.js's tone assignment isn't adjacency-aware — cells are
* coloured by (cell index) % shades.length, purely in the order the seeded RNG
* emitted them, and nothing in the source claims neighbouring cells get distinct
* tones. So there's no "proper colouring" property to check here. What these
* tests check instead is that the partition itself is computed correctly: that
* the nearest-seed search and the index-to-tone mapping do what voronoi.js's
* comments say they do, verified against an independent re-implementation of the
* seed generation (oracleSeeds below) rather than trusting the same code twice.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { voronoi } from "../voronoi.js";
import { CANVAS } from "../../config.js";

const TONES = { "2": [1, -1], "3": [1, 0, -1] };

// Mirrors voronoi.js's private generateSeeds/xorshift RNG exactly (same seed ->
// same points is the documented contract) so tests have an independent oracle
// for "which cell is nearest" instead of re-deriving it from the code under test.
function oracleSeeds(numCells, seed) {
   const n = Math.max(2, Math.round(numCells));
   let s = (seed >>> 0) || 1;
   const rng = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff; };
   const pts = [];
   for (let i = 0; i < n; i++) {
      pts.push([rng() * CANVAS.WIDTH, rng() * CANVAS.HEIGHT]);
   }
   return pts;
}

function oracleNearestIndex(x, y, pts) {
   let minDist = Infinity, nearest = 0;
   for (let i = 0; i < pts.length; i++) {
      const dx = x - pts[i][0], dy = y - pts[i][1];
      const d = dx * dx + dy * dy;
      if (d < minDist) { minDist = d; nearest = i; }
   }
   return nearest;
}

describe("voronoi: algorithm-specific invariants", () => {
   it("only ever returns a value from the declared tone set", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.integer({ min: 5, max: 80 }),
            fc.integer({ min: 0, max: 999999 }),
            fc.constantFrom("2", "3"),
            (x, y, numCells, seed, tones) => {
               const v = voronoi(x, y, { numCells, seed, tones });
               expect(TONES[tones]).toContain(v);
            }
         )
      );
   });

   it("partitions space non-trivially: at least two distinct tones appear " +
      "across the canvas whenever there are at least two cells", () => {
      fc.assert(
         fc.property(
            fc.integer({ min: 2, max: 80 }),
            fc.integer({ min: 0, max: 999999 }),
            (numCells, seed) => {
               const seen = new Set();
               const steps = 12;
               for (let i = 0; i < steps && seen.size < 2; i++) {
                  for (let j = 0; j < steps && seen.size < 2; j++) {
                     const x = (i / (steps - 1)) * CANVAS.WIDTH;
                     const y = (j / (steps - 1)) * CANVAS.HEIGHT;
                     seen.add(voronoi(x, y, { numCells, seed, tones: "2" }));
                  }
               }
               expect(seen.size).toBeGreaterThanOrEqual(2);
            }
         )
      );
   });

   it("returns the tone of the actual nearest seed, for both tone counts", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.integer({ min: 2, max: 80 }),
            fc.integer({ min: 0, max: 999999 }),
            (x, y, numCells, seed) => {
               const pts = oracleSeeds(numCells, seed);
               const nearest = oracleNearestIndex(x, y, pts);

               const v2 = voronoi(x, y, { numCells, seed, tones: "2" });
               const v3 = voronoi(x, y, { numCells, seed, tones: "3" });
               expect(v2).toBe(TONES["2"][nearest % 2]);
               expect(v3).toBe(TONES["3"][nearest % 3]);
            }
         )
      );
   });

   it("the seed cache (keyed only by numCells|seed) doesn't leak stale results " +
      "across calls made with a different tones value", () => {
      // voronoi.js caches its generated seed points in a module-level Map keyed by
      // `${numCells}|${seed}` — tones is deliberately not part of that key, since
      // tones only selects a colour mapping after the same nearest-seed lookup.
      // This checks that assumption holds by calling with tones="3" first (to
      // populate/hit the cache), then tones="2", and comparing to a fresh oracle.
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.integer({ min: 2, max: 80 }),
            fc.integer({ min: 0, max: 999999 }),
            (x, y, numCells, seed) => {
               voronoi(x, y, { numCells, seed, tones: "3" }); // warm the cache first
               const v2 = voronoi(x, y, { numCells, seed, tones: "2" });

               const pts = oracleSeeds(numCells, seed);
               const nearest = oracleNearestIndex(x, y, pts);
               expect(v2).toBe(TONES["2"][nearest % 2]);
            }
         )
      );
   });
});
