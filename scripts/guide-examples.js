'use strict';
// Worked examples for the free /learn/ guides: real runs recorded in learn/examples/. The raw files
// are read at build time, so the page and the published files cannot drift apart.
const fs = require('node:fs');
const path = require('node:path');
const exampleFile = file => fs.readFileSync(path.join(__dirname, '..', 'learn/examples', file), 'utf8').trim();
const exampleUrl = file => `/learn/examples/${file}`;
const RUN = 'Generated on 28 October 2026 in a Claude Code session by Claude Opus 5.5 (model ID claude-opus-5-5).';
const slideAlt = [
  'Slide 1 of 6: Alt text starts with one question. What is this image doing on the page?',
  'Slide 2 of 6: People who can’t see your image still need what it adds. Screen readers read alt text aloud or show it as Braille; an empty alt lets them skip decoration.',
  'Slide 3 of 6: Five jobs, five answers. Decoration: empty alt. Link or button: where it goes. Adds meaning: describe the meaning. Chart or diagram: explain it on the page. Text in image: repeat the text.',
  'Slide 4 of 6, fictional example: one bakery page with three images. Logo linking home: alt “Rosa’s Bakery home”. Photo of the loaf: a short description. Wavy divider: empty alt.',
  'Slide 5 of 6: Check one page today. List every image, write its job next to it, write or fix the alt text.',
  'Slide 6 of 6: Job first. Words second. Run your homepage images through the W3C alt decision tree.'
];

const examples = {
  'ai-website-prompt-template': {
    summary: 'We filled the template for a fictional pottery studio, generated a page from it, checked that page in a browser and asked for one revision. Everything below is the unedited input and output of that run.',
    run: `${RUN} Checked with Lighthouse 12.8.2 (mobile accessibility and best-practice audits) and Chrome screenshots at 390 px and 1280 px wide. Cost was not measured.`,
    input: 'website-brief/brief-v1.txt',
    first: {label: 'First output: the page and its checklist', files: [['Open version 1 (HTML)', 'website-brief/v1.html'], ['Checklist returned with it', 'website-brief/checklist-v1.txt']], images: [
      ['/assets/learn/website-v1-session.webp', 600, 1160, 'Version 1 on a 390 px screen: a four-step session outline that the brief never supplied, below a yellow missing-information note'],
      ['/assets/learn/website-v1-enquiry.webp', 600, 1002, 'Version 1 enquiry section: a name, email, number of people and date form that submits through a mailto link']]},
    findings: [
      'Lighthouse accessibility and best-practice audits scored 100, and nothing overflowed sideways at 390 px or 1280 px. The automated checks did not catch the problems below.',
      'The page invented a four-step session outline. It labelled the outline as unconfirmed, but the brief had supplied no schedule.',
      'The enquiry form posted through a <code>mailto:</code> link, which does nothing for visitors without a configured email app, and its date field accepted any day, not only Saturdays.',
      'Two inline email links measured under 24 px tall, small for a fingertip.',
      'It correctly marked the address, age limit, accessibility and cancellation policy as missing instead of inventing them.'],
    revision: 'website-brief/revision-v2.txt',
    second: {label: 'Revised output', files: [['Open version 2 (HTML)', 'website-brief/v2.html'], ['Updated checklist', 'website-brief/checklist-v2.txt']], images: [
      ['/assets/learn/website-v2-top.webp', 600, 1298, 'Version 2 first screen on a phone: headline, short introduction and a Send a booking enquiry button'],
      ['/assets/learn/website-v2-session.webp', 600, 770, 'Version 2 schedule: 10:00 wheel practice, then choosing glazes before 13:00, with no invented steps'],
      ['/assets/learn/website-v2-enquiry.webp', 600, 782, 'Version 2 enquiry section: one Email the studio button with a pre-filled message and a larger email link']]},
    after: 'Version 2 kept both 100 scores, removed the invented steps, replaced the form with one pre-filled email button and passed the 24 px tap-target check.',
    limits: [
      'One run with one tool. Another tool, model or run will produce a different page from the same brief.',
      'Northside Clay Studio is fictional and hello@example.com is a placeholder; the demo pages are not indexed.',
      'An automated accessibility score is not a full accessibility review. No screen reader or real-device test was done.',
      'A mailto button still depends on the visitor having an email app. A real studio would need a form or booking service.']
  },
  'ugc-ad-script-template': {
    summary: 'We filled the template for a product we can show honestly: PromptPack’s own Carousel Studio. Its facts can be checked on its product page, and the presenter relationship is stated as “works for the seller”. The run stops at the script; nothing was filmed.',
    run: `${RUN} Spoken length was estimated from word count. Cost was not measured.`,
    input: 'ugc/brief.txt',
    first: {label: 'First output: six scene briefs', text: 'ugc/output-v1.txt'},
    findings: [
      'Every product fact in the script matched the brief: 29-page guide, 28 prompts and the worked example.',
      'The hook “Here’s what I use now” claims personal use. The output flagged it for review, but the brief had asked for no invented personal experience.',
      'The disclosure appeared in the flags but in no scene, so a viewer watching without the caption would miss it.',
      'Scene 1 needed three mismatched slides that nobody had supplied, and scene 5 said what the assistant “gives” in general rather than what the recording shows.',
      'The six spoken lines total 71 words: roughly 24 to 28 seconds at 2.5 to 3 words per second. That is an estimate for rehearsal, not a recording time.'],
    revision: 'ugc/revision.txt',
    second: {label: 'Revised scenes', text: 'ugc/output-v2.txt'},
    after: 'The revised hook shows the kit’s own worked example, the disclosure is on screen in scene 1, and scene 5 describes only the response recorded on the day.',
    limits: [
      'The ad was not recorded, edited or run, so there is no watch time, click or sales result to report.',
      'A seller demonstrating their own product is not a customer testimonial and should not be presented as one.',
      'The spoken length is an estimate. Rehearse aloud and time it.',
      'Showing another company’s app in an ad can be subject to its brand rules; check before publishing.']
  },
  'ai-carousel-prompt-template': {
    summary: 'We filled the template with a sourced topic: how to choose alt text, using the W3C WAI alt decision tree. The plan came from the template; the slides were then laid out in HTML and CSS and exported as images. No image generator was used.',
    run: `${RUN} Slides composed in HTML/CSS with the Figtree font and exported at 1080 × 1350 px with headless Chrome. W3C sources checked on the same day. Cost was not measured.`,
    input: 'carousel/brief.txt',
    first: {label: 'First output: the six-slide plan', text: 'carousel/plan-v1.txt'},
    findings: [
      'The plan flagged two of its own lines before any design work: slide 2 cited no source for how screen readers use alt text, and slide 5 promised a check “in ten minutes”, which nobody had measured.',
      'Both were resolved before design (see the plan revisions): slide 2 now cites two WAI pages and slide 5 drops the time claim.',
      'Viewed at phone size, the first layout of slide 4 had its label colliding with the page marker, and the alt text lines, the point of the example, were the smallest text in the set.',
      'The source lines on slides 2, 3 and 6 were about 9 px tall at phone size, which breaks the template’s own advice to keep sources legible.'],
    revision: 'carousel/plan-revisions.txt',
    second: {label: 'Final slides', images: slideAlt.map((alt, i) => [`/assets/learn/carousel-slide-${i + 1}.webp`, 720, 900, alt]),
      compare: [['/assets/learn/carousel-v1-slide-4.webp', 720, 900, 'First layout of slide 4: the Fictional example label stretches into the 4 of 6 marker and the alt text lines are small'],
        ['/assets/learn/carousel-slide-4.webp', 720, 900, 'Revised slide 4: the label sits on its own and each alt text line is larger, under a plain-language description']],
      files: [['Slide source (HTML)', 'carousel/slides.html'], ['First layout (HTML)', 'carousel/slides-v1.html']]},
    after: 'The revised layout separates the label from the page marker, enlarges the example lines and sets every source line in bold at a larger size.',
    limits: [
      'The source lines are still small on a phone. A caption with the links is the better place for full citations.',
      'The carousel was not posted, so there are no reach or engagement figures.',
      'Laying out slides in HTML needs some CSS knowledge; a design editor gives the same control over exact text. If you use an image generator, check every word it renders.',
      'Slide alt text in the plan is a draft for review, not a finished description.']
  }
};

