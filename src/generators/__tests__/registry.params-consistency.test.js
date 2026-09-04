/*
========================================
REGISTRY PARAM CONSISTENCY CHECK
========================================
* Every param a pattern declares in patternRegistry.js should actually be
* read by the generator function that renders it. Otherwise the UI exposes
* a control that silently does nothing.
*
* "raster" patterns are checked against GENERATORS[generator]; "vector"
* patterns against SVG_GENERATORS[generator]. A raster pattern's own
* colour1/colour2 are checked against render.js's mapColour instead,
* since those are read there, not by the generator itself.
*
* This is a lightweight source-text check (fn.toString() + word-boundary
* regex), not a data-flow analysis — it catches the common case of a
* declared param nobody destructures/reads, without needing an AST parser.
*/
import { describe, it, expect } from "vitest";
import { REGISTRY }       from "../../patternRegistry.js";
import { GENERATORS }     from "../index.js";
import { SVG_GENERATORS } from "../svg/index.js";
import { mapColour }      from "../../render.js";

function isReadByFn(fn, paramName) {
   const src = fn.toString();
   if (new RegExp(`\\b${paramName}\\b`).test(src)) return true;
   // colourN stops (mapColour's tones>2 path) and recursiveNoise.js's
   // per-level amplitudeN/scaleN/octavesN are all read via a template
   // literal (`colour${i}`, `amplitude${i + 1}`), not a literal identifier —
   // no single colourN/amplitudeN/scaleN/octavesN token to match, so fall
   // back to checking for that dynamic access.
   return (
      (/^colour\d+$/.test(paramName) && /colour\$\{/.test(src)) ||
      (/^amplitude\d+$/.test(paramName) && /amplitude\$\{/.test(src)) ||
      (/^scale\d+$/.test(paramName) && /scale\$\{/.test(src)) ||
      (/^octaves\d+$/.test(paramName) && /octaves\$\{/.test(src))
   );
}

describe.each(REGISTRY)("registry params vs generator: $id", (entry) => {
   const fn = entry.nativeFormat === "vector"
      ? SVG_GENERATORS[entry.generator]
      : GENERATORS[entry.generator];

   it(`has a registered ${entry.nativeFormat} generator for "${entry.generator}"`, () => {
      expect(typeof fn).toBe("function");
   });

   for (const { param } of entry.params) {
      const isRasterColour = entry.nativeFormat === "raster" && /^colour\d+$/.test(param);
      const checkFn = isRasterColour ? mapColour : fn;
      const readBy = isRasterColour ? "render.js's mapColour" : `the ${entry.nativeFormat} generator`;

      it(`param "${param}" is read by ${readBy}`, () => {
         expect(isReadByFn(checkFn, param)).toBe(true);
      });
   }
});
