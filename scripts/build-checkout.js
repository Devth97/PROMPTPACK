'use strict';
const fs=require('node:fs');
const path=require('node:path');
const catalog=require('../api/_products');
module.exports=({page,write,products,editions,origin,esc})=>{
 for(const p of products){
  const product=catalog.bySlug(p.slug),edition=editions.find(e=>e.slug===p.slug);
  const encrypted=path.join(__dirname,'..','private',product?product.file:'');
  // AES-GCM adds a 12-byte IV and 16-byte tag, so a stale or partial file shows up as a size mismatch.
  if(!product||product.sha256!==edition.sha256||!fs.existsSync(encrypted)||fs.statSync(encrypted).size!==product.bytes+28)throw Error('Run node scripts/prepare-checkout.js for '+p.slug);
  const price='US$'+(product.amount/100);
  const priceInr='₹'+(product.amount_inr/100).toLocaleString('en-IN');
  const url='/checkout/'+p.slug+'/';
  const body=`<div class="breadcrumb"><a href="/products/${p.slug}/">${esc(p.name)}</a> / Checkout</div><div class="checkout-layout"><section><span class="eyebrow">One-time digital purchase</span><h1>Your next project starts here.</h1><h2>${esc(p.name)}</h2><p>${esc(edition.subtitle)}</p><img class="checkout-cover" src="${edition.cover}" width="1200" height="800" alt="${esc(p.name)} digital guide mockup"><h2>Your complete download</h2><ul>${edition.includes.map(i=>`<li>${esc(i)}</li>`).join('')}</ul><p><strong>Download format:</strong> ZIP containing the PDF, editable files and practical materials.</p><p>${esc(edition.limits)}</p><p>Use your own tools. Software subscriptions and AI credits are separate.</p></section><aside class="panel checkout-panel"><span class="eyebrow">Order summary</span><h2>${esc(p.name)}</h2><p class="checkout-price">${priceInr} <span>or ${price}</span></p><p>One payment. No PromptPack subscription.</p><form data-checkout="${p.slug}"><label for="buyer-email">Email for your receipt and download</label><input id="buyer-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"><fieldset class="pay-choice"><legend>Choose how to pay</legend><button class="pay-option pay-inr" type="submit" name="plan" value="inr"><b>Pay ${priceInr}</b><span>UPI, Indian cards, netbanking &amp; wallets</span></button><button class="pay-option pay-usd" type="submit" name="plan" value="usd"><b>Pay ${price}</b><span>International card</span></button></fieldset></form><noscript><p>Enable JavaScript to use Razorpay checkout.</p></noscript><p id="checkout-status" class="checkout-status" role="status" aria-live="polite"></p><p class="checkout-fine">Payment details are entered in Razorpay's secure window. After payment verification, download the complete pack here. Keep your payment reference for support.</p><p class="checkout-fine">By purchasing, you agree to our <a href="/terms">terms</a> and <a href="/refund">refund policy</a>. See our <a href="/privacy">privacy policy</a>.</p><p><a href="/products/${p.slug}/#inside">Review actual pages before paying ↗</a></p></aside></div>`;
  let html=page('Checkout — '+p.name+' | PromptPack',`Buy ${p.name} for ${priceInr} (UPI and Indian cards) or ${price} (international cards). One-time digital download.`,url,body,{'@context':'https://schema.org','@type':'WebPage',name:'Checkout — '+p.name,url:origin+url},edition.cover);
  html=html.replace('</head>','<meta name="robots" content="noindex,follow"><link rel="stylesheet" href="/assets/checkout.css"><script src="https://checkout.razorpay.com/v1/checkout.js" defer></script><script src="/assets/checkout.js" defer></script></head>');
  write('checkout/'+p.slug+'/index.html',html);
 }
 const thanks=`<section class="delivery"><span class="eyebrow">Your PromptPack download</span><h1>Good things.<br>Ready to make.</h1><p id="delivery-status" role="status" aria-live="polite">Checking your download link…</p><div class="panel" id="delivery-ready" hidden><h2 id="delivery-name"></h2><p id="delivery-meta"></p><a class="button" id="delivery-download" href="#">Download your pack ↓</a><p>Save and unzip the download, then open GUIDE.pdf and the starter README. Keep a copy of your files.</p></div><p><a href="/contact">Need help? Contact support ↗</a></p><p><a href="/#catalog">Explore more packs ↗</a></p></section>`;
 let html=page('Your download | PromptPack','Download your purchased PromptPack digital toolkit.','/checkout/thanks/',thanks,{'@context':'https://schema.org','@type':'WebPage',name:'Your download'});
 // Entitlement pages load no advertising or session-replay scripts.
 html=html.replace('</head>','<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><link rel="stylesheet" href="/assets/checkout.css"><script src="/assets/order-thanks.js" defer></script></head>');
 write('checkout/thanks/index.html',html);
};
