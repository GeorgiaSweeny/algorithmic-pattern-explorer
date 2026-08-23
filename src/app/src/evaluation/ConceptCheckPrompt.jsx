import "./ConceptCheckPrompt.css";

/*
* A small, dismissible, non-blocking check-in — shown once per session
* the first time a learner selects a node tagged with a computational
* thinking concept they haven't seen a prompt for yet (nodeDocs.js's own
* NODE_DOCS[nodeType].concepts, not a second concept mapping). This is
* the "in-app concept-check prompts during use" item from
* docs/plan-checklist.md's Aug-11/12 entry — deliberately lightweight
* (a self-report, not a quiz question) so it doesn't interrupt the main
* explorer loop PROJECT_SPECIFICATION.md protects as Must.
*/
export default function ConceptCheckPrompt({ concept, onRespond }) {
   return (
      <div className="concept-check" role="status">
         <span className="concept-check-text">
            Quick check — do you feel like you understand <strong>{concept}</strong> from
            what you just saw?
         </span>
         <span className="concept-check-actions">
            <button className="btn" onClick={() => onRespond("understood")}>
               Yes, got it
            </button>
            <button className="btn" onClick={() => onRespond("unsure")}>
               Still unsure
            </button>
         </span>
      </div>
   );
}
