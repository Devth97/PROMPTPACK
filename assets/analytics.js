'use strict';
// Keep existing storefront analytics restricted to the production site.
if (['promptpack.tech', 'www.promptpack.tech'].includes(location.hostname)) {
  (function(f,b,e,v,n,t,s) {
    if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];
    t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);
  })(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init','2116311975585050');
  window.fbq('track','PageView');
  (function(c,l,a,r,i,t,y) {
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=true;t.src='https://www.clarity.ms/tag/'+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window,document,'clarity','script','xidr4f4am8');
}
