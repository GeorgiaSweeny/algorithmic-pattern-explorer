/*
========================================
VORONOI-SEEDED ISLAMIC TILING (HYBRID)
========================================
* Composition: Seed Points -> Distance Field (nearestPoint, for cell
* membership) -> local coordinates relative to the owning seed -> the
* unchanged islamic.js silhouette pipeline (Construction Circle -> Radial
* Divisions -> Star Polygon -> Distance Field (signed) -> Colour Mapping).
* Full design reasoning recorded in docs/VORONOI_ISLAMIC_HYBRID_PLAN.md
* before any of this was written — this file implements that plan, not a
* re-derivation of it.
*
* The research question this tests (plan doc, section 1): does the
* "which cell am I in -> build a rosette there" pipeline generalise from a
* regular point source (islamic.js's Grid tiling) to *any* point source,
* stochastic included (voronoi.js's Seed Points)? Concretely: replace
* islamic.js's `[cx, cy] = tile centroid` step with
* `[cx, cy] = nearestPoint(x, y, seedPoints)`'s owning seed, and reuse
* every downstream stage verbatim.
*
* Section 3.1: a Voronoi cell's centre, without computing the cell
* polygon. nearestPoint already returns `index` — the seed whose cell a
* pixel belongs to — and a Voronoi cell is by definition the set of points
* closer to its own seed than any other, so the seed *is* the cell centre.
* No centroid computation, no cell-polygon construction (this generator
* never draws cell boundaries, only signed distance to a rosette silhouette
* centred at the seed) — the same simplification voronoi.js itself already
* relies on (it only ever asks "which is nearest", never builds a polygon).
*
* Section 3.2: unlike islamic.js's tiles, Voronoi cells aren't a fixed
* size, so `radius = tileSize * scale` doesn't transfer — any fixed radius
* looks right in some cells and overflows into a neighbour's cell in
* others (uniform random points have high-variance nearest-neighbour
* spacing). Two radius formulas were considered:
*   v1 (statistical estimate): radius = scale * CANVAS.WIDTH / sqrt(numCells),
*     the expected spacing for numCells uniform points over the canvas
*     area. Cheap, correct on average, but visibly overflows in denser-
*     than-average regions — a real limitation of the simple version, not
*     a bug to paper over.
*   v2 (per-seed nearest-neighbour radius, used here): radius = scale *
*     nearestNeighbourDistances(points)[index] (lib/seedPoints.js) —
*     correct per-cell rather than only on average. Built as the shipped
*     version (not left at v1) once v1 confirmed the rest of the pipeline
*     — membership lookup -> local coordinates -> existing Fork -> existing
*     banding — works at all; see this file's property tests for the
*     "does the shared pipeline actually match islamic.js's own
*     construction at equal radius" check the plan's M1/M2 milestones
*     describe. Promoted to lib/seedPoints.js (not kept local to this
*     file) since it's a generic "for each point, how close is its
*     nearest neighbour" query, not Islamic-specific (plan doc section
*     3.2's own reasoning for leaning that way).
*
* Section 3.3: `segments`, `rotation`, and `scale` are held uniform across
* every cell by default — only the *centres* are stochastic. Randomising
* the downstream construction per cell too was rejected for the first
* version specifically because it would confound the comparison this
* hybrid exists to make: "does the same downstream construction work when
* driven by an irregular point source" is only a clean question if the
* downstream construction is actually held constant — every existing
* property test, and the plan doc's own composition-table finding, was
* checked against that uniform default.
*
* `variation` (added 2026-08-21, opt-in, default 0) is a later, explicit
* extension for visual range, not a retraction of that decision: at
* variation = 0 every cell's segments/rotation are exactly what they were
* before this param existed (see cellVariation's own doc comment for why
* that's exact, not approximate). Above 0, each cell's segments/rotation
* are independently nudged by a per-cell-index-seeded deterministic
* offset, reusing lib/rng.js's existing xorshift32Unit — no new RNG
* primitive, no new composition pattern (still a Constant-bind feeding the
* same per-cell Atop chain), so the plan doc's "one new primitive, zero
* new patterns" finding is unaffected by this addition.
*
* Section 3.4: cells are self-contained, matching islamic.js's own
* (2026-08-20) design rather than its earlier, superseded neighbour-
* searching construction — with radius chosen conservatively relative to
* each cell's own local nearest-neighbour spacing (v2 above), a rosette
* should stay within its own cell without needing to search neighbouring
* cells for the nearest chord.
*
* Section 3.5: raster only for this version (nativeFormat: "raster", like
* recursiveNoise.js, the other hybrid) — an SVG version would need to draw
* each cell's own clip polygon individually (no repeating <pattern> unit
* exists for an irregular tiling), a separate piece of work the plan marks
* as a stretch goal (M5), not required to test the compositional question
* this hybrid targets.
*
* Section 4's predicted structure: Constant-bind (seed points, per-seed
* radius) -> Atop (nearestPoint membership) -> Atop (local coordinates) ->
* Fork (nearestSegmentDistSq + pointInPolygon, islamic.js's own pair,
* imported unchanged) -> Atop (bandTone). If that holds, this hybrid needed
* one new primitive (nearestNeighbourDistances) and zero new composition
* patterns — see docs/ALGORITHMIC_COMPOSITION_RESEARCH.md's composition
* table for the actual-vs-predicted comparison once this is checked.
*
* Follow-up (2026-08-21): self-contained cells with no line connecting
* them read as scattered medallions, not an Islamic *tiling* — real
* girih/Islamic star patterns get their character from adjacent motifs'
* lines meeting at shared tile edges (Kaplan & Salesin's own "polygons in
* contact," already cited in docs/VORONOI_ISLAMIC_HYBRID_PLAN.md §8).
* Added a second, independent line test for the Voronoi cell boundary
* itself — a pixel is exactly on its own cell's edge where it's
* equidistant from its two nearest seeds, a standard per-pixel proxy for
* "distance to the nearest cell edge" (lib/distanceField.js's new
* nearestTwoPoints) that needs no real cell-polygon construction, keeping
* section 3.1's own decision intact. Combined with the existing star-line
* test by OR before banding — a second Fork branch feeding the same
* bandTone, not a new composition pattern; one new primitive
* (nearestTwoPoints), same as this hybrid's own original build.
*/
import { generateSeedPoints, nearestNeighbourDistances } from "./lib/seedPoints.js";
import { nearestTwoPoints, nearestSegmentDistSq, pointInPolygon } from "./lib/distanceField.js";
import { constructionCircle, radialDivisions } from "./lib/constructionCircle.js";
import { starOutline, starSkip } from "./lib/starPolygon.js";
import { toneSet, bandTone } from "./lib/colourMapping.js";
import { xorshift32Unit } from "./lib/rng.js";
import { snapRotation } from "./islamic.js";

