import { useEffect, useMemo, useRef, useState } from "react";
import { ReactFlow, Background, Controls, MarkerType } from "@xyflow/react";
import { CATEGORY_COLOURS } from "./nodeTypes/WorkflowNode.jsx";
import "@xyflow/react/dist/style.css";
import { REGISTRY } from "../../patternRegistry.js";
import { CANVAS } from "../../config.js";
import { buildWorkflow } from "./workflows.js";
import WorkflowNode from "./nodeTypes/WorkflowNode.jsx";
import PatternCanvas from "./PatternCanvas.jsx";
import DocumentationPanel from "./DocumentationPanel.jsx";
import PatternDocumentation from "./PatternDocumentation.jsx";
import NodeLibraryOverlay from "./NodeLibraryOverlay.jsx";
import { exportSvg, exportPng } from "./export.js";
import EvaluationOverlay from "./evaluation/EvaluationOverlay.jsx";
import Onboarding, { hasSeenOnboarding, markOnboardingSeen } from "./Onboarding.jsx";
import Welcome from "./Welcome.jsx";
import "./App.css";

const nodeTypes = { workflow: WorkflowNode };
const CANVAS_LABEL = `${CANVAS.WIDTH} × ${CANVAS.HEIGHT} px`;
const GITHUB_REPO_URL = "https://github.com/GeorgiaSweeny/algorithmic-pattern-generator";

// Human-readable labels for CATEGORY_COLOURS's keys, in the same order
// nodes typically appear (environment -> initialisation -> computation ->
// pattern -> presentation -> output) — a one-line legend so the node
// header colours mean something without having to guess (Green & Petre's
// Role-expressiveness; App-UX-Quickwins.md item 6).
const CATEGORY_LABELS = {
   environment: "Environment",
   initialisation: "Initialisation",
   computation: "Computation",
   pattern: "Pattern",
   presentation: "Presentation",
   output: "Output",
};

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

