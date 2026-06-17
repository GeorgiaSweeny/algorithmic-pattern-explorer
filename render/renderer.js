/*
========================================
GRID RENDERER
========================================
Two rendering modes, same data source:

  "design" — square cells, no annotations.
             Shows the motif as you intended it,
             unconstrained by knitting proportions.

  "chart"  — rectangular cells matching knitting gauge
             (~1.45:1 width:height for 20st/28row DK).
             This IS the distortion — a 5×5 square motif
             will render wider-than-tall here, which is
             accurate: that is how it will knit up.
             Includes gridlines, row numbers, direction
             arrows, and optional repeat marker.

Usage:
  render(canvas, doc, { mode: "design" })
  render(canvas, doc, { mode: "chart", showSymbols: true, ... })

Any option can override the mode defaults.
*/


// ── Mode defaults ─────────────────────────────────────────────────────────────

/*
  Chart cell ratio derived from standard DK gauge:
    20 stitches / 10 cm  →  0.50 cm per stitch (width)
    28 rows    / 10 cm  →  0.357 cm per row   (height)
    ratio: 0.50 / 0.357 ≈ 1.40 : 1

  At screen resolution: cellW=16, cellH=11 gives 1.45:1 — close enough.
  Scale both up proportionally for export.
*/

const MODE_DEFAULTS = {
   design: {
      cellW:          16,
      cellH:          16,    // square — design intent, not knitting reality
      showGridLines:  false,
      showDirections: false,
      showRowNumbers: false,
      showSymbols:    false,
      knittingMode:   "round",
      repeatRegion:   null,
   },
   preview: {
      cellW:          16,
      cellH:          11,    // same ~1.45:1 ratio as chart — true stitch proportions
      showGridLines:  false, // no annotations — shows fabric appearance, not instructions
      showDirections: false,
      showRowNumbers: false,
      showSymbols:    false,
      knittingMode:   "round",
      repeatRegion:   null,
   },
   chart: {
      cellW:          16,
      cellH:          11,    // ~1.45:1 — matches 20st/28row DK gauge
      showGridLines:  true,
      showDirections: true,
      showRowNumbers: true,
      showSymbols:    false,
      knittingMode:   "round",
      repeatRegion:   null,
   },
};


// ── Gutter sizes ──────────────────────────────────────────────────────────────

const GUTTER_LEFT  = 20;   // px — direction arrows
const GUTTER_RIGHT = 30;   // px — row numbers


// ── Gridline styles ───────────────────────────────────────────────────────────

const LINE_CELL = { color: "rgba(0,0,0,0.12)", width: 0.5 };
const LINE_FIVE = { color: "rgba(0,0,0,0.28)", width: 1.0 };
const LINE_TEN  = { color: "rgba(0,0,0,0.50)", width: 1.5 };


// ── Public API ────────────────────────────────────────────────────────────────

export function render(canvas, doc, options = {}) {
   const modeKey  = options.mode ?? "design";
   const defaults = MODE_DEFAULTS[modeKey] ?? MODE_DEFAULTS.design;
   const opts     = { ...defaults, ...options };

   const {
      cellW, cellH,
      showGridLines, showDirections, showRowNumbers,
      showSymbols, knittingMode, repeatRegion,
   } = opts;

   const gutterL = showDirections ? GUTTER_LEFT  : 0;
   const gutterR = showRowNumbers ? GUTTER_RIGHT : 0;

   const logicalW = gutterL + doc.width  * cellW + gutterR;
   const logicalH =           doc.height * cellH;

   // Scale canvas buffer to physical pixels so text and lines are sharp on
   // HiDPI / retina displays. CSS size stays at logical pixels.
   const dpr = window.devicePixelRatio ?? 1;
   canvas.width  = logicalW * dpr;
   canvas.height = logicalH * dpr;
   canvas.style.width  = `${logicalW}px`;
   canvas.style.height = `${logicalH}px`;

   const ctx = canvas.getContext("2d");
   ctx.scale(dpr, dpr);
   ctx.clearRect(0, 0, logicalW, logicalH);

   // Chart needs a white background so gutter text (row numbers, arrows) is legible.
   if (modeKey === "chart") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, logicalW, logicalH);
   }

   _drawCells(ctx, doc, cellW, cellH, gutterL, showSymbols);

   if (showGridLines)  _drawGridLines     (ctx, doc, cellW, cellH, gutterL);
   if (showDirections) _drawDirectionArrows(ctx, doc, cellH, gutterL, knittingMode);
   if (showRowNumbers) _drawRowNumbers     (ctx, doc, cellW, cellH, gutterL);
   if (repeatRegion)   _drawRepeatRegion  (ctx, doc, cellW, cellH, gutterL, repeatRegion);
}

