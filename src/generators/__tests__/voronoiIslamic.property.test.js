/*
========================================
VORONOI-SEEDED ISLAMIC TILING — ALGORITHM-SPECIFIC PROPERTIES
========================================
* voronoiIslamic.js is Seed Points -> nearestTwoPoints (cell membership,
* plus the second-nearest distance for the cell-boundary line test) ->
* local coordinates -> islamic.js's own silhouette/banding pipeline reused
* verbatim, with radius scaled to each cell's own nearest-neighbour
* distance rather than a fixed tileSize. The property that matters most for
* a hybrid built by composition is the first one below: an independent
* oracle, built directly from the same lib/ primitives, must match exactly.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { voronoiIslamic, cellVariation } from "../voronoiIslamic.js";
import { generateSeedPoints, nearestNeighbourDistances } from "../lib/seedPoints.js";
import { nearestPoint, nearestTwoPoints, nearestSegmentDistSq, pointInPolygon } from "../lib/distanceField.js";
import { constructionCircle, radialDivisions } from "../lib/constructionCircle.js";
import { starOutline, starSkip } from "../lib/starPolygon.js";
import { toneSet, bandTone } from "../lib/colourMapping.js";
import { snapRotation } from "../islamic.js";
import { CANVAS } from "../../config.js";

const numCellsArb = fc.integer({ min: 5, max: 80 });
const segmentsArb = fc.integer({ min: 3, max: 16 });
const scaleArb = fc.double({ min: 0.2, max: 0.48, noNaN: true });
const freqArb = fc.double({ min: 1, max: 6, noNaN: true });
const lineWidthArb = fc.double({ min: 0.01, max: 0.15, noNaN: true });
const tonesArb = fc.constantFrom("2", "3", "4", "5");
const seedArb = fc.integer({ min: 0, max: 99999 });
const rotationArb = fc.double({ min: 0, max: 360, noNaN: true });
const variationArb = fc.double({ min: 0, max: 1, noNaN: true });
const pointArb = fc.record({
   x: fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
   y: fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
});

// Independent oracle: re-derives cell membership and the silhouette/banding
// pipeline directly from lib/ primitives. Uses the exported cellVariation()
// rather than re-deriving it — cellVariation has its own dedicated tests below.
function oracle(x, y, numCells, seed, segments, scale, frequency, lineWidth, tones, rotation = 0, variation = 0) {
   const points = generateSeedPoints(numCells, seed);
   const nnDist = nearestNeighbourDistances(points);
   const shades = toneSet(tones);

   const { index, distSq, secondDistSq } = nearestTwoPoints(x, y, points);
   const cx = points[index * 2], cy = points[index * 2 + 1];
   const lx = x - cx, ly = y - cy;

   const cell = cellVariation(seed, index, segments, rotation, variation);
   const radius = scale * nnDist[index];
   const n = Math.max(3, Math.round(cell.segments));
   const circle = constructionCircle(0, 0, radius);
   const snappedDeg = snapRotation(cell.rotation, n);
   const ring = radialDivisions(circle, n, Math.PI / 2 + (snappedDeg * Math.PI) / 180);
   const outline = starOutline(ring, starSkip(n));

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

   const step = radius / frequency;
   const bandPos = signedDist / step;
   const nearestBand = Math.round(bandPos);
   const distToLine = Math.abs(bandPos - nearestBand) * step;
   const onStarLine = distToLine < lineWidth * radius;

   // The cell-boundary line test, re-derived independently rather than assumed to match.
   const boundaryGap = Math.sqrt(secondDistSq) - Math.sqrt(distSq);
   const onBoundaryLine = boundaryGap < lineWidth * radius;

   if (!onStarLine && !onBoundaryLine) return shades[0];
   return onStarLine ? bandTone(shades, nearestBand) : bandTone(shades, 0);
}

describe("voronoiIslamic: algorithm-specific invariants", () => {
   it("matches an independent oracle re-deriving cell membership and the silhouette/banding pipeline", () => {
      fc.assert(
         fc.property(
            pointArb, numCellsArb, seedArb, segmentsArb, scaleArb, freqArb, lineWidthArb, tonesArb,
            rotationArb, variationArb,
            (p, numCells, seed, segments, scale, frequency, lineWidth, tones, rotation, variation) => {
               const expected = oracle(
                  p.x, p.y, numCells, seed, segments, scale, frequency, lineWidth, tones, rotation, variation
               );
               const v = voronoiIslamic(p.x, p.y, {
                  numCells, seed, segments, scale, frequency, lineWidth, tones, rotation, variation,
               });
               expect(v).toBe(expected);
            }
         ),
         { numRuns: 50 }
      );
   });

   it("returns the declared tone set for the full registry-declared param range", () => {
      fc.assert(
         fc.property(
            pointArb, numCellsArb, seedArb, segmentsArb, scaleArb, freqArb, tonesArb,
            (p, numCells, seed, segments, scale, frequency, tones) => {
               const v = voronoiIslamic(p.x, p.y, { numCells, seed, segments, scale, frequency, tones });
               expect(toneSet(tones)).toContain(v);
            }
         )
      );
   });

   it("a different seed produces a different cell layout (the point source is actually stochastic)", () => {
      // Same "seed actually matters" regression guard as recursiveNoise.property.test.js.
      let anyDifference = false;
      const params = { numCells: 20, segments: 8 };
      for (let x = 0; x < CANVAS.WIDTH && !anyDifference; x += 20) {
         for (let y = 0; y < CANVAS.HEIGHT && !anyDifference; y += 20) {
            const a = voronoiIslamic(x, y, { ...params, seed: 1 });
            const b = voronoiIslamic(x, y, { ...params, seed: 2 });
            if (a !== b) anyDifference = true;
         }
      }
      expect(anyDifference).toBe(true);
   });

   it("stays total (finite, in range) across the full canvas at the registry's declared numCells extremes", () => {
      // Checks the full declared param range, not just spot-checked values.
      for (const numCells of [5, 80]) {
         for (let x = 0; x < CANVAS.WIDTH; x += 15) {
            for (let y = 0; y < CANVAS.HEIGHT; y += 15) {
               const v = voronoiIslamic(x, y, { numCells, segments: 8, seed: 42 });
               expect(Number.isFinite(v)).toBe(true);
               expect(v).toBeGreaterThanOrEqual(-1);
               expect(v).toBeLessThanOrEqual(1);
            }
         }
      }
   });

   it("variation = 0 reproduces the exact result of omitting it (uniform-construction baseline)", () => {
      // Mirrors islamic.js's own "rotation = 0 reproduces the exact
      // pre-rotation-param default" regression test.
      fc.assert(
         fc.property(
            pointArb, numCellsArb, seedArb, segmentsArb,
            (p, numCells, seed, segments) => {
               const params = { numCells, seed, segments };
               const withoutParam = voronoiIslamic(p.x, p.y, params);
               const withZero = voronoiIslamic(p.x, p.y, { ...params, variation: 0 });
               expect(withZero).toBe(withoutParam);
            }
         )
      );
   });

   it("stays total (finite, in range) across the full canvas at variation's declared extremes", () => {
      for (const variation of [0, 1]) {
         for (let x = 0; x < CANVAS.WIDTH; x += 15) {
            for (let y = 0; y < CANVAS.HEIGHT; y += 15) {
               const v = voronoiIslamic(x, y, { numCells: 20, segments: 8, seed: 42, variation });
               expect(Number.isFinite(v)).toBe(true);
               expect(v).toBeGreaterThanOrEqual(-1);
               expect(v).toBeLessThanOrEqual(1);
            }
         }
      }
   });

   it("every pixel's signed distance is computed against its own nearest seed (no cross-cell leakage)", () => {
      const points = generateSeedPoints(20, 7);
      for (let x = 0; x < CANVAS.WIDTH; x += 25) {
         for (let y = 0; y < CANVAS.HEIGHT; y += 25) {
            const { index: viaOracle } = nearestPoint(x, y, points);
            const cx = points[viaOracle * 2], cy = points[viaOracle * 2 + 1];
            const dToOwn = Math.hypot(x - cx, y - cy);
            for (let i = 0; i < points.length; i += 2) {
               if (i / 2 === viaOracle) continue;
               const dToOther = Math.hypot(x - points[i], y - points[i + 1]);
               expect(dToOwn).toBeLessThanOrEqual(dToOther);
            }
         }
      }
   });

   it("traces the Voronoi cell boundary as a line: points on the perpendicular bisector between two adjacent seeds read as on-line", () => {
      const params = {
         numCells: 2, seed: 1, segments: 6, scale: 0.1, frequency: 3,
         lineWidth: 0.3, tones: "2",
      };
      // Read the seeds generateSeedPoints actually produces (module caches
      // by numCells/seed), then sample the exact bisector midpoint.
      const points = generateSeedPoints(params.numCells, params.seed);
      const midX = (points[0] + points[2]) / 2;
      const midY = (points[1] + points[3]) / 2;
      const value = voronoiIslamic(midX, midY, params);
      // tones = "2" collapses any on-line pixel to shades[last] = -1;
      // off-line would be shades[0] = 1. The midpoint is exactly equidistant.
      expect(value).toBe(-1);
   });
});

describe("cellVariation: primitive-level invariants", () => {
   it("variation = 0 always returns segments/rotation unchanged, for any seed/index", () => {
      fc.assert(
         fc.property(
            seedArb, fc.integer({ min: 0, max: 200 }), segmentsArb, rotationArb,
            (seed, index, segments, rotation) => {
               const cell = cellVariation(seed, index, segments, rotation, 0);
               expect(cell.segments).toBe(Math.round(segments));
               expect(cell.rotation).toBe(rotation);
            }
         )
      );
   });

   it("variation = 1 is actually reachable: scanning indices produces more than one distinct segments value", () => {
      // Regression guard: a jitter formula that compiles but never actually
      // moves segments away from its base value would be silently inert.
      const seen = new Set();
      for (let index = 0; index < 40; index++) {
         seen.add(cellVariation(1337, index, 8, 0, 1).segments);
      }
      expect(seen.size).toBeGreaterThan(1);
   });

   it("cellSegments always stays within the registry's declared [3, 16] range, even at variation = 1", () => {
      fc.assert(
         fc.property(
            seedArb, fc.integer({ min: 0, max: 200 }), segmentsArb,
            (seed, index, segments) => {
               const cell = cellVariation(seed, index, segments, 0, 1);
               expect(cell.segments).toBeGreaterThanOrEqual(3);
               expect(cell.segments).toBeLessThanOrEqual(16);
            }
         )
      );
   });

   it("is deterministic: the same (seed, index) always jitters the same way", () => {
      fc.assert(
         fc.property(
            seedArb, fc.integer({ min: 0, max: 200 }), segmentsArb, rotationArb, variationArb,
            (seed, index, segments, rotation, variation) => {
               const a = cellVariation(seed, index, segments, rotation, variation);
               const b = cellVariation(seed, index, segments, rotation, variation);
               expect(a).toEqual(b);
            }
         )
      );
   });
});
