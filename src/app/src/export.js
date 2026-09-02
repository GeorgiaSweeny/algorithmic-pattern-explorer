/*
========================================
PATTERN EXPORT
========================================
* SVG/PNG export actions for the Render node. Rebuilds the image from
* GENERATORS/SVG_GENERATORS directly rather than reading a live DOM canvas,
* so it works independently of whichever node is currently selected.
* Every SVG/PNG download also drops a sidecar {entryId, params} JSON file —
* pixels/markup alone can't be reverse-engineered back into exact param
* values (especially seed/noise-driven ones), so the sidecar is what makes a
* folder of exported favourites re-importable into the gallery later.
*/

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

function downloadConfigSidecar(entry, params) {
   const json = JSON.stringify({ entryId: entry.id, params }, null, 2);
   download(new Blob([json], { type: "application/json" }), `${entry.id}.json`);
}

// Shared by exportPng (download) and capturePngDataUrl (My Gallery capture)
// so the two rasterisation paths (SVG-generator-via-<img>, raw-pixel
// GENERATORS) aren't duplicated.
function renderToCanvas(entry, params) {
   const svgFn = SVG_GENERATORS[entry.generator];

   if (svgFn) {
      return new Promise((resolve) => {
         const svg = svgFn(CANVAS.WIDTH, CANVAS.HEIGHT, params);
         const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
         const img = new Image();
         img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = CANVAS.WIDTH;
            canvas.height = CANVAS.HEIGHT;
            canvas.getContext("2d").drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas);
         };
         img.src = url;
      });
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
   return Promise.resolve(canvas);
}

export function exportSvg(entry, params) {
   const fn = SVG_GENERATORS[entry.generator];
   if (!fn) return;
   const svg = fn(CANVAS.WIDTH, CANVAS.HEIGHT, params);
   download(new Blob([svg], { type: "image/svg+xml" }), `${entry.id}.svg`);
   downloadConfigSidecar(entry, params);
}

export async function exportPng(entry, params) {
   const canvas = await renderToCanvas(entry, params);
   canvas.toBlob((blob) => download(blob, `${entry.id}.png`), "image/png");
   downloadConfigSidecar(entry, params);
}

// Renders a pattern to a PNG data URL without triggering a download — used
// by the "Add to Gallery" action to capture a My Gallery thumbnail.
export async function capturePngDataUrl(entry, params) {
   const canvas = await renderToCanvas(entry, params);
   return canvas.toDataURL("image/png");
}
