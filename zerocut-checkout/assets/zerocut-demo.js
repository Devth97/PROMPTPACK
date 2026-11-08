/* ZeroCut Checkout demo: four made-up brands, each starting on a product page with an empty cart. */
(function(){
  'use strict';
  var money=ZeroCutCore.money;

  function svg(kind,c1,c2,label){
    var shapes={
      pouch:'<path d="M70 40h60l8 18v92a8 8 0 01-8 8H70a8 8 0 01-8-8V58z" fill="'+c1+'"/><rect x="62" y="40" width="76" height="12" rx="3" fill="'+c2+'"/><rect x="74" y="88" width="52" height="34" rx="5" fill="#fff" opacity=".9"/>',
      jar:'<rect x="66" y="44" width="68" height="16" rx="4" fill="'+c2+'"/><rect x="60" y="58" width="80" height="96" rx="14" fill="'+c1+'"/><rect x="72" y="88" width="56" height="36" rx="5" fill="#fff" opacity=".9"/>',
      bottle:'<rect x="90" y="30" width="20" height="22" rx="3" fill="'+c2+'"/><path d="M84 52h32v14c10 6 14 14 14 24v58a8 8 0 01-8 8H78a8 8 0 01-8-8V90c0-10 4-18 14-24z" fill="'+c1+'"/><rect x="80" y="100" width="40" height="34" rx="5" fill="#fff" opacity=".9"/>',
      tube:'<path d="M74 50h52l-6 100H80z" fill="'+c1+'"/><rect x="86" y="150" width="28" height="12" rx="3" fill="'+c2+'"/><rect x="82" y="80" width="36" height="40" rx="4" fill="#fff" opacity=".9"/>',
      pan:'<ellipse cx="92" cy="104" rx="56" ry="44" fill="'+c1+'"/><ellipse cx="92" cy="100" rx="46" ry="34" fill="'+c2+'"/><rect x="144" y="94" width="44" height="12" rx="6" fill="'+c1+'"/>',
      kadai:'<path d="M40 90h120c0 34-26 58-60 58S40 124 40 90z" fill="'+c1+'"/><ellipse cx="100" cy="90" rx="60" ry="14" fill="'+c2+'"/><path d="M30 86c0-8 6-10 12-8M170 86c0-8-6-10-12-8" stroke="'+c1+'" stroke-width="7" fill="none" stroke-linecap="round"/>',
      vial:'<rect x="88" y="34" width="24" height="20" rx="4" fill="'+c2+'"/><rect x="76" y="54" width="48" height="96" rx="10" fill="'+c1+'"/><rect x="84" y="86" width="32" height="30" rx="4" fill="#fff" opacity=".85"/>',
      box:'<path d="M50 70l50-24 50 24v60l-50 24-50-24z" fill="'+c1+'"/><path d="M50 70l50 24 50-24M100 94v60" stroke="'+c2+'" stroke-width="5" fill="none"/>',
      cup:'<path d="M66 70h68l-8 70a8 8 0 01-8 7H82a8 8 0 01-8-7z" fill="'+c1+'"/><path d="M134 84c16 0 16 30-2 30" stroke="'+c1+'" stroke-width="8" fill="none"/><path d="M84 54c0-8 8-8 8-16M104 54c0-8 8-8 8-16" stroke="'+c2+'" stroke-width="4" fill="none" stroke-linecap="round"/>',
      tools:'<rect x="70" y="40" width="14" height="110" rx="7" fill="'+c1+'"/><ellipse cx="77" cy="44" rx="16" ry="20" fill="'+c1+'"/><rect x="114" y="40" width="14" height="110" rx="7" fill="'+c2+'"/><rect x="104" y="34" width="34" height="34" rx="6" fill="'+c2+'"/>'
    };
    var s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="'+c2+'" opacity=".22"/><circle cx="160" cy="40" r="46" fill="'+c1+'" opacity=".12"/>'+shapes[kind]+(label?'<text x="100" y="186" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="'+c1+'">'+label+'</text>':'')+'</svg>';
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
  }

  // Each product: variants in size order; the cart line offers the next size as an upgrade.
  var BRANDS={
    'one-page':{layout:'one-page',title:'One Page',tagline:'Cart, mobile, address, offers and pay on one scroll. Fewest taps.',brand:{name:'Kadak Chai Co.',color:'#b4430f'},
      hero:{id:'masala',name:'Masala Chai',kind:'pouch',c:['#b4430f','#f3b25a'],desc:'Strong Assam CTC with cardamom, ginger and clove. Brews dark in four minutes.',variants:[['250 g',249],['500 g',449],['1 kg',829]]},
      pairs:[{id:'rusk',name:'Elaichi Rusk',kind:'box',c:['#8a4b14','#f0c27b'],label:'300 g',price:99},{id:'kulhad',name:'Clay Kulhad, set of 4',kind:'cup',c:['#9a3b16','#e9a66b'],label:'Set of 4',price:299},{id:'strainer',name:'Steel Chai Strainer',kind:'tools',c:['#5f5f5f','#b9b9b9'],label:'One size',price:149},{id:'ginger',name:'Ginger Lemon Green Tea',kind:'pouch',c:['#5c7a18','#cfe27a'],label:'100 g',price:199}],
      rules:{freeDeliveryAbove:499,localPrefixes:['560','561','562'],localFee:40,nationalFee:69,upiDiscount:15,codFee:25,codMax:2500,noCodPins:['744101'],coupons:[{code:'CHAI10',label:'10% off your first order',minSubtotal:0,percent:10,maxDiscount:150},{code:'KADAK75',label:'₹75 off above ₹799',minSubtotal:799,flat:75}]}},
    'quick-sheet':{layout:'quick-sheet',title:'Quick Sheet',tagline:'Slides up over the product page. Finished steps fold into one line.',brand:{name:'Neem & Nila',color:'#0f6e66'},
      hero:{id:'kumkumadi',name:'Kumkumadi Night Oil',kind:'bottle',c:['#0f6e66','#e7b04b'],desc:'Saffron and sandalwood face oil. Three drops at night, absorbs in a minute.',variants:[['15 ml',599],['30 ml',999]]},
      pairs:[{id:'facewash',name:'Neem Face Wash',kind:'tube',c:['#2f7d32','#b7dfa0'],label:'100 ml',price:299},{id:'spf',name:'Mineral Sunscreen SPF 50',kind:'tube',c:['#d08a1b','#fde3a7'],label:'50 g',price:449},{id:'lip',name:'Rose Lip Balm',kind:'jar',c:['#b83a5c','#f6b8c8'],label:'8 g',price:149},{id:'aloe',name:'Aloe Gel',kind:'jar',c:['#2e8b57','#c5ecd2'],label:'150 g',price:249}],
      rules:{freeDeliveryAbove:699,localPrefixes:['400','401'],localFee:49,nationalFee:79,upiDiscount:20,codFee:30,codMax:3000,coupons:[{code:'GLOW15',label:'15% off on 2 or more',minSubtotal:900,percent:15},{code:'NILA50',label:'₹50 off your first order',minSubtotal:0,flat:50}]}},
    'review-buy':{layout:'review-buy',title:'Review and Buy',tagline:'Settle the cart first: upgrades, add-ons, coupons. Then one short step to pay.',brand:{name:'Loha Kitchen',color:'#9a3412'},
      hero:{id:'tawa',name:'Pre-seasoned Cast Iron Tawa',kind:'pan',c:['#292524','#57534e'],desc:'Heavy, flat, non-toxic. Seasoned three times with cold-pressed oil, ready for dosa on day one.',variants:[['10 inch',1499],['12 inch',1899]]},
      pairs:[{id:'kadai',name:'Cast Iron Kadai',kind:'kadai',c:['#292524','#57534e'],label:'2.5 L',price:2199},{id:'oil',name:'Seasoning Oil',kind:'bottle',c:['#a16207','#fde68a'],label:'200 ml',price:249},{id:'spatula',name:'Neem Wood Spatula Set',kind:'tools',c:['#92400e','#d6a46b'],label:'Set of 3',price:349},{id:'grip',name:'Handle Grip',kind:'box',c:['#9a3412','#fdba74'],label:'One size',price:199}],
      rules:{freeDeliveryAbove:999,localPrefixes:['600','601','602','603'],localFee:79,nationalFee:129,upiDiscount:30,codFee:49,codMax:4000,noCodPrefixes:['79'],coupons:[{code:'LOHA200',label:'₹200 off above ₹2,999',minSubtotal:2999,flat:200},{code:'FIRSTPAN',label:'5% off your first pan',minSubtotal:0,percent:5,maxDiscount:120}]}},
    'classic':{layout:'classic',title:'Classic Form',tagline:'Contact, delivery, payment. Three labelled steps with an order summary.',brand:{name:'Saanjh Attar',color:'#5b2a86'},
      hero:{id:'oud',name:'Oud Saanjh Attar',kind:'vial',c:['#5b2a86','#e5c07b'],desc:'Alcohol-free attar: agarwood, rose and a little smoke. Lasts through the day on skin.',variants:[['6 ml',799],['12 ml',1399]]},
      pairs:[{id:'mogra',name:'Mogra Attar',kind:'vial',c:['#7a8b3a','#f1f5c4'],label:'6 ml',price:599},{id:'discovery',name:'Discovery Set of 5',kind:'box',c:['#5b2a86','#d8b4fe'],label:'5 × 1 ml',price:499},{id:'roller',name:'Travel Roller',kind:'vial',c:['#374151','#d1d5db'],label:'3 ml',price:199}],
      rules:{freeDeliveryAbove:999,localPrefixes:['110','122','201'],localFee:49,nationalFee:79,upiDiscount:25,codFee:35,codMax:3000,coupons:[{code:'SAANJH10',label:'10% off any two attars',minSubtotal:1300,percent:10},{code:'WELCOME',label:'₹100 off above ₹999',minSubtotal:999,flat:100}]}}
  };

  function heroLine(h,vi,qty){
    var v=h.variants[vi],next=h.variants[vi+1],img=svg(h.kind,h.c[0],h.c[1],v[0]);
    var line={id:h.id+'-'+vi,name:h.name,label:v[0],price:v[1],qty:qty||1,image:img,upgrade:null};
    if(next)line.upgrade={id:h.id+'-'+(vi+1),label:next[0],price:next[1],image:svg(h.kind,h.c[0],h.c[1],next[0]),upgrade:heroLine(h,vi+1,1).upgrade};
    return line;
  }
  function addOns(b){return b.pairs.map(function(p){return {id:p.id,name:p.name,label:p.label,price:p.price,image:svg(p.kind,p.c[0],p.c[1])};});}

  // A mini product page inside the phone frame.
  function Store(frame,key){
    this.frame=frame;this.key=key;this.b=BRANDS[key];this.cart=[];this.variant=0;this.pin='';this.render();
  }
  Store.prototype.count=function(){return this.cart.reduce(function(n,l){return n+l.qty;},0);};
  Store.prototype.add=function(line){var ex=this.cart.filter(function(l){return l.id===line.id;})[0];if(ex)ex.qty=Math.min(99,ex.qty+line.qty);else this.cart.push(line);};
  Store.prototype.render=function(){
    var b=this.b,h=b.hero,v=h.variants[this.variant],self=this,d=ZeroCutCore.delivery(this.pin,v[1],ZeroCutCore.rules(b.rules)),hit=ZeroCutCore.lookupPin(this.pin);
    this.frame.style.setProperty('--demo-brand',b.brand.color);
    this.frame.innerHTML='<div class="dm-store"><header class="dm-bar"><span class="dm-menu" aria-hidden="true"></span><b>'+b.brand.name+'</b><button class="dm-cart" data-a="cart" aria-label="Open cart, '+this.count()+' items">'+cartIcon()+'<i>'+this.count()+'</i></button></header>'+
      '<div class="dm-scroll"><img class="dm-hero" src="'+svg(h.kind,h.c[0],h.c[1],'')+'" alt="'+h.name+'"><div class="dm-body"><h4>'+h.name+'</h4><p class="dm-price">'+money(v[1])+' <small>incl. taxes</small></p><p class="dm-desc">'+h.desc+'</p>'+
      '<div class="dm-variants" role="radiogroup" aria-label="Size">'+h.variants.map(function(x,i){return '<button role="radio" aria-checked="'+(i===self.variant)+'" data-a="v:'+i+'">'+x[0]+'</button>';}).join('')+'</div>'+
      '<label class="dm-pin">'+pinIcon()+'<input inputmode="numeric" maxlength="6" placeholder="Pincode" value="'+this.pin+'" aria-label="Delivery pincode"><span>'+(d.known?'Delivers'+(hit&&hit.city?' to '+hit.city:'')+' in '+d.days:'Check delivery time')+'</span></label>'+
      '<div class="dm-pairs"><h5>Pairs well with</h5>'+b.pairs.slice(0,2).map(function(p){var inCart=self.cart.some(function(l){return l.id===p.id;});return '<div class="dm-pair"><img src="'+svg(p.kind,p.c[0],p.c[1])+'" alt=""><span>'+p.name+'<small>'+money(p.price)+'</small></span><button data-a="pair:'+p.id+'" aria-label="Add '+p.name+'"'+(inCart?' disabled':'')+'>'+(inCart?'✓':'+')+'</button></div>';}).join('')+'</div></div></div>'+
      '<footer class="dm-buy"><button class="dm-add" data-a="add">Add to cart</button><button class="dm-now" data-a="buy">Buy now</button></footer></div>';
    var input=this.frame.querySelector('.dm-pin input');
    input.addEventListener('input',function(){input.value=input.value.replace(/\D/g,'').slice(0,6);self.pin=input.value;if(self.pin.length===6||self.pin.length===0)self.render();});
    this.frame.querySelector('.dm-store').addEventListener('click',function(e){var t=e.target.closest('[data-a]');if(!t)return;self.act(t.getAttribute('data-a'));});
  };
  Store.prototype.act=function(a){
    var b=this.b,self=this;
    if(a.indexOf('v:')===0){this.variant=+a.slice(2);return this.render();}
    if(a.indexOf('pair:')===0){var p=addOns(b).filter(function(x){return x.id===a.slice(5);})[0];this.add({id:p.id,name:p.name,label:p.label,price:p.price,qty:1,image:p.image});return this.render();}
    if(a==='add'){this.add(heroLine(b.hero,this.variant,1));this.render();var c=this.frame.querySelector('.dm-cart');c.classList.remove('dm-bump');void c.offsetWidth;c.classList.add('dm-bump');return;}
    if(a==='buy'){if(!this.cart.some(function(l){return l.id===b.hero.id+'-'+self.variant;}))this.add(heroLine(b.hero,this.variant,1));}
    if(a==='buy'||a==='cart')this.open();
  };
  Store.prototype.open=function(){
    var self=this,b=this.b;
    this.co=ZeroCut.open({layout:b.layout,brand:b.brand,cart:this.cart,addOns:addOns(b),rules:b.rules,demo:true,container:this.frame,prefill:{pin:this.pin},
      onPincode:function(pin){self.pin=pin;},
      onCartChange:function(cart){self.cart=cart;},
      onClose:function(cart){self.cart=cart;self.co=null;self.render();}});
  };
  Store.prototype.destroy=function(){if(this.co)this.co.close();};

  function cartIcon(){return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 016 0"/></svg>';}
  function pinIcon(){return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>';}

  window.ZeroCutDemo={brands:BRANDS,mount:function(frame,key){return new Store(frame,key);}};
})();
