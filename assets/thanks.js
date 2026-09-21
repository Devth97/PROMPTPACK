/*
 * /finance/thanks — shows the download link and fires the Meta Purchase event.
 *
 * Purchase fires ONLY when ALL of these hold:
 *   1. the signed token is valid and unexpired (the server verified the payment before issuing it),
 *   2. the buyer arrived straight from checkout in this browser session (pp_checkout_ok === order id) —
 *      so opening an emailed link later, or on another device, never counts as a second purchase,
 *   3. this order has not already been reported from this browser.
 * eventID = Razorpay order id, so a future server-side CAPI Purchase can deduplicate against it.
 */
(function () {
  'use strict';
  var cfg = window.PP_FINANCE_CONFIG || { PRODUCT: {}, PRODUCTION_HOSTS: [] };
  var P = cfg.PRODUCT;
  var isProd = cfg.PRODUCTION_HOSTS.indexOf(location.hostname) !== -1;
  function log(kind, name, data) {
    (window.__ppAnalyticsLog = window.__ppAnalyticsLog || []).push({ kind: kind, name: name, data: data });
    if (!isProd) try { console.info('[pp-analytics]', kind, name, data || ''); } catch (e) {}
  }

  var tok = null;
  try { tok = sessionStorage.getItem('pp_tok'); } catch (e) {}
  var claims = null;
  try {
    var body = String(tok || '').split('.')[0];
    claims = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
  } catch (e) { claims = null; }

  var ok = claims && claims.o && claims.exp && Date.now() / 1000 < claims.exp;
  document.getElementById(ok ? 'ok' : 'bad').hidden = false;
  if (!ok) return;

  var amount = (claims.a || 0) / 100;
  var money = amount + ' ' + claims.c;
  try { money = new Intl.NumberFormat('en', { style: 'currency', currency: claims.c }).format(amount); } catch (e) {}
  document.getElementById('paid').textContent = money + ' paid';
  document.getElementById('ref').textContent = claims.p || claims.o;
  document.getElementById('exp').textContent = 'on ' + new Date(claims.exp * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  document.getElementById('dl').setAttribute('href', '/api/download?t=' + encodeURIComponent(tok));

  var fromCheckout = false, already = false;
  try {
    fromCheckout = sessionStorage.getItem('pp_checkout_ok') === claims.o;
    already = !!localStorage.getItem('pp_purchase_' + claims.o);
  } catch (e) { fromCheckout = false; }

  if (fromCheckout && !already) {
    var data = {
      content_name: P.name, content_type: 'product', content_ids: [P.id],
      value: amount, currency: claims.c
    };
    log('track', 'Purchase', data);
    if (isProd && typeof window.fbq === 'function') window.fbq('track', 'Purchase', data, { eventID: claims.o });
    try { if (typeof window.clarity === 'function') window.clarity('event', 'finance_purchase'); } catch (e) {}
    try {
      localStorage.setItem('pp_purchase_' + claims.o, '1');
      sessionStorage.removeItem('pp_checkout_ok');
    } catch (e) {}
  }
})();
