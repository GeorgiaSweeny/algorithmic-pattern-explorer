/*
========================================
ISLAMIC — ALGORITHM-SPECIFIC PROPERTIES
========================================
* islamic.js is a Grid lookup (tile centre) feeding a Distance Field search
* against a deterministic ring of Radial Divisions points — no RNG anywhere.
* The properties that follow check the two things that construction should
* guarantee: n-fold rotational symmetry around each tile centre, and exact
* periodicity across tile boundaries (the Grid stage is a straight repeat).
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { islamic } from "../islamic.js";

const tileSizeArb = fc.double({ min: 40, max: 200, noNaN: true });
const segmentsArb = fc.integer({ min: 4, max: 16 });
const freqArb = fc.double({ min: 0.05, max: 0.4, noNaN: true });
const modeArb = fc.constantFrom("rosette", "star-lines");

// A point safely inside a tile — offset kept well away from tile edges so
// floating-point rounding near a boundary can't flip which tile it lands in.
function tilePoint(tileSize, col, row, offsetX, offsetY) {
   const cx = (col + 0.5) * tileSize;
   const cy = (row + 0.5) * tileSize;
   return { cx, cy, x: cx + offsetX, y: cy + offsetY };
}

describe("islamic: algorithm-specific invariants", () => {
   it("returns the declared tone set in rosette mode", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: 600, noNaN: true }),
            fc.double({ min: 0, max: 600, noNaN: true }),
            tileSizeArb, segmentsArb, freqArb,
            fc.constantFrom("2", "3"),
            (x, y, tileSize, segments, frequency, tones) => {
               const v = islamic(x, y, { mode: "rosette", tileSize, segments, frequency, tones });
               const expected = tones === "3" ? [1, 0, -1] : [1, -1];
               expect(expected).toContain(v);
            }
         )
      );
   });

   it("is exactly periodic across tile boundaries (Grid repeats the same local field)", () => {
      fc.assert(
         fc.property(
            fc.integer({ min: -3, max: 3 }), fc.integer({ min: -3, max: 3 }),
            fc.double({ min: -18, max: 18, noNaN: true }),
            fc.double({ min: -18, max: 18, noNaN: true }),
            tileSizeArb, segmentsArb, freqArb, modeArb,
            (col, row, offsetX, offsetY, tileSize, segments, frequency, mode) => {
               const p = tilePoint(tileSize, col, row, offsetX, offsetY);
               const params = { mode, tileSize, segments, frequency };
               const here  = islamic(p.x, p.y, params);
               const there = islamic(p.x + tileSize, p.y, params);
               expect(there).toBeCloseTo(here, 6);
            }
         )
      );
   });

   it("is rotationally symmetric under a 360/segments turn about the tile centre", () => {
      fc.assert(
         fc.property(
            fc.integer({ min: -2, max: 2 }), fc.integer({ min: -2, max: 2 }),
            fc.double({ min: 2, max: 15, noNaN: true }),  // radius from tile centre — kept
            // well inside the smallest tested tile's construction circle (0.42*40 ≈ 16.8)
            // so both rotated sample points stay in the same tile as the centre used below.
            fc.double({ min: 0, max: 2 * Math.PI, noNaN: true }),
            tileSizeArb, segmentsArb, freqArb, modeArb,
            (col, row, r, theta, tileSize, segments, frequency, mode) => {
               const cx = (col + 0.5) * tileSize;
               const cy = (row + 0.5) * tileSize;
               const step = (2 * Math.PI) / Math.round(segments);
               const params = { mode, tileSize, segments, frequency };

               const p1 = islamic(cx + r * Math.cos(theta), cy + r * Math.sin(theta), params);
               const p2 = islamic(cx + r * Math.cos(theta + step), cy + r * Math.sin(theta + step), params);
               expect(p2).toBeCloseTo(p1, 5);
            }
         )
      );
   });

   it("star-lines mode is a Waveform applied to distance: agrees with sin(dist * frequency)", () => {
      fc.assert(
         fc.property(
            fc.integer({ min: -2, max: 2 }), fc.integer({ min: -2, max: 2 }),
            // kept within the smallest tested tile's half-width (tileSize >= 40)
            // so the oracle below and islamic() agree on which tile the point is in
            fc.double({ min: -18, max: 18, noNaN: true }),
            fc.double({ min: -18, max: 18, noNaN: true }),
            tileSizeArb, segmentsArb, freqArb,
            (col, row, offsetX, offsetY, tileSize, segments, frequency) => {
               const p = tilePoint(tileSize, col, row, offsetX, offsetY);
               const n = Math.max(3, Math.round(segments));
               const radius = tileSize * 0.42;

               let minDistSq = Infinity;
               for (let i = 0; i < n; i++) {
                  const angle = (i * 2 * Math.PI) / n;
                  const px = radius * Math.cos(angle), py = radius * Math.sin(angle);
                  const dx = offsetX - px, dy = offsetY - py;
                  minDistSq = Math.min(minDistSq, dx * dx + dy * dy);
               }
               const expected = Math.sin(Math.sqrt(minDistSq) * frequency);

               const v = islamic(p.x, p.y, { mode: "star-lines", tileSize, segments, frequency });
               expect(v).toBeCloseTo(expected, 5);
            }
         )
      );
   });
});
