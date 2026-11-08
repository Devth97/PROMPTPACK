'use strict';
(function(root){
 const numbers=['yield','quantity','batchHours','orderHours','hourlyRate','packPerUnit','packOrder','overheadBatch','overheadOrder','delivery','feePercent','fixedFee','marginPercent','depositPercent','roundTo'];
 function calculate(p){
  const fail=message=>{throw new Error(message);};
  if(!p||typeof p!=='object')fail('Choose a valid recipe project.');
  for(const key of numbers)if(typeof p[key]!=='number'||!Number.isFinite(p[key])||p[key]<0||p[key]>1e7)fail('Enter a valid non-negative number for '+key+'.');
  if(!Number.isInteger(p.yield)||p.yield<1||!Number.isInteger(p.quantity)||p.quantity<1)fail('Recipe yield and order quantity must be positive whole numbers.');
  if(p.feePercent>=100||p.marginPercent>=100||p.feePercent+p.marginPercent>=100)fail('Fee percentage plus target margin must be below 100%.');
  if(p.depositPercent>100)fail('Deposit must be between 0 and 100%.');
  if(![1,5,10].includes(p.roundTo))fail('Choose a rounding increment of 1, 5 or 10.');
  if(!Array.isArray(p.ingredients)||!p.ingredients.length||p.ingredients.length>24)fail('Add between 1 and 24 ingredients.');
  let batchIngredients=0;
  for(const row of p.ingredients){
   if(!row||typeof row.name!=='string'||!row.name.trim()||row.name.length>100)fail('Give every ingredient a short name.');
   for(const key of ['packCost','packQuantity','used'])if(typeof row[key]!=='number'||!Number.isFinite(row[key])||row[key]<0||row[key]>1e7)fail('Check ingredient prices and quantities.');
   if(row.packQuantity<=0||row.used<=0)fail('Ingredient pack and used quantities must be greater than zero.');
   batchIngredients+=row.packCost/row.packQuantity*row.used;
  }
  const batches=Math.ceil(p.quantity/p.yield),produced=batches*p.yield,ingredients=batchIngredients*batches;
  const hours=p.batchHours*batches+p.orderHours,labour=hours*p.hourlyRate;
  const packaging=p.packPerUnit*p.quantity+p.packOrder,overhead=p.overheadBatch*batches+p.overheadOrder;
  const cost=ingredients+labour+packaging+overhead+p.delivery;
  const target=(cost+p.fixedFee)/(1-p.feePercent/100-p.marginPercent/100);
  const suggested=Math.ceil((target-1e-9)/p.roundTo)*p.roundTo;
  const quote=p.quote===null||p.quote===undefined?suggested:p.quote;
  if(typeof quote!=='number'||!Number.isFinite(quote)||quote<0||quote>1e12)fail('Enter a valid quote price or leave it blank to use the scenario price.');
  const fees=quote*p.feePercent/100+p.fixedFee,contribution=quote-cost-fees,margin=quote>0?contribution/quote*100:null;
  const deposit=Math.round(quote*p.depositPercent)/100,balance=quote-deposit;
  const result={batches,produced,spare:produced-p.quantity,batchIngredients,ingredients,hours,labour,packaging,overhead,cost,target,suggested,quote,fees,contribution,margin,deposit,balance};
  if(Object.values(result).some(value=>value!==null&&!Number.isFinite(value)))fail('The project values are too large to calculate.');
  return result;
 }
 const api={calculate,numbers};
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.BakePrice=api;
})(typeof globalThis==='object'?globalThis:this);
