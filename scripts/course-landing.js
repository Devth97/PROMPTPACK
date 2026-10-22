'use strict';
// Course-style landing for guide packs (outcome hero, result preview, numbered modules). It replaces the generic
// product hero; the standard detail sections still follow. Modules map to the pack's real prompt numbers and files.
const COURSES = {
  'ugc-ad-scripts': {
    eyebrow: 'Video · self-paced kit · available now',
    headline: 'Plan an honest product ad. <mark>Then direct it with AI.</mark>',
    intro: 'Take one real product from a brief and an evidence ledger to six scene boards, a recordable script and AI video cuts. Every claim stays on real footage.',
    boards: ['Situation', 'Question', 'Demonstration', 'Physical detail', 'Qualify', 'Next action'],
    boardsNote: 'The six included example boards: a fictional notebook. Concept art, not a performance result.',
    modules: [
      ['The demonstration brief', 'Pick one product task, set stop conditions and log only the facts you can show or prove.', 'Master brief + evidence ledger', 'Prompts 01-02'],
      ['A style lock from references', 'Study three references for their decisions, then turn them into an original visual system.', 'Style lock you reuse in every board', 'Prompts 03-04'],
      ['Hook and six scene boards', 'Draft the demonstration, choose a hook the body pays off, then brief six scenes and one prototype image.', 'Six boards + script draft', 'Prompts 05-08'],
      ['Presenter, rehearsal and review', 'Hand off to a presenter with rights in place, rehearse with captions and pass a hard-gate review.', 'Recordable script + rights checklist', 'Prompts 09-11'],
      ['Export and one clean test', 'Write the caption and alternatives, package the export and plan a one-variable experiment.', 'Export package + test plan', 'Prompts 12-14'],
      ['Cinematic AI cuts', 'Make product and presenter reference sheets, a blocking map and a style header, then write each cut for Seedance-style generators.', 'Shot list routed GENERATE or FILM + cut prompts', 'Prompts 15-22 · 9-page module'],
      ['UGC AI Ad Studio skill', 'Install it in Claude to run a reference-led ad through seven stages, from decoding a reference ad to sign-off.', 'Checked timed prompt, graded edit, sign-off record', 'Skill + checker + film-finish script', true]
    ]
  }
};

module.exports = Object.assign(function courseLanding(p, edition, esc, checkout, price) {
  const c = COURSES[p.slug];
  const boards = edition.gallery.map((slide, i) => `<figure><img src="${slide.src}" width="${slide.width || 720}" height="${slide.height || 1280}" ${i < 3 ? 'fetchpriority="high"' : 'loading="lazy"'} alt="${esc(slide.alt)}"><figcaption>${String(i + 1).padStart(2, '0')} ${esc(c.boards[i])}</figcaption></figure>`).join('');
  const modules = c.modules.map(([title, body, out, uses, isNew], i) =>
    `<li class="course-module${isNew ? ' new' : ''}"><span class="num">${String(i + 1).padStart(2, '0')}</span><h3>${esc(title)}</h3><p>${esc(body)}</p><span class="uses">${esc(uses)}</span><p class="out"><b>You'll have</b>${esc(out)}</p></li>`).join('');
  return `<div class="breadcrumb"><a href="/#catalog">All products</a> / ${esc(p.category)}</div>
<header class="course-hero"><div><span class="eyebrow">${esc(c.eyebrow)}</span><h1>${c.headline}</h1><p class="intro">${esc(c.intro)}</p>
<ul class="course-stats"><li><b>${c.modules.length}</b> modules</li><li><b>${edition.pdf_pages}</b>-page guide</li><li><b>${edition.prompt_count}</b> prompts</li><li>Worksheets + examples</li></ul>
<div class="course-cta"><a class="button buy-cta" href="${checkout}"><span class="buy-label">Get the complete kit <span aria-hidden="true">↗</span></span><span class="buy-price">${price} · one time · instant download</span></a><a class="secondary-action" href="#modules">See the ${c.modules.length} modules ↓</a><p class="course-note">Self-paced. Pay once with UPI, Indian cards, netbanking or an international card, then download the full ZIP.</p></div></div>
<div class="course-board" aria-label="Result preview: the six example boards">${boards}<p class="course-caption">${esc(c.boardsNote)}</p></div></header>
<section class="course-section" id="modules" aria-labelledby="modules-heading"><span class="eyebrow">What you'll make, module by module</span><h2 id="modules-heading">${c.modules.length} modules. One ad you can stand behind.</h2><p>Work through them in order, or jump to the module you need. Each one ends with a file you keep.</p><ol class="course-modules">${modules}</ol></section>`;
}, {COURSES});
