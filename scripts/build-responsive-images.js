'use strict';
// Smaller image candidates for phones, made with ffmpeg (libwebp). Run after a cover or poster changes:
//   node scripts/build-responsive-images.js
// Product covers get <slug>-720.webp (used through srcset); JPEG video posters get a WebP copy.
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.join(__dirname, '..');
const covers = path.join(root, 'assets/product-covers');
const posters = ['assets/brand/juno-pixel-ad-poster.jpg', 'assets/brand/store-tour-v3-poster.jpg', 'assets/product-previews/carousel-promo-wide-poster.jpg', 'assets/product-previews/motion-with-code-reel-poster.jpg'];
const ffmpeg = (input, output, filter, quality) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', input, ...(filter ? ['-vf', filter] : []), '-c:v', 'libwebp', '-quality', String(quality), '-compression_level', '6', output]);
for (const file of fs.readdirSync(covers).filter(f => /^[a-z0-9-]+\.webp$/.test(f) && !f.endsWith('-720.webp'))) {
  ffmpeg(path.join(covers, file), path.join(covers, file.replace('.webp', '-720.webp')), 'scale=720:-2:flags=lanczos', 80);
}
for (const poster of posters.filter(p => fs.existsSync(path.join(root, p)))) {
  ffmpeg(path.join(root, poster), path.join(root, poster.replace(/\.jpg$/, '.webp')), null, 78);
}
console.log('Responsive images written.');
