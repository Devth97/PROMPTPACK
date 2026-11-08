'use strict';
(()=>{
 const {planning:slug,inrMinor,usdMinor}=document.body.dataset;if(!slug)return;
 const links=[...document.querySelectorAll('.planning-buy')],buttons=[...document.querySelectorAll('.pay-option')],statuses=[...document.querySelectorAll('.readiness')];
 const unavailable=()=>{links.forEach(a=>a.hidden=true);buttons.forEach(b=>b.disabled=true);statuses.forEach(s=>s.textContent='This kit is being prepared for release. Checkout is not open yet.');};
 unavailable();
 fetch('/api/planning-status?product='+encodeURIComponent(slug),{cache:'no-store'}).then(async response=>{
   if(!response.ok)throw Error();
   const status=await response.json();
   const inr=status.prices?.inr,usd=status.prices?.usd;
   if(status.ready!==true||status.product!==slug||status.currency!=='USD'||status.price!==Number(usdMinor)/100||
      inr?.amount!==Number(inrMinor)||inr?.currency!=='INR'||usd?.amount!==Number(usdMinor)||usd?.currency!=='USD')throw Error();
   links.forEach(link=>link.hidden=false);
   buttons.forEach(button=>button.disabled=false);
   statuses.forEach(label=>label.textContent='Protected download available after payment confirmation.');
 }).catch(unavailable);
})();
