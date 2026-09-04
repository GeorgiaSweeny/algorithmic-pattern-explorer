/*
========================================
VORONOI-SEEDED ISLAMIC TILING V2 (HYBRID)
========================================
* Composition: Seed Points -> nearestPoint (cell lookup) -> Construction
* Circle -> Radial Divisions -> Star Polygon (silhouette) -> Distance Field
* (signed, to the silhouette's own boundary) -> Colour Mapping.
*
* Deliberately the simplest possible version of this hybrid: Voronoi's own
* Seed Points + nearest-seed lookup takes over exactly the one job
* islamic.js's own Grid step did (deciding which cell a pixel belongs to,
* and that cell's own centre) — every step after that is islamic.js's own
* construction, reused completely unmodified. See voronoiIslamic.js (the
* original version of this hybrid) for a more elaborate take that also
* scales each cell's medallion to its own local Voronoi spacing; this file
* intentionally does not do that, or anything else beyond the cell-lookup
* swap, so the two versions demonstrate different points on the same
* research question (does islamic.js's construction generalise from a
* regular grid to an irregular point source) — v1 asks "what's the least
* new geometry needed to make it look coherent", v2 asks "what does it look
* like if nothing downstream of cell placement changes at all".
*
* Because every cell uses the exact same fixed radius (`tileSize * scale`,
* islamic.js's own formula, not adapted to each cell's own irregular
* spacing), medallions from densely-packed cells can overlap and medallions
* in sparse regions can leave gaps — an expected, honest consequence of not
* introducing any new geometry, not a bug to fix.
*
* - `numCells`: seed points are a plain, unconstrained scatter across the
*   canvas (lib/seedPoints.js's generateSeedPoints — a Poisson process, the
*   same primitive voronoiIslamic.js/v1 and voronoi.js itself both use),
*   not laid out on any underlying grid. An earlier version placed one
*   point per cell of a regular grid instead, each nudged by a bounded
*   "jitter" offset — deliberately removed: it added a grid-shaped
*   constraint on top of Voronoi's own natural cell variation for no real
*   visual benefit, when a plain scatter is both simpler and already what
*   a Voronoi diagram means. Uneven cell sizes (a real consequence of a
*   Poisson process having no bound on how close two points can land, or
*   how large a gap can appear by chance) are accepted as this hybrid's own
*   honest character, not something to be engineered away.
*
* - `randomRotation`: each cell's medallion gets its own independently
*   randomised rotation (cellRotationOffset below — an xorshift32 stream
*   mixed with the cell's own point index, the same per-cell RNG technique
*   voronoiIslamic.js's cellVariation uses) instead of every medallion
*   sharing one rotation. `rotation` (the existing Flipped toggle) composes
*   with it by simple addition rather than the two being mutually
*   exclusive: off + off is the plain unrotated construction, off + Flipped
*   is a single shared 180/segments rotation (as before), on + off is each
*   cell's own random rotation, and on + Flipped adds that same 180/segments
*   flip on top of whatever each cell's own random rotation already was —
*   flipping the random result, not replacing it. Every combination of the
*   two toggles is a meaningful, valid state; there's nothing to guard
*   against selecting "at the same time" once they're modelled as two
*   independent, additive knobs rather than one 3-way choice.
*
* - Ring construction: this now reuses svg/islamic-svg.js's own ring
*   geometry (lib/polygonOffset.js's buildOffsetBands/offsetPolygon)
*   instead of islamic.js's plain raster signed-distance banding. The two
*   are genuinely different constructions, not just different renderers of
*   the same shape: islamic.js's raster banding measures each pixel's
*   distance to the *original* silhouette only, rounded to the nearest
*   step multiple — a smooth, rounded contour. islamic-svg.js's rings are
*   each a *true perpendicular offset polygon*, with their own sharp,
*   independently reconstructed vertices (mitered, per-edge) — at two or
*   more bands out, those reconstructed edges start crossing each other,
*   producing genuinely new self-intersecting shapes. Since Islamic
*   Rosette is `nativeFormat: "vector"` and always renders via
*   islamic-svg.js in the app, that's the "normal Islamic pattern" this
*   hybrid is actually being compared against — reusing its own ring
*   construction (evaluated per-pixel here, rather than stroked as SVG)
*   is what makes that comparison fair.
*/
import { generateSeedPoints } from "./lib/seedPoints.js";
import { nearestPoint, nearestSegmentDistSq } from "./lib/distanceField.js";
import { constructionCircle, radialDivisions } from "./lib/constructionCircle.js";
import { starOutline, starSkip } from "./lib/starPolygon.js";
import { toneSet, bandTone } from "./lib/colourMapping.js";
import { snapRotation } from "./islamic.js";
import { maxBandsFor, buildOffsetBands } from "./lib/polygonOffset.js";
import { xorshift32Unit } from "./lib/rng.js";

