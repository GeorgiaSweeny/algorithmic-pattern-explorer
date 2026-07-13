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
* the raster twin, if one exists, is never invoked for that pattern.
*
* This is a lightweight source-text check (fn.toString() + word-boundary
* regex), not a data-flow analysis — it catches the common case of a
* declared param nobody destructures/reads, without needing an AST parser.
*/
import { describe, it, expect } from "vitest";
import { REGISTRY }       from "../../patternRegistry.js";
import { GENERATORS }     from "../index.js";
import { SVG_GENERATORS } from "../svg/index.js";

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
      it(`param "${param}" is read by the ${entry.nativeFormat} generator`, () => {
         expect(isReadByFn(fn, param)).toBe(true);
      });
   }
});
