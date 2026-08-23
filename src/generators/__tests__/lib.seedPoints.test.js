/*
========================================
SEED POINTS — PRIMITIVE-LEVEL TESTS
========================================
* nearestNeighbourDistances was added for voronoiIslamic.js (see that
* file's header comment and docs/VORONOI_ISLAMIC_HYBRID_PLAN.md section
* 3.2) as a generic "for each point, how close is its nearest neighbour"
* query — tested here on its own, independent of any generator that
* consumes it, matching this project's per-primitive test convention
* (lib.starPolygon.test.js, lib.colourMapping.test.js).
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { generateSeedPoints, nearestNeighbourDistances } from "../lib/seedPoints.js";

describe("nearestNeighbourDistances", () => {
   it("returns one distance per point, all finite and non-negative", () => {
      fc.assert(
         fc.property(
            fc.integer({ min: 2, max: 200 }),
            fc.integer({ min: 0, max: 99999 }),
            (numPoints, seed) => {
               const points = generateSeedPoints(numPoints, seed);
               const dist = nearestNeighbourDistances(points);
               expect(dist.length).toBe(points.length / 2);
               for (const d of dist) {
                  expect(Number.isFinite(d)).toBe(true);
                  expect(d).toBeGreaterThanOrEqual(0);
               }
            }
         )
      );
   });

   it("matches a brute-force re-derivation for a small hand-built point set", () => {
      // [x0,y0, x1,y1, x2,y2]: a right triangle with legs 3 and 4 (hypotenuse 5).
      const points = new Float32Array([0, 0, 3, 0, 0, 4]);
      const dist = nearestNeighbourDistances(points);
      // Point 0's nearest neighbour is whichever of (3,0)/(0,4) is closer: both are
      // distance 3 and 4 respectively, so nearest is 3.
      expect(dist[0]).toBeCloseTo(3, 5);
      // Point 1 (3,0): nearest is point 0 at distance 3 (vs point 2 at distance 5).
      expect(dist[1]).toBeCloseTo(3, 5);
      // Point 2 (0,4): nearest is point 0 at distance 4 (vs point 1 at distance 5).
      expect(dist[2]).toBeCloseTo(4, 5);
   });

   it("two points: each is the other's nearest (and only) neighbour", () => {
      const points = new Float32Array([0, 0, 6, 8]); // distance 10 apart
      const dist = nearestNeighbourDistances(points);
      expect(dist[0]).toBeCloseTo(10, 5);
      expect(dist[1]).toBeCloseTo(10, 5);
   });
});
