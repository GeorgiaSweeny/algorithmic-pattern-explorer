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
   it("depth 0 always returns 1, regardless of position, subdivisions or mode", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
            fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
            fc.integer({ min: 2, max: 9 }),
            fc.constantFrom("sierpinski", "grid"),
            (x, y, subdivisions, mode) => {
               expect(recursive(x, y, { depth: 0, subdivisions, mode })).toBe(1);
            }
         )
      );
   });

   describe("sierpinski mode", () => {
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
                  const full = recursive(x, y, { depth, subdivisions: sub, mode: "sierpinski" });

                  const nx = ((u * sub) % 1) * CANVAS.WIDTH;
                  const ny = ((v * sub) % 1) * CANVAS.HEIGHT;
                  const oneLevelDown = recursive(nx, ny, { depth: depth - 1, subdivisions: sub, mode: "sierpinski" });

                  expect(full).toBe(oneLevelDown);
               }
            )
         );
      });

      it("mode defaults to sierpinski when omitted", () => {
         fc.assert(
            fc.property(
               fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
               fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
               fc.integer({ min: 1, max: 5 }),
               fc.integer({ min: 2, max: 6 }),
               (x, y, depth, subdivisions) => {
                  expect(recursive(x, y, { depth, subdivisions }))
                     .toBe(recursive(x, y, { depth, subdivisions, mode: "sierpinski" }));
               }
            )
         );
      });
   });

   describe("grid mode", () => {
      it("never returns a hole (-1 is reachable, but only via cumulative parity, never an early exit)", () => {
         // With no early exit, every output is either 1 or -1 — the same range as
         // sierpinski, but reached by a different mechanism (see composition test below).
         fc.assert(
            fc.property(
               fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
               fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
               fc.integer({ min: 0, max: 6 }),
               fc.integer({ min: 2, max: 9 }),
               (x, y, depth, subdivisions) => {
                  const v = recursive(x, y, { depth, subdivisions, mode: "grid" });
                  expect([1, -1]).toContain(v);
               }
            )
         );
      });

      it("composes correctly: the value at depth d equals the value at depth d-1 on the " +
         "remapped point, sign-flipped iff the top-level cell's own parity is odd", () => {
         fc.assert(
            fc.property(
               fc.integer({ min: 1, max: 6 }),
               fc.integer({ min: 2, max: 9 }),
               fc.double({ min: 0, max: 0.999, noNaN: true }),
               fc.double({ min: 0, max: 0.999, noNaN: true }),
               (depth, sub, u, v) => {
                  const gx = Math.floor(u * sub);
                  const gy = Math.floor(v * sub);
                  const expectedSign = (gx + gy) % 2 === 0 ? 1 : -1;

                  const x = u * CANVAS.WIDTH;
                  const y = v * CANVAS.HEIGHT;
                  const full = recursive(x, y, { depth, subdivisions: sub, mode: "grid" });

                  const nx = ((u * sub) % 1) * CANVAS.WIDTH;
                  const ny = ((v * sub) % 1) * CANVAS.HEIGHT;
                  const oneLevelDown = recursive(nx, ny, { depth: depth - 1, subdivisions: sub, mode: "grid" });

                  expect(full).toBe(oneLevelDown * expectedSign);
               }
            )
         );
      });
   });

   it("sierpinski and grid mode diverge once a centre cell would be hit (holes vs. no holes)", () => {
      // subdivisions = 3 puts the centre cell at gx = gy = 1; the canvas centre
      // falls exactly in that cell at depth 1, so sierpinski excludes it (-1)
      // while grid mode — which never excludes — computes a real parity-based
      // colour instead: parity = (gx + gy) % 2 = (1 + 1) % 2 = 0 -> 1.
      const x = 0.5 * CANVAS.WIDTH, y = 0.5 * CANVAS.HEIGHT;
      const sierpinski = recursive(x, y, { depth: 1, subdivisions: 3, mode: "sierpinski" });
      const grid = recursive(x, y, { depth: 1, subdivisions: 3, mode: "grid" });
      expect(sierpinski).toBe(-1);
      expect(grid).toBe(1);
   });
});
