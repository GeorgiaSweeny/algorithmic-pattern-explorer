import { REGISTRY } from "../../patternRegistry.js";

// One entry per node type documented in docs/nodes/. `category` drives the
// colour a WorkflowNode renders with (see nodeTypes/WorkflowNode.jsx).
export const NODE_LIBRARY = {
   workspace: { title: "Workspace", category: "environment" },
   seed: { title: "Seed", category: "initialisation" },
   seedPoints: { title: "Seed Points", category: "initialisation" },
   baseGeometry: { title: "Base Geometry", category: "initialisation" },
   grid: { title: "Grid", category: "initialisation" },
   constructionCircle: { title: "Construction Circle", category: "initialisation" },
   radialDivisions: { title: "Radial Divisions", category: "pattern" },
   noise: { title: "Noise", category: "computation" },
   distanceField: { title: "Distance Field", category: "computation" },
   latticeIndex: { title: "Lattice Index", category: "computation" },
   waveform: { title: "Waveform", category: "computation" },
   subdivide: { title: "Subdivide", category: "pattern" },
   edgeDeformation: { title: "Edge Deformation", category: "pattern" },
   colourMapping: { title: "Colour Mapping", category: "presentation" },
   render: { title: "Render", category: "output" },
};

// Node sequence per generator, matching docs/nodes/WORKFLOWS.md exactly.
// `params` is the fixed-default dict built from the selected registry entry.
const STEP_DEFS = {
   noise: () => ["workspace", "seed", "noise", "colourMapping", "render"],
   voronoi: () => ["workspace", "seed", "seedPoints", "distanceField", "colourMapping", "render"],
   escher: () => ["workspace", "baseGeometry", "edgeDeformation", "colourMapping", "render"],
   grid: () => ["workspace", "baseGeometry", "latticeIndex", "colourMapping", "render"],
   wave: (params) =>
      params.mode === "rings"
         ? ["workspace", "distanceField", "waveform", "colourMapping", "render"]
         : ["workspace", "waveform", "colourMapping", "render"],
   recursive: (params) => [
      "workspace",
      "baseGeometry",
      ...Array(Math.max(1, Math.round(params.depth ?? 4))).fill("subdivide"),
      "colourMapping",
      "render",
   ],
   islamic: () => [
      "workspace", "grid", "constructionCircle", "radialDivisions",
      "distanceField", "colourMapping", "render",
   ],
   // Hybrid: Voronoi's own opening two nodes (Seed, Seed Points) feeding
   // directly into islamic.js's existing tail (Construction Circle onward,
   // Grid dropped since cell membership comes from Distance Field's
   // nearestPoint search, not a lattice) — see
   // docs/VORONOI_ISLAMIC_HYBRID_PLAN.md section 4's predicted structure.
   voronoiIslamic: () => [
      "workspace", "seed", "seedPoints", "constructionCircle", "radialDivisions",
      "distanceField", "colourMapping", "render",
   ],
   // Hybrid: each level's own Noise sample warps that level's point before
   // Subdivide runs (see recursiveNoise.js's header comment) — shown as a
   // Noise/Subdivide pair per level, repeated `depth` times, rather than
   // recursive.js's bare Subdivide chain, since the composition genuinely
   // differs (a Fork over Noise feeds each Subdivide step, not just the
   // step itself repeated).
   recursiveNoise: (params) => [
      "workspace",
      "baseGeometry",
      ...Array.from({ length: Math.max(1, Math.round(params.depth ?? 4)) }, () => ["noise", "subdivide"]).flat(),
      "colourMapping",
      "render",
   ],
};

