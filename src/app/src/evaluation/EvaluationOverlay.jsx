import { useState } from "react";
import { STUDY1_QUESTIONS, STUDY2_QUESTIONS } from "./quizContent.js";
import {
   recordQuizPass,
   getAllRecords,
   clearAllRecords,
   STUDY1_STORAGE_KEY,
   STUDY2_STORAGE_KEY,
} from "./evaluationStorage.js";
import QuizPatternImage from "./QuizPatternImage.jsx";
import "./EvaluationOverlay.css";

// `study` (1 or 2) selects which instrument this overlay instance runs —
// App.jsx mounts one instance per study ("Test" / "Test 2" menu items),
// each with its own question bank and its own localStorage key, so the
// two studies' responses, scores, and "Clear Stored Responses" actions
// can never collide (see evaluationStorage.js's own header comment).
const STUDY_CONFIG = {
   1: {
      questions: STUDY1_QUESTIONS,
      storageKey: STUDY1_STORAGE_KEY,
      label: "Study 1",
      filenamePrefix: "evaluation-results",
      intro:
         "This is an optional research instrument for the dissertation this " +
         "application supports. It measures whether exploring the algorithm " +
         "workflows below actually helps understanding of computational " +
         "thinking concepts.",
   },
   2: {
      questions: STUDY2_QUESTIONS,
      storageKey: STUDY2_STORAGE_KEY,
      label: "Study 2",
      filenamePrefix: "study2-evaluation-results",
      intro:
         "This is Study 2's own research instrument — a separate quiz from " +
         "Study 1's, testing compositional reasoning and using image-based " +
         "questions alongside text ones (see dissertation/Study2-Design-Plan.md). " +
         "Image-based and multi-select items are a materially different task " +
         "from a short text quiz — by continuing, you're confirming that's " +
         "covered by what you already agreed to for this project's next study.",
   },
};

/*
* Full-screen overlay, opened from App.jsx's menu bar, kept entirely
* separate from node/pattern selection state — closing it returns to
* whatever the explorer was showing, unchanged. This is a *research
* instrument* for the dissertation's secondary RQ (does the demonstration
* layer measurably help), not a learner-facing gamified assessment — the
* latter is explicitly Out of Scope (PROJECT_SPECIFICATION.md: "assessment,
* grading or progress tracking"). The distinction is who it's for: this
* screen exists to collect data for the study runner, not to score or
* gate the learner's own use of the explorer.
*
* Scope, stated plainly: this builds the instrument and the local data
* capture docs/plan-checklist.md's Aug-11/12 entry calls for — not the
* study itself. Running a real pre/post comparison with real participants,
* and writing up the results, is separate work for after this instrument
* exists and works.
*
* Same-instrument pre/post design (see quizContent.js's own header
* comment for the methodology note): one question bank, administered
* twice. `download()` mirrors export.js's own Blob-download pattern
* rather than a second implementation of the same few lines.
*
* Deliberately no score shown after either pass — not even "you got N
* right." Telling a participant their pre-quiz score would let them infer
* which answers were wrong and go looking for the right ones before the
* post-quiz, or re-pick answers on the post-quiz just to see the number
* move, contaminating the within-subject comparison this instrument
* exists to measure. Scores only surface in the downloaded JSON, for the
* study runner, after the whole session is over.
*/

function download(text, filename) {
   const blob = new Blob([text], { type: "application/json" });
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url;
   a.download = filename;
   a.click();
   URL.revokeObjectURL(url);
}

// A question is "answered" once it has a selection at all — for
// "node-select" that means at least one node checked, deliberately (not
// "a key exists, even empty"), since an empty selection is indistinguishable
// from "hasn't looked at this question yet" and shouldn't let Submit enable
// itself on an untouched item. "order" requires every node to have a
// chosen position, for the same reason applied per-node instead of once.
function isAnswered(question, answers) {
   const value = answers[question.id];
   if (question.type === "node-select") return Array.isArray(value) && value.length > 0;
   if (question.type === "order") {
      return !!value && question.nodeSequence.every((node) => value[node] !== undefined && value[node] !== "");
   }
   return value !== undefined;
}

