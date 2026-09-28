import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@mail.com';
const ADMIN_PASSWORD = '123123123';

// Estado sin auth para los tests del flujo login/logout/guard.
const NO_AUTH = { cookies: [], origins: [] };

async function login(page: any) {
  await page.goto('/auth/login');
  await page.fill('input[formControlName="email"]', ADMIN_EMAIL);
  await page.fill('input[formControlName="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard\/home/);
}

// ── Tests autenticados ────────────────────────────────────────────────
// Reutilizan el storageState del proyecto `setup` (definido en
// playwright.config.ts). NO hacen login => no gatillan el rate limit.
test.describe('UI Dashboard (autenticado)', () => {
  test('home muestra título y cards de stats', async ({ page }) => {
    await page.goto('/dashboard/home');
    await expect(page.locator('text=Resumen general')).toBeVisible();
    await expect(page.locator('text=Resellers').first()).toBeVisible();
    await expect(page.locator('text=Clientes finales').first()).toBeVisible();
    await expect(page.locator('text=Planes activos')).toBeVisible();
    await expect(page.locator('text=Ingresos USD')).toBeVisible();
  });

  test('home muestra widget de ingresos por servicio', async ({ page }) => {
    await page.goto('/dashboard/home');
    await expect(page.locator('text=Ingresos por servicio')).toBeVisible();
    await expect(page.locator('.widget .bars .bar-row').first()).toBeVisible({ timeout: 10000 });
  });

  test('navegación a resellers carga la lista', async ({ page }) => {
    await page.goto('/dashboard/home');
    await page.click('a[href="/dashboard/resellers"]');
    await expect(page).toHaveURL(/\/dashboard\/resellers/);
    await expect(page.locator('h2:has-text("Resellers")')).toBeVisible();
    const rows = page.locator('mat-card table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
  });

  test('navegación a end-customers carga la lista', async ({ page }) => {
    await page.goto('/dashboard/home');
    await page.click('a[href="/dashboard/end-customers"]');
    await expect(page).toHaveURL(/\/dashboard\/end-customers/);
    await expect(page.locator('h2:has-text("Clientes finales")')).toBeVisible();
  });

  test('navegación a plans muestra IPTV, VPN, Hosting', async ({ page }) => {
    await page.goto('/dashboard/home');
    await page.click('a[href="/dashboard/plans"]');
    await expect(page).toHaveURL(/\/dashboard\/plans/);
    await expect(page.locator('h2:has-text("Planes")')).toBeVisible();
    await expect(page.locator('mat-chip:has-text("IPTV")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('mat-chip:has-text("VPN")').first()).toBeVisible();
    await expect(page.locator('mat-chip:has-text("Hosting")').first()).toBeVisible();
  });

  test('navegación a subscriptions muestra suscripciones del seed', async ({ page }) => {
    await page.goto('/dashboard/home');
    await page.click('a[href="/dashboard/subscriptions"]');
    await expect(page).toHaveURL(/\/dashboard\/subscriptions/);
    await expect(page.locator('h2:has-text("Suscripciones")')).toBeVisible();
    const rows = page.locator('mat-card table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
  });

  test('navegación a credits muestra movimientos', async ({ page }) => {
    await page.goto('/dashboard/home');
    await page.click('a[href="/dashboard/credits"]');
    await expect(page).toHaveURL(/\/dashboard\/credits/);
    await expect(page.locator('h2:has-text("Movimientos de créditos")')).toBeVisible();
    const rows = page.locator('mat-card table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
  });

  // ── Story 16: pulido UX ──────────────────────────────────────────
  test('toggle de tema oscuro aplica y persiste la clase dark-theme', async ({ page }) => {
    await page.goto('/dashboard/home');
    await expect(page.locator('body')).not.toHaveClass(/dark-theme/);
    await page.click('.theme-toggle');
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    // Persiste tras recargar (ThemeService lee localStorage).
    await page.reload();
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    // Volver a claro para no contaminar otros tests vía storageState.
    await page.click('.theme-toggle');
    await expect(page.locator('body')).not.toHaveClass(/dark-theme/);
  });

  test('búsqueda en resellers filtra filas y muestra empty-state sin resultados', async ({ page }) => {
    await page.goto('/dashboard/resellers');
    const rows = page.locator('mat-card table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });

    await page.fill('.search input', 'garcia');
    await expect(page.locator('table tbody tr', { hasText: 'Garcia' }).first()).toBeVisible();

    await page.fill('.search input', 'zzz-no-existe-zzz');
    await expect(page.locator('.empty-state', { hasText: 'Sin resultados' })).toBeVisible();
  });

  test('resellers ordenable por columna (mat-sort-header)', async ({ page }) => {
    await page.goto('/dashboard/resellers');
    await expect(page.locator('th.mat-sort-header').first()).toBeVisible({ timeout: 10000 });
    await page.click('th.mat-sort-header:has-text("Créditos")');
    await expect(page.locator('th[aria-sort="ascending"], th[aria-sort="descending"]')).toHaveCount(1);
  });
});

// ── Tests del flujo de autenticación ─────────────────────────────────
// Usan estado SIN auth (anula el storageState global) y hacen login/logout
// real. Sólo 2 logins => bajo el límite de 10/15min.
test.describe('UI Auth flow', () => {
  test.use({ storageState: NO_AUTH });

  test('login admin navega al dashboard home', async ({ page }) => {
    await login(page);
    await expect(page.locator('text=Resumen general')).toBeVisible();
  });

  test('logout limpia sesión', async ({ page }) => {
    await login(page);
    await page.click('.logout-item');
    await expect(page).toHaveURL(/\/auth\/login/);
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('acceso a /dashboard sin auth redirige a login', async ({ page }) => {
    await page.goto('/dashboard/home');
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
