/*
========================================
EVALUATION DATA CAPTURE — TESTS
========================================
* Doesn't need jsdom (the app-side component test infrastructure, Phase 2
* of docs/plan-checklist.md's Aug-21 evaluation entry) — a plain in-memory
* object satisfying localStorage's own get/set/remove interface is enough
* to test this module's pure data-shape logic in isolation.
*/
import { describe, it, expect, beforeEach } from "vitest";
import {
   recordQuizPass, recordConceptCheck, getAllRecords, clearAllRecords,
   hasPromptedConcept, markConceptPrompted,
} from "./evaluationStorage.js";

function makeLocalStorageStub() {
   const store = new Map();
   return {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, v),
      removeItem: (k) => store.delete(k),
   };
}

beforeEach(() => {
   globalThis.localStorage = makeLocalStorageStub();
});

const QUESTIONS = [
   { id: "q1", concept: "Randomness", correctIndex: 1 },
   { id: "q2", concept: "Iteration", correctIndex: 0 },
];

describe("evaluationStorage: quiz recording", () => {
   it("scores a quiz pass against correctIndex, not just counting answers", () => {
      const score = recordQuizPass("pre", QUESTIONS, { q1: 1, q2: 1 });
      expect(score).toBe(1); // q1 correct, q2 wrong
   });

   it("stores each quiz pass with its phase, score, total and a per-item breakdown", () => {
      recordQuizPass("pre", QUESTIONS, { q1: 1, q2: 0 });
      const records = getAllRecords();
      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject({
         type: "quiz",
         phase: "pre",
         score: 2,
         total: 2,
         items: [
            { id: "q1", concept: "Randomness", selectedIndex: 1, correctIndex: 1, correct: true },
            { id: "q2", concept: "Iteration", selectedIndex: 0, correctIndex: 0, correct: true },
         ],
      });
      expect(typeof records[0].timestamp).toBe("string");
   });

   it("accumulates multiple passes (pre and post) rather than overwriting", () => {
      recordQuizPass("pre", QUESTIONS, { q1: 1, q2: 0 });
      recordQuizPass("post", QUESTIONS, { q1: 1, q2: 1 });
      const records = getAllRecords();
      expect(records).toHaveLength(2);
      expect(records.map((r) => r.phase)).toEqual(["pre", "post"]);
   });
});

describe("evaluationStorage: concept-check recording", () => {
   it("stores a concept-check response alongside quiz records", () => {
      recordConceptCheck("seed", "Randomness", "understood");
      const records = getAllRecords();
      expect(records).toHaveLength(1);
      expect(records[0]).toMatchObject({
         type: "conceptCheck",
         nodeType: "seed",
         concept: "Randomness",
         response: "understood",
      });
   });
});

describe("evaluationStorage: clearAllRecords", () => {
   it("removes every stored record", () => {
      recordQuizPass("pre", QUESTIONS, { q1: 1, q2: 0 });
      clearAllRecords();
      expect(getAllRecords()).toEqual([]);
   });
});

describe("evaluationStorage: session-only concept-prompt tracking", () => {
   it("hasPromptedConcept reflects markConceptPrompted (module-level, not persisted to localStorage)", () => {
      const concept = `test-concept-${Math.random()}`;
      expect(hasPromptedConcept(concept)).toBe(false);
      markConceptPrompted(concept);
      expect(hasPromptedConcept(concept)).toBe(true);
   });
});
