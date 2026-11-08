'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const products = require('../catalog/products.json');
const {sections, sectionFor} = require('../scripts/site-shell');
const root = path.join(__dirname,'..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');

test('storefront: all eight products appear once in the unified catalog before promotions', () => {
  const html = read('index.html');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  const listed = [...html.matchAll(/data-product="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(new Set(listed),new Set(['money-audit','website-prompts','profitpulse','wedding-decision-kit','two-homes-organizer',...products.map(p=>p.slug)]));
  assert.equal(listed.length,8);
  assert.ok(html.indexOf('id="catalog"') < html.indexOf('class="profit-feature"'));
  assert.match(html,/class="catalog-grid"/);
  const script=read('assets/catalog.js').replace(/\r\n/g,'\n');
  const version=html.match(/src="\/assets\/catalog\.js\?v=([a-f0-9]+)"/)?.[1];
  const hash=text=>crypto.createHash('sha256').update(text).digest('hex').slice(0,10);
  assert.ok([hash(script),hash(script.replace(/\n/g,'\r\n'))].includes(version), 'homepage references the current filter script');
  for (const section of sections) {
    assert.match(html,new RegExp(`id="${section.id}"`));
    assert.ok(html.includes(`href="/#${section.id}"`));
  }
  for (const product of products) {
    assert.match(html,new RegExp(`data-product="${product.slug}" data-category="${sectionFor(product).name}"`));
  }
  for(const slug of listed) assert.match(html,new RegExp(`href="/(?:products/${slug}/|finance)"`));
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
  const eventElement = extra => ({hidden:false,value:'',textContent:'',events:{},attrs:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(name,fn){this.events[name]=fn;},...extra});
  const html = read('index.html');
  const cards = [...html.matchAll(/<article class="card product-card" data-product="([^"]+)" data-category="([^"]+)">([\s\S]*?)<\/article>/g)].map(m=>eventElement({dataset:{product:m[1],category:m[2]},textContent:m[3].replace(/<[^>]+>/g,' ')}));
  const groups = sections.map(s=>eventElement({querySelectorAll:()=>cards.filter(c=>c.dataset.category===s.name)}));
  const elements = Object.fromEntries(['catalog-search','catalog-category','catalog-clear','catalog-results','catalog-empty'].map(id=>[id,eventElement()]));
  const navLink = eventElement({getAttribute:()=>'/#catalog'});
  const interests=[['planning','Planning'],['finance','Finance'],['social-media','Social Media']].map(([id,name])=>eventElement({id,dataset:{catalogCategory:name},getAttribute:()=>`#${id}`}));
  const location={hash:'#social-media'};
  const window=eventElement();
  const document = {
    getElementById:id=>elements[id]||interests.find(link=>link.id===id)||null,
    querySelectorAll:selector=>selector==='[data-product]'?cards:selector==='[data-product-section]'?groups:selector==='[data-copy]'?[]:selector==='[data-catalog-category]'?interests:[navLink,...interests]
  };
  let focused = false;
  elements['catalog-search'].focus=()=>{focused=true;};
  vm.runInNewContext(read('assets/catalog.js'),{document,location,window});
  const visible=()=>cards.filter(c=>!c.hidden).map(c=>c.dataset.product);
  assert.deepEqual(visible(),['carousel-studio']);
  assert.equal(interests[2].attrs['aria-current'],'true');
  interests[0].events.click();
  assert.deepEqual(visible(),['wedding-decision-kit','two-homes-organizer']);
  assert.equal(interests[0].attrs['aria-current'],'true');
  location.hash='#finance';
  window.events.hashchange();
  assert.deepEqual(visible(),['profitpulse','money-audit']);
  location.hash='#catalog';
  window.events.hashchange();
  const search = value => {elements['catalog-search'].value=value;elements['catalog-search'].events.input();return cards.filter(c=>!c.hidden).map(c=>c.dataset.product);};
  assert.deepEqual(search('carousels'),['carousel-studio']);
  assert.deepEqual(search('websites'),['website-prompts']);
  assert.equal(search('social media').length,1);
  assert.deepEqual(search('wedding'),['wedding-decision-kit']);
  elements['catalog-search'].value='';
  elements['catalog-category'].value='Planning';
  elements['catalog-category'].events.change();
  assert.deepEqual(cards.filter(c=>!c.hidden).map(c=>c.dataset.product),['wedding-decision-kit','two-homes-organizer']);
  assert.equal(elements['catalog-clear'].hidden,false);
  elements['catalog-clear'].events.click();
  assert.equal(elements['catalog-category'].value,'');
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
  assert.equal(elements['catalog-results'].textContent,'8 of 8 products');
});
