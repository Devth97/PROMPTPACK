'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const storage = () => { const v = new Map(); return {getItem: k => v.get(k) || null, setItem: (k, x) => v.set(k, x)}; };
const graph = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];

function boot({pathname = '/learn/ai-website-prompt-template/', search = '', referrer = '', session = storage(), gumroad = false} = {}) {
  const events = [], clarity = [], handlers = {};
  const context = {URL, URLSearchParams, Set, sessionStorage: session, localStorage: storage(),
    location: {search, pathname, hostname: 'promptpack.tech', href: 'https://promptpack.tech' + pathname},
    window: {fbq: (...args) => events.push(args), clarity: (...args) => clarity.push(args)},
    document: {referrer, querySelector: selector => (gumroad && selector === '[data-pp-product]' ? {} : null), addEventListener: (name, fn) => { handlers[name] = fn; }}};
  vm.runInNewContext(read('assets/conversion.js'), context);
  return {events, clarity, handlers, session, api: context.window.promptpack};
}
const target = attrs => ({closest: selector => (selector in attrs ? attrs[selector] : null)});

test('landing page and referrer class are kept once per session, with no personal data', () => {
  const cases = [['https://www.google.com/', 'organic_search'], ['https://www.bing.com/search?q=x', 'organic_search'], ['https://chatgpt.com/', 'ai_assistant'], ['https://www.perplexity.ai/', 'ai_assistant'], ['https://gemini.google.com/app', 'ai_assistant'], ['https://l.instagram.com/', 'social'], ['https://example.org/post', 'referral'], ['', 'direct']];
  for (const [referrer, source] of cases) assert.equal(boot({referrer}).api.landing().source, source, referrer);
  assert.equal(boot({referrer: 'https://www.google.com/', search: '?utm_source=meta'}).api.landing().source, 'campaign');
  const first = boot({referrer: 'https://www.google.com/', pathname: '/blog/x.html'});
  const next = boot({referrer: 'https://promptpack.tech/blog/x.html', pathname: '/products/carousel-studio/', session: first.session});
  assert.deepEqual({...next.api.landing()}, {path: '/blog/x.html', source: 'organic_search'});
  assert.deepEqual(next.clarity.filter(c => c[0] === 'set').map(c => c.slice(1)), [['landing_page', '/blog/x.html'], ['traffic_source', 'organic_search']]);
  assert.doesNotMatch(next.session.getItem('pp_landing'), /google\.com|q=/);
});

test('template copies on /learn/ pages are measured once per template; product sample copies stay SampleCopied', () => {
  const page = boot();
  const source = target({'[data-pp-template]': {dataset: {ppTemplate: 'ai-website-prompt-template', ppFor: 'website-prompts'}}});
  page.handlers['promptpack:copied']({target: source});
  page.handlers['promptpack:copied']({target: source});
  const copies = page.events.filter(e => e[1] === 'TemplateCopied');
  assert.equal(copies.length, 1);
  assert.deepEqual([copies[0][0], copies[0][2].content_ids[0], copies[0][2].template], ['trackCustom', 'website-prompts', 'ai-website-prompt-template']);
  assert.ok(page.clarity.some(c => c[0] === 'event' && c[1] === 'TemplateCopied'));
  const product = boot({pathname: '/products/carousel-studio/'});
  product.handlers['promptpack:copied']({target: target({})});
  assert.deepEqual(product.events.map(e => e[1]), ['ViewContent', 'SampleCopied']);
});

test('guide-to-product clicks are counted once per product and are never purchases', () => {
  const page = boot({pathname: '/blog/best-ai-website-prompts-cursor-claude-code.html'});
  const link = href => target({'a[href]': {href}});
  page.handlers.click({target: link('/products/website-prompts/')});
  page.handlers.click({target: link('https://promptpack.tech/products/website-prompts/')});
  page.handlers.click({target: link('/learn/')});
  page.handlers.click({target: link('https://example.com/products/x/')});
  assert.deepEqual(page.events.map(e => [e[1], e[2].content_ids[0]]), [['GuideProductClick', 'website-prompts']]);
  assert.ok(!page.events.some(e => e[1] === 'Purchase'));
});

test('Gumroad product page sends ViewContent from analytics.js only, not twice', () => {
  assert.equal(boot({pathname: '/products/website-prompts/', gumroad: true}).events.filter(e => e[1] === 'ViewContent').length, 0);
  assert.equal(boot({pathname: '/products/ugc-ad-scripts/'}).events.filter(e => e[1] === 'ViewContent').length, 1);
  assert.match(read('products/website-prompts/index.html'), /data-pp-product="website-prompts"/);
});

