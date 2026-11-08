'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {bySlug,priceFor}=require('../api/_products');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('ProfitPulse is registered at fixed server-owned INR and USD prices',()=>{
 const p=bySlug('profitpulse');
 assert.ok(p);
 assert.equal(p.id,'promptpack-profitpulse');
 assert.deepEqual(priceFor(p,'inr'),{amount:99900,currency:'INR'});
 assert.deepEqual(priceFor(p,'usd'),{amount:1900,currency:'USD'});
 assert.equal(p.sha256,'b2798ce16bbf939e2c47949ea4a7f363b6900e77f9d82d34d1dd3dd325250caa');
 assert.equal(p.bytes,345767);
 assert.match(p.file,/^products\/[^/]+\.enc$/);
});

test('ProfitPulse purchase page has the native checkout form, disabled until availability check',()=>{
 const html=read('checkout/profitpulse/index.html');
 assert.match(html,/data-checkout="profitpulse"/);
 assert.match(html,/src="\/assets\/checkout\.js"/);
 assert.match(html,/src="\/assets\/profitpulse-ready\.js"/);
 assert.match(html,/value="inr" disabled/);
 assert.match(html,/value="usd" disabled/);
 assert.match(html,/id="buyer-email"/);
 assert.doesNotMatch(html,/href="https?:\/\/checkout\.razorpay\.com\/[^"]*"[^>]*>Buy/);
});

test('Product CTA is gated; no plaintext customer bundle is publicly checked in',()=>{
 const page=read('products/profitpulse/index.html');
 const js=read('assets/profitpulse-ready.js');
 assert.match(page,/id="profitpulse-buy"[^>]+hidden/);
 assert.match(page,/href="\/checkout\/profitpulse\/"/);
 assert.match(page,/src="\/assets\/profitpulse-ready\.js"/);
 assert.match(js,/result\.ready!==true/);
 assert.match(js,/buttons\.forEach\(b=>b\.disabled=true\)/);
 assert.equal(fs.existsSync(path.join(root,'assets','ProfitPulse_Paid_Customer_Download.zip')),false);
});

test('Availability handler fails closed without a valid decryptable paid ZIP',async()=>{
 const handler=require('../api/profitpulse-status');
 const saved=process.env.DOWNLOAD_FILE_KEY;
 process.env.DOWNLOAD_FILE_KEY='0'.repeat(64);
 const response={headers:{},setHeader(k,v){this.headers[k]=v;},end(s){this.json=JSON.parse(s);}};
 try{
  await handler({method:'GET'},response);
  assert.equal(response.statusCode,200);
  assert.equal(response.json.product,'profitpulse');
  assert.equal(response.json.ready,false);
 }finally{if(saved===undefined)delete process.env.DOWNLOAD_FILE_KEY;else process.env.DOWNLOAD_FILE_KEY=saved;}
});

test('Encryption setup requires exact archive bytes and existing secret',()=>{
 const script=read('scripts/prepare-profitpulse.js');
 assert.match(script,/digest!==product\.sha256/);
 assert.match(script,/PROFITPULSE_FILE_KEY/);
 assert.match(script,/createCipheriv\('aes-256-gcm'/);
 assert.match(script,/Encryption round-trip failed/);
});
