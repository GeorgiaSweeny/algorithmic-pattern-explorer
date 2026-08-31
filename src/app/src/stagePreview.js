/*
========================================
STAGE PREVIEW
========================================
* Per-node intermediate canvas state: a declarative table mapping
* (generator, nodeType) to either a *params override* — re-run the
* pattern's existing generator/SVG function with a modified param — or,
* for stages with no reducing param (seed points, wave's rings-mode
* distance field), a small dedicated preview renderer. Stages with no rule
* below fall through to the pattern's real current output.
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
