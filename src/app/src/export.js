// Render-node export actions (docs/UI_DESIGN.md: "Export moved from a
// canvas-level feature to a Render-node control"). Mirrors src/ui.js's
// _exportSvg/_exportPng, rebuilding the image from GENERATORS/SVG_GENERATORS
// rather than reading a live DOM canvas, so it works independently of
// whichever node happens to be selected.
import { GENERATORS } from "../../generators/index.js";
import { SVG_GENERATORS } from "../../generators/svg/index.js";
import { mapColour } from "../../render.js";
import { CANVAS } from "../../config.js";

function download(blob, filename) {
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url;
   a.download = filename;
   a.click();
   URL.revokeObjectURL(url);
}

export function exportSvg(entry, params) {
   const fn = SVG_GENERATORS[entry.generator];
   if (!fn) return;
   const svg = fn(CANVAS.WIDTH, CANVAS.HEIGHT, params);
   download(new Blob([svg], { type: "image/svg+xml" }), `${entry.id}.svg`);
}

export function exportPng(entry, params) {
   const svgFn = SVG_GENERATORS[entry.generator];

   if (svgFn) {
      const svg = svgFn(CANVAS.WIDTH, CANVAS.HEIGHT, params);
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      const img = new Image();
      img.onload = () => {
         const canvas = document.createElement("canvas");
         canvas.width = CANVAS.WIDTH;
         canvas.height = CANVAS.HEIGHT;
         canvas.getContext("2d").drawImage(img, 0, 0);
         canvas.toBlob((blob) => {
            download(blob, `${entry.id}.png`);
            URL.revokeObjectURL(url);
         }, "image/png");
      };
      img.src = url;
      return;
   }

   const genFn = GENERATORS[entry.generator];
   const canvas = document.createElement("canvas");
   canvas.width = CANVAS.WIDTH;
   canvas.height = CANVAS.HEIGHT;
   const ctx = canvas.getContext("2d");
   const image = ctx.createImageData(CANVAS.WIDTH, CANVAS.HEIGHT);
   for (let y = 0; y < CANVAS.HEIGHT; y++) {
      for (let x = 0; x < CANVAS.WIDTH; x++) {
         const { r, g, b, a } = mapColour(genFn(x, y, params), params);
         const idx = 4 * (x + y * CANVAS.WIDTH);
         image.data[idx] = r;
         image.data[idx + 1] = g;
         image.data[idx + 2] = b;
         image.data[idx + 3] = a;
      }
   }
   ctx.putImageData(image, 0, 0);
   canvas.toBlob((blob) => download(blob, `${entry.id}.png`), "image/png");
}