// Maps a registry param key to the node type it belongs to. Cross-checked
// against each generator's source (src/generators/*.js).
const PARAM_NODE_MAP = {
   noise: (key) => (key === "seed" ? "seed" : /^colour\d$/.test(key) ? "colourMapping" : "noise"),
   voronoi: (key) =>
      key === "seed" ? "seed"
      : key === "tones" || /^colour\d$/.test(key) ? "colourMapping"
      : "seedPoints",
   escher: (key) =>
      key === "bumpType" || key === "bumpAmp"
         ? "edgeDeformation"
         : key === "tones" || /^colour\d$/.test(key)
         ? "colourMapping"
         : "baseGeometry",
   grid: (key) => (key === "tones" || /^colour\d$/.test(key) ? "colourMapping" : "baseGeometry"),
   wave: (key) => (/^colour\d$/.test(key) ? "colourMapping" : "waveform"),
   recursive: (key) => (/^colour\d$/.test(key) ? "colourMapping" : "subdivide"),
   islamic: (key) => {
      if (key === "segments" || key === "rotation") return "radialDivisions";
      if (key === "frequency" || key === "tones" || key === "lineWidth" || /^colour\d$/.test(key)) {
         return "colourMapping";
      }
      if (key === "scale") return "constructionCircle";
      return "grid"; // tileSize, tileShape
   },
   recursiveNoise: (key) =>
      key === "depth" ? "subdivide" : /^colour\d$/.test(key) ? "colourMapping" : "noise", // amplitude, seed
   voronoiIslamic: (key) => {
      if (key === "seed") return "seed";
      if (key === "numCells") return "seedPoints";
      if (key === "segments" || key === "rotation" || key === "variation") return "radialDivisions";
      if (key === "scale") return "constructionCircle";
      return "colourMapping"; // frequency, lineWidth, tones
   },
};

/**
 * Builds a ReactFlow-shaped {nodes, edges} graph for one patternRegistry.js
 * entry, following the linear sequence documented in docs/nodes/WORKFLOWS.md.
 * Pure and deterministic: same (registryId, liveParams) always produces the
 * same graph. `liveParams` overrides the registry's static defaults — needed
 * because some params change the graph's own shape (e.g. recursive's `depth`
 * controls how many Subdivide nodes appear, wave's `mode` toggles Distance
 * Field in/out), so the graph must react to the same live state the canvas
 * render does (docs/UI_DESIGN.md's Synchronised Interaction section).
 */
export function buildWorkflow(registryId, liveParams = {}) {
   const entry = REGISTRY.find((e) => e.id === registryId);
   if (!entry) throw new Error(`Unknown pattern id: ${registryId}`);

   const params = {
      ...Object.fromEntries(entry.params.map((p) => [p.param, p.value])),
      ...liveParams,
   };
   const steps = STEP_DEFS[entry.generator](params);
   const mapParam = PARAM_NODE_MAP[entry.generator];

   const typeTotals = {};
   for (const type of steps) typeTotals[type] = (typeTotals[type] ?? 0) + 1;

   const typeSeen = {};
   const nodes = steps.map((type, index) => {
      typeSeen[type] = (typeSeen[type] ?? 0) + 1;
      const repeats = typeTotals[type];
      const nodeParams = entry.params.filter(
         (p) => mapParam(p.param, params) === type && (!p.visibleIf || p.visibleIf(params))
      );
      return {
         id: `${type}-${index}`,
         type: "workflow",
         position: { x: index * 220, y: 120 },
         data: {
            nodeType: type,
            label: NODE_LIBRARY[type].title + (repeats > 1 ? ` (${typeSeen[type]}/${repeats})` : ""),
            params: nodeParams,
            // occurrence/totalOccurrences (added 2026-08-21): the same
            // typeSeen/repeats counters already computed for the "(1/2)"
            // label, exposed as data too — stagePreview.js's depth-
            // truncation preview for recursive.js/recursiveNoise.js needs
            // to know *which* repeated Subdivide step this is, not just
            // that it's a Subdivide step.
            occurrence: typeSeen[type],
            totalOccurrences: repeats,
         },
      };
   });

   const edges = nodes.slice(1).map((node, i) => ({
      id: `e-${nodes[i].id}-${node.id}`,
      source: nodes[i].id,
      target: node.id,
   }));

   return { nodes, edges };
}
