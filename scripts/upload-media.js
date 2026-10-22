'use strict';
// Upload site videos (assets/**/*.mp4) to the public R2 bucket behind media.promptpack.tech.
// Pages link them there (see withMedia in build-catalog.js). Objects are cached as immutable,
// so give a changed video a new file name instead of overwriting the old one.
// Usage: node scripts/upload-media.js [--dry-run]   (needs `npx wrangler login` first)
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.join(__dirname, '..');
const bucket = 'promptpack-media';
const mediaOrigin = 'https://media.promptpack.tech';
const dryRun = process.argv.includes('--dry-run');

const files = execFileSync('git', ['ls-files', 'assets/*.mp4', 'assets/**/*.mp4'], {cwd: root, encoding: 'utf8'}).split('\n').filter(Boolean);

(async () => {
  let uploaded = 0;
  for (const key of [...new Set(files)]) {
    // The Windows upload goes through a shell, so only plain path characters are allowed.
    if (!/^assets\/[\w./-]+\.mp4$/.test(key) || key.includes('..')) throw new Error(`Unsafe media path: ${key}`);
    const size = fs.statSync(path.join(root, key)).size;
    const head = await fetch(`${mediaOrigin}/${key}`, {method: 'HEAD'});
    if (head.ok && Number(head.headers.get('content-length')) === size) continue;
    console.log(`${dryRun ? 'would upload' : 'upload'} ${key} (${size} bytes)`);
    if (dryRun) continue;
    execFileSync('npx', ['--yes', 'wrangler', 'r2', 'object', 'put', `${bucket}/${key}`, '--file', key, '--content-type', 'video/mp4', '--cache-control', 'public,max-age=31536000,immutable', '--remote'], {cwd: root, stdio: 'inherit', shell: process.platform === 'win32'});
    uploaded++;
  }
  console.log(`${files.length} videos checked, ${uploaded} uploaded.`);
})().catch(error => { console.error(error); process.exit(1); });
