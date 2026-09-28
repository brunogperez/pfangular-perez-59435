import { test, expect, APIRequestContext } from '@playwright/test';

const ADMIN_EMAIL = 'admin@mail.com';
const ADMIN_PASSWORD = '123123123';

let token = '';
let resellerId = '';
let endCustomerId = '';
let planId = '';
let subscriptionId = '';

const auth = () => ({ Authorization: `Bearer ${token}` });

test.describe.configure({ mode: 'serial' });

test.describe('Backend API — Auth', () => {
  test('login admin retorna token', async ({ request }) => {
    const res = await request.post('/api/users/login', {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
    expect(body.role).toBe('admin');
    token = body.token;
  });

  test('login credenciales inválidas retorna 401', async ({ request }) => {
    const res = await request.post('/api/users/login', {
      data: { email: ADMIN_EMAIL, password: 'wrong-password' },
    });
    expect(res.status()).toBe(401);
  });

  test('endpoint protegido sin token retorna 401', async ({ request }) => {
    const res = await request.get('/api/resellers');
    expect(res.status()).toBe(401);
  });
});

test.describe('Backend API — Resellers', () => {
  test('lista resellers (excluye owner por default)', async ({ request }) => {
    const res = await request.get('/api/resellers', { headers: auth() });
    expect(res.status()).toBe(200);
    const list = await res.json();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(3);
    expect(list.every((r: any) => !r.isOwner)).toBe(true);
  });

  test('owner reseller existe', async ({ request }) => {
    const res = await request.get('/api/resellers/owner', { headers: auth() });
    expect(res.status()).toBe(200);
    const owner = await res.json();
    expect(owner.isOwner).toBe(true);
  });

  test('crear reseller', async ({ request }) => {
    const res = await request.post('/api/resellers', {
      headers: auth(),
      data: {
        firstName: 'Test',
        lastName: 'Reseller',
        email: `test.reseller.${Date.now()}@example.com`,
        businessName: 'Test Biz',
        credits: 50,
      },
    });
    expect(res.status()).toBe(201);
    const reseller = await res.json();
    expect(reseller.credits).toBe(50);
    expect(reseller.isOwner).toBe(false);
    resellerId = reseller._id;
  });

  test('topup créditos suma saldo y registra transaction', async ({ request }) => {
    const res = await request.post(`/api/resellers/${resellerId}/credits/topup`, {
      headers: auth(),
      data: { amount: 25, note: 'Test topup' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.reseller.credits).toBe(75);
    expect(body.transaction.type).toBe('topup');
    expect(body.transaction.balanceAfter).toBe(75);
  });

  test('ajuste negativo descuenta créditos', async ({ request }) => {
    const res = await request.post(`/api/resellers/${resellerId}/credits/adjust`, {
      headers: auth(),
      data: { amount: -10, note: 'Test adjust' },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.reseller.credits).toBe(65);
    expect(body.transaction.amount).toBe(-10);
  });

  test('ajuste que dejaría saldo negativo rechaza 400', async ({ request }) => {
    const res = await request.post(`/api/resellers/${resellerId}/credits/adjust`, {
      headers: auth(),
      data: { amount: -9999 },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe('Backend API — Plans', () => {
  test('lista planes seed', async ({ request }) => {
    const res = await request.get('/api/plans', { headers: auth() });
    expect(res.status()).toBe(200);
    const plans = await res.json();
    expect(plans.length).toBeGreaterThanOrEqual(5);
    planId = plans.find((p: any) => p.serviceType === 'IPTV' && p.creditCost === 1)._id;
  });

  test('lista tipos de servicio incluye IPTV, VPN, Hosting', async ({ request }) => {
    const res = await request.get('/api/plans/service-types', { headers: auth() });
    expect(res.status()).toBe(200);
    const types = await res.json();
    expect(types).toContain('IPTV');
    expect(types).toContain('VPN');
    expect(types).toContain('Hosting');
  });

  test('filtro serviceType=VPN solo retorna VPN', async ({ request }) => {
    const res = await request.get('/api/plans?serviceType=VPN', { headers: auth() });
    const plans = await res.json();
    expect(plans.length).toBeGreaterThan(0);
    expect(plans.every((p: any) => p.serviceType === 'VPN')).toBe(true);
  });

  test('crear plan custom', async ({ request }) => {
    const res = await request.post('/api/plans', {
      headers: auth(),
      data: {
        name: 'Test Plan',
        serviceType: 'IPTV',
        durationDays: 7,
        capacity: 1,
        creditCost: 1,
        ownerPrice: 2,
        suggestedResellerPrice: 5,
        credentialFields: ['username', 'password'],
      },
    });
    expect(res.status()).toBe(201);
  });

  test('crear plan con datos inválidos rechaza 400', async ({ request }) => {
    const res = await request.post('/api/plans', {
      headers: auth(),
      data: { name: 'X', durationDays: -1 },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe('Backend API — End Customers', () => {
  test('crear end-customer con reseller válido', async ({ request }) => {
    const res = await request.post('/api/end-customers', {
      headers: auth(),
      data: {
        firstName: 'Test',
        lastName: 'Customer',
        email: `test.customer.${Date.now()}@example.com`,
        phone: '+541199999999',
        reseller: resellerId,
      },
    });
    expect(res.status()).toBe(201);
    const customer = await res.json();
    endCustomerId = customer._id;
    expect(customer.active).toBe(true);
  });

  test('listar end-customers con filtro por reseller', async ({ request }) => {
    const res = await request.get(`/api/end-customers?reseller=${resellerId}`, { headers: auth() });
    expect(res.status()).toBe(200);
    const list = await res.json();
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  test('crear end-customer con reseller inválido rechaza 400', async ({ request }) => {
    const res = await request.post('/api/end-customers', {
      headers: auth(),
      data: {
        firstName: 'X', lastName: 'Y',
        reseller: '6a00000000000000000000ff',
      },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe('Backend API — Subscriptions (lógica créditos)', () => {
  test('crear suscripción consume créditos del reseller', async ({ request }) => {
    const before = await (await request.get(`/api/resellers/${resellerId}`, { headers: auth() })).json();
    const beforeCredits = before.credits;

    const res = await request.post('/api/subscriptions', {
      headers: auth(),
      data: {
        endCustomer: endCustomerId,
        plan: planId,
        soldBy: resellerId,
        salePrice: 10,
        credentials: { username: 'demo', password: 'demo', serverUrl: 'http://demo' },
      },
    });
    expect(res.status()).toBe(201);
    const sub = await res.json();
    expect(sub.status).toBe('active');
    expect(sub.planSnapshot.serviceType).toBe('IPTV');
    expect(sub.planSnapshot.creditCost).toBe(1);
    subscriptionId = sub._id;

    const after = await (await request.get(`/api/resellers/${resellerId}`, { headers: auth() })).json();
    expect(after.credits).toBe(beforeCredits - 1);
  });

  test('renew extiende endDate y consume créditos otra vez', async ({ request }) => {
    const before = await (await request.get(`/api/resellers/${resellerId}`, { headers: auth() })).json();
    const beforeEndDate = (await (await request.get(`/api/subscriptions/${subscriptionId}`, { headers: auth() })).json()).endDate;

    const res = await request.post(`/api/subscriptions/${subscriptionId}/renew`, {
      headers: auth(),
      data: {},
    });
    expect(res.status()).toBe(200);
    const renewed = await res.json();
    expect(new Date(renewed.endDate).getTime()).toBeGreaterThan(new Date(beforeEndDate).getTime());

    const after = await (await request.get(`/api/resellers/${resellerId}`, { headers: auth() })).json();
    expect(after.credits).toBe(before.credits - 1);
  });

  test('cancel cambia status a cancelled', async ({ request }) => {
    const res = await request.post(`/api/subscriptions/${subscriptionId}/cancel`, {
      headers: auth(),
      data: {},
    });
    expect(res.status()).toBe(200);
    const sub = await res.json();
    expect(sub.status).toBe('cancelled');
  });

  test('crear suscripción con saldo insuficiente retorna 402', async ({ request }) => {
    const empty = await request.post('/api/resellers', {
      headers: auth(),
      data: {
        firstName: 'Empty', lastName: 'Wallet',
        email: `empty.${Date.now()}@example.com`,
        credits: 0,
      },
    });
    expect(empty.status()).toBe(201);
    const emptyReseller = await empty.json();
    expect(emptyReseller.credits).toBe(0);

    const customer = await request.post('/api/end-customers', {
      headers: auth(),
      data: { firstName: 'Cust', lastName: 'Empty', reseller: emptyReseller._id },
    });
    expect(customer.status()).toBe(201);
    const customerJson = await customer.json();

    const plansRes = await request.get('/api/plans?serviceType=IPTV', { headers: auth() });
    const plansList: any[] = await plansRes.json();
    const annual = plansList.find((p) => p.creditCost >= 5);
    expect(annual, 'Plan IPTV con creditCost>=5 no encontrado').toBeTruthy();

    const res = await request.post('/api/subscriptions', {
      headers: auth(),
      data: {
        endCustomer: customerJson._id,
        plan: annual._id,
        soldBy: emptyReseller._id,
        salePrice: 10,
      },
    });
    if (res.status() !== 402) {
      const body = await res.text();
      console.log('UNEXPECTED status', res.status(), 'body:', body);
    }
    expect(res.status()).toBe(402);
  });

  test('stats overview retorna agrupación por servicio', async ({ request }) => {
    const res = await request.get('/api/subscriptions/stats/overview', { headers: auth() });
    expect(res.status()).toBe(200);
    const stats = await res.json();
    expect(stats.totalRevenue).toBeGreaterThan(0);
    expect(Array.isArray(stats.byServiceType)).toBe(true);
    expect(stats.byServiceType.length).toBeGreaterThan(0);
  });
});

test.describe('Backend API — Credit Transactions', () => {
  test('historial de transacciones del reseller', async ({ request }) => {
    const res = await request.get(`/api/credit-transactions?reseller=${resellerId}`, { headers: auth() });
    expect(res.status()).toBe(200);
    const txs = await res.json();
    expect(txs.length).toBeGreaterThanOrEqual(3);
    expect(txs[0].balanceAfter).toBeDefined();
  });

  test('filtro por type=consume', async ({ request }) => {
    const res = await request.get(`/api/credit-transactions?reseller=${resellerId}&type=consume`, { headers: auth() });
    const txs = await res.json();
    expect(txs.every((t: any) => t.type === 'consume')).toBe(true);
  });
});
