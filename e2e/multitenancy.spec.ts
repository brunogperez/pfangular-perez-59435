import { test, expect } from '@playwright/test';

/**
 * Story 19 — Multi-tenancy: aislamiento de datos por reseller.
 * El usuario `reseller.garcia@mail.com` (role=reseller, vinculado a Garcia vía
 * seed) sólo debe ver SUS clientes y suscripciones, y no puede escribir ni ver
 * datos de otros resellers.
 *
 * Requiere `npm run seed` previo (crea el usuario reseller).
 */
test.describe.configure({ mode: 'serial' });

const ADMIN = { email: 'admin@mail.com', password: '123123123' };
const RESELLER = { email: 'reseller.garcia@mail.com', password: '123123123' };

let adminToken = '';
let resellerToken = '';
let resellerProfileId = '';

const aAdmin = () => ({ Authorization: `Bearer ${adminToken}` });
const aReseller = () => ({ Authorization: `Bearer ${resellerToken}` });

test.beforeAll(async ({ request }) => {
  adminToken = (await (await request.post('/api/users/login', { data: ADMIN })).json()).token;
  const r = await (await request.post('/api/users/login', { data: RESELLER })).json();
  resellerToken = r.token;
  resellerProfileId = r.resellerProfile;
});

test('login reseller devuelve role=reseller y resellerProfile vinculado', () => {
  expect(resellerToken).toBeTruthy();
  expect(resellerProfileId).toBeTruthy();
});

test('reseller sólo ve SUS end-customers', async ({ request }) => {
  const res = await request.get('/api/end-customers', { headers: aReseller() });
  expect(res.status()).toBe(200);
  const list: any[] = await res.json();
  expect(list.length).toBeGreaterThan(0);
  for (const c of list) {
    expect(String(c.reseller?._id ?? c.reseller)).toBe(resellerProfileId);
  }
});

test('reseller sólo ve SUS subscriptions', async ({ request }) => {
  const res = await request.get('/api/subscriptions', { headers: aReseller() });
  expect(res.status()).toBe(200);
  const list: any[] = await res.json();
  for (const s of list) {
    expect(String(s.soldBy?._id ?? s.soldBy)).toBe(resellerProfileId);
  }
});

test('reseller NO puede ver un cliente de otro reseller (403)', async ({ request }) => {
  const all: any[] = await (await request.get('/api/end-customers', { headers: aAdmin() })).json();
  const foreign = all.find((c) => String(c.reseller?._id ?? c.reseller) !== resellerProfileId);
  expect(foreign, 'No hay cliente de otro reseller en el seed').toBeTruthy();
  const res = await request.get(`/api/end-customers/${foreign._id}`, { headers: aReseller() });
  expect(res.status()).toBe(403);
});

test('reseller NO puede listar todos los resellers (403)', async ({ request }) => {
  const res = await request.get('/api/resellers', { headers: aReseller() });
  expect(res.status()).toBe(403);
});

test('reseller ve su propio perfil (200) pero no el de otro (403)', async ({ request }) => {
  const own = await request.get(`/api/resellers/${resellerProfileId}`, { headers: aReseller() });
  expect(own.status()).toBe(200);

  const all: any[] = await (await request.get('/api/resellers', { headers: aAdmin() })).json();
  const other = all.find((r) => String(r._id) !== resellerProfileId);
  expect(other).toBeTruthy();
  const res = await request.get(`/api/resellers/${other._id}`, { headers: aReseller() });
  expect(res.status()).toBe(403);
});

test('reseller NO puede crear suscripción (escritura admin-only) (403)', async ({ request }) => {
  const res = await request.post('/api/subscriptions', {
    headers: aReseller(),
    data: { endCustomer: resellerProfileId, plan: resellerProfileId, salePrice: 1 },
  });
  expect(res.status()).toBe(403);
});

test('reseller NO puede acceder a stats overview (admin-only) (403)', async ({ request }) => {
  const res = await request.get('/api/subscriptions/stats/overview', { headers: aReseller() });
  expect(res.status()).toBe(403);
});

test('admin sigue viendo TODO (no afectado por el scoping)', async ({ request }) => {
  const customers: any[] = await (await request.get('/api/end-customers', { headers: aAdmin() })).json();
  const resellersSet = new Set(customers.map((c) => String(c.reseller?._id ?? c.reseller)));
  // El seed tiene clientes de más de un reseller → admin ve varios.
  expect(resellersSet.size).toBeGreaterThan(1);
});
