/*
========================================
RECURSIVE (SIERPINSKI / GRID) — ALGORITHM-SPECIFIC PROPERTIES
========================================
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { recursive } from "../recursive.js";
import { CANVAS } from "../../config.js";

describe("recursive: algorithm-specific invariants", () => {
   it("depth 0 always returns 1, regardless of position or subdivisions", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.integer({ min: 2, max: 9 }),
            (x, y, subdivisions) => {
               expect(recursive(x, y, { depth: 0, subdivisions })).toBe(1);
            }
         )
      );
   });

   it("is scale-invariant: the pattern at depth d is self-similar to depth d-1 " +
      "within any non-removed sub-cell", () => {
      fc.assert(
         fc.property(
            fc.integer({ min: 1, max: 5 }),
            fc.integer({ min: 2, max: 6 }),
            fc.double({ min: 0, max: 0.999, noNaN: true }),
            fc.double({ min: 0, max: 0.999, noNaN: true }),
            (depth, sub, u, v) => {
               // Map (u, v) into the sub-cell one level down from the origin and
               // confirm it matches recursing directly to depth - 1 on the mapped point.
               const mid = Math.floor(sub / 2);
               const gx = Math.floor(u * sub);
               const gy = Math.floor(v * sub);
               fc.pre(!(gx === mid && gy === mid)); // skip the removed centre cell

               const x = u * CANVAS.WIDTH;
               const y = v * CANVAS.HEIGHT;
               const full = recursive(x, y, { depth, subdivisions: sub });

               const nx = ((u * sub) % 1) * CANVAS.WIDTH;
               const ny = ((v * sub) % 1) * CANVAS.HEIGHT;
               const oneLevelDown = recursive(nx, ny, { depth: depth - 1, subdivisions: sub });

               expect(full).toBe(oneLevelDown);
            }
         )
      );
   });
});
