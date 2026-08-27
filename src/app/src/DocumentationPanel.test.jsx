import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DocumentationPanel from "./DocumentationPanel.jsx";
import { REGISTRY } from "../../patternRegistry.js";

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
         />
      );
      expect(screen.getByText("Randomness")).toBeInTheDocument();
      expect(screen.getByText("Determinism")).toBeInTheDocument();
   });

   it("shows a generic diagram of the node's operation, not a render of the selected pattern", () => {
      const { container } = render(
         <DocumentationPanel
            selectedNode={fakeNode("seed")}
            generator="voronoi"
            entry={voronoiEntry}
         />
      );
      // nodeIllustrations.jsx's diagram, not PatternCanvas's <canvas>/<svg>.
      expect(container.querySelector("svg.node-illustration")).toBeInTheDocument();
      expect(container.querySelector("canvas")).not.toBeInTheDocument();
   });

   it("falls back to placeholder text for a node type with no diagram yet", () => {
      render(
         <DocumentationPanel
            selectedNode={fakeNode("not-a-real-node-type")}
            generator="voronoi"
            entry={voronoiEntry}
         />
      );
      expect(screen.getByText(/no diagram yet/i)).toBeInTheDocument();
   });
});
