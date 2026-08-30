import { defineConfig } from "vitest/config";
import angular from "@angular/platform-browser-dynamic";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [],
    include: ["src/**/*.spec.ts"],
    exclude: ["node_modules", "dist", "e2e"],
  },
});
