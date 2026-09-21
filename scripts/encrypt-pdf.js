'use strict';
/*
 * Encrypts the paid PDF into private/pack.enc (AES-256-GCM) so it can live in the repo without
 * being a public download. The key is read from DOWNLOAD_FILE_KEY (env or .env.local) and is
 * NEVER written to the repo. If no key exists, a new one is generated into .env.local (git-ignored).
 *
 * Usage:  node scripts/encrypt-pdf.js "<path to source PDF>"
 * Then set the same DOWNLOAD_FILE_KEY (and DOWNLOAD_SIGNING_SECRET) in Vercel → Environment Variables.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const envFile = path.join(root, '.env.local');
const src = process.argv[2];
if (!src || !fs.existsSync(src)) { console.error('Usage: node scripts/encrypt-pdf.js "<source.pdf>"'); process.exit(1); }

function loadEnvFile() {
  const out = {};
  if (fs.existsSync(envFile)) fs.readFileSync(envFile, 'utf8').split(/\r?\n/).forEach((l) => {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) out[m[1]] = m[2];
  });
  return out;
}
const local = loadEnvFile();
const add = [];
let keyHex = process.env.DOWNLOAD_FILE_KEY || local.DOWNLOAD_FILE_KEY;
if (!keyHex) { keyHex = crypto.randomBytes(32).toString('hex'); add.push('DOWNLOAD_FILE_KEY=' + keyHex); }
if (!(process.env.DOWNLOAD_SIGNING_SECRET || local.DOWNLOAD_SIGNING_SECRET)) add.push('DOWNLOAD_SIGNING_SECRET=' + crypto.randomBytes(32).toString('hex'));
if (add.length) fs.appendFileSync(envFile, (fs.existsSync(envFile) ? '\n' : '') + add.join('\n') + '\n');

const key = Buffer.from(keyHex, 'hex');
if (key.length !== 32) { console.error('DOWNLOAD_FILE_KEY must be 64 hex characters'); process.exit(1); }
const iv = crypto.randomBytes(12);
const c = crypto.createCipheriv('aes-256-gcm', key, iv);
const enc = Buffer.concat([c.update(fs.readFileSync(src)), c.final()]);
fs.mkdirSync(path.join(root, 'private'), { recursive: true });
fs.writeFileSync(path.join(root, 'private', 'pack.enc'), Buffer.concat([iv, c.getAuthTag(), enc]));
console.log('Wrote private/pack.enc (' + (enc.length + 28) + ' bytes).' + (add.length ? ' New secrets were saved to .env.local (git-ignored).' : ''));
