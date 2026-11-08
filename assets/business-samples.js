'use strict';
(()=>{
 const form=document.querySelector('[data-batch-sample]');
 if(form){
  const output=document.getElementById('batch-result');
  const update=()=>{const inputs=[...form.querySelectorAll('input')];
   if(inputs.some(input=>input.value.trim()===''||!input.validity.valid||!Number.isFinite(Number(input.value)))){output.textContent='Enter a positive whole-number yield and order quantity, and a non-negative batch cost.';return;}
   const [yieldUnits,quantity,cost]=inputs.map(input=>Number(input.value)),batches=Math.ceil(quantity/yieldUnits);
   output.textContent=batches+' whole batch'+(batches===1?'':'es')+' · '+(batches*yieldUnits)+' units produced · '+(batches*yieldUnits-quantity)+' spare · INR '+(batches*cost).toLocaleString('en-IN')+' ingredient cost. Labour, fees, packaging and other costs are excluded.';
  };form.addEventListener('input',update);update();
 }
 for(const button of document.querySelectorAll('[data-copy-example]')){
  button.hidden=false;button.addEventListener('click',async()=>{const text=document.getElementById(button.dataset.copyExample).textContent;const status=document.getElementById('copy-result');try{await navigator.clipboard.writeText(text);status.textContent='Sample copied. Adapt it to your own approved facts.';}catch(_){status.textContent='Select the sample text and copy it manually.';}});
 }
})();
