/*
========================================
UI
========================================
*/

import { REGISTRY }      from "./patternRegistry.js";
import { PatternBinder } from "./PatternBinder.js";
import { UIBuilder }     from "./UIBuilder.js";

let _pattern = null;
let _binder  = null;
let _regen;

const _builder = new UIBuilder();

export function initUI(regenCallback) {
   _regen = regenCallback;
   buildPatternList(document.getElementById("pattern-list"));
   loadPattern(REGISTRY[0]);
}

export function getActiveGenName() { return _pattern?.generator; }
export function getActiveBinder()  { return _binder; }

// ── Pattern selector ──────────────────────────────────────────────────────────

function buildPatternList(container) {
   const byCategory = {};
   for (const pattern of REGISTRY) {
      (byCategory[pattern.category] ??= []).push(pattern);
   }

   for (const [category, patterns] of Object.entries(byCategory)) {
      const catLabel = document.createElement("div");
      catLabel.className   = "pattern-category-label";
      catLabel.textContent = category;
      container.appendChild(catLabel);

      for (const pattern of patterns) {
         const div = document.createElement("div");
         div.className = "form-check";

         const input = document.createElement("input");
         input.type      = "radio";
         input.className = "form-check-input";
         input.name      = "pattern";
         input.id        = `pat-${pattern.id}`;
         input.value     = pattern.id;
         if (pattern === REGISTRY[0]) input.checked = true;

         const label = document.createElement("label");
         label.className   = "form-check-label";
         label.htmlFor     = `pat-${pattern.id}`;
         label.textContent = pattern.name;

         input.addEventListener("change", () => {
            loadPattern(pattern);
            _regen();
         });

         div.append(input, label);
         container.appendChild(div);
      }
   }
}

function loadPattern(pattern) {
   _pattern = pattern;
   _binder  = new PatternBinder(pattern);

   const container = document.getElementById("params-container");
   container.innerHTML = "";
   container.appendChild(_builder.build(pattern, _binder, _regen));
}
