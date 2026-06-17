/*
========================================
UI — TOP-LEVEL CONTROLLER
========================================
* Initialises the interface, manages active pattern state,
* and exposes the public API used by main.js.
-----------------------------------------
*/

import { REGISTRY }        from "../patterns/patternRegistry.js";
import { PatternLoader }   from "../runtime/patternLoader.js";
import { ParameterPanel }  from "./parameterPanel.js";
import { buildPatternList} from "./patternList.js";

let _pattern      = null;
let _loader       = null;
let _regen;
let _resolutionEl = null;

const _panel = new ParameterPanel();

export function initUI(regenCallback, resizeCallback) {
   _regen = regenCallback;
   buildCanvasControls(document.getElementById("canvas-controls"), resizeCallback);
   buildPatternList(document.getElementById("pattern-list"), REGISTRY, (pattern) => {
      _loadPattern(pattern);
      _regen();
   });
   _loadPattern(REGISTRY[0]);
}

export function getActiveLoader() { return _loader; }
export function updateResolution(w, h) {
   if (_resolutionEl) _resolutionEl.textContent = `${w} × ${h}`;
}

// ── Canvas controls ───────────────────────────────────────────────────────────

const PRESETS = [
   { label: "Custom",      w: null,  h: null,  desc: "Manual size"             },
   { label: "600 × 600",   w: 600,   h: 600,   desc: "Default square"          },
   { label: "800 × 800",   w: 800,   h: 800,   desc: "Large square"            },
   { label: "1024 × 1024", w: 1024,  h: 1024,  desc: "Print-friendly square"   },
   { label: "1280 × 720",  w: 1280,  h: 720,   desc: "HD landscape"            },
   { label: "1920 × 1080", w: 1920,  h: 1080,  desc: "Full HD"                 },
   { label: "1080 × 1350", w: 1080,  h: 1350,  desc: "Instagram portrait"      },
   { label: "1200 × 630",  w: 1200,  h: 630,   desc: "Social media / OG image" },
];

function buildCanvasControls(container, resizeCallback) {
   const presetRow   = document.createElement("div");
   presetRow.className = "param-row";
   const presetLabel = document.createElement("label");
   presetLabel.className   = "param-label d-block mb-1";
   presetLabel.textContent = "Preset";

   const select = document.createElement("select");
   select.className = "form-select form-select-sm";
   for (const p of PRESETS) {
      const opt = document.createElement("option");
      opt.value       = p.label;
      opt.textContent = p.desc ? `${p.label} — ${p.desc}` : p.label;
      select.appendChild(opt);
   }
   presetRow.append(presetLabel, select);
   container.appendChild(presetRow);

   const sliders    = {};
   const valueSpans = {};

   for (const dim of ["Width", "Height"]) {
      const row = document.createElement("div");
      row.className = "param-row";

      const labelRow = document.createElement("div");
      labelRow.className = "param-label";
      const nameSpan = document.createElement("span");
      nameSpan.textContent = dim;
      const valueSpan = document.createElement("span");
      valueSpan.className = "param-value";
      labelRow.append(nameSpan, valueSpan);

      const input = document.createElement("input");
      input.type      = "range";
      input.className = "form-range";
      input.min   = 100;
      input.max   = 1920;
      input.step  = 10;
      input.value = 600;
      valueSpan.textContent = "600";

      input.addEventListener("input", () => {
         select.value = "Custom";
         valueSpan.textContent = input.value;
         applyResize();
      });

      sliders[dim]    = input;
      valueSpans[dim] = valueSpan;
      row.append(labelRow, input);
      container.appendChild(row);
   }

   select.addEventListener("change", () => {
      const preset = PRESETS.find(p => p.label === select.value);
      if (!preset || preset.w === null) return;
      sliders["Width"].value           = preset.w;
      sliders["Height"].value          = preset.h;
      valueSpans["Width"].textContent  = preset.w;
      valueSpans["Height"].textContent = preset.h;
      applyResize();
   });

   select.value = "600 × 600";

   _resolutionEl = document.createElement("div");
   _resolutionEl.className   = "resolution-display";
   _resolutionEl.textContent = "600 × 600";
   container.appendChild(_resolutionEl);

   function applyResize() {
      const w = parseInt(sliders["Width"].value);
      const h = parseInt(sliders["Height"].value);
      updateResolution(w, h);
      resizeCallback(w, h);
   }
}

// ── Pattern loading ───────────────────────────────────────────────────────────

function _loadPattern(pattern) {
   _pattern = pattern;
   _loader  = new PatternLoader(pattern);

   const container = document.getElementById("params-container");
   container.innerHTML = "";
   container.appendChild(_panel.build(pattern, _loader, _regen));
}
