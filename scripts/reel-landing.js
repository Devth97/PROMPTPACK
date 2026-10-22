'use strict';
// Landing section for the Juno & Pixel character-reel pack (slug motion-with-code). It replaces the
// generic product hero; the standard detail sections (inside pages, sample prompt, FAQ, buy panel,
// sources) still follow it. Every reel shown was rendered with the engine in the pack.
const REELS = [
  { src: '/assets/product-previews/juno-pixel-ep02.mp4', poster: '/assets/product-previews/juno-pixel-ep02.jpg', title: 'The database is gone', meta: '35 s · premium voices' },
  { src: '/assets/product-previews/juno-pixel-ep03.mp4', poster: '/assets/product-previews/juno-pixel-ep03.jpg', title: 'My API key is on GitHub', meta: '39 s · premium voices' },
  { src: '/assets/product-previews/motion-with-code-reel.mp4', poster: '/assets/product-previews/motion-with-code-reel-poster.jpg', title: 'Who animated us?', meta: '46 s · free voices' },
  { src: '/assets/product-previews/juno-pixel-ep05.mp4', poster: '/assets/product-previews/juno-pixel-ep05.jpg', title: 'Fixed one bug, broke three', meta: '33 s · premium voices' },
  { src: '/assets/product-previews/juno-pixel-ep08.mp4', poster: '/assets/product-previews/juno-pixel-ep08.jpg', title: 'My site is down', meta: '32 s · premium voices' },
];

// The 16:9 product ad in the hero: Juno and Pixel explain how the reels are made (engine episode ad05 plus proof panels).
const AD = { src: '/assets/brand/juno-pixel-ad.mp4', poster: '/assets/brand/juno-pixel-ad-poster.jpg', caption: 'The Juno & Pixel ad, made with this engine' };

const STEPS = [
  ['Write', 'About 100 words: who speaks, how they feel, where they pause. Or let a prompt write it.', 'script.json'],
  ['Voice', 'Free built-in voices with 18 emotions, or plug in your own ElevenLabs key for premium voices.', 'free or premium'],
  ['Time', 'Every word gets a timestamp. It drives the lip sync and the word-by-word captions.', 'automatic'],
  ['Direct', 'The engine picks a camera for every line from 24 moves: crash zooms, whip pans, slow pushes.', '24 camera moves'],
  ['Render', 'A vertical 1080 × 1920 MP4, captions clear of the app buttons, sound at the Reels level.', 'one command'],
];

const INSIDE = [
  ['The engine', 'Characters, set, camera, captions and tools. Ready to run on your computer.'],
  ['16-page guide', 'From setup to your first finished reel, step by step.'],
  ['20 prompts', 'Write episodes, punch up jokes, plan shots and captions with your AI assistant.'],
  ['10 ready episodes', 'Original scripts you can render the day you buy.'],
  ['4 reel formats', 'Disaster and fix, myth vs fact, product launch, "how it\'s made".'],
  ['Character + voice kit', 'Design your own characters and cast their voices.'],
  ['Posting kit', 'Captions, cover frames, safe zones and a 30-day calendar.'],
  ['Brand reskin guide', 'Swap in your own mascot, colours and end card.'],
];

const FAQ = [
  ['Is this an AI video generator?', 'No. Every frame is drawn by code (three.js in a browser) and rendered on your own computer. The only AI involved is the voices, and the free ones run locally. That is why a reel looks the same every time and one changed line re-renders cleanly.'],
  ['Do I need to know how to code?', 'No, but you need to be comfortable installing a few free tools (Node.js, Python, ffmpeg) and pasting commands. A coding assistant like Claude Code, Codex or Cursor makes it easier: the guide gives you the exact prompts.'],
  ['Is it really unlimited?', 'Yes. The engine is yours, so there are no credits, no per-video fee and no watermark. With the free voices, each reel costs nothing. Premium ElevenLabs voices are optional and use your own ElevenLabs plan.'],
  ['How long does a reel take?', 'Writing is up to you. Rendering a 35-second reel took about 4 to 5 minutes on our laptop; yours depends on your computer. You can queue a whole week of episodes with one command.'],
  ['Can I use my own characters?', 'Yes. The pack includes a character design sheet, a voice casting sheet and a brand reskin guide, so you can make your own mascot and colours.'],
  ['What if the download does not work?', 'You get the ZIP right after payment. If it fails or the file is damaged and we cannot fix it, you get a full refund. Raise it within 7 days; see the refund policy.'],
];

