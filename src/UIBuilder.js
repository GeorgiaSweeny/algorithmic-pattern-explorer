/*
========================================
UI BUILDER
========================================
*/

import { ARCHETYPES } from "./archetypes.js";

// Builds DOM controls from a pattern definition.
// Calls binder for state reads/writes — knows nothing about generators.
export class UIBuilder {
   build(pattern, binder, regen) {
      const frag = document.createDocumentFragment();
      const syncFns = [];

      for (const paramDef of pattern.params) {
         if (paramDef.archetype) {
            const { el, sync } = this._buildSlider(paramDef, binder, regen);
            if (el) { frag.appendChild(el); syncFns.push(sync); }
         } else if (paramDef.control) {
            const el = this._buildSelect(paramDef, binder, regen);
            if (el) frag.appendChild(el);
         }
      }

      const syncAll = () => syncFns.forEach(fn => fn(binder));

      for (const action of pattern.actions ?? []) {
         frag.appendChild(this._buildAction(action, binder, regen, syncAll));
      }

      return frag;
   }

   _buildSlider(paramDef, binder, regen) {
      const arch = ARCHETYPES[paramDef.archetype];
      if (!arch) return { el: null, sync: () => {} };

      const row = el("div", "param-row");

      const labelRow = el("div", "param-label");
      const nameSpan = el("span");
      nameSpan.textContent = arch.label;

      const valueSpan = el("span", "param-value");
      valueSpan.textContent = fmt(paramDef.value, arch);
      labelRow.append(nameSpan, valueSpan);

      const input = document.createElement("input");
      input.type      = arch.control === "number" ? "number" : "range";
      input.className = arch.control === "number"
         ? "form-control form-control-sm"
         : "form-range";
      input.min   = arch.min;
      input.max   = arch.max;
      input.step  = arch.step;
      input.value = toUI(paramDef.value, paramDef, arch);

      input.addEventListener("input", () => {
         binder.setFromUI(paramDef.param, parseFloat(input.value), paramDef);
         valueSpan.textContent = fmt(binder.resolve()[paramDef.param], arch);
         regen();
      });

      row.append(labelRow, input);

      const sync = (binder) => {
         const val = binder.resolve()[paramDef.param];
         input.value = toUI(val, paramDef, arch);
         valueSpan.textContent = fmt(val, arch);
      };

      return { el: row, sync };
   }

   _buildSelect(paramDef, binder, regen) {
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
         binder.set(paramDef.param, select.value);
         regen();
      });

      row.append(label, select);
      return row;
   }

   _buildAction(action, binder, regen, syncAll) {
      const btn = document.createElement("button");
      btn.className   = "btn btn-sm btn-outline-light w-100 mt-2";
      btn.textContent = action.label;
      btn.addEventListener("click", () => {
         binder[action.method]?.();
         syncAll();
         regen();
      });
      return btn;
   }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function el(tag, className) {
   const node = document.createElement(tag);
   if (className) node.className = className;
   return node;
}

// Generator value → UI slider position
function toUI(genVal, paramDef, arch) {
   if (!paramDef.map) return genVal;
   const [gMin, gMax] = paramDef.map;
   const t = arch.transform === "log"
      ? Math.log(genVal / gMin) / Math.log(gMax / gMin)
      : (genVal - gMin) / (gMax - gMin);
   return arch.min + (arch.max - arch.min) * t;
}

function fmt(v, arch) {
   if (typeof v !== "number") return String(v);
   return arch.step >= 1
      ? String(Math.round(v))
      : String(parseFloat(v.toPrecision(3)));
}
