/*
========================================
DOCS CONTENT
========================================
* Raw-imports docs/nodes/*.md (Vite's `?raw` loader) for the Node Library
* overlay, so it reads the canonical node-model docs directly rather than a
* second JS transcription that could drift out of sync.
*/

import workspaceDoc from "../../../docs/nodes/core/workspace.md?raw";
import seedDoc from "../../../docs/nodes/core/seed.md?raw";
import baseGeometryDoc from "../../../docs/nodes/core/base-geometry.md?raw";
import gridDoc from "../../../docs/nodes/core/grid.md?raw";
import noiseDoc from "../../../docs/nodes/core/noise.md?raw";
import colourMappingDoc from "../../../docs/nodes/core/colour-mapping.md?raw";
import renderDoc from "../../../docs/nodes/core/render.md?raw";
import seedPointsDoc from "../../../docs/nodes/generation/seed-points.md?raw";
import constructionCircleDoc from "../../../docs/nodes/generation/construction-circle.md?raw";
import distanceFieldDoc from "../../../docs/nodes/computation/distance-field.md?raw";
import latticeIndexDoc from "../../../docs/nodes/computation/lattice-index.md?raw";
import waveformDoc from "../../../docs/nodes/computation/waveform.md?raw";
import radialDivisionsDoc from "../../../docs/nodes/pattern/radial-divisions.md?raw";
import subdivideDoc from "../../../docs/nodes/pattern/subdivide.md?raw";
import edgeDeformationDoc from "../../../docs/nodes/pattern/edge-deformation.md?raw";
import workflowsDoc from "../../../docs/nodes/WORKFLOWS.md?raw";

// Keyed by the same node type keys as workflows.js's NODE_LIBRARY.
export const NODE_LIBRARY_DOCS = {
   workspace: workspaceDoc,
   seed: seedDoc,
   seedPoints: seedPointsDoc,
   baseGeometry: baseGeometryDoc,
   grid: gridDoc,
   constructionCircle: constructionCircleDoc,
   radialDivisions: radialDivisionsDoc,
   noise: noiseDoc,
   distanceField: distanceFieldDoc,
   latticeIndex: latticeIndexDoc,
   waveform: waveformDoc,
   subdivide: subdivideDoc,
   edgeDeformation: edgeDeformationDoc,
   colourMapping: colourMappingDoc,
   render: renderDoc,
};

// Splits WORKFLOWS.md's "## N. Title (`generator.js`)" sections into one
// entry per generator key, matching patternRegistry.js's `generator` field.
// The trailing "## Node-library gap summary" section is dropped simply by
// not matching the heading pattern.
function parseWorkflowSections(source) {
   const lines = source.split("\n");
   const sections = new Map();
   let currentKey = null;
   let currentLines = [];

   function flush() {
      if (currentKey) sections.set(currentKey, currentLines.join("\n").trim());
      currentLines = [];
   }

   for (const line of lines) {
      const heading = line.match(/^## \d+\.\s+.*`([a-zA-Z]+)\.js`/);
      if (heading) {
         flush();
         currentKey = heading[1];
         currentLines.push(line);
      } else if (currentKey) {
         currentLines.push(line);
      }
   }
   flush();
   return sections;
}

export const WORKFLOW_DOCS_BY_GENERATOR = parseWorkflowSections(workflowsDoc);
