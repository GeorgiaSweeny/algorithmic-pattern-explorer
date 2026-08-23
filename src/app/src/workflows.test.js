import { describe, it, expect } from "vitest";
import { buildWorkflow, NODE_LIBRARY } from "./workflows.js";
import { REGISTRY } from "../../patternRegistry.js";

// Expected node-type sequences transcribed directly from docs/nodes/WORKFLOWS.md.
const EXPECTED = {
   "perlin-noise": ["workspace", "seed", "noise", "colourMapping", "render"],
   "ridge-noise": ["workspace", "seed", "noise", "colourMapping", "render"],
   "voronoi-cells": ["workspace", "seed", "seedPoints", "distanceField", "colourMapping", "render"],
   "escher-translation": ["workspace", "baseGeometry", "edgeDeformation", "colourMapping", "render"],
   sierpinski: [
      "workspace",
      "baseGeometry",
      "subdivide",
      "subdivide",
      "subdivide",
      "subdivide",
      "colourMapping",
      "render",
   ], // depth: 4
   "recursive-grid": [
      "workspace",
      "baseGeometry",
      "subdivide",
      "subdivide",
      "subdivide",
      "colourMapping",
      "render",
   ], // depth: 3
   "square-grid": ["workspace", "baseGeometry", "latticeIndex", "colourMapping", "render"],
   "hex-grid": ["workspace", "baseGeometry", "latticeIndex", "colourMapping", "render"],
   "triangle-grid": ["workspace", "baseGeometry", "latticeIndex", "colourMapping", "render"],
   "brick-grid": ["workspace", "baseGeometry", "latticeIndex", "colourMapping", "render"],
   "diamond-grid": ["workspace", "baseGeometry", "latticeIndex", "colourMapping", "render"],
   "wave-stripes": ["workspace", "waveform", "colourMapping", "render"],
   "concentric-rings": ["workspace", "distanceField", "waveform", "colourMapping", "render"],
   "islamic-rosette": [
      "workspace",
      "grid",
      "constructionCircle",
      "radialDivisions",
      "distanceField",
      "colourMapping",
      "render",
   ],
   "perlin-sierpinski": [
      "workspace",
      "baseGeometry",
      "noise", "subdivide",
      "noise", "subdivide",
      "noise", "subdivide",
      "noise", "subdivide",
      "colourMapping",
      "render",
   ], // depth: 4
   "voronoi-islamic": [
      "workspace",
      "seed",
      "seedPoints",
      "constructionCircle",
      "radialDivisions",
      "distanceField",
      "colourMapping",
      "render",
   ],
};

describe("buildWorkflow", () => {
   for (const [id, expectedTypes] of Object.entries(EXPECTED)) {
      it(`${id} matches docs/nodes/WORKFLOWS.md's node sequence`, () => {
         const { nodes, edges } = buildWorkflow(id);
         expect(nodes.map((n) => n.data.nodeType)).toEqual(expectedTypes);
         expect(edges).toHaveLength(nodes.length - 1);
      });

      it(`${id} forms a single linear chain`, () => {
         const { nodes, edges } = buildWorkflow(id);
         edges.forEach((edge, i) => {
            expect(edge.source).toBe(nodes[i].id);
            expect(edge.target).toBe(nodes[i + 1].id);
         });
      });
   }

   it("throws for an unknown registry id", () => {
      expect(() => buildWorkflow("not-a-real-pattern")).toThrow();
   });

   it("every node type used across all workflows exists in NODE_LIBRARY", () => {
      for (const id of Object.keys(EXPECTED)) {
         const { nodes } = buildWorkflow(id);
         for (const node of nodes) {
            expect(NODE_LIBRARY[node.data.nodeType]).toBeDefined();
         }
      }
   });

   it("islamic-rosette's colourN params are gated by visibleIf, tracking live `tones`", () => {
      // patternRegistry.js's colour3/4/5 declare visibleIf so they only
      // appear once `tones` selects that many — the node graph must
      // reflect the *live* tones value passed in, not just the registry's
      // static default, since that's exactly the point of liveParams.
      function colourParams(liveParams) {
         const { nodes } = buildWorkflow("islamic-rosette", liveParams);
         const colourMapping = nodes.find((n) => n.data.nodeType === "colourMapping");
         return colourMapping.data.params.map((p) => p.param).filter((p) => /^colour\d$/.test(p));
      }

      expect(colourParams({})).toEqual(["colour1", "colour2"]);
      expect(colourParams({ tones: "3" })).toEqual(["colour1", "colour2", "colour3"]);
      expect(colourParams({ tones: "5" })).toEqual([
         "colour1", "colour2", "colour3", "colour4", "colour5",
      ]);
      // Dropping back down hides them again — not a one-way reveal.
      expect(colourParams({ tones: "5" })).not.toEqual(colourParams({ tones: "2" }));
   });

   // Regression guard for the bug found 2026-08-21: several patterns had a
   // Colour Mapping node in their graph with zero params ever routed to
   // it (PARAM_NODE_MAP simply had no branch sending them there) — the
   // node was visible and clickable but never opened, since
   // WorkflowNode.jsx's hasBody check is `params.length > 0`. Checks the
   // general property directly, for every pattern and every node type,
   // rather than only the one node type that happened to be reported:
   // every param a REGISTRY entry declares (that isn't currently hidden
   // by its own visibleIf) must be attached to *some* node in that
   // pattern's own graph. A param that resolves (via PARAM_NODE_MAP) to a
   // node type absent from that generator's own STEP_DEFS sequence would
   // silently vanish from the UI entirely — strictly worse than an empty
   // node, since there'd be nowhere to even notice it's missing.
   it("every declared, currently-visible param of every registered pattern is attached to some node in its own graph", () => {
      for (const entry of REGISTRY) {
         const defaults = Object.fromEntries(entry.params.map((p) => [p.param, p.value]));
         const { nodes } = buildWorkflow(entry.id, defaults);
         const attached = new Set(nodes.flatMap((n) => n.data.params.map((p) => p.param)));

         for (const p of entry.params) {
            if (p.visibleIf && !p.visibleIf(defaults)) continue; // legitimately hidden at defaults
            expect(attached.has(p.param), `${entry.id}: "${p.param}" isn't attached to any node`).toBe(true);
         }
      }
   });
});
