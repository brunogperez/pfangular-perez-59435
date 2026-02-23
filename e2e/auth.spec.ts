import { test, expect } from '@playwright/test';

test.describe('Auth Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('Login exitoso debe navegar a /dashboard/home', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[formControlName="email"]', 'admin@mail.com');
    await page.fill('input[formControlName="password"]', '123123123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard\/home/);
  });

  test('Login con credenciales incorrectas debe mostrar error', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[formControlName="email"]', 'wrong@mail.com');
    await page.fill('input[formControlName="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('Acceso a /dashboard sin autenticacion debe redirigir a /auth/login', async ({ page }) => {
    await page.goto('/dashboard/home');

    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('Acceso a /dashboard/users con rol user debe redirigir a /dashboard/home', async ({ page }) => {
    // First login as regular user
    await page.goto('/auth/login');
    await page.fill('input[formControlName="email"]', 'user@mail.com');
    await page.fill('input[formControlName="password"]', '123123123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard\/home/);

    // Try to access admin-only route
    await page.goto('/dashboard/users');
    await expect(page).toHaveURL(/\/dashboard\/home/);
  });

  test('Logout debe limpiar sesion y redirigir a login', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[formControlName="email"]', 'admin@mail.com');
    await page.fill('input[formControlName="password"]', '123123123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard\/home/);

    // Click logout button
    const logoutButton = page.locator('[data-testid="logout-btn"], button:has-text("Salir"), mat-icon:has-text("logout")');
    await logoutButton.first().click();

    await expect(page).toHaveURL(/\/auth\/login/);

    // Verify token was cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
