'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const L=require('../api/_lib');
const slugs=['wedding-decision-kit','two-homes-organizer'];
const response=()=>({headers:{},setHeader(k,v){this.headers[k]=v;},end(s){this.json=JSON.parse(s);}});

test('planning products offer fixed $49 USD and INR 2999 plans',()=>{
 for(const slug of slugs){const p=L.catalog.bySlug(slug);assert.ok(p);assert.deepEqual(p.plans,['inr','usd']);assert.deepEqual(L.catalog.priceFor(p,'inr'),{amount:299900,currency:'INR'});assert.equal(L.catalog.priceMatches(p,299900,'INR'),true);assert.deepEqual(L.catalog.priceFor(p,'usd'),{amount:4900,currency:'USD'});assert.equal(L.catalog.priceMatches(p,4900,'INR'),false);assert.equal(p.key_env,'PLANNING_FILE_KEY');}
});
test('dedicated planning key decrypts only a matching authenticated archive',()=>{
 const p=L.catalog.bySlug(slugs[0]);assert.ok(p);
 const key=crypto.randomBytes(32),iv=crypto.randomBytes(12),plain=Buffer.from('PK test fixture');
 const fixture={...p,file:'products/planning-test.enc',bytes:plain.length,sha256:crypto.createHash('sha256').update(plain).digest('hex')};
 const dir=path.join(__dirname,'../private/products');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,'planning-test.enc');
 const saved=process.env.PLANNING_FILE_KEY;process.env.PLANNING_FILE_KEY=key.toString('hex');
 const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);const ciphertext=Buffer.concat([cipher.update(plain),cipher.final()]);
 const encrypted=Buffer.concat([iv,cipher.getAuthTag(),ciphertext]);
 try{fs.writeFileSync(file,'PPENC1\n'+encrypted.toString('base64'));assert.deepEqual(L.decryptPack(fixture),plain);assert.throws(()=>L.decryptPack({...fixture,sha256:'0'.repeat(64)}));encrypted[28]^=1;fs.writeFileSync(file,'PPENC1\n'+encrypted.toString('base64'));assert.throws(()=>L.decryptPack(fixture));}
 finally{fs.unlinkSync(file);if(saved===undefined)delete process.env.PLANNING_FILE_KEY;else process.env.PLANNING_FILE_KEY=saved;}
});
test('planning status fails closed, never exposes configuration and rejects other products',async()=>{
 const handler=require('../api/planning-status');
 for(const slug of slugs){const r=response();await handler({method:'GET',query:{product:slug}},r);assert.equal(r.statusCode,200);assert.equal(r.json.ready,false);assert.deepEqual(Object.keys(r.json).sort(),['currency','price','prices','product','ready']);}
 const r=response();await handler({method:'GET',query:{product:'money-audit'}},r);assert.equal(r.statusCode,400);
});
test('planning checkout rejects an unsupported currency before attempting an order',async()=>{
 const saved={};for(const k of ['RAZORPAY_KEY_ID','RAZORPAY_KEY_SECRET','DOWNLOAD_SIGNING_SECRET']){saved[k]=process.env[k];process.env[k]='test';}
 try{const r=response();await require('../api/create-order')({method:'POST',headers:{},body:{product:slugs[0],plan:'eur'}},r);assert.equal(r.statusCode,400);assert.equal(r.json.error,'unsupported_price_plan');}
 finally{for(const [k,v]of Object.entries(saved))if(v===undefined)delete process.env[k];else process.env[k]=v;}
});
test('new product pages use exact contents and fail-closed purchase controls',()=>{
 for(const slug of slugs){
  const root=path.join(__dirname,'..');const html=fs.readFileSync(path.join(root,'products',slug,'index.html'),'utf8');
  assert.match(html,/class="planning-buy button"[^>]*hidden/);assert.match(html,/fictional/i);
  assert.match(html,/Native Excel and Google Sheets import have not yet been verified/);
  const checkout=fs.readFileSync(path.join(root,'checkout',slug,'index.html'),'utf8');
  assert.match(checkout,/value="usd" disabled/);assert.match(checkout,/value="inr" disabled/);assert.equal((checkout.match(/class="pay-option/g)||[]).length,2);assert.match(checkout,/₹2,999/);
  const p=L.catalog.bySlug(slug);assert.match(p.sha256,/^[a-f0-9]{64}$/);assert.ok(p.bytes<3500000);
  assert.ok(fs.readFileSync(path.join(root,'private',p.file),'ascii').startsWith('PPENC1\n'));
 }
});

test('planning readiness enables both prices only for an exact valid response',async()=>{
 const valid={product:slugs[0],ready:true,price:49,currency:'USD',prices:{inr:{amount:299900,currency:'INR'},usd:{amount:4900,currency:'USD'}}};
 for(const reply of [valid,{...valid,ready:false},{...valid,prices:undefined},{...valid,prices:{...valid.prices,inr:{amount:1,currency:'INR'}}},{...valid,prices:{...valid.prices,usd:{amount:299900,currency:'INR'}}}]){
  const buttons=[{disabled:true},{disabled:true}],links=[{hidden:true}],statuses=[{}];
  const document={body:{dataset:{planning:slugs[0]}},querySelectorAll:s=>s==='.pay-option'?buttons:s==='.planning-buy'?links:statuses};
  await vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/planning-ready.js'),'utf8'),{document,fetch:async()=>({ok:true,json:async()=>reply}),encodeURIComponent});
  await new Promise(resolve=>setImmediate(resolve));
  assert.ok(buttons.every(b=>b.disabled===(reply!==valid)));assert.equal(links[0].hidden,reply!==valid);
 }
});
