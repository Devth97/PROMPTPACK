'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const {guides, build} = require('../scripts/search-guides');
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('discovery: every sitemap page is indexable, unique and self-canonical', () => {
  const result = require('../scripts/audit-search').audit(root);
  assert.ok(result.pages.length > 10);
  assert.deepEqual(result.errors, []);
});
test('free templates: useful public content, author, source, copy control and working product path', () => {
  for (const g of guides) {
    const html = read(g.url.slice(1) + 'index.html');
    assert.ok(html.includes(escape(g.answer)));
    assert.ok(html.includes(escape(g.prompt)));
    assert.match(html, /data-copy="sample-prompt"/);
    assert.ok(html.includes(g.source[1]));
    assert.ok(html.includes(`href="/products/${g.product}/"`));
    assert.match(html, /Reviewed <time datetime="2026-10-28">/);
    assert.doesNotMatch(html, /name="robots" content="noindex|aggregateRating|"@type":"Review"/);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
    const article = graph.find(n => n['@type'] === 'BlogPosting');
    assert.equal(article.author['@id'], 'https://promptpack.tech/#organization');
    // The guides went live in the recorded 28 October 2026 production release (docs/seo-aeo-geo-tools.md).
    assert.equal(article.datePublished, '2026-10-28', 'Publication date must be the recorded release, not a guess');
    assert.ok(read('learn/index.html').includes(`href="${g.url}"`));
    assert.ok(read('llms.txt').includes('https://promptpack.tech' + g.url));
    assert.ok(read(`products/${g.product}/index.html`).includes(`href="${g.url}"`));
  }
  assert.match(read('index.html'), /href="\/learn\/"/);
});
test('free templates: a reduced catalog never links to an unavailable kit', () => {
  const writes = {};
  const urls = build({products: [], live: [{slug: 'website-prompts'}], esc: escape,
    page: (_t, _d, _u, body) => body, write: (name, body) => {writes[name] = body;}});
  assert.deepEqual(urls, ['/learn/', '/learn/ai-website-prompt-template/']);
  assert.ok(!JSON.stringify(writes).includes('/products/ugc-ad-scripts/'));
});
test('preview directives never override checkout and download noindex rules', () => {
  assert.match(read('learn/index.html'), /name="robots" content="index,follow,max-image-preview:large"/);
  for (const file of ['checkout/ugc-ad-scripts/index.html', 'checkout/thanks/index.html']) {
    const html = read(file);
    assert.match(html, /name="robots" content="noindex/);
    assert.doesNotMatch(html, /name="robots" content="index,follow/);
  }
  const api = JSON.parse(read('vercel.json')).headers.find(h => h.source === '/api/(.*)');
  assert.ok(api.headers.some(h => h.key === 'X-Robots-Tag' && h.value.includes('noindex')));
});
test('product identities and prices stay consistent with the server catalog', () => {
  for (const p of require('../catalog/products.json')) {
    const html = read(`products/${p.slug}/index.html`);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
    const product = graph.find(n => n['@type'] === 'Product');
    assert.equal(product.sku, p.slug);
    assert.equal(product.brand.name, 'PromptPack');
    assert.equal(product.offers.price, p.price.toFixed(2));
    assert.equal(product['@id'], `https://promptpack.tech/products/${p.slug}/#product`);
  }
});
