/*
 * /finance analytics + checkout wiring.
 * Loads AFTER the base Meta Pixel bootstrap in finance/index.html.
 *
 * Events sent from this page: PageView (bootstrap), ViewContent, FinanceCheckoutClick.
 * Deliberately NOT sent: Purchase, InitiateCheckout (owned by the checkout/payment provider — see docs/meta-tracking.md).
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

  // fbq exists in prod (real pixel) and elsewhere (stub from bootstrap) — guard anyway.
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
  // Clarity tags (non-blocking). fbclid is skipped: high-cardinality, adds nothing to segmentation.
  KEYS.forEach(function (k) { if (attribution[k] && k !== 'fbclid') clarityCall('set', k, attribution[k]); });

  /* ---------- ViewContent: exactly once per page load ---------- */
  if (!window.__ppFinanceViewContent) {
    window.__ppFinanceViewContent = true;
    fbTrack('track', 'ViewContent', {
      content_name: P.name,
      content_type: 'product',
      content_ids: [P.id],
      value: P.value,
      currency: P.currency
    });
    clarityCall('event', 'finance_page_view');
  }

  /* ---------- Purchase buttons: one config URL, one click event ---------- */
  var url = (cfg.GUMROAD_FINANCE_PRODUCT_URL || '').trim();
  // Gumroad-only: ?wanted=true opens its direct payment form (same pattern as the rest of the site).
  // Any other provider (e.g. Razorpay) gets the URL untouched. Attribution is intentionally NOT appended.
  var href = '';
  if (/^https:\/\//.test(url)) {
    href = url;
    if (/^https:\/\/([^\/]+\.)?gumroad\.com\//.test(url)) href += (url.indexOf('?') === -1 ? '?' : '&') + 'wanted=true';
  }

  var buttons = document.querySelectorAll('[data-finance-cta]');
  Array.prototype.forEach.call(buttons, function (btn) {
    if (!href) {
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('href', '#checkout-unavailable');
      btn.classList.add('is-pending');
      btn.addEventListener('click', function (e) { e.preventDefault(); });
      return;
    }
    btn.setAttribute('href', href);
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener');
    btn.addEventListener('click', function () {
      fbTrack('trackCustom', 'FinanceCheckoutClick', {
        product: P.name,
        content_ids: [P.id],
        value: P.value,
        currency: P.currency
      });
      clarityCall('event', 'finance_checkout_click');
    });
  });
  if (!href) log('config', 'GUMROAD_FINANCE_PRODUCT_URL not set — CTAs disabled');

  /* ---------- Mobile sticky CTA: show once the hero has scrolled away ---------- */
  var hero = document.getElementById('hero');
  var bar = document.getElementById('stickyBar');
  if (hero && bar) {
    var toggleBar = function () {
      bar.classList.toggle('show', hero.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener('scroll', toggleBar, { passive: true });
    window.addEventListener('resize', toggleBar);
    toggleBar();
  }
})();
