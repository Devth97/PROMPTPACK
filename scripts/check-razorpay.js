'use strict';
/*
 * Verifies your Razorpay API keys against the REAL Razorpay API (test keys create test orders, no money moves).
 *   node scripts/check-razorpay.js            -> INR 100 paise order (always allowed)
 *   node scripts/check-razorpay.js USD 1900   -> tries your real site price/currency (USD needs international payments enabled)
 * Reads RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET from the environment or .env.local. Never prints the secret.
 */
const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(f)) fs.readFileSync(f, 'utf8').split(/\r?\n/).forEach((l) => {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
});
const id = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
if (!id || !secret) { console.error('Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (env or .env.local).'); process.exit(1); }
const currency = (process.argv[2] || 'INR').toUpperCase();
const amount = parseInt(process.argv[3] || '100', 10);
console.log('Key mode:', id.startsWith('rzp_test_') ? 'TEST' : id.startsWith('rzp_live_') ? 'LIVE (real account!)' : 'unknown');
(async () => {
  const r = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(id + ':' + secret).toString('base64'), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, currency, receipt: 'check_' + Date.now().toString(36), notes: { product: 'ai-money-audit-prompt-pack', check: 'true' } }),
  });
  const j = await r.json().catch(() => ({}));
  console.log('HTTP', r.status, r.ok ? '-> order ' + j.id + ' (' + j.amount + ' ' + j.currency + ', status ' + j.status + ')' : '-> ' + JSON.stringify(j.error || j));
  process.exit(r.ok ? 0 : 2);
})();
