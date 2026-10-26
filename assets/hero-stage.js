// Homepage hero video stage (markup: scripts/build-storefront.js, styles: assets/hero-stage.css).
// The front card plays its promo muted; the back card peeks out and swaps in on click. Tabs advance every
// DURATION ms with a progress bar, paused on hover, focus, when off screen or while sound is enabled.
// Sound is opt-in through the compact control on each video.
(() => {
  const root = document.querySelector('[data-hero-stage]');
  if (!root) return;
  const DURATION = 14000;
  const cards = [...root.querySelectorAll('[data-hs-card]')];
  const tabs = [...root.querySelectorAll('[data-hs-tab]')];
  const copies = [...root.querySelectorAll('[data-hs-copy]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (matchMedia('(hover: none)').matches) root.classList.add('is-touch');
  let index = 0, bar = null, visible = true, hovering = false;

  const running = () => !reduce && visible && !hovering && cards[index].querySelector('video').muted && !document.hidden;
  const sync = () => {
    const front = cards[index].querySelector('video');
    // Hover and focus only hold the auto-advance; the front video keeps playing while it is on screen.
    if (visible && (!reduce || !front.muted) && !document.hidden) front.play().catch(() => {}); else front.pause();
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
      card.querySelector('.hs-sound').tabIndex = front ? 0 : -1;
      if (!front) { video.pause(); video.muted = true; updateSound(card); }
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
      if (card.dataset.pos === 'back' && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); show(k); cards[k].querySelector('.hs-sound').focus(); }
    });
  });
  tabs.forEach((tab, k) => tab.addEventListener('click', () => show(k)));

  function updateSound(card) {
    const muted = card.querySelector('video').muted;
    const button = card.querySelector('.hs-sound');
    const label = muted ? 'Unmute video' : 'Mute video';
    button.setAttribute('aria-pressed', String(!muted));
    button.setAttribute('aria-label', label);
    button.title = label;
  }
  cards.forEach(card => {
    const video = card.querySelector('video');
    const button = card.querySelector('.hs-sound');
    video.addEventListener('volumechange', () => { updateSound(card); sync(); });
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      video.muted = !video.muted;
      updateSound(card);
      if (!video.muted) video.play().catch(() => { video.muted = true; updateSound(card); sync(); });
      sync();
    });
    updateSound(card);
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
