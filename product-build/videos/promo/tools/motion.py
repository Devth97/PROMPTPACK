"""Per-scene GSAP motion for the promo (scene-local seconds). Entrances land on Pixel's words:
each scene's voice-over starts 0.3 s into the scene. Rules used: kinetic-beat-slam (headlines),
discrete clip-path reveal (code lines), stat-bars-and-fills (waveform), counting-dynamic-scale
(18 / 24), press-release-spring (price sticker), sine-wave-loop (ambient drift)."""

DRIFT = "        tl.fromTo('#{id}-dots', {{ x: 0, y: 0 }}, {{ x: -40, y: -40, duration: {d}, ease: 'none' }}, 0);\n"

MOTION = {}

MOTION['01-cold-open'] = """
        tl.fromTo('#f1-tag', { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'back.out(2)' }, 0.3);
"""

MOTION['02-typed'] = DRIFT.format(id='f2', d=5.3) + """
        tl.fromTo('#f2-code', { x: 260, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, 0.05);
        gsap.utils.toArray('#f2-code > div').forEach((row, i) => {
          tl.fromTo(row, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.22, ease: 'none' }, 0.35 + i * 0.16);
        });
        tl.fromTo('#f2-head .line:nth-child(1)', { scale: 1.5, filter: 'blur(16px)', opacity: 0 }, { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 0.5, ease: 'power4.out' }, 2.7);
        tl.fromTo('#f2-head .line:nth-child(2)', { x: -340, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, 3.85);
        tl.fromTo('#f2-ghost', { rotation: -8, scale: 0.9 }, { rotation: 6, scale: 1.05, duration: 5.3, ease: 'sine.inOut' }, 0);
"""

MOTION['03-steps'] = DRIFT.format(id='f3', d=8.6) + """
        tl.fromTo('#f3-title', { y: 90, rotation: 4, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.55, ease: 'circ.out' }, 0.15);
        [0.6, 2.85, 3.7, 5.3, 6.75].forEach((at, i) => {
          tl.fromTo('#f3-list .row:nth-child(' + (i + 1) + ')', { x: -160, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, at);
        });
        tl.fromTo('#f3-wave i', { scaleY: 0.05 }, { scaleY: 1, duration: 0.35, ease: 'back.out(2)', stagger: 0.012 }, 3.0);
        tl.fromTo('#f3-words span', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(2.2)', stagger: 0.12 }, 3.9);
        tl.fromTo('#f3-moves span', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2.2)', stagger: 0.12 }, 5.5);
        tl.fromTo('#f3-strip img', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out', stagger: 0.09 }, 7.0);
"""

MOTION['04-free-voices'] = DRIFT.format(id='f4', d=8.3) + """
        tl.fromTo('#f4-bg', { clipPath: 'circle(0% at 50% 40%)' }, { clipPath: 'circle(150% at 50% 40%)', duration: 0.55, ease: 'power3.inOut' }, 0);
        tl.fromTo('#f4-head .line:nth-child(1)', { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'circ.out' }, 0.35);
        tl.fromTo('#f4-head .line:nth-child(2)', { scale: 1.6, filter: 'blur(14px)', opacity: 0 }, { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 0.5, ease: 'power4.out' }, 0.7);
        tl.fromTo('#f4-premium', { y: 120, rotation: -3, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, 3.75);
        tl.fromTo('#f4-premium small', { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }, 5.75);
        tl.fromTo('#f4-note', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 6.2);
        [2.0, 2.45, 2.9].forEach((at, i) => {
          tl.fromTo('#f4-chips .chip:nth-child(' + (i + 1) + ')', { x: 120, rotation: 6, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, at);
        });
        tl.fromTo('#f4-ghost', { scale: 0.92 }, { scale: 1.06, duration: 8.3, ease: 'sine.inOut' }, 0);
"""

MOTION['05-craft'] = DRIFT.format(id='f5', d=4.9) + """
        const n18 = document.querySelector('#f5-top .num5'), n24 = document.querySelector('#f5-bottom .num5');
        const c18 = { v: 0 }, c24 = { v: 0 };
        tl.fromTo(c18, { v: 0 }, { v: 18, duration: 0.8, ease: 'power2.out', onUpdate: () => { n18.textContent = Math.round(c18.v); } }, 0.3);
        tl.fromTo(n18, { scale: 0.6 }, { scale: 1, duration: 0.8, ease: 'power2.out' }, 0.3);
        tl.fromTo('#f5-top .chip', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(2)', stagger: 0.08 }, 0.9);
        tl.fromTo(c24, { v: 0 }, { v: 24, duration: 0.8, ease: 'power2.out', immediateRender: false, onUpdate: () => { n24.textContent = Math.round(c24.v); } }, 1.85);
        tl.fromTo(n24, { scale: 0.6 }, { scale: 1, duration: 0.8, ease: 'power2.out' }, 1.85);
        tl.fromTo('#f5-bottom .chip', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(2)', stagger: 0.08 }, 2.4);
        tl.fromTo('#f5-tile', { x: 420, rotation: 6 }, { x: 0, rotation: 0, duration: 0.55, ease: 'expo.out' }, 1.5);
"""

MOTION['06-unlimited'] = DRIFT.format(id='f6', d=5.1) + """
        tl.fromTo('#f6-head', { y: 90, rotation: 3, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.55, ease: 'circ.out' }, 0.15);
        tl.fromTo('#f6-grid .tile', { y: 140, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.14 }, 0.6);
        tl.fromTo('#f6-stickers .chip:nth-child(1)', { scale: 0.3, rotation: -10, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.4, ease: 'back.out(2.4)' }, 2.75);
        tl.fromTo('#f6-stickers .chip:nth-child(2)', { scale: 0.3, rotation: 10, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.4, ease: 'back.out(2.4)' }, 3.4);
"""

MOTION['07-offer'] = DRIFT.format(id='f7', d=5.5) + """
        tl.fromTo('#f7-card', { y: 160, rotation: 3, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, 0.15);
        [0.7, 1.6, 2.3, 3.0].forEach((at, i) => {
          tl.fromTo('#f7-card li:nth-child(' + (i + 1) + ')', { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }, at);
        });
        tl.fromTo('#f7-price', { scale: 0, rotation: -40 }, { scale: 1.12, rotation: -8, duration: 0.32, ease: 'power3.out' }, 3.9);
        tl.fromTo('#f7-price', { scale: 1.12 }, { scale: 1, duration: 0.3, ease: 'back.out(3)', immediateRender: false }, 4.22);
"""

MOTION['08-cta'] = DRIFT.format(id='f8', d=4.8) + """
        tl.fromTo('#f8-bg', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.5, ease: 'power3.inOut' }, 0);
        tl.fromTo('#f8-tile', { y: -200, rotation: -4, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.55, ease: 'expo.out' }, 0.2);
        tl.fromTo('#f8-url > div:nth-child(1)', { scale: 1.5, filter: 'blur(14px)', opacity: 0 }, { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 0.5, ease: 'power4.out' }, 1.25);
        tl.fromTo('#f8-url > div:nth-child(2)', { x: 300, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, 1.55);
        tl.fromTo('#f8-bio', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, 2.1);
        tl.fromTo('#f8-url', { scale: 1 }, { scale: 1.03, duration: 1.15, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 2.5);
        tl.fromTo('#f8-buy', { scale: 0.3, rotation: -12, opacity: 0 }, { scale: 1, rotation: -3, opacity: 1, duration: 0.4, ease: 'back.out(2.4)' }, 0.35);
"""
