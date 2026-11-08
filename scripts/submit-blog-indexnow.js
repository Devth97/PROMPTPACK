'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {articles,hub,validate}=require('./build-blog-library');
const root=path.join(__dirname,'..'),origin='https://promptpack.tech';
const keyFile='indexnow-verification.txt';
const urls=[origin+'/blog/',origin+hub,...articles.map(a=>origin+a.url)];
async function submit({send=false,request=fetch}={}){
 validate();
 const key=fs.readFileSync(path.join(root,keyFile),'utf8').trim();
 if(!/^[a-f0-9]{32}$/.test(key))throw Error('Invalid IndexNow verification file');
 if(!send)return {submitted:false,urls:urls.length,message:'Prepared only. Run with --submit after the exact blog pages are live.'};
 const get=async url=>{const response=await request(url,{signal:AbortSignal.timeout(20000),redirect:'error'});if(!response.ok)throw Error('Not submitted: live URL returned '+response.status+' at '+url);if(/noindex/i.test(response.headers?.get?.('x-robots-tag')||''))throw Error('Not submitted: noindex response at '+url);return response.text();};
 if((await get(origin+'/'+keyFile)).trim()!==key)throw Error('Not submitted: live ownership verification does not match');
 // Submit only when production serves the exact reviewed pages, never preview or missing URLs.
 for(let start=0;start<urls.length;start+=6)await Promise.all(urls.slice(start,start+6).map(async url=>{
  const relative=new URL(url).pathname.slice(1)+'index.html';
  const expected=fs.readFileSync(path.join(root,relative),'utf8');
  const live=await get(url);
  const digest=text=>crypto.createHash('sha256').update(text.replace(/\r\n/g,'\n')).digest('hex');
  if(digest(live)!==digest(expected))throw Error('Not submitted: production differs from reviewed content at '+url);
 }));
 const response=await request('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify({host:'promptpack.tech',key,keyLocation:origin+'/'+keyFile,urlList:urls}),signal:AbortSignal.timeout(30000)});
 if(response.status!==200&&response.status!==202)throw Error('IndexNow rejected the notification: HTTP '+response.status);
 return {submitted:true,urls:urls.length,status:response.status,message:'Notification received; this does not establish search-engine indexation.'};
}
if(require.main===module)submit({send:process.argv.includes('--submit')}).then(result=>console.log(JSON.stringify(result))).catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={submit,urls,keyFile};
