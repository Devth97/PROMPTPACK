'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const catalog=require('../api/_products'),display=require('../scripts/price-display');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
test('USD leads the catalog and each regional checkout, matching server-owned amounts',()=>{
 const cards=require('../scripts/storefront-catalog').products();
 for(const card of cards)assert.match(card.price,/^US\$/);
 const slugs=['profitpulse',...require('../catalog/products.json').map(p=>p.slug),...require('../catalog/planning-products.json').map(p=>p.slug),...require('../catalog/launch-products.json').map(p=>p.slug)];
 for(const slug of slugs){
  const product=catalog.bySlug(slug),usd='US$'+catalog.priceFor(product,'usd').amount/100,inr='₹'+(catalog.priceFor(product,'inr').amount/100).toLocaleString('en-IN');
  const html=read(`checkout/${slug}/index.html`),price=html.match(/<p class="checkout-price">([\s\S]*?)<\/p>/)[1];
  assert.ok(price.replaceAll(',','').indexOf(usd)<price.replaceAll(',','').indexOf(inr.replaceAll(',','')),slug);
  assert.ok(price.includes(usd),slug+' USD');
  assert.ok(price.replaceAll(',','').includes(inr.replaceAll(',','')),slug+' INR');
  assert.ok(html.indexOf('value="usd"')<html.indexOf('value="inr"'),slug+' currency order');
  const page=read(`products/${slug}/index.html`);
  assert.ok(page.includes(usd)&&page.replaceAll(',','').includes(inr.replaceAll(',','')),slug+' product page');
 }
 assert.equal(cards.find(p=>p.slug==='website-prompts').priceNote,'one-time purchase');
});
test('price presentation escapes labels and keeps the INR alternative secondary',()=>{
 assert.equal(display('US$19','₹999'),'<span class="price-usd">US$19</span><small class="price-inr">or ₹999</small>');
 assert.ok(display('<USD>','<INR>').includes('&lt;USD&gt;'));
});