module.exports = function reelLanding(p, edition, esc, checkout, price) {
  const reels = REELS.map((r) => `<figure class="jp-reel"><video controls playsinline preload="none" poster="${r.poster}" width="720" height="1280"><source src="${r.src}" type="video/mp4">Your browser cannot play this reel.</video><figcaption><b>${esc(r.title)}</b><span>${esc(r.meta)}</span></figcaption></figure>`).join('');
  const steps = STEPS.map(([t, d, tag], i) => `<li class="jp-step"><span class="jp-num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(t)}</h3><p>${esc(d)}</p><small>${esc(tag)}</small></li>`).join('');
  const inside = INSIDE.map(([t, d]) => `<li><b>${esc(t)}</b><span>${esc(d)}</span></li>`).join('');
  const faq = FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}${q.startsWith('What if') ? ' <a href="/refund/">Refund policy ↗</a>' : ''}</p></details>`).join('');
  const buy = (label) => `<a class="button buy-cta jp-buy" href="${checkout}"><span class="buy-label">${label} <span aria-hidden="true">↗</span></span><span class="buy-price">${price} · one time · instant download</span></a>`;
  return `<div class="breadcrumb"><a href="/#catalog">All products</a> / ${esc(p.category)}</div>
<header class="jp-hero jp-hero--wide"><div class="jp-hero-copy"><span class="eyebrow">Character reels · made in code</span><h1>Make Juno &amp; Pixel reels from a 100-word script</h1>
<p class="intro">Two 3D characters who talk, react and get the joke. Write a short script and the engine voices it, times every word, picks every camera and renders a finished vertical reel on your own computer. No camera, no animator, no video model, no per-video fee.</p>
<div class="product-actions">${buy('Get Juno &amp; Pixel')}<a class="secondary-action" href="#jp-reels">Watch the reels ↓</a></div>
<ul class="jp-trust"><li>Instant download</li><li>UPI, cards, netbanking</li><li>One payment, unlimited reels</li><li>Works with Claude Code, Codex or Cursor</li></ul></div>
<figure class="jp-hero-ad"><video controls playsinline preload="metadata" poster="${AD.poster}" width="1280" height="720"><source src="${AD.src}" type="video/mp4"></video><figcaption>${esc(AD.caption)} · tap for sound</figcaption></figure></header>

<section class="jp-section" id="jp-reels"><h2>Reels made with this exact engine</h2><p class="jp-lede">Press play on any of them. Each one came from a script of about 100 words. Tap for sound.</p><div class="jp-reels" tabindex="0" role="region" aria-label="Example reels">${reels}</div>
<p class="note">All five were rendered with the engine in this pack. "Premium voices" use our own ElevenLabs account, which is optional; the free built-in voices are included and cost nothing to run.</p></section>

<section class="jp-section"><h2>How a reel is made</h2><p class="jp-lede">A script goes in. A finished reel comes out. The characters, set, camera and captions are all code, so nothing drifts between episodes.</p><ol class="jp-steps">${steps}</ol></section>

<section class="jp-section jp-two"><div><h2>Everything you get</h2><ul class="jp-inside">${inside}</ul></div>
<div class="jp-costs"><h2>What it costs to run</h2><table><tbody><tr><th>The engine</th><td>Included, yours to keep</td></tr><tr><th>Voices</th><td>Free built-in voices; premium ElevenLabs voices optional, on your own plan</td></tr><tr><th>Rendering</th><td>On your computer: no credits, no watermark, no per-video fee</td></tr><tr><th>Tools</th><td>Node.js, Python and ffmpeg, all free</td></tr></tbody></table>
<h2>Code reels vs. AI video generators</h2><table><tbody><tr><th></th><td><b>Juno &amp; Pixel</b></td><td><b>Typical generator</b></td></tr><tr><th>Same characters every time</th><td>Yes, drawn by code</td><td>Can drift between clips</td></tr><tr><th>Fix one line</th><td>Re-render, nothing else moves</td><td>Regenerate the clip</td></tr><tr><th>Cost per reel</th><td>Free with built-in voices</td><td>Credits per clip</td></tr></tbody></table></div></section>

<section class="jp-cta"><div><h2>Start your series today</h2><p>One payment. The complete ZIP right after payment verification. Pay with UPI, Indian cards, netbanking or an international card.</p></div>${buy('Get Juno &amp; Pixel')}</section>

<section class="jp-section jp-faq faq"><h2>Questions</h2>${faq}</section>`;
};
