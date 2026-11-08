'use strict';
const fs=require('node:fs'),path=require('node:path');
const products=require('../catalog/launch-products.json'),root=path.join(__dirname,'..');
const folder=path.join(root,'product-build/launch-wave2/ad-assets');fs.mkdirSync(folder,{recursive:true});
const assets=products.map(p=>({product:p.slug,final_url:`https://promptpack.tech/products/${p.slug}/?utm_source=google&utm_medium=cpc&utm_campaign=${p.slug}_validation&utm_content=rsa_v1`,keyword_candidates:p.google_keywords,headlines:p.google_headlines.map(text=>({text,characters:text.length})),descriptions:p.google_descriptions.map(text=>({text,characters:text.length})),status:'DRAFT_NOT_UPLOADED'}));
for(const product of assets){for(const h of product.headlines)if(h.characters>30)throw Error('Headline exceeds 30 characters');for(const d of product.descriptions)if(d.characters>90)throw Error('Description exceeds 90 characters');}
fs.writeFileSync(path.join(folder,'google-search-assets.json'),JSON.stringify(assets,null,2)+'\n');
fs.copyFileSync(path.join(root,'docs/business-products-ad-plan.md'),path.join(folder,'AD-PLAN.md'));
console.log('Prepared checked Google Search assets and the Google/Meta launch plan. PNG creative generation uses the reviewed tool screenshots.');
