import { useMemo, useState } from "react";
import { NODE_LIBRARY } from "./workflows.js";
import { REGISTRY } from "../../patternRegistry.js";
import { NODE_LIBRARY_DOCS, WORKFLOW_DOCS_BY_GENERATOR } from "./docsContent.js";
import { CONCEPT_TERMS, CATEGORY_TERMS } from "./glossary.js";
import { renderMarkdown } from "./markdown.jsx";
import "./NodeLibraryOverlay.css";

// Full-reference companion to DocumentationPanel.jsx's inline, per-selection
// explanations: DocumentationPanel shows only the currently-selected node's
// contextual explanation, this overlay is a standing library a learner can
// browse freely — every node in extended detail, every pattern's own
// algorithm write-up, and a glossary of the Computational Thinking Concepts
// terms used throughout. Opened from the menu bar (App.jsx), independent of
// node/pattern selection state, the same way EvaluationOverlay is.
//
// Content is not re-authored here: Nodes and Patterns tabs render
// docs/nodes/*.md and docs/nodes/WORKFLOWS.md directly (via docsContent.js's
// raw imports + markdown.jsx), so this overlay can never drift from the
// project's own canonical node-model documentation.

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

// Same shape as NODES_BY_CATEGORY/PATTERNS_BY_GENERATOR above — grouped
// entries the Key Terms tab's sidebar renders identically to the Nodes and
// Patterns tabs (a term list to pick from, a detail pane on the right),
// rather than the term/definition list this tab rendered inline before.
const TERM_GROUPS = [
   { label: "Node Categories", terms: CATEGORY_TERMS },
   { label: "Computational Thinking Concepts", terms: CONCEPT_TERMS },
];

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
   const termEntry = useMemo(
      () => [...CATEGORY_TERMS, ...CONCEPT_TERMS].find((t) => t.term === selectedTerm),
      [selectedTerm]
   );

   return (
      <div className="lib-overlay" role="dialog" aria-modal="true" onClick={onClose}>
         <div className="lib-panel" onClick={(e) => e.stopPropagation()}>
            <button className="lib-close" onClick={onClose} aria-label="Close Node Library">
               ×
            </button>
            <h2 className="lib-title">Node Library</h2>

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
