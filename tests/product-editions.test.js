'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('editions: eleven built bundles have source evidence and accurate public previews',()=>{
  const editions=JSON.parse(read('catalog/editions.json'));
  const products=JSON.parse(read('catalog/products.json'));
  const sources=JSON.parse(read('catalog/sources.json'));
  assert.equal(editions.length,11);
  assert.equal(editions.reduce((n,e)=>n+e.prompt_count,0),132);
  // Carousel Studio Visual Edition 2.0 is built outside build-product-editions.py; a regenerated 1.1 bundle must not replace it silently.
  const carousel=editions.find(e=>e.slug==='carousel-studio');
  assert.equal(carousel.edition,'2.0');
  assert.deepEqual([carousel.pdf_pages,carousel.prompt_count],[13,12]);
  assert.equal(carousel.gallery.length,6);
  const carouselPage=read('products/carousel-studio/index.html');
  for(const slide of carousel.gallery){
    assert.ok(fs.statSync(path.join(root,slide.src)).size>500,slide.src);
    assert.ok(slide.alt.length>40 && carouselPage.includes(`src="${slide.src}"`),slide.src);
  }
  assert.deepEqual(new Set(editions.map(e=>e.slug)),new Set(products.map(p=>p.slug)));
  for(const edition of editions){
    assert.equal(edition.content_status,'built');
    assert.equal(edition.sale_status,'checkout-configured');
    assert.ok(edition.pdf_pages>=10);
    assert.match(edition.sha256,/^[a-f0-9]{64}$/);
    assert.equal(edition.lessons.length,6);
    const html=read(`products/${edition.slug}/index.html`);
    assert.ok(html.includes(`${edition.pdf_pages}-page`));
    assert.ok(html.includes(edition.cover));
    for(const image of [edition.cover,edition.inside,edition.example])assert.ok(fs.statSync(path.join(root,image)).size>500,image);
    if(edition.video){
      // A listed demo needs its exported MP4 and the poster the product page references.
      const poster=`/assets/product-previews/${edition.slug}-poster.jpg`;
      for(const file of [edition.video,poster])assert.ok(fs.statSync(path.join(root,file)).size>500,file);
      assert.ok(html.includes(`src="${edition.video}"`)&&html.includes(`poster="${poster}"`));
    }
    for(const id of edition.sources){
      const source=sources.find(s=>s.id===id);
      assert.ok(source,id);
      assert.match(source.revision,/^[a-f0-9]{40}$/);
      assert.ok(source.license_url.includes(source.revision));
      assert.ok(html.includes(source.license_url));
    }
    assert.doesNotMatch(html,/href="[^\"]*product-build|href="[^\"]*private\/|href="[^\"]*\.zip/);
  }
  assert.match(read('.vercelignore'),/^product-build\/$/m);
  assert.match(read('.gitignore'),/^\/product-build\/$/m);
});

function runUtility(script,value,args=[]){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'promptpack-test-'));
  const file=path.join(dir,'input.json');
  try{
    fs.writeFileSync(file,JSON.stringify(value));
    return spawnSync(process.execPath,[path.join(root,'private/catalog/starters',script),file,...args],{encoding:'utf8'});
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
}

test('queue starter: approval, due time, remote reconciliation and invalid rows',()=>{
  const row={draft_id:'one',content_url:'one.png',scheduled_at:'2026-01-01T00:00:00Z',timezone:'UTC',approval_state:'approved',publish_state:'pending',external_post_id:''};
  const run=rows=>runUtility('validate-queue.mjs',rows,['--now','2026-02-01T00:00:00Z']);
  let result=run([row,{...row,draft_id:'draft',approval_state:'draft'},{...row,draft_id:'future',scheduled_at:'2027-01-01T00:00:00Z'},{...row,draft_id:'unknown',publish_state:'unknown'}]);
  assert.equal(result.status,0,result.stderr);
  const report=JSON.parse(result.stdout);
  assert.deepEqual(report.rows.map(r=>r.decision),['READY FOR HUMAN REVIEW','BLOCKED: not approved','WAIT: not due','BLOCKED: state=unknown']);
  for(const rows of [[row,row],[{...row,timezone:''}],[{...row,timezone:'Bad/Zone'}],[{...row,scheduled_at:'2026-01-01'}],[{...row,publish_state:'published'}],[{...row,approval_state:'yes'}]])assert.notEqual(run(rows).status,0);
});

test('episode starter: incomplete records stay blocked and duplicates fail',()=>{
  const row={id:'one',title:'Desk reset',source_ledger:'sources.csv',video_file:'draft.mp4',channel:'DEMO',script_approved:true,rights_checked:true,captions_reviewed:true,thumbnail_reviewed:true,export_reviewed:true,upload_approved:true};
  let result=runUtility('check-episode.mjs',[row,{...row,id:'two',captions_reviewed:false}]);
  assert.equal(result.status,0,result.stderr);
  const report=JSON.parse(result.stdout);
  assert.match(report.episodes[0].status,/RECORD COMPLETE/);
  assert.equal(report.episodes[1].status,'BLOCKED');
  assert.deepEqual(report.episodes[1].missing,['captions_reviewed']);
  assert.notEqual(runUtility('check-episode.mjs',[row,row]).status,0);
});