function figures(images, esc) {
  return `<div class="example-figures">${images.map(([src, w, h, alt]) => `<figure><img src="${src}" width="${w}" height="${h}" loading="lazy" decoding="async" alt="${esc(alt)}"><figcaption>${esc(alt)}</figcaption></figure>`).join('')}</div>`;
}
function stage(part, esc) {
  const files = part.files ? `<p class="example-files">${part.files.map(([label, file]) => `<a href="${exampleUrl(file)}">${esc(label)}</a>`).join(' &middot; ')}</p>` : '';
  const text = part.text ? `<pre class="sample example-text">${esc(exampleFile(part.text))}</pre>` : '';
  const compare = part.compare ? `<h3>Slide 4 before and after</h3>${figures(part.compare, esc)}` : '';
  return `<h3>${esc(part.label)}</h3>${text}${part.images ? figures(part.images, esc) : ''}${compare}${files}`;
}
// Findings may hold <code> markup; everything else is escaped.
function render(slug, esc) {
  const x = examples[slug];
  if (!x) return '';
  return `<section id="example" class="worked-example" aria-labelledby="example-heading"><h2 id="example-heading">Worked example: inputs, outputs and revisions</h2><p>${esc(x.summary)}</p><p class="example-run"><strong>How it was run:</strong> ${esc(x.run)}</p><h3>Input: the filled template</h3><pre class="sample example-text">${esc(exampleFile(x.input))}</pre><p class="example-files"><a href="${exampleUrl(x.input)}">Plain-text input</a></p>${stage(x.first, esc)}<h3>What the review found</h3><ul>${x.findings.map(f => `<li>${f}</li>`).join('')}</ul><h3>Revision prompt</h3><pre class="sample example-text">${esc(exampleFile(x.revision))}</pre>${stage(x.second, esc)}<p>${esc(x.after)}</p><h3>Limitations of this example</h3><ul>${x.limits.map(l => `<li>${esc(l)}</li>`).join('')}</ul></section>`;
}
// First image of each example, used as the article image in structured data and social previews.
const leadImage = slug => { const x = examples[slug]; return x && (x.first.images || x.second.images || [])[0]?.[0]; };

module.exports = {examples, render, leadImage};
