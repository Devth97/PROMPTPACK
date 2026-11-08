'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {calculate}=require('../assets/bakery-calculator');
const example={yield:12,quantity:14,ingredients:240,hours:.75,rate:200,packaging:10,overhead:40,margin:25};
const root=path.join(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
test('Free bakery example independently reconciles whole batches and margin',()=>{
 const r=calculate(example);
 assert.equal(r.batches,2);assert.equal(r.produced,24);assert.equal(r.spare,10);
 assert.equal(r.ingredients,480);assert.equal(r.labour,300);assert.equal(r.packaging,140);assert.equal(r.overhead,80);assert.equal(r.total,1000);
 assert.ok(Math.abs(r.scenario-4000/3)<1e-9);assert.ok(Math.abs((r.scenario-r.total)/r.scenario-.25)<1e-12);
 assert.ok(Math.abs(r.perUnit-r.scenario/14)<1e-9);
 const twelve=calculate({...example,quantity:12});assert.equal(twelve.batches,1);assert.equal(twelve.spare,0);assert.equal(twelve.total,550);
 const thirteen=calculate({...example,quantity:13});assert.equal(thirteen.batches,2);assert.equal(thirteen.packaging,130);
});
test('Free bakery calculator rejects incomplete, nonfinite and out-of-range assumptions',()=>{
 for(const [key,value] of [['yield',0],['yield',1.5],['quantity',-1],['quantity',100001],['ingredients',NaN],['hours',Infinity],['rate','200'],['packaging',null],['overhead',-1],['margin',100],['margin',99.95]])assert.throws(()=>calculate({...example,[key]:value}),key);
 const zero=calculate({...example,ingredients:0,hours:0,rate:0,packaging:0,overhead:0,margin:0});assert.equal(zero.total,0);assert.equal(zero.scenario,0);
 const costOnly=calculate({...example,margin:0});assert.equal(costOnly.scenario,1000);
});
test('Public bakery pages are discoverable and keep the paid workflow and privacy boundaries clear',()=>{
 for(const url of ['/tools/bakery-cost-calculator/','/learn/cake-pricing-india/']){
  const html=read(url.slice(1)+'index.html');
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.ok(html.includes('rel="canonical" href="https://promptpack.tech'+url+'"'));
  assert.match(html,/name="robots" content="index,follow/);
  assert.match(html,/href="\/products\/bakeprice-studio\/"/);
  assert.match(html,/business-measurement\.js/);assert.doesNotMatch(html,/src="[^\"]*\/(?:analytics|conversion)\.js/);
  assert.doesNotMatch(html,/(?:href|src)="[^\"]*(?:private\/|product-build\/|bakeprice-engine)/);
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);assert.ok(graph['@graph'].length>=3);
  assert.ok(read('sitemap.xml').includes('<loc>https://promptpack.tech'+url+'</loc>'));
  for(const file of ['learn/index.html','products/bakeprice-studio/index.html'])assert.ok(read(file).includes('href="'+url+'"'));
  assert.ok(read('llms.txt').includes('https://promptpack.tech'+url));
  for(const [,href] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"?#]*)/g))assert.ok(fs.existsSync(path.join(root,href))||fs.existsSync(path.join(root,href,'index.html')),href);
 }
 const script=read('assets/bakery-calculator.js');assert.doesNotMatch(script,/fetch\(|localStorage|sessionStorage|innerHTML|bakeprice-engine/);
 const tool=read('tools/bakery-cost-calculator/index.html');assert.match(tool,/novalidate/);assert.match(tool,/id="bakery-error" role="alert" hidden/);assert.match(tool,/id="bakery-result"[^>]*hidden/);
 assert.match(tool,/excludes taxes, payment fees, delivery/);
});
