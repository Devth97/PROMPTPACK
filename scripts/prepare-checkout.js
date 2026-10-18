'use strict';
// Package only encrypted, hash-verified buyer archives; never copy plaintext to deployment.
// Order after any bundle change: python scripts/build-product-editions.py -> node scripts/prepare-checkout.js -> node scripts/build-catalog.js
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const products=require('../catalog/products.json');
const editions=require('../catalog/editions.json');
const local={};
const envFile=path.join(root,'.env.local');
if(fs.existsSync(envFile))for(const line of fs.readFileSync(envFile,'utf8').split(/\r?\n/)){const m=line.match(/^([A-Z0-9_]+)=(.*)$/);if(m)local[m[1]]=m[2];}
const keyHex=(process.env.DOWNLOAD_FILE_KEY||local.DOWNLOAD_FILE_KEY||'').trim();
if(!/^[a-f0-9]{64}$/i.test(keyHex))throw Error('Existing DOWNLOAD_FILE_KEY is required. Keep the deployed Finance key unchanged.');
const key=Buffer.from(keyHex,'hex');
const folder=path.join(root,'private','products');
fs.mkdirSync(folder,{recursive:true});
const catalog=products.map(p=>{
 const edition=editions.find(e=>e.slug===p.slug);
 const plain=fs.readFileSync(path.join(root,'product-build','editions',edition.archive));
 const digest=crypto.createHash('sha256').update(plain).digest('hex');
 if(digest!==edition.sha256)throw Error('Archive hash mismatch: '+p.slug);
 // Vercel serverless responses are capped at 4.5 MB; /api/download returns the whole file in one response.
 if(plain.length>4_000_000)throw Error('Archive too large for single-response delivery: '+p.slug);
 if(!Number.isInteger(p.price)||p.price<1)throw Error('Invalid catalog price: '+p.slug);
 const file='products/'+p.slug+'.enc';
 const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
 const encrypted=Buffer.concat([cipher.update(plain),cipher.final()]);
 fs.writeFileSync(path.join(root,'private',file),Buffer.concat([iv,cipher.getAuthTag(),encrypted]));
 const d=crypto.createDecipheriv('aes-256-gcm',key,iv);d.setAuthTag(cipher.getAuthTag());
 if(!Buffer.concat([d.update(encrypted),d.final()]).equals(plain))throw Error('Encryption check failed: '+p.slug);
 return {id:'promptpack-'+p.slug,slug:p.slug,name:p.name,amount:p.price*100,currency:'USD',file,filename:p.slug+'.zip',type:'application/zip',sha256:digest,bytes:plain.length,thanks:'/checkout/thanks/'};
});
fs.writeFileSync(path.join(root,'api','_products.json'),JSON.stringify(catalog,null,2)+'\n');
for(const edition of editions)edition.sale_status='checkout-configured';
fs.writeFileSync(path.join(root,'catalog','editions.json'),JSON.stringify(editions,null,2)+'\n');
console.log('Prepared '+catalog.length+' encrypted buyer bundles using the existing delivery key.');
