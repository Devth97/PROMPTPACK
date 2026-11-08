'use strict';

const media = '/assets/ugc-course/';
const heroClips = [['more-5', 'Product in hand'], ['hero-2', 'Direct to camera'], ['hero-3', 'Movement in the frame']];
const moreClips = [['more-1', 'Selfie framing'], ['more-2', 'Golden-hour light'], ['more-3', 'A close conversation'], ['more-4', 'A wider presenter shot'], ['more-6', 'An outdoor setting']];
const workflowAlts = [
  "Cinematic reference breakdown with three orange-notebook demonstration frames beside an analysis panel.",
  "Product and presenter reference sheet showing the same woman from three angles and the same orange notebook from two angles.",
  "Six cinematic storyboard frames plan a notebook ad from scattered notes to a sample-page closing shot.",
  "Four-frame contact sheet shows presenter direction, hand actions and the phone-camera recording setup.",
  "Side-by-side matching notebook frames compare a neutral image with a subtle warm film finish.",
  "Two opening crops, organized delivery files and an empty results sheet show a planned one-variable test."
];
const steps = [
  ['One product. One visible task.', 'Choose what you can demonstrate, record the facts and set the boundaries of the brief.', 'Demonstration brief + evidence ledger'],
  ['Give every shot a shared look.', 'Turn the framing, light and mood of your references into an original style lock.', 'A reusable visual direction'],
  ['Make the opening earn its place.', 'Write a hook, then build six scene briefs that show what the opening promises.', 'Hook + six scene boards'],
  ['Direct the action, not just the words.', 'Plan the presenter, the product interaction and the recording handoff. Rehearse before the final take.', 'Recordable script + presenter handoff'],
  ['Review what the viewer will believe.', 'Check the demonstration, claims, captions and placement crop before you approve the edit.', 'Reviewed script + export checklist'],
  ['Make the next test a useful one.', 'Package the approved files and choose one variable to change in your next version.', 'Export package + experiment plan']
];

function clip(file, label, number, esc) {
  const width = file.startsWith('hero-') ? 480 : 540;
  const height = file.startsWith('hero-') ? 854 : 960;
  return `<figure class="ugc-clip"><div class="ugc-video-frame"><video controls muted playsinline preload="none" width="${width}" height="${height}" poster="${media}${file}.jpg" aria-label="Visual reference ${number}: ${esc(label)}"><source src="${media}${file}.mp4" type="video/mp4">Your browser cannot play this clip. <a href="${media}${file}.mp4">Open reference ${number}</a>.</video><span class="ugc-clip-tag" aria-hidden="true">${number} / 10 SEC</span></div><figcaption>${esc(label)}</figcaption></figure>`;
}

module.exports = function ugcLanding(p, edition, esc, checkout, price) {
  return `<div class="ugc-landing"><div class="breadcrumb"><a href="/#catalog">All products</a> / ${esc(p.category)} / ${esc(p.name)}</div>
<header class="ugc-hero"><div class="ugc-hero-copy"><span class="eyebrow">${esc(p.name)} · self-paced kit</span><h1>A better UGC ad starts <mark>before the first take.</mark></h1><p class="intro">Turn one real product into a clear hook, six visual boards and a script you can actually record. Give your AI tools a direction worth following.</p><ul class="ugc-facts"><li>${edition.pdf_pages}-page guide</li><li>${edition.prompt_count} editable prompts</li><li>Worksheets + worked example</li></ul><div class="ugc-actions"><a class="button buy-cta" href="${checkout}"><span class="buy-label">Get the complete kit ↗</span><span class="buy-price">${price} · one time · instant download</span></a><a class="secondary-action" href="#ugc-workflow">Explore the workflow ↓</a></div><p class="ugc-note">Download the kit. Work at your own pace. Use your own AI tools and editor.</p></div><div class="ugc-hero-examples"><div class="ugc-hero-rail" role="region" aria-label="Three UGC visual references, scroll to explore" tabindex="0">${heroClips.map(([file, label], i) => clip(file, label, String(i + 1).padStart(2, '0'), esc)).join('')}</div><p class="ugc-reference-note">Visual references for framing and direction. These clips are separate from the kit’s worked example.</p></div></header>
<nav class="ugc-jump" aria-label="Explore the UGC kit"><a href="#ugc-examples">Watch the references ↗</a><a href="#ugc-workflow">The workflow ↓</a><a href="#inside">Inside the download ↓</a><a href="#sample-heading">Try a free prompt ↓</a></nav>
<section class="ugc-examples" id="ugc-examples" aria-labelledby="ugc-examples-heading"><div class="ugc-section-heading"><div><span class="ugc-kicker">The reference wall</span><h2 id="ugc-examples-heading">Different settings.<br>Decisions you can study.</h2></div><p>Notice the camera distance, eye line, background and movement. Choose the decisions that suit your product, then write an original brief.</p></div><div class="ugc-reference-rail" role="region" aria-label="Five more video references, scroll to explore" tabindex="0">${moreClips.map(([file, label], i) => clip(file, label, String(i + 4).padStart(2, '0'), esc)).join('')}</div><p class="ugc-reference-note">10-second visual references · press play for each clip · reference media is not a lesson recording or a promised output.</p></section>
<section class="ugc-workflow" id="ugc-workflow" aria-labelledby="ugc-workflow-heading"><div class="ugc-section-heading"><div><span class="eyebrow">From brief to handoff</span><h2 id="ugc-workflow-heading">Six steps. A plan<br>you can put to work.</h2></div><p>Each step ends with something you keep. Cinematic concept previews show the working material at each stage: reference sheets, shot plans and frame comparisons. Select any image to enlarge it.</p></div><ol class="ugc-steps">${steps.map(([title, body, output], i) => `<li><a class="ugc-step-image" href="${media}workflow-${String(i + 1).padStart(2, '0')}.webp" data-lightbox target="_blank" rel="noopener" aria-label="Enlarge the preview for ${esc(title)}"><img src="${media}workflow-${String(i + 1).padStart(2, '0')}.webp" width="960" height="640" loading="lazy" alt="${esc(workflowAlts[i])}"></a><div><span class="ugc-step-number">${String(i + 1).padStart(2, '0')} / ${esc(edition.lessons[i])}</span><h3>${esc(title)}</h3><p>${esc(body)}</p><p class="ugc-output"><b>You’ll have</b> ${esc(output)}</p></div></li>`).join('')}</ol></section>
<section class="ugc-download-banner" aria-labelledby="ugc-download-heading"><div><span class="ugc-kicker">Made to be used</span><h2 id="ugc-download-heading">The files behind the workflow.</h2><p>See the guide pages, editable prompts and original worked example before you buy.</p></div><a class="button" href="#inside">Look inside the kit ↓</a></section></div>`;
};
