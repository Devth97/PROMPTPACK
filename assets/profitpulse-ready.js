'use strict';
/** Show ProfitPulse purchase actions only when server-side secure delivery is ready. */
(async () => {
  const status=document.querySelector('[data-profitpulse-ready-status]');
  const buy=document.getElementById('profitpulse-buy');
  const fallback=document.getElementById('profitpulse-prelaunch');
  const side=document.getElementById('profitpulse-buy-side');
  const note=document.getElementById('profitpulse-availability-note');
  const buttons=Array.from(document.querySelectorAll('[data-checkout="profitpulse"] .pay-option'));
  try {
    const response=await fetch('/api/profitpulse-status',{cache:'no-store'});
    if(!response.ok)throw Error('Availability could not be verified');
    const result=await response.json();
    if(result.product!=='profitpulse'||result.ready!==true)throw Error('Secure delivery pending');
    if(buy)buy.hidden=false;
    if(side)side.hidden=false;
    if(note)note.textContent='Secure product delivery is verified. The Buy button opens the official Razorpay checkout.';
    if(fallback)fallback.hidden=true;
    buttons.forEach(b=>b.disabled=false);
    if(status)status.textContent='Secure download verified. Complete your payment with Razorpay.';
  } catch (e) {
    if(buy)buy.hidden=true;
    if(side)side.hidden=true;
    if(note)note.textContent='Purchases are not yet available. No charge will be collected until the verified download is deployed.';
    if(fallback)fallback.hidden=false;
    buttons.forEach(b=>b.disabled=true);
    if(status)status.textContent='Purchases will open after secure digital delivery is verified. No payment is being collected.';
  }
})();