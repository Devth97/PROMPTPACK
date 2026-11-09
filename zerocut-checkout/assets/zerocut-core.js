/*! ZeroCut Checkout core: pricing rules shared by the browser and your server. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.ZeroCutCore=factory();})(typeof self!=='undefined'?self:this,function(){
  'use strict';

  var DEFAULT_RULES={
    freeDeliveryAbove:499,      // 0 turns the free delivery meter off
    localPrefixes:[],           // pincode prefixes that get the local fee and ETA, e.g. ['560','561']
    localFee:49,nationalFee:79,
    localDays:'2–3 days',nationalDays:'4–7 days',
    upiDiscount:15,             // flat off for UPI to push prepaid; 0 to turn off
    codFee:25,                  // 0 for free COD
    codEnabled:true,
    codMax:3000,                // no COD above this order value; 0 for no limit
    noCodPins:[],               // pincodes where cash cannot be collected
    noCodPrefixes:[],
    coupons:[]                  // {code,label,minSubtotal,percent|flat,maxDiscount}
  };

  function rules(r){var out={};for(var k in DEFAULT_RULES)out[k]=DEFAULT_RULES[k];if(r)for(var j in r)if(r[j]!==undefined)out[j]=r[j];return out;}
  function isPin(pin){return /^[1-9]\d{5}$/.test(String(pin||''));}
  function isMobile(m){return /^[6-9]\d{9}$/.test(String(m||''));}
  function int(n){n=Number(n);return isFinite(n)?Math.round(n):0;}

  // Best-effort state from the first two digits; city for common prefixes. Fields stay editable.
  var STATES=[[11,11,'Delhi'],[12,13,'Haryana'],[14,16,'Punjab'],[17,17,'Himachal Pradesh'],[18,19,'Jammu and Kashmir'],[20,28,'Uttar Pradesh'],[30,34,'Rajasthan'],[36,39,'Gujarat'],[40,44,'Maharashtra'],[45,48,'Madhya Pradesh'],[49,49,'Chhattisgarh'],[50,50,'Telangana'],[51,53,'Andhra Pradesh'],[56,59,'Karnataka'],[60,64,'Tamil Nadu'],[67,69,'Kerala'],[70,74,'West Bengal'],[75,77,'Odisha'],[78,78,'Assam']];
  var CITIES={'110':'New Delhi','122':'Gurugram','201':'Noida','226':'Lucknow','302':'Jaipur','380':'Ahmedabad','395':'Surat','400':'Mumbai','411':'Pune','452':'Indore','500':'Hyderabad','530':'Visakhapatnam','560':'Bengaluru','570':'Mysuru','575':'Mangaluru','600':'Chennai','641':'Coimbatore','682':'Kochi','695':'Thiruvananthapuram','700':'Kolkata','751':'Bhubaneswar','781':'Guwahati','800':'Patna','160':'Chandigarh','141':'Ludhiana','462':'Bhopal','440':'Nagpur','390':'Vadodara'};
  function lookupPin(pin){
    if(!isPin(pin))return null;
    var two=Number(String(pin).slice(0,2)),state='';
    for(var i=0;i<STATES.length;i++)if(two>=STATES[i][0]&&two<=STATES[i][1]){state=STATES[i][2];break;}
    return {city:CITIES[String(pin).slice(0,3)]||'',state:state};
  }

  function subtotal(cart){var s=0;(cart||[]).forEach(function(l){var q=Math.max(0,Math.min(99,int(l.qty)));s+=int(l.price)*q;});return s;}
  function itemCount(cart){var n=0;(cart||[]).forEach(function(l){n+=Math.max(0,int(l.qty));});return n;}

  function delivery(pin,sub,r){
    var free=r.freeDeliveryAbove>0&&sub>=r.freeDeliveryAbove;
    if(!isPin(pin))return {known:false,fee:0,free:free,days:''};
    var local=r.localPrefixes.some(function(p){return String(pin).indexOf(p)===0;});
    return {known:true,local:local,fee:free?0:(local?r.localFee:r.nationalFee),free:free,days:local?r.localDays:r.nationalDays};
  }

  function cod(pin,sub,r){
    if(!r.codEnabled)return {ok:false,reason:'Cash on delivery is not offered'};
    if(!isPin(pin))return {ok:false,reason:'Add your pincode to check cash on delivery'};
    if(r.noCodPins.indexOf(String(pin))>=0||r.noCodPrefixes.some(function(p){return String(pin).indexOf(p)===0;}))return {ok:false,reason:'Not available for this pincode'};
    if(r.codMax>0&&sub>r.codMax)return {ok:false,reason:'Available on orders up to \u20B9'+r.codMax.toLocaleString('en-IN')};
    return {ok:true,reason:''};
  }

  function coupon(code,sub,r){
    code=String(code||'').trim().toUpperCase();
    if(!code)return {coupon:null,discount:0,short:0,message:''};
    var c=null;r.coupons.forEach(function(x){if(String(x.code).toUpperCase()===code)c=x;});
    if(!c)return {coupon:null,discount:0,short:0,message:'This code is not valid'};
    var min=int(c.minSubtotal);
    if(sub<min){var short=min-sub;return {coupon:c,discount:0,short:short,message:'Add \u20B9'+short.toLocaleString('en-IN')+' more to use '+c.code};}
    var d=c.percent?Math.round(sub*c.percent/100):int(c.flat);
    if(c.maxDiscount)d=Math.min(d,int(c.maxDiscount));
    d=Math.max(0,Math.min(sub,d));
    return {coupon:c,discount:d,short:0,message:c.code+' applied. You save \u20B9'+d.toLocaleString('en-IN')};
  }

  // The one function both sides call. The server must call it with prices it looked up itself.
  function quote(cart,opts,r){
    r=rules(r);opts=opts||{};
    var method=opts.method||'upi',sub=subtotal(cart),del=delivery(opts.pin,sub,r),promo=coupon(opts.code,sub,r),c=cod(opts.pin,sub,r);
    var upiOff=method==='upi'&&sub>0?Math.min(r.upiDiscount,sub-promo.discount):0;
    var codFee=method==='cod'&&c.ok?r.codFee:0;
    var total=Math.max(0,sub+del.fee+codFee-promo.discount-upiOff);
    return {subtotal:sub,items:itemCount(cart),delivery:del,promo:promo,cod:c,upiOff:upiOff,codFee:codFee,total:total,
      toFree:r.freeDeliveryAbove>0?Math.max(0,r.freeDeliveryAbove-sub):0,method:method,payable:method==='cod'?0:total};
  }

  function money(n){return '\u20B9'+int(n).toLocaleString('en-IN');}

  return {DEFAULT_RULES:DEFAULT_RULES,rules:rules,isPin:isPin,isMobile:isMobile,lookupPin:lookupPin,subtotal:subtotal,itemCount:itemCount,delivery:delivery,cod:cod,coupon:coupon,quote:quote,money:money};
});
