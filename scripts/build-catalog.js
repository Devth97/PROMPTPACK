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
const esc = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const {nav, footer, sectionFor} = require('./site-shell');
function page(title, description, url, body, schema, imagePath = '/assets/cover.png', keywords = '') {
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${keywords ? `<meta name="keywords" content="${esc(keywords)}">` : ''}<link rel="canonical" href="${origin}${url}"><meta name="theme-color" content="#FFFBF2"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta property="og:type" content="website"><meta property="og:site_name" content="PromptPack"><meta property="og:locale" content="en_US"><meta property="og:url" content="${origin}${url}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${origin}${imagePath}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${origin}${imagePath}"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="/assets/theme.css"><link rel="stylesheet" href="/assets/catalog.css"><link rel="stylesheet" href="/assets/brand-visuals.css"><link rel="stylesheet" href="/assets/effects.css"><script src="/assets/catalog.js" defer></script><script src="/assets/effects.js" defer></script><script type="application/ld+json">${json(schema)}</script></head><body><a class="skip" href="#main">Skip to content</a>${nav}<main id="main" class="wrap">${body}</main>${footer}</body></html>\n`;
}
function write(file, value) { fs.mkdirSync(path.dirname(path.join(root, file)), {recursive:true}); fs.writeFileSync(path.join(root, file), value); }
const faq = [
  ['Which packs can I buy now?','All thirteen products have purchase routes. The eleven new guide editions use Razorpay checkout and deliver the complete ZIP after payment verification. You can inspect their actual pages and try a free sample first.'],
  ['What is included in the new packs?','Illustrated PDF field guides, editable prompts, original worked examples, starter files and worksheets. See each product page for its exact contents and requirements. Recorded courses, tool subscriptions and live publishing services are separate.'],
  ['Do the packs include AI tool credits?','No. Use your own AI tools and accounts. Image, video and automation services may charge separately. Review the requirements on each product page.'],
  ['Can I try a prompt before buying?','Yes. Each new guide edition has a sample you can copy and adapt. Outputs depend on the tool, your inputs and the revisions you make.']
];
for (const p of products) {
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
    {'@type':'Product',name:p.name,image:origin+edition.cover,description:edition.subtitle,offers:{'@type':'Offer',price:(sale.amount/100).toFixed(2),priceCurrency:sale.currency,url:origin+'/checkout/'+p.slug+'/',availability:'https://schema.org/InStock'}},
    seo.breadcrumbs([['Home','/'],[section.name,'/#'+section.id],[p.name,url]]),
    seo.faqPage(productFaq,url)]};
  write('products/'+p.slug+'/index.html',page(title,description,url,productPage(p,edition,sources,esc,{related,live,faq:productFaq}),schema,edition.cover,keywords));
}
const sitemapFile = path.join(root, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapFile,'utf8').replace(/\s*<url>\s*<loc>https:\/\/promptpack\.tech\/products\/[^<]*<\/loc>[\s\S]*?<\/url>/g,'');
// /products/ only forwards to the home catalog, so it is not listed. The home page changes with the catalog.
sitemap = sitemap.replace(/(<loc>https:\/\/promptpack\.tech\/<\/loc>\s*<lastmod>)[^<]*/,`$1${seo.updated}`);
sitemap = sitemap.replace('</urlset>', ['/products/website-prompts/',...products.map(p=>'/products/'+p.slug+'/')].map(url=>`  <url><loc>${origin}${url}</loc><lastmod>${seo.updated}</lastmod></url>`).join('\n')+'\n</urlset>');
fs.writeFileSync(sitemapFile,sitemap);
console.log(`Built catalog and ${products.length} product pages.`);
require('./build-storefront')({page, write, products, faq, origin});
require('./build-checkout')({page,write,products,editions,origin,esc});
require('./build-seo')({write, products, editions, sources, live, faq});
