/*
========================================
ISLAMIC GEOMETRIC ROSETTE GENERATOR
========================================
* Composition: Grid (tile lookup) -> Construction Circle -> Radial Divisions
* -> Star Polygon (silhouette) -> Distance Field (signed, to the
*    silhouette's own boundary) -> Colour Mapping
*
* One construction, not two. Earlier versions had a "rosette" mode (banded
* plain distance to the nearest ring point — level sets were circles, or a
* generic regular polygon unrelated to the actual points) and a
* "star-lines" mode (raw {n/k} star-polygon chords, thresholded through a
* sine wave to fake a line width). Neither was an accurate rosette: the
* first had no real star geometry at all, and the second drew disconnected
* chords rather than a single proportioned star+petal shape. Flagged as
* inaccurate (2026-08-20), with drawingislamicgeometricdesigns.com's
* "Basic Rosettes (Anthony Lee's Methods)" page offered as a reference.
*
* Two independent WebFetch passes on that page came back inconsistent on
* the precise labelled construction points (expected — the page's content
* is diagrams a text extraction can't carry), so this does not claim to
* reproduce Lee's exact compass-and-straightedge steps. It implements the
* piece of real, independently-verifiable geometry his method and every
* basic Islamic rosette share: the whole star+petal shape is *one*
* silhouette with *one* proportioning relationship, not a set of
* independently-chosen radii. That silhouette is lib/starPolygon.js's
* starOutline(): the classic {n/k} star polygon's own self-intersection
* outline — n sharp tip vertices (the Radial Divisions ring itself)
* alternating with n concave waist vertices, each computed as the actual
* crossing point of two of the star's own chords (see starOutline's doc
* comment for the derivation). This is the same shape a 5-pointed star
* icon traces; for n=5 its waist/tip radius ratio comes out to exactly
* 1/phi^2 (~0.382), the well-known golden-ratio proportion of a regular
* pentagram — a strong sanity check that this is genuine star-polygon
* geometry, not an approximation.
*
* skip (the k in {n/k}) is starPolygon.js's own starSkip(n) — shared with
* that module's other consumer rather than a second, bespoke choice here.
* An earlier version of this file fixed skip at 2 for every n >= 5;
* per Wikipedia's "Islamic geometric patterns" (the underlying grid of
* polygons determines the star at each vertex — an octagon grid gives an
* 8-point star, etc. — not a single fixed proportion reused at every
* size), a *constant* skip is exactly the wrong invariant to hold fixed:
* the waist/tip ratio it produces drifts toward 1 (a near-circle) as n
* grows, since the two chords defining each waist subtend a shrinking
* angle at the centre — confirmed numerically (skip=2's ratio: 0.38 at
* n=5, 0.90 at n=12) and visually (n above ~8 rendered as a wavy blob
* with barely-visible points, not a star). starSkip(n) instead keeps
* skip proportional to n (roughly n/3), which keeps the ratio in a
* consistent ~0.35-0.6 range for every n from 3 to 16 — every tested
* value now reads as a genuine multi-pointed star, not just the few
* where skip=2 happened to still be sharp enough.
*
* Rendering traces that one silhouette's own boundary, plus its evenly
* spaced concentric echoes, as thin lines rather than filling the bands
* between them: nearestSegmentDistSq (lib/distanceField.js) gives distance
* to the silhouette's boundary, pointInPolygon gives which side of it a
* pixel is on, combined into one signed distance, and a pixel is "on a
* line" wherever that signed distance sits within `lineWidth * radius` of
* a multiple of one echo spacing (the medallion's own edge is exactly one
* such multiple, at 0). Filled concentric bands (an earlier version of this
* rebuild) read as a dense op-art texture rather than an Islamic geometric
* pattern for most n below 8 — real Islamic geometric patterns are line
* art, thin interlacing strokes on a plain ground, not solid alternating
* fills, and switching to that is what actually fixed the resemblance,
* not any further geometry change.
*
* `frequency` sets that echo spacing *relative to the medallion's own
* radius* (`step = radius / frequency`, so frequency is "roughly how many
* rings fit across the medallion"), not as a raw distance. An earlier
* version used `step = 1 / frequency` directly: fine at the one tileSize
* it happened to be tuned against, but a spatial frequency high enough to
* look reasonable at tileSize 200 crams far too many rings into the same
* medallion at tileSize 40 (or any segments — the breakdown didn't depend
* on segments, only on how the fixed spacing compared to the medallion's
* own, tileSize-dependent size), degrading into an illegible dense scribble
* rather than the intended nested rings. Scaling by radius keeps the
* rendered ring *count* consistent across the whole declared tileSize
* range instead of the absolute spacing.
*
* Each tile draws one self-contained rosette medallion (radius kept well
* inside the tile's own half-width, the same "self-contained motif" scope
* the old rosette mode used) rather than chords reaching into neighbouring
* tiles — a rosette is a single bounded motif, not an infinite lattice of
* lines, so there's no cross-tile interlace to reconcile here.
*
* `lineWidth` controls line thickness independently of `frequency`.
* Before this param existed, thickness was `LINE_WIDTH * step` — a fixed
* fraction of the *echo spacing itself* (`step = radius / frequency`), so
* dragging `frequency` changed thickness as a side effect of changing
* spacing, with no way to separate the two. Flagged as unwanted coupling.
* `lineWidth` now sets thickness as a fraction of the medallion's radius
* directly (`lineWidth * radius`, no `step`/`frequency` in that formula
* at all), so ring count and line weight are independent knobs — matches
* how `frequency` itself was already made independent of `tileSize` by
* being expressed relative to `radius` rather than an absolute distance.
*
* `tones = "3"` had no visible effect before a fix: every line, echoes
* included, always used shades[shades.length - 1], so the middle tone
* toneSet() declares was computed and never read. Fixed with
* lib/colourMapping.js's bandTone(shades, bandIndex): the medallion's
* own boundary (band 0) is always the darkest declared tone; every other
* echo cycles through whichever tones are left, so a 4- or 5-tone
* declaration reads as an actual gradient of rings rather than only ever
* two colours regardless of how many were declared. toneSet() itself now
* generates 2-5 tones by formula (previously only "2"/"3" were listed) —
* shared with every other generator that already uses it, not special-
* cased here.
*
* Tones stay greyscale by design for now, both here and in
* islamic-svg.js's own FILLS (the only renderer actually shown for this
* pattern — nativeFormat: "vector") — matching every other generator's
* raster grayscale() convention even though this file isn't bound to it
* (SVG's FILLS is a local constant, free to diverge). An earlier version
* of this file used real, non-grayscale colour here; reverted, since
* colour selection should be an explicit, user-driven choice added later
* rather than a fixed palette baked into the default now.
*
* `scale` resizes the medallion within its tile. This is a parameter on
* the existing Construction Circle step, not a new node: that node's
* whole job is already "define the centre and radius later structure is
* built from" (lib/constructionCircle.js's own header comment), and
* radius was simply a hardcoded 0.42 constant here rather than an exposed
* choice — filling in a parameter a node was already conceptually built
* to own, not introducing a new capability the graph couldn't already
* express. Capped below 0.5 (registry range [0.2, 0.48]) so the medallion
* can't grow to exceed a square tile's own half-width and stop being
* self-contained — the property this generator has relied on throughout
* (see above): no cross-tile interaction, no neighbour-tile search.
*
* `rotation` turns the medallion, snapped to multiples of 180/segments
* degrees — Radial Divisions' own `rotation` parameter
* (lib/constructionCircle.js's radialDivisions already takes one), just
* exposed and snapped rather than left hardcoded at 90 degrees. The snap
* size is deliberately 180/n, not 360/n: this shape has exact n-fold
* *rotational* symmetry, so rotating it by any multiple of 360/n leaves
* it pixel-for-pixel identical (the point set maps onto itself) — a
* control snapped to that would visibly do nothing, which was flagged
* and confirmed mathematically before implementing anything. A regular
* A regular n-gon (or this n-fold star) additionally has n *reflection* axes,
* spaced 180/n apart — twice as many positions as rotational symmetry
* alone gives, landing exactly halfway between each pair of rotational
* repeats — so 180/n is the finest increment that (a) actually changes
* the rendered shape and (b) always lands back on a vertical-symmetry-
* preserving orientation, alternating between two distinct silhouettes
* every step: a tip-up ("pointed") and a waist-up ("flat") reading of
* the same star, exactly the square-to-diamond relationship asked for
* (n=4: 180/4 = 45 degrees turns a flat-top square into a point-up
* diamond, both still vertically symmetric). `rotation`'s own value is
* added to the existing 90-degree base alignment, so `rotation = 0`
* reproduces the exact previous default.
*/
import { constructionCircle, radialDivisions } from "./lib/constructionCircle.js";
import { nearestSegmentDistSq, pointInPolygon } from "./lib/distanceField.js";
import { starOutline, starSkip } from "./lib/starPolygon.js";
import { toneSet, bandTone } from "./lib/colourMapping.js";
import { hexagonCentroid } from "./lib/latticeIndex.js";

