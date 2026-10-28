'use strict';
(() => {
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const params = new URLSearchParams(location.search);
  const production = ['promptpack.tech', 'www.promptpack.tech'].includes(location.hostname);
  let attribution = {};
  try { attribution = JSON.parse(sessionStorage.getItem('pp_attr') || '{}') || {}; } catch (_) {}
  attribution = Object.fromEntries(keys.filter(key => typeof attribution[key] === 'string').map(key => [key, attribution[key].slice(0, 100)]));
  // A newly tagged visit replaces the previous campaign, including absent fields.
  if (keys.some(key => params.has(key))) {
    attribution = Object.fromEntries(keys.filter(key => params.get(key)).map(key => [key, params.get(key).slice(0, 100)]));
  }
  try { sessionStorage.setItem('pp_attr', JSON.stringify(attribution)); } catch (_) {}

  // First page of this tab session and the kind of site that sent the visitor. Untagged search
  // visits only show up here; nothing personal is kept, only a path and a referrer class.
  const sourceOf = () => {
    if (keys.some(key => params.get(key))) return 'campaign';
    if (['fbclid', 'gclid', 'msclkid'].some(key => params.get(key))) return 'paid_click';
    let host = '';
    try { host = new URL(document.referrer).hostname.replace(/^www\./, ''); } catch (_) { return 'direct'; }
    if (!host || host === location.hostname.replace(/^www\./, '')) return 'direct';
    const is = list => list.some(domain => host === domain || host.endsWith('.' + domain));
    if (is(['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'claude.ai', 'gemini.google.com', 'copilot.microsoft.com', 'you.com', 'phind.com'])) return 'ai_assistant';
    if (/(^|\.)google\.[a-z.]+$/.test(host) || is(['bing.com', 'duckduckgo.com', 'search.yahoo.com', 'yandex.com', 'yandex.ru', 'baidu.com', 'ecosia.org', 'search.brave.com'])) return 'organic_search';
    if (is(['facebook.com', 'instagram.com', 't.co', 'x.com', 'twitter.com', 'linkedin.com', 'lnkd.in', 'youtube.com', 'reddit.com', 'pinterest.com', 'threads.net'])) return 'social';
    return 'referral';
  };
  let landing = null;
  try { landing = JSON.parse(sessionStorage.getItem('pp_landing') || 'null'); } catch (_) {}
  if (!landing || typeof landing.path !== 'string') {
    landing = {path: location.pathname.slice(0, 120), source: sourceOf()};
    try { sessionStorage.setItem('pp_landing', JSON.stringify(landing)); } catch (_) {}
  }
  const clarity = (...args) => { try { if (production && typeof window.clarity === 'function') window.clarity(...args); } catch (_) {} };
  clarity('set', 'landing_page', landing.path);
  clarity('set', 'traffic_source', landing.source);

  const debug = !production || /[?&]ppdebug=1/.test(location.search);
  const track = (name, data, custom = false, options) => {
    if (debug) { (window.__ppAnalyticsLog = window.__ppAnalyticsLog || []).push([name, data]); }
    clarity('event', name);
    try {
      if (production && typeof window.fbq === 'function') {
        window.fbq(custom ? 'trackCustom' : 'track', name, data, options);
        return true;
      }
    } catch (_) { /* Measurement must never interrupt checkout. */ }
    return false;
  };
  const purchases = new Set();
  window.promptpack = {
    attribution: () => ({...attribution}),
    landing: () => ({...landing}),
    track,
    // Called only with the server-verified receipt from /api/verify; a buy click is never a purchase.
    purchase(receipt) {
      if (!receipt.ok || !receipt.order_id || !receipt.product || !Number.isFinite(receipt.amount) || receipt.amount <= 0 || !['INR', 'USD'].includes(receipt.currency)) return;
      const key = 'pp_purchase_' + receipt.order_id;
      if (purchases.has(key)) return;
      try { if (localStorage.getItem(key)) return; } catch (_) {}
      clarity('set', 'purchased_product', receipt.product);
      if (track('Purchase', {content_ids: [receipt.product], content_type: 'product', content_name: receipt.product_name, value: receipt.amount / 100, currency: receipt.currency}, false, {eventID: receipt.order_id})) {
        purchases.add(key);
        try { localStorage.setItem(key, '1'); } catch (_) {}
      }
    }
  };
  const slug = location.pathname.match(/^\/products\/([^/]+)\/?$/)?.[1];
  // Gumroad product pages (data-pp-product) already send ViewContent from analytics.js.
  if (slug && !document.querySelector?.('[data-pp-product]')) track('ViewContent', {content_ids: [slug], content_type: 'product'});
  const template = location.pathname.match(/^\/learn\/([^/]+)\/?$/)?.[1];
  const once = new Set();
  document.addEventListener('promptpack:copied', event => {
    if (slug) track('SampleCopied', {content_ids: [slug]}, true);
    const source = event?.target?.closest?.('[data-pp-template]');
    if (template && source) {
      const name = source.dataset.ppTemplate;
      if (once.has('copy:' + name)) return;
      once.add('copy:' + name);
      track('TemplateCopied', {content_ids: [source.dataset.ppFor], content_category: 'free_template', template: name}, true);
    }
  });
  // Free guide -> product page clicks, once per product per page view.
  if (/^\/(learn|blog)\//.test(location.pathname)) {
    document.addEventListener('click', event => {
      const link = event?.target?.closest?.('a[href]');
      const target = link && new URL(link.href, location.href);
      const product = target && target.hostname === location.hostname && target.pathname.match(/^\/products\/([^/]+)\/?$/)?.[1];
      if (!product || once.has('click:' + product)) return;
      once.add('click:' + product);
      track('GuideProductClick', {content_ids: [product], content_type: 'product'}, true);
    });
  }
})();
