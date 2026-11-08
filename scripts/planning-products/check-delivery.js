'use strict';
// Uses only the local mock payment service. Makes no real payment and sends no email.
const assert=require('node:assert/strict');const fs=require('node:fs');const crypto=require('node:crypto');
const {startMockRazorpay,startSite}=require('../../tests/dev-server');
const products=require('../../api/_planning-products.json');
const key=fs.readFileSync('.env.planning','utf8').match(/^PLANNING_FILE_KEY=([a-f0-9]{64})$/m)?.[1];
if(!key)throw Error('Build product packages first');
process.env.PLANNING_FILE_KEY=key;process.env.DOWNLOAD_SIGNING_SECRET=crypto.randomBytes(32).toString('hex');
const post=async(path,body)=>fetch('http://localhost:4380'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
(async()=>{
 const mock=await startMockRazorpay(4381),site=await startSite(4380,4381);
 try{for(const p of products)for(const plan of ['inr','usd']){
  const status=await(await fetch('http://localhost:4380/api/planning-status?product='+p.slug)).json();assert.equal(status.ready,true);
  const orderResponse=await post('/api/create-order',{product:p.slug,plan,amount:1,currency:'EUR'});assert.equal(orderResponse.status,200);
  const order=await orderResponse.json();assert.equal(order.amount,plan==='inr'?p.amount_inr:p.amount);assert.equal(order.currency,plan==='inr'?'INR':'USD');
  const pay=await(await fetch('http://localhost:4381/__pay/'+order.order_id,{method:'POST',body:'{}'})).json();
  const verified=await post('/api/verify',{...pay,product:p.slug});assert.equal(verified.status,200);const v=await verified.json();assert.ok(v.token);
  const download=await fetch('http://localhost:4380/api/download?t='+encodeURIComponent(v.token));assert.equal(download.status,200);assert.match(download.headers.get('content-type'),/application\/zip/);
  const bytes=Buffer.from(await download.arrayBuffer());assert.equal(bytes.length,p.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),p.sha256);
  const wrong=await post('/api/verify',{...pay,product:products.find(o=>o.slug!==p.slug).slug});assert.equal(wrong.status,403);
  const noToken=await fetch('http://localhost:4380/api/download');assert.equal(noToken.status,403);
  console.log(`${p.slug} (${plan}): fixed price, mock payment, verified ZIP, cross-product rejection and unsigned-download rejection passed.`);
 }}finally{site.close();mock.server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
