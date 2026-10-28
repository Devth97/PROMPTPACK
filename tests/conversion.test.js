'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = file => fs.readFileSync(require('node:path').join(__dirname, '..', file), 'utf8');
const storage = () => {
  const values = new Map();
  return {getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value)};
};
function boot({search = '', pathname = '/products/carousel-studio/', hostname = 'promptpack.tech', session = storage(), local = storage(), fbq} = {}) {
  const events = [], handlers = {};
  const context = {URLSearchParams, Set, sessionStorage: session, localStorage: local,
    location: {search, pathname, hostname}, window: {fbq: fbq || ((...args) => events.push(args))},
    document: {addEventListener: (event, handler) => { handlers[event] = handler; }}};
  vm.runInNewContext(read('assets/conversion.js'), context);
  return {api: context.window.promptpack, events, handlers, session, local};
}
test('campaign survives internal navigation, ignores unapproved fields, and resets on a new tagged visit', () => {
  const first = boot({search: '?utm_source=meta&utm_campaign=launch&email=private&token=secret'});
  const next = boot({search: '', session: first.session});
  assert.deepEqual({...next.api.attribution()}, {utm_source: 'meta', utm_campaign: 'launch'});
  const changed = boot({search: '?utm_source=google', session: first.session});
  assert.deepEqual({...changed.api.attribution()}, {utm_source: 'google'});
  const copy = changed.api.attribution(); copy.utm_source = 'changed';
  assert.equal(changed.api.attribution().utm_source, 'google');
});
test('sample copy emits only after the clipboard success event; local previews send nothing', () => {
  const page = boot();
  assert.equal(page.events[0][1], 'ViewContent');
  page.handlers['promptpack:copied']();
  assert.equal(page.events[1][0], 'trackCustom');
  assert.equal(page.events[1][1], 'SampleCopied');
  const preview = boot({hostname: 'localhost'});
  preview.handlers['promptpack:copied']();
  assert.equal(preview.events.length, 0);
});
test('verified purchase uses server currency and value, deduplicates retries, and omits tokens', () => {
  const page = boot();
  const receipt = {ok: true, order_id: 'order_test123', product: 'carousel-studio', product_name: 'Carousel Studio', amount: 69900, currency: 'INR', token: 'secret'};
  page.api.purchase({...receipt, ok: false});
  page.api.purchase({...receipt, amount: 0});
  assert.equal(page.events.length, 1);
  page.api.purchase(receipt); page.api.purchase(receipt);
  const purchases = page.events.filter(event => event[1] === 'Purchase');
  assert.equal(purchases.length, 1);
  assert.equal(purchases[0][2].value, 699);
  assert.equal(purchases[0][2].currency, 'INR');
  assert.equal(purchases[0][3].eventID, receipt.order_id);
  assert.ok(!JSON.stringify(purchases).includes('secret'));
  const reload = boot({local: page.local}); reload.api.purchase(receipt);
  assert.equal(reload.events.filter(event => event[1] === 'Purchase').length, 0);
});
test('blocked storage and broken analytics never stop checkout', () => {
  const blocked = {getItem() {throw Error('blocked');}, setItem() {throw Error('blocked');}};
  const page = boot({search: '?utm_source=meta', session: blocked, local: blocked, fbq() {throw Error('blocked');}});
  assert.equal(page.api.attribution().utm_source, 'meta');
  assert.doesNotThrow(() => page.api.purchase({ok: true, order_id: 'order_test123', product: 'carousel-studio', amount: 1200, currency: 'USD'}));
  for (const invalid of ['null', '[]', '"bad"', '{malformed']) {
    const session = storage(); session.setItem('pp_attr', invalid);
    assert.doesNotThrow(() => boot({session}));
  }
});
test('generated pages load measurement once and keep download entitlements away from trackers', () => {
  for (const file of ['index.html', 'products/website-prompts/index.html', 'products/ugc-ad-scripts/index.html', 'checkout/ugc-ad-scripts/index.html']) {
    const html = read(file);
    // First-party scripts carry a ?v=<content hash> cache key (scripts/optimize-html.js).
    assert.equal((html.match(/src="\/assets\/analytics.js(\?v=[0-9a-f]+)?"/g) || []).length, 1, file);
    assert.equal((html.match(/src="\/assets\/conversion.js(\?v=[0-9a-f]+)?"/g) || []).length, 1, file);
  }
  assert.doesNotMatch(read('checkout/thanks/index.html'), /analytics.js|conversion.js|fbevents|clarity/);
});

test('checkout tracks an opened popup and a verified payment, never a failed confirmation', async () => {
  async function checkout(verified) {
    const options = [{disabled: false, addEventListener() {}}], events = [], requests = [], redirects = [];
    let submit, popup;
    const form = {dataset: {checkout: 'carousel-studio'}, elements: {email: {value: 'test@example.com'}},
      querySelectorAll: () => options, addEventListener: (_, fn) => {submit = fn;}, querySelector: () => ({replaceWith() {}})};
    const status = {};
    const window = {promptpack: {attribution: () => ({utm_source: 'meta'}), track: (...args) => events.push(args), purchase: receipt => events.push(['Purchase', receipt])},
      Razorpay: function(config) {popup = config; this.on = () => {}; this.open = () => {};}};
    const document = {querySelector: () => form, getElementById: () => status, createElement: () => ({addEventListener() {}})};
    const fetch = async (url, config) => {
      requests.push([url, JSON.parse(config.body)]);
      if (url === '/api/create-order') return {ok: true, json: async () => ({order_id: 'order_123', amount: 69900, currency: 'INR', product_name: 'Carousel Studio'})};
      return {ok: verified, json: async () => verified ? {ok: true, order_id: 'order_123', amount: 69900, currency: 'INR', product: 'carousel-studio', token: 'private-token'} : {error: 'payment_not_completed'}};
    };
    vm.runInNewContext(read('assets/checkout.js'), {window, document, fetch, URLSearchParams, location: {search: '', assign: url => redirects.push(url)}});
    await submit({preventDefault() {}, submitter: {value: 'inr'}});
    await popup.handler({razorpay_order_id: 'order_123', razorpay_payment_id: 'pay_123'});
    // The real popup does not await its handler; finish the asynchronous verification.
    await new Promise(resolve => setImmediate(resolve));
    return {events, requests, redirects};
  }
  const success = await checkout(true);
  assert.equal(success.requests[0][1].attribution.utm_source, 'meta');
  assert.equal(success.events[0][0], 'InitiateCheckout');
  assert.equal(success.events[0][1].value, 699);
  assert.equal(success.events[1][0], 'Purchase');
  assert.match(success.redirects[0], /^\/checkout\/thanks\/#t=/);
  const failure = await checkout(false);
  assert.deepEqual(failure.events.map(event => event[0]), ['InitiateCheckout']);
  assert.equal(failure.redirects.length, 0);
});

test('buyers can compare examples and requirements without entering checkout', () => {
  const home = read('index.html');
  assert.match(home, /href="#kit-chooser-heading"/);
  assert.equal((home.match(/class="kit-choice"/g) || []).length, 3);
  for (const p of require('../catalog/products.json')) {
    assert.ok(home.includes(`href="/products/${p.slug}/#inside"`), p.slug);
    const product = read(`products/${p.slug}/index.html`);
    assert.match(product, /class="buy-requirements"/);
    assert.match(product, /id="requirements"/);
    assert.ok(product.includes(p.needs.replace(/&/g, '&amp;').replace(/'/g, '&#39;')));
    assert.match(read(`checkout/${p.slug}/index.html`), /Check the tools you need/);
  }
});
