/*
========================================
ISLAMIC GEOMETRIC ROSETTE — SVG RENDERER
========================================
Renders one medallion's rings once and repeats it across the canvas via
an SVG <pattern> (like wave-svg.js's stripes), matching islamic.js's
single construction: a star-polygon silhouette (lib/starPolygon.js's
starOutline — n tip vertices alternating with n waist vertices, the
waists being genuine self-intersections of the star's own chords, not
picked independently).

islamic.js traces *signed Euclidean distance* to that silhouette's
boundary (negative inside, positive outside) as thin lines at every
multiple of one echo spacing — `radius / frequency`, scaled by the
medallion's own radius so the rendered ring count stays consistent
across the declared tileSize range rather than an absolute spacing that
looks fine at one tileSize and degrades into noise at another (see
islamic.js's header comment) — the medallion's own edge sits at
signedDist = 0, one such multiple — rather than filling the bands
between them. An earlier version of this rebuild filled those bands with
alternating tones instead; for most `segments` below 8 that read as a
dense op-art texture, not an Islamic geometric pattern — real ones are
line art, thin interlacing strokes on a plain ground. This renderer
matches that: every ring below is stroked, not filled.

Each band's own cell is clipped (a <clipPath>, like the old Voronoi-cell
renderer this replaced): a native SVG <pattern> doesn't clip its own
content to its declared tile size, so an outward band reaching past a
cell's own half-width — which the wider bands do, by design, the same as
the raster's own bands can — would otherwise bleed into the region the
*next* cell (or the next pattern-tile repeat) also paints, and every
cell's overlapping copies would interfere into a moire mess (this was
tried unclipped first and looked exactly like that). islamic.js's raster
version never has this problem: Grid/hex-lattice lookup assigns each
pixel to exactly one cell up front, so a pixel never "sees" a
neighbouring cell's geometry at all — clipping here reproduces that same
one-cell-only rule for the vector renderer.

Each line's shape is a true perpendicular offset of the silhouette:
every edge is shifted outward (or inward) along its own unit normal by
the band's target distance, and new vertices are the intersections of
consecutive shifted edges (lib/starPolygon.js's lineIntersect) — the
standard straight-skeleton-style polygon offset. This naive per-vertex-
miter offset is only valid up to a limited depth in either direction:
inward, a concave (waist) vertex's offset inverts through a collapse
point once the offset distance exceeds that corner's own local scale
(detected here as "this vertex's radius stopped decreasing"); outward, a
large enough offset makes the star's own non-adjacent arm edges cross
each other, which this per-vertex algorithm doesn't detect at all (each
vertex is still individually well-defined, but the polygon as a whole
self-intersects) — confirmed visually: within a safe band count,
offsetting stays a clean nested outline; beyond it, a self-intersecting
one starts drawing extra crossing lines that don't correspond to any
real echo, and at high `segments` (more, denser vertices, see
_maxBands's own comment) even a single extra band can merge into a
solid ring rather than a legible line. Stroking (rather than filling, as
an earlier version did) makes this a much softer failure mode — a few
stray extra lines, not a solid mess — but it's still a documented
simplification: the raster renderer has no such limit since it computes
true distance per pixel directly, with no offset-
polygon topology to break, so it always draws every echo out to the edge
of the tile.

Two cell layouts, both feeding the same medallion-ring builder:
"square" places one medallion per S x S tile, centred (matching
islamic.js's own Grid lookup). "hexagon" places two medallions — one per
row phase — per rectangular pattern tile, the standard trick for tiling
a hex lattice with a plain rectangular SVG <pattern> (a hex's own width
equals one full horizontal period, so every hex cell straddles a tile
edge in *some* direction; each hex is therefore drawn at every
(dx, dy) offset in a 3x3 super-grid of tile-period shifts and left to
its own <clipPath> to keep only the part that belongs in this tile —
brute-force over being clever about exactly which single offset would
suffice, since getting that wrong silently drops content at the seam).

API: islamicSvg(width, height, params) → SVG string
*/

