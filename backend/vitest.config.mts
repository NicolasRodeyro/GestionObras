import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    hookTimeout: 20000,
    testTimeout: 20000,
    fileParallelism: false,
  },
});
