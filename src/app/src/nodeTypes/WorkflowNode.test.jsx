import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import WorkflowNode from "./WorkflowNode.jsx";

// Handle (from @xyflow/react) expects a ReactFlow node context to attach
// to — wrapping in ReactFlowProvider is the standard way to render a
// custom node type in isolation, per @xyflow/react's own testing guidance.
function renderNode(data) {
   return render(
      <ReactFlowProvider>
         <WorkflowNode data={data} />
      </ReactFlowProvider>
   );
}

describe("WorkflowNode", () => {
   it("always shows the node label, even when not selected", () => {
      renderNode({ nodeType: "seed", label: "Seed", params: [], selected: false });
      expect(screen.getByText("Seed")).toBeInTheDocument();
   });

   it("has no expandable body when not selected, even with params", () => {
      renderNode({
         nodeType: "noise",
         label: "Noise",
         params: [{ param: "scale", archetype: "Density", value: 0.01, map: [0.001, 0.05] }],
         selected: false,
      });
      expect(screen.queryByText(/Density/)).not.toBeInTheDocument();
   });

   it("shows param controls only once selected — the 'only one panel open at a time' interaction model", () => {
      renderNode({
         nodeType: "noise",
         label: "Noise",
         params: [{ param: "scale", archetype: "Density", value: 0.01, map: [0.001, 0.05] }],
         selected: true,
      });
      expect(screen.getByText(/Density/)).toBeInTheDocument();
   });

   it("has no expandable body when selected but there are no params and no export actions", () => {
      renderNode({ nodeType: "workspace", label: "Workspace", params: [], selected: true });
      expect(screen.queryByRole("slider")).not.toBeInTheDocument();
   });

   it("a range control calls onParamChange with the param name and the new numeric value", () => {
      const onParamChange = vi.fn();
      renderNode({
         nodeType: "noise",
         label: "Noise",
         params: [{ param: "octaves", archetype: "Detail", value: 1, map: [1, 8] }],
         selected: true,
         onParamChange,
      });
      fireEvent.change(screen.getByRole("slider"), { target: { value: "4" } });
      expect(onParamChange).toHaveBeenCalledWith("octaves", 4);
   });

   it("a 0-1 archetype range (e.g. jitter) renders as a continuous slider with a fine step, not a checkbox stuck at 0 or 1", () => {
      const onParamChange = vi.fn();
      renderNode({
         nodeType: "seedPoints",
         label: "Seed Points",
         params: [{ param: "jitter", archetype: "Randomness (Seed Placement)", value: 0.7, map: [0, 1] }],
         selected: true,
         onParamChange,
      });
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("step", "0.01");
      fireEvent.change(slider, { target: { value: "0.35" } });
      expect(onParamChange).toHaveBeenCalledWith("jitter", 0.35);
   });

   it("a select control calls onParamChange with the param name and the new string value", () => {
      const onParamChange = vi.fn();
      renderNode({
         nodeType: "colourMapping",
         label: "Colour Mapping",
         params: [{ param: "tones", control: "select", label: "Tones", options: ["2", "3"], value: "2" }],
         selected: true,
         onParamChange,
      });
      fireEvent.change(screen.getByRole("combobox"), { target: { value: "3" } });
      expect(onParamChange).toHaveBeenCalledWith("tones", "3");
   });

   it("a fixed param (no archetype/control) renders read-only with its explanatory note, not an editable input", () => {
      renderNode({
         nodeType: "noise",
         label: "Noise",
         params: [{ param: "mode", value: "standard" }],
         selected: true,
      });
      expect(screen.getByText("standard")).toBeInTheDocument();
      expect(screen.getByText(/not a free choice here/i)).toBeInTheDocument();
      expect(screen.queryByRole("slider")).not.toBeInTheDocument();
   });

   it("renders export action buttons on the Render node and invokes their own onClick", () => {
      const onClick = vi.fn();
      renderNode({
         nodeType: "render",
         label: "Render",
         params: [],
         selected: true,
         exportActions: [{ label: "Export PNG", onClick }],
      });
      fireEvent.click(screen.getByText("Export PNG"));
      expect(onClick).toHaveBeenCalledOnce();
   });
});