function toggleNode(selected, node) {
   const current = selected ?? [];
   return current.includes(node) ? current.filter((n) => n !== node) : [...current, node];
}

function setOrderPosition(selected, node, position) {
   return { ...(selected ?? {}), [node]: position };
}

function QuestionBody({ question, selected, onSelectIndex, onToggleNode, onSetOrder }) {
   switch (question.type) {
      case "cause":
         return (
            <>
               <div className="eval-image-row">
                  <QuizPatternImage entryId={question.entryId} overrides={question.paramsBefore} label="Image 1" />
                  <QuizPatternImage entryId={question.entryId} overrides={question.paramsAfter} label="Image 2" />
               </div>
               {question.options.map((opt, oi) => (
                  <label key={oi} className="eval-option">
                     <input type="radio" name={question.id} checked={selected === oi} onChange={() => onSelectIndex(oi)} />
                     {opt}
                  </label>
               ))}
            </>
         );

      case "spectrum":
         return (
            <>
               <div className="eval-image-row">
                  <QuizPatternImage entryId={question.entryId} overrides={question.overrides} />
               </div>
               {question.options.map((opt, oi) => (
                  <label key={oi} className="eval-option">
                     <input type="radio" name={question.id} checked={selected === oi} onChange={() => onSelectIndex(oi)} />
                     {opt}
                  </label>
               ))}
            </>
         );

      case "predict":
         return (
            <>
               <div className="eval-image-row">
                  <QuizPatternImage entryId={question.entryId} overrides={question.startOverrides} label="Before" />
               </div>
               <p className="eval-change-desc">{question.changeDescription}</p>
               <div className="eval-image-grid">
                  {question.candidates.map((c, ci) => (
                     <QuizPatternImage
                        key={ci}
                        entryId={question.entryId}
                        overrides={c.overrides}
                        label={String.fromCharCode(65 + ci)}
                        selected={selected === ci}
                        onClick={() => onSelectIndex(ci)}
                     />
                  ))}
               </div>
            </>
         );

      case "concept-match":
         return (
            <div className="eval-image-grid">
               {question.candidates.map((c, ci) => (
                  <QuizPatternImage
                     key={ci}
                     entryId={c.entryId}
                     overrides={c.overrides}
                     label={String.fromCharCode(65 + ci)}
                     selected={selected === ci}
                     onClick={() => onSelectIndex(ci)}
                  />
               ))}
            </div>
         );

      case "node-select":
         return (
            <>
               <div className="eval-image-row">
                  <QuizPatternImage entryId={question.entryId} overrides={question.overrides} label="Target pattern" />
               </div>
               {question.nodeOptions.map((node) => (
                  <label key={node} className="eval-option">
                     <input
                        type="checkbox"
                        checked={(selected ?? []).includes(node)}
                        onChange={() => onToggleNode(node)}
                     />
                     {node}
                  </label>
               ))}
            </>
         );

      case "order":
         return (
            <>
               <div className="eval-image-row">
                  <QuizPatternImage entryId={question.entryId} overrides={question.overrides} label="Target pattern" />
               </div>
               <div className="eval-order-list">
                  {question.nodeSequence.map((node) => (
                     <label key={node} className="eval-order-row">
                        <span className="eval-order-node">{node}</span>
                        <select
                           value={selected?.[node] ?? ""}
                           onChange={(e) => onSetOrder(node, e.target.value)}
                           aria-label={`Position for ${node}`}
                        >
                           <option value="" disabled>
                              Position
                           </option>
                           {question.nodeSequence.map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                 {i + 1}
                              </option>
                           ))}
                        </select>
                     </label>
                  ))}
               </div>
            </>
         );

      default: // "mc"
         return question.options.map((opt, oi) => (
            <label key={oi} className="eval-option">
               <input type="radio" name={question.id} checked={selected === oi} onChange={() => onSelectIndex(oi)} />
               {opt}
            </label>
         ));
   }
}

