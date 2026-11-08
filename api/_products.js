'use strict';
// Server-owned identifiers, prices and encrypted fulfillment files.
const editions = require('./_products.json');
const business = require('./_business-products.json');
const finance = {id:'ai-money-audit-prompt-pack',slug:'money-audit',name:'AI Money Audit Prompt Pack',file:'pack.enc',filename:'AI-Money-Audit-Prompt-Pack.pdf',type:'application/pdf',thanks:'/finance/thanks'};
// ProfitPulse is registered independently of the generated edition catalog until its
// verified encrypted bundle is deployed. This preserves existing product builds.
const profitpulse = {
  id:'promptpack-profitpulse',slug:'profitpulse',name:'ProfitPulse — India D2C Profit OS',
  amount:1900,currency:'USD',amount_inr:99900,
  file:'products/profitpulse.enc',filename:'ProfitPulse_India_D2C_Profit_OS.zip',
  type:'application/zip',
  sha256:'b2798ce16bbf939e2c47949ea4a7f363b6900e77f9d82d34d1dd3dd325250caa',
  bytes:345767,thanks:'/checkout/thanks/'
};
const planning = require('./_planning-products.json');
const products = [finance,...editions,profitpulse,...planning,...business];
const byId = id => products.find(p=>p.id===id);
const bySlug = slug => products.find(p=>p.slug===slug);
// New packs: 'usd' (international cards) or 'inr' (UPI, Indian cards, netbanking, wallets). Finance keeps its own plans.
const PLANS = ['usd','inr'];
const priceFor = (product, plan) => plan==='inr' ? {amount:product.amount_inr,currency:'INR'} : {amount:product.amount,currency:product.currency};
// Verification also accepts former prices for already-created planning orders.
const priceMatches = (product, amount, currency) =>
  (Object.hasOwn(product.legacy_amounts || {}, currency) && product.legacy_amounts[currency].includes(amount)) ||
  (product.plans || PLANS).some(plan => {
    const price = priceFor(product, plan);
    return Number.isInteger(price.amount) && amount === price.amount && currency === price.currency;
  });
module.exports={finance,editions,byId,bySlug,PLANS,priceFor,priceMatches};
