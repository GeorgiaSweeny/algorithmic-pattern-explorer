/*
========================================
ARCHETYPE REGISTRY
========================================
* The stable UI vocabulary that all pattern schemas map onto.
* Adding a new pattern never requires adding a new archetype —
* only mapping its params to the existing ones here.
*
* control  — "range" | "number"
* transform — "linear" | "log"
*   log: more UI resolution at low values (good for scale/frequency)
-----------------------------------------
*/

export const ARCHETYPES = {

   Size: {
      label:     "Size",
      control:   "range",
      min:       1,
      max:       200,
      step:      1,
      transform: "linear",
   },

   Density: {
      label:     "Density",
      control:   "range",
      min:       1,
      max:       100,
      step:      1,
      transform: "log",
   },

   Detail: {
      label:     "Detail",
      control:   "range",
      min:       1,
      max:       8,
      step:      1,
      transform: "linear",
   },

   Complexity: {
      label:     "Complexity",
      control:   "range",
      min:       1,
      max:       8,
      step:      1,
      transform: "linear",
   },

   Randomness: {
      label:     "Randomness",
      control:   "range",
      min:       1,
      max:       100,
      step:      1,
      transform: "linear",
   },

   Rotation: {
      label:     "Rotation",
      control:   "range",
      min:       0,
      max:       360,
      step:      1,
      transform: "linear",
   },

   Threshold: {
      label:     "Threshold",
      control:   "range",
      min:       1,
      max:       100,
      step:      1,
      transform: "linear",
   },

   Seed: {
      label:     "Seed",
      control:   "number",
      min:       0,
      max:       99999,
      step:      1,
      transform: "linear",
   },

};
