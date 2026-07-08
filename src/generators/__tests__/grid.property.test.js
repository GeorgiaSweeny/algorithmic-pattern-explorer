/*
========================================
GRID — ALGORITHM-SPECIFIC PROPERTIES
========================================
* grid.js's comments claim each shape is a *proper colouring*: no two tiles that
* share an edge get the same tone. These tests hold that claim for every shape
* grid.js implements (square, diamond, hexagon, triangle, brick), constructing
* points from an explicit (cell, offset-within-cell) description rather than raw
* coordinates so tests land predictably inside a tile instead of drifting onto a
* boundary by chance (see fracDistToBoundary below, and its use throughout).
*
* One nuance the tests respect rather than paper over: grid.js's own comment
* only claims hexagon's 3-tone colouring is "proper" — 2-tone hexagon is not
* (hexagonal-tiling adjacency has chromatic number 3, like its dual triangular
* lattice, so no 2-colouring of it can be proper). The hexagon test below checks
* only the 3-tone claim, matching what the source actually asserts.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { grid } from "../grid.js";

const tonesArb = fc.constantFrom("2", "3");
const sizeArb = fc.double({ min: 10, max: 120, noNaN: true });
// Domain matches the generator contract (docs/generator-contract.md): pixel
// coordinates in [0, CANVAS.WIDTH] x [0, CANVAS.HEIGHT]. Values outside this range
// (e.g. subnormal negatives near zero) can trip sign-dependent floor() behaviour
// that has nothing to do with the colouring algorithm itself.
const coordArb = fc.double({ min: 0, max: 600, noNaN: true });

// Distance from x to the nearest multiple of size, as a fraction of size. Used to
// keep boundary-crossing tests away from points that are already exactly on (or a
// float rounding error away from) a cell boundary, where the "which side did we
// land on" question is a floating-point precision question, not an algorithm one.
function fracDistToBoundary(x, size) {
   const m = ((x % size) + size) % size;
   return Math.min(m, size - m) / size;
}

describe("grid: algorithm-specific invariants", () => {
   it("square: crossing a column or row boundary always changes tone", () => {
      // Same constructive approach as the diamond test below: build (x, y) from a
      // (cell, offset-within-cell) pair so points are safely away from a boundary
      // by construction, instead of generating raw doubles and rejecting the ones
      // that land too close to one.
      fc.assert(
         fc.property(
            fc.integer({ min: 0, max: 20 }),
            fc.integer({ min: 0, max: 20 }),
            fc.double({ min: 0.1, max: 0.9, noNaN: true }),
            fc.double({ min: 0.1, max: 0.9, noNaN: true }),
            sizeArb,
            tonesArb,
            (cellX, cellY, offsetX, offsetY, tileSize, tones) => {
               const x = (cellX + offsetX) * tileSize;
               const y = (cellY + offsetY) * tileSize;
               const here  = grid(x, y, { shape: "square", tileSize, tones });
               const right = grid(x + tileSize, y, { shape: "square", tileSize, tones });
               const down  = grid(x, y + tileSize, { shape: "square", tileSize, tones });
               expect(right).not.toBe(here);
               expect(down).not.toBe(here);
            }
         )
      );
   });

   it("square: is periodic with period n * tileSize (n = number of tones)", () => {
      // tileSize is restricted to integers here: with an arbitrary double tileSize,
      // (n * tileSize) / tileSize is not always bit-exactly n (float rounding), which
      // would fail the assertion for a reason that has nothing to do with the
      // colouring algorithm. Real tile sizes are always whole pixels in practice.
      const intSizeArb = fc.integer({ min: 10, max: 120 });
      fc.assert(
         fc.property(coordArb, coordArb, intSizeArb, tonesArb, (x, y, tileSize, tones) => {
            const n = tones === "3" ? 3 : 2;
            const here = grid(x, y, { shape: "square", tileSize, tones });
            const shifted = grid(x + n * tileSize, y, { shape: "square", tileSize, tones });
            expect(shifted).toBe(here);
         })
      );
   });

   it("diamond: crossing the rotated-frame boundary always changes tone", () => {
      // Construct (x, y) from an explicit (cell, offset-within-cell) pair in the
      // rotated u/v frame so points land safely away from boundaries by
      // construction, rather than generating raw doubles and filtering out the
      // (very common, since fast-check probes corner values like 0 deliberately)
      // near-boundary cases after the fact.
      fc.assert(
         fc.property(
            fc.integer({ min: -20, max: 20 }),
            fc.integer({ min: -20, max: 20 }),
            fc.double({ min: 0.1, max: 0.9, noNaN: true }),
            fc.double({ min: 0.1, max: 0.9, noNaN: true }),
            sizeArb,
            tonesArb,
            (cellU, cellV, offsetU, offsetV, tileSize, tones) => {
               const u = (cellU + offsetU) * tileSize;
               const v = (cellV + offsetV) * tileSize;
               const x = (u + v) / Math.SQRT2;
               const y = (u - v) / Math.SQRT2;
               const step = tileSize / Math.SQRT2; // moves u by one tileSize, leaves v unchanged

               const here  = grid(x, y, { shape: "diamond", tileSize, tones });
               const along = grid(x + step, y + step, { shape: "diamond", tileSize, tones });
               expect(along).not.toBe(here);
            }
         )
      );
   });

   it("hexagon: only ever returns a value from the declared tone set", () => {
      fc.assert(
         fc.property(coordArb, coordArb, sizeArb, tonesArb, (x, y, tileSize, tones) => {
            const v = grid(x, y, { shape: "hexagon", tileSize, tones });
            const declared = tones === "3" ? [1, 0, -1] : [1, -1];
            expect(declared).toContain(v);
         })
      );
   });

   it("hexagon: 3-tone colouring is proper (adjacent hexes always differ)", () => {
      // Cube/axial coordinates: inverting _hexagon's forward transform gives the
      // exact pixel centre of cell (q, r), landing well clear of any rounding
      // boundary. The six offsets are the standard axial hex-neighbour directions.
      const hexNeighbours = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
      function hexCentre(q, r, size) {
         return [size * Math.sqrt(3) * (q + r / 2), 1.5 * size * r];
      }
      fc.assert(
         fc.property(
            fc.integer({ min: -20, max: 20 }),
            fc.integer({ min: -20, max: 20 }),
            fc.constantFrom(...hexNeighbours),
            sizeArb,
            (q, r, [dq, dr], tileSize) => {
               const [x1, y1] = hexCentre(q, r, tileSize);
               const [x2, y2] = hexCentre(q + dq, r + dr, tileSize);
               const here  = grid(x1, y1, { shape: "hexagon", tileSize, tones: "3" });
               const there = grid(x2, y2, { shape: "hexagon", tileSize, tones: "3" });
               expect(there).not.toBe(here);
            }
         )
      );
   });

   it("triangle: 3-tone colouring is proper for the three adjacencies grid.js documents", () => {
      // U(si,ti) touches D(si,ti), D(si-1,ti) and D(si,ti-1) (grid.js's comment on
      // _triangle). Building one representative point safely inside each named
      // region (via the oblique-coordinate inverse x = size*(s+t/2), y = size*t*sqrt3/2)
      // checks the documented adjacency claim directly.
      function toXY(s, t, size) {
         return [size * (s + t / 2), size * t * (Math.sqrt(3) / 2)];
      }
      fc.assert(
         fc.property(
            fc.integer({ min: -20, max: 20 }),
            fc.integer({ min: -20, max: 20 }),
            sizeArb,
            (si, ti, tileSize) => {
               const [xUp, yUp]     = toXY(si + 0.2, ti + 0.2, tileSize);       // up, sf+tf=0.4
               const [xSame, ySame] = toXY(si + 0.75, ti + 0.75, tileSize);     // down, same cell
               const [xLeft, yLeft] = toXY(si - 1 + 0.75, ti + 0.75, tileSize); // down, cell (si-1,ti)
               const [xDown, yDown] = toXY(si + 0.75, ti - 1 + 0.75, tileSize); // down, cell (si,ti-1)

               const up   = grid(xUp, yUp, { shape: "triangle", tileSize, tones: "3" });
               const same = grid(xSame, ySame, { shape: "triangle", tileSize, tones: "3" });
               const left = grid(xLeft, yLeft, { shape: "triangle", tileSize, tones: "3" });
               const down = grid(xDown, yDown, { shape: "triangle", tileSize, tones: "3" });

               expect(same).not.toBe(up);
               expect(left).not.toBe(up);
               expect(down).not.toBe(up);
            }
         )
      );
   });

   it("triangle: is bipartite by orientation (any up triangle differs from any down triangle)", () => {
      // grid.js's comment: "up/down triangles are never mutually adjacent" — the
      // 2-tone scheme relies on orientation alone. sf/tf are sampled independently
      // within the up half (sum < 1) and the down half (sum >= 1) with margin from
      // the sf+tf=1 boundary, so this tests the orientation claim, not rounding at it.
      function toXY(s, t, size) {
         return [size * (s + t / 2), size * t * (Math.sqrt(3) / 2)];
      }
      // sf/tf must clear margin from three boundaries: 0, 1, and the sf+tf=1
      // diagonal — the recomputed s, t in _triangle go through a second, independent
      // Math.sqrt(3) evaluation, so even a value nominally at sf=0 can round-trip to
      // a tiny negative residual and have floor() flip it into the wrong cell.
      // [0.05, 0.4]: away from 0, and sf+tf caps at 0.8 (up).
      const fracArb = fc.double({ min: 0.05, max: 0.4, noNaN: true });
      // [0.05, 0.3] shifted by +0.55: sf, tf in [0.6, 0.85], sf+tf in [1.2, 1.7] (down).
      const fracDownArb = fc.double({ min: 0.05, max: 0.3, noNaN: true });
      fc.assert(
         fc.property(
            fc.integer({ min: -20, max: 20 }), fc.integer({ min: -20, max: 20 }),
            fracArb, fracArb,
            fc.integer({ min: -20, max: 20 }), fc.integer({ min: -20, max: 20 }),
            fracDownArb, fracDownArb,
            sizeArb,
            (si1, ti1, sfUp, tfUp, si2, ti2, sfDown, tfDown, tileSize) => {
               const [xUp, yUp] = toXY(si1 + sfUp, ti1 + tfUp, tileSize);
               const [xDown, yDown] = toXY(si2 + 0.55 + sfDown, ti2 + 0.55 + tfDown, tileSize);

               const up = grid(xUp, yUp, { shape: "triangle", tileSize, tones: "2" });
               const down = grid(xDown, yDown, { shape: "triangle", tileSize, tones: "2" });
               expect(down).not.toBe(up);
            }
         )
      );
   });

   it("brick: 3-tone colouring is proper for same-row and directly-below neighbours", () => {
      // Bricks tile the plane with no gaps (row = floor(y/bh), col = floor((x+shift)/bw)
      // both partition contiguously), so (x+bw, y) in the same row and (x, y+bh) in the
      // row below are always physically touching regardless of the running-bond shift.
      // grid.js's comment only claims properness for the fineCol (3-tone) scheme — 2-tone's
      // plain (col+row)%2 touches the same "2 neighbours per side row" issue the comment
      // describes and is not guaranteed proper vertically, so this checks 3-tone only.
      fc.assert(
         fc.property(
            fc.integer({ min: 0, max: 20 }),  // row
            fc.integer({ min: -20, max: 20 }), // col
            fc.double({ min: 0.1, max: 0.9, noNaN: true }), // fraction within brick, x
            fc.double({ min: 0.1, max: 0.9, noNaN: true }), // fraction within brick, y
            sizeArb,
            (row, col, fx, fy, tileSize) => {
               const bw = tileSize * 2, bh = tileSize;
               const shift = (row % 2) * (bw / 2);
               const x = (col + fx) * bw - shift;
               const y = (row + fy) * bh;
               const tones = "3";

               const here  = grid(x, y, { shape: "brick", tileSize, tones });
               const right = grid(x + bw, y, { shape: "brick", tileSize, tones });
               const below = grid(x, y + bh, { shape: "brick", tileSize, tones });
               expect(right).not.toBe(here);
               expect(below).not.toBe(here);
            }
         )
      );
   });

   it("brick: 2-tone same-row neighbours always differ (vertical neighbours are not guaranteed to)", () => {
      // Documents the gap found above: horizontal parity always flips, but the
      // plain (col+row)%2 scheme can assign the same tone to vertically-touching
      // bricks once the running-bond shift is taken into account.
      fc.assert(
         fc.property(
            fc.integer({ min: 0, max: 20 }),
            fc.integer({ min: -20, max: 20 }),
            fc.double({ min: 0.1, max: 0.9, noNaN: true }),
            fc.double({ min: 0.1, max: 0.9, noNaN: true }),
            sizeArb,
            (row, col, fx, fy, tileSize) => {
               const bw = tileSize * 2, bh = tileSize;
               const shift = (row % 2) * (bw / 2);
               const x = (col + fx) * bw - shift;
               const y = (row + fy) * bh;
               const tones = "2";

               const here  = grid(x, y, { shape: "brick", tileSize, tones });
               const right = grid(x + bw, y, { shape: "brick", tileSize, tones });
               expect(right).not.toBe(here);
            }
         )
      );
   });
});
