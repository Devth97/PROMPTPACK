"""Per-scene GSAP motion for the carousel promo (scene-local seconds; Pixel's line starts 0.3 s in,
entrances sit on his transcribed words). Rules: kinetic-beat-slam (headlines), stagger reveals,
press-release-spring (stickers), sine drift (dot grid)."""

DRIFT = "        tl.fromTo('#{id}-dots', {{ x: 0, y: 0 }}, {{ x: -40, y: -40, duration: {d}, ease: 'none' }}, 0);\n"
POP = "        tl.fromTo('{sel}', {{ y: -40, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.45, ease: 'back.out(2)' }}, {at});\n"
HEAD = "        tl.fromTo('{sel}', {{ y: 90, rotation: 3, opacity: 0 }}, {{ y: 0, rotation: 0, opacity: 1, duration: 0.55, ease: 'circ.out' }}, {at});\n"
SLAM = "        tl.fromTo('{sel}', {{ scale: 1.5, filter: 'blur(14px)', opacity: 0 }}, {{ scale: 1, filter: 'blur(0px)', opacity: 1, duration: 0.5, ease: 'power4.out' }}, {at});\n"
SLIDE = "        tl.fromTo('{sel}', {{ x: -140, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }}, {at});\n"
STICKER = ("        tl.fromTo('{sel}', {{ scale: 0, rotation: -40 }}, {{ scale: 1.12, rotation: -8, duration: 0.32, ease: 'power3.out' }}, {at});\n"
           "        tl.fromTo('{sel}', {{ scale: 1.12 }}, {{ scale: 1, duration: 0.3, ease: 'back.out(3)', immediateRender: false }}, {at2});\n")

MOTION = {}
MOTION['01-cold-open'] = POP.format(sel='#c1-tag', at=0.3)

MOTION['02-proof'] = DRIFT.format(id='c2', d=4.0) + HEAD.format(sel='#c2-head', at=0.15) + """
        tl.fromTo('#c2-grid img', { y: 120, rotation: (i) => (i % 2 ? 6 : -6), opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.08 }, 1.0);
        tl.fromTo('#c2-note', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 2.2);
"""

MOTION['03-how'] = DRIFT.format(id='c3', d=7.1) + HEAD.format(sel='#c3-head', at=0.15) + ''.join(
    SLIDE.format(sel=f'#c3-list .row:nth-child({i + 1})', at=at) for i, at in enumerate([2.4, 2.9, 3.3, 4.85, 5.8]))

MOTION['04-cover'] = DRIFT.format(id='c4', d=4.4) + """
        tl.fromTo('#c4-cover', { y: -260, rotation: -6, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, 0.3);
""" + SLAM.format(sel='#c4-head .mark', at=2.45)

MOTION['05-checks'] = DRIFT.format(id='c5', d=4.3) + HEAD.format(sel='#c5-head', at=0.1) + """
        tl.fromTo('#c5-card', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, 0.45);
        tl.fromTo('#c5-thumb', { x: 300, rotation: 8 }, { x: 0, rotation: 4, duration: 0.55, ease: 'expo.out' }, 0.7);
""" + ''.join(
    f"        tl.fromTo('#c5-card li:nth-child({i + 1}) b', {{ scale: 0 }}, {{ scale: 1, duration: 0.3, ease: 'back.out(3)' }}, {at});\n"
    for i, at in enumerate([0.8, 1.6, 2.15, 3.2]))

MOTION['06-every-day'] = ''

MOTION['07-daily'] = DRIFT.format(id='c7', d=9.9) + SLAM.format(sel='#c7-head', at=0.3) + ''.join(
    SLIDE.format(sel=f'#c7-steps .step:nth-child({i + 1})', at=at) for i, at in enumerate([1.45, 3.85, 6.65])) + """
        tl.fromTo('#c7-note', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 7.4);
"""

MOTION['08-comments'] = DRIFT.format(id='c8', d=4.8) + HEAD.format(sel='#c8-head', at=0.1) + """
        tl.fromTo('#c8-comment', { x: -200, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, 0.4);
        tl.fromTo('#c8-reply', { x: 200, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, 2.0);
        tl.fromTo('#c8-note', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 3.3);
"""

MOTION['09-loop'] = DRIFT.format(id='c9', d=3.8) + HEAD.format(sel='#c9-head', at=0.1) + """
        tl.fromTo('#c9-a', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.4)' }, 0.9);
        tl.fromTo('#c9-arrow', { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }, 1.5);
        tl.fromTo('#c9-b', { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.4)' }, 2.1);
"""

MOTION['10-offer'] = DRIFT.format(id='c10', d=4.7) + """
        tl.fromTo('#c10-a', { x: -300, rotation: -3, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.55, ease: 'expo.out' }, 0.3);
        tl.fromTo('#c10-b', { x: 300, rotation: 3, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 0.55, ease: 'expo.out' }, 2.5);
""" + STICKER.format(sel='#c10-buy', at=3.55, at2=3.87)

MOTION['11-cta'] = POP.format(sel='#c11-buy', at=0.4)
