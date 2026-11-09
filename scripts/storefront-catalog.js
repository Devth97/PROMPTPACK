'use strict';
const guides = require('../catalog/products.json');
const editions = require('../catalog/editions.json');
const planning = require('../catalog/planning-products.json');
const planningPrices = require('./planning-prices');
const live = require('./live-products');
const {sectionFor} = require('./site-shell');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categories = [['planning','Planning'],['finance','Finance'],['websites','Websites'],['video','Video'],['social-media','Social Media']];
function products() {
  const items = [
    ...planning.map(p => {const {inr,usd}=planningPrices(p.slug);return {slug:p.slug,name:p.name,category:'Planning',summary:p.slug==='wedding-decision-kit'?'Compare the real cost of each vendor. Keep deposits, guests and next steps together.':'Keep handovers, factual notes and shared expenses organized in your own files.',includes:'Blank + example Excel workbooks · fillable PDF',price:inr,priceNote:'or '+usd+' · one payment',cover:`/assets/planning/${p.slug}-cover.webp`,badge:'New · Excel + PDF',href:`/products/${p.slug}/`};}),
    {slug:'zerocut-checkout',name:'ZeroCut Checkout',category:'Websites',summary:'Own four checkout layouts for your store, with Razorpay payments, COD, upgrades and add-ons. Gateway and operating costs are separate.',includes:'4 checkout layouts · Shopify integration · setup guides',price:'₹999',priceNote:'one payment · no recurring ZeroCut fee',cover:'/zerocut-checkout/assets/zerocut-cover.jpg',badge:'Shopify checkout toolkit',href:'/zerocut-checkout/',checkout:'/checkout/zerocut-checkout/',buyNow:true},
    {slug:'profitpulse',name:'ProfitPulse',category:'Finance',summary:'See what each order really earns. Model shipping, COD returns and ad break-even before you spend.',includes:'Excel toolkit · worked demo · guide + 12 prompts',price:'₹999',priceNote:'or US$19 · one payment',cover:'/assets/product-covers/profitpulse.svg',badge:'India D2C · Excel',href:'/products/profitpulse/'},
    ...guides.map(p => {const e=editions.find(x=>x.slug===p.slug);return {slug:p.slug,name:p.name,category:sectionFor(p).name,summary:p.summary,includes:`${e.pdf_pages}-page guide · ${e.prompt_count} prompts + files`,price:`US$${p.price}`,priceNote:`or ₹${p.price_inr.toLocaleString('en-IN')} · one payment`,cover:`/assets/product-covers/${p.slug}.webp`,badge:'AI creator kit',href:`/products/${p.slug}/`,checkout:`/checkout/${p.slug}/`};}),
    ...live.map(p=>({...p,category:categories.find(([id])=>id===p.sectionId)[1],cover:`/assets/product-covers/${p.slug}.webp`,badge:p.slug==='website-prompts'?'75+ editable prompts':'Personal finance'}))
  ];
  const order=['wedding-decision-kit','profitpulse','zerocut-checkout','two-homes-organizer','motion-with-code','website-prompts','carousel-studio','ugc-ad-scripts','money-audit'];
  return order.map(slug=>items.find(p=>p.slug===slug));
}
function render() {
  const all=products();
  return `<!-- unified-catalog:start --><section id="catalog" class="unified-catalog" aria-labelledby="catalog-heading"><div class="catalog-heading"><div><span class="eyebrow">Your next good idea starts here</span><h2 id="catalog-heading">Find your kind of<br><span>head start.</span></h2></div><p>Make something. Plan something. Get a clearer picture.<br>Choose a kit, see exactly what's inside, and make it yours.</p></div><div class="catalog-tools"><div class="field"><label for="catalog-search">Find a kit for your next project</label><input id="catalog-search" type="search" placeholder="Try wedding, websites or profit…" autocomplete="off"></div><div class="field category-field"><label for="catalog-category">Browse by interest</label><select id="catalog-category"><option value="">All interests</option>${categories.map(([,name])=>`<option>${name}</option>`).join('')}</select></div><button class="clear-search" id="catalog-clear" type="button" hidden>Reset filters</button><p id="catalog-results" class="results" role="status" aria-live="polite">${all.length} of ${all.length} products</p></div><nav class="catalog-interests" aria-label="Browse product interests"><a href="#catalog" data-catalog-category="" aria-current="true">All kits <span>${all.length}</span></a>${categories.map(([id,name])=>`<a id="${id}" href="#${id}" data-catalog-category="${name}">${name}</a>`).join('')}</nav><noscript><p>All ${all.length} kits are listed below. Enable JavaScript to search or filter.</p></noscript><div class="catalog-grid">${all.map((p,i)=>`<article class="card product-card" data-product="${p.slug}" data-category="${p.category}"><a class="product-cover cover-image" href="${p.href}" tabindex="-1" aria-hidden="true"><img src="${p.cover}" width="1200" height="800" ${i<3?'':'loading="lazy"'} alt=""></a><div class="body"><div class="card-topline"><span class="status">${esc(p.badge)}</span><span class="card-category">${esc(p.category)}</span></div><h3><a href="${p.href}">${esc(p.name)}</a></h3><p>${esc(p.summary)}</p><div class="product-meta">${esc(p.includes)}</div><div class="card-bottom"><div><div class="price">${esc(p.price)}</div><small>${esc(p.priceNote)}</small></div><a class="card-link" href="${p.buyNow?p.checkout:p.href}">${p.buyNow?'Buy now':p.category==='Planning'?'Preview kit':'See the kit'} <span aria-hidden="true">↗</span></a></div>${p.buyNow?`<a class="card-examples" href="${p.href}">See the kit and try the demos →</a>`:p.checkout?`<a class="card-examples" href="${p.checkout}">Ready? Go to checkout →</a>`:''}</div></article>`).join('')}</div><p id="catalog-empty" class="empty" hidden>No kits match those filters. Try a different word or reset the filters.</p><div class="catalog-reassurance"><span>↗ See the contents before you buy</span><span>✓ One payment. No PromptPack subscription.</span><a href="/contact">Need help choosing? Ask us →</a></div></section><!-- unified-catalog:end -->`;
}
function upgrade(html) {
  html=html.replace(/<!-- unified-catalog:start -->[\s\S]*?<!-- unified-catalog:end -->/,'')
    .replace(/<!-- planning-shelf:start -->[\s\S]*?<!-- planning-shelf:end -->/,'')
    .replace(/<section id="catalog"[\s\S]*?(?=<section class="how-section")/,'')
    .replace(/<nav class="category-rail"[\s\S]*?<\/nav>/,'')
    .replace(/<section class="kit-chooser"[\s\S]*?<\/section>/,'')
    .replace(/<section class="shelf-strip"[\s\S]*?<\/section>/,'')
    .replace(/<dl class="hero-stats">[\s\S]*?<\/dl>/,'');
  html=html.replace('<section class="profit-feature"',render()+'<section class="profit-feature"');
  html=html.replace(/<h1>[\s\S]*?<\/h1>/,'<h1>Good ideas.<br><mark>Ready to use.</mark></h1>')
    .replace(/<p class="hero-copy">[\s\S]*?<\/p>/,'<p class="hero-copy">Practical digital kits for creative projects, clearer finances and everyday plans. Browse the actual files, find your fit, and pay once.</p>')
    .replace('AI kits for creators · instant download','Create. Plan. Make progress.')
    .replace('href="#kit-chooser-heading"','href="#catalog"')
    .replace(/(?:5 ready-to-use AI kits|\d+ digital kits to explore)/g,`${products().length} digital kits to explore`)
    .replace(/Works with ChatGPT, Claude, Gemini and Cursor/g,'AI creator kits + practical planning tools')
    .replace(/Free samples before you buy/g,'Real previews before you buy')
    .replace(/(?:All five products have purchase routes\.|Explore all (?:eight|nine|\d+) kits in the catalog\.)[^<]*/g,`Explore all ${products().length} kits in the catalog. Each product page explains its files, requirements and purchase options.`);
  if(!html.includes('/assets/storefront-grid.css'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/storefront-grid.css"></head>');
  html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(tag,text)=>{
    const schema=JSON.parse(text),collection=schema['@graph']?.find(s=>s['@type']==='CollectionPage');
    if(!collection)return tag;
    collection.mainEntity={ '@type':'ItemList',numberOfItems:products().length,itemListElement:products().map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:'https://promptpack.tech'+p.href}))};
    return `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`;
  });
  return html.replace(/[ \t]+(?=\r?\n)/g,'');
}
module.exports={products,render,upgrade};
