import { ARCHETYPES } from "./archetypes.js";

/*
========================================
PATTERN BINDER
========================================
*/
// Owns the live parameter state for one active pattern.
// PatternBinder is the only place that knows about archetype → generator value mapping.
export class PatternBinder {
   constructor(pattern) {
      this._pattern = pattern;
      this._state   = {};
      for (const p of pattern.params) {
         this._state[p.param] = p.value;
      }
   }

   // Returns a snapshot of current generator-space param values.
   resolve() {
      return { ...this._state };
   }

   // Called by UIBuilder on slider/select change.
   setFromUI(param, uiVal, paramDef) {
      const arch = ARCHETYPES[paramDef.archetype];
      this._state[param] = _toGen(uiVal, paramDef, arch);
   }

   // Called by UIBuilder for raw (non-archetype) controls.
   set(param, value) {
      this._state[param] = value;
   }

   // Action: randomizes any param named "seed".
   randomize() {
      if ("seed" in this._state) {
         this._state.seed = Date.now() % 99999;
      }
   }
}

// UI slider position → generator value (inverse of _toUI in UIBuilder)
function _toGen(uiVal, paramDef, arch) {
   if (!paramDef.map) return uiVal;
   const [gMin, gMax] = paramDef.map;
   const t = (uiVal - arch.min) / (arch.max - arch.min);
   return arch.transform === "log"
      ? gMin * Math.pow(gMax / gMin, t)
      : gMin + (gMax - gMin) * t;
}
