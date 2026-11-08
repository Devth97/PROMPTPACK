'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {calculate}=require('../scripts/bakeprice-engine');
const root=path.join(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const basic={yield:12,quantity:14,ingredients:[{name:'Base ingredients',packCost:240,packQuantity:1,used:1}],batchHours:1,orderHours:.5,hourlyRate:100,packPerUnit:5,packOrder:10,overheadBatch:20,overheadOrder:0,delivery:0,feePercent:0,fixedFee:0,marginPercent:25,depositPercent:50,roundTo:10,quote:null};

test('Bakery whole batches, labour, quote price and deposit reconcile independently',()=>{
 const r=calculate(basic);
 assert.equal(r.batches,2);assert.equal(r.produced,24);assert.equal(r.spare,10);
 assert.equal(r.ingredients,480);assert.equal(r.labour,250);assert.equal(r.packaging,80);assert.equal(r.overhead,40);assert.equal(r.cost,850);
 assert.equal(r.suggested,1140);assert.equal(r.contribution,290);assert.equal(r.deposit,570);assert.equal(r.balance,570);
 const quote=calculate({...basic,quote:1000,feePercent:2,fixedFee:10,depositPercent:30});
 assert.equal(quote.fees,30);assert.equal(quote.contribution,120);assert.equal(quote.deposit,300);assert.equal(quote.balance,700);assert.equal(quote.margin,12);
 const one=calculate({...basic,quantity:12});assert.equal(one.batches,1);assert.equal(one.spare,0);
});

test('Bakery rejects impossible percentages, invalid units and incomplete costs',()=>{
 for(const p of [{...basic,quantity:0},{...basic,yield:1.5},{...basic,feePercent:75,marginPercent:25},{...basic,depositPercent:101},{...basic,quote:-1},{...basic,batchHours:NaN},{...basic,ingredients:[]},{...basic,ingredients:[{name:'Flour',packCost:10,packQuantity:0,used:1}]}])assert.throws(()=>calculate(p));
 const free=calculate({...basic,quote:0});assert.equal(free.margin,null);assert.equal(free.contribution,-850);
});

test('Business checkout records match public prices and encrypted archive dimensions',()=>{
 const products=require('../catalog/launch-products.json'),sales=require('../api/_business-products.json'),catalog=require('../api/_products');
 assert.equal(sales.length,2);
 for(const p of products){
  const sale=catalog.bySlug(p.slug);assert.ok(sale);assert.equal(sale.amount,p.price*100);assert.equal(sale.amount_inr,p.price_inr*100);assert.match(sale.sha256,/^[a-f0-9]{64}$/);
  assert.equal(fs.statSync(path.join(root,'private',sale.file)).size,sale.bytes+28);
  const page=read('products/'+p.slug+'/index.html'),checkout=read('checkout/'+p.slug+'/index.html');
  assert.equal((page.match(/<h1\b/g)||[]).length,1);assert.match(page,/id="sample"/);assert.match(page,/id="requirements"/);
  const schema=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);assert.equal(Number(schema.offers.price)*100,sale.amount_inr);
  assert.ok(checkout.includes('data-checkout="'+p.slug+'"'));assert.match(checkout,/value="inr" disabled/);assert.match(checkout,/value="usd" disabled/);
  assert.match(checkout,/<span>International cards<\/span>/);assert.match(checkout,/noindex,follow/);
  assert.doesNotMatch(page,/href="[^"]*(?:private|product-build)|src="[^"]*(?:private|product-build)/);
  for(const file of [page,checkout])for(const m of file.matchAll(/(?:href|src)="(\/(?!\/)[^"#?]*)/g)){const local=path.join(root,m[1]);assert.ok(fs.existsSync(local)||fs.existsSync(path.join(local,'index.html')),m[1]);}
 }
});

test('Google search ad assets respect current headline and description limits',()=>{
 for(const p of require('../catalog/launch-products.json')){
  assert.ok(p.google_headlines.length>=3&&p.google_headlines.length<=15);
  assert.ok(p.google_descriptions.length>=2&&p.google_descriptions.length<=4);
  for(const h of p.google_headlines)assert.ok(h.length<=30,h+' / '+h.length);
  for(const d of p.google_descriptions)assert.ok(d.length<=90,d+' / '+d.length);
 }
});

test('Availability endpoint fails closed and does not serve arbitrary product IDs',async()=>{
 const handler=require('../api/business-status');
 const response=()=>({setHeader(){},end(text){this.body=JSON.parse(text);}});
 const saved=process.env.DOWNLOAD_FILE_KEY;delete process.env.DOWNLOAD_FILE_KEY;
 try{
  let res=response();await handler({method:'GET',url:'/api/business-status?product=bakeprice-studio'},res);assert.equal(res.statusCode,200);assert.equal(res.body.ready,false);
  res=response();await handler({method:'GET',url:'/api/business-status?product=money-audit'},res);assert.equal(res.statusCode,404);
  res=response();await handler({method:'POST',url:'/api/business-status?product=bakeprice-studio'},res);assert.equal(res.statusCode,405);
 }finally{if(saved!==undefined)process.env.DOWNLOAD_FILE_KEY=saved;}
});

test('Purchase controls stay closed on failed or mismatched availability responses',async()=>{
 const vm=require('node:vm');
 for(const reply of [{product:'bakeprice-studio',ready:true},{product:'bakeprice-studio',ready:false},{product:'other',ready:true},{product:'bakeprice-studio',ready:'true'},new Error('offline')]){
  const links=[{hidden:true},{hidden:true}],buttons=[{disabled:true},{disabled:true}],status={textContent:''};
  const document={body:{dataset:{businessProduct:'bakeprice-studio'}},querySelectorAll:selector=>selector==='[data-business-buy]'?links:buttons,querySelector:()=>status};
  const fetch=async()=>{if(reply instanceof Error)throw reply;return {ok:true,json:async()=>reply};};
  await vm.runInNewContext(read('assets/business-ready.js'),{document,fetch,encodeURIComponent});
  const ready=reply.product==='bakeprice-studio'&&reply.ready===true;
  assert.ok(links.every(link=>link.hidden===!ready));assert.ok(buttons.every(button=>button.disabled===!ready));
 }
});
