'use strict';
/* Run: node --test tests/   — exercises the real /api handlers against a mock Razorpay. */
const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { TEST, startMockRazorpay, startSite } = require('./dev-server');

const SITE = 'http://localhost:4290', RZP = 'http://localhost:4291';
let servers = [];
const hasPack = fs.existsSync(path.join(__dirname, '..', 'private', 'pack.enc'));

test.before(async () => {
  const m = await startMockRazorpay(4291); servers.push(m.server);
  servers.push(await startSite(4290, 4291));
});
test.after(() => servers.forEach((s) => s.close()));

const post = (p, body, headers) => fetch(SITE + p, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: typeof body === 'string' ? body : JSON.stringify(body) });
const mk = async () => (await (await post('/api/create-order', { attribution: { utm_source: 'meta', utm_campaign: 'finance_money_audit', junk: 'x' } })).json());
const pay = async (id, opts) => (await fetch(RZP + '/__pay/' + id, { method: 'POST', body: JSON.stringify(opts || {}) })).json();

test('create-order: server-side price, public key only, tagged as our product', async () => {
  const r = await post('/api/create-order', {}); const o = await r.json();
  assert.equal(r.status, 200);
  assert.equal(o.amount, 1900); assert.equal(o.currency, 'USD');
  assert.equal(o.key_id, TEST.KEY_ID);
  assert.ok(!JSON.stringify(o).includes(TEST.KEY_SECRET), 'secret must never be returned');
  assert.match(o.order_id, /^order_/);
});

test('create-order: INR plan uses the fixed server-side price', async () => {
  const r = await post('/api/create-order', { plan: 'inr', amount: 1, currency: 'USD' });
  const o = await r.json();
  assert.equal(r.status, 200);
  assert.equal(o.amount, 159900); assert.equal(o.currency, 'INR');
});

test('create-order ignores a client-supplied price', async () => {
  const o = await (await post('/api/create-order', { amount: 1, currency: 'INR' })).json();
  assert.equal(o.amount, 1900);
});

test('create-order rejects foreign origins', async () => {
  const r = await post('/api/create-order', {}, { Origin: 'https://evil.example' });
  assert.equal(r.status, 403);
});

test('verify: valid payment returns token; tampered signature rejected', async () => {
  const o = await mk(); const p = await pay(o.order_id);
  const good = await post('/api/verify', { razorpay_order_id: p.razorpay_order_id, razorpay_payment_id: p.razorpay_payment_id, razorpay_signature: p.razorpay_signature });
  const gj = await good.json();
  assert.equal(good.status, 200); assert.ok(gj.token); assert.equal(gj.amount, 1900);
  const bad = await post('/api/verify', { razorpay_order_id: p.razorpay_order_id, razorpay_payment_id: p.razorpay_payment_id, razorpay_signature: 'a'.repeat(64) });
  assert.equal(bad.status, 400);
  const junk = await post('/api/verify', { razorpay_order_id: 'x', razorpay_payment_id: 'y', razorpay_signature: 'z' });
  assert.equal(junk.status, 400);
});

test('verify: unpaid order is refused even with a correct signature', async () => {
  const o = await mk(); const pid = 'pay_unpaid0000001';
  const sig = crypto.createHmac('sha256', TEST.KEY_SECRET).update(o.order_id + '|' + pid).digest('hex');
  const r = await post('/api/verify', { razorpay_order_id: o.order_id, razorpay_payment_id: pid, razorpay_signature: sig });
  assert.equal(r.status, 402);
});

test('verify: a paid order from ANOTHER product on the shared Razorpay account is refused', async () => {
  await fetch(RZP + '/__put_order', { method: 'POST', body: JSON.stringify({ id: 'order_ornalens0001', amount: 350000, amount_paid: 350000, currency: 'INR', notes: { product: 'ornalens-credits' }, status: 'paid' }) });
  const pid = 'pay_ornalens00001';
  const sig = crypto.createHmac('sha256', TEST.KEY_SECRET).update('order_ornalens0001|' + pid).digest('hex');
  const r = await post('/api/verify', { razorpay_order_id: 'order_ornalens0001', razorpay_payment_id: pid, razorpay_signature: sig });
  assert.equal(r.status, 403);
});

