import { defineConfig } from "vitest/config";

// Excludes app/ (added 2026-08-21): src/app/ is its own separate package
// with its own package.json, its own `npm test`, and its own vitest
// config (src/app/vite.config.js — jsdom environment, a component-test
// setup file). Without this exclude, vitest's default recursive file
// discovery picks up src/app/src/*.test.jsx too when run from this
// directory, but under the *wrong* environment (plain Node, no jsdom, no
// setup file) — every component test then fails, not because anything is
// broken, but because this is simply the wrong directory to run them
// from. `cd src/app && npx vitest run` is the correct, and only, way to
// run the app's own test suite; this directory's `npx vitest run` is for
// the generator/core suite only, matching this project's `src/package.json`
// `test` script.
export default defineConfig({
   test: {
      exclude: ["**/node_modules/**", "app/**"],
   },
});
