 'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const catalog=require('../api/_products');
test('ZeroCut registers a fixed INR price and the verified encrypted kit',()=>{
 const p=catalog.bySlug('zerocut-checkout');assert(p);assert.equal(p.id,'promptpack-zerocut-checkout');
 assert.deepEqual(p.plans,['inr']);assert.deepEqual(catalog.priceFor(p,'inr'),{amount:99900,currency:'INR'});
 assert(catalog.priceMatches(p,99900,'INR'));assert(!catalog.priceMatches(p,1,'INR'));assert(!catalog.priceMatches(p,99900,'USD'));
 assert.equal(p.bytes,52306);assert.equal(p.sha256,'5e251f1ea16929e9e4bb9d38b000b09ef436893f82671a91f9d8912f7e2f156d');
 const enc=fs.readFileSync(path.join(__dirname,'../private',p.file));assert.equal(enc.subarray(0,7).toString(),'PPENC1\n');
 assert.equal(Buffer.from(enc.subarray(7).toString().trim(),'base64').length,p.bytes+28);
 assert.equal(p.key_env,'PLANNING_FILE_KEY');assert.equal(p.filename,'ZeroCut-Checkout-v1.0.zip');
});
test('Buy Now links and checkout use the ZeroCut product and existing Razorpay flow',()=>{
 const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
 const page=read('zerocut-checkout/index.html');assert.match(page,/href="\/checkout\/zerocut-checkout\/" data-buy>/);assert(!page.includes('Purchase opens soon'));
 const checkout=read('checkout/zerocut-checkout/index.html');assert.match(checkout,/data-checkout="zerocut-checkout"/);assert.match(checkout,/value="inr"/);assert(!checkout.includes('value="usd"'));
 assert(checkout.includes('https://checkout.razorpay.com/v1/checkout.js'));assert(checkout.includes('/assets/checkout.js'));
 assert(read('assets/order-thanks.js').includes("receipt.product==='zerocut-checkout'"));
});
