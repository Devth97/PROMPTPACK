'use strict';
const L = require('./_lib');

/** GET /api/download?t=<signed token> — streams the decrypted PDF only for a valid, unexpired token. */
module.exports = async (req, res) => {
  if (req.method !== 'GET') return L.send(res, 405, { error: 'method_not_allowed' });
  const t = new URL(req.url, 'http://x').searchParams.get('t');
  const claims = L.readToken(t);
  if (!claims) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.end('This download link is invalid or has expired. Contact support with your payment reference and we will re-issue it.');
  }
  let pdf;
  try { pdf = L.decryptPack(); } catch (e) {
    console.error('download: cannot read pack', e.message);
    return L.send(res, 500, { error: 'file_unavailable' });
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="AI-Money-Audit-Prompt-Pack.pdf"');
  res.setHeader('Content-Length', String(pdf.length));
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  res.end(pdf);
};
