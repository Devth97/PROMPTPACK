'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const products = require('../catalog/products.json');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('catalog: 11 distinct packs contain 180 prompts and usable samples', () => {
  assert.equal(products.length, 11);
  assert.equal(new Set(products.map(p => p.slug)).size, 11);
  assert.equal(products.reduce((sum, p) => sum + p.count, 0), 180);
  products.forEach(p => {
    assert.match(p.slug, /^[a-z0-9-]+$/);
    assert.ok(p.sample.length > 200);
    assert.ok(p.price > 0);
    assert.ok(p.needs && p.audience && p.includes.length);
  });
});

test('catalog: pages have valid metadata and offers match the server checkout price', () => {
  const canonicals = new Set();
  for (const file of ['products/index.html', ...products.map(p => `products/${p.slug}/index.html`)]) {
    const html = read(file);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, file);
    const canonical = html.match(/rel="canonical" href="([^"]+)"/)[1];
    assert.ok(!canonicals.has(canonical));
    canonicals.add(canonical);
    assert.match(html, /name="description" content="[^"]+"/);
    const product = products.find(p => file === `products/${p.slug}/index.html`);
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const schema = JSON.parse(match[1]);
      assert.ok(schema['@context']);
      const offers = [...match[1].matchAll(/"@type":"Offer","price":"([\d.]+)","priceCurrency":"(\w+)","url":"([^"]+)"/g)];
      if (!product) assert.equal(offers.length, 0, file);
      else {
        assert.equal(offers.length, 1, file);
        assert.deepEqual(offers[0].slice(1), [product.price.toFixed(2), 'USD', `https://promptpack.tech/checkout/${product.slug}/`]);
      }
    }
    for (const match of html.matchAll(/(?:href|src)="(\/(?!\/)[^"#?]*)/g)) {
      const pathname = path.join(root, match[1]);
      assert.ok(fs.existsSync(pathname) || fs.existsSync(path.join(pathname, 'index.html')), `${file}: ${match[1]}`);
      assert.doesNotMatch(match[1], /^\/(?:private|output)\//);
    }
    if (file !== 'products/index.html') {
      assert.doesNotMatch(html, /not (currently )?for sale|checkout has not opened/i);
      assert.match(html, /id="sample-prompt"/);
    }
  }
});

test('catalog: all pages are in the sitemap exactly once', () => {
  const locations = Array.from(read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g), m => m[1]);
  assert.equal(locations.length, new Set(locations).size);
  for (const url of ['/products/website-prompts/', ...products.map(p => `/products/${p.slug}/`)]) {
    assert.ok(locations.includes('https://promptpack.tech' + url), url);
  }
  // Redirect stubs and noindex checkout/download pages stay out of the sitemap.
  assert.ok(!locations.some(url => /\/products\/$|\/checkout\//.test(url)));
});

test('catalog: paid source and archives are excluded from Git and CLI deployments', () => {
  assert.match(read('.gitignore'), /^\/private\/catalog\/$/m);
  assert.match(read('.gitignore'), /^\/output\/product-launch\/$/m);
  assert.match(read('.vercelignore'), /^private\/catalog\/$/m);
  assert.match(read('.vercelignore'), /^output\/$/m);
  // Existing encrypted fulfillment remains available to its serverless function.
  const config = JSON.parse(read('vercel.json'));
  assert.equal(config.functions['api/download.js'].includeFiles, 'private/**/*.enc');
  assert.equal(config.functions['api/create-order.js'].includeFiles, 'private/products/*.enc');
});
