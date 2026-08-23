import { useEffect, useMemo, useState } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { REGISTRY } from "../../patternRegistry.js";
import { CANVAS } from "../../config.js";
import { buildWorkflow } from "./workflows.js";
import WorkflowNode from "./nodeTypes/WorkflowNode.jsx";
import PatternCanvas from "./PatternCanvas.jsx";
import { exportSvg, exportPng } from "./export.js";
import { NODE_DOCS } from "./nodeDocs.js";
import EvaluationOverlay from "./evaluation/EvaluationOverlay.jsx";
import ConceptCheckPrompt from "./evaluation/ConceptCheckPrompt.jsx";
import { recordConceptCheck, hasPromptedConcept, markConceptPrompted } from "./evaluation/evaluationStorage.js";
import "./App.css";

const nodeTypes = { workflow: WorkflowNode };
const CANVAS_LABEL = `${CANVAS.WIDTH} × ${CANVAS.HEIGHT} px`;
const GITHUB_REPO_URL = "https://github.com/GeorgiaSweeny/algorithmic-pattern-generator";

function defaultParams(entry) {
   return Object.fromEntries(entry.params.map((p) => [p.param, p.value]));
}

// Groups REGISTRY by its existing `category` field (no new data — every
// entry already declares one) in first-seen order, so the Generator
// Selection list reads as a tiered structure (docs/evaluation/
// educator-consultation-user-stories.md's US-10.1) rather than one flat
// 14-item list, without introducing a second categorisation scheme.
function groupByCategory(entries) {
   const groups = new Map();
   for (const entry of entries) {
      if (!groups.has(entry.category)) groups.set(entry.category, []);
      groups.get(entry.category).push(entry);
   }
   return groups;
}
const REGISTRY_BY_CATEGORY = groupByCategory(REGISTRY);

