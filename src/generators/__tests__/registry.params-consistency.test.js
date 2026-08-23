/*
========================================
REGISTRY PARAM CONSISTENCY CHECK
========================================
* Every param a pattern declares in patternRegistry.js should actually be
* read by the generator function that renders it. Otherwise the UI exposes
* a control that silently does nothing.
*
* "Renders it" depends on nativeFormat: "raster" patterns are drawn by
* GENERATORS[generator] (see ui.js _showRaster), "vector" patterns are
* drawn exclusively by SVG_GENERATORS[generator] (see ui.js _renderSvg) —
* the raster twin, if one exists, is never invoked for that pattern. One
* exception: a raster pattern's `colour1`/`colour2` (added 2026-08-21) are
* read by render.js's `mapColour`, not the generator itself — the same
* "Colour Mapping is a separate stage from the generator's own math" split
* every vector pattern's colourN/SVG renderer already embodies, just made
* visible for raster patterns too (see render.js's mapColour header
* comment) — so those two params are checked against mapColour instead.
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
   return new RegExp(`\\b${paramName}\\b`).test(fn.toString());
}

describe.each(REGISTRY)("registry params vs generator: $id", (entry) => {
   const fn = entry.nativeFormat === "vector"
      ? SVG_GENERATORS[entry.generator]
      : GENERATORS[entry.generator];

   it(`has a registered ${entry.nativeFormat} generator for "${entry.generator}"`, () => {
      expect(typeof fn).toBe("function");
   });

   for (const { param } of entry.params) {
      const isRasterColour = entry.nativeFormat === "raster" && (param === "colour1" || param === "colour2");
      const checkFn = isRasterColour ? mapColour : fn;
      const readBy = isRasterColour ? "render.js's mapColour" : `the ${entry.nativeFormat} generator`;

      it(`param "${param}" is read by ${readBy}`, () => {
         expect(isReadByFn(checkFn, param)).toBe(true);
      });
   }
});
