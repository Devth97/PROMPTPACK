'use strict';
/* Multi-product checkout and delivery against the real /api handlers and a MOCK Razorpay (no real charges). */
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { TEST, startMockRazorpay, startSite } = require('./dev-server');

const ROOT = path.join(__dirname, '..');
const SITE = 'http://localhost:4392', RZP = 'http://localhost:4393';
const delivery = require('../api/_products.json');
const products = require('../catalog/products.json');
const editions = require('../catalog/editions.json');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const sha = buf => crypto.createHash('sha256').update(buf).digest('hex');
let mock, servers = [];

test.before(async () => {
  mock = await startMockRazorpay(4393); servers.push(mock.server);
  servers.push(await startSite(4392, 4393));
});
test.after(() => servers.forEach(s => s.close()));

const post = (p, body, headers) => fetch(SITE + p, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const order = async (product, extra = {}) => { const r = await post('/api/create-order', { product, ...extra }); return { status: r.status, body: await r.json() }; };
const pay = async (id, opts) => (await fetch(RZP + '/__pay/' + id, { method: 'POST', body: JSON.stringify(opts || {}) })).json();
const putOrder = o => fetch(RZP + '/__put_order', { method: 'POST', body: JSON.stringify(o) });
const putPayment = p => fetch(RZP + '/__put_payment', { method: 'POST', body: JSON.stringify(p) });
const sign = (o, p) => crypto.createHmac('sha256', TEST.KEY_SECRET).update(o + '|' + p).digest('hex');
const verify = (p, product) => post('/api/verify', { razorpay_order_id: p.razorpay_order_id, razorpay_payment_id: p.razorpay_payment_id, razorpay_signature: p.razorpay_signature, product });
const purchase = async (slug, plan) => { const o = await order(slug, plan ? { plan } : {}); const p = await pay(o.body.order_id); return (await (await verify(p, slug)).json()).token; };

test('delivery metadata: eleven products match catalog prices, edition hashes and encrypted files', () => {
  assert.equal(delivery.length, 11);
  for (const p of products) {
    const d = delivery.find(x => x.slug === p.slug), e = editions.find(x => x.slug === p.slug);
    assert.ok(d, p.slug);
    assert.equal(d.amount, p.price * 100, p.slug);
    assert.equal(d.currency, 'USD');
    assert.equal(d.amount_inr, p.price_inr * 100, `${p.slug}: INR price enables UPI`);
    assert.equal(d.sha256, e.sha256, `${p.slug}: re-run prepare-checkout after rebuilding bundles`);
    assert.equal(d.filename, p.slug + '.zip');
    const enc = fs.readFileSync(path.join(ROOT, 'private', d.file));
    assert.equal(enc.length, d.bytes + 28, `${p.slug}: stale encrypted file`);
    assert.notEqual(enc.subarray(28, 32).toString('latin1'), 'PK\x03\x04', 'archive must not be stored in plaintext');
    assert.ok(d.bytes < 4_000_000, `${p.slug}: exceeds single-response download size`);
  }
});

test('create-order: every product uses its server USD and INR prices; client prices and unknown plans are refused or ignored', async () => {
  for (const d of delivery) {
    const r = await order(d.slug, { amount: 1, currency: 'INR' });
    assert.equal(r.status, 200, d.slug);
    assert.equal(r.body.amount, d.amount); assert.equal(r.body.currency, 'USD'); assert.equal(r.body.product, d.slug);
    assert.equal(mock.orders.get(r.body.order_id).notes.product, d.id);
    assert.ok(!JSON.stringify(r.body).includes(TEST.KEY_SECRET));
    const inr = await order(d.slug, { plan: 'inr', amount: 1, currency: 'USD' });
    assert.equal(inr.status, 200, d.slug);
    assert.equal(inr.body.amount, d.amount_inr); assert.equal(inr.body.currency, 'INR');
    assert.equal(mock.orders.get(inr.body.order_id).notes.price_plan, 'inr');
    for (const plan of ['eur', '', null, 'INR ']) assert.equal((await order(d.slug, { plan })).status, 400, JSON.stringify(plan));
  }
});

test('create-order: unknown or malformed products are rejected; Finance default is unchanged', async () => {
  for (const product of ['nope', '', null, ['carousel-studio'], { slug: 'carousel-studio' }, '../pack']) assert.equal((await order(product)).status, 400, JSON.stringify(product));
  const finance = await post('/api/create-order', {});
  const body = await finance.json();
  assert.equal(body.amount, 1900); assert.equal(mock.orders.get(body.order_id).notes.product, 'ai-money-audit-prompt-pack');
});

test('create-order: an unreadable archive or missing key is refused before any order exists', async () => {
  const key = process.env.DOWNLOAD_FILE_KEY, before = mock.orders.size;
  try {
    process.env.DOWNLOAD_FILE_KEY = '0'.repeat(64);
    assert.equal((await order('carousel-studio')).status, 503);
    process.env.DOWNLOAD_FILE_KEY = '';
    assert.equal((await order('carousel-studio')).status, 503);
  } finally { process.env.DOWNLOAD_FILE_KEY = key; }
  assert.equal(mock.orders.size, before, 'no Razorpay order may be created');
});

test('purchase flow: every product downloads its exact ZIP in both currencies with the right name and receipt', async () => {
  for (const [d, plan] of delivery.flatMap(d => [[d, 'usd'], [d, 'inr']])) {
    const token = await purchase(d.slug, plan);
    assert.ok(token, `${d.slug} ${plan}`);
    const receipt = await (await post('/api/receipt', { token })).json();
    assert.deepEqual([receipt.product, receipt.amount, receipt.currency, receipt.filename], [d.slug, plan === 'inr' ? d.amount_inr : d.amount, plan === 'inr' ? 'INR' : 'USD', d.filename]);
    const r = await fetch(SITE + '/api/download?t=' + encodeURIComponent(token));
    assert.equal(r.status, 200, d.slug);
    assert.equal(r.headers.get('content-type'), 'application/zip');
    assert.equal(r.headers.get('content-disposition'), `attachment; filename="${d.filename}"`);
    const zip = Buffer.from(await r.arrayBuffer());
    assert.equal(zip.subarray(0, 4).toString('latin1'), 'PK\x03\x04');
    assert.equal(sha(zip), d.sha256);
    const source = path.join(ROOT, 'product-build', 'editions', d.filename);
    if (fs.existsSync(source)) assert.equal(sha(zip), sha(fs.readFileSync(source)));
  }
});

test('verify: wrong product, underpaid, refunded, mismatched payment and wrong-price orders get no entitlement', async () => {
  const o = await order('carousel-studio'); const p = await pay(o.body.order_id);
  assert.equal((await verify(p, 'pixel-brand-kit')).status, 403, 'requested product must match the order');

  const studio = delivery.find(d => d.slug === 'carousel-studio');
  const base = { amount: studio.amount, currency: 'USD', notes: { product: studio.id }, status: 'paid' };
  const cases = [
    ['underpaid', { ...base, id: 'order_underpaid01', amount_paid: studio.amount - 100 }, { status: 'captured', amount: studio.amount }, 402],
    ['refunded', { ...base, id: 'order_refunded001', amount_paid: studio.amount }, { status: 'captured', amount: studio.amount, amount_refunded: studio.amount }, 402],
    ['payment for another order', { ...base, id: 'order_mismatch001', amount_paid: studio.amount }, { status: 'captured', amount: studio.amount, order_id: 'order_someoneelse' }, 402],
    ['order below server price', { ...base, id: 'order_cheapprice1', amount: 100, amount_paid: 100 }, { status: 'captured', amount: 100 }, 403],
    ['INR order below server price', { ...base, id: 'order_cheapinr001', amount: 100, currency: 'INR', amount_paid: 100 }, { status: 'captured', amount: 100, currency: 'INR' }, 403],
    ['USD amount labelled as INR', { ...base, id: 'order_swapcurr001', currency: 'INR', amount_paid: studio.amount }, { status: 'captured', amount: studio.amount, currency: 'INR' }, 403]
  ];
  for (const [label, ord, payment, status] of cases) {
    const pid = 'pay_' + ord.id.slice(6);
    await putOrder(ord);
    await putPayment({ id: pid, order_id: ord.id, currency: ord.currency, ...payment });
    const r = await post('/api/verify', { razorpay_order_id: ord.id, razorpay_payment_id: pid, razorpay_signature: sign(ord.id, pid), product: 'carousel-studio' });
    assert.equal(r.status, status, label);
    assert.ok(!(await r.json()).token, label);
  }
});

test('tokens: product-bound, tamper-proof and expiring; legacy Finance links still download the PDF', async () => {
  const L = require('../api/_lib');
  const token = await purchase('lyric-visuals');
  assert.equal((await fetch(SITE + '/api/download?t=' + encodeURIComponent(token + 'x'))).status, 403);
  // Swapping the product claim breaks the signature.
  const [body, sig] = token.split('.');
  const claims = JSON.parse(Buffer.from(body, 'base64url').toString());
  const swapped = Buffer.from(JSON.stringify({ ...claims, product: 'promptpack-motion-with-code' })).toString('base64url') + '.' + sig;
  assert.equal((await fetch(SITE + '/api/download?t=' + encodeURIComponent(swapped))).status, 403);
  // A validly signed token for a product we do not sell is refused.
  assert.equal((await fetch(SITE + '/api/download?t=' + encodeURIComponent(L.signToken('order_x', 'pay_x', 100, 'USD', 'unknown-product')))).status, 403);
  process.env.TOKEN_TTL_DAYS = '-1';
  const expired = L.signToken('order_x', 'pay_x', 900, 'USD', 'promptpack-lyric-visuals');
  delete process.env.TOKEN_TTL_DAYS;
  assert.equal((await fetch(SITE + '/api/download?t=' + encodeURIComponent(expired))).status, 403);
  assert.equal((await post('/api/receipt', { token: expired })).status, 403);
  // Finance tokens issued before the product claim existed.
  const legacyBody = Buffer.from(JSON.stringify({ o: 'order_legacy', p: 'pay_legacy', a: 1900, c: 'USD', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  const legacy = legacyBody + '.' + L.hmac(process.env.DOWNLOAD_SIGNING_SECRET, legacyBody).toString('base64url');
  const r = await fetch(SITE + '/api/download?t=' + encodeURIComponent(legacy));
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'application/pdf');
  assert.equal(Buffer.from(await r.arrayBuffer()).subarray(0, 5).toString(), '%PDF-');
});

const hook = (event, ord, payment) => {
  const raw = JSON.stringify({ event, payload: { order: { entity: ord }, payment: { entity: payment } } });
  return fetch(SITE + '/api/razorpay-webhook', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Razorpay-Signature': crypto.createHmac('sha256', TEST.WEBHOOK).update(raw).digest('hex') }, body: raw });
};

test('webhook: product-specific backup email; incomplete or mispriced orders are acknowledged without email', async () => {
  const o = await order('youtube-production'); const p = await pay(o.body.order_id, { email: 'maker@example.com' });
  const count = async () => (await (await fetch(RZP + '/__emails')).json()).length;
  const before = await count();
  const ok = await hook('order.paid', p.order, p.payment);
  assert.equal(ok.status, 200); assert.equal((await ok.json()).emailed, true);
  const sent = (await (await fetch(RZP + '/__emails')).json()).at(-1);
  assert.deepEqual(sent.to, ['maker@example.com']);
  assert.equal(sent.reply_to, undefined, 'replies go to the EMAIL_FROM inbox by default');
  assert.match(sent.subject, /YouTube Production Planner/);
  const link = sent.html.match(/\/checkout\/thanks\/#t=([^"]+)/);
  assert.ok(link, 'links to the new-product download page');
  assert.equal((await (await post('/api/receipt', { token: link[1] })).json()).product, 'youtube-production');

  const refunded = await hook('order.paid', p.order, { ...p.payment, amount_refunded: p.payment.amount });
  assert.equal(refunded.status, 200); assert.equal((await refunded.json()).ignored, 'payment_not_completed');
  const cheap = await hook('order.paid', { ...p.order, amount: 100, amount_paid: 100 }, { ...p.payment, amount: 100 });
  assert.equal(cheap.status, 200); assert.equal((await cheap.json()).ignored, 'wrong_price');
  const inrOrder = await order('youtube-production', { plan: 'inr' }); const inrPay = await pay(inrOrder.body.order_id, { email: 'india@example.com' });
  const inrHook = await hook('order.paid', inrPay.order, inrPay.payment);
  assert.equal((await inrHook.json()).emailed, true, 'INR (UPI) orders get the backup email too');
  assert.equal(await count(), before + 2, 'only the valid orders are emailed');
});

test('private sources and buyer archives are never served or deployed statically', async () => {
  for (const p of ['/', '/checkout/carousel-studio/', '/checkout/thanks/']) assert.equal((await fetch(SITE + p)).status, 200, p);
  for (const p of ['/private/products/carousel-studio.enc', '/private/pack.enc', '/product-build/editions/carousel-studio.zip', '/catalog/editions.json', '/api/_products.json', '/api/_lib'])
    assert.equal((await fetch(SITE + p)).status, 404, p);
  const config = JSON.parse(read('vercel.json'));
  assert.ok(config.redirects.some(r => r.source === '/private/:path*'), 'static /private/ path is blocked on Vercel');
  assert.match(config.functions['api/download.js'].includeFiles, /private\//);
  const ignore = read('.vercelignore');
  for (const entry of ['product-build/', 'catalog/', 'private/catalog/', '*.zip', '*.pdf', '.env*']) assert.ok(ignore.split(/\r?\n/).includes(entry), entry);
});

test('checkout pages: real prices, Razorpay route, noindex; product pages link to them', () => {
  for (const d of delivery) {
    const html = read(`checkout/${d.slug}/index.html`);
    const price = 'US$' + d.amount / 100, priceInr = '₹' + (d.amount_inr / 100).toLocaleString('en-IN');
    assert.ok(html.includes(`data-checkout="${d.slug}"`), d.slug);
    assert.ok(html.includes(`name="plan" value="inr"><b>Pay ${priceInr}</b><span>UPI`), `${d.slug}: UPI option`);
    assert.ok(html.includes(`name="plan" value="usd"><b>Pay ${price}</b>`), `${d.slug}: international card option`);
    assert.match(html, /<meta name="robots" content="noindex,follow">/);
    assert.match(html, /checkout\.razorpay\.com\/v1\/checkout\.js/);
    const productPage = read(`products/${d.slug}/index.html`);
    assert.ok(productPage.includes(`href="/checkout/${d.slug}/"`), `${d.slug}: product page links to checkout`);
    assert.ok(productPage.includes(price) && productPage.includes(priceInr), `${d.slug}: product page shows both prices`);
    assert.doesNotMatch(productPage, /US[0-9]|not (currently )?for sale|Price at launch|checkout has not opened/i);
  }
  const thanks = read('checkout/thanks/index.html');
  assert.match(thanks, /noindex,nofollow/);
  assert.doesNotMatch(thanks, /analytics\.js|fbevents|clarity/, 'download page loads no tracking scripts');
});
