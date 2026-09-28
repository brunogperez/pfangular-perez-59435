import { test, expect } from '@playwright/test';

/**
 * Story 18 — Refresh tokens + password reset.
 * Usa un usuario descartable (creado vía POST público /api/users) para no tocar
 * al admin. Mínimos logins para no agotar el rate limit de login.
 */
test.describe.configure({ mode: 'serial' });

const PWD = 'secret123';
let email = '';
let userToken = '';

test.beforeAll(async ({ request }) => {
  email = `auth.extra.${Date.now()}@example.com`;
  const res = await request.post('/api/users', {
    data: { firstName: 'Auth', lastName: 'Extra', email, password: PWD, role: 'user' },
  });
  expect(res.status()).toBe(201);
  userToken = (await res.json()).token;
});

test.describe('Refresh tokens', () => {
  test('login devuelve refreshToken y /refresh emite nuevo access token', async ({ request }) => {
    const login = await request.post('/api/users/login', { data: { email, password: PWD } });
    expect(login.status()).toBe(200);
    const { token, refreshToken } = await login.json();
    expect(token).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    const refreshed = await request.post('/api/users/refresh', { data: { refreshToken } });
    expect(refreshed.status()).toBe(200);
    const body = await refreshed.json();
    expect(body.token).toBeTruthy();
    expect(body.email).toBe(email);
  });

  test('/refresh con token inválido retorna 401', async ({ request }) => {
    const res = await request.post('/api/users/refresh', { data: { refreshToken: 'garbage.token.value' } });
    expect(res.status()).toBe(401);
  });

  test('/refresh sin token retorna 400', async ({ request }) => {
    const res = await request.post('/api/users/refresh', { data: {} });
    expect(res.status()).toBe(400);
  });
});

test.describe('Password reset', () => {
  let resetToken = '';

  test('request devuelve resetToken en dev', async ({ request }) => {
    const res = await request.post('/api/users/password-reset/request', { data: { email } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.resetToken).toBeTruthy(); // expuesto sólo en dev
    resetToken = body.resetToken;
  });

  test('request de email inexistente responde genérico (sin filtrar existencia)', async ({ request }) => {
    const res = await request.post('/api/users/password-reset/request', {
      data: { email: 'no-existe-jamas@example.com' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.resetToken).toBeFalsy();
  });

  test('confirm cambia la contraseña y permite login con la nueva', async ({ request }) => {
    const newPwd = 'newsecret456';
    const confirm = await request.post('/api/users/password-reset/confirm', {
      data: { token: resetToken, newPassword: newPwd },
    });
    expect(confirm.status()).toBe(200);

    const login = await request.post('/api/users/login', { data: { email, password: newPwd } });
    expect(login.status()).toBe(200);
  });

  test('reusar el mismo reset token falla (single-use)', async ({ request }) => {
    const res = await request.post('/api/users/password-reset/confirm', {
      data: { token: resetToken, newPassword: 'another789' },
    });
    expect(res.status()).toBe(401);
  });

  test('confirm con contraseña corta retorna 400', async ({ request }) => {
    const res = await request.post('/api/users/password-reset/confirm', {
      data: { token: resetToken, newPassword: '123' },
    });
    expect(res.status()).toBe(400);
  });
});
