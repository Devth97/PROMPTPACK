'use strict';
// Keep existing storefront analytics restricted to the production site.
const ppProduction = ['promptpack.tech', 'www.promptpack.tech'].includes(location.hostname);
if (ppProduction) {
  (function(f,b,e,v,n,t,s) {
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];
    t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
  })(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init','2116311975585050');
  window.fbq('track','PageView');
  (function(c,l,a,r,i,t,y) {
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=true;t.src='https://www.clarity.ms/tag/'+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window,document,'clarity','script','xidr4f4am8');
}

// Products sold on Gumroad (data-pp-product on the page, data-pp-buy on its buy links):
// ViewContent once per load, InitiateCheckout on the first buy click, and the ad's UTMs + fbclid
// carried to Gumroad so its own Pixel (same ID) can match the Purchase and Gumroad can report the source.
// Off production nothing is sent; events go to the console and window.__ppAnalyticsLog (also with ?ppdebug=1).
(function() {
  const debug = !ppProduction || /[?&]ppdebug=1/.test(location.search);
  const send = (name, data) => {
    if (debug) { (window.__ppAnalyticsLog = window.__ppAnalyticsLog || []).push([name, data]); console.info('[pp]', name, data); }
    if (ppProduction && typeof window.fbq === 'function') window.fbq('track', name, data);
  };
  const keys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'];
  const attribution = {};
  try {
    const stored = JSON.parse(sessionStorage.getItem('pp_attr') || '{}');
    const query = new URLSearchParams(location.search);
    keys.forEach(k => { const v = query.get(k); if (v) attribution[k] = v.slice(0, 200); else if (stored[k]) attribution[k] = stored[k]; });
    sessionStorage.setItem('pp_attr', JSON.stringify(attribution));
  } catch (e) { /* storage blocked: attribution simply isn't persisted */ }
  window.PP_ATTRIBUTION = attribution;

  const start = () => {
    const product = document.querySelector('[data-pp-product]');
    if (!product) return;
    const d = product.dataset;
    const data = {content_name: d.ppName, content_type: 'product', content_ids: [d.ppProduct], value: Number(d.ppValue), currency: d.ppCurrency};
    const clarity = (...args) => { if (ppProduction && typeof window.clarity === 'function') window.clarity(...args); };
    send('ViewContent', data);
    keys.forEach(k => { if (attribution[k] && k !== 'fbclid') clarity('set', k, attribution[k]); });
    let started = false;
    document.querySelectorAll('a[data-pp-buy]').forEach(link => {
      const url = new URL(link.href);
      keys.forEach(k => { if (attribution[k] && !url.searchParams.has(k)) url.searchParams.set(k, attribution[k]); });
      link.href = url.toString();
      link.addEventListener('click', () => {
        if (started) return;
        started = true;
        send('InitiateCheckout', data);
        clarity('event', d.ppProduct.replace(/-/g, '_') + '_checkout_click');
      });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