// Seed points are deterministic per (numCells, seed) — cached the same way
// voronoi.js caches its own.
const _cellCache = new Map();
function getPoints(numCells, seed) {
   const key = `${numCells}|${seed}`;
   if (!_cellCache.has(key)) _cellCache.set(key, generateSeedPoints(numCells, seed));
   return _cellCache.get(key);
}

// Each cell's own independent random rotation (see header comment) — the
// RNG stream depends only on (seed, index), same mixing technique as
// voronoiIslamic.js's cellVariation, so adding/removing cells never
// perturbs an existing cell's own angle. Exported so tests can build an
// independent oracle without re-deriving this exact bit-mixing scheme.
export function cellRotationOffset(seed, index) {
   const mixedSeed = (seed ^ Math.imul(index + 1, 0x9e3779b1)) >>> 0;
   const rand = xorshift32Unit(mixedSeed);
   return rand() * 360;
}

// Byte-identical to islamic.js's own getOutline — construction points
// depend only on (segments, radius, rotation), never on which cell they're
// placed in, so this cache is shared across every cell exactly as
// islamic.js shares it across every tile.
const _outlineCache = new Map();
function getOutline(segments, radius, rotationDeg) {
   const snappedDeg = snapRotation(rotationDeg, segments);
   const key = `${segments}|${radius}|${snappedDeg}`;
   if (!_outlineCache.has(key)) {
      const n = Math.max(3, Math.round(segments));
      const circle = constructionCircle(0, 0, radius);
      const points = radialDivisions(circle, n, Math.PI / 2 + (snappedDeg * Math.PI) / 180);
      _outlineCache.set(key, starOutline(points, starSkip(n)));
   }
   return _outlineCache.get(key);
}

// The full set of ring polygons for this medallion (see header comment) —
// depends on the same (segments, radius, rotation) as getOutline, plus
// frequency (it sets the offset step between bands), so every cell with
// matching params reuses the same rings, same as islamic-svg.js sharing
// one _buildRings result across every tile.
const _bandsCache = new Map();
function getBands(segments, radius, rotationDeg, frequency) {
   const snappedDeg = snapRotation(rotationDeg, segments);
   const key = `${segments}|${radius}|${snappedDeg}|${frequency}`;
   if (!_bandsCache.has(key)) {
      const outline = getOutline(segments, radius, rotationDeg);
      const step = radius / frequency;
      const bands = buildOffsetBands(outline, step, maxBandsFor(segments));
      _bandsCache.set(key, bands.map((band) => ({ index: band.index, edges: outlineEdges(band.poly) })));
   }
   return _bandsCache.get(key);
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

export function voronoiIslamicV2(x, y, params) {
   const {
      seed = 1337,
      segments = 8,
      tileSize = 100,
      numCells = 15,
      scale = 0.42,
      frequency = 3,
      lineWidth = 0.06,
      tones = "2",
      rotation = 0,
      randomRotation = 0,
   } = params;

   const points = getPoints(numCells, seed);
   const shades = toneSet(tones);

   // The only change from islamic.js: which cell (x, y) belongs to, and
   // that cell's own centre, comes from Voronoi's nearest-seed lookup
   // instead of Grid's tile lookup.
   const { index } = nearestPoint(x, y, points);
   const cx = points[index * 2], cy = points[index * 2 + 1];
   const lx = x - cx, ly = y - cy;

   // Everything from here down is Islamic Rosette's own ring construction
   // (see header comment) — the same rings islamic-svg.js itself draws,
   // evaluated per-pixel instead of stroked. `rotation` (the Flipped
   // toggle) and this cell's own random offset (see header comment) simply
   // add together.
   const cellRotation = (randomRotation ? cellRotationOffset(seed, index) : 0) + rotation;
   const radius = tileSize * scale;
   const bands = getBands(segments, radius, cellRotation, frequency);

   let bestDistSq = Infinity, bestIndex = 0;
   for (const band of bands) {
      const distSq = nearestSegmentDistSq(lx, ly, band.edges);
      if (distSq < bestDistSq) { bestDistSq = distSq; bestIndex = band.index; }
   }

   const threshold = lineWidth * radius;
   if (bestDistSq >= threshold * threshold) return shades[0];
   return bandTone(shades, bestIndex);
}
