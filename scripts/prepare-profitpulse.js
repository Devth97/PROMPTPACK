'use strict';
// Prepare the paid ProfitPulse archive for PromptPack's existing AES-256-GCM
// fulfillment. Run locally using the EXISTING PROFITPULSE_FILE_KEY; never commit
// the plaintext customer ZIP, .env.local, or the key.
// Usage:
//   node scripts/prepare-profitpulse.js /path/to/ProfitPulse_Paid_Customer_Download.zip
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const product=require('../api/_products').bySlug('profitpulse');
if(!product)throw Error('ProfitPulse is not registered in api/_products.js');
const source=process.argv[2]||path.join(root,'product-build','profitpulse','ProfitPulse_Paid_Customer_Download.zip');
if(!fs.existsSync(source))throw Error('Customer ZIP not found: '+source);
const zip=fs.readFileSync(source);
const digest=crypto.createHash('sha256').update(zip).digest('hex');
if(digest!==product.sha256||zip.length!==product.bytes)
 throw Error('Archive does not match registered ProfitPulse content. Expected SHA-256 '+product.sha256+' and '+product.bytes+' bytes. Received '+digest+' and '+zip.length+'. Stop; review content before changing metadata.');
if(zip.length>4_000_000)throw Error('ZIP exceeds serverless response limit.');
let keyHex=(process.env.PROFITPULSE_FILE_KEY||'').trim();
if(!keyHex){
  const envFile=path.join(root,'.env.local');
  if(fs.existsSync(envFile)){
    const line=fs.readFileSync(envFile,'utf8').split(/\r?\n/).find(x=>/^PROFITPULSE_FILE_KEY=/.test(x));
    if(line)keyHex=line.slice('PROFITPULSE_FILE_KEY='.length).replace(/^["']|["']$/g,'').trim();
  }
}
if(!/^[0-9a-f]{64}$/i.test(keyHex))throw Error('Use the configured PROFITPULSE_FILE_KEY (64 hex chars) in local env. Never expose it. Existing paid downloads must retain their working key.');
const key=Buffer.from(keyHex,'hex');
const output=path.join(root,'private',product.file);
fs.mkdirSync(path.dirname(output),{recursive:true});
const decrypt=b=>{const d=crypto.createDecipheriv('aes-256-gcm',key,b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return Buffer.concat([d.update(b.subarray(28)),d.final()]);};
if(fs.existsSync(output)){
 try{
  const old=fs.readFileSync(output);
  const armor=Buffer.from([80,80,69,78,67,49,10]);
  if(old.subarray(0,armor.length).equals(armor)){
    const bytes=Buffer.from(old.subarray(armor.length).toString('ascii').trim(),'base64');
    if(decrypt(bytes).equals(zip)){
      console.log('Armored encrypted ProfitPulse file already matches the verified customer archive.');
      process.exit(0);
    }
  }
 }catch(_){}
}
const iv=crypto.randomBytes(12);
const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
const bytes=Buffer.concat([iv,Buffer.alloc(16),cipher.update(zip),cipher.final()]);
cipher.getAuthTag().copy(bytes,12);
if(!decrypt(bytes).equals(zip))throw Error('Encryption round-trip failed.');
const armored=Buffer.concat([Buffer.from([80,80,69,78,67,49,10]),Buffer.from(bytes.toString('base64'),'ascii'),Buffer.from([10])]);
fs.writeFileSync(output,armored,{mode:0o600});
console.log('Prepared verified Base64-armored encrypted archive at '+path.relative(root,output));
console.log('Encrypted bytes: '+bytes.length+'; armored bytes: '+armored.length+'; plaintext SHA-256: '+digest);
console.log('Only commit the armored .enc file, never the .zip or any encryption key.');
