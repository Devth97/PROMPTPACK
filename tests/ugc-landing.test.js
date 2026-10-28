'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const render = require('../scripts/ugc-landing');
const edition = require('../catalog/editions.json').find(e => e.slug === 'ugc-ad-scripts');
const product = require('../catalog/products.json').find(p => p.slug === edition.slug);
const root = path.join(__dirname, '..');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

test('UGC landing: playable references have posters and stay separate from the purchased example', () => {
  const html = fs.readFileSync(path.join(root, 'products/ugc-ad-scripts/index.html'), 'utf8');
  const clips = [...html.matchAll(/<video\b[^>]*poster="(\/assets\/ugc-course\/[^\"]+)"[^>]*><source src="([^\"]+)"/g)];
  assert.equal(clips.length, 8);
  assert.equal(new Set(clips.map(c => c[2])).size, 8);
  assert.match(clips[0][2], /more-5\.mp4$/);
  assert.doesNotMatch(html, /hero-1\.(mp4|jpg)/);
  for (const [, price] of html.matchAll(/class="buy-price">([^<]+)/g)) {
    assert.match(price, /^\u20b9699 \/ US\$12/);
  }
  for (const [tag, poster, video] of clips) {
    assert.match(tag, /controls muted playsinline preload="none"/);
    assert.doesNotMatch(tag, /autoplay/);
    const jpg = fs.readFileSync(path.join(root, poster));
    const mp4 = fs.readFileSync(path.join(root, new URL(video, 'https://promptpack.tech').pathname));
    assert.equal(jpg.readUInt16BE(0), 0xffd8, poster);
    assert.equal(mp4.toString('ascii', 4, 8), 'ftyp', video);
  }
  assert.match(html, /separate from the kit’s worked example/);
  assert.match(html, /not a lesson recording or a promised output/);
  for (const slide of edition.gallery) assert.ok(html.includes(slide.src));
  const ids = new Set([...html.matchAll(/\bid="([^\"]+)"/g)].map(m => m[1]));
  for (const [, id] of html.matchAll(/href="#([^\"]+)"/g)) assert.ok(ids.has(id), `Missing section ${id}`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /href="\/assets\/ugc-landing.css(\?v=[0-9a-f]+)?"/);
});

test('UGC landing: edition facts remain dynamic and product labels are escaped', () => {
  const html = render({...product, name:'<script>bad()</script>'}, {...edition, pdf_pages:23, prompt_count:22}, esc, '/checkout/ugc-ad-scripts/', '₹699 / US$12');
  assert.match(html, /23-page guide/);
  assert.match(html, /22 editable prompts/);
  assert.match(html, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
