import "./Welcome.css";

/*
* First-run landing popup, shown once before Onboarding.jsx's own tour
* (same "algorithmic-pattern-explorer.onboarding-dismissed" localStorage
* flag gates both — this and the tour are one combined first-visit flow,
* not two separate dismissals to track). Names the app and gives a short
* orientation before the tour starts pointing at specific panels, and
* calls out the Hybrid category by name — patternRegistry.js's two Hybrid
* entries (stochastic input composed with deterministic construction) are
* easy to miss sitting at the bottom of Generator Selection's pattern
* list, and worth surfacing directly rather than leaving a learner to
* stumble onto them.
*/
export default function Welcome({ onStartTour, onSkip }) {
   return (
      <div className="welcome-root">
         <div className="welcome-card">
            <h1 className="welcome-title">Algorithmic Pattern Explorer</h1>
            <p className="welcome-body">
               This app shows you how generative art patterns are built, one computational step at a
               time. Pick a pattern, watch it come together stage by stage, and see explanations of
               what each step does and why.
            </p>
            <p className="welcome-body">
               Take a look through all the pattern types on offer — including the Hybrid patterns,
               which combine two different techniques into one pattern. They're some of the most
               interesting results in the app.
            </p>
            <div className="welcome-actions">
               <button className="btn welcome-skip" onClick={onSkip}>
                  Skip
               </button>
               <button className="btn welcome-start" onClick={onStartTour}>
                  Take the tour
               </button>
            </div>
         </div>
      </div>
   );
}
