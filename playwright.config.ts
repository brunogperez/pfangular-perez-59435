import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: [
    {
      command: 'npx json-server --watch db.json --port 3000',
      port: 3000,
      reuseExistingServer: true,
    },
    {
      command: 'npx ng serve --port 4200',
      port: 4200,
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
