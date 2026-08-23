import "./SpectrumBar.css";

// Carried over from the pre-ReactFlow app (see git history around commit
// 1e447a1, "Add stochastic→deterministic spectrum bar to control panel")
// rather than invented fresh — every REGISTRY entry already carries the
// same `spectrum` value (0 = fully stochastic, 1 = fully deterministic) it
// did there, it just had no UI consumer in this rebuild until now.
const SPECTRUM_LABELS = [
   { max: 0.2, text: "Predominantly stochastic" },
   { max: 0.4, text: "Mostly stochastic" },
   { max: 0.6, text: "Hybrid" },
   { max: 0.8, text: "Mostly deterministic" },
   { max: 1.01, text: "Highly deterministic" },
];

function describeSpectrum(value) {
   return SPECTRUM_LABELS.find((entry) => value < entry.max)?.text ?? "";
}

// `compact` drops the axis end-labels for tight spaces (Documentation
// Panel's per-node doc-block column) while keeping the same marker +
// description reading as the full version (Generator Selection).
export default function SpectrumBar({ spectrum, compact = false }) {
   if (spectrum == null) return null;
   const pct = Math.min(1, Math.max(0, spectrum)) * 100;

   return (
      <div className={`spectrum-bar${compact ? " spectrum-bar-compact" : ""}`}>
         {!compact && (
            <div className="spectrum-labels">
               <span>Stochastic</span>
               <span>Deterministic</span>
            </div>
         )}
         <div className="spectrum-track">
            <div className="spectrum-marker" style={{ left: `${pct}%` }} />
         </div>
         <div className="spectrum-description">{describeSpectrum(spectrum)}</div>
      </div>
   );
}
