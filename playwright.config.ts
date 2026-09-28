import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  // Serial: evita que los proyectos `api` y `ui` corran en paralelo (carga
  // concurrente sobre el dev-server + ventana compartida del rate limit de
  // login harían flakear las aserciones). El proyecto `ratelimit` corre al
  // final por sus `dependencies`.
  workers: 1,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    screenshot: 'only-on-failure',
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  },
  projects: [
    {
      name: 'api',
      testMatch: /(backend-api|integration|auth-extra|multitenancy)\.spec\.ts/,
      use: { baseURL: 'http://localhost:3000' },
    },
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { browserName: 'chromium' },
    },
    {
      name: 'ui',
      testMatch: /ui-.*\.spec\.ts/,
      use: { browserName: 'chromium', storageState: 'e2e/.auth/admin.json' },
      dependencies: ['setup'],
    },
    {
      // Vista reseller (Story 19): reusa el storageState del usuario reseller.
      name: 'ui-reseller',
      testMatch: /reseller-view\.spec\.ts/,
      use: { browserName: 'chromium', storageState: 'e2e/.auth/reseller.json' },
      dependencies: ['setup'],
    },
    {
      // Agota el rate limit de login: corre al final, tras api y ui.
      name: 'ratelimit',
      testMatch: /ratelimit\.spec\.ts/,
      use: { baseURL: 'http://localhost:3000' },
      dependencies: ['api', 'ui', 'ui-reseller'],
    },
  ],
});
