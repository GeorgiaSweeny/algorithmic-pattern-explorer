/*
========================================
WORKSPACE CONTROLLER
========================================
Wires up all panels, manages mode state,
and is the only module that reads/writes
to the DOM.

Sections:
  initWorkspace(doc)    — call once from main.js
  _syncMode()           — show/hide panels for active mode
  _buildLibrary()       — left panel: library list
  _buildToolPalette()   — left panel: tool buttons
  _buildPaletteUI()     — right panel: palette selector + colour swatches
  _buildChartOptions()  — right panel: chart display toggles + knitting mode
  _buildExportPanel()   — right panel: export button
  _redraw()             — re-renders canvas from current doc + options
*/

import { render, exportPng } from "../render/renderer.js";
import { LIBRARY }           from "../data/library.js";
import { PALETTES }          from "../data/palettes.js";

// ── Module state ──────────────────────────────────────────────────────────────

let _doc    = null;
let _mode   = "design";   // "design" | "chart" | "export"
let _canvas = null;
let _activeColourId = 1;  // colour currently selected for drawing

// Chart options passed to renderer — kept in sync with UI controls.
const _chartOpts = {
   showSymbols:    false,
   showRowNumbers: true,
   showDirections: true,
   showGridLines:  true,
   knittingMode:   "round",   // "round" | "flat"
   repeatRegion:   null,      // { startCol, endCol } or null
};

// ── Public API ────────────────────────────────────────────────────────────────

export function initWorkspace(doc) {
   _doc    = doc;
   _canvas = document.getElementById("pattern-canvas");

   _initModeNav();
   _initLeftPanelTabs();
   _buildLibrary();
   _buildToolPalette();
   _buildPaletteUI();
   _buildChartOptions();
   _buildExportPanel();

   _redraw();
}

export function setDocument(doc) {
   _doc = doc;
   _refreshPaletteColours();
   _refreshColourKey();
   _redraw();
}

// ── Mode navigation ───────────────────────────────────────────────────────────

function _initModeNav() {
   document.querySelectorAll("[data-mode]").forEach(btn => {
      btn.addEventListener("click", () => {
         _mode = btn.dataset.mode;
         document.querySelectorAll("[data-mode]").forEach(b => {
            b.classList.toggle("active", b === btn);
            b.setAttribute("aria-selected", b === btn ? "true" : "false");
         });
         _syncMode();
         _redraw();
      });
   });
}

function _syncMode() {
   document.querySelectorAll("[data-shows-in]").forEach(el => {
      const modes = el.dataset.showsIn.split(" ");
      el.hidden = !modes.includes(_mode);
   });
}

// ── Left panel tabs ───────────────────────────────────────────────────────────

function _initLeftPanelTabs() {
   const tabs     = document.querySelectorAll(".panel-tab");
   const contents = document.querySelectorAll(".tab-content");

   tabs.forEach(tab => {
      tab.addEventListener("click", () => {
         tabs.forEach(t => t.classList.toggle("active", t === tab));
         contents.forEach(c => {
            c.classList.toggle("active", c.dataset.tabContent === tab.dataset.tab);
         });
      });
   });
}

// ── Library ───────────────────────────────────────────────────────────────────

function _buildLibrary() {
   const container = document.getElementById("library-list");
   if (!container) return;

   for (const category of LIBRARY) {
      const heading = document.createElement("div");
      heading.className   = "library-category";
      heading.textContent = category.category;
      container.appendChild(heading);

      for (const pattern of category.patterns) {
         const btn = document.createElement("button");
         btn.className   = "library-item" + (pattern.status === "proxy" ? " proxy" : "");
         btn.textContent = pattern.name;
         btn.dataset.id  = pattern.id;
         if (pattern.status === "proxy") {
            btn.title = "Coming soon";
         } else {
            btn.addEventListener("click", () => _onLibrarySelect(btn, pattern.id));
         }
         container.appendChild(btn);
      }
   }

   container.querySelector(".library-item:not(.proxy)")?.classList.add("active");
}

function _onLibrarySelect(btn, id) {
   document.querySelectorAll(".library-item").forEach(b => b.classList.remove("active"));
   btn.classList.add("active");
   // Future: import a different PatternDocument based on id
}

// ── Tool palette ──────────────────────────────────────────────────────────────

const TOOLS = [
   { id: "draw",     label: "Draw",     icon: "✏️"  },
   { id: "fill",     label: "Fill",     icon: "🪣"  },
   { id: "erase",    label: "Erase",    icon: "◻️"  },
   { id: "generate", label: "Generate", icon: "✦"   },
];