import { starOutline, starSkip, lineIntersect } from "../lib/starPolygon.js";
import { radialDivisions, constructionCircle } from "../lib/constructionCircle.js";
import { bandTone, svgFillsFor, DEFAULT_COLOURS } from "../lib/colourMapping.js";
import { snapRotation } from "../islamic.js";

// Greyscale by default, matching every other generator's convention
// (src/render.js's grayscale() pipeline maps a -1..1 tone the same way:
// c = (value+1)*127.5) — but each slot is now an explicit, independently
// user-editable colour (patternRegistry.js's colour1..colour5, `control:
// "color"`) rather than computed from `tones`, so a user can set any
// slot to anything (the brief's own example: red and white for 2 tones).
// bandTone treats the *last active slot* as the primary/darkest line and
// slot 0 as the background, so `svgFillsFor`'s monotonic ramp default
// (lib/colourMapping.js — shared with grid-svg.js/voronoi-svg.js/
// escher-svg.js once they needed the identical logic) keeps that
// contract true for any tones count from 2 to 5 without special-casing
// any of them. Re-exported here so existing imports of `DEFAULT_COLOURS`
// from this file keep working.
export { DEFAULT_COLOURS };

// How many offset bands to draw in each direction before the naive
// per-vertex-miter offset (see header comment) becomes unreliable —
// as a function of segments, not a single constant. Two different
// failure modes, both matched visually against the actual rendered
// output rather than assumed from theory:
//   - Density, at high segments: starOutline's silhouette has
//     2*segments vertices, so more offset edges are packed into the
//     same medallion radius, and their offset copies start overlapping
//     each other before any individual corner even hits MITER_LIMIT.
//     segments <= 8 tolerates 2 bands clean; 9-11 tolerates 1 (2 already
//     visibly tangles); 12+ tolerates 0 (even 1 already merges into a
//     solid ring rather than a legible extra star).
//   - Sharpness, at segments = 5 specifically: starSkip(5) = 2 gives
//     the single sharpest tip angle in the whole 3-16 range (sharper
//     than segments 6 at the same skip, and sharper than 7-8's own
//     skip = 3) — MITER_LIMIT bevels each corner individually, but nested
//     bevelled corners from adjacent tips still visibly tangle at 2
//     bands where every other segments value stays clean, so this one
//     value is capped tighter than the density rule alone would give it.
function _maxBands(n) {
   if (n === 5) return 1;
   if (n <= 8) return 2;
   if (n <= 11) return 1;
   return 0;
}

export function islamicSvg(width, height, params) {
   const {
      tileSize = 100, segments = 8, frequency = 0.15, lineWidth = 0.06,
      tones = "2", tileShape = "square", scale = 0.42, rotation = 0,
      colour1, colour2, colour3, colour4, colour5,
   } = params;

   const n = Math.max(3, Math.round(segments));
   const radius = tileSize * scale; // self-contained medallion — see islamic.js
   const fill = svgFillsFor(tones, [colour1, colour2, colour3, colour4, colour5]);

   const circle = constructionCircle(0, 0, radius);
   // Base alignment (tip 0 at 90 degrees) plus `rotation`, snapped to
   // 180/segments — see islamic.js's header comment and snapRotation
   // (shared, not re-derived here) for why that increment.
   const snappedDeg = snapRotation(rotation, n);
   const points = radialDivisions(circle, n, Math.PI / 2 + (snappedDeg * Math.PI) / 180);
   const outline = starOutline(points, starSkip(n));
   const rings = _buildRings(outline, radius, frequency, lineWidth, fill, _maxBands(n));

   return tileShape === "hexagon"
      ? _hexPattern(width, height, tileSize, rings)
      : _squarePattern(width, height, tileSize, rings);
}

// ── Cell layouts ─────────────────────────────────────────────────────────

function _squarePattern(width, height, tileSize, rings) {
   const S = tileSize;
   // The clip rect is defined in the group's own (already-translated)
   // local frame — same frame the medallion rings are drawn in, centred
   // on local (0, 0) — so it must be centred there too (-S/2..S/2), not
   // at the tile's absolute 0..S.
   const clipShape = `<rect x="${-S / 2}" y="${-S / 2}" width="${S}" height="${S}"/>`;
   const cell = _ringsGroup(rings, S / 2, S / 2, clipShape, "sq-clip");

   const defs = [cell.clipDef, `<pattern id="islamic-tile" x="0" y="0" width="${S}" height="${S}" patternUnits="userSpaceOnUse">${cell.group}</pattern>`];
   return _svgTag(width, height, defs);
}

