/*
========================================
ESCHER (TRANSLATION TESSELLATION) — ALGORITHM-SPECIFIC PROPERTIES
========================================
* escher.js's header comment argues correctness from periodicity: the edge warp
* is periodic with period S, so tiles interlock without gaps or overlap, and the
* amplitude is clamped to 0.38*S to prevent self-overlap. These tests check both
* claims hold, rather than just eyeballing the rendered pattern.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { escher } from "../escher.js";

const bumpTypeArb = fc.constantFrom("wave", "zigzag", "notch");
const sizeArb = fc.double({ min: 20, max: 120, noNaN: true });
// Domain matches the generator contract (docs/generator-contract.md): pixel
// coordinates in [0, CANVAS.WIDTH] x [0, CANVAS.HEIGHT].
const coordArb = fc.double({ min: 0, max: 600, noNaN: true });

// Mirrors escher.js's _bump so tests can predict where the warped column/row
// boundary actually falls, and steer clear of it — "which side of a boundary did
// floating-point rounding put us on" is not the thing these tests are checking.
function bump(t, type) {
   switch (type) {
      case "wave":   return Math.sin(Math.PI * 2 * t);
      case "zigzag": return t < 0.25 ? 4 * t : t < 0.75 ? 2 - 4 * t : 4 * t - 4;
      case "notch":  return Math.tanh(8 * Math.sin(Math.PI * 2 * t));
      default:       return Math.sin(Math.PI * 2 * t);
   }
}

function fracDistToBoundary(v, size) {
   const m = ((v % size) + size) % size;
   return Math.min(m, size - m) / size;
}

describe("escher: algorithm-specific invariants", () => {
   it("is periodic with period 2*tileSize in x and in y (checkerboard repeats every 2 tiles)", () => {
      fc.assert(
         fc.property(coordArb, coordArb, sizeArb, bumpTypeArb, (x, y, tileSize, bumpType) => {
            const A = tileSize * 0.3;
            const dx = A * bump((((y % tileSize) + tileSize) % tileSize) / tileSize, bumpType);
            const dy = A * bump((((x % tileSize) + tileSize) % tileSize) / tileSize, bumpType);
            fc.pre(fracDistToBoundary(x - dx, tileSize) > 1e-6);
            fc.pre(fracDistToBoundary(y - dy, tileSize) > 1e-6);

            const params = { tileSize, bumpAmp: A, bumpType };
            const base = escher(x, y, params);
            expect(escher(x + 2 * tileSize, y, params)).toBe(base);
            expect(escher(x, y + 2 * tileSize, params)).toBe(base);
         })
      );
   });

   it("crossing one tile width always flips the tone (adjacent tiles alternate)", () => {
      fc.assert(
         fc.property(coordArb, coordArb, sizeArb, bumpTypeArb, (x, y, tileSize, bumpType) => {
            const A = tileSize * 0.3;
            const dx = A * bump((((y % tileSize) + tileSize) % tileSize) / tileSize, bumpType);
            fc.pre(fracDistToBoundary(x - dx, tileSize) > 1e-6);

            const params = { tileSize, bumpAmp: A, bumpType };
            const base = escher(x, y, params);
            expect(escher(x + tileSize, y, params)).toBe(-base);
         })
      );
   });

   it("amplitude is clamped to 0.38*tileSize: any bumpAmp beyond that gives an identical result", () => {
      fc.assert(
         fc.property(
            coordArb, coordArb, sizeArb, bumpTypeArb,
            fc.double({ min: 0.38, max: 5, noNaN: true }),
            fc.double({ min: 0.38, max: 5, noNaN: true }),
            (x, y, tileSize, bumpType, factorA, factorB) => {
               const a = escher(x, y, { tileSize, bumpType, bumpAmp: tileSize * factorA });
               const b = escher(x, y, { tileSize, bumpType, bumpAmp: tileSize * factorB });
               expect(a).toBe(b);
            }
         )
      );
   });
});
