/*
========================================
EVALUATION DATA CAPTURE
========================================
* localStorage-backed, anonymous, fully local — no backend, no accounts.
* One record per submitted quiz pass (pre/post), appended to an array under
* one localStorage key per study, so a session exports as one JSON file.
* Study 1 and Study 2 use separate storage keys (every function takes an
* explicit `storageKey`, defaulting to Study 1's) so responses and scores
* from the two studies can never mix or overwrite each other.
*/

export const STUDY1_STORAGE_KEY = "algorithmic-pattern-explorer.evaluation";
export const STUDY2_STORAGE_KEY = "algorithmic-pattern-explorer.evaluation.study2";

function readAll(storageKey) {
   try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
   } catch {
      return [];
   }
}

function writeAll(storageKey, records) {
   localStorage.setItem(storageKey, JSON.stringify(records));
}

function append(storageKey, record) {
   const records = readAll(storageKey);
   records.push({ ...record, timestamp: new Date().toISOString() });
   writeAll(storageKey, records);
}

// "node-select" answers with an array of chosen node names, graded two
// ways: `correct` (exact match, no intruders) counts toward the headline
// binary score; `partialScore` (correct minus incorrect picks, floored at
// 0) is kept alongside for a richer per-item breakdown.
function scoreNodeSelect(question, selected) {
   const picked = Array.isArray(selected) ? selected : [];
   const correctSet = question.correctNodeSet;
   const correctPicks = picked.filter((n) => correctSet.includes(n)).length;
   const incorrectPicks = picked.length - correctPicks;
   return {
      id: question.id,
      concept: question.concept,
      type: question.type,
      selected: picked,
      correctNodeSet: correctSet,
      correct: correctPicks === correctSet.length && incorrectPicks === 0,
      partialScore: Math.max(0, correctPicks - incorrectPicks),
   };
}

// "order" answers with { [nodeName]: selectedPositionNumber } — each node
// gets its own 1..N dropdown. `correct` requires every node in its exact
// position; `positionsCorrect` is kept as a partial measure.
function scoreOrder(question, selected) {
   const answer = selected && typeof selected === "object" ? selected : {};
   const positionsCorrect = question.nodeSequence.filter(
      (node) => Number(answer[node]) === question.correctSequence.indexOf(node) + 1
   ).length;
   return {
      id: question.id,
      concept: question.concept,
      type: question.type,
      selected: answer,
      correctSequence: question.correctSequence,
      correct: positionsCorrect === question.correctSequence.length,
      positionsCorrect,
   };
}

export function recordQuizPass(phase, questions, answers, storageKey = STUDY1_STORAGE_KEY) {
   // phase: "pre" | "post". answers: { [questionId]: selectedOptionIndex },
   // except "node-select" and "order" (scored above). Every other type
   // scores identically: a selected index compared against correctIndex.
   // Per-item breakdown kept (not just the total) so pre/post comparisons
   // can be built straight from the exported JSON.
   const items = questions.map((q) => {
      if (q.type === "node-select") return scoreNodeSelect(q, answers[q.id]);
      if (q.type === "order") return scoreOrder(q, answers[q.id]);
      const selectedIndex = answers[q.id];
      return {
         id: q.id,
         concept: q.concept,
         type: q.type ?? "mc",
         selectedIndex,
         correctIndex: q.correctIndex,
         correct: selectedIndex === q.correctIndex,
      };
   });
   const score = items.reduce((total, item) => total + (item.correct ? 1 : 0), 0);
   append(storageKey, {
      type: "quiz",
      phase,
      score,
      total: questions.length,
      items,
   });
   return score;
}

export function getAllRecords(storageKey = STUDY1_STORAGE_KEY) {
   return readAll(storageKey);
}

export function clearAllRecords(storageKey = STUDY1_STORAGE_KEY) {
   localStorage.removeItem(storageKey);
}

// Backs EvaluationOverlay's per-phase stored/not-stored indicators — pre and
// post are tracked separately (not just "any record exists") since a
// participant can easily have taken one but not the other.
export function hasStoredPhase(phase, storageKey = STUDY1_STORAGE_KEY) {
   return readAll(storageKey).some((record) => record.phase === phase);
}
