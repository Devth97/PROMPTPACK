'use strict';
/*
 * Local/test harness: serves the static site + the real /api handlers, backed by a MOCK Razorpay API
 * and a mock email API. No real keys or network needed.
 *
 *   node tests/dev-server.js           -> site on http://localhost:4180 (mock Razorpay on :4181)
 *
 * Mock helpers (mock Razorpay server):
 *   POST /__pay/<order_id>   marks the order paid and returns { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *   GET  /__emails           list of "sent" emails
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const TEST = { KEY_ID: 'rzp_test_TESTKEYID', KEY_SECRET: 'test_key_secret_value', WEBHOOK: 'test_webhook_secret' };

function loadEnvLocal() {
  const f = path.join(ROOT, '.env.local'); const o = {};
  if (fs.existsSync(f)) fs.readFileSync(f, 'utf8').split(/\r?\n/).forEach((l) => { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) o[m[1]] = m[2]; });
  return o;
}

function startMockRazorpay(port) {
  const orders = new Map(); const payments = new Map(); const emails = [];
  const server = http.createServer(async (req, res) => {
    const chunks = []; for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf8');
    const json = (s, o) => { res.statusCode = s; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
    const url = new URL(req.url, 'http://x'); const p = url.pathname;
    if (p !== '/emails' && !p.startsWith('/__')) {
      const want = 'Basic ' + Buffer.from(TEST.KEY_ID + ':' + TEST.KEY_SECRET).toString('base64');
      if (req.headers.authorization !== want) return json(401, { error: { description: 'bad auth' } });
    }
    if (req.method === 'POST' && p === '/v1/orders') {
      const b = JSON.parse(raw); const id = 'order_' + crypto.randomBytes(7).toString('hex');
      const o = { id, amount: b.amount, amount_paid: 0, currency: b.currency, receipt: b.receipt, notes: b.notes || {}, status: 'created' };
      orders.set(id, o); return json(200, o);
    }
    let m = p.match(/^\/v1\/orders\/([\w]+)$/);
    if (req.method === 'GET' && m) return orders.has(m[1]) ? json(200, orders.get(m[1])) : json(404, { error: {} });
    m = p.match(/^\/v1\/payments\/([\w]+)$/);
    if (req.method === 'GET' && m) return payments.has(m[1]) ? json(200, payments.get(m[1])) : json(404, { error: {} });
    m = p.match(/^\/v1\/payments\/([\w]+)\/capture$/);
    if (req.method === 'POST' && m && payments.has(m[1])) {
      const pay = payments.get(m[1]); pay.status = 'captured'; const o = orders.get(pay.order_id); o.status = 'paid'; o.amount_paid = o.amount; return json(200, pay);
    }
    m = p.match(/^\/__pay\/([\w]+)$/);
    if (req.method === 'POST' && m) {
      const o = orders.get(m[1]); if (!o) return json(404, {});
      const opts = raw ? JSON.parse(raw) : {};
      const pid = 'pay_' + crypto.randomBytes(7).toString('hex');
      payments.set(pid, { id: pid, order_id: o.id, amount: o.amount, currency: o.currency, status: opts.authorizeOnly ? 'authorized' : 'captured', email: opts.email || 'buyer@example.com', contact: '+919999999999', notes: o.notes });
      if (!opts.authorizeOnly) { o.status = 'paid'; o.amount_paid = o.amount; }
      const sig = crypto.createHmac('sha256', TEST.KEY_SECRET).update(o.id + '|' + pid).digest('hex');
      return json(200, { razorpay_order_id: o.id, razorpay_payment_id: pid, razorpay_signature: sig, order: o, payment: payments.get(pid) });
    }
    if (req.method === 'POST' && p === '/emails') { emails.push(JSON.parse(raw)); return json(200, { id: 'email_1' }); }
    if (req.method === 'GET' && p === '/__emails') return json(200, emails);
    if (req.method === 'POST' && p === '/__put_order') { const o = JSON.parse(raw); orders.set(o.id, o); return json(200, o); }
    return json(404, { error: { description: 'not found' } });
  });
  return new Promise((r) => server.listen(port, () => r({ server, orders, payments, emails })));
}

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.mp4': 'video/mp4', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };

function startSite(port, rzpPort) {
  Object.assign(process.env, loadEnvLocal(), {
    RAZORPAY_KEY_ID: TEST.KEY_ID, RAZORPAY_KEY_SECRET: TEST.KEY_SECRET, RAZORPAY_WEBHOOK_SECRET: TEST.WEBHOOK,
    RAZORPAY_API_BASE: 'http://localhost:' + rzpPort, EMAIL_API_BASE: 'http://localhost:' + rzpPort + '/emails',
    RESEND_API_KEY: 're_test', EMAIL_FROM: 'PromptPack <test@example.com>', SITE_URL: 'http://localhost:' + port,
  });
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x'); let p = decodeURIComponent(url.pathname);
    if (p.startsWith('/api/')) {
      const name = p.slice(5).replace(/[^a-z0-9-]/g, '');
      const file = path.join(ROOT, 'api', name + '.js');
      if (name.startsWith('_') || !fs.existsSync(file)) { res.statusCode = 404; return res.end('not found'); }
      delete require.cache[require.resolve(file)];
      try { return await require(file)(req, res); } catch (e) { console.error(e); res.statusCode = 500; return res.end('error'); }
    }
    if (p.startsWith('/__testpay/')) { // test-only: lets a stubbed popup "pay" an order on the mock Razorpay
      const r = await fetch('http://localhost:' + rzpPort + '/__pay/' + p.split('/').pop(), { method: 'POST', body: '{}' });
      res.setHeader('Content-Type', 'application/json'); return res.end(await r.text());
    }
    let f = path.join(ROOT, p);
    if (!f.startsWith(ROOT)) { res.statusCode = 403; return res.end(); }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    else if (!fs.existsSync(f) && fs.existsSync(path.join(f, 'index.html'))) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) { res.statusCode = 404; return res.end('not found'); }
    res.setHeader('Content-Type', MIME[path.extname(f)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((r) => server.listen(port, () => r(server)));
}

module.exports = { TEST, startMockRazorpay, startSite };

if (require.main === module) {
  (async () => {
    await startMockRazorpay(4181); await startSite(4180, 4181);
    console.log('Site http://localhost:4180  |  mock Razorpay http://localhost:4181');
  })();
}