// Snaps a requested rotation (degrees) to the nearest multiple of
// 180/segments — see this file's header comment for why that increment,
// not 360/segments. Exported so both islamic-svg.js and the property
// tests' oracle apply the exact same snap, not a re-derived one.
export function snapRotation(rotationDeg, segments) {
   const n = Math.max(3, Math.round(segments));
   const stepDeg = 180 / n;
   return Math.round((rotationDeg ?? 0) / stepDeg) * stepDeg;
}

// Construction points depend only on (segments, radius, rotation) —
// deterministic and tile-independent, so a single small cache covers
// the whole canvas.
const _outlineCache = new Map();
function getOutline(segments, radius, rotationDeg) {
   const snappedDeg = snapRotation(rotationDeg, segments);
   const key = `${segments}|${radius}|${snappedDeg}`;
   if (!_outlineCache.has(key)) {
      const n = Math.max(3, Math.round(segments));
      const circle = constructionCircle(0, 0, radius);
      // Base alignment: tip 0 at 90 degrees rather than the default
      // rightward-pointing 0 degrees — a regular n-gon with a vertex
      // exactly on an axis is automatically mirror-symmetric about that
      // same axis, so this makes every medallion symmetric about its own
      // vertical axis for any n, not just the n where 0 degrees happens
      // to line up that way. Vertical (not horizontal) because a tile's
      // own left/right neighbours are what visually read as "in line"
      // with each other across the grid. `rotation` (snapped above) adds
      // to this base, so rotation = 0 reproduces the original default.
      const points = radialDivisions(circle, n, Math.PI / 2 + (snappedDeg * Math.PI) / 180);
      _outlineCache.set(key, starOutline(points, starSkip(n)));
   }
   return _outlineCache.get(key);
}