function _buildToolPalette() {
   const container = document.getElementById("tool-palette");
   if (!container) return;

   for (const tool of TOOLS) {
      const btn = document.createElement("button");
      btn.className    = "tool-btn";
      btn.dataset.tool = tool.id;
      btn.innerHTML    = `<span class="tool-icon">${tool.icon}</span>
                          <span class="tool-label">${tool.label}</span>`;
      btn.addEventListener("click", () => _onToolSelect(btn));
      container.appendChild(btn);
   }

   container.querySelector("[data-tool='draw']")?.classList.add("active");
}

function _onToolSelect(btn) {
   document.querySelectorAll(".tool-btn").forEach(b => b.classList.remove("active"));
   btn.classList.add("active");
   // Future: activate the corresponding tool handler on the canvas
}

// ── Palette UI ────────────────────────────────────────────────────────────────

function _buildPaletteUI() {
   _buildPaletteSelector();
   _refreshPaletteColours();
   _refreshActiveColourDisplay();
}

function _buildPaletteSelector() {
   const select = document.getElementById("palette-selector");
   if (!select) return;

   for (const palette of PALETTES) {
      const opt = document.createElement("option");
      opt.value       = palette.id;
      opt.textContent = palette.name;
      select.appendChild(opt);
   }

   select.addEventListener("change", () => {
      const p = PALETTES.find(p => p.id === select.value);
      if (!p) return;
      _doc.palette    = p.colours;
      _activeColourId = Math.min(_activeColourId, p.colours.length - 1);
      _refreshPaletteColours();
      _refreshColourKey();
      _refreshActiveColourDisplay();
      _redraw();
   });
}

function _refreshPaletteColours() {
   const container = document.getElementById("palette-colours");
   if (!container) return;
   container.innerHTML = "";

   for (const colour of _doc.palette) {
      const row = document.createElement("div");
      row.className = "colour-swatch-row" + (colour.id === _activeColourId ? " active" : "");
      row.innerHTML = `
         <div class="colour-swatch" style="background:${colour.hex}"></div>
         <div class="colour-info">
            <span class="colour-name">${colour.name}</span>
            <span class="colour-symbol">${colour.symbol}</span>
         </div>`;
      row.addEventListener("click", () => {
         _activeColourId = colour.id;
         _refreshPaletteColours();
         _refreshActiveColourDisplay();
      });
      container.appendChild(row);
   }
}

function _refreshActiveColourDisplay() {
   const container = document.getElementById("active-colour-display");
   if (!container) return;
   const colour = _doc.palette[_activeColourId] ?? _doc.palette[0];
   container.innerHTML = `
      <div class="active-colour-swatch" style="background:${colour.hex}"></div>
      <span class="active-colour-name">${colour.name}</span>`;
}

// ── Chart options ─────────────────────────────────────────────────────────────

function _buildChartOptions() {
   _buildKnittingMode();
   _buildDisplayToggles();
   _buildRepeatControls();
   _refreshColourKey();
}

function _buildKnittingMode() {
   document.querySelectorAll("[data-knitting-mode]").forEach(btn => {
      btn.addEventListener("click", () => {
         document.querySelectorAll("[data-knitting-mode]").forEach(b => b.classList.remove("active"));
         btn.classList.add("active");
         _chartOpts.knittingMode = btn.dataset.knittingMode;
         _updateDirectionNote();
         _redraw();
      });
   });
}

function _updateDirectionNote() {
   const note = document.getElementById("direction-note");
   if (!note) return;
   if (_chartOpts.knittingMode === "round") {
      note.innerHTML = "Every round is read <strong>right → left (←)</strong>.";
   } else {
      note.innerHTML =
         "RS rows: <strong>right → left (←)</strong><br>" +
         "WS rows: <strong>left → right (→)</strong>";
   }
}

function _buildDisplayToggles() {
   _bindToggle("toggle-symbols",    v => { _chartOpts.showSymbols    = v; _redraw(); });
   _bindToggle("toggle-row-numbers",v => { _chartOpts.showRowNumbers = v; _redraw(); });
   _bindToggle("toggle-directions", v => { _chartOpts.showDirections = v; _redraw(); });
   _bindToggle("toggle-grid-lines", v => { _chartOpts.showGridLines  = v; _redraw(); });
}

