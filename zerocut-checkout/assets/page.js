(function(){
  'use strict';
  // Promote purchase actions only when there is a payment link.
  var url=(window.ZEROCUT_BUY_URL||'').trim();
  if(url){
    document.querySelectorAll('[data-buy]').forEach(function(a){
      a.href=url;a.rel='noopener';a.hidden=false;
    });
    document.querySelectorAll('[data-preview]').forEach(function(el){el.hidden=true;});
  }

  // Demo tabs.
  var screen=document.getElementById('zp-screen'),store=null,current='one-page';
  var tabs=[].slice.call(document.querySelectorAll('.zp-tabs [role=tab]'));
  function show(key){
    current=key;if(store)store.destroy();screen.innerHTML='';
    var b=ZeroCutDemo.brands[key];
    tabs.forEach(function(t){t.setAttribute('aria-selected',String(t.getAttribute('data-layout')===key));t.tabIndex=t.getAttribute('data-layout')===key?0:-1;});
    screen.setAttribute('aria-labelledby','zp-tab-'+key);
    document.getElementById('zp-brand').textContent=b.brand.name+' · made-up demo brand';
    document.getElementById('zp-layout-title').textContent=b.title;
    document.getElementById('zp-layout-tag').textContent=b.tagline;
    store=ZeroCutDemo.mount(screen,key);
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){show(t.getAttribute('data-layout'));});
    t.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;e.preventDefault();var n=tabs[(i+d+tabs.length)%tabs.length];n.focus();show(n.getAttribute('data-layout'));});
  });
  document.querySelectorAll('[data-demo]').forEach(function(link){
    link.addEventListener('click',function(e){
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      var key=link.getAttribute('data-demo');
      show(key);
      document.getElementById('zp-tab-'+key).focus({preventScroll:true});
    });
  });
  document.getElementById('zp-reset').addEventListener('click',function(){show(current);});
  show('one-page');

  // Savings calculator. The sales slider is logarithmic: ₹1 L to ₹1 Cr.
  var sales=document.getElementById('zp-sales'),fee=document.getElementById('zp-fee');
  function inr(n){return '₹'+Math.round(n).toLocaleString('en-IN');}
  function short(n){return n>=1e7?'₹'+(n/1e7).toFixed(n%1e7?1:0)+' Cr':'₹'+(n/1e5).toFixed(n<1e6&&n%1e5?1:0)+' L';}
  function calc(){
    var monthly=Math.round(1e5*Math.pow(100,sales.value/100)/5e4)*5e4;if(monthly<1e5)monthly=1e5;
    var pct=Number(fee.value),m=monthly*pct/100,y=m*12;
    document.getElementById('zp-sales-out').textContent=short(monthly);
    document.getElementById('zp-fee-out').textContent=pct.toFixed(1)+'%';
    document.getElementById('zp-keep').textContent=inr(Math.max(0,y-999));
    document.getElementById('zp-month').textContent=inr(m)+' per month in app fees, before the ₹999 kit price.';
    document.getElementById('zp-t-fee').textContent=pct.toFixed(1)+'% · '+inr(m)+'/mo';
    document.getElementById('zp-t-year').textContent=inr(y);
  }
  sales.addEventListener('input',calc);fee.addEventListener('input',calc);calc();
})();