// Per-cell segments/rotation jitter — see this file's header comment
// (section 3.3) for why this exists as an opt-in extension rather than a
// change to the default uniform construction. Exported (mirrors
// islamic.js's exported snapRotation) so tests can build an independent
// oracle rather than re-deriving this from voronoiIslamic()'s internals.
//
// The per-cell RNG stream depends only on (seed, index) — never on
// numCells or any other cell — so adding more cells never perturbs an
// already-existing cell's own jitter, and it's a fresh seed derivation
// (not a continuation of generateSeedPoints' own stream), so it isn't
// silently coupled to where the points themselves landed.
//
// At variation = 0 both jitter terms are an exact "* 0": cellSegments is
// exactly Math.round(segments) (what getOutline would compute anyway) and
// rotation is returned completely unchanged — byte-identical to this
// param not existing at all, not just numerically close.
export function cellVariation(seed, index, segments, rotation, variation) {
   const mixedSeed = (seed ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0;
   const rand = xorshift32Unit(mixedSeed);
   const jitterA = rand(), jitterB = rand();

   const maxSegJitter = 5; // keeps cellSegments sensible across the declared [3, 16] range
   const segJitter = Math.round(variation * maxSegJitter * (jitterA * 2 - 1));
   const cellSegments = Math.min(16, Math.max(3, Math.round(segments) + segJitter));

   const rotJitterDeg = variation * 180 * (jitterB * 2 - 1);
   return { segments: cellSegments, rotation: rotation + rotJitterDeg };
}

// Seed points and their per-seed nearest-neighbour distances are
// deterministic per (numCells, seed) — cached the same way voronoi.js
// caches its own seed points, so this only pays the O(numCells^2)
// nearestNeighbourDistances cost once per distinct (numCells, seed) pair,
// not once per pixel.
const _cellCache = new Map();
function getCells(numCells, seed) {
   const key = `${numCells}|${seed}`;
   if (!_cellCache.has(key)) {
      const points = generateSeedPoints(numCells, seed);
      const nnDist = nearestNeighbourDistances(points);
      _cellCache.set(key, { points, nnDist });
   }
   return _cellCache.get(key);
}

// islamic.js's own outline construction, reused verbatim (same cache
// shape, same silhouette derivation) — the only difference from
// islamic.js's copy is that `radius` here varies per cell rather than
// being fixed per render, so the cache key still does the right thing:
// it collapses to one entry per distinct radius actually seen, which is
// bounded by the (small) number of distinct nearest-neighbour distances
// in the current seed set, not by pixel count.
const _outlineCache = new Map();
function getOutline(segments, radius, rotationDeg) {
   const snappedDeg = snapRotation(rotationDeg, segments);
   const key = `${segments}|${radius}|${snappedDeg}`;
   if (!_outlineCache.has(key)) {
      const n = Math.max(3, Math.round(segments));
      const circle = constructionCircle(0, 0, radius);
      // Base alignment matches islamic.js: tip 0 at 90 degrees so every
      // medallion is vertically symmetric regardless of segments.
      const points = radialDivisions(circle, n, Math.PI / 2 + (snappedDeg * Math.PI) / 180);
      _outlineCache.set(key, starOutline(points, starSkip(n)));
   }
   return _outlineCache.get(key);
}

const _edgeCache = new Map();
function outlineEdges(outline) {
   if (!_edgeCache.has(outline)) {
      const n = outline.length / 2;
      const edges = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) {
         const j = (i + 1) % n;
         edges[i * 4] = outline[i * 2];
         edges[i * 4 + 1] = outline[i * 2 + 1];
         edges[i * 4 + 2] = outline[j * 2];
         edges[i * 4 + 3] = outline[j * 2 + 1];
      }
      _edgeCache.set(outline, edges);
   }
   return _edgeCache.get(outline);
}

