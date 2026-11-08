'use strict';
(()=>{
 const slug=document.body.dataset.planning;if(!slug)return;
 const links=[...document.querySelectorAll('.planning-buy')],buttons=[...document.querySelectorAll('.pay-option')],statuses=[...document.querySelectorAll('.readiness')];
 const unavailable=()=>{links.forEach(a=>a.hidden=true);buttons.forEach(b=>b.disabled=true);statuses.forEach(s=>s.textContent='This kit is being prepared for release. Checkout is not open yet.');};
 unavailable();
 fetch('/api/planning-status?product='+encodeURIComponent(slug),{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();const d=await r.json();if(d.ready!==true||d.product!==slug||d.price!==31||d.currency!=='USD'||d.prices?.inr?.amount!==299900||d.prices?.inr?.currency!=='INR'||d.prices?.usd?.amount!==3100||d.prices?.usd?.currency!=='USD')throw Error();links.forEach(a=>a.hidden=false);buttons.forEach(b=>b.disabled=false);statuses.forEach(s=>s.textContent='Protected download available after payment confirmation.');}).catch(unavailable);
})();
