/*
========================================
COLOUR MAPPING
========================================
* Maps to the "Colour Mapping" presentation node (docs/nodes/node-model-specification.md):
* turns a discrete index (tile parity, Voronoi cell, ...) into an output tone.
* tones[0] = background (1), tones[last] = dark (-1), evenly spaced in between.
*/
export const TONES = {
   "2": [1, -1],
   "3": [1, 0, -1],
};

export function toneSet(tones) {
   return TONES[tones] ?? TONES["2"];
}
