/*
========================================
PATTERN EXPORT SCRIPT
========================================
* Renders every REGISTRY entry to a static file for demo purposes,
* without needing the browser UI wired up.
*   - nativeFormat "vector" -> .svg (SVG_GENERATORS)
*   - nativeFormat "raster" -> .png (pixel loop + minimal PNG encoder)
* Usage: node scripts/export-patterns.mjs [outDir]
-----------------------------------------
*/
import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { REGISTRY } from "../patternRegistry.js";
import { GENERATORS } from "../generators/index.js";
import { SVG_GENERATORS } from "../generators/svg/index.js";
import { grayscale } from "../render.js";
import { CANVAS } from "../config.js";

const outDir = process.argv[2] ?? "exports";
mkdirSync(outDir, { recursive: true });

function paramsFor(entry) {
   const params = {};
   for (const p of entry.params) params[p.param] = p.value;
   return params;
}

// Minimal PNG encoder: 8-bit RGBA, filter type 0 (none) per scanline.
function encodePNG(width, height, rgba) {
   const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

   function chunk(type, data) {
      const len = Buffer.alloc(4);
      len.writeUInt32BE(data.length);
      const typeBuf = Buffer.from(type, "ascii");
      const crcBuf = Buffer.alloc(4);
      crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0);
      return Buffer.concat([len, typeBuf, data, crcBuf]);
   }

   const ihdr = Buffer.alloc(13);
   ihdr.writeUInt32BE(width, 0);
   ihdr.writeUInt32BE(height, 4);
   ihdr[8] = 8;   // bit depth
   ihdr[9] = 6;   // color type: RGBA
   ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

   const raw = Buffer.alloc((width * 4 + 1) * height);
   for (let y = 0; y < height; y++) {
      const rowStart = y * (width * 4 + 1);
      raw[rowStart] = 0; // filter: none
      rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
   }
   const idat = deflateSync(raw);

   return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

// Table-based CRC32 (PNG spec's reference implementation).
const CRC_TABLE = (() => {
   const table = new Uint32Array(256);
   for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
   }
   return table;
})();
function crc32(buf) {
   let c = 0xffffffff;
   for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
   return c ^ 0xffffffff;
}

function renderRaster(entry, params) {
   const { WIDTH: w, HEIGHT: h } = CANVAS;
   const fn = GENERATORS[entry.generator];
   const rgba = Buffer.alloc(w * h * 4);
   for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
         const value = fn(x, y, params);
         const { r, g, b, a } = grayscale(value);
         const i = (y * w + x) * 4;
         rgba[i] = r; rgba[i + 1] = g; rgba[i + 2] = b; rgba[i + 3] = a;
      }
   }
   return encodePNG(w, h, rgba);
}

for (const entry of REGISTRY) {
   const params = paramsFor(entry);
   if (entry.nativeFormat === "vector") {
      const fn = SVG_GENERATORS[entry.generator];
      const svg = fn(CANVAS.WIDTH, CANVAS.HEIGHT, params);
      writeFileSync(`${outDir}/${entry.id}.svg`, svg);
      console.log(`wrote ${outDir}/${entry.id}.svg`);
   } else {
      const png = renderRaster(entry, params);
      writeFileSync(`${outDir}/${entry.id}.png`, png);
      console.log(`wrote ${outDir}/${entry.id}.png`);
   }
}
