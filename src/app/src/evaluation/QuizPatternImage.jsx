/*
========================================
QUIZ PATTERN IMAGE
========================================
* Small labelled render of one REGISTRY entry at fixed params — the quiz's
* only "image" primitive. Reuses PatternCanvas unmodified so a quiz image
* can never visually disagree with the live explorer's own render.
*/

import PatternCanvas from "../PatternCanvas.jsx";
import { resolveQuizPattern } from "./quizPatterns.js";

export default function QuizPatternImage({ entryId, overrides, label, selected, onClick }) {
   const { entry, params } = resolveQuizPattern(entryId, overrides);
   const clickable = typeof onClick === "function";

   const content = (
      <div className={`eval-image-thumb${selected ? " eval-image-thumb-selected" : ""}`}>
         <PatternCanvas entry={entry} params={params} />
         {label && <div className="eval-image-label">{label}</div>}
      </div>
   );

   if (!clickable) return content;

   return (
      <button
         type="button"
         className="eval-image-thumb-btn"
         aria-pressed={selected}
         onClick={onClick}
      >
         {content}
      </button>
   );
}
