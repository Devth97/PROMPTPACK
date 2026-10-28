'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const products = require('../catalog/products.json');
const {sections, sectionFor} = require('../scripts/site-shell');
const root = path.join(__dirname,'..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');

test('storefront: every product appears exactly once in its home category', () => {
  const html = read('index.html');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  const listed = [...html.matchAll(/data-product="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(new Set(listed),new Set(['money-audit','website-prompts',...products.map(p=>p.slug)]));
  assert.equal(listed.length,5);
  for (const section of sections) {
    assert.match(html,new RegExp(`id="${section.id}"`));
    assert.ok(html.includes(`href="/#${section.id}"`));
  }
  for (const product of products) {
    const section = html.match(new RegExp(`<section id="${sectionFor(product).id}"[\\s\\S]*?</section>`))[0];
    assert.ok(section.includes(`data-product="${product.slug}"`));
  }
  assert.equal((html.match(/>Available now</g)||[]).length,5);
  for (const product of products) assert.ok(html.includes(`href="/checkout/${product.slug}/"`),product.slug);
  assert.match(read('products/index.html'),/http-equiv="refresh" content="0;url=\/#catalog"/);
  const website = read('products/website-prompts/index.html');
  assert.match(website,/https:\/\/khalandarth\.gumroad\.com\/l\/PROMPTPACK\?wanted=true/);
});

test('storefront: every public page has shared navigation and valid local destinations', () => {
  const files = ['index.html','finance/index.html','finance/thanks/index.html','contact/index.html','privacy/index.html','terms/index.html','refund/index.html','products/index.html','products/website-prompts/index.html',...products.map(p=>`products/${p.slug}/index.html`),...fs.readdirSync(path.join(root,'blog')).filter(f=>f.endsWith('.html')).map(f=>'blog/'+f)];
  for (const file of files) {
    const html = read(file);
    assert.match(html,/href="\/assets\/theme.css(\?v=[0-9a-f]+)?"/,file);
    assert.equal((html.match(/class="pp-header"/g)||[]).length,1,file);
    assert.match(html,/class="skip" href="#main"/,file);
    assert.match(html,/id="main"/,file);
    for (const m of html.matchAll(/(?:href|src)="(\/(?!\/)[^"?]*)/g)) {
      const [url,fragment] = m[1].split('#');
      const target = path.join(root,url);
      const resolved = fs.existsSync(target) && fs.statSync(target).isFile() ? target : path.join(target,'index.html');
      assert.ok(fs.existsSync(resolved),`${file}: ${m[1]}`);
      if (fragment && resolved.endsWith('.html')) assert.ok(fs.readFileSync(resolved,'utf8').includes(`id="${fragment}"`),`${file}: missing ${m[1]}`);
    }
    for (const m of html.matchAll(/https:\/\/media\.promptpack\.tech\/([^"'?#\s]+)/g)) assert.ok(fs.existsSync(path.join(root,m[1])),`${file}: R2 media has no local source ${m[1]}`);
  }
  assert.match(read('finance/index.html'),/id="paymentChoice"/);
  assert.match(read('finance/index.html'),/data-finance-cta/);
});

test('storefront: search supports plural names, categories, empty state and navigation reset', () => {
  const eventElement = extra => ({hidden:false,value:'',textContent:'',events:{},addEventListener(name,fn){this.events[name]=fn;},...extra});
  const html = read('index.html');
  const cards = [...html.matchAll(/<article class="card product-card" data-product="([^"]+)" data-category="([^"]+)">([\s\S]*?)<\/article>/g)].map(m=>eventElement({dataset:{product:m[1],category:m[2]},textContent:m[3].replace(/<[^>]+>/g,' ')}));
  const groups = sections.map(s=>eventElement({querySelectorAll:()=>cards.filter(c=>c.dataset.category===s.name)}));
  const elements = Object.fromEntries(['catalog-search','catalog-clear','catalog-results','catalog-empty'].map(id=>[id,eventElement()]));
  const navLink = eventElement();
  const document = {
    getElementById:id=>elements[id]||null,
    querySelectorAll:selector=>selector==='[data-product]'?cards:selector==='[data-product-section]'?groups:selector==='[data-copy]'?[]:[navLink]
  };
  let focused = false;
  elements['catalog-search'].focus=()=>{focused=true;};
  vm.runInNewContext(read('assets/catalog.js'),{document});
  const search = value => {elements['catalog-search'].value=value;elements['catalog-search'].events.input();return cards.filter(c=>!c.hidden).map(c=>c.dataset.product);};
  assert.deepEqual(search('carousels'),['carousel-studio']);
  assert.deepEqual(search('websites'),['website-prompts']);
  assert.equal(search('social media').length,1);
  assert.equal(search('no such product').length,0);
  assert.equal(elements['catalog-empty'].hidden,false);
  assert.ok(groups.every(g=>g.hidden));
  navLink.events.click();
  assert.equal(elements['catalog-search'].value,'');
  assert.ok(cards.every(c=>!c.hidden));
  assert.ok(groups.every(g=>!g.hidden));
  search('money');
  elements['catalog-clear'].events.click();
  assert.ok(focused);
  assert.equal(elements['catalog-results'].textContent,'5 of 5 products');
});