function QuizForm({ phase, questions, onSubmit }) {
   const [answers, setAnswers] = useState({});
   const allAnswered = questions.every((q) => isAnswered(q, answers));

   function setAnswer(id, value) {
      setAnswers((prev) => ({ ...prev, [id]: value }));
   }

   return (
      <div className="eval-quiz">
         <h3>{phase === "pre" ? "Before you start" : "After exploring"} — quick check</h3>
         <p className="eval-quiz-note">
            {questions.length} short questions, no time limit. This isn't graded or
            shown to you as pass/fail — it's research data for the dissertation this
            application supports.
         </p>
         {questions.map((q, qi) => (
            <fieldset key={q.id} className="eval-question">
               <legend>
                  {qi + 1}. {q.prompt}
               </legend>
               <QuestionBody
                  question={q}
                  selected={answers[q.id]}
                  onSelectIndex={(idx) => setAnswer(q.id, idx)}
                  onToggleNode={(node) => setAnswer(q.id, toggleNode(answers[q.id], node))}
                  onSetOrder={(node, position) => setAnswer(q.id, setOrderPosition(answers[q.id], node, position))}
               />
            </fieldset>
         ))}
         <button className="btn" disabled={!allAnswered} onClick={() => onSubmit(answers)}>
            Submit
         </button>
      </div>
   );
}

export default function EvaluationOverlay({ onClose, study = 1 }) {
   const config = STUDY_CONFIG[study];
   const [stage, setStage] = useState("intro"); // "intro" | "quiz" | "summary"
   const [phase, setPhase] = useState("pre"); // "pre" | "post"

   function startQuiz(nextPhase) {
      setPhase(nextPhase);
      setStage("quiz");
   }

   function submitQuiz(answers) {
      // Score is recorded but never read back here — see this file's own
      // header comment for why the result stays hidden until download.
      recordQuizPass(phase, config.questions, answers, config.storageKey);
      setStage("summary");
   }

   function downloadResults() {
      const records = getAllRecords(config.storageKey);
      download(JSON.stringify(records, null, 2), `${config.filenamePrefix}-${Date.now()}.json`);
   }

   return (
      <div className="eval-overlay">
         <div className="eval-panel">
            <button className="eval-close" onClick={onClose} aria-label="Close evaluation">
               ×
            </button>

            {stage === "intro" && (
               <div className="eval-intro">
                  <h2>{config.label}</h2>
                  <p>{config.intro}</p>
                  <p>
                     Responses are stored only on this device (no account, no server) —
                     you can download them as a file at the end to share with the study
                     runner.
                  </p>
                  <div className="eval-actions">
                     <button className="btn" onClick={() => startQuiz("pre")}>
                        Take Pre-Quiz
                     </button>
                     <button className="btn" onClick={() => startQuiz("post")}>
                        Take Post-Quiz
                     </button>
                     <button className="btn" onClick={downloadResults}>
                        Download My Results
                     </button>
                     <button className="btn" onClick={() => clearAllRecords(config.storageKey)}>
                        Clear Stored Responses
                     </button>
                  </div>
               </div>
            )}

            {stage === "quiz" && <QuizForm phase={phase} questions={config.questions} onSubmit={submitQuiz} />}

            {stage === "summary" && (
               <div className="eval-summary">
                  <h2>Thanks!</h2>
                  <p>
                     {phase === "pre" ? "Pre-quiz" : "Post-quiz"} recorded. Results aren't
                     shown here — download your results at the end to see them.
                  </p>
                  {phase === "pre" && (
                     <p>Now go explore a few generators, then come back and take the post-quiz.</p>
                  )}
                  <div className="eval-actions">
                     <button className="btn" onClick={() => setStage("intro")}>
                        Back
                     </button>
                     <button className="btn" onClick={onClose}>
                        Return to Explorer
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