function _buildRepeatControls() {
   const toggleEl   = document.getElementById("toggle-repeat");
   const controlsEl = document.getElementById("repeat-controls");
   const sliderEl   = document.getElementById("repeat-width");
   const valueEl    = document.getElementById("repeat-width-value");
   const preEl      = document.getElementById("repeat-pre");
   const postEl     = document.getElementById("repeat-post");

   if (!toggleEl) return;

   const refresh = () => {
      if (!toggleEl.checked) return;
      _chartOpts.repeatRegion = _buildRepeatRegion();
      _redraw();
   };

   toggleEl.addEventListener("change", () => {
      controlsEl.hidden = !toggleEl.checked;
      _chartOpts.repeatRegion = toggleEl.checked ? _buildRepeatRegion() : null;
      _redraw();
   });

   sliderEl?.addEventListener("input", () => {
      if (valueEl) valueEl.textContent = sliderEl.value;
      refresh();
   });

   preEl?.addEventListener("input",  refresh);
   postEl?.addEventListener("input", refresh);
}

// Derives { startCol, endCol, preCount, postCount } from the three inputs.
// Chart reads right-to-left: pre = right edge, post = left edge.
//   postCount cols  |  repeatWidth cols  |  preCount cols
//   (left / last)   |  (loop this)       |  (right / first)
function _buildRepeatRegion() {
   const pre   = Math.max(0, parseInt(document.getElementById("repeat-pre")?.value  ?? 0));
   const post  = Math.max(0, parseInt(document.getElementById("repeat-post")?.value ?? 0));
   const width = Math.max(1, parseInt(document.getElementById("repeat-width")?.value ?? 10));

   const startCol = post;
   const endCol   = Math.min(_doc.width - pre, startCol + width);

   return { startCol, endCol, preCount: pre, postCount: post };
}

function _refreshColourKey() {
   const container = document.getElementById("chart-colour-key");
   if (!container) return;
   container.innerHTML = "";

   for (const colour of _doc.palette) {
      const row = document.createElement("div");
      row.className = "key-row";
      row.innerHTML = `
         <div class="key-symbol" style="background:${colour.hex}">${colour.symbol}</div>
         <span>${colour.name}</span>`;
      container.appendChild(row);
   }
}

// ── Export ────────────────────────────────────────────────────────────────────

function _buildExportPanel() {
   document.getElementById("btn-export-png")?.addEventListener("click", _doExportPng);
}

async function _doExportPng() {
   // Export always renders in chart mode at 2× scale for print quality.
   // cellW:cellH keeps the ~1.45:1 gauge ratio at higher resolution.
   const exportCanvas = document.createElement("canvas");
   render(exportCanvas, _doc, {
      mode: "chart",
      ..._chartOpts,
      cellW: 32,
      cellH: 22,
   });
   const blob = await exportPng(exportCanvas);
   const url  = URL.createObjectURL(blob);
   const a    = document.createElement("a");
   a.href     = url;
   a.download = (_doc.name ?? "pattern") + ".png";
   a.click();
   URL.revokeObjectURL(url);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _redraw() {
   if (_mode === "design") {
      // Square cells, no annotations — clean design view.
      render(_canvas, _doc, { mode: "design" });
   } else if (_mode === "preview") {
      // Rectangular cells, no annotations — true fabric appearance.
      render(_canvas, _doc, { mode: "preview" });
      _refreshPreviewPanel();
   } else {
      // Chart and export: rectangular cells with full chart annotations.
      render(_canvas, _doc, { mode: "chart", ..._chartOpts });
   }
}

function _refreshPreviewPanel() {
   // Estimated physical size from gauge
   const { stitches, rows } = _doc.metadata.gauge;  // per 10 cm
   const wCm = (_doc.width  / stitches * 10).toFixed(1);
   const hCm = (_doc.height / rows     * 10).toFixed(1);
   const wEl = document.getElementById("preview-size-w");
   const hEl = document.getElementById("preview-size-h");
   if (wEl) wEl.textContent = `${wCm} cm`;
   if (hEl) hEl.textContent = `${hCm} cm`;

   // Stitch count per colour
   const container = document.getElementById("preview-colour-usage");
   if (!container) return;
   container.innerHTML = "";

   const counts = new Map(_doc.palette.map(c => [c.id, 0]));
   for (const row of _doc.grid) {
      for (const id of row) counts.set(id, (counts.get(id) ?? 0) + 1);
   }

   for (const colour of _doc.palette) {
      const total = _doc.width * _doc.height;
      const count = counts.get(colour.id) ?? 0;
      const pct   = ((count / total) * 100).toFixed(0);
      const row   = document.createElement("div");
      row.className = "key-row";
      row.innerHTML = `
         <div class="key-symbol" style="background:${colour.hex}">${colour.symbol}</div>
         <span>${colour.name}</span>
         <span class="colour-pct">${pct}%</span>`;
      container.appendChild(row);
   }
}

function _bindToggle(id, onChange) {
   const el = document.getElementById(id);
   if (el) el.addEventListener("change", () => onChange(el.checked));
}
