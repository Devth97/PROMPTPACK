'use strict';
const L=require('./_lib');
const business=require('./_business-products.json');
module.exports=async(req,res)=>{
 if(req.method!=='GET')return L.send(res,405,{error:'method_not_allowed'});
 const slug=new URL(req.url,'https://promptpack.tech').searchParams.get('product');
 const product=business.find(p=>p.slug===slug);
 if(!product)return L.send(res,404,{error:'unknown_product'});
 let ready=false;
 if(!L.missing(['RAZORPAY_KEY_ID','RAZORPAY_KEY_SECRET','DOWNLOAD_FILE_KEY','DOWNLOAD_SIGNING_SECRET']).length){try{ready=L.decryptPack(product).length===product.bytes;}catch(_){}}
 return L.send(res,200,{product:product.slug,ready});
};
