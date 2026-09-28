import { test, expect } from '@playwright/test';

/**
 * Story 15 — Tests de integración (flujo completo).
 * Proyecto `api` (baseURL :3000). Modo serial: comparten token y estado.
 */

const ADMIN_EMAIL = 'admin@mail.com';
const ADMIN_PASSWORD = '123123123';

let token = '';
const auth = () => ({ Authorization: `Bearer ${token}` });

test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ request }) => {
  const res = await request.post('/api/users/login', {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(res.status()).toBe(200);
  token = (await res.json()).token;
});

test.describe('Integración — ciclo de vida completo de una suscripción', () => {
  let resellerId = '';
  let customerId = '';
  let planId = '';
  let subscriptionId = '';

  test('admin crea reseller con saldo inicial 0', async ({ request }) => {
    const res = await request.post('/api/resellers', {
      headers: auth(),
      data: {
        firstName: 'Flow',
        lastName: 'Reseller',
        email: `flow.${Date.now()}@example.com`,
        businessName: 'Flow Biz',
        credits: 0,
      },
    });
    expect(res.status()).toBe(201);
    const r = await res.json();
    expect(r.credits).toBe(0);
    expect(r.isOwner).toBe(false);
    resellerId = r._id;
  });

  test('carga 100 créditos y registra transaction topup', async ({ request }) => {
    const res = await request.post(`/api/resellers/${resellerId}/credits/topup`, {
      headers: auth(),
      data: { amount: 100, note: 'Carga inicial integración' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.reseller.credits).toBe(100);
    expect(body.transaction.type).toBe('topup');
    expect(body.transaction.balanceAfter).toBe(100);
  });

  test('crea customer asignado al reseller', async ({ request }) => {
    const res = await request.post('/api/end-customers', {
      headers: auth(),
      data: {
        firstName: 'Flow',
        lastName: 'Customer',
        email: `flow.cust.${Date.now()}@example.com`,
        reseller: resellerId,
      },
    });
    expect(res.status()).toBe(201);
    customerId = (await res.json())._id;
  });

  test('encuentra un plan IPTV con costo conocido', async ({ request }) => {
    const res = await request.get('/api/plans?serviceType=IPTV', { headers: auth() });
    const plans: any[] = await res.json();
    const plan = plans.find((p) => p.active && p.creditCost > 0);
    expect(plan, 'Plan IPTV activo con creditCost>0 no encontrado').toBeTruthy();
    planId = plan._id;
  });

  test('crea suscripción y descuenta créditos + registra consume', async ({ request }) => {
    const before = await (await request.get(`/api/resellers/${resellerId}`, { headers: auth() })).json();
    const plan = await (await request.get(`/api/plans/${planId}`, { headers: auth() })).json();

    const res = await request.post('/api/subscriptions', {
      headers: auth(),
      data: {
        endCustomer: customerId,
        plan: planId,
        soldBy: resellerId,
        salePrice: 15,
        credentials: { username: 'flow', password: 'secret123' },
      },
    });
    expect(res.status()).toBe(201);
    const sub = await res.json();
    expect(sub.status).toBe('active');
    subscriptionId = sub._id;

    const after = await (await request.get(`/api/resellers/${resellerId}`, { headers: auth() })).json();
    expect(after.credits).toBe(before.credits - plan.creditCost);

    const txs = await (await request.get(
      `/api/credit-transactions?reseller=${resellerId}&type=consume`,
      { headers: auth() }
    )).json();
    expect(txs.length).toBeGreaterThanOrEqual(1);
    expect(txs[0].relatedSubscription).toBeTruthy();
  });

  test('renew extiende endDate y vuelve a descontar', async ({ request }) => {
    const before = await (await request.get(`/api/resellers/${resellerId}`, { headers: auth() })).json();
    const subBefore = await (await request.get(`/api/subscriptions/${subscriptionId}`, { headers: auth() })).json();
    const plan = await (await request.get(`/api/plans/${planId}`, { headers: auth() })).json();

    const res = await request.post(`/api/subscriptions/${subscriptionId}/renew`, {
      headers: auth(),
      data: {},
    });
    expect(res.status()).toBe(200);
    const renewed = await res.json();
    expect(new Date(renewed.endDate).getTime()).toBeGreaterThan(new Date(subBefore.endDate).getTime());

    const after = await (await request.get(`/api/resellers/${resellerId}`, { headers: auth() })).json();
    expect(after.credits).toBe(before.credits - plan.creditCost);
  });

  test('cancel marca status cancelled', async ({ request }) => {
    const res = await request.post(`/api/subscriptions/${subscriptionId}/cancel`, {
      headers: auth(),
      data: {},
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).status).toBe('cancelled');
  });
});

test.describe('Integración — owner no descuenta créditos', () => {
  test('owner crea suscripción sin descontar saldo', async ({ request }) => {
    const owner = await (await request.get('/api/resellers/owner', { headers: auth() })).json();
    expect(owner.isOwner).toBe(true);
    const ownerCreditsBefore = owner.credits;

    const cust = await (await request.post('/api/end-customers', {
      headers: auth(),
      data: { firstName: 'Owner', lastName: 'Direct', reseller: owner._id },
    })).json();

    const plans: any[] = await (await request.get('/api/plans?serviceType=IPTV', { headers: auth() })).json();
    const plan = plans.find((p) => p.active && p.creditCost > 0);
    expect(plan).toBeTruthy();

    const res = await request.post('/api/subscriptions', {
      headers: auth(),
      data: { endCustomer: cust._id, plan: plan._id, soldBy: owner._id, salePrice: 30 },
    });
    expect(res.status()).toBe(201);

    const ownerAfter = await (await request.get('/api/resellers/owner', { headers: auth() })).json();
    expect(ownerAfter.credits).toBe(ownerCreditsBefore);
  });
});

test.describe('Integración — stats por serviceType', () => {
  test('stats overview agrupa por servicio con revenue', async ({ request }) => {
    const res = await request.get('/api/subscriptions/stats/overview', { headers: auth() });
    expect(res.status()).toBe(200);
    const stats = await res.json();
    expect(Array.isArray(stats.byServiceType)).toBe(true);
    expect(stats.byServiceType.length).toBeGreaterThan(0);
    for (const row of stats.byServiceType) {
      expect(row).toHaveProperty('_id');
      expect(row).toHaveProperty('count');
      expect(row).toHaveProperty('revenue');
    }
    expect(stats.totalRevenue).toBeGreaterThan(0);
  });
});
