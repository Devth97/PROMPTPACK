'use strict';
// Read-only audit of indexable static pages. No third-party service or credentials.
const fs = require('node:fs');
const path = require('node:path');
function audit(root = path.join(__dirname, '..')) {
  const errors = [], pages = [];
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const titles = new Set();
  if (urls.length !== new Set(urls).size) errors.push('Duplicate sitemap URLs');
  for (const url of urls) {
    const u = new URL(url);
    if (u.origin !== 'https://promptpack.tech' || u.search || u.hash || /\/(api|checkout|private)\//.test(u.pathname)) errors.push('Noncanonical sitemap entry: ' + url);
    let file = path.join(root, u.pathname);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {errors.push('Missing sitemap page: ' + url); continue;}
    const html = fs.readFileSync(file, 'utf8');
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    if (!title || titles.has(title)) errors.push('Missing/duplicate title: ' + url);
    titles.add(title);
    const canonicals = [...html.matchAll(/rel="canonical" href="([^"]+)"/g)];
    if (canonicals.length !== 1 || canonicals[0][1] !== url) errors.push('Canonical mismatch: ' + url);
    if ((html.match(/<h1\b/g) || []).length !== 1) errors.push('Expected one H1: ' + url);
    if (!/name="description" content="[^"]+"/.test(html)) errors.push('Missing description: ' + url);
    if (/name="robots" content="[^"]*noindex/.test(html) || /http-equiv="refresh"/i.test(html)) errors.push('Nonindexable sitemap page: ' + url);
    let schemas = 0;
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {if (!JSON.parse(m[1])['@context']) throw Error('Missing context'); schemas++;}
      catch (_) {errors.push('Invalid JSON-LD: ' + url);}
    }
    if (!schemas && (u.pathname === '/' || /^\/(products|learn)\//.test(u.pathname))) errors.push('Missing static schema: ' + url);
    pages.push({url, title, schemas});
  }
  return {pages, errors};
}
if (require.main === module) {
  const result = audit();
  console.log(JSON.stringify({pages: result.pages.length, errors: result.errors}, null, 2));
  if (result.errors.length) process.exitCode = 1;
}
module.exports = {audit};
