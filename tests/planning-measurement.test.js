'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = process.env.PP_ROOT || path.join(__dirname, '..');
const source = () => fs.readFileSync(path.join(root, 'assets/planning-measurement.js'), 'utf8');
function boot({slug = 'wedding-decision-kit', choice, hostname = 'promptpack.tech', blocked = false, gpc = false, session, search='?utm_source=meta&utm_campaign=wedding_v1&email=secret@example.com&gclid=secret'} = {}) {
  const nodes = [], scripts = [], values = new Map(choice ? [['pp_planning_ads_v1', choice]] : []);
  const storage = {getItem(k) {if (blocked) throw Error('blocked'); return values.get(k) || null;}, setItem(k,v) {if (blocked) throw Error('blocked'); values.set(k,v);}};
  const element = tag => {
    const node = {tag, hidden:false, children:[], handlers:{}, append(...children) {this.children.push(...children);}, setAttribute(k,v) {this[k]=v;}, addEventListener(k,fn) {this.handlers[k]=fn;}, focus() {}, textContent:''};
    nodes.push(node); return node;
  };
  const body = element('body'); body.dataset = {planning:slug,usdMinor:'2900',inrMinor:'149900'};
  const document = {body, createElement:element, head:{append(node) {scripts.push(node);}}};
  const window = {navigator:{globalPrivacyControl:gpc}};
  let reloads = 0;
  session = session || storage;
  vm.runInNewContext(source(), {window, document, localStorage:storage, sessionStorage:session, URLSearchParams, Set, location:{hostname,pathname:'/products/'+slug+'/',search,reload() {reloads++;}}});
  const click = label => {const node = nodes.find(n => n.textContent === label); assert.ok(node, label); node.handlers.click();};
  const calls = () => (window.fbq?.queue || []).map(args => [...args]);
  return {window, scripts, nodes, click, calls, storage, session, reloads:() => reloads};
}
const receipt = {ok:true,order_id:'order_paid123',product:'wedding-decision-kit',product_name:'The Wedding Decision Kit',amount:2900,currency:'USD',token:'private-download-token',email:'secret@example.com'};
test('no tracking or marketing attribution before consent; rejection keeps checkout API usable', () => {
  const page = boot();
  assert.equal(page.scripts.length, 0);
  assert.deepEqual({...page.window.promptpack.attribution()}, {});
  page.window.promptpack.purchase(receipt);
  page.click('Reject optional cookies');
  assert.equal(page.scripts.length, 0);
  assert.equal(page.window.promptpack.track('InitiateCheckout', {}), false);
});
test('explicit consent initializes only the existing Meta pixel and sends one product view', () => {
  const page = boot(); page.click('Allow advertising cookies');
  assert.equal(page.scripts.length, 1);
  assert.equal(page.scripts[0].src, 'https://connect.facebook.net/en_US/fbevents.js');
  assert.ok(page.calls().some(c => c[0] === 'init' && c[1] === '2116311975585050'));
  assert.equal(page.calls().filter(c => c[1] === 'ViewContent').length, 1);
  assert.deepEqual({...page.window.promptpack.attribution()}, {utm_source:'meta',utm_campaign:'wedding_v1'});
});
test('consented attribution survives navigation and resets for a newly tagged visit', () => {
  const first=boot(); first.click('Allow advertising cookies');
  const next=boot({choice:'granted',session:first.session,search:''});
  assert.deepEqual({...next.window.promptpack.attribution()},{utm_source:'meta',utm_campaign:'wedding_v1'});
  const changed=boot({choice:'granted',session:first.session,search:'?utm_source=google'});
  assert.deepEqual({...changed.window.promptpack.attribution()},{utm_source:'google'});
});
test('only a matching verified $29 USD purchase is measured once, without sensitive fields', () => {
  const page = boot({choice:'granted'}), api = page.window.promptpack;
  for (const invalid of [{...receipt,ok:false},{...receipt,product:'two-homes-organizer'},{...receipt,amount:1},{...receipt,currency:'INR'}]) api.purchase(invalid);
  assert.equal(page.calls().filter(c => c[1] === 'Purchase').length, 0);
  api.purchase(receipt); api.purchase(receipt);
  const purchases = page.calls().filter(c => c[1] === 'Purchase');
  assert.equal(purchases.length, 1);
  assert.equal(purchases[0][2].value, 29);
  assert.equal(purchases[0][3].eventID, receipt.order_id);
  assert.doesNotMatch(JSON.stringify(purchases), /private-download-token|secret@example/);
});
test('sensitive organizer pages, previews and global privacy control never load vendors', () => {
  for (const opts of [{slug:'two-homes-organizer'},{hostname:'localhost'},{gpc:true}]) {
    const page = boot({...opts,choice:'granted'});
    page.window.promptpack.purchase(receipt);
    assert.equal(page.scripts.length, 0);
    assert.equal(page.calls().length, 0);
  }
});
test('blocked storage does not interrupt checkout; consent withdrawal stops events and reloads', () => {
  const page = boot({blocked:true}); page.click('Allow advertising cookies');
  assert.doesNotThrow(() => page.window.promptpack.purchase(receipt));
  page.click('Advertising preferences'); page.click('Reject optional cookies');
  const before = page.calls().length;
  page.window.promptpack.purchase({...receipt,order_id:'order_other'});
  assert.equal(page.calls().length,before);
  assert.equal(page.reloads(),1);
});
test('generated planning pages use only consent-aware measurement; delivery page stays tracker-free', () => {
  for (const slug of ['wedding-decision-kit','two-homes-organizer']) for (const folder of ['products','checkout']) {
    const html=fs.readFileSync(path.join(root,folder,slug,'index.html'),'utf8');
    assert.match(html,/src="\/assets\/planning-measurement\.js\?v=[a-f0-9]+"/);
    assert.doesNotMatch(html,/src="\/assets\/(analytics|conversion).js"/);
  }
  const thanks=fs.readFileSync(path.join(root,'checkout/thanks/index.html'),'utf8');
  assert.doesNotMatch(thanks,/analytics.js|conversion.js|planning-measurement.js|fbevents|clarity/);
});
test('checkout does not re-add URL marketing tags after consent or product policy withholds them', async () => {
  for (const opts of [{choice:'denied'}, {choice:'granted',gpc:true}, {choice:'granted',slug:'two-homes-organizer'}]) {
    const page=boot(opts), requests=[];
    let submit;
    const options=[{disabled:false,addEventListener() {}}];
    const form={dataset:{checkout:opts.slug||'wedding-decision-kit'},elements:{email:{value:'buyer@example.com'}},querySelectorAll:()=>options,addEventListener(_,fn) {submit=fn;}};
    const document={querySelector:()=>form,getElementById:()=>({})};
    const window={promptpack:page.window.promptpack,Razorpay:function() {this.on=()=>{};this.open=()=>{};}};
    const fetch=async (url,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({order_id:'order_123',amount:2900,currency:'USD',product_name:'Kit'})};};
    vm.runInNewContext(fs.readFileSync(path.join(root,'assets/checkout.js'),'utf8'),{window,document,fetch,URLSearchParams,location:{search:'?utm_source=meta&utm_campaign=private-email@example.com'}});
    await submit({preventDefault(){},submitter:{value:'usd'}});
    assert.deepEqual({...requests[0].attribution},{});
  }
});

test('verified INR purchase uses INR 1499 and rejects crossed currency amounts', () => {
 const page=boot({choice:'granted'}),api=page.window.promptpack;
 api.purchase({...receipt,amount:149900});
 api.purchase({...receipt,currency:'INR'});
 assert.equal(page.calls().filter(c=>c[1]==='Purchase').length,0);
 const paid={...receipt,amount:149900,currency:'INR'};
 api.purchase(paid);api.purchase(paid);
 const events=page.calls().filter(c=>c[1]==='Purchase');
 assert.equal(events.length,1);assert.equal(events[0][2].value,1499);assert.equal(events[0][2].currency,'INR');
});
