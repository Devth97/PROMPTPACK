'use strict';
// Shared structured data and machine-readable summaries (JSON-LD entity graph, FAQ schema, llms.txt).
const origin = 'https://promptpack.tech';
// Date of the current catalog content; drives sitemap lastmod, dateModified and visible "Updated" labels.
const updated = '2026-10-22';
const updatedLabel = new Date(updated + 'T00:00:00Z').toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});
const orgId = origin + '/#organization';
const siteId = origin + '/#website';

const organization = {
  '@type': 'Organization', '@id': orgId, name: 'PromptPack', legalName: 'Ornalens LLP', url: origin + '/',
  logo: {'@type': 'ImageObject', url: origin + '/web-app-manifest-512x512.png', width: 512, height: 512},
  email: 'ornalens@gmail.com',
  address: {'@type': 'PostalAddress', addressCountry: 'IN'},
  contactPoint: {'@type': 'ContactPoint', contactType: 'customer support', email: 'ornalens@gmail.com', url: origin + '/contact', availableLanguage: 'en'},
  sameAs: ['https://khalandarth.gumroad.com/'],
  knowsAbout: ['AI prompt engineering', 'Website design briefs for AI coding tools', 'Subscription and recurring expense audits', 'Social media carousel planning', 'UGC video ads and AI video cuts', 'Animated character reels made with code']
};
const website = {'@type': 'WebSite', '@id': siteId, url: origin + '/', name: 'PromptPack', inLanguage: 'en', publisher: {'@id': orgId}};
const ref = {publisher: {'@id': orgId}, isPartOf: {'@id': siteId}, inLanguage: 'en', dateModified: updated};
const faqPage = (pairs, url) => ({'@type': 'FAQPage', '@id': origin + url + '#faq', mainEntity: pairs.map(([q, a]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: a}}))});
const breadcrumbs = items => ({'@type': 'BreadcrumbList', itemListElement: items.map(([name, url], i) => ({'@type': 'ListItem', position: i + 1, name, item: origin + url}))});

const productSearchTerms = {
  'carousel-studio': ['AI Carousel Prompts, Design Guide & Publishing Workflow', 'social media carousel design', 'slide storyboard', 'carousel approval and publishing workflow'],
  'ugc-ad-scripts': ['UGC Ad Scripts & AI Video Ad Prompts', 'product demo script', 'AI video ad workflow', 'UGC storyboard'],
  'motion-with-code': ['3D Character Reels & Local Engine', 'two-character reel engine', 'local voices and captions', 'script to character animation']
};

function productMetadata(p, edition) {
  const terms = productSearchTerms[p.slug];
  const descriptions = {
    'motion-with-code': `Make voiced, captioned 3D character reels with the included local engine, ${edition.prompt_count} prompts and a ${edition.pdf_pages}-page guide. Separate runtime and model setup required.`
  };
  return {
    title: `${p.name}: ${terms[0]} | PromptPack`,
    description: descriptions[p.slug] || `${terms[0]}. Get a ${edition.pdf_pages}-page PDF guide, ${edition.prompt_count} editable prompts and practical files for your own tools. Try a free sample before buying.`,
    keywords: [p.name, ...terms, 'editable AI prompts', 'digital download'].join(', ')
  };
}

const purchasePrice = p => `₹${p.price_inr.toLocaleString('en-IN')} (UPI, Indian cards, netbanking or wallets) or US$${p.price} (international cards)`;

