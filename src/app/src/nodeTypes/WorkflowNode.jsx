import { Handle, Position } from "@xyflow/react";
import { NODE_LIBRARY } from "../workflows.js";
import "./WorkflowNode.css";

// One colour per docs/nodes/ category (see workflows.js's NODE_LIBRARY).
// Exported so App.jsx can build a colour-key legend from the same source of
// truth (Green & Petre's Role-expressiveness — nothing in the UI previously
// stated what each header colour means; App-UX-Quickwins.md item 6).
export const CATEGORY_COLOURS = {
   environment: "#6b7280",
   initialisation: "#2563eb",
   computation: "#7c3aed",
   pattern: "#d97706",
   presentation: "#0891b2",
   output: "#16a34a",
};

// Controlled by App's paramValues state (via data.onParamChange) so a slider
// drag re-renders the live canvas, not just this node's own display.
function ParamControl({ param, onChange }) {
   const value = param.value;

   if (param.archetype && param.map) {
      const [min, max] = param.map;
      const step = Number.isInteger(min) && Number.isInteger(max) && max - min <= 20 ? 1 : (max - min) / 100;
      return (
         <label className="param-control">
            <span className="param-label">
               {param.archetype} <em>({param.param})</em>
            </span>
            <span className="param-row">
               <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => onChange(param.param, Number(e.target.value))}
               />
               <span className="param-value">{Number(value).toFixed(2)}</span>
            </span>
         </label>
      );
   }

   if (param.control === "select") {
      return (
         <label className="param-control">
            <span className="param-label">{param.label ?? param.param}</span>
            <select value={value} onChange={(e) => onChange(param.param, e.target.value)}>
               {param.options.map((opt) => (
                  <option key={opt} value={opt}>
                     {opt}
                  </option>
               ))}
            </select>
         </label>
      );
   }

   if (param.control === "color") {
      return (
         <label className="param-control">
            <span className="param-label">{param.label ?? param.param}</span>
            <span className="param-row">
               <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(param.param, e.target.value)}
               />
               <span className="param-value">{value}</span>
            </span>
         </label>
      );
   }

   return (
      <div className="param-control param-fixed">
         <div className="param-fixed-row">
            <span className="param-label">{param.param}</span>
            <span className="param-value">{String(param.value)}</span>
         </div>
         <div className="param-fixed-note">
            Fixed by this pattern &mdash; not a free choice here.
         </div>
      </div>
   );
}

// Selecting a node opens an expandable parameter panel directly beneath it —
// only one node's controls are open at a time (docs/UI_DESIGN.md's Node
// Interaction / Parameter Editing sections) — so the body only renders when
// this node is the selected one, rather than every node showing its params
// permanently.
export default function WorkflowNode({ data }) {
   const colour = CATEGORY_COLOURS[NODE_LIBRARY[data.nodeType]?.category] ?? "#6b7280";
   const hasBody =
      data.selected && (data.params.length > 0 || data.exportActions || data.structuralNote || data.dependsOnLabel);

   return (
      <div className={`workflow-node${data.selected ? " selected" : ""}`} style={{ borderColor: colour }}>
         <Handle type="target" position={Position.Left} />
         <div className="workflow-node-header" style={{ background: colour }}>
            {data.label}
         </div>
         {hasBody && (
            <div className="workflow-node-body">
               {data.dependsOnLabel && (
                  <div className="param-control param-fixed workflow-node-dependency">
                     <div className="param-fixed-note">Takes its input from {data.dependsOnLabel}'s output.</div>
                  </div>
               )}
               {data.structuralNote && (
                  <div className="param-control param-fixed">
                     <div className="param-fixed-note">{data.structuralNote}</div>
                  </div>
               )}
               {data.params.map((param) => (
                  <ParamControl key={param.param} param={param} onChange={data.onParamChange} />
               ))}
               {data.exportActions && (
                  <div className="param-control param-export">
                     {data.exportActions.map((action) => (
                        <button key={action.label} type="button" onClick={action.onClick}>
                           {action.label}
                        </button>
                     ))}
                  </div>
               )}
            </div>
         )}
         <Handle type="source" position={Position.Right} />
      </div>
   );
}
