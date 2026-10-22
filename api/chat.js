'use strict';
/*
 * Site chat: a visitor's question is emailed to the PromptPack inbox through Resend, with reply_to set to the
 * visitor so the owner answers straight from email. Only the owner is ever emailed (never the address the
 * visitor typed), so the form cannot be used to send mail to other people.
 * Env: RESEND_API_KEY, EMAIL_FROM (already used for download emails), optional CHAT_TO (defaults to
 * EMAIL_REPLY_TO, then the public contact address).
 */
const L = require('./_lib');

const CONTACT = 'ornalens@gmail.com'; // the address published on /contact/
const LIMIT = 5, WINDOW_MS = 10 * 60 * 1000;
const recent = new Map(); // best effort: per warm function instance, not a global limit
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const oneLine = (s, n) => String(s || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, n);

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return L.send(res, 405, { error: 'method_not_allowed' }); }
  if (!L.sameOrigin(req)) return L.send(res, 403, { error: 'forbidden' });
  const body = await L.readJson(req);
  if (body.website) return L.send(res, 200, { ok: true }); // honeypot: real visitors never see this field

  const email = oneLine(body.email, 200);
  const name = oneLine(body.name, 80);
  const page = oneLine(body.page, 200);
  const message = String(body.message || '').trim();
  if (!/^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/.test(email)) return L.send(res, 400, { error: 'invalid_email' });
  if (message.length < 2 || message.length > 2000) return L.send(res, 400, { error: 'invalid_message' });

  const ip = oneLine(String(req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '').split(',')[0], 64);
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= LIMIT) return L.send(res, 429, { error: 'too_many' });
  hits.push(now); recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();

  const apiKey = L.env('RESEND_API_KEY'), from = L.env('EMAIL_FROM');
  const to = L.env('CHAT_TO') || L.env('EMAIL_REPLY_TO') || CONTACT;
  if (!apiKey || !from) { console.error('chat: RESEND_API_KEY or EMAIL_FROM missing'); return L.send(res, 503, { error: 'unavailable' }); }

  const html = '<div style="font-family:Arial,sans-serif;max-width:560px">'
    + '<h2 style="margin:0 0 8px">New question from the site chat</h2>'
    + '<p style="margin:0 0 4px"><b>From:</b> ' + esc(name ? name + ' <' + email + '>' : email) + '</p>'
    + (page ? '<p style="margin:0 0 12px"><b>Page:</b> ' + esc(page) + '</p>' : '')
    + '<div style="white-space:pre-wrap;border:2px solid #000;padding:12px;background:#fffbf2">' + esc(message) + '</div>'
    + '<p style="font-size:13px;color:#555">Reply to this email to answer the visitor directly.</p></div>';
  const r = await fetch(L.env('EMAIL_API_BASE') || 'https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], reply_to: email, subject: 'Site chat: ' + (oneLine(message, 60) || 'new question'), html }),
  });
  if (!r.ok) { console.error('chat: email provider error', r.status); return L.send(res, 502, { error: 'email_failed' }); }
  return L.send(res, 200, { ok: true });
};
