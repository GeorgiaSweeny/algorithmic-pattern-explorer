import { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { NODE_LIBRARY } from "../workflows.js";
import "./WorkflowNode.css";

// One colour per docs/nodes/ category (see workflows.js's NODE_LIBRARY).
const CATEGORY_COLOURS = {
   environment: "#6b7280",
   initialisation: "#2563eb",
   computation: "#7c3aed",
   pattern: "#d97706",
   presentation: "#0891b2",
   output: "#16a34a",
};

function ParamControl({ param }) {
   const [value, setValue] = useState(param.value);

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
                  onChange={(e) => setValue(Number(e.target.value))}
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
            <select value={value} onChange={(e) => setValue(e.target.value)}>
               {param.options.map((opt) => (
                  <option key={opt} value={opt}>
                     {opt}
                  </option>
               ))}
            </select>
         </label>
      );
   }

   return (
      <div className="param-control param-fixed">
         <span className="param-label">{param.param}</span>
         <span className="param-value">{String(param.value)}</span>
      </div>
   );
}

export default function WorkflowNode({ data }) {
   const colour = CATEGORY_COLOURS[NODE_LIBRARY[data.nodeType]?.category] ?? "#6b7280";

   return (
      <div className="workflow-node" style={{ borderColor: colour }}>
         <Handle type="target" position={Position.Left} />
         <div className="workflow-node-header" style={{ background: colour }}>
            {data.label}
         </div>
         {data.params.length > 0 && (
            <div className="workflow-node-body">
               {data.params.map((param) => (
                  <ParamControl key={param.param} param={param} />
               ))}
            </div>
         )}
         <Handle type="source" position={Position.Right} />
      </div>
   );
}
