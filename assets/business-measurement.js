'use strict';
(()=>{
 const {businessProduct:slug,businessName:name,priceUsd,priceInr}=document.body.dataset;
 if(!['bakeprice-studio','salon-content-sprint'].includes(slug))return;
 const usd=Number(priceUsd),inr=Number(priceInr);
 if(!Number.isFinite(usd)||!Number.isFinite(inr)||usd<=0||inr<=0)return;
 const production=['promptpack.tech','www.promptpack.tech'].includes(location.hostname);
 const eligible=!window.navigator?.globalPrivacyControl;
 const preferenceKey='pp_business_ads_v1';
 let choice=null,initialized=false;
 try{choice=localStorage.getItem(preferenceKey);}catch(_){}
 const allowed=()=>eligible&&choice==='granted';
 const keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'],params=new URLSearchParams(location.search),attribution={};
 let stored={};if(allowed())try{stored=JSON.parse(sessionStorage.getItem('pp_business_attr')||'{}')||{};}catch(_){}
 const tagged=keys.some(key=>params.has(key));
 for(const key of keys){const value=tagged?params.get(key):stored[key];if(typeof value==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(value))attribution[key]=value;}
 const seen=new Set();
 const track=(event,data={},custom=false,options)=>{
  if(!allowed()||!production||typeof window.fbq!=='function'||!['ViewContent','InitiateCheckout','CheckoutClosed','PaymentFailed','Purchase'].includes(event))return false;
  const safe={content_ids:[slug],content_type:'product',content_name:name};
  if((data.value===usd&&data.currency==='USD')||(data.value===inr&&data.currency==='INR'))Object.assign(safe,{value:data.value,currency:data.currency});
  try{window.fbq(custom?'trackCustom':'track',event,safe,options);return true;}catch(_){return false;}
 };
 window.promptpack={attribution:()=>allowed()?{...attribution}:{},track,purchase(receipt){
  if(!allowed()||!receipt?.ok||receipt.product!==slug||!((receipt.amount===Math.round(usd*100)&&receipt.currency==='USD')||(receipt.amount===Math.round(inr*100)&&receipt.currency==='INR'))||!/^order_[a-zA-Z0-9]+$/.test(receipt.order_id||''))return;
  const key='pp_purchase_'+receipt.order_id;if(seen.has(key))return;
  try{if(localStorage.getItem(key))return;}catch(_){}
  if(track('Purchase',{value:receipt.amount/100,currency:receipt.currency},false,{eventID:receipt.order_id})){seen.add(key);try{localStorage.setItem(key,'1');}catch(_){}}
 }};
 const initialize=()=>{
  if(!allowed())return;
  try{sessionStorage.setItem('pp_business_attr',JSON.stringify(attribution));}catch(_){}
  if(!production||initialized)return;initialized=true;
  if(!window.fbq){const fbq=window.fbq=function(){fbq.callMethod?fbq.callMethod.apply(fbq,arguments):fbq.queue.push(arguments);};fbq.queue=[];fbq.push=fbq;fbq.loaded=true;fbq.version='2.0';window._fbq=fbq;const script=document.createElement('script');script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';document.head.append(script);}
  window.fbq('consent','grant');window.fbq('init','2116311975585050');window.fbq('set','autoConfig',false,'2116311975585050');window.fbq('track','PageView');
  if(location.pathname.startsWith('/products/'))track('ViewContent',{value:usd,currency:'USD'});
 };
 if(eligible){
  const panel=document.createElement('section');panel.className='business-consent';panel.setAttribute('aria-label','Optional advertising cookies');
  const text=document.createElement('p');text.textContent='Allow Meta advertising cookies to measure visits and purchases? Checkout works if you reject them. You can change this choice at any time.';
  const privacy=document.createElement('a');privacy.href='/privacy/';privacy.textContent='Privacy policy';
  const allow=document.createElement('button');allow.type='button';allow.textContent='Allow advertising cookies';
  const reject=document.createElement('button');reject.type='button';reject.textContent='Reject optional cookies';
  const preferences=document.createElement('button');preferences.type='button';preferences.className='business-preferences';preferences.textContent='Advertising preferences';
  const save=next=>{const loaded=initialized;choice=next;try{localStorage.setItem(preferenceKey,next);}catch(_){}panel.hidden=true;preferences.hidden=false;if(next==='granted')initialize();else if(loaded){try{window.fbq?.('consent','revoke');}catch(_){}location.reload();}preferences.focus();};
  allow.addEventListener('click',()=>save('granted'));reject.addEventListener('click',()=>save('denied'));preferences.addEventListener('click',()=>{panel.hidden=false;preferences.hidden=true;reject.focus();});panel.append(text,allow,reject,privacy);panel.hidden=['granted','denied'].includes(choice);preferences.hidden=!panel.hidden;document.body.append(panel,preferences);
 }
 initialize();
})();
