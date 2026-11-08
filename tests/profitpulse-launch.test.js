'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('ProfitPulse offer matches checkout and no longer describes an unlaunched product',()=>{
 const page=read('products/profitpulse/index.html');
 const schema=JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 const product=require('../api/_products').bySlug('profitpulse');
 assert.equal(Number(schema.offers.price)*100,product.amount_inr);
 assert.equal(schema.offers.availability,'https://schema.org/InStock');
 assert.equal(schema.offers.url,'https://promptpack.tech/checkout/profitpulse/');
 for(const file of ['index.html','scripts/build-storefront.js','products/profitpulse/index.html','tools/profit-calculator/index.html']){
  assert.doesNotMatch(read(file),/before the paid download launches|Checkout not yet enabled|Planned launch price|Proposed ₹999|not yet available for purchase|when its secure download is enabled/i,file);
 }
 assert.match(read('checkout/profitpulse/index.html'),/<span>International cards<\/span>/);
 assert.doesNotMatch(read('checkout/profitpulse/index.html'),/if enabled on merchant account/);
 assert.ok(page.includes("See what's inside"));
});

function element(){
 const classes=new Set();
 return {hidden:true,disabled:true,textContent:'',classList:{toggle(c,on){on?classes.add(c):classes.delete(c);},remove(c){classes.delete(c);},contains(c){return classes.has(c);}}};
}

async function availability(reply){
 const elements=Object.fromEntries(['profitpulse-buy','profitpulse-prelaunch','profitpulse-buy-side','profitpulse-availability-note'].map(id=>[id,element()]));
 const buttons=[element(),element()],status=element();
 let requested;
 const context={document:{getElementById:id=>elements[id],querySelector:()=>status,querySelectorAll:()=>buttons},fetch:async(url,options)=>{
  requested={url,options};
  if(reply instanceof Error)throw reply;
  return {ok:reply.ok!==false,json:async()=>reply};
 }};
 await vm.runInNewContext(read('assets/profitpulse-ready.js'),context);
 return {elements,buttons,status,requested};
}

test('Only a verified matching product enables both payment options',async()=>{
 const {elements,buttons,status,requested}=await availability({product:'profitpulse',ready:true});
 assert.equal(requested.url,'/api/profitpulse-status');
 assert.equal(requested.options.cache,'no-store');
 assert.equal(elements['profitpulse-buy'].hidden,false);
 assert.equal(elements['profitpulse-buy-side'].hidden,false);
 assert.equal(elements['profitpulse-prelaunch'].hidden,true);
 assert.ok(buttons.every(button=>button.disabled===false));
 assert.match(status.textContent,/Choose your payment option/);
});

test('Unavailable, invalid and failed availability checks keep checkout closed with useful copy',async()=>{
 for(const reply of [{product:'profitpulse',ready:false},{product:'other',ready:true},{product:'profitpulse',ready:'true'},{ok:false},new Error('offline')]){
  const {elements,buttons,status}=await availability(reply);
  assert.equal(elements['profitpulse-buy'].hidden,true);
  assert.equal(elements['profitpulse-buy-side'].hidden,true);
  assert.ok(buttons.every(button=>button.disabled===true));
  assert.match(status.textContent,/temporarily unavailable/);
  assert.match(elements['profitpulse-prelaunch'].textContent,/temporarily unavailable/);
 }
});

function calculator(overrides={}){
 const html=read('tools/profit-calculator/index.html');
 const elements={};
 for(const match of html.matchAll(/<input id="([^"]+)"[^>]*>/g)){
  const tag=match[0],value=String(overrides[match[1]]??tag.match(/value="([^"]+)"/)[1]);
  const min=Number(tag.match(/min="([^"]+)"/)[1]),max=Number(tag.match(/max="([^"]+)"/)?.[1]??Infinity);
  const step=Number(tag.match(/step="([^"]+)"/)[1]),n=Number(value);
  elements[match[1]]={...element(),value,validity:{valid:Number.isFinite(n)&&n>=min&&n<=max&&Math.abs((n-min)/step-Math.round((n-min)/step))<1e-7},addEventListener(){}};
 }
 for(const id of ['maxcac','roas','keep','net','revenue','item','shipping','fees','calc-error'])elements[id]=element();
 const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
 vm.runInNewContext(script,{document:{getElementById:id=>elements[id]}});
 return elements;
}

test('Calculator reproduces a simple independently calculated order and handles zero retained orders',()=>{
 const simple={price:1000,cogs:400,forward:50,reverse:0,pack:10,codfee:0,codshare:0,codrto:0,prepaidrto:0,returns:0,loss:0,pg:0,feegst:0,gst:0,cac:100};
 const result=calculator(simple);
 assert.equal(result.maxcac.textContent,'₹540');
 assert.equal(result.net.textContent,'₹440');
 assert.equal(result.roas.textContent,'1.85×');
 assert.equal(result.keep.textContent,'100.0%');
 assert.equal(result['calc-error'].hidden,true);
 const none=calculator({...simple,returns:100});
 assert.equal(none.maxcac.textContent,'₹0');
 assert.equal(none.roas.textContent,'Not viable');
 assert.equal(none.net.textContent,'₹-160');
 assert.equal(none.net.classList.contains('fail'),true);
});

test('Calculator does not report a result for missing, negative or out-of-range inputs',()=>{
 for(const overrides of [{price:''},{cogs:-1},{codshare:101},{pg:Infinity},{price:'not-a-number'}]){
  const result=calculator(overrides);
  assert.equal(result['calc-error'].hidden,false);
  for(const id of ['maxcac','net','keep','roas','revenue','item','shipping','fees'])assert.equal(result[id].textContent,'—');
 }
});
