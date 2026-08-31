/*
========================================
PATTERN RENDERER
========================================
* Converts values to pixels
* Determins how pattern is displayed
-----------------------------------------
*/
import { hexToRgb, mixHex, DEFAULT_COLOURS } from "./generators/lib/colourMapping.js";

export function grayscale(value) {

   const c = Math.floor((value + 1) * 127.5);

   return {
      r: c,
      g: c,
      b: c,
      a: 255
   };
}

// Extends grayscale() to any pattern's colour1 (+1, light) .. colourN (-1,
// dark) params, linearly interpolated across however many tones (2-5) the
// pattern declares. Two-tone defaults match grayscale() exactly
// (short-circuited below), so patterns without these params are unaffected.
// A `value` that's already quantised to one of toneSet(tones)'s evenly
// spaced points (as voronoiIslamic.js's bandTone output is) lands exactly on
// a colourN stop rather than a blend between two, so tones > 2 reads as
// distinct declared colours, not just a finer 2-colour gradient.
export function mapColour(value, params = {}) {
   const tones = Math.max(2, Math.min(5, Math.round(Number(params.tones)) || 2));

   if (tones === 2) {
      const low  = params.colour1 ?? "#ffffff";
      const high = params.colour2 ?? "#000000";
      if (low === "#ffffff" && high === "#000000") return grayscale(value);

      const t = (1 - Math.max(-1, Math.min(1, value))) / 2;
      const { r, g, b } = hexToRgb(mixHex(low, high, t));
      return { r, g, b, a: 255 };
   }

   const colours = Array.from({ length: tones }, (_, i) => params[`colour${i + 1}`] ?? DEFAULT_COLOURS[i]);
   const segment = ((1 - Math.max(-1, Math.min(1, value))) / 2) * (tones - 1);
   const i = Math.min(tones - 2, Math.floor(segment));
   const { r, g, b } = hexToRgb(mixHex(colours[i], colours[i + 1], segment - i));
   return { r, g, b, a: 255 };
}

