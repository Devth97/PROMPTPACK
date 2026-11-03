'use strict';
/** Show ProfitPulse purchase actions only when server-side secure delivery is ready. */
(async () => {
  const status=document.querySelector('[data-profitpulse-ready-status]');
  const buy=document.getElementById('profitpulse-buy');
  const fallback=document.getElementById('profitpulse-prelaunch');
  const buttons=Array.from(document.querySelectorAll('[data-checkout="profitpulse"] .pay-option'));
  try {
    const response=await fetch('/api/profitpulse-status',{cache:'no-store'});
    if(!response.ok)throw Error('Availability could not be verified');
    const result=await response.json();
    if(result.product!=='profitpulse'||result.ready!==true)throw Error('Secure delivery pending');
    if(buy)buy.hidden=false;
    if(fallback)fallback.hidden=true;
    buttons.forEach(b=>b.disabled=false);
    if(status)status.textContent='Secure download verified. Complete your payment with Razorpay.';
  } catch (e) {
    if(buy)buy.hidden=true;
    if(fallback)fallback.hidden=false;
    buttons.forEach(b=>b.disabled=true);
    if(status)status.textContent='Purchases will open after secure digital delivery is verified. No payment is being collected.';
  }
})();