import { test, expect } from '@playwright/test';

/**
 * Test de rate limit de login (Story 15). AGOTA el límite de login (10/15min),
 * por eso vive en su propio proyecto Playwright (`ratelimit`) que declara
 * `dependencies: ['api','ui']`: corre AL FINAL, cuando el resto de las suites ya
 * hicieron sus logins. Así no envenena los logins de las otras suites.
 */
// Email inexistente a propósito: la ruta "usuario no encontrado" NO cuenta
// intentos fallidos por cuenta (no dispara el lockout del admin real), pero el
// rate limit de login es por IP, así que igual se alcanza el 429.
const NOBODY_EMAIL = 'nobody-ratelimit@example.com';

test('exceder intentos de login retorna 429', async ({ request }) => {
  let saw429 = false;
  let body429: any = null;
  for (let i = 0; i < 30; i++) {
    const res = await request.post('/api/users/login', {
      data: { email: NOBODY_EMAIL, password: 'wrong-on-purpose' },
    });
    if (res.status() === 429) {
      saw429 = true;
      body429 = await res.json();
      break;
    }
  }
  expect(saw429, 'No se alcanzó el 429 tras múltiples intentos de login').toBe(true);
  expect(body429.success).toBe(false);
  expect(body429.error).toContain('intentos');
});
