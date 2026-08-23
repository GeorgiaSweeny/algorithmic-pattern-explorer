/*
========================================
STAR POLYGON — PRIMITIVE-LEVEL PROPERTIES
========================================
* Tests starOutline/lineIntersect in isolation, independent of islamic.js,
* so the silhouette derivation is verified directly rather than only
* through islamic.js's own property tests.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { starOutline, lineIntersect } from "../lib/starPolygon.js";
import { pointInPolygon } from "../lib/distanceField.js";

function ring(n, r) {
   const points = new Float64Array(n * 2);
   for (let i = 0; i < n; i++) {
      const angle = (i * 2 * Math.PI) / n;
      points[i * 2] = r * Math.cos(angle);
      points[i * 2 + 1] = r * Math.sin(angle);
   }
   return points;
}

describe("lineIntersect: primitive-level invariants", () => {
   it("returns null for parallel lines", () => {
      expect(lineIntersect(0, 0, 1, 0, 0, 1, 1, 1)).toBeNull();
   });

   it("finds the exact crossing point of two non-parallel lines", () => {
      // x-axis and y-axis cross at the origin.
      const hit = lineIntersect(-1, 0, 1, 0, 0, -1, 0, 1);
      expect(hit.x).toBeCloseTo(0, 9);
      expect(hit.y).toBeCloseTo(0, 9);
   });
});

describe("starOutline: primitive-level invariants", () => {
   it("returns 2n vertices for an n-point ring", () => {
      fc.assert(
         fc.property(fc.integer({ min: 5, max: 16 }), fc.double({ min: 10, max: 200, noNaN: true }),
            (n, r) => {
               const outline = starOutline(ring(n, r), 2);
               expect(outline.length).toBe(n * 4);
            }
         )
      );
   });

   it("tip vertices sit exactly on the original ring (distance r from centre)", () => {
      fc.assert(
         fc.property(fc.integer({ min: 5, max: 16 }), fc.double({ min: 10, max: 200, noNaN: true }),
            (n, r) => {
               const outline = starOutline(ring(n, r), 2);
               for (let i = 0; i < n; i++) {
                  const tx = outline[i * 4], ty = outline[i * 4 + 1];
                  expect(Math.hypot(tx, ty)).toBeCloseTo(r, 4);
               }
            }
         )
      );
   });

   it("waist vertices are strictly closer to centre than the tip radius (a genuine concave star, not a plain n-gon)", () => {
      fc.assert(
         fc.property(fc.integer({ min: 5, max: 16 }), fc.double({ min: 10, max: 200, noNaN: true }),
            (n, r) => {
               const outline = starOutline(ring(n, r), 2);
               for (let i = 0; i < n; i++) {
                  const wx = outline[i * 4 + 2], wy = outline[i * 4 + 3];
                  expect(Math.hypot(wx, wy)).toBeLessThan(r);
               }
            }
         )
      );
   });

   it("has exact n-fold rotational symmetry (every waist radius is identical)", () => {
      fc.assert(
         fc.property(fc.integer({ min: 5, max: 16 }), fc.double({ min: 10, max: 200, noNaN: true }),
            (n, r) => {
               const outline = starOutline(ring(n, r), 2);
               const waist0 = Math.hypot(outline[2], outline[3]);
               for (let i = 1; i < n; i++) {
                  const w = Math.hypot(outline[i * 4 + 2], outline[i * 4 + 3]);
                  expect(w).toBeCloseTo(waist0, 4);
               }
            }
         )
      );
   });

   it("matches the pentagram's known golden-ratio proportion at n=5 (waist/tip = 1/phi^2)", () => {
      const outline = starOutline(ring(5, 100), 2);
      const waistRadius = Math.hypot(outline[2], outline[3]);
      const phi = (1 + Math.sqrt(5)) / 2;
      expect(waistRadius / 100).toBeCloseTo(1 / (phi * phi), 4);
   });

   it("the centre point is always inside the outline", () => {
      fc.assert(
         fc.property(fc.integer({ min: 5, max: 16 }), fc.double({ min: 10, max: 200, noNaN: true }),
            (n, r) => {
               const outline = starOutline(ring(n, r), 2);
               expect(pointInPolygon(0, 0, outline)).toBe(true);
            }
         )
      );
   });
});
