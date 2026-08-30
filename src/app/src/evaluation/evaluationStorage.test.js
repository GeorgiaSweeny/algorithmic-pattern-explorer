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
import { recordQuizPass, getAllRecords, clearAllRecords } from "./evaluationStorage.js";

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

describe("evaluationStorage: node-select scoring", () => {
   const NODE_QUESTION = [
      { id: "voronoi-required-nodes", concept: "Stage role", type: "node-select", correctNodeSet: ["Seed", "Seed Points"] },
   ];

   it("scores an exact match as correct, contributing to the headline score", () => {
      const score = recordQuizPass("pre", NODE_QUESTION, { "voronoi-required-nodes": ["Seed Points", "Seed"] });
      expect(score).toBe(1);
      const [record] = getAllRecords();
      expect(record.items[0]).toMatchObject({ correct: true, partialScore: 2 });
   });

   it("scores a partial, non-exact selection as incorrect but keeps a positive partialScore", () => {
      const score = recordQuizPass("pre", NODE_QUESTION, { "voronoi-required-nodes": ["Seed"] });
      expect(score).toBe(0);
      const [record] = getAllRecords();
      expect(record.items[0]).toMatchObject({ correct: false, partialScore: 1 });
   });

   it("floors partialScore at 0 when intruders outweigh correct picks", () => {
      recordQuizPass("pre", NODE_QUESTION, { "voronoi-required-nodes": ["Edge Deformation", "Lattice Index"] });
      const [record] = getAllRecords();
      expect(record.items[0]).toMatchObject({ correct: false, partialScore: 0 });
   });

   it("treats an unanswered node-select item as no selections, not a crash", () => {
      recordQuizPass("pre", NODE_QUESTION, {});
      const [record] = getAllRecords();
      expect(record.items[0]).toMatchObject({ correct: false, partialScore: 0, selected: [] });
   });
});

describe("evaluationStorage: order scoring", () => {
   const ORDER_QUESTION = [
      {
         id: "islamic-sequence-order",
         concept: "Sequence of operations",
         type: "order",
         nodeSequence: ["Colour Mapping", "Grid", "Distance Field"],
         correctSequence: ["Grid", "Distance Field", "Colour Mapping"],
      },
   ];

   it("scores every node in its correct position as correct, contributing to the headline score", () => {
      const score = recordQuizPass("pre", ORDER_QUESTION, {
         "islamic-sequence-order": { Grid: "1", "Distance Field": "2", "Colour Mapping": "3" },
      });
      expect(score).toBe(1);
      const [record] = getAllRecords();
      expect(record.items[0]).toMatchObject({ correct: true, positionsCorrect: 3 });
   });

   it("scores a partially-correct sequence as incorrect but keeps a positionsCorrect count", () => {
      const score = recordQuizPass("pre", ORDER_QUESTION, {
         "islamic-sequence-order": { Grid: "1", "Distance Field": "3", "Colour Mapping": "2" },
      });
      expect(score).toBe(0);
      const [record] = getAllRecords();
      // Only "Grid" landed on its correct position (1); the other two swapped.
      expect(record.items[0]).toMatchObject({ correct: false, positionsCorrect: 1 });
   });

   it("treats an unanswered order item as no placements, not a crash", () => {
      recordQuizPass("pre", ORDER_QUESTION, {});
      const [record] = getAllRecords();
      expect(record.items[0]).toMatchObject({ correct: false, positionsCorrect: 0, selected: {} });
   });
});

describe("evaluationStorage: clearAllRecords", () => {
   it("removes every stored record", () => {
      recordQuizPass("pre", QUESTIONS, { q1: 1, q2: 0 });
      clearAllRecords();
      expect(getAllRecords()).toEqual([]);
   });
});