export function voronoiIslamic(x, y, params) {
   const {
      numCells = 20,
      seed = 1337,
      segments = 8,
      scale = 0.42,
      frequency = 3,
      lineWidth = 0.06,
      tones = "2",
      rotation = 0,
      variation = 0,
   } = params;

   const { points, nnDist } = getCells(numCells, seed);
   const shades = toneSet(tones);

   // Which cell (x, y) belongs to, and that cell's centre — the seed
   // point itself (section 3.1: no separate centroid computation needed).
   // Also gives secondDistSq for the cell-boundary line test below, in
   // the same search rather than a second nearestPoint pass.
   const { index, distSq, secondDistSq } = nearestTwoPoints(x, y, points);
   const cx = points[index * 2], cy = points[index * 2 + 1];
   const lx = x - cx, ly = y - cy;

   // Section 3.3: uniform by default (variation = 0 is an exact no-op —
   // see cellVariation's own doc comment); variation > 0 lets this one
   // cell's own segments/rotation diverge from every other cell's.
   const cell = cellVariation(seed, index, segments, rotation, variation);

   // Section 3.2 (v2): radius scaled to this cell's own local spacing,
   // not a canvas-wide constant — the one place this hybrid's design
   // genuinely departs from islamic.js's fixed-tile radius formula.
   const radius = scale * nnDist[index];
   const outline = getOutline(cell.segments, radius, cell.rotation);
   const edges = outlineEdges(outline);

   // From here down: islamic.js's own signed-distance banding, unchanged.
   const dist = Math.sqrt(nearestSegmentDistSq(lx, ly, edges));
   const inside = pointInPolygon(lx, ly, outline);
   const signedDist = inside ? -dist : dist;

   const step = radius / frequency;
   const bandPos = signedDist / step;
   const nearestBand = Math.round(bandPos);
   const distToLine = Math.abs(bandPos - nearestBand) * step;
   const onStarLine = distToLine < lineWidth * radius;

   // Second Fork branch (2026-08-21 follow-up, see header comment):
   // exactly on the cell's own boundary where equidistant from its two
   // nearest seeds — traced as a line the same weight as the star's own
   // lines, so the whole lattice reads as one continuous strapwork
   // rather than cell seams in a visually distinct ink.
   const boundaryGap = Math.sqrt(secondDistSq) - Math.sqrt(distSq);
   const onBoundaryLine = boundaryGap < lineWidth * radius;

   if (!onStarLine && !onBoundaryLine) return shades[0];
   return onStarLine ? bandTone(shades, nearestBand) : bandTone(shades, 0);
}
