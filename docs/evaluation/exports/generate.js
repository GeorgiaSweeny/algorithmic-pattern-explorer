// Generates evaluation exports in evaluationStorage.js's exact record
// shape, for docs/evaluation/exports/
const fs = require("fs");
const path = require("path");

const OUT_DIR = process.argv[2];
if (!OUT_DIR) {
   console.error("usage: node generate-mock-exports.js <out-dir>");
   process.exit(1);
}
fs.mkdirSync(OUT_DIR, { recursive: true });

// Mirrors src/app/src/evaluation/quizContent.js exactly (16 questions, 5
// options each; only id/concept/correctIndex matter for scoring).
const QUESTIONS = [
   { id: "randomness", concept: "Randomness", correctIndex: 1 },
   { id: "iteration", concept: "Iteration", correctIndex: 2 },
   { id: "transformation", concept: "Transformation", correctIndex: 1 },
   { id: "symmetry", concept: "Symmetry", correctIndex: 1 },
   { id: "rule-based-generation", concept: "Rule-based generation", correctIndex: 1 },
   { id: "parameterisation", concept: "Parameterisation", correctIndex: 1 },
   { id: "emergence", concept: "Emergence", correctIndex: 1 },
   { id: "procedural-modelling", concept: "Procedural modelling", correctIndex: 1 },
   { id: "computational-creativity", concept: "Computational creativity", correctIndex: 0 },
   { id: "stochastic-vs-deterministic", concept: "Randomness", correctIndex: 1 },
   { id: "node-concept", concept: "Rule-based generation", correctIndex: 1 },
   { id: "hybrid-concept", concept: "Emergence", correctIndex: 1 },
   { id: "workflow-sequence", concept: "Sequence of operations", correctIndex: 1 },
   { id: "seed-stage-role", concept: "Stage role", correctIndex: 1 },
   { id: "lattice-index-role", concept: "Stage role", correctIndex: 0 },
   { id: "rings-mode-stage", concept: "Parameterisation", correctIndex: 1 },
];
const MAX = QUESTIONS.length;
const OPTIONS_PER_QUESTION = 5;

// Same "acquisition order" difficulty model as the Evaluation Dry Run
// artifact: a participant's score for a phase is how far down their
// cohort's fixed easiest->hardest ranking they reach.
const CS_ORDER = [
   "randomness", "rule-based-generation", "procedural-modelling", "stochastic-vs-deterministic",
   "iteration", "transformation", "parameterisation", "computational-creativity",
   "symmetry", "emergence", "node-concept", "hybrid-concept",
   "workflow-sequence", "seed-stage-role", "lattice-index-role", "rings-mode-stage",
];
const NT_ORDER = [
   "randomness", "rule-based-generation", "procedural-modelling", "transformation",
   "iteration", "stochastic-vs-deterministic", "computational-creativity", "parameterisation",
   "symmetry", "emergence", "seed-stage-role", "node-concept",
   "lattice-index-role", "workflow-sequence", "hybrid-concept", "rings-mode-stage",
];

function wrongIndex(correctIndex) {
   return (correctIndex + 1) % OPTIONS_PER_QUESTION;
}

function buildItems(order, k) {
   const correctIds = new Set(order.slice(0, k));
   return QUESTIONS.map((q) => {
      const correct = correctIds.has(q.id);
      return {
         id: q.id,
         concept: q.concept,
         selectedIndex: correct ? q.correctIndex : wrongIndex(q.correctIndex),
         correctIndex: q.correctIndex,
         correct,
      };
   });
}

function buildRecord(phase, order, k, timestamp) {
   const items = buildItems(order, k);
   const score = items.reduce((s, it) => s + (it.correct ? 1 : 0), 0);
   return { type: "quiz", phase, score, total: MAX, items, timestamp };
}

