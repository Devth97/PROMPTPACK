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
    if(note)note.textContent='Your download includes the Excel workbook, separate demo, quick-start guide and 12 AI prompts. Pay once and keep the files.';
    if(fallback)fallback.hidden=true;
    buttons.forEach(b=>b.disabled=false);
    if(status)status.textContent='Ready to purchase. Choose your payment option below.';
  } catch (e) {
    if(buy)buy.hidden=true;
    if(side)side.hidden=true;
    if(note)note.textContent='Checkout is temporarily unavailable. Please try again shortly or contact support.';
    if(fallback){fallback.textContent='Checkout temporarily unavailable';fallback.hidden=false;}
    buttons.forEach(b=>b.disabled=true);
    if(status)status.textContent='Checkout is temporarily unavailable. Please try again shortly or contact support.';
  }
})();
