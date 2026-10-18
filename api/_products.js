'use strict';
// Server-owned identifiers, prices and encrypted fulfillment files.
const editions = require('./_products.json');
const finance = {id:'ai-money-audit-prompt-pack',slug:'money-audit',name:'AI Money Audit Prompt Pack',file:'pack.enc',filename:'AI-Money-Audit-Prompt-Pack.pdf',type:'application/pdf',thanks:'/finance/thanks'};
const products = [finance,...editions];
const byId = id => products.find(p=>p.id===id);
const bySlug = slug => products.find(p=>p.slug===slug);
module.exports={finance,editions,byId,bySlug};
