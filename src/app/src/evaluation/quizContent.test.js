import { describe, it, expect } from "vitest";
import { REGISTRY } from "../../../patternRegistry.js";
import { STUDY1_QUESTIONS, STUDY2_QUESTIONS, SPECTRUM_OPTIONS } from "./quizContent.js";

// Every id in patternRegistry.js — image-bearing items reference these
// live rather than a static asset, so the one thing worth checking here
// is that the id actually still exists (a renamed/removed registry entry
// should fail this test, not surface as a runtime crash in the quiz).
const REGISTRY_IDS = new Set(REGISTRY.map((e) => e.id));

describe("STUDY1_QUESTIONS: content shape", () => {
   it("every question has a unique id, a prompt, exactly 5 options, and a valid correctIndex", () => {
      const ids = new Set();
      for (const q of STUDY1_QUESTIONS) {
         expect(ids.has(q.id)).toBe(false);
         ids.add(q.id);
         expect(typeof q.prompt).toBe("string");
         expect(q.prompt.length).toBeGreaterThan(0);
         // 5 options by design (see quizContent.js's own header comment):
         // 1 correct, 1 obviously-wrong, 1 near-miss, 2 mid-plausibility —
         // not just "at least 2", so a stray 4-option question regresses
         // the calibration silently.
         expect(q.options.length).toBe(5);
         expect(new Set(q.options).size).toBe(5); // no duplicate options
         expect(q.correctIndex).toBeGreaterThanOrEqual(0);
         expect(q.correctIndex).toBeLessThan(q.options.length);
         expect(typeof q.concept).toBe("string");
      }
   });

   it("covers every one of this project's own nine named computational-thinking concepts at least once", () => {
      const NAMED_CONCEPTS = [
         "Randomness", "Iteration", "Transformation", "Symmetry",
         "Rule-based generation", "Parameterisation", "Emergence",
         "Procedural modelling", "Computational creativity",
      ];
      const covered = new Set(STUDY1_QUESTIONS.map((q) => q.concept));
      for (const concept of NAMED_CONCEPTS) {
         expect(covered.has(concept), `no question tagged "${concept}"`).toBe(true);
      }
   });
});

describe("STUDY2_QUESTIONS: content shape", () => {
   it("every question has a unique id, a prompt, and a concept", () => {
      const ids = new Set();
      for (const q of STUDY2_QUESTIONS) {
         expect(ids.has(q.id)).toBe(false);
         ids.add(q.id);
         expect(typeof q.prompt).toBe("string");
         expect(q.prompt.length).toBeGreaterThan(0);
         expect(typeof q.concept).toBe("string");
      }
   });

   it("every text-option item (cause/spectrum) has exactly 5 distinct options and a valid correctIndex", () => {
      // "spectrum" items reuse "mc"'s 5-option shape with the app's own 5
      // stochastic<->deterministic bins as options; "cause" keeps Study 1's
      // 1-correct/4-distractor structure over an image pair instead of text.
      for (const q of STUDY2_QUESTIONS) {
         if (!["cause", "spectrum"].includes(q.type)) continue;
         expect(q.options.length).toBe(5);
         expect(new Set(q.options).size).toBe(5);
         expect(q.correctIndex).toBeGreaterThanOrEqual(0);
         expect(q.correctIndex).toBeLessThan(q.options.length);
      }
   });

   it("every image-candidate item (predict/concept-match) has a valid correctIndex into its candidates", () => {
      for (const q of STUDY2_QUESTIONS) {
         if (q.type !== "predict" && q.type !== "concept-match") continue;
         expect(q.candidates.length).toBeGreaterThanOrEqual(3);
         expect(q.correctIndex).toBeGreaterThanOrEqual(0);
         expect(q.correctIndex).toBeLessThan(q.candidates.length);
      }
   });

   it("every node-select item's correctNodeSet is a non-empty subset of its nodeOptions", () => {
      for (const q of STUDY2_QUESTIONS) {
         if (q.type !== "node-select") continue;
         expect(q.correctNodeSet.length).toBeGreaterThan(0);
         for (const node of q.correctNodeSet) {
            expect(q.nodeOptions).toContain(node);
         }
      }
   });

   it("every order item's correctSequence is a permutation of its nodeSequence", () => {
      for (const q of STUDY2_QUESTIONS) {
         if (q.type !== "order") continue;
         expect(q.correctSequence.length).toBe(q.nodeSequence.length);
         expect(new Set(q.correctSequence)).toEqual(new Set(q.nodeSequence));
         expect(new Set(q.nodeSequence).size).toBe(q.nodeSequence.length); // no duplicate node names
         // The displayed (shuffled) order shouldn't already be the answer —
         // otherwise the item can be solved without reading it.
         expect(q.nodeSequence).not.toEqual(q.correctSequence);
      }
   });

   it("every entryId (and every concept-match candidate's entryId) names a real patternRegistry.js entry", () => {
      // "predict"'s own candidates share the question's single entryId
      // (only params change per candidate), so only the question-level
      // entryId needs checking there; "concept-match" candidates each
      // name their own entryId instead.
      for (const q of STUDY2_QUESTIONS) {
         if (q.entryId) expect(REGISTRY_IDS.has(q.entryId), `unknown entryId "${q.entryId}" on "${q.id}"`).toBe(true);
         if (q.type === "concept-match") {
            for (const c of q.candidates) {
               expect(REGISTRY_IDS.has(c.entryId), `unknown candidate entryId "${c.entryId}" on "${q.id}"`).toBe(true);
            }
         }
      }
   });

   it("spectrum items reuse the app's own SPECTRUM_OPTIONS bins verbatim", () => {
      for (const q of STUDY2_QUESTIONS) {
         if (q.type !== "spectrum") continue;
         expect(q.options).toEqual(SPECTRUM_OPTIONS);
      }
   });
});
