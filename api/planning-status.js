'use strict';
const L=require('./_lib');
module.exports=async(req,res)=>{
 if(req.method!=='GET')return L.send(res,405,{error:'method_not_allowed'});
 const product=L.catalog.bySlug(req.query && req.query.product);
 if(!product || product.key_env!=='PLANNING_FILE_KEY')return L.send(res,400,{error:'unknown_product'});
 let ready=false;
 if(!L.missing(['RAZORPAY_KEY_ID','RAZORPAY_KEY_SECRET','DOWNLOAD_SIGNING_SECRET','PLANNING_FILE_KEY']).length){
  try{ready=Number.isInteger(product.bytes) && typeof product.sha256==='string' && L.decryptPack(product).length===product.bytes;}catch(_){/* Fail closed. */}
 }
 return L.send(res,200,{product:product.slug,ready,price:product.amount/100,currency:product.currency});
};