function _hexPattern(width, height, tileSize, rings) {
   // Pointy-top hex lattice, matching lib/latticeIndex.js's hexagonCentroid:
   // horizontal period W = tileSize * sqrt(3) (one hex's own flat-to-flat
   // width), vertical period H = tileSize * 3 covering the two row phases.
   const W = tileSize * Math.sqrt(3);
   const H = tileSize * 3;
   const hexPoints = _hexagonPoints(tileSize);
   const clipDef = `<clipPath id="hex-clip"><polygon points="${_ptsStr(hexPoints)}"/></clipPath>`;

   // The two row-phase centres within one rectangular repeat unit —
   // see this file's header comment for why each needs the 3x3 offset
   // duplication below rather than a single placement.
   const centres = [
      [0, tileSize],           // row phase A
      [W / 2, tileSize * 2.5], // row phase B (offset by W/2 horizontally, H/2 vertically)
   ];

   const groups = [];
   for (const [bx, by] of centres) {
      for (const dx of [-W, 0, W]) {
         for (const dy of [-H, 0, H]) {
            const px = bx + dx, py = by + dy;
            // Skip instances that can't possibly reach the [0,W]x[0,H] tile
            // box — a hex of circumradius tileSize is fully outside it once
            // its centre is more than tileSize away from every edge.
            if (px < -tileSize || px > W + tileSize || py < -tileSize || py > H + tileSize) continue;
            groups.push(
               `<g clip-path="url(#hex-clip)" transform="translate(${_r(px)},${_r(py)})">${rings.join("")}</g>`
            );
         }
      }
   }

   const defs = [clipDef, `<pattern id="islamic-tile" x="0" y="0" width="${W}" height="${H}" patternUnits="userSpaceOnUse">${groups.join("")}</pattern>`];
   return _svgTag(width, height, defs);
}

function _ringsGroup(rings, cx, cy, clipShape, clipId) {
   const clipDef = `<clipPath id="${clipId}">${clipShape}</clipPath>`;
   const group = `<g clip-path="url(#${clipId})" transform="translate(${_r(cx)},${_r(cy)})">${rings.join("")}</g>`;
   return { clipDef, group };
}

function _svgTag(width, height, defs) {
   return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" overflow="hidden">` +
      `<defs>${defs.join("")}</defs><rect width="${width}" height="${height}" fill="url(#islamic-tile)"/></svg>`;
}

// Pointy-top hexagon vertices (a point straight up), matching
// lib/latticeIndex.js's hexagonCentroid convention, circumradius = size.
function _hexagonPoints(size) {
   const pts = [];
   for (let k = 0; k < 6; k++) {
      const theta = (Math.PI / 180) * (-90 + 60 * k);
      pts.push(size * Math.cos(theta), size * Math.sin(theta));
   }
   return pts;
}

// ── Medallion rings (shared by both layouts, drawn in local coordinates
// centred on the medallion's own origin — the caller translates) ───────────

function _buildRings(outline, radius, frequency, lineWidth, fill, maxBands) {
   // Relative to the medallion's own radius, not a raw spatial frequency
   // — see islamic.js's header comment for why.
   const step = radius / frequency;
   // Independent of step/frequency (see islamic.js's header comment) —
   // both sides of the line, so the total is double lineWidth * radius.
   const strokeWidth = 2 * lineWidth * radius;

   const outward = [];
   for (let i = 0; i < maxBands; i++) outward.push(_offset(outline, (i + 1) * step));

   const inward = [];
   let prevRadius = Infinity;
   for (let i = 0; i < maxBands; i++) {
      const poly = _offset(outline, -(i + 1) * step);
      const r = _minRadius(poly);
      if (!isFinite(r) || r >= prevRadius) break;
      inward.push(poly);
      prevRadius = r;
   }

   const rings = [`<rect x="-9999" y="-9999" width="19998" height="19998" fill="${fill[0]}"/>`];
   // bandTone (lib/colourMapping.js): band 0 (the medallion's own
   // boundary) is always the darkest tone; every other echo cycles
   // through whichever tones are left — same rule islamic.js's raster
   // uses, so the two renderers agree band-for-band.
   rings.push(_strokeTag(outline, bandTone(fill, 0), strokeWidth));
   outward.forEach((poly, i) => rings.push(_strokeTag(poly, bandTone(fill, i + 1), strokeWidth)));
   inward.forEach((poly, i) => rings.push(_strokeTag(poly, bandTone(fill, -(i + 1)), strokeWidth)));
   return rings;
}

