'use strict';
// Build public catalog pages from metadata. Paid pack contents live in private/catalog/.
const fs = require('node:fs');
const path = require('node:path');
const products = require('../catalog/products.json');
const editions = require('../catalog/editions.json');
const sources = require('../catalog/sources.json');
const productPage = require('./product-page');
const live = require('./live-products');
const seo = require('./seo');
const root = path.join(__dirname, '..');
const origin = seo.origin;
const selectedSlug=process.argv.find(arg=>arg.startsWith('--product='))?.slice('--product='.length);
if(selectedSlug!==undefined&&!products.some(p=>p.slug===selectedSlug))throw Error('Unknown product: '+selectedSlug);
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const {nav, footer, sectionFor} = require('./site-shell');
function page(title, description, url, body, schema, imagePath = '/assets/cover.png', keywords = '') {
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${!url.startsWith('/checkout/')?'<meta name="robots" content="index,follow,max-image-preview:large">':''}${url.startsWith('/learn/')?'<link rel="stylesheet" href="/assets/search-guides.css">':''}<title>${esc(title)}</title><meta name="description" content="${esc(description)}">${keywords ? `<meta name="keywords" content="${esc(keywords)}">` : ''}<link rel="canonical" href="${origin}${url}"><meta name="theme-color" content="#FFFBF2"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta property="og:type" content="website"><meta property="og:site_name" content="PromptPack"><meta property="og:locale" content="en_US"><meta property="og:url" content="${origin}${url}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${origin}${imagePath}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${origin}${imagePath}"><link rel="stylesheet" href="/assets/theme.css"><link rel="stylesheet" href="/assets/catalog.css"><link rel="stylesheet" href="/assets/brand-visuals.css"><link rel="stylesheet" href="/assets/effects.css"><script src="/assets/catalog.js" defer></script>${url!=='/checkout/thanks/'?'<script src="/assets/analytics.js" defer></script><script src="/assets/conversion.js" defer></script>':''}<script src="/assets/effects.js" defer></script><script type="application/ld+json">${json(schema)}</script></head><body><a class="skip" href="#main">Skip to content</a>${nav}<main id="main" class="wrap">${body}</main>${footer}</body></html>\n`;
}
// Videos are served from Cloudflare R2 (no egress fees); assets/**/*.mp4 stays the upload source (scripts/upload-media.js).
const mediaOrigin = 'https://media.promptpack.tech';
const withMedia = html => html.replace(/(["'(\s])\/(assets\/[^"'()\s<>?#]+\.mp4)/g, `$1${mediaOrigin}/$2`);
function write(file, value) { fs.mkdirSync(path.dirname(path.join(root, file)), {recursive:true}); fs.writeFileSync(path.join(root, file), file.endsWith('.html') ? withMedia(value) : value); }
const faq = [
  ['Which packs can I buy now?','All five products have purchase routes. The three guide editions use Razorpay checkout and deliver the complete ZIP after payment verification. You can inspect their actual pages and try a free sample first.'],
  ['What is included in the new packs?','Illustrated PDF field guides, editable prompts, original worked examples, starter files and worksheets. See each product page for its exact contents and requirements. Recorded courses, tool subscriptions and live publishing services are separate.'],
  ['Do the packs include AI tool credits?','No. Use your own AI tools and accounts. Image, video and automation services may charge separately. Review the requirements on each product page.'],
  ['Can I try a prompt before buying?','Yes. Each new guide edition has a sample you can copy and adapt. Outputs depend on the tool, your inputs and the revisions you make.']
];
for (const p of products.filter(p=>!selectedSlug||p.slug===selectedSlug)) {
  const edition = editions.find(item=>item.slug===p.slug);
  if (!edition || edition.content_status !== 'built') throw new Error('Build product edition first: '+p.slug);
  const sale=require('../api/_products').bySlug(p.slug);
  if(!sale||sale.sha256!==edition.sha256)throw Error('Prepare checkout bundle: '+p.slug);
  const url = '/products/'+p.slug+'/';
  const index = products.indexOf(p);
  const following = [...products.slice(index+1), ...products.slice(0,index)];
  const related = [...following.filter(o=>sectionFor(o).id===sectionFor(p).id), ...following.filter(o=>sectionFor(o).id!==sectionFor(p).id)].slice(0,3);
  const refs = edition.sources.map(id=>sources.find(source=>source.id===id));
  const productFaq = seo.productFaq(p,edition,refs,live);
  const {title, description, keywords} = seo.productMetadata(p, edition);
  const section = sectionFor(p);
  const schema = {'@context':'https://schema.org','@graph':[seo.organization,seo.website,
    {'@type':'WebPage','@id':origin+url,name:p.name,url:origin+url,description,keywords,...seo.ref,primaryImageOfPage:{'@type':'ImageObject',url:origin+edition.cover},about:{'@id':origin+url+'#guide'}},
    {'@type':'CreativeWork','@id':origin+url+'#guide',name:p.name,description:`${edition.subtitle}. ${edition.outcome}`,creativeWorkStatus:'Published',encodingFormat:'application/pdf',inLanguage:'en',version:edition.edition,dateModified:seo.updated,image:origin+edition.cover,genre:p.category,audience:{'@type':'Audience',audienceType:p.audience},publisher:{'@id':origin+'/#organization'},isBasedOn:refs.map(r=>r.url)},
    {'@type':'Product','@id':origin+url+'#product',sku:p.slug,brand:{'@type':'Brand',name:'PromptPack'},mainEntityOfPage:{'@id':origin+url},name:p.name,image:origin+edition.cover,description:edition.subtitle,offers:{'@type':'Offer',price:(sale.amount/100).toFixed(2),priceCurrency:sale.currency,url:origin+'/checkout/'+p.slug+'/',availability:'https://schema.org/InStock'}},
    seo.breadcrumbs([['Home','/'],[section.name,'/#'+section.id],[p.name,url]]),
    seo.faqPage(productFaq,url)]};
  let html = page(title,description,url,productPage(p,edition,sources,esc,{related,live,faq:productFaq}),schema,edition.cover,keywords);
  if(p.slug==='ugc-ad-scripts') html=html.replace('</head>','<link rel="stylesheet" href="/assets/ugc-landing.css"></head>');
  else if (require('./course-landing').COURSES[p.slug]) html = html.replace('</head>','<link rel="stylesheet" href="/assets/course.css"></head>');
  write('products/'+p.slug+'/index.html',html);
}
if(selectedSlug){
  require('./build-checkout')({page,write,products:products.filter(p=>p.slug===selectedSlug),editions,origin,esc});
  console.log('Built product and checkout pages for '+selectedSlug+'.');
}else{
const previousHome = fs.readFileSync(path.join(root,'index.html'),'utf8');
require('./build-storefront')({page, write, products, faq, origin});
const homeChanged = fs.readFileSync(path.join(root,'index.html'),'utf8') !== previousHome;
const sitemapFile = path.join(root, 'sitemap.xml');
const previousSitemap = fs.readFileSync(sitemapFile,'utf8');
// This pass changes guide editions, not the separate website prompt pack.
const websiteLastmod = seo.updated;
let sitemap = previousSitemap.replace(/\s*<url>\s*<loc>https:\/\/promptpack\.tech\/products\/[^<]*<\/loc>[\s\S]*?<\/url>/g,'');
// /products/ only forwards to the home catalog. Preserve lastmod when home content is unchanged.
if (homeChanged) sitemap = sitemap.replace(/(<loc>https:\/\/promptpack\.tech\/<\/loc>\s*<lastmod>)[^<]*/,`$1${seo.updated}`);
sitemap = sitemap.replace('</urlset>', ['/products/website-prompts/',...products.map(p=>'/products/'+p.slug+'/')].map(url=>`  <url><loc>${origin}${url}</loc><lastmod>${url==='/products/website-prompts/'?websiteLastmod:seo.updated}</lastmod></url>`).join('\n')+'\n</urlset>');
fs.writeFileSync(sitemapFile,sitemap);
console.log(`Built catalog and ${products.length} product pages.`);
require('./build-checkout')({page,write,products,editions,origin,esc});
require('./build-seo')({write, products, editions, sources, live, faq});
require('./guides').build({page,write,products,editions,esc});
const learningUrls=require('./search-guides').build({page,write,products,live,esc});
let discoveryMap=fs.readFileSync(sitemapFile,'utf8').replace(/\s*<url>\s*<loc>https:\/\/promptpack\.tech\/learn\/[^<]*<\/loc>[\s\S]*?<\/url>/g,'');
const watch=require('./watch-pages');
const watchUrls=watch.build({page,write,esc});
// Watch pages carry video sitemap entries (https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps).
const xml=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const videoTags=url=>watch.sitemapVideos().filter(v=>v.url===url).map(v=>`<video:video><video:thumbnail_loc>${xml(v.thumbnail)}</video:thumbnail_loc><video:title>${xml(v.title)}</video:title><video:description>${xml(v.description)}</video:description><video:content_loc>${xml(v.content)}</video:content_loc><video:duration>${v.duration}</video:duration><video:publication_date>${v.published}</video:publication_date></video:video>`).join('');
if(!discoveryMap.includes('xmlns:video='))discoveryMap=discoveryMap.replace('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">');
discoveryMap=discoveryMap.replace('</urlset>',[...learningUrls,...watchUrls].map(url=>`  <url><loc>${origin}${url}</loc><lastmod>${require('./search-guides').reviewed}</lastmod>${videoTags(url)}</url>`).join('\n')+'\n</urlset>');
write('sitemap.xml',discoveryMap);
require('./build-discovery')({write});
console.log(`Optimized ${require('./optimize-html')()} public pages.`);


}
