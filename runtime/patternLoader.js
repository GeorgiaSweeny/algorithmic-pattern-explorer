/*
========================================
PATTERN LOADER  —  runtime instance state
========================================
* One PatternLoader instance per active pattern.
* Owns the live parameter state for the duration of that pattern being active.
*
* STATIC vs RUNTIME boundary:
*   patternRegistry  — static definitions, never mutated at runtime
*   PatternLoader    — runtime instance, one per active pattern, discarded on switch
*
* UI reads and writes state through this object.
* Generators receive a plain snapshot via resolve() — they never touch this class.
-----------------------------------------
*/

import { archetypeToGenerator } from "../core/parameterMapper.js";

export class PatternLoader {
   constructor(pattern) {
      this._pattern = pattern;
      this._state   = {};
      for (const p of pattern.params) {
         this._state[p.param] = p.value;
      }
   }

   // The pattern definition this loader was created from (read-only).
   get pattern() { return this._pattern; }

   // Returns a plain snapshot of current generator-space param values.
   resolve() {
      return { ...this._state };
   }

   // Called by archetypeControls when a slider changes.
   setFromUI(param, uiVal, paramDef) {
      this._state[param] = archetypeToGenerator(uiVal, paramDef);
   }

   // Called by archetypeControls for raw (non-archetype) controls.
   set(param, value) {
      this._state[param] = value;
   }

   // Action: randomises the seed param.
   randomize() {
      if ("seed" in this._state) {
         this._state.seed = Date.now() % 99999;
      }
   }
}
