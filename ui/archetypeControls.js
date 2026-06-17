/*
========================================
ARCHETYPE CONTROLS
========================================
* Builds individual DOM controls for a single param definition.
* Calls loader for state reads/writes.
* Imports generatorToArchetype/fmt from parameterMapper — the only place gen → UI mapping happens.
-----------------------------------------
*/

import { ARCHETYPES }                          from "../core/archetypes.js";
import { generatorToArchetype, fmt }           from "../core/parameterMapper.js";

export function buildSlider(paramDef, loader, regen) {
   const arch = ARCHETYPES[paramDef.archetype];
   if (!arch) return null;

   const row = el("div", "param-row");

   const labelRow = el("div", "param-label");
   const nameSpan = el("span");
   nameSpan.textContent = arch.label;

   const valueSpan = el("span", "param-value");
   valueSpan.textContent = fmt(paramDef.value, paramDef.archetype);
   labelRow.append(nameSpan, valueSpan);

   const input = document.createElement("input");
   input.type      = arch.control === "number" ? "number" : "range";
   input.className = arch.control === "number"
      ? "form-control form-control-sm"
      : "form-range";
   input.min   = arch.min;
   input.max   = arch.max;
   input.step  = arch.step;
   input.value = generatorToArchetype(paramDef.value, paramDef);

   input.addEventListener("input", () => {
      loader.setFromUI(paramDef.param, parseFloat(input.value), paramDef);
      valueSpan.textContent = fmt(loader.resolve()[paramDef.param], paramDef.archetype);
      regen();
   });

   row.append(labelRow, input);
   return row;
}

export function buildSelect(paramDef, loader, regen) {
   const row   = el("div", "param-row");
   const label = el("label", "param-label d-block mb-1");
   label.textContent = paramDef.label ?? paramDef.param;

   const select = document.createElement("select");
   select.className = "form-select form-select-sm";

   for (const opt of paramDef.options) {
      const option = document.createElement("option");
      option.value       = opt;
      option.textContent = opt[0].toUpperCase() + opt.slice(1);
      if (opt === paramDef.value) option.selected = true;
      select.appendChild(option);
   }

   select.addEventListener("change", () => {
      loader.set(paramDef.param, select.value);
      regen();
   });

   row.append(label, select);
   return row;
}

// ── Utility ───────────────────────────────────────────────────────────────────

function el(tag, className) {
   const node = document.createElement(tag);
   if (className) node.className = className;
   return node;
}
