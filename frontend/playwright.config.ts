import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(__dirname, '..', 'backend');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: BACKEND_DIR,
      url: 'http://localhost:3000/health',
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'npm run dev -- --port 5173 --strictPort',
      cwd: __dirname,
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
});
