/*
========================================
PATTERN CANVAS
========================================
* Framework-agnostic canvas/SVG renderer, driven by GENERATORS/SVG_GENERATORS.
* `node` (optional, the selected ReactFlow node) shows that node's intermediate
* preview state via stagePreview.js instead of the pattern's final output.
*/

import { useEffect, useId, useRef } from "react";
import { GENERATORS } from "../../generators/index.js";
import { SVG_GENERATORS } from "../../generators/svg/index.js";
import { mapColour } from "../../render.js";
import { CANVAS } from "../../config.js";
import {
   resolvePreview,
   seedPointsRasterValue,
   seedPointsSvg,
   rawDistanceSvg,
   blankSvg,
   baseShapeSvg,
   baseShapeRasterValue,
   NOISE_DIFF_HIGHLIGHT,
} from "./stagePreview.js";

// SVG generators hardcode their own <defs> ids (e.g. "wp", "islamic-tile").
// Since multiple PatternCanvas instances can mount at once (the evaluation
// quiz), ids are suffixed with a per-mount useId() so url(#...) references
// don't collide across instances.
function scopeSvgIds(svg, uid) {
   return svg
      .replace(/\bid="([^"]+)"/g, (_, id) => `id="${id}-${uid}"`)
      .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}-${uid})`)
      .replace(/(xlink:href|href)="#([^"]+)"/g, (_, attr, id) => `${attr}="#${id}-${uid}"`);
}

export default function PatternCanvas({ entry, params, node }) {
   const canvasRef = useRef(null);
   const svgHostRef = useRef(null);
   const uid = useId().replace(/:/g, "");
   const isVector = entry.nativeFormat === "vector";
   const nodeType = node?.data?.nodeType;
   const preview = resolvePreview(entry.generator, nodeType, params, node?.data);

   useEffect(() => {
      if (isVector) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const { WIDTH, HEIGHT } = CANVAS;
      const image = ctx.createImageData(WIDTH, HEIGHT);
      const fn = GENERATORS[entry.generator];

      const previewParams =
         preview?.kind === "override" || preview?.kind === "noiseDiff"
            ? { ...params, ...preview.overrides }
            : params;

      for (let y = 0; y < HEIGHT; y++) {
         for (let x = 0; x < WIDTH; x++) {
            let r, g, b, a;
            if (preview?.kind === "blank") {
               ({ r, g, b, a } = mapColour(1, params));
            } else if (preview?.kind === "baseShape") {
               ({ r, g, b, a } = mapColour(baseShapeRasterValue(x, y, WIDTH, HEIGHT), params));
            } else if (preview?.kind === "seedPoints") {
               ({ r, g, b, a } = mapColour(seedPointsRasterValue(x, y, params), params));
            } else if (preview?.kind === "noiseDiff") {
               const withNoise = fn(x, y, previewParams);
               const withoutThisLevel = fn(x, y, { ...previewParams, [preview.zeroParam]: 0 });
               ({ r, g, b, a } =
                  withNoise !== withoutThisLevel ? NOISE_DIFF_HIGHLIGHT : mapColour(withNoise, params));
            } else {
               ({ r, g, b, a } = mapColour(fn(x, y, previewParams), params));
            }
            const idx = 4 * (x + y * WIDTH);
            image.data[idx] = r;
            image.data[idx + 1] = g;
            image.data[idx + 2] = b;
            image.data[idx + 3] = a;
         }
      }
      ctx.putImageData(image, 0, 0);
   }, [entry, params, isVector, preview]);

   useEffect(() => {
      if (!isVector) return;
      const fn = SVG_GENERATORS[entry.generator];
      if (!fn || !svgHostRef.current) return;

      const { WIDTH, HEIGHT } = CANVAS;
      let svg;
      if (preview?.kind === "blank") svg = blankSvg(WIDTH, HEIGHT, params);
      else if (preview?.kind === "baseShape") svg = baseShapeSvg(WIDTH, HEIGHT, params);
      else if (preview?.kind === "seedPoints") svg = seedPointsSvg(WIDTH, HEIGHT, params);
      else if (preview?.kind === "rawDistance") svg = rawDistanceSvg(WIDTH, HEIGHT);
      else if (preview?.kind === "override") svg = fn(WIDTH, HEIGHT, { ...params, ...preview.overrides });
      else svg = fn(WIDTH, HEIGHT, params);

      svgHostRef.current.innerHTML = scopeSvgIds(svg, uid);
   }, [entry, params, isVector, preview, uid]);

   if (isVector) {
      return <div ref={svgHostRef} className="pattern-canvas pattern-canvas-svg" />;
   }
   return (
      <canvas
         ref={canvasRef}
         className="pattern-canvas"
         width={CANVAS.WIDTH}
         height={CANVAS.HEIGHT}
      />
   );
}
