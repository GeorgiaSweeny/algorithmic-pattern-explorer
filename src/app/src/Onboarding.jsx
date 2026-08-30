import { useEffect, useLayoutEffect, useState } from "react";
import "./Onboarding.css";

/*
* Skippable first-run walkthrough (docs/evaluation/pre-study2-feature-plans.md
* §1) — corroborated independently by both the original 5-educator
* consultation ("Guided Onboarding", inital-educator-stakeholder-consulation-
* summary.md §3.5) and a Study 1 participant's own post-session note
* (docs/evaluation/study1-participant-post-session-notes.md #2).
*
* Deliberately a UI-orientation tour ("here's where things are"), not a
* concept-teaching one — that's what the Documentation Panel already does
* once a node is selected, and duplicating it here would be Mayer's
* redundancy principle working against itself. Modelled on the named
* examples (Word, creative-software onboarding): skip is always visible,
* never buried.
*
* No third-party tour library — this app has exactly three runtime
* dependencies (@xyflow/react, react, react-dom); adding one for a single,
* fixed seven-step sequence would be a heavier change than the feature
* itself. Structurally mirrors EvaluationOverlay.jsx's own pattern: one
* component, own CSS file, mounted conditionally from App.jsx.
*/

const STORAGE_KEY = "algorithmic-pattern-explorer.onboarding-dismissed";

export function hasSeenOnboarding() {
   try {
      return localStorage.getItem(STORAGE_KEY) === "true";
   } catch {
      return false;
   }
}

export function markOnboardingSeen() {
   try {
      localStorage.setItem(STORAGE_KEY, "true");
   } catch {
      // Private-browsing/quota failure: onboarding just replays next visit
      // rather than the app breaking — same fallback shape as
      // evaluationStorage.js's own read/write try/catch.
   }
}

// One entry per step: `selector` is queried against the live DOM (all seven
// targets are always mounted, never conditionally rendered away, so this is
// reliable without needing refs threaded down from App.jsx). `selector` can
// also be an array — every matching element gets its own spotlight, for a
// step that explains a relationship between two panels (e.g. clicking a
// node in the diagram vs. where its explanation shows up), with the
// callout itself still anchored to the first entry.
const STEPS = [
   {
      selector: ".generator-selection",
      title: "Choose a pattern",
      body: "Pick a pattern from the list. Everything else on screen updates to match your choice.",
   },
   {
      selector: ".pattern-documentation",
      title: "See the finished pattern",
      body: "This shows what your pattern looks like when it's done, plus a simple explanation of what it is and why it matters.",
   },
   {
      selector: [".doc-panel", ".algorithm-workflow"],
      title: "Learn about each step",
      body: "Click a box (node) in the diagram below and a simple explanation of that step appears here.",
   },
   {
      selector: ".render-panel-body",
      title: "Watch one step at a time",
      body: "This shows the stage of the pattern you're on when you select a node below, not the whole pattern. Use the Prev and Next buttons below to move through the steps.",
   },
   {
      selector: ".algorithm-workflow",
      title: "How the pattern is built",
      body: "Each node is one step, and the arrows show the order they happen in. Click a node to see its settings — changing them changes the output. The colour key above shows what kind of step each node is.",
   },
   {
      selector: ".workflow-controls-bar",
      title: "Step through, or start over",
      body: "Prev and Next move you through the steps one at a time. If you've changed any settings, Reset to Defaults puts them all back to how they started.",
   },
   {
      selector: ".menu-bar-doc-library",
      title: "Want to know more?",
      body: "The Documentation Library has more detail on every pattern, node, and key terms. You can open it any time.",
   },
];

