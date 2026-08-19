import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // A card that hangs is a bug (rough.js has looped forever on degenerate input before),
    // so keep the per-test budget tight enough that it fails instead of stalling CI.
    testTimeout: 10_000,
  },
});
