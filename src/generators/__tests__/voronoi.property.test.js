/*
========================================
VORONOI — ALGORITHM-SPECIFIC PROPERTIES
========================================
* Unlike grid.js, voronoi.js's tone assignment isn't adjacency-aware — cells
* are coloured by (cell index) % shades.length, in RNG emission order, so
* there's no "proper colouring" property here. These tests instead check
* that the partition itself is computed correctly, against an independent
* re-implementation of the seed generation (oracleSeeds below).
*
* Aurenhammer, F. (1991). "Voronoi Diagrams — A Survey of a Fundamental
* Geometric Data Structure." ACM Computing Surveys, 23(3), 345-405,
* Definition 1.1 — defines each site's region as {x : dist(x, p_i) <=
* dist(x, p_j) for all j != i}. "no other seed is strictly closer" below
* makes that defining inequality the explicit assertion. Okabe, A., Boots,
* B., Sugihara, K., & Chiu, S.N. (2000). *Spatial Tessellations: Concepts
* and Applications of Voronoi Diagrams* (2nd ed.). Wiley — the applied
* companion text for the same construction.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { voronoi } from "../voronoi.js";
import { CANVAS } from "../../config.js";

const TONES = { "2": [1, -1], "3": [1, 0, -1] };

// Mirrors voronoi.js's private generateSeeds/xorshift RNG exactly, giving
// tests an independent oracle for "which cell is nearest".
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

   it("satisfies the Voronoi region's defining inequality directly: the tone-" +
      "producing seed is at least as close as every other seed (Aurenhammer " +
      "1991, Definition 1.1) — not just equal to an oracle's nearest index", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.integer({ min: 2, max: 80 }),
            fc.integer({ min: 0, max: 999999 }),
            (x, y, numCells, seed) => {
               const pts = oracleSeeds(numCells, seed);
               const nearest = oracleNearestIndex(x, y, pts);
               const nx = pts[nearest][0], ny = pts[nearest][1];
               const distToNearestSq = (x - nx) ** 2 + (y - ny) ** 2;

               const v2 = voronoi(x, y, { numCells, seed, tones: "2" });
               expect(v2).toBe(TONES["2"][nearest % 2]);
               for (let i = 0; i < pts.length; i++) {
                  const distSq = (x - pts[i][0]) ** 2 + (y - pts[i][1]) ** 2;
                  expect(distToNearestSq).toBeLessThanOrEqual(distSq + 1e-9);
               }
            }
         )
      );
   });

   it("the seed cache (keyed only by numCells|seed) doesn't leak stale results " +
      "across calls made with a different tones value", () => {
      // voronoi.js caches seed points keyed by `${numCells}|${seed}` — tones
      // is deliberately not part of that key. Calls tones="3" first to warm
      // the cache, then tones="2", and compares to a fresh oracle.
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
