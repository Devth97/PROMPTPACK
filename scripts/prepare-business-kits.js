'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const specs=require('../catalog/launch-products.json');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'product-build/launch-wave2/manifest.json'),'utf8'));
const index=process.argv.indexOf('--env-file'),envFile=index>=0?process.argv[index+1]:path.join(root,'.env.local');
const env={};
if(envFile&&fs.existsSync(envFile))for(const line of fs.readFileSync(envFile,'utf8').split(/\r?\n/)){const m=line.match(/^([A-Z0-9_]+)=(.*)$/);if(m)env[m[1]]=m[2].trim().replace(/^["']|["']$/g,'');}
const hex=(process.env.DOWNLOAD_FILE_KEY||env.DOWNLOAD_FILE_KEY||'').trim();
if(!/^[0-9a-f]{64}$/i.test(hex))throw Error('The existing DOWNLOAD_FILE_KEY is required. Do not rotate it.');
const key=Buffer.from(hex,'hex');
const decrypt=b=>{const d=crypto.createDecipheriv('aes-256-gcm',key,b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return Buffer.concat([d.update(b.subarray(28)),d.final()]);};
const products=[];
for(const spec of specs){
 const m=manifest.find(m=>m.slug===spec.slug);if(!m)throw Error('Build buyer files first: '+spec.slug);
 const zip=fs.readFileSync(path.join(root,m.archive));
 if(zip.length!==m.bytes||zip.length>4_000_000||crypto.createHash('sha256').update(zip).digest('hex')!==m.sha256)throw Error('Buyer archive verification failed: '+spec.slug);
 for(const key of ['price','price_inr'])if(!Number.isInteger(spec[key])||spec[key]<1)throw Error('Invalid price');
 const file='products/'+spec.slug+'.enc',target=path.join(root,'private',file);fs.mkdirSync(path.dirname(target),{recursive:true});
 let old;try{old=decrypt(fs.readFileSync(target));}catch(_){}
 if(!old||!old.equals(zip)){
  const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
  const bytes=Buffer.concat([iv,Buffer.alloc(16),cipher.update(zip),cipher.final()]);cipher.getAuthTag().copy(bytes,12);
  if(!decrypt(bytes).equals(zip))throw Error('Encryption roundtrip failed');fs.writeFileSync(target,bytes);
 }
 products.push({id:'promptpack-'+spec.slug,slug:spec.slug,name:spec.name,amount:spec.price*100,currency:'USD',amount_inr:spec.price_inr*100,file,filename:spec.slug+'.zip',type:'application/zip',sha256:m.sha256,bytes:m.bytes,thanks:'/checkout/thanks/'});
}
fs.writeFileSync(path.join(root,'api/_business-products.json'),JSON.stringify(products,null,2)+'\n');
console.log('Verified and encrypted '+products.length+' buyer bundles using the existing key.');
