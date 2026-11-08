'use strict';
const planningPrices = require('./planning-prices');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy={
  'wedding-decision-kit':{
    headline:'Compare wedding quotes and see what’s left to pay.',
    intro:'An Excel workbook and fillable PDF for couples comparing vendors. Add fees and extras to each quote, then track deposits, refunds and remaining balances as you book.',
    buyLabel:'Buy the Wedding Kit',
    sampleTitle:'See the wedding budget and vendor balances at a glance',
    exampleTitle:'Compare the full vendor quote',
    promise:'A clearer plan for your yes.',
    story:'One quote includes the chairs. Another adds service fees. Your deposit is paid, but the balance is somewhere in an email. Bring those details into one place, before you make the next decision.',
    outcomes:['Compare vendors on the full quote, including your fee and tax assumptions.','See deposits, refunds and remaining balances together.','Keep guest replies, task owners and handover notes close at hand.'],
    coverAlt:'Illustrated wedding planner, quote sheets and botanical details in forest green and coral.',
    detailAlt:'Illustration of three vendor quote cards becoming one organized decision folder.',
    steps:[['Compare','Enter the quotes and the extras that matter to your plans.'],['Choose','Record your selections, agreed totals and payments.'],['Keep it moving','Track guests, tasks and the details someone else needs to know.']],
    workflowAlt:'Paper quote slips, a checkmark and a payment ledger.',
    closing:'Your next decision deserves the full picture.',
    faq:[['Will this plan the wedding for me?','It gives you a practical structure for comparing, tracking and organizing. You choose the vendors, check their terms and keep your records up to date.'],['Can I use my own currency?','Yes. Use one currency consistently in each workbook. This kit does not convert exchange rates. The INR and USD checkout options are separate fixed regional prices.']]
  },
  'two-homes-organizer':{
    headline:'Track handovers and shared expenses across two homes.',
    intro:'An Excel organizer and fillable PDFs for parents working with an existing arrangement. Keep planned and actual handovers separate, see what’s still owed, and find dated notes and contacts in one file.',
    buyLabel:'Buy the Two Homes Kit',
    sampleTitle:'See handovers and shared expenses at a glance',
    exampleTitle:'See what’s still owed after a partial repayment',
    promise:'A little more order in the everyday.',
    story:'Use the arrangement you already have, and keep your own practical records together. Planned handovers stay separate from what happened. Expenses show the split. Notes have a date and a source.',
    outcomes:['Keep planned and actual handovers clearly separate.','Track shared expense allocations, repayments and refunds.','Find factual notes, source references and important contacts together.'],
    coverAlt:'Two blue paper houses connected by a path, with neatly arranged organization cards.',
    detailAlt:'Illustrated calendar, record folder and expense cards joined by a blue paper path.',
    steps:[['Set it up','Start from your existing arrangement and essential contacts.'],['Keep a record','Enter planned and actual handovers, expenses and factual notes.'],['Find it later','Review your entries and use the fillable forms when a written record helps.']],
    workflowAlt:'Paper calendar, handover log and expense receipts.',
    closing:'Keep the practical things in one place.',
    faq:[['Is this a shared app or messaging service?','No. These are personal files you manage yourself. There is no syncing, messaging, automated reminder or external account.'],['Is this legal advice or a court submission kit?','No. It is a personal organizer using an existing arrangement. It does not calculate legal entitlement or overnight allocations, or promise any legal outcome.']]
  }
};
function render(p){
 const {inr,usd}=planningPrices(p.slug);
 const c=copy[p.slug],base=`/assets/planning/${p.slug}`,buy=(label=esc(c.buyLabel))=>`<a class="planning-buy button" href="/checkout/${p.slug}/" hidden>${label} <span aria-hidden="true">↗</span></a>`,status='<p class="readiness" role="status" aria-live="polite">Checking download availability…</p>';
 return `<div class="planning-wrap planning-product ${p.slug==='wedding-decision-kit'?'wedding-theme':'homes-theme'}"><p class="eyebrow breadcrumb"><a href="/#catalog">All kits</a> / ${esc(p.label)}</p><section class="planning-hero"><div class="planning-hero-copy"><span class="tag">${esc(p.name)} · Excel + PDF</span><h1>${esc(c.headline)}</h1><p class="lede">${esc(c.intro)}</p><div class="planning-price">${require('./price-display')(usd,inr)}</div><p class="price-note">One-time payment · personal-use licence</p>
      <div class="planning-actions">${buy()}<a href="${base}-start.png" class="text-link" target="_blank" rel="noopener">Open the sample ↗</a></div>
      <p class="offer-terms"><strong>Requires desktop Excel.</strong> Download the ZIP after payment confirmation. <a href="/refund">Refund policy</a> · <a href="/contact">Support</a></p>
      ${status}
    </div>
    <figure class="planning-sample">
      <figcaption><span>Actual Excel workbook · fictional example</span><strong>${esc(c.sampleTitle)}</strong></figcaption>
      <a href="${base}-start.png" target="_blank" rel="noopener"><img src="${base}-start.png" width="1389" height="976" fetchpriority="high" alt="${esc(p.name)} summary sheet with fictional figures. Open full-size sample."></a>
      <a class="sample-zoom" href="${base}-start.png" target="_blank" rel="noopener">View at full size ↗</a>
    </figure>
  </section>
  <section id="sample-detail" class="planning-example" aria-labelledby="sample-heading">
    <div><p class="eyebrow">Worked example · fictional data</p><h2 id="sample-heading">${esc(c.exampleTitle)}</h2><p>${esc(p.example)}</p><a class="text-link" href="${base}-${p.preview}.png" target="_blank" rel="noopener">Open the ${esc(p.preview)} worksheet ↗</a></div>
    <a class="example-sheet" href="${base}-${p.preview}.png" target="_blank" rel="noopener"><img loading="lazy" src="${base}-${p.preview}.png" width="1389" height="976" alt="Full ${esc(p.preview)} worksheet preview with fictional figures."></a>
  </section>
  <section class="planning-story"><div class="story-art"><img loading="lazy" src="${base}-detail.webp" width="1200" height="800" alt="${c.detailAlt}"><p class="caption">Concept illustration · workbook samples above</p></div><div><p class="eyebrow">Made for the details that add up</p><h2>${esc(c.promise)}</h2><p>${esc(c.story)}</p><ul class="planning-outcomes">${c.outcomes.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div></section><section id="inside" class="inside"><div class="planning-section-heading"><div><p class="eyebrow">The complete kit</p><h2>Useful files.<br>Nothing left to guess.</h2></div><p>Start from a blank file or follow the fictional example.<br>The guide walks you through the details.</p></div><div class="contents">${p.contents.map(([a,b],i)=>`<article><span class="step">0${i+1}</span><h3>${esc(a)}</h3><p>${esc(b)}</p></article>`).join('')}</div></section><section class="planning-steps" aria-labelledby="workflow-heading">
    <div class="workflow-copy">
      <p class="eyebrow">From download to your own plan</p>
      <h2 id="workflow-heading">Get started in three steps</h2>
      <ol class="workflow-list">
        ${c.steps.map(([title,desc],i)=>`<li><span aria-hidden="true">0${i+1}</span><div><h3>${esc(title)}</h3><p>${esc(desc)}</p></div></li>`).join('')}
      </ol>
    </div>
    <img class="workflow-art" src="${base}-workflow.webp" loading="lazy" width="1050" height="700" alt="${esc(c.workflowAlt)}">
  </section>
  <section class="requirements"><div><p class="eyebrow">Choose with confidence</p><h2>Is this your kind of kit?</h2><p>${esc(p.fit)}</p><p class="planning-limit">${esc(p.limits)}</p></div><div class="requirements-panel"><h3>A quick check before you buy</h3><ul><li>A recent desktop Microsoft Excel version supporting .xlsx.</li><li>A PDF reader supporting fillable fields; browser support varies.</li><li>No macros or AI subscription required.</li></ul><p>Native Excel and Google Sheets import have not yet been verified. Calculated and inspected with the artifact spreadsheet engine.</p><p>Digital download only. Keep secure, dated backups. No external syncing, reminders or automatic payments.</p><a href="/refund">Read the refund policy ↗</a> · <a href="/contact">Contact support ↗</a></div></section><section class="planning-faq"><h2>A few useful answers.</h2>${[...c.faq,['What exactly do I receive?','Blank and fictional example Excel workbooks, a PDF guide with fillable worksheets, a README and a personal-use licence. '+(p.slug==='two-homes-organizer'?'The PDF guide is included in A4 and US Letter.':'The PDF guide has five pages and a fillable vendor worksheet.')],['How do I get the files?','After payment confirmation, use the protected download page to get your ZIP. This is a digital kit; no physical planner or stationery is shipped.']].map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section><section class="final-offer"><div><p class="eyebrow">${esc(p.name)}</p><h2>${esc(c.closing)}</h2><p>Blank workbook. Worked example. Fillable PDF.<br>Everything together in one personal-use digital kit.</p></div><div><p class="final-price">${require('./price-display')(usd,inr)}</p><p class="price-note">One payment. No PromptPack subscription.</p>${buy()}${status}<p class="offer-help"><a href="/contact">Have a question before buying? Ask us →</a></p></div></section></div>`;
}
module.exports={render,copy};
