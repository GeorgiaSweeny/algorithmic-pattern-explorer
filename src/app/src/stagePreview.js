/*
========================================
STAGE PREVIEW
========================================
* Per-node intermediate canvas state (docs/PROJECT_SPECIFICATION.md calls
* this "the core contribution of the demonstration layer specifically";
* previously deferred — the canvas always showed the final render
* regardless of selected node). One generic mechanism, not nine bespoke
* rendering paths: a declarative table mapping (generator, nodeType) to
* either a *params override* — re-run the pattern's own existing
* generator/SVG-renderer function with a modified param, reusing it
* unchanged rather than adding a second code path into the pure
* `generator(x, y, params)` contract GENERATOR_CONTRACT.md protects — or,
* for the few stages with no reducing param, a small dedicated preview
* renderer (seed points as dots, raw pre-waveform distance as rings).
*
* Six of nine generators need only a params override, since the generator
* already exposes the exact knob that stage's own intermediate state
* needs:
*   - recursive.js / recursiveNoise.js: each repeated Subdivide node
*     shows { depth: <that step's own occurrence number> } — the
*     fractal building up level by level, using `depth` exactly the way
*     every registry entry that exposes it already does.
*   - escher.js: Base Geometry shows { bumpAmp: 0 } — the undeformed
*     tile grid before edge deformation.
*   - grid.js: Lattice Index shows { tones: "2" } — the raw partition
*     structure before the pattern's own chosen tone count is applied.
*   - islamic.js: Grid shows { scale: 0.03 } (tile centroids as
*     near-dots); Construction Circle/Radial Divisions show
*     { frequency: 1 } (silhouette, minimal echo rings).
* Three stages (voronoi.js's and voronoiIslamic.js's Seed Points, wave.js's
* rings-mode Distance Field) have no such reducing param, so they get a
* small dedicated preview renderer instead, reusing lib/seedPoints.js's
* existing generateSeedPoints — not a re-derivation of point placement.
* noise.js and any stage already identical to final (Workspace, Seed, ...)
* have no rule below, so they fall through to the pattern's real current
* output — correct, not a placeholder, just not maximally illustrative.
*/
import { generateSeedPoints } from "../../generators/lib/seedPoints.js";

function override(overrides) {
   return { kind: "override", overrides };
}

const RULES = {
   recursive: (nodeType, params, node) =>
      nodeType === "subdivide" ? override({ depth: node?.occurrence ?? params.depth }) : null,
   recursiveNoise: (nodeType, params, node) =>
      nodeType === "subdivide" ? override({ depth: node?.occurrence ?? params.depth }) : null,
   escher: (nodeType) => (nodeType === "baseGeometry" ? override({ bumpAmp: 0 }) : null),
   grid: (nodeType) => (nodeType === "latticeIndex" ? override({ tones: "2" }) : null),
   islamic: (nodeType) => {
      if (nodeType === "grid") return override({ scale: 0.03 });
      if (nodeType === "constructionCircle" || nodeType === "radialDivisions") return override({ frequency: 1 });
      return null;
   },
   voronoi: (nodeType) => (nodeType === "seedPoints" ? { kind: "seedPoints" } : null),
   voronoiIslamic: (nodeType) => (nodeType === "seedPoints" ? { kind: "seedPoints" } : null),
   wave: (nodeType, params) =>
      nodeType === "distanceField" && params.mode === "rings" ? { kind: "rawDistance" } : null,
};

// `node` is the selected ReactFlow node (has `.occurrence` — see
// workflows.js's buildWorkflow) — optional, only read by the two repeated-
// step generators above.
export function resolvePreview(generatorName, nodeType, params, node) {
   return RULES[generatorName]?.(nodeType, params, node) ?? null;
}

// ── Raster preview renderers (per-pixel) ────────────────────────────────

export function seedPointsRasterValue(x, y, params, dotRadius = 5) {
   const points = generateSeedPoints(params.numCells ?? 20, params.seed ?? 1337);
   const rSq = dotRadius * dotRadius;
   for (let i = 0; i < points.length; i += 2) {
      const dx = x - points[i], dy = y - points[i + 1];
      if (dx * dx + dy * dy <= rSq) return -1;
   }
   return 1;
}

// ── SVG preview renderers (whole-image) ─────────────────────────────────

export function seedPointsSvg(width, height, params, dotRadius = 5) {
   const points = generateSeedPoints(params.numCells ?? 20, params.seed ?? 1337);
   const circles = [];
   for (let i = 0; i < points.length; i += 2) {
      circles.push(`<circle cx="${points[i]}" cy="${points[i + 1]}" r="${dotRadius}" fill="#000"/>`);
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#fff"/>${circles.join("")}</svg>`;
}

export function rawDistanceSvg(width, height) {
   // Concentric rings shaded directly by radius — the same Distance Field
   // value wave.js's own rings mode feeds into sineWave, shown here
   // *before* that periodic transform is applied.
   const cx = width / 2, cy = height / 2;
   const maxR = Math.ceil(Math.hypot(cx, cy));
   const parts = [];
   for (let r = maxR; r >= 0; r--) {
      const c = Math.round((1 - r / maxR) * 255);
      const hex = c.toString(16).padStart(2, "0");
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#${hex}${hex}${hex}"/>`);
   }
   return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" overflow="hidden">${parts.join("")}</svg>`;
}
