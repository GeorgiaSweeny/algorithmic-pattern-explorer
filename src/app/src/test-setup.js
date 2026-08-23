/*
========================================
COMPONENT TEST SETUP
========================================
* Registered via vite.config.js's test.setupFiles. Two jsdom gaps this
* project's component tests need filled, both standard for a Canvas/
* ReactFlow app under jsdom rather than a real browser:
*
* - HTMLCanvasElement.prototype.getContext: jsdom implements the method
*   but returns null (no real canvas backend) — PatternCanvas.jsx's raster
*   branch would throw on `ctx.createImageData` otherwise. A minimal stub
*   (createImageData/putImageData only, the two calls PatternCanvas.jsx
*   actually makes) is lighter-weight than installing the native `canvas`
*   npm package for tests that only need "doesn't throw", not pixel-exact
*   output — pixel-exact raster correctness is already covered by the
*   generator layer's own property tests (src/generators/__tests__/),
*   which don't touch the DOM at all.
* - ResizeObserver: @xyflow/react (the Algorithm Workflow graph) uses it
*   internally for auto-fitting the view; jsdom has no implementation.
*/
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Explicit unmount-between-tests: this project's vitest config doesn't set
// test.globals, so @testing-library/react's own auto-cleanup (which relies
// on detecting a global `afterEach`) never registers on its own — without
// this, a component rendered in one test stays mounted in jsdom's document
// for every test after it in the same file, corrupting later queries.
afterEach(() => {
   cleanup();
});

HTMLCanvasElement.prototype.getContext = function () {
   return {
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h }),
      putImageData: () => {},
   };
};

if (typeof globalThis.ResizeObserver === "undefined") {
   globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
   };
}
