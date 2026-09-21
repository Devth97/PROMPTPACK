'use strict';
const crypto = require('crypto');
const L = require('./_lib');

const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

/** POST /api/create-order — creates a Razorpay order server-side so the price cannot be edited in the browser. */
module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.send(res, 405, { error: 'method_not_allowed' });
  if (!L.sameOrigin(req)) return L.send(res, 403, { error: 'forbidden' });
  if (L.missing(['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'DOWNLOAD_SIGNING_SECRET']).length) {
    return L.send(res, 503, { error: 'checkout_not_configured' });
  }

  const body = await L.readJson(req);
  const notes = { product: L.PRODUCT_ID };
  const attr = (body && body.attribution) || {};
  ATTR_KEYS.forEach((k) => { if (typeof attr[k] === 'string' && attr[k]) notes[k] = attr[k].slice(0, 100); });

  const { amount, currency } = L.price();
  // Razorpay minimum is 100 paise (1 INR) / 100 cents-equivalents; a bad PRICE_AMOUNT is a server config error.
  if (!Number.isInteger(amount) || amount < 100) {
    console.error('create-order: PRICE_AMOUNT must be an integer >= 100 (smallest currency unit)');
    return L.send(res, 500, { error: 'invalid_price_config' });
  }
  const r = await L.rzp('POST', '/v1/orders', {
    amount,
    currency,
    receipt: 'pp_' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex'),
    notes,
  });
  if (r.status === 401) {
    console.error('create-order: Razorpay rejected the API keys (check RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)');
    return L.send(res, 401, { error: 'razorpay_auth_failed' });
  }
  if (!r.ok || !r.data.id) {
    console.error('create-order failed', r.status, r.data && r.data.error && r.data.error.description);
    return L.send(res, 500, { error: 'order_failed' });
  }
  // key_id is the PUBLIC Razorpay key; the secret never leaves the server.
  return L.send(res, 200, {
    key_id: L.env('RAZORPAY_KEY_ID'),
    order_id: r.data.id,
    amount: r.data.amount,
    currency: r.data.currency,
  });
};