export function islamic(x, y, params) {
   const {
      tileSize = 100,
      segments = 8,
      frequency = 0.15,
      lineWidth = 0.06,
      tones = "2",
      tileShape = "square",
      scale = 0.42,
      rotation = 0,
   } = params;

   const shades = toneSet(tones);

   // Grid: which tile is (x, y) in, and where its centroid is — a square
   // lattice cell (unchanged) or a pointy-top hexagon cell
   // (lib/latticeIndex.js's hexagonCentroid, the same cube-coordinate
   // rounding grid.js's hexagon tiling already uses, so "which tile" and
   // "where is its centre" always agree with that existing tiling).
   const [cx, cy] = tileShape === "hexagon"
      ? hexagonCentroid(x, y, tileSize)
      : _squareCentroid(x, y, tileSize);

   // Local coordinates relative to this tile's construction-circle centre.
   const lx = x - cx, ly = y - cy;

   // `scale` is Construction Circle's radius parameter — kept below 0.5
   // (registry range [0.2, 0.48]) so the medallion stays a self-contained
   // motif inside its own tile, matching the old rosette mode's tested
   // default (0.42).
   const radius = tileSize * scale;
   const outline = getOutline(segments, radius, rotation);
   const edges = _outlineEdges(outline);

   const dist = Math.sqrt(nearestSegmentDistSq(lx, ly, edges));
   const inside = pointInPolygon(lx, ly, outline);
   const signedDist = inside ? -dist : dist;

   // Echo spacing relative to the medallion's own radius — see this
   // file's header comment for why not a raw spatial frequency — and
   // the distance from this pixel's echo-band position to the nearest
   // line; the medallion's own edge (signedDist = 0) is always one.
   const step = radius / frequency;
   const bandPos = signedDist / step;
   const nearestBand = Math.round(bandPos);
   const distToLine = Math.abs(bandPos - nearestBand) * step;
   // Independent of step/frequency — see this file's header comment.
   const onLine = distToLine < lineWidth * radius;

   if (!onLine) return shades[0];
   return bandTone(shades, nearestBand);
}

function _squareCentroid(x, y, tileSize) {
   const col = Math.floor(x / tileSize);
   const row = Math.floor(y / tileSize);
   return [(col + 0.5) * tileSize, (row + 0.5) * tileSize];
}

// starOutline() returns a closed vertex list; turn it into the
// [x1,y1,x2,y2,...] edge list nearestSegmentDistSq expects. Cached
// alongside the outline itself since it's a pure function of it.
const _edgeCache = new Map();
function _outlineEdges(outline) {
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
