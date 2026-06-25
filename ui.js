/*
========================================
UI
========================================
*/

import { REGISTRY }       from "./patternRegistry.js";
import { PatternBinder }  from "./PatternBinder.js";
import { UIBuilder }      from "./UIBuilder.js";
import { SVG_GENERATORS } from "./generators/svg/index.js";
import { CANVAS }         from "./config.js";

let _p5Redraw = null;   // raw p5 redraw fn — used only for raster patterns
let _pattern  = null;
let _binder   = null;

const _builder = new UIBuilder();

export function initUI(p5RedrawFn) {
   _p5Redraw = p5RedrawFn;
   buildPatternList(document.getElementById("pattern-list"));
   loadPattern(REGISTRY[0]);
   // Raster initial draw happens naturally from p5's first draw() call.
}

export function getActiveGenName() { return _pattern?.generator; }
export function getActiveBinder()  { return _binder; }

// ── Render dispatch ───────────────────────────────────────────────────────────

function _render() {
   if (_pattern.nativeFormat === "raster") {
      _showRaster();
      _p5Redraw();
   } else {
      _renderSvg();
   }
}

function _renderSvg() {
   const fn     = SVG_GENERATORS[_pattern.generator];
   const markup = fn(CANVAS.WIDTH, CANVAS.HEIGHT, _binder.resolve());

   // Parse SVG string into a real element so it's part of the live DOM.
   const tmp = document.createElement("div");
   tmp.innerHTML = markup;
   const svgEl = tmp.firstElementChild;
   svgEl.id = "svg-canvas";

   const container = document.getElementById("canvas-container");
   document.getElementById("svg-canvas")?.remove();
   container.appendChild(svgEl);

   // Hide p5 canvas while SVG is showing.
   const rasterCanvas = container.querySelector("canvas");
   if (rasterCanvas) rasterCanvas.style.display = "none";
}

function _showRaster() {
   document.getElementById("svg-canvas")?.remove();
   const rasterCanvas = document.querySelector("#canvas-container canvas");
   if (rasterCanvas) rasterCanvas.style.display = "";
}

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
            _render();
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
   container.appendChild(_builder.build(pattern, _binder, _render));

   updateSpectrum(pattern);
   updateExportControls(pattern);
}

// ── Spectrum bar ──────────────────────────────────────────────────────────────

const SPECTRUM_LABELS = [
   { max: 0.2,  text: "Predominantly stochastic" },
   { max: 0.4,  text: "Mostly stochastic" },
   { max: 0.6,  text: "Hybrid" },
   { max: 0.8,  text: "Mostly deterministic" },
   { max: 1.01, text: "Highly deterministic" },
];

function updateSpectrum(pattern) {
   const pct = (pattern.spectrum ?? 0.5) * 100;
   document.getElementById("spectrum-marker").style.left = `${pct}%`;

   const entry = SPECTRUM_LABELS.find(e => pattern.spectrum < e.max);
   document.getElementById("spectrum-description").textContent = entry?.text ?? "";
}

// ── Export controls ───────────────────────────────────────────────────────────

function updateExportControls(pattern) {
   const container = document.getElementById("export-controls");
   container.innerHTML = "";

   if (SVG_GENERATORS[pattern.generator]) {
      container.appendChild(_exportBtn("SVG", "svg", () => _exportSvg()));
   }

   container.appendChild(_exportBtn("PNG", "png", () => _exportPng()));
}

function _exportBtn(format, cssClass, onClick) {
   const btn = document.createElement("button");
   btn.className = `btn btn-sm btn-outline-secondary export-btn ${cssClass}`;
   btn.innerHTML = `Export <span class="export-format-tag">${format}</span>`;
   btn.addEventListener("click", onClick);
   return btn;
}

function _exportSvg() {
   const fn  = SVG_GENERATORS[_pattern.generator];
   const svg = fn(CANVAS.WIDTH, CANVAS.HEIGHT, _binder.resolve());
   _download(new Blob([svg], { type: "image/svg+xml" }), `${_pattern.id}.svg`);
}

function _exportPng() {
   if (SVG_GENERATORS[_pattern.generator]) {
      // Vector pattern: rasterise the SVG to an offscreen canvas.
      const fn  = SVG_GENERATORS[_pattern.generator];
      const svg = fn(CANVAS.WIDTH, CANVAS.HEIGHT, _binder.resolve());
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      const img = new Image();
      img.onload = () => {
         const offscreen = document.createElement("canvas");
         offscreen.width  = CANVAS.WIDTH;
         offscreen.height = CANVAS.HEIGHT;
         offscreen.getContext("2d").drawImage(img, 0, 0);
         offscreen.toBlob(blob => {
            _download(blob, `${_pattern.id}.png`);
            URL.revokeObjectURL(url);
         }, "image/png");
      };
      img.src = url;
   } else {
      // Raster pattern: export directly from p5 canvas.
      const canvas = document.querySelector("#canvas-container canvas");
      if (canvas) canvas.toBlob(blob => _download(blob, `${_pattern.id}.png`), "image/png");
   }
}

function _download(blob, filename) {
   const url = URL.createObjectURL(blob);
   const a   = document.createElement("a");
   a.href     = url;
   a.download = filename;
   a.click();
   URL.revokeObjectURL(url);
}
