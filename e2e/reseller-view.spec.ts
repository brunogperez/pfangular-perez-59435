import { test, expect } from '@playwright/test';

/**
 * Story 19 — Vista frontend del reseller (UX role-gating).
 * Reusa el storageState de `reseller.garcia@mail.com` (proyecto `ui-reseller`).
 * El aislamiento de datos lo garantiza el backend (ver multitenancy.spec.ts);
 * acá verificamos que la UI esconde lo admin-only y queda read-only.
 */
test.describe('Reseller view', () => {
  test('home muestra "Mi resumen" y badge RESELLER', async ({ page }) => {
    await page.goto('/dashboard/home');
    await expect(page).toHaveURL(/\/dashboard\/home/);
    await expect(page.locator('.page-title')).toHaveText('Mi resumen');
    await expect(page.locator('.user-role')).toHaveText('RESELLER');
  });

  test('nav solo expone Inicio + Clientes finales + Suscripciones', async ({ page }) => {
    await page.goto('/dashboard/home');
    const nav = page.locator('mat-nav-list');
    await expect(nav.getByText('Inicio')).toBeVisible();
    await expect(nav.getByText('Clientes finales')).toBeVisible();
    await expect(nav.getByText('Suscripciones')).toBeVisible();
    // Admin-only: ocultos.
    await expect(nav.getByText('Resellers')).toHaveCount(0);
    await expect(nav.getByText('Planes')).toHaveCount(0);
    await expect(nav.getByText('Créditos')).toHaveCount(0);
  });

  test('rutas admin-only redirigen a home (roleGuard)', async ({ page }) => {
    for (const path of ['resellers', 'plans', 'credits']) {
      await page.goto(`/dashboard/${path}`);
      await expect(page).toHaveURL(/\/dashboard\/home/);
    }
  });

  test('clientes finales: read-only (sin crear ni acciones)', async ({ page }) => {
    await page.goto('/dashboard/end-customers');
    await expect(page.locator('h2', { hasText: 'Clientes finales' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nuevo cliente' })).toHaveCount(0);
    // Sin columna de acciones → sin botones editar/eliminar.
    await expect(page.locator('button[mattooltip="Editar"]')).toHaveCount(0);
    await expect(page.locator('button[mattooltip="Eliminar"]')).toHaveCount(0);
  });

  test('suscripciones: ver detalle sí, escribir no', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');
    await expect(page.locator('h2', { hasText: 'Suscripciones' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nueva suscripción' })).toHaveCount(0);
    // Renew/Cancel ocultos; "Ver detalle" disponible si hay filas.
    await expect(page.locator('button[mattooltip="Renovar"]')).toHaveCount(0);
    await expect(page.locator('button[mattooltip="Cancelar"]')).toHaveCount(0);
  });
});
