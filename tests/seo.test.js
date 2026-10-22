'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const products = require('../catalog/products.json');
const editions = require('../catalog/editions.json');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('SEO: current character engine and publishing starter appear in search metadata', () => {
  const reel = read('products/motion-with-code/index.html');
  assert.match(reel.match(/<title>(.*?)<\/title>/)[1], /3D Character Reels/);
  assert.match(reel.match(/name="description" content="([^"]+)"/)[1], /local engine/i);
  assert.doesNotMatch(reel.match(/<head>([\s\S]*?)<\/head>/)[1], /HyperFrames title sequence|motion graphics starter/);
  // Carousel Studio 2.1 includes the former Workflow Kit, so its metadata names the publishing route.
  const carousel = read('products/carousel-studio/index.html');
  assert.match(carousel.match(/<title>(.*?)<\/title>/)[1], /Publishing Workflow/);
});

test('SEO: every product answer states its actual outcome and scope in visible HTML and JSON-LD', () => {
  for (const p of products) {
    const e = editions.find(item => item.slug === p.slug);
    const html = read(`products/${p.slug}/index.html`);
    const body = html.split('</head>')[1];
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
    const questions = graph.find(item => item['@type'] === 'FAQPage').mainEntity;
    const outcome = questions.find(item => item.name === `What is ${p.name}?`).acceptedAnswer.text;
    assert.ok(outcome.includes(e.outcome), p.slug);
    const scope = questions.find(item => item.name === `What does ${p.name} not include?`);
    assert.equal(scope.acceptedAnswer.text, e.limits, p.slug);
    for (const q of questions) {
      assert.ok(body.includes(`<summary>${escape(q.name)}</summary>`), `${p.slug}: visible question`);
      assert.ok(body.includes(`<p>${escape(q.acceptedAnswer.text)}</p>`), `${p.slug}: visible answer`);
    }
    assert.doesNotMatch(body, /referenced, not bundled/, p.slug);
  }
});

test('SEO: optional text catalog preserves current product identities, scope and preferred URLs', () => {
  const index = read('llms.txt');
  const full = read('llms-full.txt');
  for (const p of products) {
    const e = editions.find(item => item.slug === p.slug);
    const url = `https://promptpack.tech/products/${p.slug}/`;
    assert.ok(index.includes(`[${p.name}](${url})`), p.slug);
    assert.ok(full.includes(`URL: ${url}`), p.slug);
    assert.ok(full.includes(`Scope: ${e.limits}`), p.slug);
  }
});

test('SEO: buyer guides have crawlable links, unique canonicals and truthful article markup', () => {
  const guides = require('../scripts/guides').guides;
  const index = read('blog/index.html');
  const sitemap = read('sitemap.xml');
  const titles = new Set();
  for (const g of guides) {
    const html = read(g.url.slice(1));
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    assert.ok(!titles.has(title), g.url);
    titles.add(title);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, g.url);
    assert.ok(html.includes(`rel="canonical" href="https://promptpack.tech${g.url}"`), g.url);
    assert.equal(sitemap.split(`<loc>https://promptpack.tech${g.url}</loc>`).length - 1, 1, g.url);
    assert.equal(index.split(`href="${g.url}"`).length - 1, 1, g.url);
    assert.ok(read('llms.txt').includes(`https://promptpack.tech${g.url}`), g.url);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
    const article = graph.find(item => item['@type'] === 'BlogPosting');
    assert.equal(article.headline, g.title);
    assert.equal(article.author['@id'], 'https://promptpack.tech/#organization');
    // The local build has a review date; a deployment has not established publication yet.
    assert.equal(article.datePublished, undefined);
    assert.doesNotMatch(html, /Motion Briefs for Code|name="robots" content="noindex/);
    for (const slug of g.products) {
      assert.ok(html.includes(`href="/products/${slug}/"`), g.url);
      assert.ok(read(`products/${slug}/index.html`).includes(`href="${g.url}"`), slug);
    }
  }
});

test('SEO: comparison prices and current names follow changed catalog data on rebuild', () => {
  const writes = {};
  const changed = products.map(p => p.slug === 'carousel-studio' ? {...p, name:'Renamed Studio', price:17, price_inr:1000} : p);
  require('../scripts/guides').build({products:changed, editions, esc:escape,
    page:(_title,_description,_url,body) => body,
    write:(file,value) => { writes[file] = value; }
  });
  const comparison = writes['blog/carousel-design-vs-publishing-workflow.html'];
  assert.ok(comparison.includes('US$17 / ₹1,000'));
  assert.ok(comparison.includes('>Renamed Studio</a>'));
  assert.ok(!comparison.includes('US$12 / ₹699'));
});