// Returns a Promise<Blob> of the canvas as a PNG.
export function exportPng(canvas) {
   return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
}


// ── Drawing passes ────────────────────────────────────────────────────────────

function _drawCells(ctx, doc, cellW, cellH, gutterL, showSymbols) {
   for (let row = 0; row < doc.height; row++) {
      for (let col = 0; col < doc.width; col++) {
         const colourId = doc.grid[row]?.[col] ?? 0;
         const colour   = doc.palette[colourId] ?? doc.palette[0];
         const x = gutterL + col * cellW;
         const y =           row * cellH;

         ctx.fillStyle = colour.hex;
         ctx.fillRect(x, y, cellW, cellH);

         if (showSymbols && colour.symbol) {
            ctx.fillStyle    = _contrastColour(colour.hex);
            ctx.font         = `${Math.round(cellH * 0.72)}px monospace`;
            ctx.textAlign    = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(colour.symbol, x + cellW / 2, y + cellH / 2);
         }
      }
   }
}

function _drawGridLines(ctx, doc, cellW, cellH, gutterL) {
   // Vertical lines (column dividers)
   for (let col = 0; col <= doc.width; col++) {
      const style = _gridlineStyle(col, doc.width);
      const x     = gutterL + col * cellW;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, doc.height * cellH);
      ctx.strokeStyle = style.color;
      ctx.lineWidth   = style.width;
      ctx.stroke();
   }

   // Horizontal lines (row dividers)
   // Multiples of 5/10 measured from the bottom (bottom-up convention).
   for (let row = 0; row <= doc.height; row++) {
      const rowFromBottom = doc.height - row;
      const style = _gridlineStyle(rowFromBottom, doc.height);
      const y     = row * cellH;
      ctx.beginPath();
      ctx.moveTo(gutterL, y);
      ctx.lineTo(gutterL + doc.width * cellW, y);
      ctx.strokeStyle = style.color;
      ctx.lineWidth   = style.width;
      ctx.stroke();
   }
}

function _drawDirectionArrows(ctx, doc, cellH, gutterL, knittingMode) {
   ctx.font         = `${Math.round(cellH * 0.70)}px sans-serif`;
   ctx.textAlign    = "center";
   ctx.textBaseline = "middle";

   for (let row = 0; row < doc.height; row++) {
      const rowFromBottom = doc.height - row;
      const isRS = (rowFromBottom % 2) === 1;

      let arrow, alpha;
      if (knittingMode === "round") {
         arrow = "←";
         alpha = "rgba(0,0,0,0.40)";
      } else {
         // Flat: RS = right→left (←), WS = left→right (→)
         arrow = isRS ? "←" : "→";
         alpha = isRS ? "rgba(0,0,0,0.40)" : "rgba(60,80,200,0.50)";
      }

      ctx.fillStyle = alpha;
      ctx.fillText(arrow, gutterL / 2, row * cellH + cellH / 2);
   }
}

