'use strict';
// Progressive enhancements: every page stays complete and usable without this file.
(() => {
  const root = document.documentElement;
  root.classList.add('fx');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const observe = (elements, callback, options) => {
    if (!('IntersectionObserver' in window)) return null;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => callback(entry, observer)), options);
    elements.forEach(element => observer.observe(element));
    return observer;
  };

  // Number ticker: the final value is already in the HTML; count up to it once it is visible.
  if (!reduced) {
    observe(document.querySelectorAll('[data-count]'), (entry, observer) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const element = entry.target;
      const target = Number(element.dataset.count);
      const start = performance.now();
      const step = now => {
        const progress = Math.min((now - start) / 1400, 1);
        element.textContent = Math.round(target * (1 - Math.pow(2, -10 * progress)));
        if (progress < 1) requestAnimationFrame(step);
        else element.textContent = target;
      };
      requestAnimationFrame(step);
    });
  }

  // Blur-fade reveal for content that starts below the fold, so nothing visible on load flickers.
  if (!reduced && 'IntersectionObserver' in window) {
    const pending = Array.from(document.querySelectorAll('.product-card,.section-heading,.how-section,.home-faq,.shelf-end,.bridge,.related-card,.edition-previews'))
      .filter(element => element.getBoundingClientRect().top > innerHeight * 0.92);
    pending.forEach(element => {
      const siblings = Array.from(element.parentElement.children);
      element.style.setProperty('--fx-delay', `${(siblings.indexOf(element) % 3) * 90}ms`);
      element.classList.add('fx-reveal');
    });
    observe(pending, (entry, observer) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      entry.target.classList.add('fx-in');
      // Hand control back to the element's own hover transitions once revealed.
      setTimeout(() => { entry.target.classList.remove('fx-reveal', 'fx-in'); entry.target.style.removeProperty('--fx-delay'); }, 900);
    });
  }

  // Tilt + spotlight on cover art and magnetic primary buttons, for mouse users only.
  if (finePointer && !reduced) {
    document.querySelectorAll('[data-tilt]').forEach(cover => {
      const surface = cover.closest('.product-card,.related-card') || cover;
      surface.addEventListener('pointermove', event => {
        const box = cover.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width;
        const y = (event.clientY - box.top) / box.height;
        cover.style.setProperty('--fx-x', `${x * 100}%`);
        cover.style.setProperty('--fx-y', `${y * 100}%`);
        cover.style.setProperty('--fx-rx', `${(0.5 - y) * 7}deg`);
        cover.style.setProperty('--fx-ry', `${(x - 0.5) * 9}deg`);
        cover.classList.add('is-active');
      });
      surface.addEventListener('pointerleave', () => cover.classList.remove('is-active'));
    });
    document.querySelectorAll('[data-magnet]').forEach(button => {
      button.addEventListener('pointermove', event => {
        const box = button.getBoundingClientRect();
        const dx = Math.max(-8, Math.min(8, (event.clientX - box.left - box.width / 2) * 0.22));
        const dy = Math.max(-6, Math.min(6, (event.clientY - box.top - box.height / 2) * 0.3));
        button.style.translate = `${dx}px ${dy}px`;
      });
      button.addEventListener('pointerleave', () => { button.style.translate = ''; });
    });
  }

  // Click spark when a sample prompt is copied.
  document.addEventListener('promptpack:copied', event => {
    if (reduced || !Element.prototype.animate) return;
    const box = event.target.getBoundingClientRect();
    const colors = ['#F598F2', '#FFE14D', '#A8F0C6', '#9DCBFF', '#FF9F8E'];
    for (let i = 0; i < 12; i++) {
      const spark = document.createElement('span');
      spark.className = 'fx-spark';
      spark.style.left = `${box.left + box.width / 2}px`;
      spark.style.top = `${box.top + box.height / 2}px`;
      spark.style.background = colors[i % colors.length];
      document.body.appendChild(spark);
      const angle = (Math.PI * 2 * i) / 12;
      const distance = 50 + Math.random() * 30;
      spark.animate([
        {transform: 'translate(-50%,-50%) rotate(0deg) scale(1)', opacity: 1},
        {transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) rotate(${120 + i * 20}deg) scale(.4)`, opacity: 0}
      ], {duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)'}).onfinish = () => spark.remove();
    }
  });

  // Reading progress on product pages.
  const header = document.querySelector('.pp-header');
  if (header && document.querySelector('.detail')) {
    const bar = document.createElement('div');
    bar.className = 'fx-progress';
    bar.setAttribute('aria-hidden', 'true');
    header.appendChild(bar);
    let queued = false;
    const update = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, {passive: true});
    update();
  }

  // Preview lightbox: keep visitors on the page instead of opening a new tab.
  const previews = document.querySelectorAll('[data-lightbox]');
  if (previews.length && typeof HTMLDialogElement === 'function') {
    const dialog = document.createElement('dialog');
    dialog.className = 'fx-lightbox';
    dialog.innerHTML = '<div class="fx-lightbox-bar"><span></span><button type="button" class="fx-lightbox-close">Close ✕</button></div><img alt="">';
    document.body.appendChild(dialog);
    const image = dialog.querySelector('img');
    const caption = dialog.querySelector('span');
    let opener = null;
    dialog.addEventListener('click', event => {
      if (event.target === dialog || event.target.closest('.fx-lightbox-close')) dialog.close();
    });
    dialog.addEventListener('close', () => { if (opener) opener.focus(); });
    previews.forEach(link => link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      opener = link;
      const thumb = link.querySelector('img');
      image.src = link.href;
      image.alt = thumb ? thumb.alt : '';
      caption.textContent = thumb ? thumb.alt : '';
      dialog.showModal();
    }));
  }

  // Sticky mobile call to action: appears after the hero, hides near its own target and the footer.
  const sticky = document.querySelector('[data-sticky-cta]');
  if (sticky && 'IntersectionObserver' in window) {
    const watched = [document.querySelector('.hero'), document.getElementById(sticky.dataset.stickyCta), document.querySelector('.pp-footer')].filter(Boolean);
    const inView = new Set();
    observe(watched, entry => {
      if (entry.isIntersecting) inView.add(entry.target); else inView.delete(entry.target);
      sticky.classList.toggle('is-visible', inView.size === 0);
    });
  }

  // Videos with controls play muted while on screen and pause when scrolled away. A video the
  // visitor pauses stays paused. Skipped when the visitor asks for reduced motion.
  const players = [...document.querySelectorAll('video[controls]')];
  if (!reduced && players.length) {
    const autoPaused = new WeakSet();
    const userPaused = new WeakSet();
    players.forEach(video => {
      video.muted = true;
      video.loop = true;
      video.addEventListener('pause', () => { if (autoPaused.has(video)) autoPaused.delete(video); else userPaused.add(video); });
      video.addEventListener('play', () => userPaused.delete(video));
    });
    observe(players, entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        if (!userPaused.has(video)) video.play().catch(() => {});
      } else if (!video.paused) {
        autoPaused.add(video);
        video.pause();
      }
    }, { threshold: 0.5 });
  }

  // Silent ambient videos (no controls) play while on screen. With reduced motion they stay on
  // their poster and get controls, so the visitor can still choose to play them.
  const ambient = [...document.querySelectorAll('video[data-ambient]')];
  if (reduced) {
    ambient.forEach(video => { video.removeAttribute('autoplay'); video.pause(); video.controls = true; });
  } else if (ambient.length) {
    observe(ambient, entry => {
      if (entry.isIntersecting) entry.target.play().catch(() => {});
      else entry.target.pause();
    }, { threshold: 0.25 });
  }

  // Preview wall: animated tiles load their clip the first time they near the screen, play while
  // visible and pause when scrolled away. Reduced motion keeps the still posters.
  const tiles = [...document.querySelectorAll('[data-video]')];
  if (!reduced && tiles.length) {
    observe(tiles, entry => {
      const tile = entry.target;
      let video = tile.querySelector('video');
      if (!entry.isIntersecting) { if (video) video.pause(); return; }
      if (!video) {
        video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('aria-hidden', 'true');
        video.addEventListener('playing', () => tile.classList.add('is-playing'), { once: true });
        video.src = tile.dataset.video;
        tile.querySelector('.wall-media').append(video);
      }
      video.play().catch(() => {});
    }, { rootMargin: '150px 0px' });
  }

  // Preview wall filters.
  const filters = [...document.querySelectorAll('[data-wall-filter]')];
  filters.forEach(button => button.addEventListener('click', () => {
    const group = button.dataset.wallFilter;
    filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    document.querySelectorAll('.wall-tile').forEach(tile => { tile.hidden = group !== 'all' && tile.dataset.group !== group; });
  }));
})();
