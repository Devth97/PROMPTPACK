// Homepage hero video stage (markup: scripts/build-storefront.js, styles: assets/hero-stage.css).
// The front card plays its promo muted; the back card peeks out and swaps in on click. Tabs advance every
// DURATION ms with a progress bar, paused on hover, focus, when off screen or while the dialog is open.
// "Watch" opens the full video with controls (and sound, where the video has it).
(() => {
  const root = document.querySelector('[data-hero-stage]');
  if (!root) return;
  const DURATION = 14000;
  const cards = [...root.querySelectorAll('[data-hs-card]')];
  const tabs = [...root.querySelectorAll('[data-hs-tab]')];
  const copies = [...root.querySelectorAll('[data-hs-copy]')];
  const dialog = root.querySelector('[data-hs-dialog]');
  const dialogVideo = dialog.querySelector('video');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (matchMedia('(hover: none)').matches) root.classList.add('is-touch');
  let index = 0, bar = null, visible = true, hovering = false, open = false, opener = null;

  const running = () => !reduce && visible && !hovering && !open && !document.hidden;
  const sync = () => {
    const front = cards[index].querySelector('video');
    // Hover and focus only hold the auto-advance; the front video keeps playing while it is on screen.
    if (visible && !open && !reduce && !document.hidden) front.play().catch(() => {}); else front.pause();
    if (bar) running() ? bar.play() : bar.pause();
  };

  function show(n) {
    index = (n + cards.length) % cards.length;
    cards.forEach((card, k) => {
      const front = k === index;
      card.dataset.pos = front ? 'front' : 'back';
      // The back card is a button that brings its video to the front.
      if (front) { card.removeAttribute('role'); card.removeAttribute('tabindex'); card.removeAttribute('aria-label'); }
      else { card.setAttribute('role', 'button'); card.tabIndex = 0; card.setAttribute('aria-label', 'Show ' + card.dataset.title); }
      const video = card.querySelector('video');
      if (!front) video.pause();
    });
    tabs.forEach((tab, k) => {
      tab.setAttribute('aria-selected', k === index ? 'true' : 'false');
      tab.querySelector('.bar').style.transform = 'scaleX(0)';
    });
    copies.forEach((copy, k) => copy.classList.toggle('is-active', k === index));
    if (bar) bar.cancel();
    bar = null;
    if (!reduce) {
      bar = tabs[index].querySelector('.bar').animate([{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: DURATION, fill: 'forwards'});
      bar.onfinish = () => show(index + 1);
    }
    sync();
  }

  cards.forEach((card, k) => {
    card.addEventListener('click', (event) => {
      if (card.dataset.pos === 'back') { event.preventDefault(); show(k); }
    });
    card.addEventListener('keydown', (event) => {
      if (card.dataset.pos === 'back' && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); show(k); cards[k].querySelector('.hs-play').focus(); }
    });
  });
  tabs.forEach((tab, k) => tab.addEventListener('click', () => show(k)));

  function openDialog(card, button) {
    open = true; opener = button;
    dialogVideo.poster = card.dataset.poster;
    dialogVideo.src = card.dataset.full;
    dialogVideo.muted = false;
    dialog.setAttribute('aria-label', card.dataset.title);
    dialog.classList.add('is-open');
    dialog.removeAttribute('hidden');
    dialogVideo.play().catch(() => {});
    dialog.querySelector('.hs-close').focus();
    sync();
  }
  function closeDialog() {
    if (!open) return;
    dialogVideo.pause();
    dialogVideo.removeAttribute('src');
    dialogVideo.load();
    dialog.classList.remove('is-open');
    setTimeout(() => { if (!open) dialog.setAttribute('hidden', ''); }, 260);
    open = false;
    if (opener) opener.focus();
    sync();
  }
  root.querySelectorAll('.hs-play').forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault(); event.stopPropagation(); openDialog(button.closest('[data-hs-card]'), button);
  }));
  dialog.querySelector('.hs-close').addEventListener('click', closeDialog);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });
  document.addEventListener('keydown', (event) => {
    if (!open) return;
    if (event.key === 'Escape') closeDialog();
    if (event.key === 'Tab') { // keep focus inside the dialog
      const items = [dialogVideo, dialog.querySelector('.hs-close')];
      const i = items.indexOf(document.activeElement);
      event.preventDefault();
      items[(i + (event.shiftKey ? items.length - 1 : 1)) % items.length].focus();
    }
  });

  const stack = root.querySelector('.hs-stack');
  stack.addEventListener('mouseenter', () => { hovering = true; sync(); });
  stack.addEventListener('mouseleave', () => { hovering = false; sync(); });
  root.addEventListener('focusin', () => { hovering = true; sync(); });
  root.addEventListener('focusout', () => { hovering = false; sync(); });
  document.addEventListener('visibilitychange', sync);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, {threshold: 0.25}).observe(stack);
  show(0);
})();
