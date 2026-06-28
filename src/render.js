/*
========================================
PATTERN RENDERER
========================================
* Converts values to pixels
* Determins how pattern is displayed
-----------------------------------------
*/

export function grayscale(value) {

   const c = Math.floor((value + 1) * 127.5);

   return {
      r: c,
      g: c,
      b: c,
      a: 255
   };
}

