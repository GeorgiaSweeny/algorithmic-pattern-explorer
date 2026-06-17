/*
========================================
PARAMETER PANEL
========================================
* Builds the full parameter section for the active pattern.
* Delegates individual controls to archetypeControls.
* Knows nothing about generators or value transforms.
-----------------------------------------
*/

import { buildSlider, buildSelect } from "./archetypeControls.js";

export class ParameterPanel {
   build(pattern, loader, regen) {
      const frag = document.createDocumentFragment();

      for (const paramDef of pattern.params) {
         if (paramDef.archetype) {
            const el = buildSlider(paramDef, loader, regen);
            if (el) frag.appendChild(el);
         } else if (paramDef.control) {
            const el = buildSelect(paramDef, loader, regen);
            if (el) frag.appendChild(el);
         }
      }

      for (const action of pattern.actions ?? []) {
         frag.appendChild(this._buildAction(action, loader, regen));
      }

      return frag;
   }

   _buildAction(action, loader, regen) {
      const btn = document.createElement("button");
      btn.className   = "btn btn-sm btn-outline-light w-100 mt-2";
      btn.textContent = action.label;
      btn.addEventListener("click", () => {
         loader[action.method]?.();
         regen();
      });
      return btn;
   }
}
