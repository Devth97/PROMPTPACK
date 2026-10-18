'use strict';
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.getElementById('motion-toggle');
  const videos = Array.from(document.querySelectorAll('video[data-src]'));
  const visible = new Set();
  let paused = preference.matches;
  function updateVideo(video) {
    if (paused || !visible.has(video) || document.hidden) { video.pause(); return; }
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.play().catch(() => {}); // Autoplay can be blocked by the browser.
  }
  function updateMotion() {
    document.body.classList.toggle('mx-motion-paused', paused);
    button.textContent = paused ? 'Play motion' : 'Pause motion';
    button.setAttribute('aria-pressed', String(paused));
    videos.forEach(updateVideo);
    window.dispatchEvent(new CustomEvent('promptpack:motion', { detail: { paused: paused || document.hidden } }));
  }
  button.hidden = false;
  button.addEventListener('click', () => { paused = !paused; updateMotion(); });
  preference.addEventListener('change', event => { paused = event.matches; updateMotion(); });
  document.addEventListener('visibilitychange', updateMotion);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
      updateVideo(entry.target);
    }));
    videos.forEach(video => observer.observe(video));
  }
  updateMotion();
})();
