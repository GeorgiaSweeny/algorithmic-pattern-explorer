import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import App from "./App.jsx";
import { REGISTRY } from "../../patternRegistry.js";

/*
* Integration tests for the MVP interaction loop
* PROJECT_SPECIFICATION.md protects as Must: select generator / view
* graph / adjust params / canvas updates. Selecting a ReactFlow node by
* clicking its rendered DOM node (rather than driving App's internal
* state directly) exercises the real onNodeClick wiring, not a
* re-implementation of it.
*/

function selectPatternByName(name) {
   fireEvent.click(screen.getByText(name));
}

function selectWorkflowNodeByLabel(container, label) {
   // Scoped to the ReactFlow graph itself, not the whole app — "Noise" (say)
   // is also a Generator Selection category tag elsewhere on the page, and
   // that's a different button with different behaviour (re-selects a
   // pattern, doesn't select a workflow node).
   const graph = container.querySelector(".react-flow");
   const nodeEl = within(graph).getAllByText(label, { exact: false })[0];
   fireEvent.click(nodeEl);
}

describe("App: pattern selection", () => {
   it("defaults to the first registry entry and shows it in the workflow subtitle", () => {
      const { container } = render(<App />);
      const subtitle = container.querySelector(".workflow-subtitle");
      expect(within(subtitle).getByText(REGISTRY[0].name)).toBeInTheDocument();
   });

   it("switching pattern updates the workflow subtitle to the new pattern's name", () => {
      const other = REGISTRY.find((e) => e.id !== REGISTRY[0].id);
      const { container } = render(<App />);
      selectPatternByName(other.name);
      const subtitle = container.querySelector(".workflow-subtitle");
      expect(within(subtitle).getByText(other.name)).toBeInTheDocument();
   });
});

describe("App: node selection", () => {
   it("only one node's param panel is expanded at a time", () => {
      const { container } = render(<App />);
      selectPatternByName(REGISTRY.find((e) => e.id === "perlin-noise").name);
      selectWorkflowNodeByLabel(container, "Noise");
      // Noise's own "scale" param archetype is Density — should appear once.
      expect(within(container).getAllByText(/Density/).length).toBe(1);
   });
});

describe("App: Reset to Defaults", () => {
   it("resets a changed parameter back to the pattern's registry default", () => {
      const { container } = render(<App />);
      selectPatternByName(REGISTRY.find((e) => e.id === "perlin-noise").name);
      selectWorkflowNodeByLabel(container, "Noise");

      // input[type="range"] directly, not getByRole("slider") — this
      // jsdom/testing-library combination doesn't reliably compute the
      // implicit ARIA role for range inputs, confirmed by direct DOM
      // inspection finding the same elements a role query missed.
      const slider = container.querySelectorAll('input[type="range"]')[0];
      const defaultValue = slider.value;
      fireEvent.change(slider, { target: { value: String(Number(defaultValue) + 1) } });
      expect(container.querySelectorAll('input[type="range"]')[0].value).not.toBe(defaultValue);

      fireEvent.click(screen.getByText("Reset to Defaults"));
      expect(container.querySelectorAll('input[type="range"]')[0].value).toBe(defaultValue);
   });
});

describe("App: Evaluation overlay", () => {
   it("opens from the menu bar and closes via its own close control", () => {
      render(<App />);
      expect(screen.queryByText("Evaluation", { selector: "h2" })).not.toBeInTheDocument();

      fireEvent.click(screen.getByText("Evaluation", { selector: "button" }));
      expect(screen.getByText("Evaluation", { selector: "h2" })).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText("Close evaluation"));
      expect(screen.queryByText("Evaluation", { selector: "h2" })).not.toBeInTheDocument();
   });
});