function _drawRowNumbers(ctx, doc, cellW, cellH, gutterL) {
   const rightEdge = gutterL + doc.width * cellW;

   for (let row = 0; row < doc.height; row++) {
      const label = doc.height - row;   // bottom-up: row 1 = cast-on edge

      // Label every 5th row; always label row 1.
      if (label % 5 !== 0 && label !== 1) continue;

      const isTen = label % 10 === 0;
      ctx.fillStyle    = isTen ? "rgba(0,0,0,0.60)" : "rgba(0,0,0,0.40)";
      ctx.font         = `${isTen ? "bold " : ""}${Math.round(cellH * 0.68)}px sans-serif`;
      ctx.textAlign    = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(label, rightEdge + 4, row * cellH + cellH / 2);
   }
}

function _drawRepeatRegion(ctx, doc, cellW, cellH, gutterL, region) {
   /*
    * A repeat region has three zones (chart reads right-to-left):
    *
    *   POST (left)  |  REPEAT BOX  |  PRE (right)
    *   worked last  |  loop N×     |  worked first
    *
    * region = { startCol, endCol, preCount, postCount }
    * Pre zone  : cols endCol  → doc.width  (right side, outside box)
    * Repeat box: cols startCol → endCol
    * Post zone : cols 0        → startCol  (left side, outside box)
    */

   const RED        = "rgba(200, 40, 40, 0.90)";
   const SHADE      = "rgba(200, 40, 40, 0.06)";
   const BORDER     = 2;
   const LABEL_H    = 13;   // px — zone label strip at top of grid
   const h          = doc.height * cellH;

   // ── Pre-repeat zone (right side) ─────────────────────────────────────────
   if (region.endCol < doc.width) {
      const x = gutterL + region.endCol * cellW;
      const w = (doc.width - region.endCol) * cellW;

      ctx.fillStyle = SHADE;
      ctx.fillRect(x, 0, w, h);

      _drawZoneLabel(ctx, "pre", x + w / 2, RED);
   }

   // ── Post-repeat zone (left side) ─────────────────────────────────────────
   if (region.startCol > 0) {
      const x = gutterL;
      const w = region.startCol * cellW;

      ctx.fillStyle = SHADE;
      ctx.fillRect(x, 0, w, h);

      _drawZoneLabel(ctx, "post", x + w / 2, RED);
   }

   // ── Repeat box — heavy red border ────────────────────────────────────────
   const boxX = gutterL + region.startCol * cellW;
   const boxW = (region.endCol - region.startCol) * cellW;

   ctx.strokeStyle = RED;
   ctx.lineWidth   = BORDER;
   ctx.strokeRect(boxX + BORDER / 2, BORDER / 2, boxW - BORDER, h - BORDER);

   const repeatSt = region.endCol - region.startCol;
   _drawZoneLabel(ctx, `repeat  ×  ${repeatSt} st`, boxX + boxW / 2, RED);
}

// Draws a small labelled tag at the top of a zone column.
function _drawZoneLabel(ctx, text, centreX, colour) {
   const PAD = 4;
   ctx.font = "bold 9px sans-serif";
   ctx.textAlign    = "center";
   ctx.textBaseline = "top";

   const tw = ctx.measureText(text).width;
   // Semi-transparent white pill behind text for legibility
   ctx.fillStyle = "rgba(255,255,255,0.82)";
   ctx.fillRect(centreX - tw / 2 - PAD, 2, tw + PAD * 2, 11);

   ctx.fillStyle = colour;
   ctx.fillText(text, centreX, 3);
}


// ── Helpers ───────────────────────────────────────────────────────────────────

function _gridlineStyle(position, total) {
   if (position === 0 || position === total) return LINE_TEN;
   if (position % 10 === 0) return LINE_TEN;
   if (position % 5  === 0) return LINE_FIVE;
   return LINE_CELL;
}

function _contrastColour(hex) {
   const r = parseInt(hex.slice(1, 3), 16);
   const g = parseInt(hex.slice(3, 5), 16);
   const b = parseInt(hex.slice(5, 7), 16);
   return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "#000" : "#fff";
}
