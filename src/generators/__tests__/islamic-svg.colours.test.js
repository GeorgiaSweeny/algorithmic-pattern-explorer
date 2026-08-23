/*
========================================
ISLAMIC SVG — CUSTOM COLOUR PARAMS
========================================
* islamic-svg.js is the only renderer actually shown for this pattern
* (nativeFormat: "vector"), so its colour handling is what a user's
* colour1..colour5 choices actually produce. These tests check the
* contract patternRegistry.js's colourN params rely on: unset slots fall
* back to DEFAULT_COLOURS (greyscale by default), set slots are used
* verbatim (any colour, not just greyscale — the user-facing point of
* this feature), and only the first `tones` slots are ever used.
*/
import { describe, it, expect } from "vitest";
import { islamicSvg, DEFAULT_COLOURS } from "../svg/islamic-svg.js";

describe("islamic-svg: colour params", () => {
   it("uses DEFAULT_COLOURS (greyscale) when no colourN params are given", () => {
      const svg = islamicSvg(200, 200, { tileSize: 100, segments: 8, tones: "2" });
      expect(svg).toContain(DEFAULT_COLOURS[0]);
      expect(svg).toContain(DEFAULT_COLOURS[1]);
   });

   it("uses a user-chosen colour verbatim, including non-greyscale ones", () => {
      const svg = islamicSvg(200, 200, {
         tileSize: 100, segments: 8, tones: "2",
         colour1: "#ffffff", colour2: "#cc0000",
      });
      expect(svg).toContain("#cc0000");
      expect(svg).not.toContain(DEFAULT_COLOURS[1]);
   });

   it("mixes a user-chosen slot with defaults for the rest", () => {
      const svg = islamicSvg(200, 200, {
         tileSize: 100, segments: 8, tones: "3",
         colour2: "#00aa00", // colour1 and colour3 left unset
      });
      expect(svg).toContain(DEFAULT_COLOURS[0]); // colour1 default
      expect(svg).toContain("#00aa00");
      expect(svg).toContain(DEFAULT_COLOURS[2]); // colour3 default
   });

   it("only ever uses the first `tones` colour slots, regardless of what's set beyond that", () => {
      const svg = islamicSvg(200, 200, {
         tileSize: 100, segments: 8, tones: "2",
         colour1: "#ffffff", colour2: "#000000",
         colour3: "#ff00ff", colour4: "#00ffff", colour5: "#ffff00", // should never appear
      });
      for (const unused of ["#ff00ff", "#00ffff", "#ffff00"]) {
         expect(svg).not.toContain(unused);
      }
   });

   it("every declared tones count (2-5) renders without throwing, uses the background and primary slots, and never a slot beyond `tones`", () => {
      // Doesn't assert every one of the `tones` slots necessarily appears:
      // the SVG renderer caps how many echo bands it draws per segments
      // (_maxBands, a documented self-intersection-safety limit), so at
      // high tones counts an echo tone deep in the cycle (e.g. the 3rd of
      // 3 echo tones at tones = "5") may genuinely never be reached within
      // that band cap — a real, pre-existing renderer limitation, not
      // something this colour feature should assert away.
      const custom = ["#ffffff", "#ff0000", "#00ff00", "#0000ff", "#111111"];
      for (const tones of ["2", "3", "4", "5"]) {
         const params = {
            tileSize: 100, segments: 8, tones,
            colour1: custom[0], colour2: custom[1], colour3: custom[2],
            colour4: custom[3], colour5: custom[4],
         };
         const svg = islamicSvg(200, 200, params);
         const n = Number(tones);
         expect(svg).toContain(custom[0]); // background
         expect(svg).toContain(custom[n - 1]); // primary: the last active slot
         for (let i = n; i < 5; i++) expect(svg).not.toContain(custom[i]);
      }
   });
});
