import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    // Limit worker concurrency: on low-core machines, spinning up many jsdom
    // environments in parallel causes CPU contention severe enough to blow
    // past even generous per-test timeouts (observed flaky failures on a
    // 4-core machine). Fewer, saturated workers are more consistent than
    // many contended ones.
    poolOptions: {
      threads: {
        maxThreads: 2,
      },
    },
    testTimeout: 10000,
  },
})
