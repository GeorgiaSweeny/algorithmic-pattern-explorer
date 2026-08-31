/*
========================================
ONBOARDING TOUR
========================================
* Skippable first-run walkthrough that spotlights each panel in turn via a
* fixed step sequence (STEPS below) — a UI-orientation tour ("here's where
* things are"), not concept-teaching (that's the Documentation Panel's job).
* No third-party tour library — hand-rolled to avoid a dependency for one
* fixed sequence. Mirrors EvaluationOverlay.jsx's mount pattern.
*/

import { useEffect, useLayoutEffect, useState } from "react";
import "./Onboarding.css";

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
      // Private-browsing/quota failure: onboarding just replays next visit.
   }
}

// One entry per step: `selector` is queried against the live DOM (all
// targets stay mounted, so no refs need threading from App.jsx). `selector`
// can be an array — every match gets its own spotlight, callout anchored
// to the first entry.
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

// Returns one rect per selector (null if unmatched), same order as
// `selectors`, so the first entry is always the callout's anchor target.
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
      // Polls too: layout can shift from content changes (e.g. a param body
      // expanding) without a resize event firing.
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

   // Callout placed below the highlight by default, above it if no room,
   // then clamped into the viewport either way — needed since a tall
   // target (e.g. the doc panel) can leave no room on either side.
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

   // Single dim layer via one SVG path (full-viewport rect + one hole per
   // target, fill-rule "evenodd") rather than a box-shadow per target —
   // stacked box-shadows would double-darken where multiple targets overlap.
   // The highlight border is still a separate div per rect, drawn on top.
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
