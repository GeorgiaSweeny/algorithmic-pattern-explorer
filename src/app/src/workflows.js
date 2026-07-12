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
   islamic: (params) => {
      const base = ["workspace", "grid", "constructionCircle", "radialDivisions", "distanceField"];
      return params.mode === "star-lines"
         ? [...base, "waveform", "colourMapping", "render"]
         : [...base, "colourMapping", "render"];
   },
};

// Maps a registry param key to the node type it belongs to. Cross-checked
// against each generator's source (src/generators/*.js) — e.g. islamic.js's
// `frequency` feeds Colour Mapping's band math in "rosette" mode but feeds
// Waveform's sineWave() directly in "star-lines" mode.
const PARAM_NODE_MAP = {
   noise: (key) => (key === "seed" ? "seed" : "noise"),
   voronoi: (key) => (key === "seed" ? "seed" : key === "tones" ? "colourMapping" : "seedPoints"),
   escher: (key) =>
      key === "bumpType" || key === "bumpAmp"
         ? "edgeDeformation"
         : key === "tones"
         ? "colourMapping"
         : "baseGeometry",
   grid: (key) => (key === "tones" ? "colourMapping" : "baseGeometry"),
   wave: () => "waveform",
   recursive: () => "subdivide",
   islamic: (key, params) => {
      if (key === "segments") return "radialDivisions";
      if (key === "frequency") return params.mode === "star-lines" ? "waveform" : "colourMapping";
      if (key === "tones") return "colourMapping";
      return "grid"; // tileSize, mode
   },
};

/**
 * Builds a ReactFlow-shaped {nodes, edges} graph for one patternRegistry.js
 * entry, following the linear sequence documented in docs/nodes/WORKFLOWS.md.
 * Pure and deterministic: same registryId always produces the same graph.
 */
export function buildWorkflow(registryId) {
   const entry = REGISTRY.find((e) => e.id === registryId);
   if (!entry) throw new Error(`Unknown pattern id: ${registryId}`);

   const params = Object.fromEntries(entry.params.map((p) => [p.param, p.value]));
   const steps = STEP_DEFS[entry.generator](params);
   const mapParam = PARAM_NODE_MAP[entry.generator];

   const typeTotals = {};
   for (const type of steps) typeTotals[type] = (typeTotals[type] ?? 0) + 1;

   const typeSeen = {};
   const nodes = steps.map((type, index) => {
      typeSeen[type] = (typeSeen[type] ?? 0) + 1;
      const repeats = typeTotals[type];
      const nodeParams = entry.params.filter((p) => mapParam(p.param, params) === type);
      return {
         id: `${type}-${index}`,
         type: "workflow",
         position: { x: index * 220, y: 120 },
         data: {
            nodeType: type,
            label: NODE_LIBRARY[type].title + (repeats > 1 ? ` (${typeSeen[type]}/${repeats})` : ""),
            params: nodeParams,
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
