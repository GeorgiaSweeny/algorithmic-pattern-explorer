/*
========================================
DISTANCE FIELD — PRIMITIVE-LEVEL TESTS
========================================
* nearestTwoPoints was added for voronoiIslamic.js (2026-08-21 follow-up,
* docs/VORONOI_ISLAMIC_HYBRID_PLAN.md) — tested here on its own, matching
* this project's per-primitive test convention (lib.seedPoints.test.js,
* lib.starPolygon.test.js), independent of the generator that consumes it.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { nearestPoint, nearestTwoPoints } from "../lib/distanceField.js";

const pointArb = fc.record({
   x: fc.double({ min: 0, max: 600, noNaN: true }),
   y: fc.double({ min: 0, max: 600, noNaN: true }),
});

function randomPoints(n, rng) {
   const points = new Float32Array(n * 2);
   for (let i = 0; i < n * 2; i++) points[i] = rng() * 600;
   return points;
}

describe("nearestTwoPoints", () => {
   it("agrees with nearestPoint on index and distSq", () => {
      fc.assert(
         fc.property(
            pointArb,
            fc.array(pointArb, { minLength: 2, maxLength: 20 }),
            (p, pts) => {
               const flat = new Float32Array(pts.flatMap((q) => [q.x, q.y]));
               const a = nearestPoint(p.x, p.y, flat);
               const b = nearestTwoPoints(p.x, p.y, flat);
               expect(b.index).toBe(a.index);
               expect(b.distSq).toBe(a.distSq);
            }
         )
      );
   });

   it("secondDistSq is always >= distSq", () => {
      fc.assert(
         fc.property(
            pointArb,
            fc.array(pointArb, { minLength: 2, maxLength: 20 }),
            (p, pts) => {
               const flat = new Float32Array(pts.flatMap((q) => [q.x, q.y]));
               const { distSq, secondDistSq } = nearestTwoPoints(p.x, p.y, flat);
               expect(secondDistSq).toBeGreaterThanOrEqual(distSq);
            }
         )
      );
   });

   it("matches a brute-force sort of all distances, for a hand-built point set", () => {
      // Three points at distances 3, 4, 5 from the origin.
      const points = new Float32Array([3, 0, 0, 4, 0, 5]);
      const { index, distSq, secondDistSq } = nearestTwoPoints(0, 0, points);
      expect(index).toBe(0); // (3,0) is nearest
      expect(distSq).toBeCloseTo(9, 6);
      expect(secondDistSq).toBeCloseTo(16, 6);
   });

   it("is exactly zero (best) and equal to itself (no second point) for a single-point set", () => {
      const points = new Float32Array([10, 10]);
      const { distSq, secondDistSq } = nearestTwoPoints(10, 10, points);
      expect(distSq).toBe(0);
      expect(secondDistSq).toBe(Infinity);
   });

   it("the boundary condition (secondDist - dist = 0) holds exactly on the perpendicular bisector between two points", () => {
      // Two seeds on the x-axis; their bisector is the vertical line x = midpoint.
      const points = new Float32Array([0, 0, 20, 0]);
      for (const y of [-5, 0, 5, 12]) {
         const { distSq, secondDistSq } = nearestTwoPoints(10, y, points);
         expect(Math.sqrt(secondDistSq) - Math.sqrt(distSq)).toBeCloseTo(0, 6);
      }
      // Off the bisector, the gap should be strictly positive.
      const { distSq, secondDistSq } = nearestTwoPoints(2, 0, points);
      expect(Math.sqrt(secondDistSq) - Math.sqrt(distSq)).toBeGreaterThan(0.1);
   });
});
