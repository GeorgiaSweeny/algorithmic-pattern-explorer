/*
========================================
PATTERN SCHEMA
========================================
* Canonical format for a pattern entry in the registry.
* Every pattern — built-in or imported — must conform to this structure.
*
* SCHEMA:
* {
*   id:        string          — unique kebab-case identifier
*   name:      string          — display name
*   category:  string          — UI grouping (Tiles | Wave | Fractal | Simulation)
*   generator: string          — key in GENERATORS registry (pure math function)
*   params:    ParamDef[]      — parameter definitions (see below)
*   actions?:  ActionDef[]     — optional action buttons
* }
*
* ParamDef variants:
*
*   Archetype-mapped slider:
*   { param, archetype, value, map: [genMin, genMax] }
*
*   Raw control (select):
*   { param, control: "select", label, options: string[], value }
*
*   Fixed (no UI, applied silently):
*   { param, value }
*
* ActionDef:
*   { label: string, method: string }   — method is called on PatternLoader instance
*
* GENERATOR CONTRACT:
*   value = GENERATORS[pattern.generator](x, y, params)   → [-1, 1]
*   No exceptions. No pattern names. No UI knowledge.
-----------------------------------------
*/

/**
 * Lightweight runtime validator. Returns null if valid, or an error string.
 * @param {object} entry
 * @returns {string|null}
 */
export function validatePattern(entry) {
   if (!entry.id)        return "missing id";
   if (!entry.name)      return "missing name";
   if (!entry.category)  return "missing category";
   if (!entry.generator) return "missing generator";
   if (!Array.isArray(entry.params)) return "params must be an array";
   return null;
}
