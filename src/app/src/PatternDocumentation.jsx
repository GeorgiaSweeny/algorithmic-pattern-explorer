/*
========================================
PATTERN DOCUMENTATION
========================================
* Pattern-level ("what is this generator, and why does it matter")
* explanation, shown for the currently-selected pattern — kept separate from
* the node-level Documentation Panel so the two don't read as one confused
* explanation of "the whole pattern" vs. "just this stage".
* Also serves as the Render Preview (final-output canvas) and hosts the
* Stochastic <-> Deterministic spectrum bar, since both describe the whole
* pattern rather than a single node.
*/

import { GENERATOR_DOCS } from "./nodeDocs.js";
import PatternCanvas from "./PatternCanvas.jsx";
import SpectrumBar from "./SpectrumBar.jsx";
import "./DocumentationPanel.css";
import "./App.css";

// `minimised`: true while Generator Selection is expanded, so the two
// panels don't compete for the same vertical space in the left column.
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
