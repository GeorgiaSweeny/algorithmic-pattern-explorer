/*
========================================
SPECTRUM BAR
========================================
* Visualises a REGISTRY entry's `spectrum` value (0 = fully stochastic,
* 1 = fully deterministic) as a labelled marker on a track.
*/

import "./SpectrumBar.css";

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

// `compact` drops the axis end-labels for tight spaces, keeping the marker
// and description.
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
