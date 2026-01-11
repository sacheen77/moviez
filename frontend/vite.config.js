import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setup.js",
    coverage: {
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage"
    }
  }
});

