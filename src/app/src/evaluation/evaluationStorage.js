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
* Storage shape: one record per submitted quiz pass (pre or post),
* appended to a single array under one localStorage key so a
* participant's whole session is one downloadable file.
*
* Study 1 and Study 2 are separate instruments given to separate cohorts
* (dissertation/Study2-Design-Plan.md §1/§2) — every function below takes
* an explicit `storageKey` (defaulting to Study 1's own, unchanged key, so
* nothing about Study 1's data shape or app behaviour needed migrating)
* rather than one shared key, so a participant's Study 1 and Study 2
* responses can never land in the same array, get summed into the same
* score, or have one study's "Clear Stored Responses" wipe the other's.
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

// "node-select" items answer with an array of chosen node names rather
// than a single option index, and are graded two ways at once (Study 2
// design plan §5): `exactMatch` (every required node picked, no
// intruders) is what counts toward the headline `score` below, so it
// stays comparable to every other item type's binary correct/incorrect;
// `partialScore` (correct picks minus incorrect picks, floored at 0) is
// recorded alongside for the richer per-item-type breakdown, since a
// participant who picks 3 of 4 correct nodes plus one intruder is
// meaningfully different from one who picks none.
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

// "order" items answer with { [nodeName]: selectedPositionNumber } rather
// than a single option index — each node gets its own independent 1..N
// dropdown (the design plan's own "numbered-dropdown per node" low-effort
// substitute for true drag-and-drop). `correct` requires every node to
// land on its own correct 1-based position; `positionsCorrect` is kept
// alongside as a partial measure — a participant who gets 4 of 5 stages in
// the right place is meaningfully different from one who gets none, the
// same reasoning `scoreNodeSelect()` above already applies to compositional
// items.
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
   // except "node-select" (array of selected node names — see
   // scoreNodeSelect() above) and "order" (per-node position map — see
   // scoreOrder() above). Every other type (including Study 2's
   // "cause"/"predict"/"concept-match"/"spectrum" additions) scores
   // identically to Study 1's original "mc" items: a single selected index
   // compared against a single correctIndex.
   //
   // Per-item breakdown (not just the total) so a per-concept *and*
   // per-type pre/post comparison can be built straight from the exported
   // JSON, without re-joining against quizContent.js by hand.
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
