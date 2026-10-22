'use strict';
/* Run: node --test tests/chat.test.js — the site chat endpoint against the mock email API. */
const test = require('node:test');
const assert = require('node:assert');
const { startMockRazorpay, startSite } = require('./dev-server');

const SITE = 'http://localhost:4390', MOCK = 'http://localhost:4391';
let servers = [];
test.before(async () => {
  const m = await startMockRazorpay(4391); servers.push(m.server);
  servers.push(await startSite(4390, 4391));
});
test.after(() => servers.forEach((s) => s.close()));

const chat = (body, ip = '203.0.113.' + Math.floor(Math.random() * 250), headers = {}) => fetch(SITE + '/api/chat', {
  method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json', 'X-Forwarded-For': ip }, headers), body: JSON.stringify(body),
});
const emails = async () => (await fetch(MOCK + '/__emails')).json();

test('chat: a question is emailed to the inbox only, with reply_to set to the visitor', async () => {
  const before = (await emails()).length;
  const r = await chat({ email: 'visitor@example.com', message: 'Which kit fits a <b>UGC</b> ad?\nThanks', page: '/products/ugc-ad-scripts/' });
  assert.equal(r.status, 200);
  const sent = (await emails()).slice(before);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].reply_to, 'visitor@example.com');
  assert.ok(!sent[0].to.includes('visitor@example.com'), 'the visitor address is never a recipient');
  assert.match(sent[0].html, /&lt;b&gt;UGC&lt;\/b&gt;/);
  assert.doesNotMatch(sent[0].subject, /[\r\n]/);
});

test('chat: bad input, other origins and the honeypot send nothing', async () => {
  const before = (await emails()).length;
  assert.equal((await chat({ email: 'not-an-email', message: 'hi there' })).status, 400);
  assert.equal((await chat({ email: 'a@b.co', message: 'x'.repeat(2001) })).status, 400);
  assert.equal((await chat({ email: 'a@b.co', message: 'hello' }, undefined, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await chat({ email: 'a@b.co', message: 'hello', website: 'http://spam' })).status, 200);
  assert.equal((await fetch(SITE + '/api/chat')).status, 405);
  assert.equal((await emails()).length, before);
});

test('chat: one sender is rate limited after five messages', async () => {
  // The dev server reloads api files per request, so call one loaded handler directly (as a warm Vercel instance does).
  const handler = require('../api/chat');
  const call = () => new Promise((resolve) => {
    const res = { statusCode: 0, setHeader() {}, end() { resolve(res.statusCode); } };
    handler({ method: 'POST', headers: { host: 'localhost', 'x-forwarded-for': '198.51.100.7' }, body: { email: 'a@b.co', message: 'question' } }, res);
  });
  const statuses = [];
  for (let i = 0; i < 6; i++) statuses.push(await call());
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
});
