/*
========================================
GRID — ALGORITHM-SPECIFIC PROPERTIES
========================================
* grid.js's comments claim each shape is a *proper colouring*: no two tiles that
* share an edge get the same tone. These tests hold that claim for every shape
* grid.js implements (square, diamond, hexagon, triangle, brick), constructing
* points from an explicit (cell, offset-within-cell) description so tests land
* predictably inside a tile instead of drifting onto a boundary by chance.
*
* Hexagon's 2-tone colouring is not proper (hexagonal-tiling adjacency has
* chromatic number 3), so the hexagon/triangle/brick "proper" tests below
* check tones 3-5 only, with a separate test documenting the 2-tone case.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { grid } from "../grid.js";
import { toneSet } from "../lib/colourMapping.js";

const tonesArb = fc.constantFrom("2", "3", "4", "5");
// Tones counts where the shared mod-numShades formula applies (numShades = 2
// needs each shape's own simpler fallback — see lib/latticeIndex.js).
const properTonesArb = fc.constantFrom("3", "4", "5");
const sizeArb = fc.double({ min: 10, max: 120, noNaN: true });
// Matches the generator contract's pixel domain (docs/GENERATOR_CONTRACT.md).
const coordArb = fc.double({ min: 0, max: 600, noNaN: true });

describe("grid: algorithm-specific invariants", () => {
   it("square: crossing a column or row boundary always changes tone", () => {
      // Build (x, y) from a (cell, offset-within-cell) pair so points are
      // safely away from a boundary by construction.
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
      // Integer tileSize avoids float-rounding failures unrelated to the algorithm.
      const intSizeArb = fc.integer({ min: 10, max: 120 });
      fc.assert(
         fc.property(coordArb, coordArb, intSizeArb, tonesArb, (x, y, tileSize, tones) => {
            const n = Number(tones);
            const here = grid(x, y, { shape: "square", tileSize, tones });
            const shifted = grid(x + n * tileSize, y, { shape: "square", tileSize, tones });
            expect(shifted).toBe(here);
         })
      );
   });

   it("diamond: crossing the rotated-frame boundary always changes tone", () => {
      // Construct (x, y) from a (cell, offset-within-cell) pair in the rotated
      // u/v frame so points land safely away from boundaries by construction.
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
            expect(toneSet(tones)).toContain(v);
         })
      );
   });

   it("hexagon: colouring is proper for tones 3-5 (adjacent hexes always differ)", () => {
      // Inverting _hexagon's forward transform gives the exact pixel centre
      // of cell (q, r); offsets are the standard axial hex-neighbour directions.
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
            properTonesArb,
            (q, r, [dq, dr], tileSize, tones) => {
               const [x1, y1] = hexCentre(q, r, tileSize);
               const [x2, y2] = hexCentre(q + dq, r + dr, tileSize);
               const here  = grid(x1, y1, { shape: "hexagon", tileSize, tones });
               const there = grid(x2, y2, { shape: "hexagon", tileSize, tones });
               expect(there).not.toBe(here);
            }
         )
      );
   });

   it("triangle: colouring is proper for tones 3-5, for the three adjacencies grid.js documents", () => {
      // U(si,ti) touches D(si,ti), D(si-1,ti) and D(si,ti-1) (grid.js's _triangle).
      function toXY(s, t, size) {
         return [size * (s + t / 2), size * t * (Math.sqrt(3) / 2)];
      }
      fc.assert(
         fc.property(
            fc.integer({ min: -20, max: 20 }),
            fc.integer({ min: -20, max: 20 }),
            sizeArb,
            properTonesArb,
            (si, ti, tileSize, tones) => {
               const [xUp, yUp]     = toXY(si + 0.2, ti + 0.2, tileSize);       // up, sf+tf=0.4
               const [xSame, ySame] = toXY(si + 0.75, ti + 0.75, tileSize);     // down, same cell
               const [xLeft, yLeft] = toXY(si - 1 + 0.75, ti + 0.75, tileSize); // down, cell (si-1,ti)
               const [xDown, yDown] = toXY(si + 0.75, ti - 1 + 0.75, tileSize); // down, cell (si,ti-1)

               const up   = grid(xUp, yUp, { shape: "triangle", tileSize, tones });
               const same = grid(xSame, ySame, { shape: "triangle", tileSize, tones });
               const left = grid(xLeft, yLeft, { shape: "triangle", tileSize, tones });
               const down = grid(xDown, yDown, { shape: "triangle", tileSize, tones });

               expect(same).not.toBe(up);
               expect(left).not.toBe(up);
               expect(down).not.toBe(up);
            }
         )
      );
   });

   it("triangle: is bipartite by orientation (any up triangle differs from any down triangle)", () => {
      // grid.js: up/down triangles are never mutually adjacent — the 2-tone
      // scheme relies on orientation alone.
      function toXY(s, t, size) {
         return [size * (s + t / 2), size * t * (Math.sqrt(3) / 2)];
      }
      // sf/tf need margin from three boundaries (0, 1, sf+tf=1) since a second,
      // independent sqrt(3) evaluation inside _triangle can round-trip a value
      // nominally at a boundary into the wrong cell.
      const fracArb = fc.double({ min: 0.05, max: 0.4, noNaN: true }); // up: sf+tf <= 0.8
      const fracDownArb = fc.double({ min: 0.05, max: 0.3, noNaN: true }); // shifted +0.55: down
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

   it("brick: colouring is proper for tones 3-5, for same-row and directly-below neighbours", () => {
      // Bricks tile with no gaps, so (x+bw, y) and (x, y+bh) always touch
      // physically. grid.js only claims properness for the fineCol (>= 3
      // tones) scheme — 2-tone is not guaranteed proper vertically, so this
      // checks 3-5 only.
      fc.assert(
         fc.property(
            fc.integer({ min: 0, max: 20 }),  // row
            fc.integer({ min: -20, max: 20 }), // col
            fc.double({ min: 0.1, max: 0.9, noNaN: true }), // fraction within brick, x
            fc.double({ min: 0.1, max: 0.9, noNaN: true }), // fraction within brick, y
            sizeArb,
            properTonesArb,
            (row, col, fx, fy, tileSize, tones) => {
               const bw = tileSize * 2, bh = tileSize;
               const shift = (row % 2) * (bw / 2);
               const x = (col + fx) * bw - shift;
               const y = (row + fy) * bh;

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
