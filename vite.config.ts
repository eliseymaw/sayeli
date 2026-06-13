import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  // Relative base so the build works on a GitHub Pages project site
  // (https://<user>.github.io/<repo>/) regardless of the repo name.
  // Safe here because the experience is a single page with no routing.
  base: "./",
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: "esnext",
    chunkSizeWarningLimit: 1500,
  },
});
