'use strict';
// The preview wall on the 75+ 3D Website Prompts page: every preview in the pack, built from
// catalog/website-previews.json (scripts/build-website-previews.py). Animated tiles carry
// data-video; assets/effects.js loads and plays them only while they are on screen.
const previews = require('../catalog/website-previews.json');

const FILTERS = [['all', 'All'], ['hero', 'Hero sections'], ['landing', 'Landing pages'], ['saas', 'SaaS'], ['more', 'More page types']];

module.exports = function websiteWall(esc) {
  const count = group => group === 'all' ? previews.length : previews.filter(p => p.group === group).length;
  const filters = FILTERS.map(([group, label], i) => `<button type="button" data-wall-filter="${group}" aria-pressed="${i === 0}">${label} <span>${count(group)}</span></button>`).join('');
  const tiles = previews.map(p => `<figure class="wall-tile" data-group="${p.group}"${p.video ? ` data-video="${p.video}"` : ''}><div class="wall-media"><img src="${p.poster}" width="${p.width}" height="${p.height}" loading="lazy" decoding="async" alt="${esc(`${p.name}: ${p.category.toLowerCase()} design preview`)}"></div><figcaption><b>${esc(p.name)}</b><span>${esc(p.category)} · Vol ${p.volume}</span></figcaption></figure>`).join('');
  return `<section class="preview-wall" aria-labelledby="wall-heading"><div class="wall-head"><span class="eyebrow">Every design in the pack</span><h2 id="wall-heading">All ${previews.length} previews on one wall.</h2><p>Explore 3D-style and animated website directions across the collection. Each preview has a matching Markdown prompt; moving previews play while they are on screen. Your result depends on your AI tool, content and revisions.</p><div class="wall-filters" role="group" aria-label="Filter previews by page type">${filters}</div></div><div class="wall-grid">${tiles}</div></section>`;
};
