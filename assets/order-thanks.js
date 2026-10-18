'use strict';
(async()=>{
 const status=document.getElementById('delivery-status'),ready=document.getElementById('delivery-ready');
 const params=new URLSearchParams(location.hash.slice(1));
 let token=params.get('t');
 try{if(!token)token=sessionStorage.getItem('promptpack_download');}catch(_){/* Download still works without storage. */}
 if(!token){status.textContent='Open the download link from your payment confirmation. If you paid and cannot find it, contact support with your payment reference.';return;}
 try{
  const response=await fetch('/api/receipt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});
  if(!response.ok)throw Error('This link is invalid or expired. Contact support with your payment reference for help.');
  const receipt=await response.json();
  try{sessionStorage.setItem('promptpack_download',token);}catch(_){/* Optional refresh recovery. */}
  history.replaceState(null,'',location.pathname);
  document.getElementById('delivery-name').textContent=receipt.name;
  document.getElementById('delivery-meta').textContent=new Intl.NumberFormat('en-US',{style:'currency',currency:receipt.currency}).format(receipt.amount/100)+' · Order '+receipt.order+' · Link expires '+new Date(receipt.expires*1000).toLocaleDateString();
  const link=document.getElementById('delivery-download');link.href='/api/download?t='+encodeURIComponent(token);link.setAttribute('download',receipt.filename);
  link.textContent=receipt.type==='application/pdf'?'Download your PDF ↓':'Download your complete ZIP ↓';
  ready.hidden=false;status.textContent='Your payment has been verified. Your files are ready.';
 }catch(error){status.textContent=error.message;}
})();
