/*
========================================
PATTERN RENDERER
========================================
* Converts values to pixels
* Determins how pattern is displayed
-----------------------------------------
*/
import { hexToRgb, mixHex } from "./generators/lib/colourMapping.js";

export function grayscale(value) {

   const c = Math.floor((value + 1) * 127.5);

   return {
      r: c,
      g: c,
      b: c,
      a: 255
   };
}

// Generalises grayscale() to any raster pattern's own colour1/colour2
// params (added 2026-08-21 so every raster-only pattern — Perlin/Ridge
// Noise, the two Hybrid patterns — gets the same colour-editing capability
// every vector pattern already has via colour1..colour5, closing the
// "Colour Mapping node isn't editable for most patterns" gap). value = +1
// maps to colour1 (light/background, default white — matching
// grayscale()'s own white-at-+1 convention, and every SVG renderer's
// colour1 slot), value = -1 maps to colour2 (dark/primary, default
// black). Continuous values interpolate linearly between the two, which
// also gives sensible results for discrete multi-tone raster output
// (e.g. voronoiIslamic's toneSet/bandTone bands) since toneSet's values
// are already evenly spaced across the same [-1, 1] range this
// interpolates over — one gradient primitive covers both cases rather
// than a second discrete-lookup implementation duplicating svgFillsFor
// for raster. At the default colours this is pixel-identical to
// grayscale() (short-circuited below, not just numerically close), so
// every pattern that doesn't declare colour1/colour2 renders exactly as
// before.
export function mapColour(value, params = {}) {
   const low  = params.colour1 ?? "#ffffff";
   const high = params.colour2 ?? "#000000";
   if (low === "#ffffff" && high === "#000000") return grayscale(value);

   const t = (1 - Math.max(-1, Math.min(1, value))) / 2;
   const { r, g, b } = hexToRgb(mixHex(low, high, t));
   return { r, g, b, a: 255 };
}

