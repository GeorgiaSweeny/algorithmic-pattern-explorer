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
* fixed six-step sequence would be a heavier change than the feature
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

function markOnboardingSeen() {
   try {
      localStorage.setItem(STORAGE_KEY, "true");
   } catch {
      // Private-browsing/quota failure: onboarding just replays next visit
      // rather than the app breaking — same fallback shape as
      // evaluationStorage.js's own read/write try/catch.
   }
}

// One entry per step: `selector` is queried against the live DOM (all five
// targets are always mounted, never conditionally rendered away, so this is
// reliable without needing refs threaded down from App.jsx).
const STEPS = [
   {
      selector: ".generator-selection",
      title: "Pick an algorithm",
      body: "Every pattern generator lives here, grouped by family. Selecting one updates everything else on screen.",
   },
   {
      selector: ".final-preview",
      title: "Final result, always visible",
      body: "This preview always shows the pattern's finished output, no matter which stage you're inspecting below.",
   },
   {
      selector: ".doc-panel",
      title: "Explanations appear here",
      body: "Select any node in the workflow graph and its plain-language explanation shows up in this panel.",
   },
   {
      selector: ".canvas-panel",
      title: "One stage at a time",
      body: "This canvas shows the output of whichever single computational stage is currently selected, not just the final result. Use the Prev/Next buttons at the bottom of the screen to step through the pipeline.",
   },
   {
      selector: ".algorithm-workflow",
      title: "The computational pipeline",
      body: "Each box is one computational stage; the arrows show how data flows from one to the next. Click any box to inspect it.",
   },
];

function useTargetRect(selector, active) {
   const [rect, setRect] = useState(null);

   useLayoutEffect(() => {
      if (!active) return;
      function measure() {
         const el = document.querySelector(selector);
         setRect(el ? el.getBoundingClientRect() : null);
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
   }, [selector, active]);

   return rect;
}

export default function Onboarding({ onClose }) {
   const [stepIndex, setStepIndex] = useState(0);
   const step = STEPS[stepIndex];
   const rect = useTargetRect(step.selector, true);

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

   return (
      <div className="onboarding-root">
         {rect && (
            <div
               className="onboarding-spotlight"
               style={{
                  top: rect.top - 6,
                  left: rect.left - 6,
                  width: rect.width + 12,
                  height: rect.height + 12,
               }}
            />
         )}
         {!rect && <div className="onboarding-dim" />}
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