function _minRadius(poly) {
   let min = Infinity;
   for (let i = 0; i < poly.length; i += 2) min = Math.min(min, Math.hypot(poly[i], poly[i + 1]));
   return min;
}

// A vertex offset by d shouldn't move farther than this many multiples of
// |d| from its original position — a real (Euclidean-distance) parallel
// offset curve rounds off a sharp corner instead of extending its point
// arbitrarily far, so a sharp miter here is only an approximation of that
// near the corner. Capping it (the same idea as SVG's own stroke-
// miterlimit) matters a lot for this shape: a rosette's tip corners can be
// intentionally acute (an 18-degree half-angle at n=5, cos/sin math giving
// a miter length over 3x |d|), so an uncapped miter balloons the outward
// bands to several times the cell's own size within a couple of steps —
// confirmed visually: uncapped, a handful of bands already reach 3x the
// medallion's own radius, and clipping *that* to the cell box just shows
// a handful of the star's own thin arms slicing through the cell corner
// at different scales, which reads as fine unrelated stripes, not rings.
const MITER_LIMIT = 1.8;

// Perpendicular offset of a closed, star-shaped-about-the-origin polygon:
// shift every edge outward (d > 0) or inward (d < 0) along its own unit
// normal, then rebuild each vertex as the intersection of its two
// adjacent shifted edges — falling back to a bevel (the offset edges'
// own endpoints, unjoined) wherever that intersection would exceed
// MITER_LIMIT, per the comment above.
function _offset(outline, d) {
   const n = outline.length / 2;
   const shifted = [];
   for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const x1 = outline[i * 2], y1 = outline[i * 2 + 1];
      const x2 = outline[j * 2], y2 = outline[j * 2 + 1];
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      let nx = dy / len, ny = -dx / len;
      const midx = (x1 + x2) / 2, midy = (y1 + y2) / 2;
      if (nx * midx + ny * midy < 0) { nx = -nx; ny = -ny; } // point outward
      shifted.push({ x1: x1 + nx * d, y1: y1 + ny * d, x2: x2 + nx * d, y2: y2 + ny * d });
   }

   const out = [];
   const limit = Math.abs(d) * MITER_LIMIT;
   for (let i = 0; i < n; i++) {
      const ox = outline[i * 2], oy = outline[i * 2 + 1]; // original vertex
      const prev = shifted[(i - 1 + n) % n];
      const cur = shifted[i];
      const hit = lineIntersect(prev.x1, prev.y1, prev.x2, prev.y2, cur.x1, cur.y1, cur.x2, cur.y2);
      if (hit && Math.hypot(hit.x - ox, hit.y - oy) <= limit) {
         out.push(hit.x, hit.y);
      } else {
         out.push(prev.x2, prev.y2, cur.x1, cur.y1); // bevel: two points, not one
      }
   }
   return Float32Array.from(out);
}

function _strokeTag(poly, color, strokeWidth) {
   return `<polygon points="${_ptsStr(poly)}" fill="none" stroke="${color}" stroke-width="${_r(strokeWidth)}"/>`;
}

function _ptsStr(coords) {
   const pts = [];
   for (let i = 0; i < coords.length; i += 2) pts.push(`${_r(coords[i])},${_r(coords[i + 1])}`);
   return pts.join(" ");
}

function _r(n) { return Math.round(n * 100) / 100; }
