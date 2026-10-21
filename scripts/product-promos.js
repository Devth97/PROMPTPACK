'use strict';

const website = {
  file: 'website-scroll', poster: 'jpg', width: 1280, height: 648, seconds: 26,
  title: 'A website with depth, rhythm and motion',
  description: 'Watch a scroll-led website move between its opening, product scene and next action. Use it as a visual reference when writing your own layout and motion brief.'
};
const promos = {
  'website-prompts': {
    file: 'website-prompts-launch', poster: 'webp', width: 1920, height: 1080, seconds: 38, ambient: true,
    title: 'The whole pack in 38 seconds',
    description: 'Browse the previews, open a prompt, copy it and build with your AI coding tool. Every preview, count and prompt in this tour comes from the pack itself.'
  },
  '3d-website-lab': website,
  'ugc-ad-scripts': {
    file: 'ugc-product-demo', poster: 'jpg', width: 540, height: 960, seconds: 10,
    title: 'Put the product in the frame',
    description: 'A product-in-hand demonstration with direct-to-camera framing. Use this visual reference to plan the opening, presenter action and product reveal in your own ad script.'
  },
  'ai-video-direction': {
    file: 'video-parallax', poster: 'jpg', width: 720, height: 1280, seconds: 8,
    title: 'Give a shot depth and direction',
    description: 'A moving foreground, a clear subject and a layered setting create depth. Use this visual reference when briefing camera movement, blocking and continuity.'
  },
  'video-prompt-vault': {
    file: 'video-scale', poster: 'jpg', width: 720, height: 1280, seconds: 8,
    title: 'Make scale part of the shot brief',
    description: 'A surreal sequence uses scale, a low camera angle and a close-up to change the mood. Use this visual reference to make your framing and shot-selection prompts more specific.'
  },
  'lyric-visuals': {
    file: 'lyric-scrapbook', poster: 'webp', width: 1280, height: 922, seconds: 15,
    title: 'Find a visual rhythm for the words',
    description: 'A scrapbook-style edit combines cutout imagery, expressive type and changing compositions. Use this visual reference to plan your own lyric cues, motifs and transitions.'
  }
};

module.exports = function productPromo(slug, esc) {
  const promo = promos[slug];
  if (!promo) return '';
  const path = '/assets/product-promos/' + promo.file;
  // Ambient tours have no sound and no controls; assets/effects.js plays them while on screen.
  if (promo.ambient) return `<section class="product-promo product-promo--wide" aria-labelledby="promo-heading"><div><span class="eyebrow">Pack tour</span><h2 id="promo-heading">${esc(promo.title)}</h2><p id="promo-description">${esc(promo.description)}</p></div><figure><video data-ambient autoplay muted loop playsinline disablepictureinpicture disableremoteplayback preload="metadata" width="${promo.width}" height="${promo.height}" poster="${path}.${promo.poster}" aria-label="${esc(promo.title)}" aria-describedby="promo-description"><source src="${path}.mp4" type="video/mp4"></video><figcaption>${promo.seconds}-second silent tour · loops</figcaption></figure></section>`;
  return `<section class="product-promo" aria-labelledby="promo-heading"><div><span class="eyebrow">Visual example</span><h2 id="promo-heading">${esc(promo.title)}</h2><p id="promo-description">${esc(promo.description)}</p><p class="promo-scope">Archive demo. Your purchase is the digital pack described on this page. Use your own production tools and rights-cleared media.</p></div><figure><video controls muted playsinline preload="none" width="${promo.width}" height="${promo.height}" poster="${path}.${promo.poster}" aria-label="${esc(promo.title)}" aria-describedby="promo-description"><source src="${path}.mp4" type="video/mp4">Your browser cannot play this video. <a href="${path}.mp4">Open the visual example</a>.</video><figcaption>${promo.seconds}-second visual reference · play when you are ready</figcaption></figure></section>`;
};
