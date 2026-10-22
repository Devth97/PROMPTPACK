'use strict';
// "Questions? Ask us." widget: posts to /api/chat, which emails the PromptPack inbox (replies go to the visitor).
(function() {
  if (document.querySelector('.pp-chat')) return;
  const CONTACT = 'ornalens@gmail.com';
  const css = `
.pp-chat{position:fixed;right:16px;bottom:16px;z-index:60;font-family:inherit}
body:has(.sticky-cta.is-visible) .pp-chat{bottom:96px}
.pp-chat-toggle{display:flex;align-items:center;gap:8px;padding:12px 14px;background:var(--yellow,#ffe14d);color:var(--ink,#0b0b0f);border:3px solid var(--ink,#0b0b0f);box-shadow:4px 4px 0 var(--ink,#0b0b0f);font-family:inherit;font-size:13px;font-weight:800;line-height:1;text-transform:uppercase;letter-spacing:.02em;cursor:pointer}
.pp-chat-toggle:hover{transform:translate(-1px,-1px);box-shadow:5px 5px 0 var(--ink,#0b0b0f)}
.pp-chat-toggle svg{width:20px;height:20px;flex-shrink:0}
.pp-chat-panel{position:absolute;right:0;bottom:calc(100% + 12px);width:min(360px,calc(100vw - 32px));background:var(--paper,#fff);border:3px solid var(--ink,#0b0b0f);box-shadow:6px 6px 0 var(--ink,#0b0b0f)}
.pp-chat-panel[hidden]{display:none}
.pp-chat-head{position:relative;padding:16px 48px 14px 16px;background:var(--ink,#0b0b0f);color:#fff}
.pp-chat-head h2{margin:0;font-size:20px;line-height:1.05;text-transform:uppercase;color:#fff}
.pp-chat-head p{margin:6px 0 0;font-size:12px;color:#d9d4cc}
.pp-chat-head p::before{content:"";display:inline-block;width:8px;height:8px;margin-right:6px;border-radius:50%;background:var(--mint,#a8f0c6)}
.pp-chat-close{position:absolute;top:10px;right:10px;width:30px;height:30px;border:2px solid #fff;background:transparent;color:#fff;font-size:18px;line-height:1;cursor:pointer}
.pp-chat form{display:grid;gap:10px;padding:16px}
.pp-chat label{display:grid;gap:4px;font-size:12px;font-weight:700}
.pp-chat input,.pp-chat textarea{width:100%;box-sizing:border-box;padding:10px;border:2px solid var(--ink,#0b0b0f);font:inherit;font-size:14px;background:#fff;color:var(--ink,#0b0b0f)}
.pp-chat textarea{min-height:110px;resize:vertical}
.pp-chat .pp-chat-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.pp-chat button[type=submit]{padding:12px;background:var(--pink,#f598f2);border:3px solid var(--ink,#0b0b0f);box-shadow:3px 3px 0 var(--ink,#0b0b0f);font-weight:800;text-transform:uppercase;cursor:pointer}
.pp-chat button[disabled]{opacity:.6;cursor:wait}
.pp-chat-status{margin:0;font-size:13px;min-height:1em}
.pp-chat-note{margin:0;font-size:11px;color:var(--muted,#2b2b33)}
@media print{.pp-chat{display:none}}`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.className = 'pp-chat';
  root.innerHTML = `
<div class="pp-chat-panel" id="pp-chat-panel" role="dialog" aria-labelledby="pp-chat-title" hidden>
  <div class="pp-chat-head"><h2 id="pp-chat-title">Questions? Ask us.</h2><p>A real person replies by email, usually within a day.</p>
    <button type="button" class="pp-chat-close" aria-label="Close chat">×</button></div>
  <form novalidate>
    <label>Your email<input type="email" name="email" autocomplete="email" required maxlength="200" placeholder="you@example.com"></label>
    <label>Your question<textarea name="message" required maxlength="2000" placeholder="Which kit fits what I want to make?"></textarea></label>
    <div class="pp-chat-hp" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
    <button type="submit">Send</button>
    <p class="pp-chat-status" role="status" aria-live="polite"></p>
    <p class="pp-chat-note">We only use your email to reply. Or write to <a href="mailto:${CONTACT}">${CONTACT}</a>.</p>
  </form>
</div>
<button type="button" class="pp-chat-toggle" aria-expanded="false" aria-controls="pp-chat-panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>Ask us</button>`;
  document.body.appendChild(root);

  const panel = root.querySelector('.pp-chat-panel');
  const toggle = root.querySelector('.pp-chat-toggle');
  const form = root.querySelector('form');
  const status = root.querySelector('.pp-chat-status');
  const submit = form.querySelector('button[type=submit]');
  const setOpen = open => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) form.email.focus(); else toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  root.querySelector('.pp-chat-close').addEventListener('click', () => setOpen(false));
  root.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) setOpen(false); });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.email.value.trim(), message = form.message.value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { status.textContent = 'Please enter a valid email so we can reply.'; form.email.focus(); return; }
    if (message.length < 2) { status.textContent = 'Please write your question.'; form.message.focus(); return; }
    submit.disabled = true;
    status.textContent = 'Sending…';
    try {
      const r = await fetch('/api/chat', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email, message, website: form.website.value, page: location.pathname})});
      if (r.status === 429) throw new Error('Too many messages. Please try again in a few minutes.');
      if (!r.ok) throw new Error('');
      form.reset();
      status.textContent = `Sent. We'll reply to ${email}, usually within a day.`;
    } catch (err) {
      status.innerHTML = '';
      status.append(err.message || "Couldn't send right now. Email us at ", ...(err.message ? [] : [Object.assign(document.createElement('a'), {href: 'mailto:' + CONTACT, textContent: CONTACT}), '.']));
    } finally {
      submit.disabled = false;
    }
  });
})();