test('verify: manual-capture (authorized) payments are captured then accepted', async () => {
  const o = await mk(); const p = await pay(o.order_id, { authorizeOnly: true });
  const r = await post('/api/verify', { razorpay_order_id: p.razorpay_order_id, razorpay_payment_id: p.razorpay_payment_id, razorpay_signature: p.razorpay_signature });
  assert.equal(r.status, 200);
});

test('download: needs a valid token; serves the exact PDF; expired/tampered tokens refused', { skip: !hasPack && 'private/pack.enc missing' }, async () => {
  const o = await mk(); const p = await pay(o.order_id);
  const v = await (await post('/api/verify', { razorpay_order_id: p.razorpay_order_id, razorpay_payment_id: p.razorpay_payment_id, razorpay_signature: p.razorpay_signature })).json();
  assert.equal((await fetch(SITE + '/api/download')).status, 403);
  assert.equal((await fetch(SITE + '/api/download?t=' + v.token + 'x')).status, 403);
  const ok = await fetch(SITE + '/api/download?t=' + encodeURIComponent(v.token));
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get('content-type'), 'application/pdf');
  const buf = Buffer.from(await ok.arrayBuffer());
  assert.equal(buf.subarray(0, 5).toString(), '%PDF-');
  const src = path.join(__dirname, '..', 'MONEY AUDIT TOOLKIT', 'AI_Money_Audit_Prompt_Pack_Gmail_First.pdf');
  if (fs.existsSync(src)) assert.equal(crypto.createHash('sha256').update(buf).digest('hex'), crypto.createHash('sha256').update(fs.readFileSync(src)).digest('hex'));
  // forge an expired token with the real secret
  const L = require('../api/_lib'); process.env.TOKEN_TTL_DAYS = '-1';
  const expired = L.signToken('order_x', 'pay_x', 1900, 'USD'); delete process.env.TOKEN_TTL_DAYS;
  assert.equal((await fetch(SITE + '/api/download?t=' + encodeURIComponent(expired))).status, 403);
});

const hook = (event, order, payment, sigOverride) => {
  const raw = JSON.stringify({ event, payload: { order: { entity: order }, payment: { entity: payment } } });
  const sig = sigOverride || crypto.createHmac('sha256', TEST.WEBHOOK).update(raw).digest('hex');
  return fetch(SITE + '/api/razorpay-webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Razorpay-Signature': sig }, body: raw });
};

test('webhook: bad signature rejected; other products ignored; our paid order emails the buyer', async () => {
  const o = await mk(); const p = await pay(o.order_id, { email: 'buyer@example.com' });
  assert.equal((await hook('order.paid', p.order, p.payment, 'f'.repeat(64))).status, 400);
  const before = (await (await fetch(RZP + '/__emails')).json()).length;
  const other = await hook('order.paid', { id: 'order_z', notes: { product: 'ornalens-credits' } }, { id: 'pay_z', email: 'x@y.com' });
  assert.equal((await other.json()).ignored, 'not_our_product');
  assert.equal((await (await fetch(RZP + '/__emails')).json()).length, before);
  const good = await hook('order.paid', p.order, p.payment);
  assert.equal(good.status, 200); assert.equal((await good.json()).emailed, true);
  const sent = await (await fetch(RZP + '/__emails')).json();
  assert.equal(sent.length, before + 1);
  assert.deepEqual(sent[sent.length - 1].to, ['buyer@example.com']);
  assert.match(sent[sent.length - 1].html, /\/finance\/thanks#t=/);
  const ev = await hook('payment.failed', p.order, p.payment);
  assert.equal((await ev.json()).ignored, 'event');
});

test('the encrypted pack is not readable without the key', { skip: !hasPack && 'private/pack.enc missing' }, () => {
  const enc = fs.readFileSync(path.join(__dirname, '..', 'private', 'pack.enc'));
  assert.notEqual(enc.subarray(28, 33).toString(), '%PDF-');
  assert.ok(!enc.includes(Buffer.from('%PDF-')));
});