// Visible FAQ from current catalog data, shared with the structured answers.
function productFaq(p, edition, refs, liveProducts) {
  return [
    [`What is ${p.name}?`, `${p.name} is a digital toolkit with a ${edition.pdf_pages}-page illustrated PDF guide and ${edition.prompt_count} editable prompts. ${edition.outcome}`],
    [`Who is ${p.name} for?`, p.audience],
    [`What do I need to use ${p.name}?`, `${p.needs} Tool subscriptions, AI credits and service accounts are not included.`],
    [`What does ${p.name} not include?`, edition.limits],
    [`Can I buy ${p.name} now?`, `Yes. The complete ${p.name} download costs ${purchasePrice(p)}, paid once through Razorpay. Download the ZIP after payment verification. You can try the free sample before buying.`],
    ['Which public tools does the workflow reference?', `${refs.map(r => `${r.repository} (${r.license_name || r.license})`).join(', ')}. Check the included-file list above for this pack's engine or starter code. Third-party runtimes, models, service access and accounts are separate. PromptPack is not affiliated with these tool authors.`]
  ];
}

// llms.txt (index) and llms-full.txt (full plain-text catalog) for AI assistants and agents.
function llmsFiles({products, editions, sources, liveProducts, posts}) {
  const edition = slug => editions.find(e => e.slug === slug);
  const header = `# PromptPack\n\n> PromptPack (promptpack.tech) is a digital shop run by Ornalens LLP, India. It sells editable AI prompt packs and illustrated PDF field guides for websites, personal finance, social media and video. ${liveProducts.length+products.length} products have purchase routes, including ${products.length} complete guide editions with free sample prompts.\n\nUpdated: ${updated}. All products are digital downloads used with the buyer's own AI tools. They do not include AI credits, software subscriptions, recorded courses or publishing services.\n`;
  const live = `## Available now\n\n${liveProducts.map(l => `- [${l.name}](${origin}${l.href}): ${l.summary} ${l.includes}. ${l.price}, ${l.priceNote}.`).join('\n')}\n`;
  const previews = `## Complete digital guide editions\n\n${products.map(p => { const e = edition(p.slug); return `- [${p.name}](${origin}/products/${p.slug}/): ${e.subtitle}. ${e.pdf_pages}-page guide, ${e.prompt_count} prompts, starter files. Available for ${purchasePrice(p)}, paid once through Razorpay. Free sample prompt on the page.`; }).join('\n')}\n`;
  const guides = `## Guides\n\n${posts.map(([title, url]) => `- [${title}](${origin}${url})`).join('\n')}\n`;
  const policies = `## Policies and support\n\n- [Contact and about](${origin}/contact): support, billing and refund questions (ornalens@gmail.com)\n- [Terms](${origin}/terms)\n- [Privacy](${origin}/privacy)\n- [Refund policy](${origin}/refund)\n\n## Optional\n\n- [Full catalog text](${origin}/llms-full.txt): every product's contents, requirements, workshop steps and sample prompt in one file\n- [Sitemap](${origin}/sitemap.xml)\n`;
  const index = [header, live, previews, guides, policies].join('\n');
  const full = [header, live, '## Digital guide details\n', ...products.map(p => {
    const e = edition(p.slug);
    const refs = e.sources.map(id => sources.find(s => s.id === id));
    return `### ${p.name}\n\nURL: ${origin}/products/${p.slug}/\nCategory: ${p.category}\nStatus: available through Razorpay checkout for ${purchasePrice(p)}, paid once\nFormat: ${e.pdf_pages}-page illustrated PDF guide, ${e.prompt_count} editable prompts, worked example, starter files, worksheets\n\n${e.subtitle}. ${e.outcome}\n\nFor: ${p.audience}\nRequirements: ${p.needs}\nScope: ${e.limits}\n\nWorkshop steps:\n${e.lessons.map((l, i) => `${i + 1}. ${l}`).join('\n')}\n\nFirst session:\n${e.first_run.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nPublic tools referenced: ${refs.map(r => `${r.repository} (${r.license_name || r.license}) ${r.url}`).join('; ')}\n\nSample prompt:\n\n${p.sample}\n`;
  })].join('\n');
  return {index, full};
}

module.exports = {origin, updated, updatedLabel, organization, website, ref, faqPage, breadcrumbs, productMetadata, productFaq, llmsFiles};
