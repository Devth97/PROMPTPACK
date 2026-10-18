'use strict';
// Server-owned identifiers, prices and encrypted fulfillment files.
const editions = require('./_products.json');
const finance = {id:'ai-money-audit-prompt-pack',slug:'money-audit',name:'AI Money Audit Prompt Pack',file:'pack.enc',filename:'AI-Money-Audit-Prompt-Pack.pdf',type:'application/pdf',thanks:'/finance/thanks'};
const products = [finance,...editions];
const byId = id => products.find(p=>p.id===id);
const bySlug = slug => products.find(p=>p.slug===slug);
// New packs: 'usd' (international cards) or 'inr' (UPI, Indian cards, netbanking, wallets). Finance keeps its own plans.
const PLANS = ['usd','inr'];
const priceFor = (product, plan) => plan==='inr' ? {amount:product.amount_inr,currency:'INR'} : {amount:product.amount,currency:product.currency};
const priceMatches = (product, amount, currency) => PLANS.some(plan=>{const p=priceFor(product,plan);return Number.isInteger(p.amount) && amount===p.amount && currency===p.currency;});
module.exports={finance,editions,byId,bySlug,PLANS,priceFor,priceMatches};
