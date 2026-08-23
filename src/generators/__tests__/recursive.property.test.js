/*
========================================
RECURSIVE (SIERPINSKI / GRID) — ALGORITHM-SPECIFIC PROPERTIES
========================================
* Sierpinski mode's construction — remove the centre cell of an n x n
* subdivision, recurse into the remaining n^2 - 1 cells — is the direct
* generalisation (to arbitrary `subdivisions`, not just 3) of the carpet
* Sierpinski, W. (1916). "Sur une courbe cantorienne qui contient une image
* biunivoque et continue de toute courbe donnée." Comptes Rendus Hebdomadaires
* des Séances de l'Académie des Sciences, 162, 629-632, first constructed.
* "is scale-invariant" below already checks the construction's defining
* self-similarity directly (depth d matches depth d-1 on the remapped
* sub-cell) rather than only checking output range. The "expected fill
* fraction" test adds the complementary, statistical side of the same
* claim: Mandelbrot, B.B. (1982). *The Fractal Geometry of Nature*. W.H.
* Freeman — the standard reference for treating self-similar constructions
* like this one through their limiting density/dimension rather than only
* their exact recursive rule — predicts that removing 1 of every n^2 cells
* at each of `depth` independent levels leaves a fraction
* ((n^2 - 1) / n^2)^depth of the area filled, a falsifiable numeric
* prediction distinct from (though implied by) the exact recursive
* self-similarity property already tested.
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

      // R2 low-discrepancy sequence (Roberts, 2018 — a well-known,
      // easily-reproduced quasi-random sequence) rather than a plain evenly-
      // spaced grid: a grid sampled at multiples of 1/subdivisions would
      // systematically land on cell boundaries and bias the empirical fill
      // fraction below. Deterministic (no Math.random), so the test is
      // reproducible across runs.
      function r2Sample(i) {
         const a1 = 0.7548776662466927;
         const a2 = 0.5698402909980532;
         return [(0.5 + a1 * i) % 1, (0.5 + a2 * i) % 1];
      }

      it("expected fill fraction matches the fractal's own density prediction " +
         "((n^2 - 1) / n^2)^depth (Mandelbrot 1982's self-similar-density " +
         "framing), not just the exact recursive rule checked above", () => {
         fc.assert(
            fc.property(
               fc.integer({ min: 1, max: 4 }),
               fc.integer({ min: 3, max: 6 }),
               (depth, sub) => {
                  const n = 4000;
                  let filled = 0;
                  for (let i = 0; i < n; i++) {
                     const [u, v] = r2Sample(i);
                     const v_ = recursive(u * CANVAS.WIDTH, v * CANVAS.HEIGHT, {
                        depth, subdivisions: sub, mode: "sierpinski",
                     });
                     if (v_ === 1) filled++;
                  }
                  const empirical = filled / n;
                  const expected = ((sub * sub - 1) / (sub * sub)) ** depth;
                  // Binomial standard error at p = expected, generous
                  // multiplier for a low-discrepancy (not i.i.d. random)
                  // sequence, which converges faster than this bound assumes.
                  const stderr = Math.sqrt((expected * (1 - expected)) / n);
                  expect(Math.abs(empirical - expected)).toBeLessThan(8 * stderr + 0.01);
               }
            ),
            { numRuns: 30 } // each run does n=4000 recursive() calls
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
