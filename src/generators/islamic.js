/*
========================================
ISLAMIC GEOMETRIC PATTERN GENERATOR
========================================
* Composition: Grid (tile lookup) -> Construction Circle -> Radial Divisions
* -> Distance Field -> [Waveform, "star-lines" mode only] -> Colour Mapping.
* See src/generators/lib/ — every stage below is a reusable node-shaped primitive.
*
* This is a deliberately scoped-down reading of the shape-grammar method used
* by the reference Houdini tool (docs/references/Maths to Magic...pdf): that
* tool builds a motif by translating a shape off-centre, then rotating +
* boolean-unioning n copies of it around a construction circle. The per-pixel
* equivalent of "place n rotated copies around a circle" is placing n points
* evenly around that circle directly (Radial Divisions) and asking, per pixel,
* which is nearest — the same Distance Field search voronoi.js already does,
* just fed by a deterministic angular point set instead of an RNG-scattered
* one (see src/generators/lib/constructionCircle.js). No boolean/CSG geometry,
* no arbitrary shape grammar — full authoring flexibility is out of scope for
* an educational node (docs/UI_DESIGN.md: users cannot construct new
* algorithms), but the *mechanism* (radial symmetry via a deterministic
* distance field) is the one the reference research actually demonstrates.
*
* Two modes:
*   "rosette"    — distance to the nearest construction point is banded into
*                  the tone set directly, giving a filled Voronoi-like rosette
*                  with n-fold symmetry.
*   "star-lines" — that same distance is passed through a Waveform (sineWave),
*                  the same "distance -> sin" step wave.js's "rings" mode
*                  uses, giving concentric line work radiating from each
*                  construction point instead of a flat fill.
*/
import { constructionCircle, radialDivisions } from "./lib/constructionCircle.js";
import { nearestPoint } from "./lib/distanceField.js";
import { sineWave } from "./lib/waveform.js";
import { toneSet } from "./lib/colourMapping.js";

// Construction points depend only on (segments, radius) — deterministic and
// tile-independent (every tile reuses the same point set in local space), so
// a single small cache covers the whole canvas regardless of grid density.
const _cache = new Map();
function getConstructionPoints(segments, radius) {
   const key = `${segments}|${radius}`;
   if (!_cache.has(key)) {
      const circle = constructionCircle(0, 0, radius);
      _cache.set(key, radialDivisions(circle, segments));
   }
   return _cache.get(key);
}

export function islamic(x, y, params) {
   const {
      tileSize = 100,
      segments = 8,
      frequency = 0.15,
      mode = "rosette",
      tones = "2",
   } = params;

   const shades = toneSet(tones);

   // Grid: which tile is (x, y) in, and where is its centre.
   const col = Math.floor(x / tileSize);
   const row = Math.floor(y / tileSize);
   const cx = (col + 0.5) * tileSize;
   const cy = (row + 0.5) * tileSize;

   // Local coordinates relative to this tile's construction-circle centre.
   const lx = x - cx, ly = y - cy;

   // Radius is fixed by the tile geometry (not a free parameter) so the
   // construction circle always fits inside its tile without touching the
   // edge — the same "fixed by geometry, not a free choice" idea
   // docs/UI_DESIGN.md uses for grid.js's rotation/translation values.
   const radius = tileSize * 0.42;
   const points = getConstructionPoints(segments, radius);

   const { distSq } = nearestPoint(lx, ly, points);
   const dist = Math.sqrt(distSq);

   if (mode === "star-lines") {
      return sineWave(dist, frequency);
   }

   const idx = ((Math.floor(dist * frequency) % shades.length) + shades.length) % shades.length;
   return shades[idx];
}
