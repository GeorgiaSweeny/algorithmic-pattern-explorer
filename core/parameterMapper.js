/*
========================================
PARAMETER MAPPER
========================================
* Bidirectional transforms between archetype UI values and generator values.
* This is the sole source of truth for value mapping — no other module
* should define these transforms.
*
* Two distinct concerns, kept separate:
*
*   archetypeToGenerator — UI control position → generator numeric value
*                          Used by patternLoader when a slider changes.
*
*   generatorToArchetype — generator numeric value → UI control position
*                          Used by archetypeControls to set initial slider position.
*
* Transforms:
*   linear  — uniform distribution across range
*   log     — more UI resolution at low values (scale, frequency)
-----------------------------------------
*/

import { ARCHETYPES } from "./archetypes.js";

// Archetype UI value [arch.min, arch.max] → generator value [map[0], map[1]]
export function archetypeToGenerator(uiVal, paramDef) {
   if (!paramDef.map || !paramDef.archetype) return uiVal;
   const arch        = ARCHETYPES[paramDef.archetype];
   const [gMin, gMax] = paramDef.map;
   const t = (uiVal - arch.min) / (arch.max - arch.min);
   return arch.transform === "log"
      ? gMin * Math.pow(gMax / gMin, t)
      : gMin + (gMax - gMin) * t;
}

// Generator value [map[0], map[1]] → archetype UI value [arch.min, arch.max]
export function generatorToArchetype(genVal, paramDef) {
   if (!paramDef.map || !paramDef.archetype) return genVal;
   const arch        = ARCHETYPES[paramDef.archetype];
   const [gMin, gMax] = paramDef.map;
   const t = arch.transform === "log"
      ? Math.log(genVal / gMin) / Math.log(gMax / gMin)
      : (genVal - gMin) / (gMax - gMin);
   return arch.min + (arch.max - arch.min) * t;
}

// Format a generator value for display in the UI
export function fmt(v, archetype) {
   if (typeof v !== "number") return String(v);
   const arch = ARCHETYPES[archetype];
   return arch?.step >= 1
      ? String(Math.round(v))
      : String(parseFloat(v.toPrecision(3)));
}
