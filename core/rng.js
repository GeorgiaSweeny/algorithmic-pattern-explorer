/*
========================================
RNG — SEEDED PSEUDO-RANDOM NUMBER GENERATOR
========================================
* xorshift32 — fast, deterministic, seed-reproducible.
* Returns a float in [0, 1) given a mutable state object.
*
* Usage:
*   const state = { s: seed || 1 };
*   const value = xorshift32(state);   // advances state, returns [0,1)
-----------------------------------------
*/

export function xorshift32(state) {
   let s = state.s;
   s ^= s << 13;
   s ^= s >>> 17;
   s ^= s << 5;
   state.s = s >>> 0;
   return state.s / 0xffffffff;
}
