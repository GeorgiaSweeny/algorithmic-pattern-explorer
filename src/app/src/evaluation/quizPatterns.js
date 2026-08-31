/*
========================================
QUIZ PATTERNS
========================================
* Resolves an image-bearing quiz item's {entryId, overrides} into a full
* params object PatternCanvas can render — mirrors App.jsx's defaultParams()
* logic locally rather than importing it (App.jsx isn't exported that way
* and would drag in ReactFlow). Renders live from REGISTRY, so quiz images
* can never drift from the app's actual current generator output.
*/

import { REGISTRY } from "../../../patternRegistry.js";

export function resolveQuizPattern(entryId, overrides = {}) {
   const entry = REGISTRY.find((e) => e.id === entryId);
   if (!entry) throw new Error(`quizPatterns: unknown entry id "${entryId}"`);
   const defaults = Object.fromEntries(entry.params.map((p) => [p.param, p.value]));
   return { entry, params: { ...defaults, ...overrides } };
}
