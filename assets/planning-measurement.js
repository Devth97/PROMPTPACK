'use strict';
(() => {
  const {planning:slug, usdMinor, inrMinor} = document.body.dataset;
  if (!['wedding-decision-kit', 'two-homes-organizer'].includes(slug)) return;
  const currentPrices = {USD:Number(usdMinor), INR:Number(inrMinor)};
  const previousPrices = {USD:[3100,4900], INR:[299900]};
  const matchesPrice = (amount, currency, purchase) => Number.isInteger(amount) &&
    (amount === currentPrices[currency] || (purchase && Object.hasOwn(previousPrices,currency) && previousPrices[currency].includes(amount)));
  const production = ['promptpack.tech', 'www.promptpack.tech'].includes(location.hostname);
  const eligible = slug === 'wedding-decision-kit' && !window.navigator?.globalPrivacyControl;
  const preferenceKey = 'pp_planning_ads_v1';
  let choice = null, initialized = false;
  try { choice = localStorage.getItem(preferenceKey); } catch (_) { /* Optional storage. */ }
  const allowed = () => eligible && choice === 'granted';
  const attribution = {};
  const params = new URLSearchParams(location.search);
  const keys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  let stored = {};
  if (allowed()) { try { stored = JSON.parse(sessionStorage.getItem('pp_planning_attr') || '{}') || {}; } catch (_) {} }
  const tagged = keys.some(key => params.has(key));
  for (const key of keys) {
    const value = tagged ? params.get(key) : stored[key];
    if (value && /^[a-zA-Z0-9_-]{1,80}$/.test(value)) attribution[key] = value;
  }
  const seen = new Set();
  const track = (name, data = {}, custom = false, options) => {
    if (!allowed() || !production || typeof window.fbq !== 'function') return false;
    if (!['ViewContent','InitiateCheckout','CheckoutClosed','PaymentFailed','Purchase'].includes(name)) return false;
    // Build the payload here: callers cannot add buyer details or download entitlements.
    const safe = {content_ids:[slug],content_type:'product',content_name:'The Wedding Decision Kit'};
    if (matchesPrice(data.value*100,data.currency,name==='Purchase')) Object.assign(safe,{value:data.value,currency:data.currency});
    try { window.fbq(custom ? 'trackCustom' : 'track',name,safe,options); return true; }
    catch (_) { return false; } // Measurement must never prevent payment or delivery.
  };
  window.promptpack = {
    attribution: () => allowed() ? {...attribution} : {},
    track,
    purchase(receipt) {
      if (!allowed() || !receipt?.ok || receipt.product !== slug || !matchesPrice(receipt.amount,receipt.currency,true) || !/^order_[a-zA-Z0-9]+$/.test(receipt.order_id || '')) return;
      const key = 'pp_purchase_' + receipt.order_id;
      if (seen.has(key)) return;
      try { if (localStorage.getItem(key)) return; } catch (_) {}
      if (track('Purchase',{value:receipt.amount/100,currency:receipt.currency},false,{eventID:receipt.order_id})) {
        seen.add(key);
        try { localStorage.setItem(key,'1'); } catch (_) {}
      }
    }
  };
  const initialize = () => {
    if (!allowed()) return;
    try { sessionStorage.setItem('pp_planning_attr', JSON.stringify(attribution)); } catch (_) {}
    if (!production || initialized) return;
    initialized = true;
    if (!window.fbq) {
      const fbq = window.fbq = function() {fbq.callMethod ? fbq.callMethod.apply(fbq,arguments) : fbq.queue.push(arguments);};
      fbq.queue=[]; fbq.push=fbq; fbq.loaded=true; fbq.version='2.0'; window._fbq=fbq;
      const script=document.createElement('script'); script.async=true;
      script.src='https://connect.facebook.net/en_US/fbevents.js'; document.head.append(script);
    }
    window.fbq('consent','grant');
    window.fbq('init','2116311975585050');
    // Disable automatic button/form events; only the explicit allowlisted events are used.
    window.fbq('set','autoConfig',false,'2116311975585050');
    window.fbq('track','PageView');
    if (location.pathname.startsWith('/products/')) track('ViewContent',{value:currentPrices.USD/100,currency:'USD'});
  };
  if (eligible) {
    const panel=document.createElement('section'); panel.className='planning-consent';
    panel.setAttribute('aria-label','Optional advertising cookies');
    const text=document.createElement('p');
    text.textContent='Allow Meta advertising cookies to measure visits and purchases? Checkout works if you reject them. You can change this choice at any time.';
    const privacy=document.createElement('a'); privacy.href='/privacy'; privacy.textContent='Privacy policy';
    const allow=document.createElement('button'); allow.type='button'; allow.textContent='Allow advertising cookies';
    const reject=document.createElement('button'); reject.type='button'; reject.textContent='Reject optional cookies';
    const preferences=document.createElement('button'); preferences.type='button'; preferences.className='planning-preferences'; preferences.textContent='Advertising preferences';
    const save = next => {
      const wasInitialized=initialized; choice=next;
      try { localStorage.setItem(preferenceKey,next); } catch (_) {}
      panel.hidden=true; preferences.hidden=false;
      if (next==='granted') initialize();
      else if (wasInitialized) {
        try { window.fbq?.('consent','revoke'); } catch (_) {}
        location.reload();
      }
      preferences.focus();
    };
    allow.addEventListener('click',()=>save('granted'));
    reject.addEventListener('click',()=>save('denied'));
    preferences.addEventListener('click',()=>{panel.hidden=false;preferences.hidden=true;reject.focus();});
    panel.append(text,allow,reject,privacy);
    panel.hidden=['granted','denied'].includes(choice); preferences.hidden=!panel.hidden;
    document.body.append(panel,preferences);
  }
  initialize();
})();
