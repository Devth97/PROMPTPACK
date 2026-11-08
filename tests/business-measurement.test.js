'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
function boot({choice,gpc=false,hostname='promptpack.tech',slug='bakeprice-studio',usd=12,inr=699}={}){
 const nodes=[],scripts=[],values=new Map(choice?[['pp_business_ads_v1',choice]]:[]);
 const storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};
 const element=tag=>{const node={tag,handlers:{},append(){},setAttribute(){},addEventListener:(event,fn)=>{node.handlers[event]=fn;},focus(){}};nodes.push(node);return node;};
 const body=element('body');body.dataset={businessProduct:slug,businessName:'Product name',priceUsd:String(usd),priceInr:String(inr)};
 const document={body,createElement:element,head:{append:node=>scripts.push(node)}},window={navigator:{globalPrivacyControl:gpc}};
 vm.runInNewContext(read('assets/business-measurement.js'),{document,window,localStorage:storage,sessionStorage:storage,URLSearchParams,location:{hostname,pathname:'/products/'+slug+'/',search:'?utm_source=meta&utm_campaign=product_test&email=secret',reload(){}}});
 const calls=()=>Array.from(window.fbq?.queue||[],args=>Array.from(args));
 return {window,scripts,calls,click:text=>{const node=nodes.find(node=>node.textContent===text);assert.ok(node,text);node.handlers.click();}};
}
test('Business tracking and campaign attribution wait for explicit consent',()=>{
 const page=boot();assert.equal(page.scripts.length,0);assert.deepEqual({...page.window.promptpack.attribution()},{});
 page.click('Reject optional cookies');assert.equal(page.scripts.length,0);assert.equal(page.window.promptpack.track('InitiateCheckout'),false);
});
test('Consented business purchases use matching verified product, currency and price once',()=>{
 for(const p of [{slug:'bakeprice-studio',usd:12,inr:699},{slug:'salon-content-sprint',usd:9,inr:499}]){
  const page=boot(p);page.click('Allow advertising cookies');assert.equal(page.scripts.length,1);assert.deepEqual({...page.window.promptpack.attribution()},{utm_source:'meta',utm_campaign:'product_test'});
  const receipt={ok:true,product:p.slug,amount:p.inr*100,currency:'INR',order_id:'order_paid123',token:'PRIVATE_TOKEN',email:'PRIVATE_EMAIL'};
  for(const bad of [{...receipt,ok:false},{...receipt,amount:1},{...receipt,product:'other'}])page.window.promptpack.purchase(bad);
  assert.equal(page.calls().filter(c=>c[1]==='Purchase').length,0);
  page.window.promptpack.purchase(receipt);page.window.promptpack.purchase(receipt);const purchases=page.calls().filter(c=>c[1]==='Purchase');assert.equal(purchases.length,1);assert.equal(purchases[0][2].value,p.inr);assert.doesNotMatch(JSON.stringify(purchases),/PRIVATE_/);
 }
});
test('Previews and global privacy control never load advertising vendors',()=>{
 for(const options of [{hostname:'localhost'},{gpc:true}]){const page=boot({...options,choice:'granted'});assert.equal(page.scripts.length,0);assert.equal(page.calls().length,0);}
});
test('Business pages load consent-aware measurement and keep delivery tracker-free',()=>{
 for(const slug of ['bakeprice-studio','salon-content-sprint'])for(const folder of ['products','checkout']){const html=read(folder+'/'+slug+'/index.html');assert.match(html,/business-measurement.js/);assert.doesNotMatch(html,/src="\/assets\/(analytics|conversion).js"/);}
 assert.doesNotMatch(read('checkout/thanks/index.html'),/business-measurement|analytics.js|conversion.js|fbevents/);
});
