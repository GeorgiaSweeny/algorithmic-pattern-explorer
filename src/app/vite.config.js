import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// server.fs.allow reaches back into ../generators/lib and ../patternRegistry.js,
// which this app imports directly rather than duplicating.
export default defineConfig({
   plugins: [react()],
   server: {
      fs: { allow: [".."] },
   },
});
