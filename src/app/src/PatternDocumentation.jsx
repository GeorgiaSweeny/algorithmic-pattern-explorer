import { GENERATOR_DOCS } from "./nodeDocs.js";
import PatternCanvas from "./PatternCanvas.jsx";
import SpectrumBar from "./SpectrumBar.jsx";
import "./DocumentationPanel.css";
import "./App.css";

/*
* Pattern-level ("what is this generator, and why does it matter")
* explanation, separated out from the node-level Documentation Panel —
* mixing the two in one panel read as confusing, since a learner couldn't
* tell whether a given block of text was about the whole pattern or just
* the currently-selected computational stage. This panel always shows the
* currently-selected pattern's own overview; DocumentationPanel.jsx now
* handles node-level explanation only.
*
* `minimised` (true while Generator Selection is expanded, so the two
* panels don't compete for the same vertical space in the left column at
* once) collapses this to a one-line note instead of full content.
*
* "Render Preview" shows the pattern's own actual output — this panel now
* doubles as what used to be a separate Render Preview section in App.jsx,
* removed as redundant once this block started showing the same image.
* Reuses that removed section's own width-only sizing technique
* (.final-preview-canvas-* classes) so it scales correctly without being
* cut off, the same fix already applied to the main canvas. The Stochastic
* ↔ Deterministic spectrum bar sits directly under it — moved here from
* the (node-level) Documentation Panel, since it describes the whole
* pattern, not whichever node happens to be selected.
*/
export default function PatternDocumentation({ entry, generator, params, minimised }) {
   if (minimised) {
      return (
         <section className="layout-panel pattern-documentation">
            <h2 className="panel-title">Pattern Documentation</h2>
            <p className="pattern-documentation-minimised">Choose a pattern above to see its explanation here.</p>
         </section>
      );
   }

   const doc = GENERATOR_DOCS[generator];

   return (
      <section className="layout-panel pattern-documentation">
         {/* Render Preview is the panel's own header now — no separate
             "Pattern Documentation" title or pattern-name block above it;
             the currently-selected pattern's name is already shown in the
             (collapsed) Generator Selection panel just above this one. */}
         <h2 className="panel-title">Render Preview</h2>

         <div className="doc-block">
            <div className="final-preview-canvas-wrap pattern-documentation-canvas-wrap">
               <div className="final-preview-canvas-scale">
                  <PatternCanvas entry={entry} params={params} />
               </div>
            </div>
         </div>

         {entry?.spectrum != null && (
            <div className="doc-block">
               <span className="doc-label">Stochastic ↔ Deterministic</span>
               <SpectrumBar spectrum={entry.spectrum} compact />
            </div>
         )}

         <div className="doc-block">
            <span className="doc-label">What This Pattern Is</span>
            <p className="doc-text">{doc?.explanation}</p>
         </div>

         <div className="doc-block">
            <span className="doc-label">Why It's Here</span>
            <p className="doc-text">{doc?.purpose}</p>
         </div>

         <div className="doc-block">
            <span className="doc-label">Computational Thinking Concepts</span>
            <div className="concept-tags">
               {doc?.concepts?.map((concept) => (
                  <span className="concept-tag" key={concept}>
                     {concept}
                  </span>
               ))}
            </div>
         </div>
      </section>
   );
}
