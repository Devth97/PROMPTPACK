'use strict';
const L=require('./_lib');
// Display receipt details only after checking the signed download entitlement.
module.exports=async(req,res)=>{
 if(req.method!=='POST')return L.send(res,405,{error:'method_not_allowed'});
 if(!L.sameOrigin(req))return L.send(res,403,{error:'forbidden'});
 const body=await L.readJson(req),claims=L.readToken(body.token);
 if(!claims)return L.send(res,403,{error:'invalid_or_expired_link'});
 const product=L.catalog.byId(claims.product);
 return L.send(res,200,{product:product.slug,name:product.name,filename:product.filename,type:product.type,amount:claims.a,currency:claims.c,expires:claims.exp,order:claims.o});
};