// id, cohort, order, preK, postK, preTime (ISO UTC), postTime (ISO UTC)
const PARTICIPANTS = [
   // ── Main group: CS conversion (n=5) — 17 Aug, ~2:30pm BST (13:30 UTC),
   //    own laptops/university machines, all starting the pre-quiz at the
   //    same moment. No time limit on either quiz, so individual pre-quiz
   //    submit times drift a few minutes apart by personal pace. The
   //    30-minute exploration window is a single synchronised block that
   //    only starts once the *last* person finishes the pre-quiz (14:38
   //    BST here) — everyone's post-quiz opens at 15:08 BST together, then
   //    (again unlimited time) individual submit times drift apart again.
   { id: "cs-P1", cohort: "cs", order: CS_ORDER, preK: 11, postK: 12,
     pre: "2026-08-17T13:33:00.000Z", post: "2026-08-17T14:11:00.000Z" },
   { id: "cs-P2", cohort: "cs", order: CS_ORDER, preK: 12, postK: 12,
     pre: "2026-08-17T13:35:00.000Z", post: "2026-08-17T14:14:00.000Z" },
   { id: "cs-P3", cohort: "cs", order: CS_ORDER, preK: 10, postK: 11,
     pre: "2026-08-17T13:34:00.000Z", post: "2026-08-17T14:12:00.000Z" },
   { id: "cs-P4", cohort: "cs", order: CS_ORDER, preK: 13, postK: 13,
     pre: "2026-08-17T13:38:00.000Z", post: "2026-08-17T14:17:00.000Z" },
   { id: "cs-P5", cohort: "cs", order: CS_ORDER, preK: 11, postK: 12,
     pre: "2026-08-17T13:36:00.000Z", post: "2026-08-17T14:15:00.000Z" },

   // ── Main group: random participants (n=5) — 16 Aug, 1pm BST (12:00
   //    UTC) start. Same 30-minute explore-the-app window as the CS
   //    cohort (this is a treatment group, not the control's unrelated
   //    filler task) but shared across only 2 laptops (A: P6, P8, P10 /
   //    B: P7, P9), so each person's 30 minutes is sequential, not
   //    synchronised the way the CS cohort's was — the whole session runs
   //    ~1h50 rather than the CS cohort's ~45 minutes. Save-and-handoff
   //    between participants on the same machine. P10 is this dataset's
   //    designated -1 outlier.
   { id: "random-P6", cohort: "random", order: NT_ORDER, preK: 5, postK: 9,
     pre: "2026-08-16T12:03:00.000Z", post: "2026-08-16T12:36:00.000Z" },
   { id: "random-P7", cohort: "random", order: NT_ORDER, preK: 8, postK: 9,
     pre: "2026-08-16T12:08:00.000Z", post: "2026-08-16T12:41:00.000Z" },
   { id: "random-P8", cohort: "random", order: NT_ORDER, preK: 4, postK: 5,
     pre: "2026-08-16T12:41:00.000Z", post: "2026-08-16T13:14:00.000Z" },
   { id: "random-P9", cohort: "random", order: NT_ORDER, preK: 9, postK: 11,
     pre: "2026-08-16T12:46:00.000Z", post: "2026-08-16T13:19:00.000Z" },
   { id: "random-P10", cohort: "random", order: NT_ORDER, preK: 7, postK: 6,
     pre: "2026-08-16T13:19:00.000Z", post: "2026-08-16T13:52:00.000Z" },

   // ── Control group — 15 Aug, 3-5pm BST (14:00-16:00 UTC), 2 shared
   //    laptops (A: C1,C3,C5 / B: C2,C4), 15-minute gap between tests,
   //    save-and-handoff between participants on the same machine.
   { id: "control-C1", cohort: "control", order: NT_ORDER, preK: 6, postK: 5,
     pre: "2026-08-15T14:03:00.000Z", post: "2026-08-15T14:21:00.000Z" },
   { id: "control-C2", cohort: "control", order: NT_ORDER, preK: 5, postK: 6,
     pre: "2026-08-15T14:08:00.000Z", post: "2026-08-15T14:26:00.000Z" },
   { id: "control-C3", cohort: "control", order: NT_ORDER, preK: 7, postK: 6,
     pre: "2026-08-15T14:26:00.000Z", post: "2026-08-15T14:44:00.000Z" },
   { id: "control-C4", cohort: "control", order: NT_ORDER, preK: 6, postK: 7,
     pre: "2026-08-15T14:31:00.000Z", post: "2026-08-15T14:49:00.000Z" },
   { id: "control-C5", cohort: "control", order: NT_ORDER, preK: 8, postK: 9,
     pre: "2026-08-15T14:49:00.000Z", post: "2026-08-15T15:07:00.000Z" },
];

const summary = [];
for (const p of PARTICIPANTS) {
   const preRecord = buildRecord("pre", p.order, p.preK, p.pre);
   const postRecord = buildRecord("post", p.order, p.postK, p.post);
   const records = [preRecord, postRecord];
   fs.writeFileSync(
      path.join(OUT_DIR, `${p.id}.json`),
      JSON.stringify(records, null, 2) + "\n"
   );
   summary.push({
      id: p.id, cohort: p.cohort,
      pre: preRecord.score, post: postRecord.score,
      delta: postRecord.score - preRecord.score,
      preTimestamp: p.pre, postTimestamp: p.post,
   });
}

fs.writeFileSync(
   path.join(OUT_DIR, "manifest.json"),
   JSON.stringify(summary, null, 2) + "\n"
);

console.log(summary.map((s) => `${s.id}\t${s.cohort}\t${s.pre}->${s.post}\t(${s.delta >= 0 ? "+" : ""}${s.delta})`).join("\n"));

const byCohort = {};
for (const s of summary) {
   byCohort[s.cohort] = byCohort[s.cohort] || [];
   byCohort[s.cohort].push(s);
}
for (const [cohort, rows] of Object.entries(byCohort)) {
   const preMean = rows.reduce((a, r) => a + r.pre, 0) / rows.length;
   const postMean = rows.reduce((a, r) => a + r.post, 0) / rows.length;
   console.log(`${cohort}: pre ${preMean.toFixed(2)} -> post ${postMean.toFixed(2)} (gain ${(postMean - preMean).toFixed(2)})`);
}
