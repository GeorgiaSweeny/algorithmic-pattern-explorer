import { NODE_LIBRARY } from "./workflows.js";
import { NODE_DOCS, paramDoc } from "./nodeDocs.js";
import PatternCanvas from "./PatternCanvas.jsx";
import "./DocumentationPanel.css";

// Explanatory only — no editable controls here (docs/UI_DESIGN.md's
// Documentation Panel section: parameter editing lives in the workflow
// column, this panel is purely operation name / visual example / conceptual
// explanation / purpose / computational thinking concepts / per-parameter
// effect descriptions).
//
// "Visual Example" (added 2026-08-21, previously a static "Illustration
// placeholder" div) is a small live render of the selected node's own
// current intermediate state — the exact same PatternCanvas component the
// main canvas uses, at thumbnail size, driven by stagePreview.js via
// PatternCanvas's own `node` prop. Not 15 hand-authored illustrations:
// once a node's stage has a preview rule (see stagePreview.js), this
// panel and the main canvas show the identical thing, just at different
// sizes — one mechanism, two consumers.
export default function DocumentationPanel({ selectedNode, generator, entry, params: paramValues }) {
   if (!selectedNode) {
      return (
         <section className="doc-panel">
            <h2 className="panel-title">Documentation Panel</h2>
            <p className="doc-empty">Select a node from the Algorithm Workflow to see its explanation.</p>
         </section>
      );
   }

   const nodeType = selectedNode.data.nodeType;
   const doc = NODE_DOCS[nodeType];
   const title = NODE_LIBRARY[nodeType]?.title ?? nodeType;
   const params = selectedNode.data.params ?? [];

   return (
      <section className="doc-panel">
         <h2 className="panel-title">Documentation Panel</h2>

         <div className="doc-block">
            <span className="doc-label">Operation</span>
            <div className="doc-value">{title}</div>
         </div>

         <div className="doc-block">
            <span className="doc-label">Learning Objective</span>
            <p className="doc-text doc-objective">{doc?.objective}</p>
         </div>

         <div className="doc-block">
            <span className="doc-label">Visual Example</span>
            <div className="doc-visual-example">
               {entry ? (
                  <PatternCanvas entry={entry} params={paramValues} node={selectedNode} />
               ) : (
                  <div className="doc-visual-placeholder">No pattern selected</div>
               )}
            </div>
         </div>

         <div className="doc-block">
            <span className="doc-label">Conceptual Explanation</span>
            <p className="doc-text">{doc?.explanation}</p>
         </div>

         <div className="doc-block">
            <span className="doc-label">Purpose Within the Algorithm</span>
            <p className="doc-text">{doc?.purpose}</p>
         </div>

         {params.length > 0 && (
            <div className="doc-block">
               <span className="doc-label">Parameters</span>
               <dl className="param-doc-list">
                  {params.map((param) => (
                     <div className="param-doc-item" key={param.param}>
                        <dt className="param-doc-name">{param.label ?? param.param}</dt>
                        <dd className="param-doc-text">
                           {paramDoc(generator, param.param) ?? "What this changes about the output isn't documented yet."}
                        </dd>
                     </div>
                  ))}
               </dl>
            </div>
         )}

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
