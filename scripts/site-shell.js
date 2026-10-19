'use strict';
const sections = [
  {id:'finance', name:'Finance', color:'mint', description:'A clearer picture of your recurring spending.'},
  {id:'websites', name:'Websites', color:'blue', description:'Give your next site a better starting point.'},
  {id:'social-media', name:'Social Media', color:'pink', description:'From the first hook to a repeatable publishing workflow.'},
  {id:'video', name:'Video', color:'coral', description:'Plan the shots. Write the story. Direct the result.'},
  {id:'design', name:'Design', color:'yellow', description:'Small pixels. A consistent visual identity.'}
];
const sectionFor = p => p.category === 'Websites' ? sections[1] : ['Social content','Automation'].includes(p.category) ? sections[2] : p.category === 'Video' ? sections[3] : sections[4];
const nav = `<header class="pp-header"><div class="pp-nav"><a class="pp-brand" href="/" aria-label="PromptPack home">PROMPTPACK<span aria-hidden="true">↗</span></a><nav class="pp-categories" aria-label="Product categories">${sections.map(s=>`<a href="/#${s.id}">${s.name}</a>`).join('')}</nav><a class="pp-browse" href="/#catalog">Shop all kits <span aria-hidden="true">↓</span></a></div></header>`;
const footer = `<footer class="pp-footer"><div class="pp-footer-inner"><div><a class="pp-brand" href="/">PROMPTPACK<span aria-hidden="true">↗</span></a><p>Good ideas deserve a better starting point.<br>Digital guides, prompt packs &amp; creative toolkits.</p></div><nav aria-label="Footer"><a href="/#catalog">All products</a><a href="/blog/">Guides</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/refund">Refunds</a></nav><div class="pp-footer-bottom"><span>© 2026 PromptPack · Ornalens LLP</span><span>Made for the tools you already use.</span></div></div></footer>`;
module.exports = {sections, sectionFor, nav, footer};
