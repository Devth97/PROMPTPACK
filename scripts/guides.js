'use strict';
// Use live catalog facts in buyer guides to prevent price and inclusion drift.
const fs = require('node:fs');
const path = require('node:path');
const seo = require('./seo');
const guides = [
  {slug:'carousel-design-vs-publishing-workflow', title:'Carousel Design vs Publishing Workflow: Where to Start', description:'Design six connected slides first, or fix approvals and publishing first? See both routes in Carousel Studio, what each needs and the order that works.', products:['carousel-studio']},
  {slug:'prompt-pack-vs-ai-video-generator', title:'Prompt Pack vs AI Video Generator: What Do You Buy?', description:'Compare editable planning kits, local character engines and hosted video generators. Understand what each supplies and which tools you still need.', products:['ugc-ad-scripts','motion-with-code']},
  {slug:'make-animated-character-reels-with-code', title:'How to Make Animated Character Reels With Code', description:'Write an original two-character story, set up a local reel engine, and review voices, captions and framing before rendering. See requirements and limits.', products:['motion-with-code']}
].map(g => ({...g, url:`/blog/${g.slug}.html`}));

function build({page, write, products, editions, esc}) {
  const product = slug => products.find(p => p.slug === slug);
  const edition = slug => editions.find(e => e.slug === slug);
  const link = slug => `<a href="/products/${slug}/">${esc(product(slug).name)}</a>`;
  const facts = slug => `${edition(slug).pdf_pages}-page guide and ${edition(slug).prompt_count} editable prompts`;
  const price = slug => `US$${product(slug).price} / ₹${product(slug).price_inr.toLocaleString('en-IN')}`;
  const contents = slug => `<ul>${edition(slug).includes.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
  const scope = slug => `<p>${esc(edition(slug).limits)}</p>`;
  const bodies = {
    'carousel-design-vs-publishing-workflow': `
<p class="intro">Most carousel problems are one of two kinds: the slides do not look like one connected piece, or finished slides get stuck between draft, approval and posting. ${link('carousel-studio')} covers both, as two routes in one download. Start with the route that matches your problem.</p>
<h2>What is the difference between the two routes?</h2>
<div class="table-wrap" role="region" aria-label="Carousel route comparison" tabindex="0"><table><caption>Designing slides and managing publication</caption><thead><tr><th scope="col">Decision</th><th scope="col">Design route</th><th scope="col">Workflow route (workflow/ folder)</th></tr></thead><tbody>
<tr><th scope="row">Main task</th><td>Design a reference-led six-slide carousel</td><td>Organize files, approvals and a publishing handoff</td></tr>
<tr><th scope="row">You supply</th><td>A text assistant and an image tool or design editor</td><td>Content files, Node.js or Python for the local tools and separate account/API setup</td></tr>
<tr><th scope="row">Publishing</th><td>No account connection or scheduling</td><td>Local Instagram API starter with mock tests; no hosted service or connected account</td></tr></tbody></table></div>
<p>Both routes come in one download: a ${facts('carousel-studio')} in total, for ${price('carousel-studio')} once.</p>
<h2>What does the download include?</h2>${contents('carousel-studio')}
<h2>Which route should you start with?</h2>
<p><strong>Start with design if your slides do not look connected.</strong> Define one audience, one message and shared typography and image direction. Finish a coherent carousel before adding scheduling.</p>
<p><strong>Start with the workflow if content is ready but approvals are disorganized.</strong> Give each post an owner, revision and daily folder. Approve the exact files before connecting a publishing route. The workflow does not create your illustrations.</p>
<h2>How do the two routes work together?</h2>
<p>For an illustrative desk-lamp checklist, use the design route to assign one useful job to each of six slides and keep the lighting, palette and headline hierarchy consistent. Then, in the workflow route, record the revision, assemble final images and caption, obtain approval and prepare the publishing package. This is a suggested exercise, not a completed customer campaign.</p>
<h2>Does the kit publish automatically to every platform?</h2>${scope('carousel-studio')}
<h2>What should you inspect before buying?</h2>
<p>Try the free sample and inspect the worked-example slides on the ${link('carousel-studio')} page. Tool accounts, image credits and any hosting costs are separate.</p>`,
    'prompt-pack-vs-ai-video-generator': `
<p class="intro">A prompt pack supplies instructions, examples and planning materials for your own tools. A hosted AI video generator supplies access to a media-generation service. A local character engine renders a reusable scene on your computer after setup.</p>
<h2>How do the three routes compare?</h2>
<div class="table-wrap" role="region" aria-label="Video workflow comparison" tabindex="0"><table><caption>Choose the production step you need</caption><thead><tr><th scope="col">Route</th><th scope="col">What it supplies</th><th scope="col">What you still need</th></tr></thead><tbody>
<tr><th scope="row">Planning kit</th><td>Briefs, examples, worksheets and review criteria</td><td>Suitable tools, permitted media and production work</td></tr>
<tr><th scope="row">Hosted generator</th><td>Media generation within a provider's controls</td><td>Account, plan or credits, rights review and editing</td></tr>
<tr><th scope="row">Local character engine</th><td>A reusable scene and rendering workflow</td><td>Compatible computer, dependencies, setup and render time</td></tr></tbody></table></div>
<p>Hosted services differ. Check the provider's current documentation and terms for its models, resolution, costs and permitted uses. A planning kit does not provide generation access; a generation account does not decide what your story should communicate.</p>
<h2>When is a directing kit useful?</h2>
<p>Use one when you can generate shots but struggle to keep their purpose or appearance coherent, or when an ad has to show a real product honestly. Define subject, lighting, camera, action and continuity before spending on a take, and keep every product claim on real footage. ${link('ugc-ad-scripts')} includes a ${facts('ugc-ad-scripts')}, a cinematic module for AI video cuts and the UGC AI Ad Studio skill, which checks a timed multi-shot prompt before you render. It costs ${price('ugc-ad-scripts')} once.</p>${scope('ugc-ad-scripts')}
<h2>When is a local character engine useful?</h2>
<p>Use a local engine when recurring characters and a reusable scene are central to the series. ${link('motion-with-code')} includes a ${facts('motion-with-code')}. ${esc(edition('motion-with-code').outcome)} It costs ${price('motion-with-code')} once.</p>${scope('motion-with-code')}
<h2>What should you check before paying?</h2>
<p>Identify the missing artifact: a clearer brief, an honest product-ad plan, generation access or a repeatable scene. Inspect the sample and requirements for that artifact. Budget separately for services, production time and editing. The routes can work together; distribution and audience growth still require their own work.</p>`,
    'make-animated-character-reels-with-code': `
<p class="intro">Reuse a character scene, write a short dialogue, generate or record voices, align captions and render a vertical video. A local code workflow lets you reuse the scene across episodes with setup and render time on your own computer.</p>
<p>${link('motion-with-code')} includes a ${facts('motion-with-code')}, a character engine, ten original scripts and four reusable formats. It costs ${price('motion-with-code')} once.</p>
<h2>What tools do you need?</h2><p>${esc(product('motion-with-code').needs)}</p><p>The core uses free local tools after downloads. Optional premium voices can add service costs. Your computer, storage, electricity and production time are separate.</p>
<h2>1. Define an original recurring pair</h2>
<p>Give the characters complementary jobs. One can notice a small business problem while the other tests a practical response. Write down their priorities, limits and relationship before writing jokes. A new mascot may need coding assistance; work in a copy of the supplied scene.</p>
<h2>2. Write one small story</h2>
<p>Open with a concrete problem, add a response that changes the audience's understanding, then an escalation and a bounded fix. End with a callback or one relevant next action. For an illustrative premise, a shop owner discovers yesterday's offer is still on a sale banner, and the second character finds the expired approval note. This is a story seed, not a real customer incident.</p>
<h2>3. Test a short section</h2>
<p>Follow the included setup guide, install the documented runtimes, models and browser, and validate the script. Render a short working example first. Check pronunciation, word timing, captions, character framing and sound balance before committing to a full episode.</p>
<h2>4. Review the actual movie</h2>
<p>Watch at phone size with sound on and off. Read every caption. Check that close-ups preserve the important action and the final instruction stays visible long enough to understand. A script validator checks format; inspect the rendered movie to judge timing and framing.</p>
<h2>Are ten finished videos included?</h2>${scope('motion-with-code')}
<h2>Is this workflow right for you?</h2>
<p>Choose this route if you want a recurring two-character series and are comfortable installing local tools. Inspect the sample, file list and rendered demonstrations on the ${link('motion-with-code')} page. For a broader comparison, read <a href="/blog/prompt-pack-vs-ai-video-generator.html">prompt pack vs AI video generator</a>.</p>`
  };
  for (const g of guides) {
    const image = edition(g.products[0]).example;
    const body = `<article class="buyer-guide"><div class="breadcrumb"><a href="/blog/">All guides</a></div><header class="hero"><span class="eyebrow">Practical buying guide</span><h1>${esc(g.title)}</h1><p>By PromptPack · Product facts reviewed ${seo.updatedLabel}. Prices and inclusions reflect the current catalog.</p></header>${bodies[g.slug]}<p class="note">Written by the seller of these kits. Compare actual samples, included files and requirements before choosing.</p></article>`;
    const schema = {'@context':'https://schema.org','@graph':[seo.organization,seo.website,{'@type':'BlogPosting','@id':seo.origin+g.url+'#article',headline:g.title,description:g.description,url:seo.origin+g.url,image:seo.origin+image,author:{'@id':seo.organization['@id']},...seo.ref,mainEntityOfPage:seo.origin+g.url},seo.breadcrumbs([['Home','/'],['Guides','/blog/'],[g.title,g.url]])]};
    write(g.url.slice(1),page(g.title+' | PromptPack',g.description,g.url,body,schema,image).replace('property="og:type" content="website"','property="og:type" content="article"'));
  }
  const root = path.join(__dirname,'..');
  let index = fs.readFileSync(path.join(root,'blog/index.html'),'utf8');
  const cards = guides.map(g=>`<a class="post-card" href="${g.url}"><div class="eyebrow">Practical guide</div><h2>${esc(g.title)}</h2><p>${esc(g.description)}</p></a>`).join('\n');
  const block = `<!-- buyer-guides:start -->\n${cards}\n<!-- buyer-guides:end -->`;
  index = index.includes('<!-- buyer-guides:start -->') ? index.replace(/<!-- buyer-guides:start -->[\s\S]*?<!-- buyer-guides:end -->/,block) : index.replace('<div class="post-list">',`<div class="post-list">\n${block}`);
  write('blog/index.html',index);
  let sitemap = fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
  for (const g of guides) {
    const url = seo.origin+g.url;
    const entry = `  <url><loc>${url}</loc><lastmod>${seo.updated}</lastmod></url>`;
    const existing = new RegExp('\\s*<url>\\s*<loc>'+url.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'</loc>[\\s\\S]*?</url>');
    sitemap = sitemap.replace(existing,'').replace('</urlset>',entry+'\n</urlset>');
  }
  sitemap = sitemap.replace(/(<loc>https:\/\/promptpack\.tech\/blog\/<\/loc>\s*<lastmod>)[^<]*/,`$1${seo.updated}`);
  write('sitemap.xml',sitemap);
}
module.exports = {guides,build};
