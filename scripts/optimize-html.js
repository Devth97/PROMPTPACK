'use strict';
// Final pass over every public HTML page, generated or hand-authored:
// - the self-hosted Figtree font replaces the Google Fonts stylesheet chain (preloaded once);
// - first-party CSS/JS URLs carry ?v=<content hash>, which vercel.json caches for a year;
//   unversioned URLs keep the default revalidation, so a stale file is never pinned;
// - product covers get a 720 px candidate (scripts/build-responsive-images.js) for small screens.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const DIRS = ['', 'products', 'checkout', 'learn', 'blog', 'contact', 'finance', 'privacy', 'terms', 'refund'];
const FONT = '/assets/fonts/figtree-v9-latin.woff2';

function pages() {
  const out = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(path.join(root, dir), {withFileTypes: true})) {
      const rel = path.posix.join(dir, entry.name);
      if (entry.isDirectory()) { if (dir && rel !== 'learn/examples') walk(rel); }
      else if (entry.name.endsWith('.html') && !entry.name.startsWith('google')) out.push(rel);
    }
  };
  for (const dir of DIRS) if (fs.existsSync(path.join(root, dir))) dir ? walk(dir) : fs.readdirSync(root).filter(f => f === 'index.html').forEach(f => out.push(f));
  return out;
}

const hashes = new Map();
function version(url) {
  if (!hashes.has(url)) {
    const file = path.join(root, url);
    hashes.set(url, fs.existsSync(file) ? crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 10) : null);
  }
  return hashes.get(url);
}

function optimize(html) {
  html = html.replace(/\s*<link rel="preconnect" href="https:\/\/fonts\.(?:googleapis|gstatic)\.com"(?: crossorigin)?>/g, '')
    .replace(/\s*<link (?:href="https:\/\/fonts\.googleapis\.com\/css2\?family=Figtree[^"]*" rel="stylesheet"|rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=Figtree[^"]*")>/g, '');
  if (!html.includes(`href="${FONT}"`)) html = html.replace(/(<link rel="stylesheet" href="\/assets\/theme\.css)/, `<link rel="preload" href="${FONT}" as="font" type="font/woff2" crossorigin>$1`);
  html = html.replace(/((?:href|src)=")(\/assets\/[^"?#]+\.(?:css|js))(?:\?v=[0-9a-f]+)?"/g, (match, attr, url) => {
    const v = version(url);
    return v ? `${attr}${url}?v=${v}"` : match;
  });
  html = html.replace(/<img src="(\/assets\/product-covers\/([a-z0-9-]+))\.webp" width="(\d+)" height="(\d+)"(?! srcset)/g, (match, base, slug, width, height) => {
    if (!fs.existsSync(path.join(root, base + '-720.webp'))) return match;
    const sizes = Number(width) <= 300 ? '300px' : '(min-width: 1100px) 560px, (min-width: 700px) 50vw, 92vw';
    return `<img src="${base}.webp" width="${width}" height="${height}" srcset="${base}-720.webp 720w, ${base}.webp 1200w" sizes="${sizes}"`;
  });
  // Video posters: a WebP copy is used when scripts/build-responsive-images.js made one.
  html = html.replace(/poster="(\/assets\/[^"]+)\.jpg"/g, (match, base) => fs.existsSync(path.join(root, base + '.webp')) ? `poster="${base}.webp"` : match);
  return html;
}

module.exports = () => {
  let changed = 0;
  for (const file of pages()) {
    const full = path.join(root, file);
    const before = fs.readFileSync(full, 'utf8');
    const after = optimize(before);
    if (after !== before) { fs.writeFileSync(full, after); changed++; }
  }
  return changed;
};
module.exports.optimize = optimize;
module.exports.pages = pages;
if (require.main === module) console.log(`Optimized ${module.exports()} pages.`);
