'use strict';

const website = {
  file: 'website-scroll', poster: 'jpg', width: 1280, height: 648, seconds: 26,
  title: 'A website with depth, rhythm and motion',
  description: 'Watch a scroll-led website move between its opening, product scene and next action. Use it as a visual reference when writing your own layout and motion brief.'
};
const promos = {
  'website-prompts': website,
  'ugc-ad-scripts': {
    file: 'ugc-product-demo', poster: 'jpg', width: 540, height: 960, seconds: 10,
    title: 'Put the product in the frame',
    description: 'A product-in-hand demonstration with direct-to-camera framing. Use this visual reference to plan the opening, presenter action and product reveal in your own ad script.'
  }
};

module.exports = function productPromo(slug, esc) {
  const promo = promos[slug];
  if (!promo) return '';
  const path = '/assets/product-promos/' + promo.file;
  return `<section class="product-promo" aria-labelledby="promo-heading"><div><span class="eyebrow">Visual example</span><h2 id="promo-heading">${esc(promo.title)}</h2><p id="promo-description">${esc(promo.description)}</p><p class="promo-scope">Archive demo. Your purchase is the digital pack described on this page. Use your own production tools and rights-cleared media.</p></div><figure><video controls muted playsinline preload="none" width="${promo.width}" height="${promo.height}" poster="${path}.${promo.poster}" aria-label="${esc(promo.title)}" aria-describedby="promo-description"><source src="${path}.mp4" type="video/mp4">Your browser cannot play this video. <a href="${path}.mp4">Open the visual example</a>.</video><figcaption>${promo.seconds}-second visual reference · play when you are ready</figcaption></figure></section>`;
};
