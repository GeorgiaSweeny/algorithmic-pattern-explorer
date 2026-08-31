/*
========================================
ISLAMIC — ALGORITHM-SPECIFIC PROPERTIES
========================================
* islamic.js is a Grid/hex-lattice lookup (tile centroid) feeding a signed
* Distance Field search against a single star-polygon silhouette
* (lib/starPolygon.js's starOutline, built from a Radial Divisions ring) —
* one construction, banded by frequency/tones, no RNG. The properties below
* check what that construction should guarantee: n-fold rotational symmetry
* about each tile centroid, exact periodicity across tile boundaries, and
* that islamic() is exactly the signed-distance line test its composition
* claims — for both tile shapes, down to segments = 3.
*
* Kaplan, C.S. & Salesin, D.H. (2004). "Islamic Star Patterns in Absolute
* Geometry." ACM Transactions on Graphics, 23(2), 97-119 — the academic
* source for this "polygons in contact" construction. The n-fold rotational
* symmetry property tested below is that paper's own defining property of
* a single construction-circle-derived star motif.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { islamic, snapRotation } from "../islamic.js";
import { constructionCircle, radialDivisions } from "../lib/constructionCircle.js";
import { starOutline, starSkip } from "../lib/starPolygon.js";
import { nearestSegmentDistSq, pointInPolygon } from "../lib/distanceField.js";
import { hexagonCentroid } from "../lib/latticeIndex.js";
import { toneSet, bandTone } from "../lib/colourMapping.js";

const tileSizeArb = fc.double({ min: 40, max: 200, noNaN: true });
const segmentsArb = fc.integer({ min: 3, max: 16 });
const freqArb = fc.double({ min: 1, max: 6, noNaN: true });
const lineWidthArb = fc.double({ min: 0.01, max: 0.15, noNaN: true });
const scaleArb = fc.double({ min: 0.2, max: 0.48, noNaN: true });
const rotationArb = fc.double({ min: 0, max: 360, noNaN: true });
const tileShapeArb = fc.constantFrom("square", "hexagon");
const tonesArb = fc.constantFrom("2", "3", "4", "5");

function tileCentroid(tileShape, tileSize, col, row) {
   return tileShape === "hexagon"
      ? hexagonCentroid((col + 0.5) * tileSize, (row + 0.5) * tileSize, tileSize)
      : [(col + 0.5) * tileSize, (row + 0.5) * tileSize];
}

// A point safely inside a square tile, for the square-only periodicity test.
function squareTilePoint(tileSize, col, row, offsetX, offsetY) {
   const cx = (col + 0.5) * tileSize;
   const cy = (row + 0.5) * tileSize;
   return { x: cx + offsetX, y: cy + offsetY };
}

// Independent oracle re-deriving the silhouette + signed-distance line test
// from the lib/ primitives, rather than importing islamic.js's internals.
function oracle(lx, ly, tileSize, segments, frequency, lineWidth, tones, scale = 0.42, rotation = 0) {
   const shades = toneSet(tones);
   const radius = tileSize * scale;
   const n = Math.max(3, Math.round(segments));
   const circle = constructionCircle(0, 0, radius);
   const snappedDeg = snapRotation(rotation, n);
   // Base 90 degrees (tip at top) plus snapped rotation — see islamic.js.
   const points = radialDivisions(circle, n, Math.PI / 2 + (snappedDeg * Math.PI) / 180);
   const outline = starOutline(points, starSkip(n));

   const edgeCount = outline.length / 2;
   const edges = new Float32Array(edgeCount * 4);
   for (let i = 0; i < edgeCount; i++) {
      const j = (i + 1) % edgeCount;
      edges[i * 4] = outline[i * 2];
      edges[i * 4 + 1] = outline[i * 2 + 1];
      edges[i * 4 + 2] = outline[j * 2];
      edges[i * 4 + 3] = outline[j * 2 + 1];
   }

   const dist = Math.sqrt(nearestSegmentDistSq(lx, ly, edges));
   const inside = pointInPolygon(lx, ly, outline);
   const signedDist = inside ? -dist : dist;

   const step = radius / frequency; // relative to radius — see islamic.js
   const bandPos = signedDist / step;
   const nearestBand = Math.round(bandPos);
   const distToLine = Math.abs(bandPos - nearestBand) * step;
   // Independent of step/frequency — see islamic.js's header comment.
   const onLine = distToLine < lineWidth * radius;

   if (!onLine) return shades[0];
   return bandTone(shades, nearestBand);
}

describe("islamic: algorithm-specific invariants", () => {
   it("returns the declared tone set (both tile shapes, segments 3 and up, tones 2-5)", () => {
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: 600, noNaN: true }),
            fc.double({ min: 0, max: 600, noNaN: true }),
            tileSizeArb, segmentsArb, freqArb,
            tonesArb,
            tileShapeArb,
            (x, y, tileSize, segments, frequency, tones, tileShape) => {
               const v = islamic(x, y, { tileSize, segments, frequency, tones, tileShape });
               expect(toneSet(tones)).toContain(v);
            }
         )
      );
   });

   it("every declared tone (2-5) is actually reachable, not just the first and last (regression: middle tones used to never be read)", () => {
      // A prior version always returned shades[shades.length - 1] for any
      // line pixel, so toneSet("3")'s middle value was never produced.
      // frequency = 6 (max) gives small enough echo spacing that every
      // echoTones index cycles into reach within one tile's scan area.
      const tileSize = 100;
      for (const tones of ["2", "3", "4", "5"]) {
         const params = { tileSize, segments: 8, frequency: 6, tones };
         const seen = new Set();
         for (let y = 0; y < tileSize; y++) {
            for (let x = 0; x < tileSize; x++) seen.add(islamic(x, y, params));
         }
         for (const shade of toneSet(tones)) {
            expect(seen.has(shade), `tones="${tones}" never produced shade ${shade}`).toBe(true);
         }
      }
   });

   it("is exactly periodic across tile boundaries (square tiling)", () => {
      fc.assert(
         fc.property(
            fc.integer({ min: -3, max: 3 }), fc.integer({ min: -3, max: 3 }),
            fc.double({ min: -18, max: 18, noNaN: true }),
            fc.double({ min: -18, max: 18, noNaN: true }),
            tileSizeArb, segmentsArb, freqArb,
            (col, row, offsetX, offsetY, tileSize, segments, frequency) => {
               const p = squareTilePoint(tileSize, col, row, offsetX, offsetY);
               const params = { tileSize, segments, frequency };
               const here = islamic(p.x, p.y, params);
               const there = islamic(p.x + tileSize, p.y, params);
               expect(there).toBeCloseTo(here, 6);
            }
         )
      );
   });

   it("is rotationally symmetric under a 360/segments turn about the tile centroid (both tile shapes)", () => {
      // Each tile's medallion is self-contained (radius capped well short of
      // the tile's own half-width), so there's no neighbouring-tile
      // interaction to break exact n-fold symmetry.
      fc.assert(
         fc.property(
            fc.integer({ min: -2, max: 2 }), fc.integer({ min: -2, max: 2 }),
            fc.double({ min: 2, max: 15, noNaN: true }),
            fc.double({ min: 0, max: 2 * Math.PI, noNaN: true }),
            tileSizeArb, segmentsArb, freqArb, tileShapeArb,
            (col, row, r, theta, tileSize, segments, frequency, tileShape) => {
               const [cx, cy] = tileCentroid(tileShape, tileSize, col, row);
               const step = (2 * Math.PI) / Math.max(3, Math.round(segments));
               const params = { tileSize, segments, frequency, tileShape };

               const p1 = islamic(cx + r * Math.cos(theta), cy + r * Math.sin(theta), params);
               const p2 = islamic(cx + r * Math.cos(theta + step), cy + r * Math.sin(theta + step), params);
               expect(p2).toBeCloseTo(p1, 5);
            }
         )
      );
   });

   it("matches an independent oracle re-deriving the silhouette and signed-distance line test (square tiling)", () => {
      fc.assert(
         fc.property(
            fc.integer({ min: -2, max: 2 }), fc.integer({ min: -2, max: 2 }),
            fc.double({ min: -18, max: 18, noNaN: true }),
            fc.double({ min: -18, max: 18, noNaN: true }),
            tileSizeArb, segmentsArb, freqArb, lineWidthArb,
            tonesArb, scaleArb, rotationArb,
            (col, row, offsetX, offsetY, tileSize, segments, frequency, lineWidth, tones, scale, rotation) => {
               const p = squareTilePoint(tileSize, col, row, offsetX, offsetY);
               const expected = oracle(offsetX, offsetY, tileSize, segments, frequency, lineWidth, tones, scale, rotation);
               const v = islamic(p.x, p.y, { tileSize, segments, frequency, lineWidth, tones, scale, rotation });
               expect(v).toBe(expected);
            }
         )
      );
   });

   it("scale resizes the medallion (regression: it used to be a hardcoded 0.42 constant)", () => {
      // The medallion boundary is where signedDist crosses 0, approximated
      // here as the first on-line pixel walking outward from the centroid.
      const tileSize = 100;
      function boundaryDistance(scale) {
         const params = { tileSize, segments: 8, frequency: 3, lineWidth: 0.02, scale };
         for (let r = 1; r < tileSize / 2; r++) {
            if (islamic(tileSize / 2 + r, tileSize / 2, params) === -1) return r;
         }
         return null;
      }
      const small = boundaryDistance(0.2);
      const large = boundaryDistance(0.48);
      expect(small).not.toBeNull();
      expect(large).not.toBeNull();
      expect(large).toBeGreaterThan(small * 1.5);
   });

   it("lineWidth controls line thickness independently of frequency (regression: they used to be coupled)", () => {
      // Before lineWidth existed, thickness was a fixed fraction of the echo
      // spacing (step = radius / frequency), so frequency silently changed
      // thickness too. Checks the on-line fraction of a centre scanline
      // grows with lineWidth at a fixed frequency.
      const tileSize = 100;
      function onLineFraction(frequency, lineWidth) {
         const params = { tileSize, segments: 8, frequency, lineWidth };
         let onLineCount = 0;
         for (let x = 0; x < tileSize; x++) {
            if (islamic(x, 50, params) === -1) onLineCount++;
         }
         return onLineCount / tileSize;
      }

      const thin = onLineFraction(3, 0.02);
      const thick = onLineFraction(3, 0.14);
      expect(thick).toBeGreaterThan(thin * 2);
   });

   it("rotation = 0 reproduces the exact pre-rotation-param default", () => {
      const tileSize = 100;
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: tileSize, noNaN: true }),
            fc.double({ min: 0, max: tileSize, noNaN: true }),
            segmentsArb, freqArb,
            (x, y, segments, frequency) => {
               const withoutParam = islamic(x, y, { tileSize, segments, frequency });
               const withZero = islamic(x, y, { tileSize, segments, frequency, rotation: 0 });
               expect(withZero).toBe(withoutParam);
            }
         )
      );
   });

   it("rotating by an exact multiple of 360/segments is an identity (the shape's own rotational symmetry)", () => {
      // A fully n-fold-symmetric point set maps onto itself under any
      // multiple of its own 360/n rotation — why `rotation` is snapped to
      // 180/segments, not 360/segments (that would be a visible no-op).
      const tileSize = 100;
      fc.assert(
         fc.property(
            fc.double({ min: 0, max: tileSize, noNaN: true }),
            fc.double({ min: 0, max: tileSize, noNaN: true }),
            segmentsArb, freqArb,
            fc.integer({ min: 1, max: 3 }),
            (x, y, segments, frequency, k) => {
               const n = Math.max(3, Math.round(segments));
               const params = { tileSize, segments, frequency };
               const base = islamic(x, y, params);
               const rotated = islamic(x, y, { ...params, rotation: k * (360 / n) });
               expect(rotated).toBe(base);
            }
         )
      );
   });

   it("rotating by 180/segments visibly changes the medallion (tip-up vs waist-up), except where the two look alike", () => {
      // Scans a whole tile for at least one differing pixel, rather than a
      // single sampled point that could land where the two happen to agree.
      const tileSize = 100;
      for (const segments of [4, 5, 6, 7, 8]) {
         const base = { tileSize, segments, frequency: 3, lineWidth: 0.03 };
         const rotated = { ...base, rotation: 180 / segments };
         let differs = false;
         for (let y = 0; y < tileSize && !differs; y++) {
            for (let x = 0; x < tileSize && !differs; x++) {
               if (islamic(x, y, base) !== islamic(x, y, rotated)) differs = true;
            }
         }
         expect(differs, `segments=${segments} looked identical after a 180/n rotation`).toBe(true);
      }
   });

   it("snapRotation rounds to the nearest multiple of 180/segments", () => {
      fc.assert(
         fc.property(
            fc.double({ min: -720, max: 720, noNaN: true }),
            segmentsArb,
            (rotationDeg, segments) => {
               const n = Math.max(3, Math.round(segments));
               const stepDeg = 180 / n;
               const snapped = snapRotation(rotationDeg, segments);
               const stepsFromZero = snapped / stepDeg;
               expect(stepsFromZero).toBeCloseTo(Math.round(stepsFromZero), 9);
               expect(Math.abs(snapped - rotationDeg)).toBeLessThanOrEqual(stepDeg / 2 + 1e-9);
            }
         )
      );
   });

   it("hex tiling: pixels an exact hex lattice period apart agree", () => {
      // hexagonCentroid's own lattice period, not a simple tileSize shift:
      // translating by one lattice basis vector maps every hex cell onto
      // another of the same shape, so islamic() must agree at both points.
      fc.assert(
         fc.property(
            fc.double({ min: -18, max: 18, noNaN: true }),
            fc.double({ min: -18, max: 18, noNaN: true }),
            tileSizeArb, segmentsArb, freqArb,
            (offsetX, offsetY, tileSize, segments, frequency) => {
               const x = 500 + offsetX, y = 500 + offsetY;
               const params = { tileSize, segments, frequency, tileShape: "hexagon" };
               const here = islamic(x, y, params);
               // One full horizontal lattice period (see lib/latticeIndex.js).
               const there = islamic(x + tileSize * Math.sqrt(3), y, params);
               expect(there).toBeCloseTo(here, 5);
            }
         )
      );
   });
});
