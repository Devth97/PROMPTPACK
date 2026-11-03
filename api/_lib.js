'use strict';
/*
 * Shared helpers for the PromptPack payment API (Vercel Node functions, no dependencies).
 * Files starting with "_" are NOT exposed as endpoints by Vercel.
 * Secrets come ONLY from environment variables — see docs/payments.md.
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const catalog = require('./_products');

const PRODUCT_ID = 'ai-money-audit-prompt-pack';
const PRODUCT_NAME = 'AI Money Audit Prompt Pack';

const env = (n) => (process.env[n] || '').trim();
const rzpBase = () => env('RAZORPAY_API_BASE') || 'https://api.razorpay.com'; // override only in tests
const siteUrl = () => (env('SITE_URL') || 'https://promptpack.tech').replace(/\/$/, '');

function missing(names) { return names.filter((n) => !env(n)); }

/** Server-side prices (never trust an amount or currency from the browser). */
function price(plan) {
  if (plan === 'inr') {
    return { amount: parseInt(env('PRICE_AMOUNT_INR') || '159900', 10), currency: 'INR' };
  }
  const amount = parseInt(env('PRICE_AMOUNT') || '1900', 10); // smallest currency unit
  const currency = (env('PRICE_CURRENCY') || 'USD').toUpperCase();
  return { amount, currency };
}

function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

/** Browser POSTs must come from our own site. Non-browser callers (no Origin) are allowed; they still need valid signatures. */
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  let host;
  try { host = new URL(origin).host; } catch (e) { return false; }
  const allowed = new Set([req.headers.host, 'promptpack.tech', 'www.promptpack.tech']);
  try { allowed.add(new URL(siteUrl()).host); } catch (e) { /* ignore */ }
  return allowed.has(host);
}

async function readRaw(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  return Buffer.concat(chunks);
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return Array.isArray(req.body)?{}:req.body;
  try { const parsed=JSON.parse((await readRaw(req)).toString('utf8') || '{}');return parsed && typeof parsed==='object' && !Array.isArray(parsed)?parsed:{}; } catch (e) { return {}; }
}

/* ---------- Razorpay REST ---------- */
async function rzp(method, p, body) {
  const auth = 'Basic ' + Buffer.from(env('RAZORPAY_KEY_ID') + ':' + env('RAZORPAY_KEY_SECRET')).toString('base64');
  const r = await fetch(rzpBase() + p, {
    method,
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await r.json(); } catch (e) { /* non-JSON */ }
  return { ok: r.ok, status: r.status, data };
}

/* ---------- crypto ---------- */
const b64u = (b) => Buffer.from(b).toString('base64url');
const hmac = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest();
function safeEqual(a, b) {
  const A = Buffer.from(String(a)); const B = Buffer.from(String(b));
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

/** Signed, expiring download token: base64url(payload).base64url(hmac). Payload: o=order, p=payment, a=amount, c=currency, exp. */
function signToken(o, p, a, c, product = PRODUCT_ID) {
  const days = parseInt(env('TOKEN_TTL_DAYS') || '7', 10);
  const body = b64u(JSON.stringify({ o, p, a, c, product, exp: Math.floor(Date.now() / 1000) + days * 86400 }));
  return body + '.' + b64u(hmac(env('DOWNLOAD_SIGNING_SECRET'), body));
}
function readToken(tok) {
  try {
    const parts = String(tok || '').split('.');
    if(parts.length!==2)return null;
    const [body, sig] = parts;
    if (!body || !sig || !env('DOWNLOAD_SIGNING_SECRET')) return null;
    if (!safeEqual(sig, b64u(hmac(env('DOWNLOAD_SIGNING_SECRET'), body)))) return null;
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!p.exp || Date.now() / 1000 > p.exp) return null;
    // Existing Finance links predate the product claim and must remain usable.
    if(!Object.hasOwn(p,'product'))p.product=PRODUCT_ID;
    if(!catalog.byId(p.product))return null;
    return p;
  } catch (e) { return null; }
}

/** The PDF is stored AES-256-GCM encrypted in the repo (private/pack.enc); the key lives only in env. Layout: iv(12) | tag(16) | ciphertext. */
function packPath(product = catalog.finance) {
  return [path.join(process.cwd(),'private',product.file),path.join(__dirname,'..','private',product.file)].find(f=>fs.existsSync(f));
}
function decryptPack(product = catalog.finance) {
  // ProfitPulse uses a dedicated encryption key to avoid changing the keys used for existing customers.
  const secretName=product && product.slug==='profitpulse'?'PROFITPULSE_FILE_KEY':'DOWNLOAD_FILE_KEY';
  const key = Buffer.from(env(secretName), 'hex');
  if (key.length !== 32) throw new Error('DOWNLOAD_FILE_KEY must be 64 hex chars');
  const file = packPath(product);
  if (!file) throw new Error('pack.enc not found');
  let buf = fs.readFileSync(file);
  // The uploaded ProfitPulse AES-GCM ciphertext is armored as UTF-8 Base64.
  // The public repository contains only encrypted data, never customer files.
  if (product && product.slug === 'profitpulse') {
    const prefix = Buffer.from([80,80,69,78,67,49,10]); // PPENC1 + line feed
    if (!buf.subarray(0,prefix.length).equals(prefix)) throw new Error('ProfitPulse encrypted envelope missing');
    const encoded = buf.subarray(prefix.length).toString('ascii').trim();
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new Error('ProfitPulse encrypted envelope invalid');
    buf = Buffer.from(encoded, 'base64');
    if (buf.length !== product.bytes + 28) throw new Error('ProfitPulse encrypted archive length mismatch');
  }
  const d = crypto.createDecipheriv('aes-256-gcm', key, buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  const plain=Buffer.concat([d.update(buf.subarray(28)), d.final()]);
  if(product.sha256 && crypto.createHash('sha256').update(plain).digest('hex')!==product.sha256)throw new Error('Pack digest mismatch');
  return plain;
}

module.exports = {
  PRODUCT_ID, PRODUCT_NAME, env, siteUrl, missing, price, send, sameOrigin, readRaw, readJson,
  rzp, hmac, safeEqual, signToken, readToken, decryptPack, packPath, catalog,
};
