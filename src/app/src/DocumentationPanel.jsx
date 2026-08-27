import { NODE_LIBRARY } from "./workflows.js";
import { NODE_DOCS, paramDoc } from "./nodeDocs.js";
import NodeIllustration, { hasIllustration } from "./nodeIllustrations.jsx";
import "./DocumentationPanel.css";

// Explanatory only — no editable controls here (docs/UI_DESIGN.md's
// Documentation Panel section: parameter editing lives in the workflow
// column, this panel is purely operation name / visual example / conceptual
// explanation / purpose / computational thinking concepts / per-parameter
// effect descriptions).
//
// Node-level explanation only — pattern-level ("what is this generator, and
// why does it matter") explanation lives in its own PatternDocumentation.jsx
// panel in the left column instead. The two used to be combined in this
// panel's empty state, which read as confusing: a learner couldn't tell
// whether a given block of text was about the whole pattern or just the
// currently-selected stage.
//
// "Visual Example" is a small generic diagram of what this node TYPE does
// (nodeIllustrations.jsx) — not a render of the currently-selected
// pattern. An earlier version reused PatternCanvas at thumbnail size here,
// the same image the main canvas already shows just smaller; once you'd
// seen the main canvas that told you nothing new, and it explained
// whichever pattern happened to be selected rather than the operation
// itself. A hand-drawn abstract diagram (dashed reference shape next to a
// solid accent shape showing the result — the same visual language for
// every node type) explains the concept independent of which pattern
// you're looking at.
export default function DocumentationPanel({ selectedNode, generator }) {
   if (!selectedNode) {
      return (
         <section className="doc-panel">
            <h2 className="panel-title">Documentation Panel</h2>
            <p className="doc-empty">Select a node from the Algorithm Workflow below to see its explanation.</p>
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
               {hasIllustration(nodeType) ? (
                  <NodeIllustration nodeType={nodeType} />
               ) : (
                  <div className="doc-visual-placeholder">No diagram yet for this node type</div>
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
