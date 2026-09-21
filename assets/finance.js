/*
 * /finance analytics + Razorpay checkout wiring.
 * Loads AFTER the base Meta Pixel bootstrap in finance/index.html.
 *
 * Events from this page: PageView (bootstrap), ViewContent (once per load),
 * FinanceCheckoutClick + InitiateCheckout (when the checkout popup actually opens).
 * NEVER sent from here: Purchase — that fires only on /finance/thanks after the server has verified the payment.
 * Payloads are generic product/marketing fields only — never financial data.
 */
(function () {
  'use strict';
  var cfg = window.PP_FINANCE_CONFIG;
  if (!cfg) return;
  var P = cfg.PRODUCT;
  var isProd = cfg.PRODUCTION_HOSTS.indexOf(location.hostname) !== -1;
  var debug = /[?&]ppdebug=1/.test(location.search);

  function log(kind, name, data) {
    (window.__ppAnalyticsLog = window.__ppAnalyticsLog || []).push({ kind: kind, name: name, data: data });
    if (!isProd || debug) try { console.info('[pp-analytics]', kind, name, data || ''); } catch (e) {}
  }
  function fbTrack(kind, name, data) {
    log(kind, name, data);
    if (isProd && typeof window.fbq === 'function') window.fbq(kind, name, data);
  }
  function clarityCall() {
    try { if (typeof window.clarity === 'function') window.clarity.apply(null, arguments); } catch (e) {}
  }

  /* ---------- UTM / click-id attribution (kept locally; session-scoped) ---------- */
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
  var attribution = {};
  try {
    var stored = JSON.parse(sessionStorage.getItem('pp_attr') || '{}');
    var qs = new URLSearchParams(location.search);
    KEYS.forEach(function (k) {
      var v = qs.get(k);
      if (v) attribution[k] = v.slice(0, 200);
      else if (stored[k]) attribution[k] = stored[k];
    });
    sessionStorage.setItem('pp_attr', JSON.stringify(attribution));
  } catch (e) { /* storage blocked: attribution simply isn't persisted */ }
  window.PP_ATTRIBUTION = attribution;
  KEYS.forEach(function (k) { if (attribution[k] && k !== 'fbclid') clarityCall('set', k, attribution[k]); });

  /* ---------- ViewContent: exactly once per page load ---------- */
  if (!window.__ppFinanceViewContent) {
    window.__ppFinanceViewContent = true;
    fbTrack('track', 'ViewContent', {
      content_name: P.name, content_type: 'product', content_ids: [P.id], value: P.value, currency: P.currency
    });
    clarityCall('event', 'finance_page_view');
  }

  /* ---------- Checkout (Razorpay popup, orders created + verified server-side) ---------- */
  var msgEl;
  function say(text) {
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.className = 'pay-msg';
      msgEl.setAttribute('role', 'status');
      document.body.appendChild(msgEl);
    }
    msgEl.textContent = text;
    msgEl.classList.add('show');
    clearTimeout(say.t);
    say.t = setTimeout(function () { msgEl.classList.remove('show'); }, 9000);
  }

  var rzpLoading;
  function loadRazorpay() {
    if (window.Razorpay) return Promise.resolve();
    if (rzpLoading) return rzpLoading;
    rzpLoading = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = resolve;
      s.onerror = function () { rzpLoading = null; reject(new Error('script')); };
      document.head.appendChild(s);
    });
    return rzpLoading;
  }

  function postJson(url, body) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, body: j }; }); });
  }

  var busy = false;
  function setBusy(on) {
    busy = on;
    Array.prototype.forEach.call(document.querySelectorAll('[data-finance-cta]'), function (b) {
      b.classList.toggle('is-busy', on);
      b.setAttribute('aria-busy', on ? 'true' : 'false');
    });
  }

  function onPaid(order, resp) {
    say('Payment received — verifying…');
    setBusy(true);
    postJson('/api/verify', {
      razorpay_order_id: resp.razorpay_order_id,
      razorpay_payment_id: resp.razorpay_payment_id,
      razorpay_signature: resp.razorpay_signature
    }).then(function (r) {
      if (!r.ok || !r.body.token) throw new Error('verify');
      try { sessionStorage.setItem('pp_checkout_ok', r.body.order_id); } catch (e) { /* purchase event may then be skipped — safe direction */ }
      location.href = '/finance/thanks#t=' + r.body.token;
    }).catch(function () {
      setBusy(false);
      say('We got your payment but could not confirm it just now. Your download link will be emailed to you — or contact us with reference ' + (resp.razorpay_payment_id || '') + '.');
    });
  }

  function openCheckout(order) {
    var value = order.amount / 100;
    fbTrack('trackCustom', 'FinanceCheckoutClick', { product: P.name, content_ids: [P.id], value: value, currency: order.currency });
    fbTrack('track', 'InitiateCheckout', { content_name: P.name, content_type: 'product', content_ids: [P.id], value: value, currency: order.currency });
    clarityCall('event', 'finance_checkout_click');
    var rz = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: 'PromptPack',
      description: P.name,
      theme: { color: '#F598F2' },
      handler: function (resp) { onPaid(order, resp); },
      modal: { ondismiss: function () { setBusy(false); } }
    });
    rz.on && rz.on('payment.failed', function () { say('Payment did not go through. You have not been charged for a failed payment — please try again.'); });
    setBusy(false);
    rz.open();
  }

  function beginCheckout(paymentPlan) {
    if (busy) return;
    setBusy(true);
    postJson('/api/create-order', { plan: paymentPlan, attribution: attribution })
      .then(function (r) {
        if (r.status === 503) throw new Error('not_ready');
        if (!r.ok || !r.body.order_id) throw new Error('order');
        return loadRazorpay().then(function () { return r.body; });
      })
      .then(openCheckout)
      .catch(function (err) {
        setBusy(false);
        say(err && err.message === 'not_ready'
          ? 'Checkout is not available just yet — please check back shortly.'
          : 'Could not start checkout. Please check your connection and try again.');
      });
  }

  var paymentChoice = document.getElementById('paymentChoice');
  function closePaymentChoice() {
    if (!paymentChoice) return;
    if (typeof paymentChoice.close === 'function') paymentChoice.close();
    else paymentChoice.removeAttribute('open');
  }
  function startCheckout(e) {
    e.preventDefault();
    if (busy) return;
    if (!paymentChoice || paymentChoice.open) return;
    if (typeof paymentChoice.showModal === 'function') paymentChoice.showModal();
    else paymentChoice.setAttribute('open', '');
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-finance-cta]'), function (b) {
    b.setAttribute('href', '#checkout');
    b.addEventListener('click', startCheckout);
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-finance-plan]'), function (b) {
    b.addEventListener('click', function () {
      closePaymentChoice();
      beginCheckout(b.getAttribute('data-finance-plan'));
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-finance-close]'), function (b) {
    b.addEventListener('click', closePaymentChoice);
  });

  /* ---------- Mobile sticky CTA: show once the hero has scrolled away ---------- */
  var hero = document.getElementById('hero');
  var bar = document.getElementById('stickyBar');
  if (hero && bar) {
    var toggleBar = function () { bar.classList.toggle('show', hero.getBoundingClientRect().bottom < 0); };
    window.addEventListener('scroll', toggleBar, { passive: true });
    window.addEventListener('resize', toggleBar);
    toggleBar();
  }
})();
