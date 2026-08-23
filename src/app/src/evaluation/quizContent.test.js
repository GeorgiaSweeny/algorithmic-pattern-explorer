import { describe, it, expect } from "vitest";
import { QUIZ_QUESTIONS } from "./quizContent.js";

describe("QUIZ_QUESTIONS: content shape", () => {
   it("every question has a unique id, a prompt, at least 2 options, and a valid correctIndex", () => {
      const ids = new Set();
      for (const q of QUIZ_QUESTIONS) {
         expect(ids.has(q.id)).toBe(false);
         ids.add(q.id);
         expect(typeof q.prompt).toBe("string");
         expect(q.prompt.length).toBeGreaterThan(0);
         expect(q.options.length).toBeGreaterThanOrEqual(2);
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
      const covered = new Set(QUIZ_QUESTIONS.map((q) => q.concept));
      for (const concept of NAMED_CONCEPTS) {
         expect(covered.has(concept), `no question tagged "${concept}"`).toBe(true);
      }
   });
});
