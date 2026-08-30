import { REGISTRY } from "../../../patternRegistry.js";

/*
* Resolves an image-bearing quiz item's {entryId, overrides} into a full
* params object PatternCanvas can render, the same way App.jsx's own
* defaultParams() does for the live explorer — reused here rather than
* imported from App.jsx, since App.jsx doesn't export it and pulling in
* the whole file for one function would drag in ReactFlow.
*
* Rendering quiz images this way (live, from the same REGISTRY +
* PatternCanvas the explorer itself uses) means there is no separate image
* asset pipeline to build or keep in sync: every quiz image is the exact
* deterministic output of a real, current generator run, not a pre-rendered
* file that could drift from the app's own behaviour after a generator
* change.
*/
export function resolveQuizPattern(entryId, overrides = {}) {
   const entry = REGISTRY.find((e) => e.id === entryId);
   if (!entry) throw new Error(`quizPatterns: unknown entry id "${entryId}"`);
   const defaults = Object.fromEntries(entry.params.map((p) => [p.param, p.value]));
   return { entry, params: { ...defaults, ...overrides } };
}