// Returns one rect per selector (null for any that don't match), in the
// same order as `selectors` — so the first entry is always the "primary"
// target a step's callout anchors to, even when later entries are also
// spotlighted.
function useTargetRects(selectors, active) {
   const [rects, setRects] = useState(() => selectors.map(() => null));
   const key = selectors.join("|");

   useLayoutEffect(() => {
      if (!active) return;
      function measure() {
         setRects(selectors.map((s) => document.querySelector(s)?.getBoundingClientRect() ?? null));
      }
      measure();
      window.addEventListener("resize", measure);
      // Layout can also shift from panel content changes (e.g. a node's
      // param body expanding) without a resize event firing.
      const interval = setInterval(measure, 300);
      return () => {
         window.removeEventListener("resize", measure);
         clearInterval(interval);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [key, active]);

   return rects;
}

export default function Onboarding({ onClose }) {
   const [stepIndex, setStepIndex] = useState(0);
   const step = STEPS[stepIndex];
   const selectors = Array.isArray(step.selector) ? step.selector : [step.selector];
   const rects = useTargetRects(selectors, true);
   const rect = rects.find(Boolean) ?? null;

   useEffect(() => {
      function onKeyDown(e) {
         if (e.key === "Escape") finish();
      }
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   function finish() {
      markOnboardingSeen();
      onClose();
   }

   function next() {
      if (stepIndex >= STEPS.length - 1) {
         finish();
      } else {
         setStepIndex((i) => i + 1);
      }
   }

   function back() {
      setStepIndex((i) => Math.max(0, i - 1));
   }

   // Callout placed below the highlighted region by default, above it when
   // there isn't room, and clamped into the viewport either way — a target
   // that spans nearly the whole viewport height (e.g. the doc panel, which
   // can be taller than the window) has room on *neither* side, so always
   // computing a single "top" value and clamping it is more robust than
   // trying to pick above-vs-below and hoping one of the two fits.
   const calloutStyle = (() => {
      if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
      const calloutWidth = 340;
      const estimatedHeight = 200;
      const margin = 12;
      const spaceBelow = window.innerHeight - rect.bottom;

      let top;
      if (spaceBelow >= estimatedHeight + margin) {
         top = rect.bottom + margin;
      } else if (rect.top - estimatedHeight - margin >= 0) {
         top = rect.top - estimatedHeight - margin;
      } else {
         top = rect.top;
      }
      top = Math.min(Math.max(top, margin), window.innerHeight - estimatedHeight - margin);
      const left = Math.min(Math.max(rect.left, margin), window.innerWidth - calloutWidth - margin);
      return { top, left };
   })();

   // A single dim layer, not one box-shadow-based overlay per target: two
   // independent "dim everything but my own box" shadows (the old approach)
   // stack on top of each other, so each one's dim also darkens over the
   // *other* one's cutout wherever they don't overlap — a multi-target step
   // (e.g. Documentation Panel + node diagram) ended up visibly dimmer than
   // a single-target one. An SVG path with one closed subpath for the full
   // viewport and one more per target rect, combined with fill-rule
   // "evenodd", punches every target out of the same single fill in one
   // pass instead, so cutouts are always full brightness regardless of how
   // many there are. The highlight border itself is still a separate plain
   // div per rect, drawn on top.
   const padding = 6;
   const dimPath =
      `M0,0H${window.innerWidth}V${window.innerHeight}H0Z ` +
      rects
         .filter(Boolean)
         .map((r) => {
            const x = r.left - padding;
            const y = r.top - padding;
            const w = r.width + padding * 2;
            const h = r.height + padding * 2;
            return `M${x},${y}H${x + w}V${y + h}H${x}Z`;
         })
         .join(" ");

   return (
      <div className="onboarding-root">
         <svg className="onboarding-dim-svg">
            <path d={dimPath} fillRule="evenodd" />
         </svg>
         {rects.map(
            (r, i) =>
               r && (
                  <div
                     key={selectors[i]}
                     className="onboarding-spotlight"
                     style={{
                        top: r.top - padding,
                        left: r.left - padding,
                        width: r.width + padding * 2,
                        height: r.height + padding * 2,
                     }}
                  />
               ),
         )}
         <div className="onboarding-callout" style={calloutStyle}>
            <div className="onboarding-callout-step">
               Step {stepIndex + 1} of {STEPS.length}
            </div>
            <h3 className="onboarding-callout-title">{step.title}</h3>
            <p className="onboarding-callout-body">{step.body}</p>
            <div className="onboarding-callout-actions">
               <button className="btn onboarding-skip" onClick={finish}>
                  Skip tutorial
               </button>
               <div className="onboarding-nav">
                  <button className="btn" onClick={back} disabled={stepIndex === 0}>
                     Back
                  </button>
                  <button className="btn onboarding-next" onClick={next}>
                     {stepIndex === STEPS.length - 1 ? "Done" : "Next"}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}
