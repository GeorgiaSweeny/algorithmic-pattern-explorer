/*
========================================
PARAM DOCS — COVERAGE CHECK
========================================
* Every param any REGISTRY entry declares should resolve to an actual
* description via paramDoc() — the documentation-side equivalent of
* registry.params-consistency.test.js's "is it actually read" check. A
* param the user can edit but nothing documents would leave "what does
* this do?" unanswered.
*/
import { describe, it, expect } from "vitest";
import { REGISTRY } from "../../patternRegistry.js";
import { paramDoc } from "./nodeDocs.js";

describe.each(REGISTRY)("param docs vs registry: $id", (entry) => {
   for (const { param } of entry.params) {
      it(`param "${param}" has a documented description`, () => {
         expect(paramDoc(entry.generator, param)).toBeTruthy();
      });
   }
});
