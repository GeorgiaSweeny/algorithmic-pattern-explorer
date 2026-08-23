/*
========================================
STRUCTURE/ENTROPY METRICS — SECONDARY RQ EMPIRICAL CONTENT
========================================
* Turns the qualitative claim behind this project's hybrid generators
* (docs/ALGORITHMIC_COMPOSITION_RESEARCH.md's secondary RQ: hybrid
* generators sit on a continuous stochastic/deterministic spectrum, not a
* fixed point on it) into quantitative evidence: sweep each hybrid's own
* "how much randomness" parameter from 0 upward and measure how the
* rendered field's own structure changes.
*
* Two hybrids swept (added 2026-08-21 — originally recursiveNoise.js
* only): recursiveNoise.js's `amplitude` and voronoiIslamic.js's
* `variation` — the same empirical claim checked on two structurally
* different hybrids (a Fork-inside-Repeat vs. a per-cell Constant-bind),
* not asserted once and assumed to generalise.
*
* Two metrics, deliberately simple and independently well-known rather than
* invented for this project:
*
*   - Edge density: the fraction of 4-connected adjacent pixel pairs whose
*     binarised values differ. A direct proxy for how much *boundary* the
*     pattern has — a smooth solid region contributes ~0, a maximally
*     jagged/checkerboard-like one approaches 1.
*   - 2x2 block-pattern Shannon entropy: partition the field into
*     non-overlapping 2x2 blocks, map each to one of 16 possible binary
*     patterns, and compute the Shannon entropy (bits) of the resulting
*     pattern distribution. Low entropy means the field is built from very
*     few distinct local motifs (regular, deterministic structure); entropy
*     approaching 4 bits (log2(16), the maximum for 16 equiprobable
*     patterns) means every local motif is about equally common — the
*     signature of noise-dominated, unstructured output.
*
* Both are computed directly from the same pure `(x, y, params) => value`
* function every other generator satisfies (docs/GENERATOR_CONTRACT.md) —
* no new rendering path, just sampling each generator over a grid the
* same way the app's own PatternCanvas does.
*
* Run with: npm run structure-metrics   (from src/)
* Writes raw results to __benchmarks__/structureMetrics.results.json.
*
* Re-run required 2026-08-21: recursiveNoise.js's `amplitude` no longer
* applies flatly at every recursion level (a linear per-level ramp now,
* see that file's own header comment) — the same nominal `amplitude`
* value produces different pixel output, and so a different
* entropy/edge-density reading, than the previous sweep recorded.
* docs/structure-metrics-results.md's numbers are updated alongside this
* file, not left stale.
*/
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { recursiveNoise } from "../recursiveNoise.js";
import { voronoiIslamic } from "../voronoiIslamic.js";
import { CANVAS } from "../../config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- field sampling ---------------------------------------------------------

function sampleField(fn, params, gridSize) {
   const field = new Int8Array(gridSize * gridSize);
   for (let j = 0; j < gridSize; j++) {
      const y = (j / (gridSize - 1)) * CANVAS.HEIGHT;
      for (let i = 0; i < gridSize; i++) {
         const x = (i / (gridSize - 1)) * CANVAS.WIDTH;
         field[j * gridSize + i] = fn(x, y, params) > 0 ? 1 : 0; // binarised — every generator's range is [-1, 1]
      }
   }
   return field;
}

// ---- metrics -----------------------------------------------------------------

// Fraction of 4-connected adjacent pixel pairs (right + down neighbours,
// counted once each) whose binarised values differ.
function edgeDensity(field, n) {
   let differing = 0, total = 0;
   for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
         const v = field[j * n + i];
         if (i + 1 < n) { total++; if (field[j * n + i + 1] !== v) differing++; }
         if (j + 1 < n) { total++; if (field[(j + 1) * n + i] !== v) differing++; }
      }
   }
   return differing / total;
}

// Shannon entropy (bits) of the distribution of 2x2 block patterns, over
// non-overlapping blocks. Maximum possible is log2(16) = 4 bits.
function blockEntropy(field, n) {
   const counts = new Array(16).fill(0);
   let blocks = 0;
   for (let j = 0; j + 1 < n; j += 2) {
      for (let i = 0; i + 1 < n; i += 2) {
         const pattern =
            (field[j * n + i] << 0) |
            (field[j * n + i + 1] << 1) |
            (field[(j + 1) * n + i] << 2) |
            (field[(j + 1) * n + i + 1] << 3);
         counts[pattern]++;
         blocks++;
      }
   }
   let entropy = 0;
   for (const c of counts) {
      if (c === 0) continue;
      const p = c / blocks;
      entropy -= p * Math.log2(p);
   }
   return entropy;
}

function fillFraction(field) {
   let sum = 0;
   for (const v of field) sum += v;
   return sum / field.length;
}

// ---- sweep configuration ------------------------------------------------------

const GRID_SIZE = 300;
const SEED = 1337;
const AMPLITUDES = [0, 0.02, 0.05, 0.08, 0.12, 0.16, 0.2, 0.25, 0.3, 0.4, 0.5, 0.7, 1.0, 1.5, 2.0];
const VARIATIONS = [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

const SWEEPS = [
   {
      name: "recursiveNoise",
      label: "amplitude",
      fixedParams: { depth: 4, seed: SEED },
      values: AMPLITUDES,
      fn: recursiveNoise,
   },
   {
      name: "voronoiIslamic",
      label: "variation",
      fixedParams: { numCells: 20, segments: 8, scale: 0.35, frequency: 2, seed: SEED },
      values: VARIATIONS,
      fn: voronoiIslamic,
   },
];

// ---- run ------------------------------------------------------------------

const allResults = { gridSize: GRID_SIZE, sweeps: {} };

for (const sweep of SWEEPS) {
   console.log(`=== ${sweep.name}.js structure/entropy sweep (${sweep.label}, grid ${GRID_SIZE}x${GRID_SIZE}) ===\n`);

   const rows = sweep.values.map((value) => {
      const field = sampleField(sweep.fn, { ...sweep.fixedParams, [sweep.label]: value }, GRID_SIZE);
      return {
         [sweep.label]: value,
         fillFraction: fillFraction(field),
         edgeDensity: edgeDensity(field, GRID_SIZE),
         blockEntropyBits: blockEntropy(field, GRID_SIZE),
      };
   });

   for (const r of rows) {
      console.log(
         `${sweep.label}=${r[sweep.label].toFixed(2).padStart(5)}  ` +
         `fill=${r.fillFraction.toFixed(3)}  ` +
         `edgeDensity=${r.edgeDensity.toFixed(4)}  ` +
         `blockEntropy=${r.blockEntropyBits.toFixed(3)} bits`
      );
   }
   console.log("");

   allResults.sweeps[sweep.name] = { label: sweep.label, fixedParams: sweep.fixedParams, rows };
}

const outPath = join(__dirname, "structureMetrics.results.json");
writeFileSync(outPath, JSON.stringify(allResults, null, 2));
console.log(`Raw results written to ${outPath}`);
