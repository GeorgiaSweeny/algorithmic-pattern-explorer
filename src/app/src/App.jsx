import { useMemo, useState } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { REGISTRY } from "../../patternRegistry.js";
import { buildWorkflow } from "./workflows.js";
import WorkflowNode from "./nodeTypes/WorkflowNode.jsx";
import "./App.css";

const nodeTypes = { workflow: WorkflowNode };

export default function App() {
   const [selectedId, setSelectedId] = useState(REGISTRY[0].id);
   const { nodes, edges } = useMemo(() => buildWorkflow(selectedId), [selectedId]);
   const selectedEntry = REGISTRY.find((e) => e.id === selectedId);

   return (
      <div className="app">
         <aside className="sidebar">
            <h1>Pattern Generators</h1>
            <p className="sidebar-note">
               Node graph view, built from <code>docs/nodes/WORKFLOWS.md</code>. Params are read from{" "}
               <code>patternRegistry.js</code> — dragging a slider updates its own node only; the graph isn't
               wired to a live canvas render yet.
            </p>
            <ul className="pattern-list">
               {REGISTRY.map((entry) => (
                  <li key={entry.id}>
                     <button
                        className={entry.id === selectedId ? "selected" : ""}
                        onClick={() => setSelectedId(entry.id)}
                     >
                        <span className="pattern-name">{entry.name}</span>
                        <span className="pattern-category">{entry.category}</span>
                     </button>
                  </li>
               ))}
            </ul>
         </aside>
         <main className="canvas">
            <div className="canvas-header">
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
            >
               <Background />
               <Controls />
            </ReactFlow>
         </main>
      </div>
   );
}
