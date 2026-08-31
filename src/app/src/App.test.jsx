import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import App from "./App.jsx";
import { REGISTRY } from "../../patternRegistry.js";

/*
* Integration tests for the MVP interaction loop (PROJECT_SPECIFICATION.md's
* Must: select generator / view graph / adjust params / canvas updates).
* Selects ReactFlow nodes by clicking their rendered DOM, exercising the
* real onNodeClick wiring rather than driving App's internal state directly.
*/

function selectPatternByName(container, name) {
   // Generator Selection starts collapsed, showing only the current
   // pattern's name — expand it via "Change Pattern" first, then click the
   // target name scoped to the list (it can also appear elsewhere on the page).
   fireEvent.click(within(container.querySelector(".generator-selection")).getByText("Change Pattern"));
   const list = container.querySelector(".generator-selection");
   fireEvent.click(within(list).getByText(name));
}

function selectWorkflowNodeByLabel(container, label) {
   // Scoped to the ReactFlow graph, not the whole app — a label like "Noise"
   // can also appear as an unrelated category tag elsewhere on the page.
   const graph = container.querySelector(".react-flow");
   const nodeEl = within(graph).getAllByText(label, { exact: false })[0];
   fireEvent.click(nodeEl);
}

describe("App: pattern selection", () => {
   it("defaults to the first registry entry and shows it in the collapsed Generator Selection row", () => {
      const { container } = render(<App />);
      const row = container.querySelector(".generator-selection-collapsed-row");
      expect(within(row).getByText(REGISTRY[0].name)).toBeInTheDocument();
   });

   it("switching pattern updates the collapsed Generator Selection row to the new pattern's name", () => {
      const other = REGISTRY.find((e) => e.id !== REGISTRY[0].id);
      const { container } = render(<App />);
      selectPatternByName(container, other.name);
      const row = container.querySelector(".generator-selection-collapsed-row");
      expect(within(row).getByText(other.name)).toBeInTheDocument();
   });
});

describe("App: node selection and the Documentation Panel", () => {
   it("selecting a workflow node updates the Documentation Panel's Operation field", () => {
      const { container } = render(<App />);
      // Selected explicitly by id, not relied on being REGISTRY[0] — the
      // registry is ordered for the Generator Selection UI, not this test.
      selectPatternByName(container, REGISTRY.find((e) => e.id === "perlin-noise").name);
      selectWorkflowNodeByLabel(container, "Seed");
      const docPanel = container.querySelector(".doc-panel");
      expect(within(docPanel).getByText("Seed")).toBeInTheDocument();
   });

   it("only one node's param panel is expanded at a time", () => {
      const { container } = render(<App />);
      selectPatternByName(container, REGISTRY.find((e) => e.id === "perlin-noise").name);
      selectWorkflowNodeByLabel(container, "Noise");
      // Noise's own "scale" param archetype is Density — should appear once.
      expect(within(container).getAllByText(/Density/).length).toBe(1);
   });
});

describe("App: Reset to Defaults", () => {
   it("resets a changed parameter back to the pattern's registry default", () => {
      const { container } = render(<App />);
      selectPatternByName(container, REGISTRY.find((e) => e.id === "perlin-noise").name);
      selectWorkflowNodeByLabel(container, "Noise");

      // input[type="range"] directly, not getByRole("slider") — this
      // jsdom/testing-library combination doesn't reliably compute the
      // implicit ARIA role for range inputs.
      const slider = container.querySelectorAll('input[type="range"]')[0];
      const defaultValue = slider.value;
      fireEvent.change(slider, { target: { value: String(Number(defaultValue) + 1) } });
      expect(container.querySelectorAll('input[type="range"]')[0].value).not.toBe(defaultValue);

      fireEvent.click(screen.getByText("Reset to Defaults"));
      expect(container.querySelectorAll('input[type="range"]')[0].value).toBe(defaultValue);
   });
});

describe("App: Evaluation menu / Test overlay", () => {
   it("opens the Evaluation dropdown, launches Test 1 from it, and closes via its own close control", () => {
      render(<App />);
      expect(screen.queryByText("Study 1", { selector: "h2" })).not.toBeInTheDocument();

      fireEvent.click(screen.getByText("Evaluation", { selector: "button" }));
      fireEvent.click(screen.getByText("Test 1", { selector: "button" }));
      expect(screen.getByText("Study 1", { selector: "h2" })).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText("Close evaluation"));
      expect(screen.queryByText("Study 1", { selector: "h2" })).not.toBeInTheDocument();
   });

   it("opens the Evaluation dropdown, launches Test 2 from it, and closes via its own close control", () => {
      render(<App />);
      expect(screen.queryByText("Study 2", { selector: "h2" })).not.toBeInTheDocument();

      fireEvent.click(screen.getByText("Evaluation", { selector: "button" }));
      fireEvent.click(screen.getByText("Test 2", { selector: "button" }));
      expect(screen.getByText("Study 2", { selector: "h2" })).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText("Close evaluation"));
      expect(screen.queryByText("Study 2", { selector: "h2" })).not.toBeInTheDocument();
   });

   it("dropdown lists Test 1, Test 2, Dry Run, Study Results, and Study 2 Results", () => {
      render(<App />);
      fireEvent.click(screen.getByText("Evaluation", { selector: "button" }));
      expect(screen.getByText("Test 1", { selector: "button" })).toBeInTheDocument();
      expect(screen.getByText("Test 2", { selector: "button" })).toBeInTheDocument();
      expect(screen.getByText("Dry Run")).toBeInTheDocument();
      expect(screen.getByText("Study Results")).toBeInTheDocument();
      expect(screen.getByText("Study 2 Results")).toBeInTheDocument();
   });
});
