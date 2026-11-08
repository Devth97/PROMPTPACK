'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const {articles,hub,validate}=require('../scripts/build-blog-library');
test('100 distinct full articles are linked from the hub, sitemap and feed',()=>{
 validate();assert.equal(articles.length,100);
 assert.equal(new Set(articles.map(a=>a.example.join(' '))).size,100);
 const index=read(hub.slice(1)+'index.html'),sitemap=read('sitemap.xml'),feed=read(hub.slice(1)+'feed.xml');
 assert.equal((index.match(/data-blog-card/g)||[]).length,100);
 assert.ok(read('blog/index.html').includes('href="'+hub+'"'));
 assert.ok(read('llms.txt').includes('https://promptpack.tech'+hub));
 for(const article of articles){
  const html=read(article.url.slice(1)+'index.html');
  assert.ok(index.includes('href="'+article.url+'"'));
  assert.equal((sitemap.match(new RegExp('<loc>https://promptpack.tech'+article.url+'</loc>','g'))||[]).length,1);
  assert.ok(feed.includes('<link>https://promptpack.tech'+article.url+'</link>'));
  assert.ok(html.includes('rel="canonical" href="https://promptpack.tech'+article.url+'"'));
  assert.match(html,/name="robots" content="index,follow/);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  for(const heading of ['The starting point','What to do','What the result means','Check before you use it'])assert.ok(html.includes(heading));
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const schema=graph.find(s=>s['@type']==='BlogPosting');assert.equal(schema.headline,article.name);assert.equal(schema.mainEntityOfPage,'https://promptpack.tech'+article.url);
  assert.ok(!schema.datePublished,'Do not invent a publication date before release');
  const words=html.match(/<article class="library-article">([\s\S]*?)<\/article>/)[1].replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean).length;
  assert.ok(words>350,article.name+': incomplete article');
  for(const [,url] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"?]*)/g)){
   const [route,fragment]=url.split('#');let file=path.join(root,route);if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');assert.ok(fs.existsSync(file),article.url+': '+url);if(fragment&&file.endsWith('.html'))assert.ok(read(path.relative(root,file)).includes('id="'+fragment+'"'),url);
  }
 }
 assert.deepEqual(require('../scripts/audit-search').audit(root).errors,[]);
});
test('blog search handles words, empty results and reset without requiring network',()=>{
 const makeCard=text=>({textContent:text,hidden:false});const cards=[makeCard('Cake costing with whole batches'),makeCard('SalON captions')];
 const input={value:''},status={textContent:''},empty={hidden:true};const events={};
 const form={hidden:true,addEventListener:(name,fn)=>events[name]=fn};input.addEventListener=(name,fn)=>events['input:'+name]=fn;input.focus=()=>{};
 const group={hidden:false,querySelectorAll:()=>cards};
 const document={querySelector:()=>form,querySelectorAll:selector=>selector==='[data-blog-card]'?cards:[group],getElementById:id=>id==='blog-search'?input:id==='blog-results'?status:empty};
 vm.runInNewContext(read('assets/blog-library.js'),{document});assert.equal(form.hidden,false);
 input.value='CAKE batches';events['input:input']();assert.equal(cards[0].hidden,false);assert.equal(cards[1].hidden,true);assert.equal(status.textContent,'1 of 2 articles');
 input.value='xyz';events['input:input']();assert.equal(empty.hidden,false);assert.equal(group.hidden,true);
 events.reset();assert.equal(input.value,'');assert.ok(cards.every(c=>!c.hidden));assert.equal(empty.hidden,true);
});
test('IndexNow refuses missing or mismatched production content and only reports receipt',async()=>{
 const {submit,urls,keyFile}=require('../scripts/submit-blog-indexnow'),key=read(keyFile).trim();
 assert.equal((await submit()).submitted,false);
 let posted=false;
 await assert.rejects(submit({send:true,request:async(url,options)=>{if(options.method==='POST')posted=true;return {ok:false,status:404};}}),/Not submitted/);assert.equal(posted,false);
 await assert.rejects(submit({send:true,request:async url=>({ok:true,status:200,text:async()=>url.endsWith(keyFile)?key:'old page'})}),/production differs/);
 const result=await submit({send:true,request:async(url,options)=>{
  if(options.method==='POST'){const data=JSON.parse(options.body);assert.equal(data.urlList.length,102);assert.ok(data.urlList.every(u=>u.startsWith('https://promptpack.tech/blog/')));posted=true;return {status:200};}
  return {ok:true,status:200,text:async()=>url.endsWith(keyFile)?key:read(new URL(url).pathname.slice(1)+'index.html').replace(/\r?\n/g,'\r\n')};
 }});
 assert.equal(urls.length,102);assert.equal(posted,true);assert.equal(result.submitted,true);assert.match(result.message,/does not establish/);
});
