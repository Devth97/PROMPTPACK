'use strict';
(()=>{
 const form=document.querySelector('[data-checkout]');
 if(!form)return;
 const button=form.querySelector('button'),status=document.getElementById('checkout-status');
 const slug=form.dataset.checkout;
 let completed=false;
 const setStatus=text=>{status.textContent=text;};
 const message=error=>({checkout_not_configured:'Checkout is temporarily unavailable. Please contact support.',file_unavailable:'This download is temporarily unavailable. You have not been charged.',razorpay_auth_failed:'Checkout is temporarily unavailable. Please contact support.',wrong_product:'The payment does not match this pack. Contact support with your payment reference.'}[error]||'We could not complete this step. If you paid, keep your Razorpay reference and contact support before trying again.');
 async function post(url,body){
   const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(message(data.error));
   return data;
 }
 // A completed payment is only ever re-confirmed, never paid again.
 let paidWith=null;
 async function confirm(payment){
  button.disabled=true;setStatus('Confirming your payment. Keep this page open…');
  try{
   const verified=await post('/api/verify',{...payment,product:slug});
   // The token remains in the fragment so it is not sent to other servers as a referrer.
   location.assign('/checkout/thanks/#t='+encodeURIComponent(verified.token));
  }catch(error){
   setStatus(error.message+' Payment reference: '+payment.razorpay_payment_id);
   button.textContent='Retry payment confirmation';button.disabled=false;
  }
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(button.disabled)return;
  if(paidWith)return confirm(paidWith);
  button.disabled=true;setStatus('Preparing your secure checkout…');
  try{
   if(typeof window.Razorpay!=='function')throw Error('The secure payment window could not load. Check your connection and try again.');
   const attribution={};
   const params=new URLSearchParams(location.search);
   for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']){const value=params.get(key);if(value)attribution[key]=value.slice(0,100);}
   const order=await post('/api/create-order',{product:slug,attribution});
   const checkout=new window.Razorpay({key:order.key_id,order_id:order.order_id,amount:order.amount,currency:order.currency,name:'PromptPack',description:order.product_name,prefill:{email:form.elements.email.value.trim()},theme:{color:'#F598F2'},
    handler:payment=>{completed=true;paidWith=payment;confirm(payment);},
    modal:{ondismiss:()=>{if(!completed){button.disabled=false;setStatus('Checkout closed. You can try again when you are ready.');}}}
   });
   checkout.on('payment.failed',event=>{setStatus('Payment was not completed. Follow the payment window to retry, or close it to return here. Reference: '+(event.error?.metadata?.payment_id||order.order_id));});
   checkout.open();setStatus('Complete your payment in the secure Razorpay window.');
  }catch(error){button.disabled=false;setStatus(error.message);}
 });
})();
