/*
========================================
STAGE PREVIEW — TESTS
========================================
* Pure-logic tests for the per-node intermediate canvas state mechanism.
* Visual correctness was checked by hand; these tests lock in the *rules
* table* itself — which stages get which kind of override, and that
* param-override rules actually merge onto the base params.
*/
import { describe, it, expect } from "vitest";
import {
   resolvePreview,
   seedPointsRasterValue,
   seedPointsSvg,
   rawDistanceSvg,
   baseShapeSvg,
   baseShapeRasterValue,
} from "./stagePreview.js";
import { generateSeedPoints } from "../../generators/lib/seedPoints.js";

describe("resolvePreview: rules table", () => {
   it("recursive: subdivide stage overrides depth to the step's own occurrence", () => {
      const rule = resolvePreview("recursive", "subdivide", { depth: 6 }, { occurrence: 3 });
      expect(rule).toEqual({ kind: "override", overrides: { depth: 3 } });
   });

   it("recursiveNoise: subdivide stage overrides depth to the step's own occurrence", () => {
      const rule = resolvePreview("recursiveNoise", "subdivide", { depth: 6 }, { occurrence: 3 });
      expect(rule).toEqual({ kind: "override", overrides: { depth: 3 } });
   });

   it("recursiveNoise: noise stage is a noiseDiff preview at this level's own occurrence depth, zeroing only that level's own amplitudeN", () => {
      const rule = resolvePreview("recursiveNoise", "noise", { depth: 6 }, { occurrence: 3 });
      expect(rule).toEqual({ kind: "noiseDiff", overrides: { depth: 3 }, zeroParam: "amplitude3" });
   });

   it("recursive/recursiveNoise: falls back to the base depth if occurrence is missing", () => {
      const rule = resolvePreview("recursive", "subdivide", { depth: 4 }, undefined);
      expect(rule.overrides.depth).toBe(4);
   });

   it("recursive/recursiveNoise: baseGeometry stage is a baseShape preview (a bordered square, not a plain depth: 0 override)", () => {
      for (const gen of ["recursive", "recursiveNoise"]) {
         expect(resolvePreview(gen, "baseGeometry", { depth: 6 }, {})).toEqual({ kind: "baseShape" });
      }
   });

   it("recursive/recursiveNoise: no rule for any other node type", () => {
      expect(resolvePreview("recursive", "colourMapping", {}, {})).toBeNull();
   });

   it("workspace stage is always a blank canvas, across every generator", () => {
      for (const gen of [
         "recursive", "recursiveNoise", "escher", "grid", "islamic",
         "voronoi", "voronoiIslamic", "voronoiIslamicV2", "wave",
      ]) {
         expect(resolvePreview(gen, "workspace", {}, {})).toEqual({ kind: "blank" });
      }
   });

   it("escher: baseGeometry stage forces bumpAmp to 0", () => {
      expect(resolvePreview("escher", "baseGeometry", {}, {})).toEqual({
         kind: "override",
         overrides: { bumpAmp: 0 },
      });
      expect(resolvePreview("escher", "edgeDeformation", {}, {})).toBeNull();
   });

   it("grid: latticeIndex stage forces tones to \"2\"", () => {
      expect(resolvePreview("grid", "latticeIndex", {}, {})).toEqual({
         kind: "override",
         overrides: { tones: "2" },
      });
   });

   it("islamic: grid stage shrinks scale; constructionCircle/radialDivisions widen echo spacing", () => {
      expect(resolvePreview("islamic", "grid", {}, {})).toEqual({
         kind: "override",
         overrides: { scale: 0.03 },
      });
      expect(resolvePreview("islamic", "constructionCircle", {}, {})).toEqual({
         kind: "override",
         overrides: { frequency: 1 },
      });
      expect(resolvePreview("islamic", "radialDivisions", {}, {})).toEqual({
         kind: "override",
         overrides: { frequency: 1 },
      });
      expect(resolvePreview("islamic", "distanceField", {}, {})).toBeNull();
   });

   it("voronoi/voronoiIslamic/voronoiIslamicV2: seedPoints stage is a dedicated preview, not a param override", () => {
      expect(resolvePreview("voronoi", "seedPoints", {}, {})).toEqual({ kind: "seedPoints" });
      expect(resolvePreview("voronoiIslamic", "seedPoints", {}, {})).toEqual({ kind: "seedPoints" });
      expect(resolvePreview("voronoiIslamicV2", "seedPoints", {}, {})).toEqual({ kind: "seedPoints" });
   });

   it("wave: distanceField stage is a dedicated preview only in rings mode", () => {
      expect(resolvePreview("wave", "distanceField", { mode: "rings" }, {})).toEqual({ kind: "rawDistance" });
      expect(resolvePreview("wave", "distanceField", { mode: "wave" }, {})).toBeNull();
   });

   it("noise: no per-generator rule beyond workspace's blank canvas (falls through to final output otherwise)", () => {
      expect(resolvePreview("noise", "workspace", {}, {})).toEqual({ kind: "blank" });
      for (const nodeType of ["seed", "noise", "colourMapping", "render"]) {
         expect(resolvePreview("noise", nodeType, {}, {})).toBeNull();
      }
   });
});

