import { useMemo, useState } from "react";
import { NODE_LIBRARY } from "./workflows.js";
import { REGISTRY } from "../../patternRegistry.js";
import { NODE_LIBRARY_DOCS, WORKFLOW_DOCS_BY_GENERATOR } from "./docsContent.js";
import { CONCEPT_TERMS, CATEGORY_TERMS, PROPERTY_TERMS } from "./glossary.js";
import { renderMarkdown } from "./markdown.jsx";
import NodeIllustration, { hasIllustration } from "./nodeIllustrations.jsx";
import SpectrumBar from "./SpectrumBar.jsx";
/*
========================================
NODE LIBRARY OVERLAY (DOCUMENTATION LIBRARY)
========================================
* Standing reference library, browsable independent of current selection:
* every node in extended detail, every pattern's algorithm write-up, and a
* glossary of Computational Thinking Concepts terms. Opened from the menu bar.
* User-facing label is "Documentation Library" — covers patterns and the
* glossary too, not just nodes; component/file name (`NodeLibraryOverlay`)
* is unchanged internally.
* Nodes/Patterns tabs render docs/nodes/*.md and WORKFLOWS.md directly via
* docsContent.js, so this can't drift from the canonical documentation.
*/

import "./NodeLibraryOverlay.css";

function groupPatternsByGenerator(entries) {
   const groups = new Map();
   for (const entry of entries) {
      if (!groups.has(entry.generator)) groups.set(entry.generator, []);
      groups.get(entry.generator).push(entry);
   }
   return groups;
}
const PATTERNS_BY_GENERATOR = groupPatternsByGenerator(REGISTRY);

function groupNodesByCategory(library) {
   const groups = new Map();
   for (const [nodeType, def] of Object.entries(library)) {
      if (!groups.has(def.category)) groups.set(def.category, []);
      groups.get(def.category).push(nodeType);
   }
   return groups;
}
const NODES_BY_CATEGORY = groupNodesByCategory(NODE_LIBRARY);

// Grouped the same way as NODES_BY_CATEGORY/PATTERNS_BY_GENERATOR, so the
// Key Terms tab renders with the same sidebar-list + detail-pane layout.
const TERM_GROUPS = [
   { label: "Node Categories", terms: CATEGORY_TERMS },
   { label: "Pattern Properties", terms: PROPERTY_TERMS },
   { label: "Computational Thinking Concepts", terms: CONCEPT_TERMS },
];
const ALL_TERMS = [...CATEGORY_TERMS, ...PROPERTY_TERMS, ...CONCEPT_TERMS];

const TABS = [
   { id: "nodes", label: "Nodes" },
   { id: "patterns", label: "Patterns" },
   { id: "glossary", label: "Key Terms" },
];

export default function NodeLibraryOverlay({ onClose }) {
   const [tab, setTab] = useState("nodes");
   const [selectedNodeType, setSelectedNodeType] = useState(Object.keys(NODE_LIBRARY)[0]);
   const [selectedGenerator, setSelectedGenerator] = useState([...PATTERNS_BY_GENERATOR.keys()][0]);
   const [selectedTerm, setSelectedTerm] = useState(CATEGORY_TERMS[0].term);

   const nodeDocText = useMemo(() => NODE_LIBRARY_DOCS[selectedNodeType], [selectedNodeType]);
   const patternDocText = useMemo(() => WORKFLOW_DOCS_BY_GENERATOR.get(selectedGenerator), [selectedGenerator]);
   const termEntry = useMemo(() => ALL_TERMS.find((t) => t.term === selectedTerm), [selectedTerm]);

   return (
      <div className="lib-overlay" role="dialog" aria-modal="true" onClick={onClose}>
         <div className="lib-panel" onClick={(e) => e.stopPropagation()}>
            <button className="lib-close" onClick={onClose} aria-label="Close Documentation Library">
               ×
            </button>
            <h2 className="lib-title">Documentation Library</h2>

            <div className="lib-tabs">
               {TABS.map((t) => (
                  <button
                     key={t.id}
                     className={`lib-tab${tab === t.id ? " selected" : ""}`}
                     onClick={() => setTab(t.id)}
                  >
                     {t.label}
                  </button>
               ))}
            </div>

            {tab === "nodes" && (
               <div className="lib-body">
                  <nav className="lib-sidebar">
                     {[...NODES_BY_CATEGORY.entries()].map(([category, nodeTypes]) => (
                        <div className="lib-sidebar-group" key={category}>
                           <h4>{category}</h4>
                           <ul>
                              {nodeTypes.map((nodeType) => (
                                 <li key={nodeType}>
                                    <button
                                       className={nodeType === selectedNodeType ? "selected" : ""}
                                       onClick={() => setSelectedNodeType(nodeType)}
                                    >
                                       {NODE_LIBRARY[nodeType].title}
                                    </button>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     ))}
                  </nav>
                  <article className="lib-content">
                     {hasIllustration(selectedNodeType) && (
                        <div className="lib-visual-example">
                           <NodeIllustration nodeType={selectedNodeType} />
                        </div>
                     )}
                     {nodeDocText ? renderMarkdown(nodeDocText) : <p>No documentation found for this node.</p>}
                  </article>
               </div>
            )}

            {tab === "patterns" && (
               <div className="lib-body">
                  <nav className="lib-sidebar">
                     {[...PATTERNS_BY_GENERATOR.entries()].map(([generator, entries]) => (
                        <div className="lib-sidebar-group" key={generator}>
                           <ul>
                              <li>
                                 <button
                                    className={generator === selectedGenerator ? "selected" : ""}
                                    onClick={() => setSelectedGenerator(generator)}
                                 >
                                    {entries.map((e) => e.name).join(" / ")}
                                 </button>
                              </li>
                           </ul>
                        </div>
                     ))}
                  </nav>
                  <article className="lib-content">
                     {patternDocText ? (
                        renderMarkdown(patternDocText)
                     ) : (
                        <p>No documentation found for this pattern.</p>
                     )}
                  </article>
               </div>
            )}

            {tab === "glossary" && (
               <div className="lib-body">
                  <nav className="lib-sidebar">
                     {TERM_GROUPS.map(({ label, terms }) => (
                        <div className="lib-sidebar-group" key={label}>
                           <h4>{label}</h4>
                           <ul>
                              {terms.map(({ term }) => (
                                 <li key={term}>
                                    <button
                                       className={term === selectedTerm ? "selected" : ""}
                                       onClick={() => setSelectedTerm(term)}
                                    >
                                       {term}
                                    </button>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     ))}
                  </nav>
                  <article className="lib-content">
                     {termEntry ? (
                        <>
                           <h2>{termEntry.term}</h2>
                           {/* The actual widget, not just a description of it — a
                               representative "Hybrid" midpoint value, since this
                               entry explains the bar every pattern's own spectrum
                               value renders as, not one specific pattern's. */}
                           {termEntry.term === "Stochastic ↔ Deterministic Spectrum" && (
                              <div className="lib-visual-example lib-spectrum-example">
                                 <SpectrumBar spectrum={0.5} />
                              </div>
                           )}
                           <p>{termEntry.definition}</p>
                        </>
                     ) : (
                        <p>No definition found for this term.</p>
                     )}
                  </article>
               </div>
            )}
         </div>
      </div>
   );
}
