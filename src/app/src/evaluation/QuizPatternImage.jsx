import PatternCanvas from "../PatternCanvas.jsx";
import { resolveQuizPattern } from "./quizPatterns.js";

// Small labelled render of one REGISTRY entry at fixed params — the quiz's
// only "image" primitive. Reuses PatternCanvas unmodified (full-resolution
// render, scaled down via CSS, exactly like App.jsx's own Render Preview)
// rather than a second rendering path, so a quiz image and the live
// explorer's own view of the same params can never visually disagree.
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
