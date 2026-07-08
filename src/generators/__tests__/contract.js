/*
========================================
CONTRACT TEST HELPERS
========================================
* Builds fast-check arbitraries for a REGISTRY entry's params and for canvas points,
* so the generic conformance suite (and per-generator property tests) can sample
* realistic inputs without hand-writing a generator per pattern.
*/
import fc from "fast-check";
import { CANVAS } from "../../config.js";

export function paramsArbitrary(entry) {
   const shape = {};
   for (const p of entry.params) {
      if (p.map) {
         const [min, max] = p.map;
         shape[p.param] = fc.double({ min, max, noNaN: true });
      } else if (p.control === "select") {
         shape[p.param] = fc.constantFrom(...p.options);
      } else {
         shape[p.param] = fc.constant(p.value);
      }
   }
   return fc.record(shape);
}

export function pointArbitrary() {
   return fc.record({
      x: fc.double({ min: 0, max: CANVAS.WIDTH, noNaN: true }),
      y: fc.double({ min: 0, max: CANVAS.HEIGHT, noNaN: true }),
   });
}
