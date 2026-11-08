import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const root=process.cwd();
const py=process.env.PLANNING_PYTHON;
if(!py)throw Error('Set PLANNING_PYTHON to the bundled Python executable.');
const verification=JSON.parse(await fs.readFile('output/planning-products/verification.json','utf8'));
if(verification.status!=='passed')throw Error('Run product verification first');
for(const [file,digest]of Object.entries(verification.files || {}))if(crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex')!==digest)throw Error('Workbook changed since verification: '+file);
if(!verification.files || Object.keys(verification.files).length<4)throw Error('Verification manifest incomplete');
const keyFile='.env.planning';let key;
try{key=(await fs.readFile(keyFile,'utf8')).match(/^PLANNING_FILE_KEY=([a-f0-9]{64})$/m)?.[1];}catch(e){if(e.code!=='ENOENT')throw e;}
if(!key){key=crypto.randomBytes(32).toString('hex');await fs.writeFile(keyFile,`PLANNING_FILE_KEY=${key}\n`,{flag:'wx',mode:0o600});}
const catalog=JSON.parse(await fs.readFile('api/_planning-products.json','utf8'));
await fs.mkdir('private/products',{recursive:true});await fs.mkdir('assets/planning',{recursive:true});
for(const p of catalog){
 const dir=path.join('output/planning-products',p.slug), zip=path.join(dir,p.filename);
 const guides=p.slug==='wedding-decision-kit'?['GUIDE.pdf']:['GUIDE-A4.pdf','GUIDE-US-Letter.pdf'];
 const files=['START-HERE.xlsx','EXAMPLE.xlsx','README.txt',...guides];
 execFileSync(py,['-c',`import sys,zipfile,pathlib; d=pathlib.Path(sys.argv[1]); z=zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED); [z.write(d/n,n) for n in sys.argv[3:]]; z.close()`,dir,zip,...files]);
 const plain=await fs.readFile(zip);if(plain.length>3_500_000)throw Error('Archive exceeds delivery budget');
 p.bytes=plain.length;p.sha256=crypto.createHash('sha256').update(plain).digest('hex');
 const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',Buffer.from(key,'hex'),iv);
 const body=Buffer.concat([cipher.update(plain),cipher.final()]);const tag=cipher.getAuthTag();
 const d=crypto.createDecipheriv('aes-256-gcm',Buffer.from(key,'hex'),iv);d.setAuthTag(tag);
 if(!Buffer.concat([d.update(body),d.final()]).equals(plain))throw Error('Encryption round-trip failed');
 await fs.writeFile(path.join('private',p.file),'PPENC1\n'+Buffer.concat([iv,tag,body]).toString('base64')+'\n');
 for(const preview of ['start',p.slug==='wedding-decision-kit'?'quotes':'expenses'])await fs.copyFile(path.join(dir,`preview-${preview}.png`),`assets/planning/${p.slug}-${preview}.png`);
 console.log(`${p.slug}: verified encrypted archive, ${p.bytes} bytes; plaintext stays local.`);
}
await fs.writeFile('api/_planning-products.json',JSON.stringify(catalog,null,2)+'\n');
console.log('Dedicated key saved in ignored .env.planning. Configure PLANNING_FILE_KEY securely in deployment settings; never replace DOWNLOAD_FILE_KEY.');
