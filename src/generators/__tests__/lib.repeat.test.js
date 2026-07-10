/*
========================================
REPEAT (POWER) — PRIMITIVE-LEVEL PROPERTIES
========================================
* Tests repeat() in isolation, independent of recursive.js/subdivideCell, so
* the repeat/power combinator itself (docs/ALGORITHMIC_COMPOSITION_RESEARCH.md)
* is verified directly rather than only through recursive.js's own property tests.
*/
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { repeat } from "../lib/repeat.js";

describe("repeat: primitive-level invariants", () => {
   it("n = 0 never calls step and reports not-stopped with the initial value", () => {
      fc.assert(
         fc.property(fc.integer(), (initialValue) => {
            let calls = 0;
            const result = repeat(() => { calls++; return { stop: false, value: null }; }, 0, initialValue);
            expect(calls).toBe(0);
            expect(result).toEqual({ stopped: false, value: initialValue });
         })
      );
   });

   it("a step that never stops runs exactly n times, threading its value through", () => {
      fc.assert(
         fc.property(fc.integer({ min: 0, max: 50 }), (n) => {
            const result = repeat((value) => ({ stop: false, value: value + 1 }), n, 0);
            expect(result).toEqual({ stopped: false, value: n });
         })
      );
   });

   it("stops as soon as step reports stop, without running further iterations", () => {
      fc.assert(
         fc.property(
            fc.integer({ min: 1, max: 20 }), fc.integer({ min: 0, max: 19 }),
            (n, stopAt) => {
               fc.pre(stopAt < n);
               let calls = 0;
               const result = repeat(
                  (value, i) => {
                     calls++;
                     if (i === stopAt) return { stop: true, value: "stopped" };
                     return { stop: false, value };
                  },
                  n, "initial"
               );
               expect(result).toEqual({ stopped: true, value: "stopped" });
               expect(calls).toBe(stopAt + 1);
            }
         )
      );
   });
});
