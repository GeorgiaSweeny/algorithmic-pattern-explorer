/*
========================================
PARAM DOCS — COVERAGE CHECK
========================================
* Every param any REGISTRY entry declares should resolve to an actual
* description via paramDoc(), the same way registry.params-consistency.test.js
* (src/generators/__tests__/) checks that every declared param is actually
* read by its generator — this is the documentation-side equivalent: a
* param a user can see and edit but that the Documentation Panel has
* nothing to say about would leave "what does this do?" unanswered.
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
