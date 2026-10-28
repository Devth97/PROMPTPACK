'use strict';
// Website brief builder on /learn/ai-website-prompt-template/. It fills the public template in the
// browser: no AI service, no network request, nothing stored. Empty answers become [MISSING: ...] lines.
(() => {
  const form = document.getElementById('brief-builder');
  if (!form) return;
  const output = document.getElementById('brief-output');
  const status = document.getElementById('brief-status');
  const value = name => (form.elements[name]?.value || '').trim();
  const or = (text, label) => text || `[MISSING: ${label}]`;
  function build() {
    const sections = [...form.querySelectorAll('input[name="section"]:checked')].map(box => box.value);
    const lines = [
      `Build one responsive landing page for ${or(value('business'), 'business or project name')} serving ${or(value('audience'), 'who the page is for')}.`,
      `The visitor should understand ${or(value('offer'), 'the offer')} and take one primary action: ${or(value('action'), 'the one action')}${value('destination') ? ` (destination: ${value('destination')})` : ' [MISSING: real destination for the action]'}.`,
      `Use this approved content: ${or(value('content'), 'headline, benefits, price, contact details and asset rights')}.`,
      `Sections: ${sections.length ? sections.join(', ') : '[MISSING: choose the sections]'}.`,
      `Visual direction: ${or(value('visual'), 'palette, typography, spacing and references')}.`,
      'Use semantic headings, labelled controls, visible keyboard focus and readable contrast.',
      'Support small screens and reduced motion. Keep meaningful content in the HTML.',
      'Do not invent testimonials, metrics, discounts, logos or working integrations.',
      'Mark missing information clearly. Use a real destination for each action.',
      value('tool') ? `Build it with ${value('tool')}; tell me about any account, package or backend it needs before adding it.` : null,
      'Return the implementation and a checklist for layout, links, keyboard access and forms.'
    ].filter(Boolean);
    output.value = lines.join('\n');
    const missing = (output.value.match(/\[MISSING:/g) || []).length;
    status.textContent = missing ? `Brief updated. ${missing} item${missing === 1 ? '' : 's'} still marked [MISSING]; fill them in or keep them so the tool asks you.` : 'Brief updated. Nothing is marked missing.';
  }
  form.addEventListener('input', build);
  form.addEventListener('change', build);
  form.addEventListener('submit', event => { event.preventDefault(); build(); output.focus(); });
  const copied = button => button.dispatchEvent(new CustomEvent('promptpack:copied', {bubbles: true}));
  document.getElementById('brief-copy').addEventListener('click', async event => {
    try { await navigator.clipboard.writeText(output.value); status.textContent = 'Brief copied. Paste it into your AI coding tool.'; copied(event.currentTarget); }
    catch { output.select(); status.textContent = 'Select the brief above and copy it manually.'; }
  });
  document.getElementById('brief-download').addEventListener('click', event => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([output.value + '\n'], {type: 'text/plain'}));
    link.download = 'website-brief.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    status.textContent = 'Brief saved as website-brief.txt.';
    copied(event.currentTarget);
  });
  // The tool needs JavaScript; without it the page keeps the plain template above.
  document.getElementById('brief-tool').hidden = false;
  build();
})();
