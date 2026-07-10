/*
========================================
ISLAMIC GEOMETRIC PATTERNS — SVG RENDERER
========================================
Renders one tile's geometry once and repeats it via an SVG <pattern> (like
wave-svg.js's stripes), rather than looping tiles in JS like grid-svg.js/
escher-svg.js — islamic.js's per-tile point set can need many concentric
rings per point (see below), so tiling in SVG itself keeps element count
bounded by one tile's geometry regardless of how many times it repeats
across the canvas.

Within one tile: n construction points are placed evenly around a circle
(mirrors lib/constructionCircle.js), each point's Voronoi cell is computed
via the same Sutherland-Hodgman half-plane clip voronoi-svg.js uses (bounded
to the tile's own box, not seeded randomly — same clip, deterministic
points), and concentric rings are drawn inside a <clipPath> for that cell so
each pixel only ever sees rings from its nearest point — matching
islamic.js's nearestPoint-then-distance-band construction exactly.

"rosette" mode: rings are discrete tone bands, drawn outside-in so each
band's outer radius overwrites the previous band correctly — mirrors
islamic.js's `Math.floor(dist * frequency) % shades.length`.

"star-lines" mode: rings are per-pixel-radius grayscale circles coloured by
sin(r * frequency), the same technique and grayscale mapping as
wave-svg.js's `_rings` (`c = (sin+1) x 127.5`, matching render.js).

API: islamicSvg(width, height, params) → SVG string
*/

const FILLS = {
   "2": ["#fff", "#000"],
   "3": ["#fff", "#888", "#000"],
};

export function islamicSvg(width, height, params) {
   const {
      tileSize = 100, segments = 8, frequency = 0.15,
      mode = "rosette", tones = "2",
   } = params;

   const S      = tileSize;
   const n      = Math.max(3, Math.round(segments));
   const radius = S * 0.42;
   const fill   = FILLS[tones] ?? FILLS["2"];
   const maxR   = Math.hypot(S, S); // tile diagonal — safely covers any cell

   const points = [];
   for (let i = 0; i < n; i++) {
      const angle = (i * 2 * Math.PI) / n;
      points.push([S / 2 + radius * Math.cos(angle), S / 2 + radius * Math.sin(angle)]);
   }

   const defs = [];
   const tileParts = [];

   for (let i = 0; i < n; i++) {
      let cell = [[0, 0], [S, 0], [S, S], [0, S]];
      for (let j = 0; j < n; j++) {
         if (i === j) continue;
         cell = _clip(cell, points[i][0], points[i][1], points[j][0], points[j][1]);
         if (cell.length === 0) break;
      }
      if (cell.length < 3) continue;

      const clipId = `islamic-cell-${i}`;
      defs.push(`<clipPath id="${clipId}"><polygon points="${_ptsStr(cell.flat())}"/></clipPath>`);

      const rings = mode === "star-lines"
         ? _starLinesRings(points[i], maxR, frequency)
         : _rosetteRings(points[i], maxR, frequency, fill);
      tileParts.push(`<g clip-path="url(#${clipId})">${rings.join("")}</g>`);
   }

   defs.push(
      `<pattern id="islamic-tile" x="0" y="0" width="${S}" height="${S}" patternUnits="userSpaceOnUse">` +
      tileParts.join("") + `</pattern>`
   );

   return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" overflow="hidden">` +
      `<defs>${defs.join("")}</defs><rect width="${width}" height="${height}" fill="url(#islamic-tile)"/></svg>`;
}

// ── Ring drawing ─────────────────────────────────────────────────────────────

// Discrete tone bands, outside-in — each band's k = floor(dist * frequency),
// coloured fill[k % fill.length], matching islamic.js's rosette mode exactly.
function _rosetteRings(point, maxR, frequency, fill) {
   const maxK = Math.max(0, Math.ceil(maxR * frequency));
   const out  = [];
   for (let k = maxK; k >= 0; k--) {
      const rad = (k + 1) / frequency;
      const idx = ((k % fill.length) + fill.length) % fill.length;
      out.push(`<circle cx="${_r(point[0])}" cy="${_r(point[1])}" r="${_r(rad)}" fill="${fill[idx]}"/>`);
   }
   return out;
}

// Continuous grayscale, one ring per integer pixel of radius, matching
// islamic.js's star-lines mode (sin(dist * frequency)) and wave-svg.js's
// grayscale mapping.
function _starLinesRings(point, maxR, frequency) {
   const out = [];
   for (let rad = Math.ceil(maxR); rad >= 0; rad--) {
      const c = Math.round((Math.sin(rad * frequency) + 1) * 127.5);
      out.push(`<circle cx="${_r(point[0])}" cy="${_r(point[1])}" r="${rad}" fill="${_gray(c)}"/>`);
   }
   return out;
}

// ── Geometry (Sutherland-Hodgman, mirrors voronoi-svg.js's _clip/_intersect) ──

function _clip(poly, px, py, qx, qy) {
   const a = 2 * (qx - px);
   const b = 2 * (qy - py);
   const c = qx * qx - px * px + qy * qy - py * py;
   const inside = ([x, y]) => a * x + b * y <= c;

   const out = [];
   for (let i = 0; i < poly.length; i++) {
      const curr = poly[i];
      const next = poly[(i + 1) % poly.length];
      const cIn  = inside(curr);
      const nIn  = inside(next);
      if (cIn) out.push(curr);
      if (cIn !== nIn) out.push(_intersect(curr, next, a, b, c));
   }
   return out;
}

function _intersect([x1, y1], [x2, y2], a, b, c) {
   const dx = x2 - x1, dy = y2 - y1;
   const t  = (c - a * x1 - b * y1) / (a * dx + b * dy);
   return [x1 + t * dx, y1 + t * dy];
}

// ── SVG helpers ───────────────────────────────────────────────────────────────

function _ptsStr(coords) {
   const pts = [];
   for (let i = 0; i < coords.length; i += 2) pts.push(`${_r(coords[i])},${_r(coords[i + 1])}`);
   return pts.join(" ");
}

function _gray(c) {
   const h = c.toString(16).padStart(2, "0");
   return `#${h}${h}${h}`;
}

function _r(n) { return Math.round(n * 100) / 100; }
