'use strict';
const L = require('./_lib');

const ID = /^[A-Za-z0-9_]{6,40}$/;

/**
 * POST /api/verify — called by the browser after the Razorpay popup reports success.
 * 1. Checks the payment signature (HMAC-SHA256 of "order_id|payment_id" with the key secret).
 * 2. Confirms with Razorpay that the order is OURS (notes.product) and actually paid/captured.
 *    (The Razorpay account is shared with other businesses, so a valid signature alone is not enough.)
 * 3. Returns a signed, expiring download token.
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') return L.send(res, 405, { error: 'method_not_allowed' });
  if (!L.sameOrigin(req)) return L.send(res, 403, { error: 'forbidden' });
  if (L.missing(['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'DOWNLOAD_SIGNING_SECRET']).length) {
    return L.send(res, 503, { error: 'checkout_not_configured' });
  }

  const b = await L.readJson(req);
  const orderId = b.razorpay_order_id, paymentId = b.razorpay_payment_id, sig = b.razorpay_signature;
  if (!ID.test(String(orderId)) || !ID.test(String(paymentId)) || !/^[a-f0-9]{64}$/.test(String(sig))) {
    return L.send(res, 400, { error: 'invalid_request' });
  }

  const expected = L.hmac(L.env('RAZORPAY_KEY_SECRET'), orderId + '|' + paymentId).toString('hex');
  if (!L.safeEqual(sig, expected)) return L.send(res, 400, { error: 'bad_signature' });

  const o = await L.rzp('GET', '/v1/orders/' + orderId);
  if (!o.ok) return L.send(res, 502, { error: 'order_lookup_failed' });
  const product=L.catalog.byId(o.data.notes && o.data.notes.product);
  if (!product) return L.send(res, 403, { error: 'wrong_product' });
  if(b.product!==undefined && b.product!==product.slug)return L.send(res,403,{error:'wrong_product'});
  if(product!==L.catalog.finance && (o.data.amount!==product.amount || o.data.currency!==product.currency))return L.send(res,403,{error:'wrong_price'});

  let order = o.data;
  if (order.status !== 'paid') {
    // Manual-capture accounts leave the payment "authorized": capture it, then re-check the order.
    const p = await L.rzp('GET', '/v1/payments/' + paymentId);
    if (p.ok && p.data.order_id === orderId && p.data.status === 'authorized') {
      await L.rzp('POST', '/v1/payments/' + paymentId + '/capture', { amount: p.data.amount, currency: p.data.currency });
      const again = await L.rzp('GET', '/v1/orders/' + orderId);
      if (again.ok) order = again.data;
    }
  }
  if (order.status !== 'paid' || order.amount_paid<order.amount) return L.send(res, 402, { error: 'payment_not_completed' });
  const captured=await L.rzp('GET','/v1/payments/'+paymentId);
  if(!captured.ok || captured.data.order_id!==orderId || captured.data.status!=='captured' || captured.data.amount!==order.amount || captured.data.currency!==order.currency || captured.data.amount_refunded>0)return L.send(res,402,{error:'payment_not_completed'});

  return L.send(res, 200, {
    ok: true,
    order_id: orderId,
    amount: order.amount_paid || order.amount,
    currency: order.currency,
    product: product.slug,
    product_name: product.name,
    thanks: product.thanks,
    token: L.signToken(orderId, paymentId, order.amount_paid || order.amount, order.currency, product.id),
  });
};
