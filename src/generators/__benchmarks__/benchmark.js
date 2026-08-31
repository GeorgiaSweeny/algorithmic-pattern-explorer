/*
========================================
GENERATOR BENCHMARK SUITE
========================================
* Measures wall-clock time to evaluate each generator over an N x N sample
* grid at increasing N, and separately sweeps each generator's own per-pixel
* cost driver (octaves, numCells, depth, segments, amplitude). Every
* generator is a per-pixel pure function, so grid-size scaling should
* empirically confirm O(N^2); the parameter sweeps distinguish O(1)
* per-pixel generators (grid, wave, escher) from ones whose cost scales
* with a parameter (noise, voronoi, islamic, recursive, recursiveNoise).
*
* Run with: npm run bench   (from src/)
* Writes raw results to __benchmarks__/results.json for the dissertation plots.
*/
import { writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { GENERATORS } from "../index.js";
import { CANVAS } from "../../config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- timing helpers --------------------------------------------------------

function samplePoints(n) {
   const pts = [];
   for (let i = 0; i < n; i++) {
      const x = (i / Math.max(1, n - 1)) * CANVAS.WIDTH;
      for (let j = 0; j < n; j++) {
         const y = (j / Math.max(1, n - 1)) * CANVAS.HEIGHT;
         pts.push([x, y]);
      }
   }
   return pts;
}

// Below this, a single pass is too fast to time reliably (overhead/timer
// resolution dominate). Each trial repeats the pass enough times to reach
// roughly TARGET_MS, with reps derived from a calibration pass rather than
// a fixed point count, since per-point cost varies a lot across this suite.
const TARGET_MS = 8;
const MAX_REPS = 300;

// Median of `trials` timed repetitions, after one untimed warm-up pass (lets the
// JIT settle so the first measured trial isn't penalised for compilation).
function timeMedian(fn, params, points, trials = 7) {
   const calibStart = performance.now();
   for (const [x, y] of points) fn(x, y, params); // warm-up + calibration pass
   const singlePassMs = performance.now() - calibStart;
   const reps = Math.min(MAX_REPS, Math.max(1, Math.round(TARGET_MS / Math.max(singlePassMs, 1e-3))));

   const times = [];
   for (let t = 0; t < trials; t++) {
      const start = performance.now();
      for (let r = 0; r < reps; r++) {
         for (const [x, y] of points) fn(x, y, params);
      }
      times.push((performance.now() - start) / reps);
   }
   times.sort((a, b) => a - b);
   return times[Math.floor(times.length / 2)];
}

// Least-squares slope of log(time) vs log(independent variable): the empirical
// exponent k in time ~ C * var^k. Reported against pixel count for the grid-size
// sweep (1.0 expected: O(1) per pixel, however many pixels there are) and
// against the swept parameter for the others (1.0 = linear per-pixel cost).
// Note this metric under-reports k when there's a non-negligible additive
// constant in the true relationship (time = a + b*var^k) — see the numCells and
// depth sweep commentary in the printed report for a concrete example.
function logLogSlope(xs, ys) {
   const lx = xs.map(Math.log), ly = ys.map(Math.log);
   const n = lx.length;
   const mx = lx.reduce((a, b) => a + b, 0) / n;
   const my = ly.reduce((a, b) => a + b, 0) / n;
   let num = 0, den = 0;
   for (let i = 0; i < n; i++) {
      num += (lx[i] - mx) * (ly[i] - my);
      den += (lx[i] - mx) ** 2;
   }
   return num / den;
}

// ---- benchmark configuration ------------------------------------------------

const GRID_SIZES = [25, 50, 100, 200, 400];

const REPRESENTATIVE_PARAMS = {
   noise:     { scale: 0.01, octaves: 4, lacunarity: 2.0, persistence: 0.5, seed: 1337, mode: "standard" },
   grid:      { shape: "square", tileSize: 40, tones: "2" },
   wave:      { frequency: 0.05, mode: "wave" },
   voronoi:   { numCells: 40, seed: 1337, tones: "2" },
   recursive: { mode: "sierpinski", depth: 4, subdivisions: 3 },
   escher:    { tileSize: 60, bumpAmp: 3, bumpType: "wave" },
   islamic:   { tileSize: 100, segments: 8, frequency: 3, tones: "2" },
   recursiveNoise: { depth: 4, amplitude: 0.25, seed: 1337 },
   voronoiIslamic: { numCells: 20, segments: 8, scale: 0.42, frequency: 3, tones: "2", seed: 1337 },
};

// Each entry sweeps the parameter believed to drive per-pixel cost, at a
// fixed grid size, to isolate that dependence from grid-size scaling.
const PARAM_SWEEPS = {
   noise:     { param: "octaves",  values: [1, 2, 4, 8, 16], gridSize: 150 },
   voronoi:   { param: "numCells", values: [10, 20, 40, 80, 160, 320, 1280, 5120], gridSize: 150 },
   recursive: { param: "depth",    values: [1, 2, 3, 4, 6, 12, 24, 48], gridSize: 150 },
   islamic:   { param: "segments", values: [4, 8, 16, 32, 64, 128], gridSize: 150 },
   recursiveNoise: { param: "amplitude", values: [0, 0.1, 0.25, 0.5, 1.0, 2.0], gridSize: 150 },
   voronoiIslamic: { param: "numCells", values: [5, 10, 20, 40, 80, 160], gridSize: 150 },
};

// ---- run --------------------------------------------------------------------

const results = { gridScaling: {}, paramSweeps: {} };

console.log("=== Grid-size scaling (time to render an N x N sample grid) ===\n");
for (const [name, fn] of Object.entries(GENERATORS)) {
   const params = REPRESENTATIVE_PARAMS[name];
   const rows = GRID_SIZES.map((n) => {
      const points = samplePoints(n);
      const ms = timeMedian(fn, params, points);
      return { n, pixels: points.length, ms };
   });
   const slope = logLogSlope(rows.map((r) => r.pixels), rows.map((r) => r.ms));
   results.gridScaling[name] = { rows, slopeVsPixelCount: slope };

   console.log(`${name}:`);
   for (const r of rows) {
      console.log(`  ${String(r.n).padStart(4)} x ${r.n}  (${String(r.pixels).padStart(7)} px)  ${r.ms.toFixed(2).padStart(8)} ms`);
   }
   console.log(`  empirical exponent vs pixel count: ${slope.toFixed(2)} (1.0 expected: linear in pixel count)\n`);
}

console.log("\n=== Parameter sweeps (fixed grid size, varying per-pixel cost driver) ===\n");
for (const [name, sweep] of Object.entries(PARAM_SWEEPS)) {
   const fn = GENERATORS[name];
   const base = REPRESENTATIVE_PARAMS[name];
   const points = samplePoints(sweep.gridSize);
   const rows = sweep.values.map((v) => {
      const ms = timeMedian(fn, { ...base, [sweep.param]: v }, points);
      return { [sweep.param]: v, ms };
   });
   const slope = logLogSlope(sweep.values, rows.map((r) => r.ms));
   results.paramSweeps[name] = { param: sweep.param, gridSize: sweep.gridSize, rows, slope };

   console.log(`${name} (grid ${sweep.gridSize}x${sweep.gridSize}, varying ${sweep.param}):`);
   for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      // Ratio vs the previous row: for pure O(k) this equals the parameter
      // ratio; climbing toward it suggests an affine relationship (a fixed
      // cost plus a linear term), making the log-log exponent below an
      // under-estimate at these sizes.
      const ratio = i === 0 ? null : r.ms / rows[i - 1].ms;
      const ratioStr = ratio === null ? "" : `  (x${ratio.toFixed(2)})`;
      console.log(`  ${sweep.param}=${String(r[sweep.param]).padStart(4)}  ${r.ms.toFixed(2).padStart(8)} ms${ratioStr}`);
   }
   console.log(`  empirical exponent vs ${sweep.param}: ${slope.toFixed(2)} (1.0 = linear cost per unit of ${sweep.param})\n`);
}

const outPath = join(__dirname, "results.json");
writeFileSync(outPath, JSON.stringify(results, null, 2));
console.log(`\nRaw results written to ${outPath}`);
