'use strict';
(async()=>{
 const slug=document.body.dataset.businessProduct;
 if(!slug)return;
 const links=[...document.querySelectorAll('[data-business-buy]')],buttons=[...document.querySelectorAll('[data-checkout] .pay-option')],status=document.querySelector('[data-business-status]');
 try{
  const response=await fetch('/api/business-status?product='+encodeURIComponent(slug),{cache:'no-store'});
  if(!response.ok)throw Error('Unavailable');const data=await response.json();
  if(data.product!==slug||data.ready!==true)throw Error('Unavailable');
  links.forEach(link=>link.hidden=false);buttons.forEach(button=>button.disabled=false);
  if(status)status.textContent='One payment. Download the complete ZIP after payment confirmation.';
 }catch(_){
  links.forEach(link=>link.hidden=true);buttons.forEach(button=>button.disabled=true);
  if(status)status.textContent='Checkout is temporarily unavailable. Try the free sample or contact support.';
 }
})();
