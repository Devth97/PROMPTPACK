const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const catalog=require('../scripts/storefront-catalog');
test('homepage catalog includes ZeroCut at ₹999 with Buy Now and demo links',()=>{
 const products=catalog.products(),p=products.find(p=>p.slug==='zerocut-checkout');assert(p);assert.equal(products.length,9);assert.equal(p.price,'₹999');assert.equal(p.category,'Websites');
 const rendered=catalog.render(),card=rendered.match(/<article[^>]*data-product="zerocut-checkout"[\s\S]*?<\/article>/)[0];
 assert.match(card,/class="card-link" href="\/checkout\/zerocut-checkout\/">Buy now/);assert.match(card,/href="\/zerocut-checkout\/">See the kit and try the demos/);
 const home=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');assert(home.includes(card));assert.match(home,/9 of 9 products/);assert.match(home,/9 digital kits to explore/);assert.match(home,/Explore all 9 kits/);
 const schema=JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);const list=schema['@graph'].find(p=>p['@type']==='CollectionPage').mainEntity;assert.equal(list.numberOfItems,9);assert(list.itemListElement.some(x=>x.name==='ZeroCut Checkout'&&x.url==='https://promptpack.tech/zerocut-checkout/'));
});
