'use strict';
// Legacy hand-authored pages share the same verified publisher identity as generated pages.
const fs = require('node:fs');
const path = require('node:path');
const seo = require('./seo');
module.exports = ({write}) => {
  const root = path.join(__dirname, '..');
  for (const [file, url, type] of [
    ['blog/index.html','/blog/','CollectionPage'],
    ['finance/index.html','/finance','WebPage'],
    ['contact/index.html','/contact','AboutPage'],
    ['privacy/index.html','/privacy','WebPage'],
    ['terms/index.html','/terms','WebPage'],
    ['refund/index.html','/refund','WebPage']
  ]) {
    let html = fs.readFileSync(path.join(root, file), 'utf8');
    const title = html.match(/<title>([^<]+)<\/title>/)[1].replace(/&amp;/g, '&');
    const graph = {'@context':'https://schema.org','@graph':[seo.organization,seo.website,{'@type':type,'@id':seo.origin+url+'#page',name:title,url:seo.origin+url,isPartOf:{'@id':seo.origin+'/#website'},about:{'@id':seo.origin+'/#organization'},inLanguage:'en'}]};
    const script = `<script id="pp-discovery" type="application/ld+json">${JSON.stringify(graph).replace(/</g,'\\u003c')}</script>`;
    html = html.includes('id="pp-discovery"') ? html.replace(/<script id="pp-discovery"[\s\S]*?<\/script>/, script) : html.replace('</head>',script+'</head>');
    write(file, html);
  }
};
