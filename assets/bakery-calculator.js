'use strict';
(function(){
 const fields={yield:[1,100000,true],quantity:[1,100000,true],ingredients:[0,1e9],hours:[0,1000],rate:[0,1e6],packaging:[0,1e6],overhead:[0,1e9],margin:[0,99.9]};
 function calculate(input){
  for(const [key,[min,max,integer]] of Object.entries(fields)){
   const n=input[key];
   if(typeof n!=='number'||!Number.isFinite(n)||n<min||n>max||(integer&&!Number.isInteger(n)))throw new Error('Complete every field with a valid number. Yield and order quantity must be positive whole numbers; target margin must be below 100%.');
  }
  const batches=Math.ceil(input.quantity/input.yield),produced=batches*input.yield;
  const ingredients=batches*input.ingredients,labour=batches*input.hours*input.rate,packaging=input.quantity*input.packaging,overhead=batches*input.overhead;
  const total=ingredients+labour+packaging+overhead,scenario=total/(1-input.margin/100);
  return {batches,produced,spare:produced-input.quantity,ingredients,labour,packaging,overhead,total,scenario,perUnit:scenario/input.quantity};
 }
 if(typeof module==='object'&&module.exports)module.exports={calculate};
 if(typeof document==='undefined')return;
 const form=document.getElementById('bakery-calculator');if(!form)return;
 const result=document.getElementById('bakery-result'),error=document.getElementById('bakery-error');
 const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
 function update(){
  try{
   const input={};for(const key of Object.keys(fields)){const field=form.elements.namedItem(key);if(field.value.trim()===''||!field.validity.valid)throw new Error('Complete every field using the ranges shown. Enter 0 when a cost does not apply.');input[key]=Number(field.value);}
   const values=calculate(input);
   for(const [key,value] of Object.entries(values))document.querySelector('[data-bakery-result="'+key+'"]').textContent=['batches','produced','spare'].includes(key)?String(value):money(value);
   error.textContent='';error.hidden=true;result.hidden=false;
  }catch(e){result.hidden=true;error.textContent=e.message;error.hidden=false;}
 }
 form.addEventListener('submit',event=>{event.preventDefault();update();});
 form.addEventListener('input',update);
 document.getElementById('bakery-example').addEventListener('click',()=>{form.reset();update();});
 update();
})();
