 'use strict';
// Homepage feature. Shared by the full storefront and the homepage-only refresh.
function render(){return `<section class="home-hero home-zerocut" aria-labelledby="home-feature-title">
<div class="zh-copy"><span class="eyebrow">NEW ON PROMPTPACK · ZEROCUT CHECKOUT</span><h1 id="home-feature-title">Your checkout.<br><mark>Your rules.</mark></h1><p class="zh-intro">Four checkout layouts. Your branding.<br>A one-time toolkit for your online store.</p><p class="zh-description">Take payments through your Razorpay account, offer COD, and customise the journey from cart to confirmation.</p><div class="zh-price"><strong>₹999</strong><span>one payment<br>No recurring ZeroCut fee</span></div><div class="zh-actions"><a class="button" href="/checkout/zerocut-checkout/">Buy now · ₹999 <span aria-hidden="true">↗</span></a><a class="zh-demo" href="/zerocut-checkout/#demo-launch">Try the live demos <span aria-hidden="true">↗</span></a></div><p class="zh-costs">Gateway, Shopify, SMS and hosting costs are separate.<br>Setup and ongoing maintenance are yours.</p><a class="zh-browse" href="#catalog">Explore all 9 PromptPack kits <span aria-hidden="true">↓</span></a></div>
<figure class="zh-visual"><div class="zh-label"><span>ZEROCUT / CHECKOUT KIT</span><span>01 — 04</span></div><div class="zh-preview"><div class="zh-preview-title">Made for<br><em>your store.</em></div><div class="zh-phones"><img src="/zerocut-checkout/assets/one-page.webp" width="720" height="1305" fetchpriority="high" alt="One Page checkout with photographic chai products, upgrades and add-ons"><img src="/zerocut-checkout/assets/review-buy.webp" width="720" height="1305" alt="Review and Buy checkout with cast iron cookware and add-on products"></div></div><figcaption><b>4 layouts. One kit.</b><span>UPI · CARDS · COD</span></figcaption><div class="zh-layouts"><span>One Page</span><span>Quick Sheet</span><span>Review &amp; Buy</span><span>Classic Form</span></div></figure>
</section>`;}
function upgrade(html){
 const match=/<(div|section) class="home-hero[^"]*"[^>]*>/.exec(html);
 if(!match)throw Error('Homepage hero not found');
 const tag=match[1],tokens=new RegExp('<(/?)'+tag+'\\b[^>]*>','g');tokens.lastIndex=match.index;
 let depth=0,end=0,t;
 while((t=tokens.exec(html))){depth+=t[1]?-1:1;if(depth===0){end=tokens.lastIndex;break;}}
 if(!end)throw Error('Homepage hero boundary not found');
 html=html.slice(0,match.index)+render()+html.slice(end);
 html=html.replace(/<link rel="stylesheet" href="\/assets\/hero-stage\.css[^"]*">/g,'').replace(/<script src="\/assets\/hero-stage\.js[^"]*" defer><\/script>/g,'');
 if(!html.includes('/assets/home-zerocut.css'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/home-zerocut.css"></head>');
 return html;
}
module.exports={render,upgrade};