test('vendor tags load after the page, while their queues exist immediately', () => {
  const js = read('assets/analytics.js');
  assert.match(js, /n\.queue=\[\]/);
  assert.match(js, /addEventListener\('load'/);
  assert.doesNotMatch(read('index.html'), /fonts\.googleapis\.com|connect\.facebook\.net/);
});

test('primary navigation links to the free templates on every public page', () => {
  for (const file of ['index.html', 'contact/index.html', 'blog/index.html', 'blog/build-3d-animated-website-with-ai-no-code.html', 'learn/index.html', 'products/ugc-ad-scripts/index.html', 'finance/index.html'])
    assert.match(read(file), /<nav class="pp-categories" aria-label="Main">[\s\S]*?<a class="pp-free" href="\/learn\/">Free templates<\/a><\/nav>/, file);
});

test('guides show complete worked examples whose raw files are published', () => {
  for (const slug of ['ai-website-prompt-template', 'ugc-ad-script-template', 'ai-carousel-prompt-template']) {
    const html = read(`learn/${slug}/index.html`);
    for (const heading of ['Input: the filled template', 'What the review found', 'Revision prompt', 'Limitations of this example']) assert.ok(html.includes(heading), `${slug}: ${heading}`);
    assert.match(html, /Claude Opus 5\.5/);
    assert.match(html, /data-pp-template="[a-z-]+" data-pp-for="[a-z-]+"/);
    for (const [, href] of html.matchAll(/href="(\/learn\/examples\/[^"]+)"/g)) assert.ok(fs.existsSync(path.join(root, href)), href);
    for (const [, src] of html.matchAll(/src="(\/assets\/learn\/[^"]+)"/g)) assert.ok(fs.statSync(path.join(root, src)).size > 1000, src);
  }
  assert.doesNotMatch(read('learn/ugc-ad-script-template/index.html'), /testimonial from|customers? (said|reported)|increased (sales|conversions)/i);
});

test('brief builder says what it does and runs without a network request', () => {
  const html = read('learn/ai-website-prompt-template/index.html');
  assert.match(html, /It does not use AI, does not send your answers anywhere and does not save them/);
  assert.match(html, /<script src="\/assets\/brief-builder\.js(\?v=[0-9a-f]+)?" defer>/);
  assert.doesNotMatch(read('assets/brief-builder.js'), /fetch\(|XMLHttpRequest|sendBeacon|localStorage/);
});

test('watch pages: one video, transcript, steps and accurate VideoObject', () => {
  const {videos} = require('../scripts/watch-pages');
  assert.equal(videos.length, 2);
  for (const v of videos) {
    const html = read(v.url.slice(1) + 'index.html');
    assert.equal((html.match(/<video /g) || []).length, 1);
    assert.match(html, /<h2 id="transcript">Transcript<\/h2>/);
    for (const [, line] of v.transcript) assert.ok(html.includes(line.replace(/&/g, '&amp;').replace(/'/g, '&#39;')), line);
    const video = graph(html).find(n => n['@type'] === 'VideoObject');
    assert.equal(video.contentUrl, 'https://media.promptpack.tech' + v.file);
    assert.match(video.duration, /^PT\d+(\.\d)?S$/);
    assert.match(video.uploadDate, /^2026-10-19T/);
    assert.ok(fs.statSync(path.join(root, v.poster)).size > 1000);
    assert.ok(fs.existsSync(path.join(root, v.file)), v.file);
    assert.match(read('sitemap.xml'), new RegExp(`<loc>https://promptpack.tech${v.url}</loc><lastmod>[^<]+</lastmod><video:video>`));
  }
});

test('discovery: examples, checkout and receipt pages stay out of the index and the sitemap', () => {
  const config = JSON.parse(read('vercel.json'));
  const header = source => config.headers.find(h => h.source === source)?.headers.find(h => h.key === 'X-Robots-Tag')?.value;
  assert.equal(header('/learn/examples/(.*)'), 'noindex');
  assert.match(header('/checkout/thanks(.*)'), /noindex/);
  assert.match(header('/api/(.*)'), /noindex/);
  const sitemap = read('sitemap.xml');
  assert.doesNotMatch(sitemap, /\/checkout\/|\/api\/|\/learn\/examples\/|thanks/);
  assert.match(sitemap, /xmlns:video="http:\/\/www\.google\.com\/schemas\/sitemap-video\/1\.1"/);
  const versioned = config.headers.find(h => h.has && h.has[0].key === 'v');
  assert.equal(versioned.headers[0].value, 'public, max-age=31536000, immutable');
});
