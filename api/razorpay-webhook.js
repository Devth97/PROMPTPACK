'use strict';
const L = require('./_lib');

/**
 * POST /api/razorpay-webhook — backup delivery if the buyer closes the tab before the thank-you page.
 * Razorpay webhooks are ACCOUNT-WIDE (they also carry other businesses' payments), so we only act on
 * `order.paid` events whose order notes.product is ours. Everything else gets a 200 and is ignored.
 * Needs the RAW body to check the signature, so body parsing is disabled.
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.send(res, 405, { error: 'method_not_allowed' });
  if (L.missing(['RAZORPAY_WEBHOOK_SECRET', 'DOWNLOAD_SIGNING_SECRET']).length) return L.send(res, 503, { error: 'not_configured' });

  const raw = await L.readRaw(req);
  const sig = req.headers['x-razorpay-signature'] || '';
  const expected = L.hmac(L.env('RAZORPAY_WEBHOOK_SECRET'), raw).toString('hex');
  if (!sig || !L.safeEqual(sig, expected)) return L.send(res, 400, { error: 'bad_signature' });

  let evt;
  try { evt = JSON.parse(raw.toString('utf8')); } catch (e) { return L.send(res, 400, { error: 'bad_json' }); }
  if (evt.event !== 'order.paid') return L.send(res, 200, { ignored: 'event' });

  const order = evt.payload && evt.payload.order && evt.payload.order.entity;
  const payment = evt.payload && evt.payload.payment && evt.payload.payment.entity;
  if (!order || !payment || !order.notes || order.notes.product !== L.PRODUCT_ID) return L.send(res, 200, { ignored: 'not_our_product' });

  const email = payment.email;
  const apiKey = L.env('RESEND_API_KEY'), from = L.env('EMAIL_FROM');
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !apiKey || !from) {
    console.warn('webhook: paid order', order.id, '— email not sent (missing email address or RESEND_API_KEY/EMAIL_FROM)');
    return L.send(res, 200, { ok: true, emailed: false });
  }

  const token = L.signToken(order.id, payment.id, order.amount_paid || order.amount, order.currency);
  const link = L.siteUrl() + '/finance/thanks#t=' + token;
  const html = '<div style="font-family:Arial,sans-serif;max-width:520px">'
    + '<h2>Your ' + L.PRODUCT_NAME + ' is ready</h2>'
    + '<p>Thanks for your purchase. Download your pack here:</p>'
    + '<p><a href="' + link + '" style="background:#F598F2;color:#000;padding:12px 20px;text-decoration:none;font-weight:bold;border:2px solid #000">Download the pack</a></p>'
    + '<p style="font-size:13px;color:#555">This link expires in ' + (L.env('TOKEN_TTL_DAYS') || '7') + ' days. Payment reference: ' + payment.id
    + '. Need help or a new link? Reply to this email or contact us via promptpack.tech/contact.</p></div>';

  const r = await fetch(L.env('EMAIL_API_BASE') || 'https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [email], subject: 'Your ' + L.PRODUCT_NAME + ' download', html }),
  });
  if (!r.ok) { console.error('webhook: email provider error', r.status); return L.send(res, 502, { error: 'email_failed' }); } // Razorpay will retry
  return L.send(res, 200, { ok: true, emailed: true });
};

module.exports.config = { api: { bodyParser: false } };
