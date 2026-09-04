/*
========================================
WORKFLOW NODE
========================================
* ReactFlow custom node renderer for the algorithm workflow graph — header
* coloured by category, with an expandable param-control body when selected.
*/

import { Handle, Position } from "@xyflow/react";
import { NODE_LIBRARY } from "../workflows.js";
import "./WorkflowNode.css";

// One colour per docs/nodes/ category. Exported so App.jsx can build its
// colour-key legend from the same source of truth.
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
      // Note: a param genuinely meant to be a two-state switch should use
      // control: "toggle" (below), not archetype + map — this branch always
      // renders a continuous range. An earlier version instead guessed
      // "boolean" from the bounds alone (integer min/max exactly 1 apart,
      // e.g. map: [0, 1]) and rendered a checkbox — which silently broke
      // every genuinely continuous 0-1 "how much" archetype slider (e.g.
      // jitter, defaulting to 0.7): ticking it could only ever set exactly
      // 0 or 1, flipping between them on every click, with no way to reach
      // any value in between at all.
      // Integer steps only for a genuinely small integer range (segments,
      // octaves, ...) — a range spanning 1 or less (e.g. map: [0, 1]) is
      // almost always a normalised fraction (jitter, variation, ...), not a
      // 2-valued integer enum, and needs fine-grained steps to be usable at
      // all.
      const step =
         Number.isInteger(min) && Number.isInteger(max) && max - min > 1 && max - min <= 20
            ? 1
            : (max - min) / 100;
      return (
         <label className="param-control">
            <span className="param-label">
               {param.archetype} <em>({param.param})</em>
            </span>
            <span className="param-row">
               <input
                  className="nodrag"
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

   if (param.control === "toggle") {
      const isOn = Number(value) !== 0;
      return (
         <label className="param-control">
            <span className="param-label">{param.label ?? param.param}</span>
            <span className="param-row">
               <input
                  className="nodrag"
                  type="checkbox"
                  checked={isOn}
                  onChange={(e) => onChange(param.param, e.target.checked ? param.onValue : 0)}
               />
               <span className="param-value">{isOn ? param.onLabel ?? "On" : param.offLabel ?? "Off"}</span>
            </span>
         </label>
      );
   }

   if (param.control === "select") {
      return (
         <label className="param-control">
            <span className="param-label">{param.label ?? param.param}</span>
            <select className="nodrag" value={value} onChange={(e) => onChange(param.param, e.target.value)}>
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
                  className="nodrag"
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

// Only the selected node's param body renders — one node's controls open
// at a time, not every node showing its params permanently.
export default function WorkflowNode({ data }) {
   const colour = CATEGORY_COLOURS[NODE_LIBRARY[data.nodeType]?.category] ?? "#6b7280";
   const hasBody =
      data.selected && (data.params.length > 0 || data.exportActions || data.structuralNote || data.dependsOnLabel);

   return (
      <div
         className={`workflow-node workflow-node-type-${data.nodeType}${data.selected ? " selected" : ""}`}
         style={{ borderColor: colour }}
      >
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
