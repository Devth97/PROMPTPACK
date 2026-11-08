/*! ZeroCut Checkout v1.0 — your own checkout, four layouts, no per-order fee. Needs zerocut-core.js. */
(function(){
  'use strict';
  var C=window.ZeroCutCore;
  if(!C)throw new Error('Load zerocut-core.js before zerocut.js');
  var money=C.money;
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function reduced(){return window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;}
  function clone(o){return JSON.parse(JSON.stringify(o));}

  var ICON={
    back:'<path d="M15 18l-6-6 6-6"/>',close:'<path d="M18 6L6 18M6 6l12 12"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
    bag:'<path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 016 0"/>',phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    pin:'<path d="M12 22s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',tag:'<path d="M3 12V3h9l9 9-9 9-9-9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M16 13h2M3 10h18"/>',truck:'<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
    bank:'<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',upi:'<path d="M7 4l5 16M12 4l5 16"/>',shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    chev:'<path d="M6 9l6 6 6-6"/>',cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16v4z"/>'
  };
  function ic(name,size){return '<svg class="zc-ic" width="'+(size||18)+'" height="'+(size||18)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICON[name]+'</svg>';}

  var LAYOUTS={'one-page':1,'quick-sheet':1,'review-buy':1,'classic':1};
  var STEPS={'one-page':['all'],'quick-sheet':['contact','address','pay'],'review-buy':['review','details'],'classic':['contact','delivery','payment']};

  function Checkout(cfg){
    var self=this;
    this.cfg=cfg=cfg||{};
    this.layout=LAYOUTS[cfg.layout]?cfg.layout:'one-page';
    this.rules=C.rules(cfg.rules);
    this.brand=cfg.brand||{};
    var p=cfg.prefill||{};
    this.s={cart:clone(cfg.cart||[]),phone:p.phone||'',email:p.email||'',otpState:p.phone&&cfg.otp===false?'verified':'idle',otp:'',pin:p.pin||'',city:p.city||'',state:p.state||'',
      name:p.name||'',line1:p.line1||'',line2:p.line2||'',code:'',codeInput:'',method:'upi',step:STEPS[this.layout][0],missing:'',error:'',paying:false,placed:null,summaryOpen:false};
    if(this.s.pin){var hit=C.lookupPin(this.s.pin);if(hit){this.s.city=this.s.city||hit.city;this.s.state=this.s.state||hit.state;}}
    var host=cfg.container||document.body;
    this.inFrame=host!==document.body;
    var root=this.root=document.createElement('div');
    root.className='zc-root zc-'+this.layout+(this.inFrame?' zc-framed':'');
    root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',(this.brand.name||'Store')+' checkout');
    var b=this.brand,st=root.style;
    if(b.color)st.setProperty('--zc-brand',b.color);
    if(b.ink)st.setProperty('--zc-on-brand',b.ink);
    if(b.bg)st.setProperty('--zc-bg',b.bg);
    if(b.font)st.setProperty('--zc-font',b.font);
    if(b.radius!=null)st.setProperty('--zc-radius',b.radius+'px');
    root.innerHTML='<div class="zc-backdrop" data-zc="close"></div><div class="zc-panel" tabindex="-1"></div>';
    this.panel=root.querySelector('.zc-panel');
    host.appendChild(root);
    if(!this.inFrame){this._overflow=document.body.style.overflow;document.body.style.overflow='hidden';}
    this._prevFocus=document.activeElement;
    root.addEventListener('click',function(e){self._click(e);});
    root.addEventListener('input',function(e){self._input(e);});
    root.addEventListener('submit',function(e){e.preventDefault();var a=e.target.getAttribute('data-zc-submit');if(a)self._act(a);});
    root.addEventListener('keydown',function(e){if(e.key==='Escape'&&!self.s.paying){e.stopPropagation();self.close();}});
    this.render();
    requestAnimationFrame(function(){root.classList.add('zc-open');self.panel.focus({preventScroll:true});});
  }

  var P=Checkout.prototype;

  P.quote=function(){var s=this.s;return C.quote(s.cart,{pin:s.pin,method:s.method,code:s.code},this.rules);};
  P.contactOk=function(){return this.cfg.otp===false?C.isMobile(this.s.phone):this.s.otpState==='verified';};
  P.addressOk=function(){var s=this.s;return C.isPin(s.pin)&&!!s.name.trim()&&!!s.line1.trim()&&!!s.city.trim()&&!!s.state.trim();};

  // ---------- rendering ----------
  P.region=function(name,html){return '<div data-zc-region="'+name+'">'+html+'</div>';};
  P.update=function(){var self=this;Array.prototype.slice.call(arguments).forEach(function(name){var nodes=self.root.querySelectorAll('[data-zc-region="'+name+'"]');for(var i=0;i<nodes.length;i++)nodes[i].innerHTML=self['r_'+name]();});};
  P.refresh=function(){this.update('meter','lines','addons','mini','summary','minitotal','methods','bill','paybar','coupons','promo','eta');};

  P.render=function(){
    var s=this.s,L=this.layout,h='';
    if(s.placed){h=this.header('Confirmed',false)+'<div class="zc-scroll">'+this.region('done',this.r_done())+'</div>';}
    else if(!s.cart.length){h=this.header('Checkout',false)+'<div class="zc-scroll"><div class="zc-empty">'+ic('bag',36)+'<h3>Your cart is empty</h3><p>Add something you love, then come back to pay.</p><button class="zc-btn" data-zc="close">Keep shopping</button></div></div>';}
    else h=this['layout_'+L.replace('-','_')]();
    this.panel.innerHTML=h;
  };

  P.header=function(title,back){
    var b=this.brand,logo=b.logo?'<img class="zc-logo" src="'+esc(b.logo)+'" alt="'+esc(b.name||'')+'">':'<span class="zc-wordmark">'+esc(b.name||'')+'</span>';
    return '<header class="zc-top">'+(back?'<button class="zc-iconbtn" data-zc="back" aria-label="Back">'+ic('back',20)+'</button>':'<button class="zc-iconbtn" data-zc="close" aria-label="Close checkout">'+ic('close',20)+'</button>')+logo+'<span class="zc-title">'+esc(title)+'</span><span class="zc-secure">'+ic('lock',13)+' Secure</span></header>'+(this.cfg.demo?'<p class="zc-demo-note">Demo: nothing is charged. Any mobile number works.</p>':'');
  };

  P.card=function(id,icon,title,body,extra){return '<section class="zc-card'+(this.s.missing===id?' zc-missing':'')+'" data-zc-section="'+id+'"><h3>'+ic(icon,17)+' '+esc(title)+(extra||'')+'</h3>'+body+'</section>';};

  // One Page: everything on one scroll, pay button pinned.
  P.layout_one_page=function(){
    var q=this.quote();
    return this.header('Checkout',false)+'<div class="zc-scroll">'+this.region('meter',this.r_meter())+
      this.card('bag','bag','Your cart',this.region('lines',this.r_lines())+this.region('addons',this.r_addons()),'<small>'+q.items+' items</small>')+
      this.card('contact','phone','Mobile number',this.region('contact',this.r_contact()))+
      this.card('address','pin','Delivery address',this.addressFields())+
      this.card('offers','tag','Offers',this.offersBody())+
      this.card('pay','wallet','Pay with',this.region('methods',this.r_methods()))+
      '<section class="zc-card zc-bill">'+this.region('bill',this.r_bill())+'</section></div>'+this.region('paybar',this.r_paybar());
  };

  // Quick Sheet: a bottom sheet; finished steps fold into one line.
  P.layout_quick_sheet=function(){
    var s=this.s,self=this,steps=[['contact','phone','Mobile number'],['address','pin','Deliver to'],['pay','wallet','Pay with']],idx=STEPS['quick-sheet'].indexOf(s.step);
    var body=steps.map(function(st,i){
      var id=st[0],open=s.step===id,done=i<idx;
      var summary=id==='contact'?'+91 '+esc(s.phone):id==='address'?esc(s.name+', '+s.line1+', '+s.city+' '+s.pin):'';
      var inner=open?(id==='contact'?self.region('contact',self.r_contact()):id==='address'?self.addressFields()+'<button class="zc-btn zc-wide" data-zc="next">Deliver here</button>':self.region('methods',self.r_methods())+'<details class="zc-fold"><summary>'+ic('tag',15)+' Have a coupon?</summary>'+self.offersBody()+'</details>'):
        done?'<p class="zc-fold-line">'+ic('check',15)+' <span>'+summary+'</span><button data-zc="goto:'+id+'">Change</button></p>':'';
      return '<section class="zc-step'+(open?' is-open':'')+(done?' is-done':'')+(s.missing===id?' zc-missing':'')+'" data-zc-section="'+id+'"><h3><span class="zc-step-n">'+(done?ic('check',13):i+1)+'</span>'+st[2]+'</h3>'+inner+'</section>';
    }).join('');
    return '<div class="zc-grab" aria-hidden="true"></div>'+this.header('Checkout',false)+'<div class="zc-scroll">'+this.region('mini',this.r_mini())+this.region('meter',this.r_meter())+body+'</div>'+this.region('paybar',this.r_paybar());
  };

  // Review and Buy: settle the cart first, then one short step to pay.
  P.layout_review_buy=function(){
    var s=this.s,q=this.quote();
    if(s.step==='review')return this.header('Your order',false)+'<div class="zc-scroll">'+this.region('meter',this.r_meter())+
      '<section class="zc-card">'+this.region('lines',this.r_lines())+'</section>'+
      '<section class="zc-card"><h3>'+ic('plus',17)+' Add to your order</h3>'+this.region('addons',this.r_addons(true))+'</section>'+
      this.card('offers','tag','Offers',this.offersBody())+
      '<section class="zc-card zc-bill">'+this.region('bill',this.r_bill())+'</section></div>'+this.region('paybar',this.r_paybar());
    return this.header('Pay',true)+'<div class="zc-scroll">'+
      '<button class="zc-recap" data-zc="back"><span>'+q.items+' items · '+money(q.subtotal)+'</span><span>Edit order</span></button>'+
      this.card('contact','phone','Mobile number',this.region('contact',this.r_contact()))+
      this.card('address','pin','Delivery address',this.addressFields())+
      this.card('pay','wallet','Pay with',this.region('methods',this.r_methods()))+
      '<section class="zc-card zc-bill">'+this.region('bill',this.r_bill())+'</section></div>'+this.region('paybar',this.r_paybar());
  };

  // Classic Form: three labelled steps with an order summary.
  P.layout_classic=function(){
    var s=this.s,steps=STEPS.classic,idx=steps.indexOf(s.step),names=['Contact','Delivery','Payment'],body='';
    var progress='<ol class="zc-progress">'+names.map(function(n,i){return '<li class="'+(i<idx?'done':i===idx?'on':'')+'"><span>'+(i<idx?ic('check',12):i+1)+'</span>'+n+'</li>';}).join('')+'</ol>';
    if(s.step==='contact')body=this.card('contact','phone','Contact information',this.region('contact',this.r_contact())+'<label class="zc-field"><span>Email for receipt <i>(optional)</i></span><input type="email" data-field="email" autocomplete="email" value="'+esc(s.email)+'" placeholder="you@example.com"></label>');
    if(s.step==='delivery')body=this.card('address','truck','Shipping address',this.addressFields());
    if(s.step==='payment')body='<p class="zc-recap-line">'+ic('pin',15)+' <span>'+esc(s.name+', '+s.line1+', '+s.city+' '+s.pin)+'</span><button data-zc="goto:delivery">Change</button></p>'+this.card('pay','card','Payment method',this.region('methods',this.r_methods()));
    return this.header('Checkout',idx>0)+'<div class="zc-scroll">'+progress+
      '<div class="zc-summary-box"><button class="zc-summary-toggle" data-zc="summary" aria-expanded="'+s.summaryOpen+'">'+ic('bag',16)+' <span>'+(s.summaryOpen?'Hide':'Show')+' order summary</span>'+ic('chev',15)+'<b data-zc-region="minitotal">'+money(this.quote().total)+'</b></button>'+this.region('summary',this.r_summary())+'</div>'+
      body+'</div>'+this.region('paybar',this.r_paybar());
  };

  // ---------- regions ----------
  P.r_meter=function(){
    var q=this.quote(),f=this.rules.freeDeliveryAbove;if(!f)return '';
    var pct=Math.min(100,Math.round(q.subtotal/f*100));
    return '<div class="zc-meter'+(q.toFree?'':' is-done')+'" role="status"><p>'+ic('truck',16)+(q.toFree?'<span>Add <b>'+money(q.toFree)+'</b> more for free delivery</span>':'<span>You\'ve unlocked <b>free delivery</b></span>')+'</p><div class="zc-bar"><i style="width:'+pct+'%"></i></div></div>';
  };

  P.r_lines=function(){
    return '<ul class="zc-lines">'+this.s.cart.map(function(l,i){
      var up=l.upgrade?'<button class="zc-upgrade" data-zc="upgrade:'+i+'">Upgrade to '+esc(l.upgrade.label)+' · +'+money((l.upgrade.price-l.price)*l.qty)+'</button>':'';
      return '<li>'+(l.image?'<img src="'+esc(l.image)+'" alt="">':'<span class="zc-noimg"></span>')+'<div class="zc-line-main"><strong>'+esc(l.name)+'</strong>'+(l.label?'<span>'+esc(l.label)+'</span>':'')+up+'</div><div class="zc-line-end"><b>'+money(l.price*l.qty)+'</b><div class="zc-qty"><button data-zc="dec:'+i+'" aria-label="Remove one '+esc(l.name)+'">'+ic('minus',13)+'</button><span>'+l.qty+'</span><button data-zc="inc:'+i+'" aria-label="Add one '+esc(l.name)+'"'+(l.qty>=99?' disabled':'')+'>'+ic('plus',13)+'</button></div></div></li>';
    }).join('')+'</ul>';
  };

  P.availableAddOns=function(){var ids={};this.s.cart.forEach(function(l){ids[l.id]=1;});return (this.cfg.addOns||[]).filter(function(a){return !ids[a.id];});};
  P.r_addons=function(big){
    var list=this.availableAddOns().slice(0,big?4:3);if(!list.length)return big?'<p class="zc-hint">You have everything we would suggest.</p>':'';
    return '<div class="zc-addons'+(big?' is-grid':'')+'">'+(big?'':'<h4>Goes well with your cart</h4>')+'<div>'+list.map(function(a){return '<button data-zc="add:'+esc(a.id)+'">'+(a.image?'<img src="'+esc(a.image)+'" alt="">':'')+'<span>'+esc(a.name)+(a.label?'<small>'+esc(a.label)+'</small>':'')+'</span><b>'+money(a.price)+'</b><i>'+ic('plus',13)+' Add</i></button>';}).join('')+'</div></div>';
  };

  P.r_mini=function(){
    var q=this.quote(),s=this.s;
    return '<div class="zc-mini"><button class="zc-mini-head" data-zc="summary" aria-expanded="'+s.summaryOpen+'"><span class="zc-thumbs">'+s.cart.slice(0,3).map(function(l){return l.image?'<img src="'+esc(l.image)+'" alt="">':'';}).join('')+'</span><span>'+q.items+' item'+(q.items===1?'':'s')+' · <b>'+money(q.subtotal)+'</b></span>'+ic('chev',16)+'</button>'+(s.summaryOpen?this.r_lines()+this.r_addons():'')+'</div>';
  };

  P.r_summary=function(){return this.s.summaryOpen||this._wide()?'<div class="zc-summary">'+this.r_lines()+this.r_addons()+'<div class="zc-summary-offers">'+this.offersBody()+'</div>'+this.r_bill()+'</div>':'';};
  P.r_minitotal=function(){return money(this.quote().total);};
  P._wide=function(){return false;};

  P.r_contact=function(){
    var s=this.s;
    if(this.contactOk()&&this.cfg.otp!==false)return '<div class="zc-verified">'+ic('check',16)+' +91 '+esc(s.phone.slice(0,5)+' '+s.phone.slice(5))+' verified<button data-zc="otp-change">Change</button></div>';
    var h='<div class="zc-row"><label class="zc-field zc-grow"><span>Mobile number</span><span class="zc-prefix"><em>+91</em><input data-field="phone" inputmode="numeric" autocomplete="tel-national" maxlength="10" value="'+esc(s.phone)+'" placeholder="10-digit mobile"></span></label>';
    if(this.cfg.otp===false)return h+'</div><p class="zc-hint">For delivery updates on WhatsApp and SMS.</p>';
    h+='<button class="zc-btn zc-ghost" data-zc="otp-send"'+(C.isMobile(s.phone)&&s.otpState!=='sending'?'':' disabled')+'>'+(s.otpState==='sent'?'Resend':s.otpState==='sending'?'Sending…':'Get OTP')+'</button></div>';
    if(s.otpState==='sent')h+='<label class="zc-field"><span>Enter the OTP sent to +91 '+esc(s.phone)+'</span><input class="zc-otp" data-field="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="'+(this.cfg.otpLength||4)+'" value="'+esc(s.otp)+'" placeholder="••••"><small>'+(s.otp?'Filled from SMS':'Waiting for SMS. It fills in by itself.')+'</small></label>';
    if(s.otpError)h+='<p class="zc-err" role="alert">'+esc(s.otpError)+'</p>';
    return h+'<p class="zc-hint">We\'ll send order updates here.</p>';
  };

  P.addressFields=function(){
    var s=this.s;
    return '<div class="zc-row"><label class="zc-field zc-pin"><span>Pincode</span><input data-field="pin" inputmode="numeric" autocomplete="postal-code" maxlength="6" value="'+esc(s.pin)+'"></label>'+this.region('eta',this.r_eta())+'</div>'+
      '<div class="zc-row"><label class="zc-field zc-grow"><span>City</span><input data-field="city" autocomplete="address-level2" value="'+esc(s.city)+'"></label><label class="zc-field zc-grow"><span>State</span><input data-field="state" autocomplete="address-level1" value="'+esc(s.state)+'"></label></div>'+
      '<label class="zc-field"><span>Full name</span><input data-field="name" autocomplete="name" value="'+esc(s.name)+'"></label>'+
      '<label class="zc-field"><span>House no., building, street</span><input data-field="line1" autocomplete="address-line1" value="'+esc(s.line1)+'"></label>'+
      '<label class="zc-field"><span>Area, landmark <i>(optional)</i></span><input data-field="line2" autocomplete="address-line2" value="'+esc(s.line2)+'"></label>';
  };
  P.r_eta=function(){var q=this.quote();return '<p class="zc-eta">'+(q.delivery.known?ic('truck',15)+' <span>Arrives in '+esc(q.delivery.days)+' · '+(q.delivery.fee?money(q.delivery.fee):'Free delivery')+'</span>':'<span>Enter pincode for delivery time</span>')+'</p>';};

  P.offersBody=function(){
    return '<form class="zc-row" data-zc-submit="apply-code"><label class="zc-field zc-grow"><span>Coupon code</span><input data-field="codeInput" value="'+esc(this.s.codeInput)+'" placeholder="Enter code" autocapitalize="characters"></label><button class="zc-btn zc-ghost" type="submit">Apply</button></form>'+this.region('promo',this.r_promo())+this.region('coupons',this.r_coupons());
  };
  P.r_promo=function(){var q=this.quote();return q.promo.message?'<p class="zc-promo'+(q.promo.discount?' is-ok':'')+'" role="status">'+esc(q.promo.message)+'</p>':'';};
  P.r_coupons=function(){
    var q=this.quote();if(!this.rules.coupons.length)return '';
    return '<ul class="zc-coupons">'+this.rules.coupons.map(function(c){var short=Math.max(0,(c.minSubtotal||0)-q.subtotal),on=q.promo.coupon&&q.promo.coupon.code===c.code&&q.promo.discount>0;
      return '<li><div><b>'+esc(c.code)+'</b><span>'+esc(c.label||'')+'</span>'+(short?'<small>Add '+money(short)+' more to unlock</small>':'')+'</div><button data-zc="coupon:'+esc(c.code)+'"'+(short||on?' disabled':'')+'>'+(on?'Applied':'Apply')+'</button></li>';}).join('')+'</ul>';
  };

  P.r_methods=function(){
    var s=this.s,q=this.quote(),r=this.rules,m=[
      ['upi','upi','UPI',r.upiDiscount?'Save '+money(r.upiDiscount)+' · GPay, PhonePe, Paytm':'GPay, PhonePe, Paytm and more',r.upiDiscount?'Best price':''],
      ['card','card','Debit or credit card','Visa, Mastercard, RuPay, Amex',''],
      ['netbanking','bank','Net banking','All major banks','']
    ];
    if(r.codEnabled)m.push(['cod','cash','Cash on delivery',q.cod.ok?(r.codFee?money(r.codFee)+' handling fee':'Pay when it arrives'):q.cod.reason,'']);
    return '<div class="zc-methods" role="radiogroup" aria-label="Payment method">'+m.map(function(x){var dis=x[0]==='cod'&&!q.cod.ok,on=s.method===x[0];
      return '<button role="radio" aria-checked="'+on+'" class="zc-method'+(on?' is-on':'')+'" data-zc="method:'+x[0]+'"'+(dis?' disabled':'')+'><span class="zc-mi">'+ic(x[1],19)+'</span><span class="zc-mc"><b>'+x[2]+(x[4]?'<em>'+x[4]+'</em>':'')+'</b><small>'+esc(x[3])+'</small></span><span class="zc-radio">'+(on?ic('check',12):'')+'</span></button>';}).join('')+'</div>';
  };

  P.r_bill=function(){
    var q=this.quote(),d=q.delivery;
    var rows=[['Items ('+q.items+')',money(q.subtotal)],['Delivery',!d.known?(d.free?'<em>Free</em>':'Add pincode'):d.fee?money(d.fee):'<em>Free</em>']];
    if(q.promo.discount)rows.push(['Coupon '+esc(q.promo.coupon.code),'−'+money(q.promo.discount),'save']);
    if(q.upiOff)rows.push(['UPI discount','−'+money(q.upiOff),'save']);
    if(q.codFee)rows.push(['Cash on delivery fee',money(q.codFee)]);
    rows.push([q.method==='cod'?'Pay on delivery':'To pay',money(q.total),'total']);
    return '<dl class="zc-billrows">'+rows.map(function(r){return '<div class="'+(r[2]||'')+'"><dt>'+r[0]+'</dt><dd>'+r[1]+'</dd></div>';}).join('')+'</dl><p class="zc-trust">'+ic('shield',15)+' '+esc(this.cfg.trustLine||'Payments secured by Razorpay. Card and UPI details never touch our servers.')+'</p>';
  };

  P.payLabel=function(){
    var s=this.s,q=this.quote(),L=this.layout;
    if(L==='quick-sheet'&&s.step!=='pay')return s.step==='contact'?'Continue':'Continue to payment';
    if(L==='review-buy'&&s.step==='review')return 'Continue · '+money(q.total);
    if(L==='classic'&&s.step!=='payment')return s.step==='contact'?'Continue to delivery':'Continue to payment';
    return q.method==='cod'?'Place order · '+money(q.total):q.method==='upi'?'Pay '+money(q.total)+' with UPI':'Pay '+money(q.total);
  };
  P.r_paybar=function(){
    var s=this.s,q=this.quote(),save=q.promo.discount+q.upiOff,isPay=this.isPayStep();
    var note=s.error?'<span class="zc-err">'+esc(s.error)+'</span>':s.missing==='contact'?'Verify your mobile to continue':s.missing==='address'?'Complete your address to continue':save?'You save '+money(save):'Inclusive of all taxes';
    return '<footer class="zc-paybar"><div><strong>'+money(q.total)+'</strong><small>'+note+'</small></div><button class="zc-pay" data-zc="pay"'+(s.paying?' disabled aria-busy="true"':'')+'>'+(s.paying?'<span class="zc-spin" aria-hidden="true"></span>'+(s.method==='upi'?'Waiting for UPI app…':'Processing…'):(isPay?ic('lock',16):'')+esc(this.payLabel()))+'</button></footer>';
  };
  P.isPayStep=function(){var s=this.s;return this.layout==='one-page'||(this.layout==='quick-sheet'&&s.step==='pay')||(this.layout==='review-buy'&&s.step==='details')||(this.layout==='classic'&&s.step==='payment');};

  P.r_done=function(){
    var o=this.s.placed,self=this,offer=this.cfg.demo||this.cfg.onPostPurchaseAdd?(this.cfg.addOns||[]).filter(function(a){return !o.lines.some(function(l){return l.id===a.id;});})[0]:null;
    var taken=offer&&o.extras.some(function(e){return e.id===offer.id;});
    return '<div class="zc-done"><div class="zc-done-mark">'+ic('check',34)+'</div><h3>Thank you'+(o.name?', '+esc(o.name.split(' ')[0]):'')+'!</h3><p>Order <b>'+esc(o.number)+'</b> is confirmed'+(o.method==='cod'?'. Pay when it arrives.':' and paid.')+' Updates go to +91 '+esc(o.phone)+'.</p>'+
      (offer?'<div class="zc-post">'+(taken?'<p>'+ic('check',16)+' '+esc(offer.name)+' added. It ships in the same box.</p>':(offer.image?'<img src="'+esc(offer.image)+'" alt="">':'')+'<div><b>Add '+esc(offer.name)+'?</b><small>Ships in the same box, no extra delivery</small></div><button data-zc="post:'+esc(offer.id)+'">Add '+money(offer.price)+'</button>')+'</div>':'')+
      '<section class="zc-card"><h4>Arriving in '+esc(o.days||'a few days')+'</h4><p class="zc-hint">'+esc(o.address)+'</p><ul class="zc-done-lines">'+o.lines.map(function(l){return '<li><span>'+l.qty+' × '+esc(l.name)+' <small>'+esc(l.label||'')+'</small></span><b>'+money(l.price*l.qty)+'</b></li>';}).join('')+
      o.extras.map(function(e){return '<li><span>1 × '+esc(e.name)+' <small>added after payment</small></span><b>'+money(e.price)+'</b></li>';}).join('')+'</ul><p class="zc-done-total"><span>'+(o.method==='cod'?'To pay on delivery':'Paid')+'</span><b>'+money(o.total)+'</b></p></section><button class="zc-btn" data-zc="close">Continue shopping</button></div>';
  };

  // ---------- events ----------
  P._click=function(e){var t=e.target.closest('[data-zc]');if(!t||!this.root.contains(t)||t.disabled)return;e.preventDefault();this._act(t.getAttribute('data-zc'));};
  P._act=function(a){
    var s=this.s,parts=a.split(':'),k=parts[0],v=parts.slice(1).join(':');
    if(k==='close'){if(!s.paying)this.close();return;}
    if(k==='inc'||k==='dec'){var i=+v,l=s.cart[i];l.qty+=k==='inc'?1:-1;if(l.qty<1)s.cart.splice(i,1);l.qty=Math.min(99,l.qty);return this.cartChanged();}
    if(k==='upgrade'){var line=s.cart[+v],u=line.upgrade;s.cart[+v]={id:u.id,name:line.name,label:u.label,price:u.price,qty:line.qty,image:u.image||line.image,upgrade:u.upgrade||null};return this.cartChanged();}
    if(k==='add'){var add=(this.cfg.addOns||[]).filter(function(x){return x.id===v;})[0];if(add){s.cart.push({id:add.id,name:add.name,label:add.label,price:add.price,qty:1,image:add.image,upgrade:add.upgrade||null});this.cartChanged();}return;}
    if(k==='summary'){s.summaryOpen=!s.summaryOpen;return this.render();}
    if(k==='otp-send')return this.sendOtp();
    if(k==='otp-change'){s.otpState='idle';s.otp='';return this.update('contact');}
    if(k==='apply-code'){s.code=s.codeInput;return this.refresh();}
    if(k==='coupon'){s.code=s.codeInput=v;var inp=this.root.querySelector('[data-field="codeInput"]');if(inp)inp.value=v;return this.refresh();}
    if(k==='method'){s.method=v;s.error='';return this.refresh();}
    if(k==='goto'){s.step=v;s.missing='';return this.render();}
    if(k==='back'){var st=STEPS[this.layout],ix=st.indexOf(s.step);if(ix>0){s.step=st[ix-1];s.missing='';this.render();}else this.close();return;}
    if(k==='next'||k==='pay')return this.advance();
    if(k==='post'){var o=s.placed,x=(this.cfg.addOns||[]).filter(function(y){return y.id===v;})[0];if(!x)return;var self=this;
      Promise.resolve(this.cfg.onPostPurchaseAdd?this.cfg.onPostPurchaseAdd(o,x):true).then(function(ok){if(ok===false)return;o.extras.push(x);o.total+=x.price;self.update('done');});return;}
  };
  P._input=function(e){
    var t=e.target,f=t.getAttribute('data-field');if(!f)return;var s=this.s,val=t.value;
    if(f==='phone'||f==='pin'||f==='otp'){val=val.replace(/\D/g,'').slice(0,f==='phone'?10:f==='pin'?6:(this.cfg.otpLength||4));if(t.value!==val)t.value=val;}
    if(f==='codeInput'){val=val.toUpperCase();}
    s[f]=val;
    if(f==='phone'){if(s.otpState==='sent'){s.otpState='idle';s.otp='';}var btn=this.root.querySelector('[data-zc="otp-send"]');if(btn)btn.disabled=!C.isMobile(val);if(s.missing==='contact'&&this.contactOk()){s.missing='';}this.update('paybar');}
    if(f==='pin'){var hit=C.lookupPin(val),self=this;if(hit){['city','state'].forEach(function(k){if(hit[k]){s[k]=hit[k];var i=self.root.querySelector('[data-field="'+k+'"]');if(i)i.value=hit[k];}});if(this.cfg.onPincode)this.cfg.onPincode(val);}this.refresh();}
    if(f==='otp'&&val.length===(this.cfg.otpLength||4))this.verifyOtp();
    if(s.missing==='address'&&this.addressOk()){s.missing='';var sec=this.root.querySelector('[data-zc-section="address"]');if(sec)sec.classList.remove('zc-missing');this.update('paybar');}
  };

  P.cartChanged=function(){
    if(this.cfg.onCartChange)try{this.cfg.onCartChange(clone(this.s.cart));}catch(err){console.error(err);}
    if(!this.s.cart.length)return this.render();
    if(this.s.method==='cod'&&!this.quote().cod.ok)this.s.method='upi';
    this.refresh();
  };

  P.sendOtp=function(){
    var s=this.s,self=this,otp=this.cfg.otp;s.otpState='sending';s.otpError='';this.update('contact');
    var send=otp&&otp.send?otp.send(s.phone):new Promise(function(r){setTimeout(r,500);});
    Promise.resolve(send).then(function(){
      s.otpState='sent';s.otp='';self.update('contact');var i=self.root.querySelector('[data-field="otp"]');if(i)i.focus({preventScroll:true});
      if(!otp||!otp.send){setTimeout(function(){if(s.otpState!=='sent')return;s.otp='123456'.slice(0,self.cfg.otpLength||4);self.update('contact');self.verifyOtp();},1100);}
      else if('OTPCredential' in window){var ac=new AbortController();self._otpAbort=ac;navigator.credentials.get({otp:{transport:['sms']},signal:ac.signal}).then(function(c){if(c&&c.code&&s.otpState==='sent'){s.otp=c.code;self.update('contact');self.verifyOtp();}}).catch(function(){});}
    },function(err){s.otpState='idle';s.otpError=(err&&err.message)||'Could not send the OTP. Try again.';self.update('contact');});
  };
  P.verifyOtp=function(){
    var s=this.s,self=this,otp=this.cfg.otp;
    Promise.resolve(otp&&otp.verify?otp.verify(s.phone,s.otp):true).then(function(ok){
      if(!ok){s.otpError='That code did not match. Check the SMS and try again.';s.otp='';self.update('contact');return;}
      s.otpState='verified';s.otpError='';if(s.missing==='contact')s.missing='';
      if(self.layout==='quick-sheet'&&s.step==='contact'){setTimeout(function(){s.step='address';self.render();},reduced()?0:450);}
      self.update('contact','paybar');var sec=self.root.querySelector('[data-zc-section="contact"]');if(sec)sec.classList.remove('zc-missing');
      if(self.cfg.onVerified)self.cfg.onVerified(s.phone);
    },function(){s.otpError='Could not check the code. Try again.';self.update('contact');});
  };

  P.flag=function(id){
    var s=this.s;s.missing=id;var sec=this.root.querySelector('[data-zc-section="'+id+'"]');
    if(sec){sec.classList.add('zc-missing');sec.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'center'});var inp=sec.querySelector('input:not([value]),input[value=""]');if(inp)setTimeout(function(){inp.focus({preventScroll:true});},300);}
    this.update('paybar');
  };

  P.advance=function(){
    var s=this.s,L=this.layout;
    if(s.paying)return;
    if(L==='quick-sheet'&&s.step!=='pay'){if(s.step==='contact'){if(!this.contactOk())return this.flag('contact');s.step='address';}else{if(!this.addressOk())return this.flag('address');s.step='pay';}s.missing='';return this.render();}
    if(L==='review-buy'&&s.step==='review'){s.step='details';return this.render();}
    if(L==='classic'&&s.step!=='payment'){if(s.step==='contact'){if(!this.contactOk())return this.flag('contact');s.step='delivery';}else{if(!this.addressOk())return this.flag('address');s.step='payment';}s.missing='';this.render();var sc=this.root.querySelector('.zc-scroll');if(sc)sc.scrollTop=0;return;}
    if(!this.contactOk()){if(L==='quick-sheet'){s.step='contact';this.render();}if(L==='classic'){s.step='contact';this.render();}return this.flag('contact');}
    if(!this.addressOk()){if(L==='quick-sheet'){s.step='address';this.render();}if(L==='classic'){s.step='delivery';this.render();}return this.flag('address');}
    this.pay();
  };

  P.payload=function(){
    var s=this.s,q=this.quote();
    return {lines:s.cart.map(function(l){return {id:l.id,qty:l.qty};}),method:s.method,code:s.code.trim().toUpperCase(),pin:s.pin,
      customer:{phone:s.phone,email:s.email.trim(),name:s.name.trim(),line1:s.line1.trim(),line2:s.line2.trim(),city:s.city.trim(),state:s.state.trim(),pin:s.pin},shownTotal:q.total};
  };

  P.pay=function(){
    var s=this.s,self=this,pm=this.cfg.payment||{mode:'demo'},q=this.quote(),payload=this.payload();
    s.paying=true;s.error='';this.update('paybar');
    function done(number){
      var lines=clone(s.cart);
      s.placed={number:number,lines:lines,total:q.total,method:s.method,name:s.name.trim(),phone:s.phone,days:q.delivery.days,extras:[],
        address:[s.line1,s.line2,s.city,s.state,s.pin].map(function(x){return String(x).trim();}).filter(Boolean).join(', ')};
      s.paying=false;s.cart=[];if(self.cfg.onCartChange)self.cfg.onCartChange([]);
      if(self.cfg.onComplete)self.cfg.onComplete(clone(s.placed));
      self.render();var sc=self.root.querySelector('.zc-scroll');if(sc)sc.scrollTop=0;
    }
    function fail(msg){s.paying=false;s.error=msg;self.update('paybar');}
    if(pm.mode!=='razorpay'){setTimeout(function(){done('#'+(1000+Math.floor(Math.random()*9000)));},reduced()?250:1500);return;}
    if(s.method==='cod'){Promise.resolve(pm.placeCod(payload)).then(function(r){r&&r.ok!==false?done(r.orderNumber||r.number||'Confirmed'):fail((r&&r.error)||'Could not place the order. Try again.');},function(){fail('Could not place the order. Check your connection and try again.');});return;}
    Promise.all([loadRazorpay(),Promise.resolve(pm.createOrder(payload))]).then(function(res){
      var o=res[1];if(!o||!o.orderId)return fail((o&&o.error)||'Could not start payment. Try again.');
      var rz=new window.Razorpay({key:o.key||pm.key,order_id:o.orderId,amount:o.amount,currency:o.currency||'INR',name:self.brand.name||'',image:self.brand.logo||undefined,
        prefill:{contact:'+91'+s.phone,name:s.name,email:s.email||undefined,method:s.method==='netbanking'?'netbanking':s.method},theme:{color:self.brand.color||'#111111'},
        handler:function(resp){Promise.resolve(pm.verify(resp,payload)).then(function(r){r&&r.ok?done(r.orderNumber||resp.razorpay_payment_id):fail('Payment received but not confirmed yet. Do not pay again; we will message you.');},function(){fail('Payment received but not confirmed yet. Do not pay again; we will message you.');});},
        modal:{ondismiss:function(){if(s.paying)fail('Payment cancelled. Your cart is saved.');}}});
      rz.on('payment.failed',function(r){fail((r&&r.error&&r.error.description)||'Payment failed. Try again or pick another method.');});
      rz.open();
    },function(){fail('Could not reach the payment service. Check your connection.');});
  };

  var rzp=null;
  function loadRazorpay(){if(window.Razorpay)return Promise.resolve();if(rzp)return rzp;rzp=new Promise(function(ok,no){var sc=document.createElement('script');sc.src='https://checkout.razorpay.com/v1/checkout.js';sc.onload=ok;sc.onerror=function(){rzp=null;no();};document.head.appendChild(sc);});return rzp;}

  P.close=function(){
    var self=this;if(this._closed)return;this._closed=true;if(this._otpAbort)this._otpAbort.abort();
    this.root.classList.remove('zc-open');
    setTimeout(function(){self.root.remove();if(!self.inFrame)document.body.style.overflow=self._overflow||'';if(self._prevFocus&&self._prevFocus.focus)self._prevFocus.focus({preventScroll:true});},reduced()?0:220);
    if(this.cfg.onClose)this.cfg.onClose(clone(this.s.cart),this.s.placed);
  };
  P.setCart=function(cart){this.s.cart=clone(cart||[]);this.render();};

  window.ZeroCut={version:'1.0.0',layouts:Object.keys(LAYOUTS),open:function(cfg){return new Checkout(cfg);}};
})();
