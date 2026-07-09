/*
========================================
GENERIC GENERATOR CONFORMANCE SUITE
========================================
* Runs the contract in docs/generator-contract.md against every REGISTRY entry.
* New patterns get range/determinism/totality checks for free — nothing to add here
* when a new pattern is registered.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { REGISTRY } from "../../patternRegistry.js";
import { GENERATORS } from "../index.js";
import { paramsArbitrary, pointArbitrary } from "./contract.js";

describe.each(REGISTRY)("contract: $id", (entry) => {
   const fn = GENERATORS[entry.generator];

   it("is registered", () => {
      expect(typeof fn).toBe("function");
   });

   it("returns a finite number in [-1, 1] for any point and declared params", () => {
      fc.assert(
         fc.property(pointArbitrary(), paramsArbitrary(entry), ({ x, y }, params) => {
            const v = fn(x, y, params);
            expect(Number.isFinite(v)).toBe(true);
            expect(v).toBeGreaterThanOrEqual(-1);
            expect(v).toBeLessThanOrEqual(1);
         })
      );
   });

   it("is deterministic for a fixed (x, y, params)", () => {
      fc.assert(
         fc.property(pointArbitrary(), paramsArbitrary(entry), ({ x, y }, params) => {
            const a = fn(x, y, { ...params });
            const b = fn(x, y, { ...params });
            expect(a).toBe(b);
         })
      );
   });
});
