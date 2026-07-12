import { describe, it, expect } from "vitest";
import { buildWorkflow, NODE_LIBRARY } from "./workflows.js";

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
   "islamic-star-lines": [
      "workspace",
      "grid",
      "constructionCircle",
      "radialDivisions",
      "distanceField",
      "waveform",
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
});
