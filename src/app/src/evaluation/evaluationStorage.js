/*
========================================
EVALUATION DATA CAPTURE
========================================
* localStorage-backed, anonymous, fully local — no backend, no accounts,
* consistent with this project's own System Constraint (PROJECT_SPECIFICATION.md:
* "shall not... provide user accounts or cloud synchronisation"). The study
* runner (the dissertation author) collects the exported JSON file from
* each participant's machine after their session, rather than this needing
* a server anywhere.
*
* Storage shape: one record per submitted quiz pass (pre or post) plus one
* record per concept-check prompt response, all appended to a single
* array under one localStorage key so a participant's whole session is
* one downloadable file.
*/

const STORAGE_KEY = "algorithmic-pattern-explorer.evaluation";

function readAll() {
   try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
   } catch {
      return [];
   }
}

function writeAll(records) {
   localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function append(record) {
   const records = readAll();
   records.push({ ...record, timestamp: new Date().toISOString() });
   writeAll(records);
}

export function recordQuizPass(phase, questions, answers) {
   // phase: "pre" | "post". answers: { [questionId]: selectedOptionIndex }.
   // Per-item breakdown (not just the total) so a per-concept pre/post
   // comparison can be built straight from the exported JSON, without
   // re-joining against quizContent.js's correctIndex by hand.
   const items = questions.map((q) => {
      const selectedIndex = answers[q.id];
      return {
         id: q.id,
         concept: q.concept,
         selectedIndex,
         correctIndex: q.correctIndex,
         correct: selectedIndex === q.correctIndex,
      };
   });
   const score = items.reduce((total, item) => total + (item.correct ? 1 : 0), 0);
   append({
      type: "quiz",
      phase,
      score,
      total: questions.length,
      items,
   });
   return score;
}

export function recordConceptCheck(nodeType, concept, response) {
   append({ type: "conceptCheck", nodeType, concept, response });
}

export function getAllRecords() {
   return readAll();
}

export function clearAllRecords() {
   localStorage.removeItem(STORAGE_KEY);
}

// Session-only (not persisted): which concepts have already triggered an
// in-app prompt, so a learner sees each concept's check-in once per visit
// rather than every time they revisit a node with that tag.
const promptedConcepts = new Set();

export function hasPromptedConcept(concept) {
   return promptedConcepts.has(concept);
}

export function markConceptPrompted(concept) {
   promptedConcepts.add(concept);
}
