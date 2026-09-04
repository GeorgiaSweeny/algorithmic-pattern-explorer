/*
========================================
VORONOI-SEEDED ISLAMIC TILING V2 — ALGORITHM-SPECIFIC PROPERTIES
========================================
* voronoiIslamicV2.js's whole design claim is narrower than v1's: Voronoi's
* Seed Points + nearest-seed lookup takes over Grid's own job, and nothing
* downstream of that changes at all — islamic-svg.js's own ring
* construction (lib/polygonOffset.js) is reused verbatim, not adapted to
* each cell's own spacing (see voronoiIslamicV2.js's header for why that's
* islamic-svg.js's construction now, not islamic.js's plainer raster
* banding). Seed points are a plain Poisson-process scatter
* (lib/seedPoints.js's generateSeedPoints — the same primitive v1/voronoi.js
* use), not any grid-constrained placement. The property that matters most
* here is the first one below: an oracle built directly from the same lib/
* primitives voronoiIslamicV2.js itself uses (not routed through its own
* public API, which would round-trip coordinates through floor()/tileSize
* arithmetic and risk flipping a discrete band right at a threshold — a
* real fragility of that indirect comparison, not evidence of any actual
* mismatch) must match exactly.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { voronoiIslamicV2, cellRotationOffset } from "../voronoiIslamicV2.js";
import { snapRotation } from "../islamic.js";
import { generateSeedPoints } from "../lib/seedPoints.js";
import { nearestPoint, nearestSegmentDistSq } from "../lib/distanceField.js";
import { constructionCircle, radialDivisions } from "../lib/constructionCircle.js";
import { starOutline, starSkip } from "../lib/starPolygon.js";
import { toneSet, bandTone } from "../lib/colourMapping.js";
import { maxBandsFor, buildOffsetBands } from "../lib/polygonOffset.js";
import { CANVAS } from "../../config.js";

// Independent oracle: re-derives voronoiIslamicV2.js's own construction
// directly from lib/ primitives (cell lookup via generateSeedPoints +
// nearestPoint, then islamic-svg.js's own ring geometry via
// buildOffsetBands), rather than importing voronoiIslamicV2.js's internals.
// Reuses the exported cellRotationOffset() rather than re-deriving it —
// that RNG mixing scheme has its own dedicated test below, and re-deriving
// it here would just be testing that two copies of the same formula agree.
function oracle(x, y, seed, segments, numCells, tileSize, scale, frequency, lineWidth, tones, rotation = 0, randomRotation = 0) {
   const points = generateSeedPoints(numCells, seed);
   const shades = toneSet(tones);

   const { index } = nearestPoint(x, y, points);
   const cx = points[index * 2], cy = points[index * 2 + 1];
   const lx = x - cx, ly = y - cy;
   rotation = (randomRotation ? cellRotationOffset(seed, index) : 0) + rotation;

   const radius = tileSize * scale;
   const n = Math.max(3, Math.round(segments));
   const circle = constructionCircle(0, 0, radius);
   const snappedDeg = snapRotation(rotation, n);
   const ring = radialDivisions(circle, n, Math.PI / 2 + (snappedDeg * Math.PI) / 180);
   const outline = starOutline(ring, starSkip(n));

   const step = radius / frequency;
   const bands = buildOffsetBands(outline, step, maxBandsFor(n));

   let bestDistSq = Infinity, bestIndex = 0;
   for (const band of bands) {
      const edgeCount = band.poly.length / 2;
      const edges = new Float32Array(edgeCount * 4);
      for (let i = 0; i < edgeCount; i++) {
         const j = (i + 1) % edgeCount;
         edges[i * 4] = band.poly[i * 2];
         edges[i * 4 + 1] = band.poly[i * 2 + 1];
         edges[i * 4 + 2] = band.poly[j * 2];
         edges[i * 4 + 3] = band.poly[j * 2 + 1];
      }
      const distSq = nearestSegmentDistSq(lx, ly, edges);
      if (distSq < bestDistSq) { bestDistSq = distSq; bestIndex = band.index; }
   }

   const threshold = lineWidth * radius;
   if (bestDistSq >= threshold * threshold) return shades[0];
   return bandTone(shades, bestIndex);
}

const tileSizeArb = fc.integer({ min: 40, max: 200 });
const numCellsArb = fc.integer({ min: 5, max: 80 });
const segmentsArb = fc.integer({ min: 3, max: 16 });
const scaleArb = fc.double({ min: 0.2, max: 0.48, noNaN: true });
const freqArb = fc.double({ min: 1, max: 6, noNaN: true });
const lineWidthArb = fc.double({ min: 0.01, max: 0.15, noNaN: true });
const tonesArb = fc.constantFrom("2", "3", "4", "5");
const seedArb = fc.integer({ min: 0, max: 99999 });
const rotationArb = fc.double({ min: 0, max: 360, noNaN: true });
const randomRotationArb = fc.constantFrom(0, 1);
const pointArb = fc.record({
   x: fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
   y: fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
});

describe("voronoiIslamicV2: algorithm-specific invariants", () => {
   it("matches an independent oracle re-deriving cell lookup and the ring construction's own banding pipeline", () => {
      fc.assert(
         fc.property(
            pointArb, numCellsArb, tileSizeArb, seedArb, segmentsArb, scaleArb, freqArb, lineWidthArb, tonesArb,
            rotationArb, randomRotationArb,
            (p, numCells, tileSize, seed, segments, scale, frequency, lineWidth, tones, rotation, randomRotation) => {
               const expected = oracle(
                  p.x, p.y, seed, segments, numCells, tileSize, scale, frequency, lineWidth, tones, rotation,
                  randomRotation
               );
               const v = voronoiIslamicV2(p.x, p.y, {
                  seed, segments, tileSize, numCells, scale, frequency, lineWidth, tones, rotation, randomRotation,
               });
               expect(v).toBe(expected);
            }
         ),
         { numRuns: 50 }
      );
   });

   it("randomRotation off leaves every medallion sharing one rotation (byte-identical to it not existing)", () => {
      // randomRotation defaults to 0 — this pins that default's actual
      // effect (a no-op), not just its declared value, per this project's
      // falsifiable-boundary convention for opt-in params.
      fc.assert(
         fc.property(
            pointArb, numCellsArb, tileSizeArb, seedArb, segmentsArb, scaleArb, freqArb, lineWidthArb, tonesArb,
            rotationArb,
            (p, numCells, tileSize, seed, segments, scale, frequency, lineWidth, tones, rotation) => {
               const withoutParam = voronoiIslamicV2(p.x, p.y, {
                  seed, segments, tileSize, numCells, scale, frequency, lineWidth, tones, rotation,
               });
               const withParamOff = voronoiIslamicV2(p.x, p.y, {
                  seed, segments, tileSize, numCells, scale, frequency, lineWidth, tones, rotation,
                  randomRotation: 0,
               });
               expect(withParamOff).toBe(withoutParam);
            }
         ),
         { numRuns: 50 }
      );
   });

   it("randomRotation composes additively with the Flipped rotation toggle (flips each cell's own random angle, doesn't replace it)", () => {
      // Isolates the composition rule itself: cellRotationOffset(seed,
      // index) + rotation, computed directly, must equal what the
      // generator actually used — checked via the same oracle (which
      // already encodes this addition), at a params set exercising a
      // real Flipped value (segments = 7 -> 180/7 != 0).
      const params = {
         tileSize: 120, scale: 0.3, segments: 7, frequency: 4, lineWidth: 0.08, tones: "2",
         seed: 99, numCells: 20, rotation: 180 / 7, randomRotation: 1,
      };
      let checked = 0;
      for (let x = 0; x < CANVAS.WIDTH; x += 12) {
         for (let y = 0; y < CANVAS.HEIGHT; y += 12) {
            checked++;
            const v = voronoiIslamicV2(x, y, params);
            const expected = oracle(
               x, y, params.seed, params.segments, params.numCells, params.tileSize, params.scale,
               params.frequency, params.lineWidth, params.tones, params.rotation, params.randomRotation
            );
            expect(v).toBe(expected);
         }
      }
      expect(checked).toBeGreaterThan(0);
   });

   it("randomRotation on gives different cells visibly different rotations (not one shared random value)", () => {
      let anyDifference = false;
      const params = { tileSize: 100, segments: 8, seed: 3, numCells: 40, randomRotation: 1 };
      for (let x = 0; x < CANVAS.WIDTH && !anyDifference; x += 10) {
         for (let y = 0; y < CANVAS.HEIGHT && !anyDifference; y += 10) {
            const random = voronoiIslamicV2(x, y, params);
            const uniform = voronoiIslamicV2(x, y, { ...params, randomRotation: 0 });
            if (random !== uniform) anyDifference = true;
         }
      }
      expect(anyDifference).toBe(true);
   });

   it("a different numCells produces a different cell layout (numCells is actually load-bearing)", () => {
      let anyDifference = false;
      const base = { tileSize: 140, segments: 8, seed: 7 };
      for (let x = 0; x < CANVAS.WIDTH && !anyDifference; x += 10) {
         for (let y = 0; y < CANVAS.HEIGHT && !anyDifference; y += 10) {
            const few = voronoiIslamicV2(x, y, { ...base, numCells: 5 });
            const many = voronoiIslamicV2(x, y, { ...base, numCells: 80 });
            if (few !== many) anyDifference = true;
         }
      }
      expect(anyDifference).toBe(true);
   });

   it("returns the declared tone set for the full registry-declared param range", () => {
      fc.assert(
         fc.property(
            pointArb, tileSizeArb, seedArb, segmentsArb, scaleArb, freqArb, tonesArb,
            (p, tileSize, seed, segments, scale, frequency, tones) => {
               const v = voronoiIslamicV2(p.x, p.y, { tileSize, seed, segments, scale, frequency, tones });
               expect(toneSet(tones)).toContain(v);
            }
         )
      );
   });

   it("a different seed produces a different cell layout (seed placement is actually stochastic)", () => {
      let anyDifference = false;
      const params = { tileSize: 100, segments: 8 };
      for (let x = 0; x < CANVAS.WIDTH && !anyDifference; x += 20) {
         for (let y = 0; y < CANVAS.HEIGHT && !anyDifference; y += 20) {
            const a = voronoiIslamicV2(x, y, { ...params, seed: 1 });
            const b = voronoiIslamicV2(x, y, { ...params, seed: 2 });
            if (a !== b) anyDifference = true;
         }
      }
      expect(anyDifference).toBe(true);
   });

   it("stays total (finite, in range) across the full canvas at the registry's declared tileSize extremes", () => {
      for (const tileSize of [40, 200]) {
         for (let x = 0; x < CANVAS.WIDTH; x += 15) {
            for (let y = 0; y < CANVAS.HEIGHT; y += 15) {
               const v = voronoiIslamicV2(x, y, { tileSize, segments: 8, seed: 42 });
               expect(Number.isFinite(v)).toBe(true);
               expect(v).toBeGreaterThanOrEqual(-1);
               expect(v).toBeLessThanOrEqual(1);
            }
         }
      }
   });

   it("stays total (finite, in range) across the full canvas at the registry's declared numCells extremes", () => {
      for (const numCells of [5, 80]) {
         for (let x = 0; x < CANVAS.WIDTH; x += 15) {
            for (let y = 0; y < CANVAS.HEIGHT; y += 15) {
               const v = voronoiIslamicV2(x, y, { tileSize: 100, numCells, segments: 8, seed: 42 });
               expect(Number.isFinite(v)).toBe(true);
               expect(v).toBeGreaterThanOrEqual(-1);
               expect(v).toBeLessThanOrEqual(1);
            }
         }
      }
   });
});

describe("cellRotationOffset: primitive-level invariants", () => {
   it("is deterministic per (seed, index)", () => {
      expect(cellRotationOffset(42, 3)).toBe(cellRotationOffset(42, 3));
   });

   it("stays within [0, 360)", () => {
      fc.assert(
         fc.property(seedArb, fc.integer({ min: 0, max: 999 }), (seed, index) => {
            const angle = cellRotationOffset(seed, index);
            expect(angle).toBeGreaterThanOrEqual(0);
            expect(angle).toBeLessThan(360);
         })
      );
   });

   it("a different index gives a different angle for the same seed (each cell's own value, not one shared value)", () => {
      const a = cellRotationOffset(1, 0);
      const b = cellRotationOffset(1, 1);
      expect(a).not.toBe(b);
   });

   it("adding cells never perturbs an existing cell's own angle (the RNG stream depends only on seed and that cell's own index)", () => {
      fc.assert(
         fc.property(seedArb, fc.integer({ min: 0, max: 200 }), (seed, index) => {
            // A later cell's own index existing (or not) has no bearing on
            // an earlier index's value — no shared/consumed stream state.
            const before = cellRotationOffset(seed, index);
            cellRotationOffset(seed, index + 1);
            cellRotationOffset(seed, index + 50);
            const after = cellRotationOffset(seed, index);
            expect(after).toBe(before);
         })
      );
   });
});