// Layout follows docs/UI_DESIGN.md's Interface Layout: Generator Selection
// stacked above Algorithm Workflow (left column), Pattern Canvas (right),
// Status & Controls bar (bottom). Node selection is single-node-at-a-time
// (Node Interaction section) — selecting a node highlights it, opens its
// param controls inline beneath it, and (docs/UI_DESIGN.md's Stepping
// Through Algorithms) can be driven by Prev/Next as well as direct node
// clicks.
//
// The canvas shows per-node intermediate algorithm state, not just the
// final render, wherever stagePreview.js defines a rule for the selected
// node's stage (see that file's own header comment) — one generic
// mechanism across all 7 generators, not bespoke code per generator.
export default function App() {
   const [selectedId, setSelectedId] = useState(REGISTRY[0].id);
   const selectedEntry = REGISTRY.find((e) => e.id === selectedId);
   const [paramValues, setParamValues] = useState(() => defaultParams(selectedEntry));
   const [selectedIndex, setSelectedIndex] = useState(0);
   const [showEvaluation, setShowEvaluation] = useState(false);
   const [activeConceptPrompt, setActiveConceptPrompt] = useState(null); // { nodeType, concept } | null

   // Reset to the new pattern's defaults and first node whenever the selection changes.
   useEffect(() => {
      setParamValues(defaultParams(selectedEntry));
      setSelectedIndex(0);
   }, [selectedId]);

   // Depends on paramValues too: some params change the graph's own shape
   // (e.g. recursive's depth controls how many Subdivide nodes appear), not
   // just the rendered pattern — see buildWorkflow's liveParams doc comment.
   const { nodes: rawNodes, edges } = useMemo(
      () => buildWorkflow(selectedId, paramValues),
      [selectedId, paramValues]
   );

   const nodes = useMemo(
      () =>
         rawNodes.map((node, index) => ({
            ...node,
            data: {
               ...node.data,
               params: node.data.params.map((p) => ({ ...p, value: paramValues[p.param] ?? p.value })),
               onParamChange: (key, value) => setParamValues((prev) => ({ ...prev, [key]: value })),
               selected: index === selectedIndex,
               exportActions:
                  node.data.nodeType === "render"
                     ? [
                          { label: "Export SVG", onClick: () => exportSvg(selectedEntry, paramValues) },
                          { label: "Export PNG", onClick: () => exportPng(selectedEntry, paramValues) },
                       ]
                     : undefined,
            },
         })),
      [rawNodes, paramValues, selectedIndex, selectedEntry]
   );

   const selectedNode = nodes[selectedIndex] ?? null;
   const isRenderStep = selectedNode?.data.nodeType === "render";

   // In-app concept-check prompt (docs/plan-checklist.md's Aug-11/12
   // evaluation deliverable): the first time a newly-selected node is
   // tagged with a computational-thinking concept not yet checked in on
   // this session, surface a lightweight, dismissible prompt. Reuses
   // nodeDocs.js's existing NODE_DOCS concepts tagging rather than a
   // second concept mapping. Runs once per node selection, not per
   // param edit — selectedNode's nodeType is what it depends on.
   useEffect(() => {
      const nodeType = selectedNode?.data.nodeType;
      const concepts = NODE_DOCS[nodeType]?.concepts ?? [];
      const nextConcept = concepts.find((c) => !hasPromptedConcept(c));
      if (nextConcept) {
         markConceptPrompted(nextConcept);
         setActiveConceptPrompt({ nodeType, concept: nextConcept });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [selectedNode?.data.nodeType]);

   function respondToConceptPrompt(response) {
      if (activeConceptPrompt) {
         recordConceptCheck(activeConceptPrompt.nodeType, activeConceptPrompt.concept, response);
      }
      setActiveConceptPrompt(null);
   }

   function selectByNodeId(nodeId) {
      const idx = nodes.findIndex((n) => n.id === nodeId);
      if (idx !== -1) setSelectedIndex(idx);
   }

   return (
      <div className="app">
         <header className="menu-bar">
            <span className="menu-bar-title">Algorithmic Pattern Explorer</span>
            <div className="menu-bar-actions">
               <button className="btn menu-bar-evaluation" onClick={() => setShowEvaluation(true)}>
                  Evaluation
               </button>
               <a
                  className="menu-bar-github"
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View source on GitHub"
                  title="View source on GitHub"
               >
                  <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
                     <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38
                        0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                        -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07
                        -1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6
                        7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82
                        1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2
                        0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
                  </svg>
               </a>
            </div>
         </header>

         {showEvaluation && <EvaluationOverlay onClose={() => setShowEvaluation(false)} />}
         {activeConceptPrompt && (
            <ConceptCheckPrompt
               concept={activeConceptPrompt.concept}
               onRespond={respondToConceptPrompt}
            />
         )}

         <div className="app-layout">
            <aside className="left-column">
               <section className="layout-panel generator-selection">
                  <h2 className="panel-title">Generator Selection</h2>
                  {[...REGISTRY_BY_CATEGORY.entries()].map(([category, entries]) => (
                     <div className="pattern-group" key={category}>
                        <h3 className="pattern-group-title">{category}</h3>
                        <ul className="pattern-list">
                           {entries.map((entry) => (
                              <li key={entry.id}>
                                 <button
                                    className={entry.id === selectedId ? "selected" : ""}
                                    onClick={() => setSelectedId(entry.id)}
                                 >
                                    <span className="pattern-name">{entry.name}</span>
                                 </button>
                              </li>
                           ))}
                        </ul>
                     </div>
                  ))}
               </section>

               <section className="layout-panel algorithm-workflow">
                  <h2 className="panel-title">
                     Visual Algorithm Workflow <span className="panel-title-note">(NODES)</span>
                  </h2>
                  <div className="workflow-subtitle">
                     <strong>{selectedEntry.name}</strong> — {nodes.length} nodes ({selectedEntry.generator}.js)
                  </div>
                  <ReactFlow
                     key={selectedId}
                     nodes={nodes}
                     edges={edges}
                     nodeTypes={nodeTypes}
                     fitView
                     nodesDraggable
                     nodesConnectable={false}
                     elementsSelectable={false}
                     onNodeClick={(_, node) => selectByNodeId(node.id)}
                  >
                     <Background />
                     <Controls />
                  </ReactFlow>
               </section>
            </aside>

            <section className="layout-panel canvas-panel">
               <h2 className="panel-title">Pattern Canvas</h2>
               <div className="canvas-size-info">
                  <span>Canvas: {CANVAS_LABEL}</span>
                  {!isRenderStep && <span className="workspace-size-label">Workspace: {CANVAS_LABEL}</span>}
               </div>
               <div className={`render-panel-body${isRenderStep ? "" : " render-panel-body-boxed"}`}>
                  <PatternCanvas entry={selectedEntry} params={paramValues} node={selectedNode} />
               </div>
            </section>
         </div>

         <footer className="status-bar">
            <div className="status-section step-controls">
               <button
                  className="btn"
                  disabled={selectedIndex <= 0}
                  onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
               >
                  ← Prev
               </button>
               <button
                  className="btn"
                  disabled={selectedIndex >= nodes.length - 1}
                  onClick={() => setSelectedIndex((i) => Math.min(nodes.length - 1, i + 1))}
               >
                  Next →
               </button>
               <span className="step-indicator">
                  {selectedNode
                     ? `Step ${selectedIndex + 1} of ${nodes.length} — ${selectedNode.data.label}`
                     : "No node selected"}
               </span>
            </div>
            <div className="status-section">
               <button
                  className="btn"
                  onClick={() => setParamValues(defaultParams(selectedEntry))}
                  title="Reset every parameter of the current pattern back to its default value"
               >
                  Reset to Defaults
               </button>
            </div>
         </footer>
      </div>
   );
}