// Layout, updated from docs/UI_DESIGN.md's original Interface Layout:
// Generator Selection stacked above a small always-final-output preview
// (left column), Documentation Panel (middle), Pattern Canvas with the
// Algorithm Workflow node graph underneath it (right), Status & Controls
// bar (bottom) — the node graph moved from the left column to sit under
// the main canvas so it reads as "the steps that produce what's on the
// right," with the small left-column preview keeping the final result
// visible at all times while stepping through intermediate stages. Node
// selection is single-node-at-a-time (Node Interaction section) —
// selecting a node highlights it, opens its param controls inline
// beneath it, and (docs/UI_DESIGN.md's Stepping Through Algorithms) can
// be driven by Prev/Next as well as direct node clicks.
//
// The main canvas shows per-node intermediate algorithm state, not just
// the final render, wherever stagePreview.js defines a rule for the
// selected node's stage (see that file's own header comment) — one
// generic mechanism across all 7 generators, not bespoke code per
// generator. The left column's preview always omits `node` when calling
// PatternCanvas, which falls back to the real final output unconditionally
// (see PatternCanvas.jsx's own header comment).
export default function App() {
   const [selectedId, setSelectedId] = useState(REGISTRY[0].id);
   const selectedEntry = REGISTRY.find((e) => e.id === selectedId);
   const [paramValues, setParamValues] = useState(() => defaultParams(selectedEntry));
   // 0 = the pattern's first node, so the Documentation Panel always has a
   // concrete stage to explain by default rather than opening on its empty
   // "select a node" state. -1 (pattern-level overview, GENERATOR_DOCS) is
   // still reachable via Prev. Not just an initial value: switching pattern
   // resets back to 0 too, so the first node is selected again for every
   // newly-selected pattern, not only on first load.
   const [selectedIndex, setSelectedIndex] = useState(0);
   // Main canvas zoom: 1 = "min(100% of the panel, the pattern's actual
   // pixel size)" — the canvas is always fully visible with no scrolling
   // needed at the default. Zooming in beyond that is an explicit choice,
   // and scrolling only appears then (see .canvas-zoom-wrap). The Render
   // Preview panel deliberately has no zoom control of its own — just
   // responsive scaling, the same min() sizing with no interactive part.
   const [canvasZoom, setCanvasZoom] = useState(1);
   const CANVAS_ZOOM_MIN = 0.5;
   const CANVAS_ZOOM_MAX = 3;
   const [showTest, setShowTest] = useState(false);
   const [showTest2, setShowTest2] = useState(false);
   const [showEvaluationMenu, setShowEvaluationMenu] = useState(false);
   const evaluationMenuRef = useRef(null);
   const [showNodeLibrary, setShowNodeLibrary] = useState(false);
   // Welcome (app intro) and Onboarding (panel-by-panel tour) are one
   // combined first-visit flow gated by the same "seen" flag: Welcome
   // shows first, its own "Take the tour" hands off into Onboarding, and
   // "Skip" dismisses both for good. The menu bar's "Replay Tutorial"
   // button re-opens the same combined flow from the start.
   const [showWelcome, setShowWelcome] = useState(() => !hasSeenOnboarding());
   const [showOnboarding, setShowOnboarding] = useState(false);
   // Starts collapsed: a pattern is always selected by default, so the full
   // list isn't needed on screen until a learner actively wants to change
   // it. Expanding this and Pattern Documentation being shown are mutually
   // exclusive in the left column — only one needs the space at a time.
   const [generatorPanelExpanded, setGeneratorPanelExpanded] = useState(false);

   // Evaluation dropdown: close on outside click, same as any standard menu.
   useEffect(() => {
      if (!showEvaluationMenu) return;
      function handleClickOutside(e) {
         if (evaluationMenuRef.current && !evaluationMenuRef.current.contains(e.target)) {
            setShowEvaluationMenu(false);
         }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, [showEvaluationMenu]);

   // Reset to the new pattern's defaults, first node selected, and default
   // canvas zoom whenever the selection changes.
   useEffect(() => {
      setParamValues(defaultParams(selectedEntry));
      setSelectedIndex(0);
      setCanvasZoom(1);
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

   // Directional arrows on every edge (App-UX-Quickwins.md item 1) — data
   // flows source -> target, but the default ReactFlow edge is just an
   // unlabelled line with no cue which way. The edge feeding the currently
   // selected node is also animated, a lightweight second cue tying the
   // step-through control to the graph without needing a text label.
   const styledEdges = useMemo(
      () =>
         edges.map((edge, i) => ({
            ...edge,
            markerEnd: { type: MarkerType.ArrowClosed },
            animated: i === selectedIndex - 1,
         })),
      [edges, selectedIndex]
   );

   const selectedNode = nodes[selectedIndex] ?? null;
   const isRenderStep = selectedNode?.data.nodeType === "render";
   // No node selected yet is visually the same case as the render step
   // itself: both show the pattern's actual final output on the main
   // canvas, just for different reasons (nothing picked yet, vs. having
   // stepped all the way to the last stage).
   const showingFinalRender = isRenderStep || !selectedNode;

   function selectByNodeId(nodeId) {
      const idx = nodes.findIndex((n) => n.id === nodeId);
      if (idx !== -1) setSelectedIndex(idx);
   }

   return (
      <div className="app">
         <header className="menu-bar">
            <span className="menu-bar-title">Algorithmic Pattern Explorer</span>
            <div className="menu-bar-actions">
               <button
                  className="btn menu-bar-node-library menu-bar-doc-library"
                  onClick={() => setShowNodeLibrary(true)}
               >
                  Documentation Library
               </button>
               <button className="btn menu-bar-node-library" onClick={() => setShowWelcome(true)}>
                  Replay Tutorial
               </button>
               <div className="menu-bar-dropdown" ref={evaluationMenuRef}>
                  <button
                     className="btn menu-bar-evaluation"
                     onClick={() => setShowEvaluationMenu((open) => !open)}
                     aria-haspopup="true"
                     aria-expanded={showEvaluationMenu}
                  >
                     Evaluation
                  </button>
                  {showEvaluationMenu && (
                     <div className="menu-bar-dropdown-panel" role="menu">
                        <button
                           className="menu-bar-dropdown-item"
                           role="menuitem"
                           onClick={() => {
                              setShowTest(true);
                              setShowEvaluationMenu(false);
                           }}
                        >
                           Test
                        </button>
                        <button
                           className="menu-bar-dropdown-item"
                           role="menuitem"
                           onClick={() => {
                              setShowTest2(true);
                              setShowEvaluationMenu(false);
                           }}
                        >
                           Test 2
                        </button>
                        <a
                           className="menu-bar-dropdown-item"
                           role="menuitem"
                           href="/evaluation/evaluation-dry-run.html"
                           target="_blank"
                           rel="noreferrer"
                           onClick={() => setShowEvaluationMenu(false)}
                        >
                           Dry Run
                        </a>
                        <a
                           className="menu-bar-dropdown-item"
                           role="menuitem"
                           href="/evaluation/study-results.html"
                           target="_blank"
                           rel="noreferrer"
                           onClick={() => setShowEvaluationMenu(false)}
                        >
                           Study Results
                        </a>
                        <a
                           className="menu-bar-dropdown-item"
                           role="menuitem"
                           href="/evaluation/study2-results.html"
                           target="_blank"
                           rel="noreferrer"
                           onClick={() => setShowEvaluationMenu(false)}
                        >
                           Study 2 Results
                        </a>
                     </div>
                  )}
               </div>
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

         {showNodeLibrary && <NodeLibraryOverlay onClose={() => setShowNodeLibrary(false)} />}
         {showTest && <EvaluationOverlay study={1} onClose={() => setShowTest(false)} />}
         {showTest2 && <EvaluationOverlay study={2} onClose={() => setShowTest2(false)} />}
         {showWelcome && (
            <Welcome
               onStartTour={() => {
                  setShowWelcome(false);
                  setShowOnboarding(true);
               }}
               onSkip={() => {
                  setShowWelcome(false);
                  markOnboardingSeen();
               }}
            />
         )}
         {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}

         <div className="app-layout">
            <aside className="left-column">
               <section
                  className={`layout-panel generator-selection${generatorPanelExpanded ? "" : " generator-selection-collapsed"}`}
               >
                  <h2 className="panel-title">Generator Selection</h2>
                  {generatorPanelExpanded ? (
                     <>
                        {[...REGISTRY_BY_CATEGORY.entries()].map(([category, entries]) => (
                           <div className="pattern-group" key={category}>
                              <h3 className="pattern-group-title">{category}</h3>
                              <ul className="pattern-list">
                                 {entries.map((entry) => (
                                    <li key={entry.id}>
                                       <button
                                          className={entry.id === selectedId ? "selected" : ""}
                                          onClick={() => {
                                             setSelectedId(entry.id);
                                             setGeneratorPanelExpanded(false);
                                          }}
                                       >
                                          <span className="pattern-name">{entry.name}</span>
                                       </button>
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        ))}
                     </>
                  ) : (
                     <div className="generator-selection-collapsed-row">
                        <span className="pattern-name">{selectedEntry.name}</span>
                        <button className="btn" onClick={() => setGeneratorPanelExpanded(true)}>
                           Change Pattern
                        </button>
                     </div>
                  )}
               </section>

               {/* Doubles as the former separate "Render Preview" panel — its
                   own Visual Example already shows the pattern's actual final
                   render (PatternDocumentation.jsx), so a second, separate
                   panel showing the same image was redundant. */}
               <PatternDocumentation
                  entry={selectedEntry}
                  generator={selectedEntry.generator}
                  params={paramValues}
                  minimised={generatorPanelExpanded}
               />
            </aside>

            <DocumentationPanel selectedNode={selectedNode} generator={selectedEntry.generator} />

            <section className="layout-panel canvas-panel">
               {/* Header condensed onto a single sticky line: title, size,
                   "Showing" status, and zoom controls all share one row now,
                   grouped left (title/size/status, wrapping among themselves
                   at narrow widths) vs. right (zoom controls, pinned). */}
               <div className="canvas-header-sticky">
                  <div className="canvas-header-row">
                     <div className="canvas-header-left">
                        <h2 className="panel-title">Canvas</h2>
                        <span className="canvas-size-inline">{CANVAS_LABEL}</span>
                        {/* Nielsen's "visibility of system status": this canvas's
                            image changes for two different reasons (a parameter
                            edit, or selecting a different node below), and
                            nothing previously stated which stage is currently
                            displayed — a Study 1 participant reported mistaking
                            one cause for the other
                            (docs/evaluation/study1-participant-post-session-notes.md
                            #4). Deliberately styled less prominently than the
                            "Canvas" title, not more — a live status line
                            shouldn't outrank the panel's own header. */}
                        <span className="canvas-showing-label">
                           Showing: {showingFinalRender ? "Final Render" : `${selectedNode.data.label} stage output`}
                           {!showingFinalRender && (
                              <span className="workspace-size-label"> · Workspace {CANVAS_LABEL}</span>
                           )}
                        </span>
                     </div>
                     <div className="canvas-zoom-controls">
                        <button
                           className="btn"
                           onClick={() => setCanvasZoom((z) => Math.max(CANVAS_ZOOM_MIN, z - 0.25))}
                           disabled={canvasZoom <= CANVAS_ZOOM_MIN}
                           aria-label="Zoom out"
                           title="Zoom out"
                        >
                           −
                        </button>
                        <button
                           className="btn canvas-zoom-value"
                           onClick={() => setCanvasZoom(1)}
                           title="Reset zoom to fit"
                           aria-label={`Reset zoom to fit (currently ${Math.round(canvasZoom * 100)}%)`}
                        >
                           {Math.round(canvasZoom * 100)}%
                        </button>
                        <button
                           className="btn"
                           onClick={() => setCanvasZoom((z) => Math.min(CANVAS_ZOOM_MAX, z + 0.25))}
                           disabled={canvasZoom >= CANVAS_ZOOM_MAX}
                           aria-label="Zoom in"
                           title="Zoom in"
                        >
                           +
                        </button>
                     </div>
                  </div>
               </div>
               <div className={`render-panel-body canvas-zoom-wrap${showingFinalRender ? "" : " render-panel-body-boxed"}`}>
                  <div className="canvas-zoom-scale" style={{ "--canvas-zoom": canvasZoom }}>
                     <PatternCanvas entry={selectedEntry} params={paramValues} node={selectedNode} />
                  </div>
               </div>

               <div className="algorithm-workflow">
                  {/* Condensed from three stacked rows (title, "pattern name — N
                      nodes (file.js)" subtitle, legend) to two — the pattern's own
                      name is already shown in the (collapsed) Generator Selection
                      panel, so repeating it here was redundant; node count moved
                      inline next to the title instead, the same treatment as the
                      Canvas header's size label above. */}
                  <div className="workflow-header-row">
                     <h2 className="panel-title">
                        Visual Algorithm Workflow <span className="panel-title-note">(NODES)</span>
                     </h2>
                     <span className="canvas-size-inline">
                        {nodes.length} nodes ({selectedEntry.generator}.js)
                     </span>
                  </div>
                  <div className="category-legend">
                     {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <span className="category-legend-item" key={key}>
                           <span className="category-legend-swatch" style={{ background: CATEGORY_COLOURS[key] }} />
                           {label}
                        </span>
                     ))}
                  </div>
                  <ReactFlow
                     key={selectedId}
                     nodes={nodes}
                     edges={styledEdges}
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

                  {/* Moved from a standalone full-width footer — these controls
                      only ever act on this graph and this pattern's parameters,
                      so a bar spanning the whole app (including the Generator
                      Selection and Documentation Panel columns) read as
                      disconnected from what it actually controlled. Now sits
                      directly with the thing it controls instead. */}
                  <div className="workflow-controls-bar">
                     <div className="status-section step-controls">
                        <button
                           className="btn"
                           disabled={selectedIndex <= -1}
                           onClick={() => setSelectedIndex((i) => Math.max(-1, i - 1))}
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
                              : "Pattern overview — select a node to step through the pipeline"}
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
                  </div>
               </div>
            </section>
         </div>
      </div>
   );
}