describe("seedPointsRasterValue", () => {
   it("is deterministic for a fixed (numCells, seed) — matches lib/seedPoints.js's own generateSeedPoints", () => {
      const params = { numCells: 10, seed: 7 };
      const a = seedPointsRasterValue(50, 50, params);
      const b = seedPointsRasterValue(50, 50, params);
      expect(a).toBe(b);
   });

   it("returns the dark value only within dotRadius of an actual generated point", () => {
      // Re-derive the first point directly to place a probe exactly on it.
      const points = generateSeedPoints(10, 7);
      const [px, py] = points;
      expect(seedPointsRasterValue(px, py, { numCells: 10, seed: 7 })).toBe(-1);
      // Far from every point (canvas corner opposite a mid-canvas cluster) should be background.
      expect(seedPointsRasterValue(-10000, -10000, { numCells: 10, seed: 7 })).toBe(1);
   });
});

describe("seedPointsSvg / rawDistanceSvg", () => {
   it("seedPointsSvg emits exactly one circle per generated seed point", () => {
      const points = generateSeedPoints(12, 99);
      const svg = seedPointsSvg(600, 600, { numCells: 12, seed: 99 });
      const circleCount = (svg.match(/<circle/g) ?? []).length;
      expect(circleCount).toBe(points.length / 2);
   });

   it("rawDistanceSvg produces a valid SVG string sized to the given dimensions", () => {
      const svg = rawDistanceSvg(400, 300);
      expect(svg).toContain('width="400"');
      expect(svg).toContain('height="300"');
      expect(svg.startsWith("<svg")).toBe(true);
   });

   it("baseShapeSvg draws a solid-colour marker well under the full canvas size, centred on it — not a full-bleed fill", () => {
      const svg = baseShapeSvg(400, 400, { colour1: "#ffffff", colour2: "#000000" });
      const [, x, y, w, h] = svg.match(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)" fill="#000000"/);
      expect(Number(w)).toBeLessThan(400);
      expect(Number(h)).toBeLessThan(400);
      // Centred: equal space on both sides.
      expect(Number(x)).toBeCloseTo(400 - Number(x) - Number(w), 5);
      expect(Number(y)).toBeCloseTo(400 - Number(y) - Number(h), 5);
   });
});

describe("baseShapeRasterValue", () => {
   it("is the dark value at the canvas centre and the light value near the edges", () => {
      expect(baseShapeRasterValue(200, 200, 400, 400)).toBe(-1);
      expect(baseShapeRasterValue(2, 2, 400, 400)).toBe(1);
      expect(baseShapeRasterValue(398, 398, 400, 400)).toBe(1);
   });
});
