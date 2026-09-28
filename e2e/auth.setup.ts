import { test as setup, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@mail.com';
const ADMIN_PASSWORD = '123123123';
export const ADMIN_STATE = 'e2e/.auth/admin.json';

const RESELLER_EMAIL = 'reseller.garcia@mail.com';
const RESELLER_PASSWORD = '123123123';
export const RESELLER_STATE = 'e2e/.auth/reseller.json';

async function loginAndSave(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
  statePath: string
): Promise<void> {
  await page.goto('/auth/login');
  await page.fill('input[formControlName="email"]', email);
  await page.fill('input[formControlName="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard\/home/);
  await page.context().storageState({ path: statePath });
}

/**
 * Inicia sesión UNA sola vez por rol y guarda el storageState (incluye el token
 * de localStorage). El resto de los tests autenticados reutilizan este estado en
 * vez de loguearse en cada `beforeEach`, lo que evita gatillar el rate limit de
 * login (10/15min) y mantiene válido el test de rate limit (Story 15).
 */
setup('authenticate admin', async ({ page }) => {
  await loginAndSave(page, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_STATE);
});

setup('authenticate reseller', async ({ page }) => {
  await loginAndSave(page, RESELLER_EMAIL, RESELLER_PASSWORD, RESELLER_STATE);
});
