import { useEffect, useId, useRef } from "react";
import { GENERATORS } from "../../generators/index.js";
import { SVG_GENERATORS } from "../../generators/svg/index.js";
import { mapColour } from "../../render.js";
import { CANVAS } from "../../config.js";
import { resolvePreview, seedPointsRasterValue, seedPointsSvg, rawDistanceSvg } from "./stagePreview.js";

// Framework-agnostic sibling of src/ui.js's render dispatch: same
// GENERATORS/SVG_GENERATORS/grayscale pipeline, driving a plain <canvas> or
// injected <svg> instead of p5's pixel buffer.
//
// `node` (optional — the currently selected ReactFlow node) drives
// per-node intermediate state via stagePreview.js: when the selected
// node's stage has a defined preview rule, the canvas shows that
// intermediate state instead of the pattern's final output. Omitting
// `node` (or selecting a node with no defined rule) falls back to the
// pattern's real current output, unchanged from before this existed.
//
// Also used, unmodified, as App.jsx's left-column "Render Preview" —
// always computed at the full CANVAS resolution (correct for every
// generator, several of which normalise coordinates against the imported
// CANVAS constant directly, e.g. recursive.js) and scaled down for display
// via CSS (`.pattern-canvas`'s own `max-width/max-height: 100%`, or an
// explicit width in the zoomable Render Preview case — see App.css's
// `.final-preview-canvas-scale`), not resampled at a smaller pixel grid.
// Simpler and risk-free; a genuine reduced-resolution resampling pass
// would be the next optimisation if two full-resolution renders per param
// change ever becomes a measured problem (see docs/benchmark-results.md
// for the existing per-generator per-frame cost).
// DocumentationPanel.jsx's "Visual Example" used to reuse this component
// too, until it became a generic per-node-type diagram instead (see
// nodeIllustrations.jsx) — a render of whichever pattern happened to be
// selected didn't actually explain the node's operation.
// SVG generators (wave-svg.js's "wg"/"wp", islamic-svg.js's "islamic-tile",
// etc.) hardcode their own <defs> ids, which is fine as long as only one
// PatternCanvas is ever mounted at a time — true everywhere except the
// evaluation quiz's image-bearing items, which mount several side by side
// in the same document. SVG ids are document-global, not scoped to their
// own <svg>, so `url(#wp)` in a second mounted instance resolves to
// whichever element with `id="wp"` appears *first* in the whole page —
// every such SVG rendered after the first one silently shows the first
// one's own pattern/gradient/clip instead of its own. Suffixing every id
// (and every reference to one) with a per-mount `useId()` value scopes
// them without touching a single generator's own SVG string.
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

      const previewParams = preview?.kind === "override" ? { ...params, ...preview.overrides } : params;

      for (let y = 0; y < HEIGHT; y++) {
         for (let x = 0; x < WIDTH; x++) {
            const value =
               preview?.kind === "seedPoints"
                  ? seedPointsRasterValue(x, y, params)
                  : fn(x, y, previewParams);
            const { r, g, b, a } = mapColour(value, params);
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
      if (preview?.kind === "seedPoints") svg = seedPointsSvg(WIDTH, HEIGHT, params);
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
