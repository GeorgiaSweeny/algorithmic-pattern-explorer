import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DocumentationPanel from "./DocumentationPanel.jsx";
import { REGISTRY } from "../../patternRegistry.js";

// A vector-format pattern (voronoi-cells) so the embedded PatternCanvas
// thumbnail takes the SVG-string branch, not the raster canvas branch —
// avoids depending on the canvas-context stub in test-setup.js for tests
// that aren't specifically about raster rendering.
const voronoiEntry = REGISTRY.find((e) => e.id === "voronoi-cells");

function fakeNode(nodeType, params = []) {
   return { data: { nodeType, params } };
}

describe("DocumentationPanel", () => {
   it("shows a prompt to select a node when nothing is selected", () => {
      render(<DocumentationPanel selectedNode={null} />);
      expect(screen.getByText(/select a node/i)).toBeInTheDocument();
   });

   it("shows the node's title, explanation and purpose for a selected node", () => {
      render(
         <DocumentationPanel
            selectedNode={fakeNode("seed")}
            generator="voronoi"
            entry={voronoiEntry}
            params={{ numCells: 20, seed: 1337, tones: "2" }}
         />
      );
      expect(screen.getByText("Seed")).toBeInTheDocument();
      // nodeDocs.js's own seed explanation text.
      expect(screen.getByText(/pseudo-random number generator/i)).toBeInTheDocument();
   });

   it("lists a description for every param attached to the selected node", () => {
      render(
         <DocumentationPanel
            selectedNode={fakeNode("seedPoints", [
               { param: "numCells", label: "Number of Points", value: 20 },
            ])}
            generator="voronoi"
            entry={voronoiEntry}
            params={{ numCells: 20, seed: 1337, tones: "2" }}
         />
      );
      expect(screen.getByText("Number of Points")).toBeInTheDocument();
   });

   it("renders no Parameters block when the selected node has no params", () => {
      render(
         <DocumentationPanel
            selectedNode={fakeNode("workspace", [])}
            generator="voronoi"
            entry={voronoiEntry}
            params={{}}
         />
      );
      expect(screen.queryByText("Parameters")).not.toBeInTheDocument();
   });

   it("renders the computational thinking concept tags for the selected node", () => {
      render(
         <DocumentationPanel
            selectedNode={fakeNode("seed")}
            generator="voronoi"
            entry={voronoiEntry}
            params={{ numCells: 20, seed: 1337, tones: "2" }}
         />
      );
      expect(screen.getByText("Randomness")).toBeInTheDocument();
      expect(screen.getByText("Determinism")).toBeInTheDocument();
   });
});
