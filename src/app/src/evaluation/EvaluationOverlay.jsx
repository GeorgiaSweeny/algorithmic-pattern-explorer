import { useState } from "react";
import { QUIZ_QUESTIONS } from "./quizContent.js";
import { recordQuizPass, getAllRecords, clearAllRecords } from "./evaluationStorage.js";
import "./EvaluationOverlay.css";

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

function QuizForm({ phase, onSubmit }) {
   const [answers, setAnswers] = useState({});
   const allAnswered = QUIZ_QUESTIONS.every((q) => answers[q.id] !== undefined);

   return (
      <div className="eval-quiz">
         <h3>{phase === "pre" ? "Before you start" : "After exploring"} — quick check</h3>
         <p className="eval-quiz-note">
            {QUIZ_QUESTIONS.length} short questions, no time limit. This isn't graded or
            shown to you as pass/fail — it's research data for the dissertation this
            application supports.
         </p>
         {QUIZ_QUESTIONS.map((q, qi) => (
            <fieldset key={q.id} className="eval-question">
               <legend>
                  {qi + 1}. {q.prompt}
               </legend>
               {q.options.map((opt, oi) => (
                  <label key={oi} className="eval-option">
                     <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === oi}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                     />
                     {opt}
                  </label>
               ))}
            </fieldset>
         ))}
         <button className="btn" disabled={!allAnswered} onClick={() => onSubmit(answers)}>
            Submit
         </button>
      </div>
   );
}

export default function EvaluationOverlay({ onClose }) {
   const [stage, setStage] = useState("intro"); // "intro" | "quiz" | "summary"
   const [phase, setPhase] = useState("pre"); // "pre" | "post"
   const [lastScore, setLastScore] = useState(null);

   function startQuiz(nextPhase) {
      setPhase(nextPhase);
      setStage("quiz");
   }

   function submitQuiz(answers) {
      const score = recordQuizPass(phase, QUIZ_QUESTIONS, answers);
      setLastScore(score);
      setStage("summary");
   }

   function downloadResults() {
      const records = getAllRecords();
      download(JSON.stringify(records, null, 2), `evaluation-results-${Date.now()}.json`);
   }

   return (
      <div className="eval-overlay">
         <div className="eval-panel">
            <button className="eval-close" onClick={onClose} aria-label="Close evaluation">
               ×
            </button>

            {stage === "intro" && (
               <div className="eval-intro">
                  <h2>Evaluation</h2>
                  <p>
                     This is an optional research instrument for the dissertation this
                     application supports. It measures whether exploring the algorithm
                     workflows below actually helps understanding of computational
                     thinking concepts.
                  </p>
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
                     <button className="btn" onClick={clearAllRecords}>
                        Clear Stored Responses
                     </button>
                  </div>
               </div>
            )}

            {stage === "quiz" && <QuizForm phase={phase} onSubmit={submitQuiz} />}

            {stage === "summary" && (
               <div className="eval-summary">
                  <h2>Thanks!</h2>
                  <p>
                     {phase === "pre" ? "Pre-quiz" : "Post-quiz"} recorded — score{" "}
                     {lastScore} / {QUIZ_QUESTIONS.length}.
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
