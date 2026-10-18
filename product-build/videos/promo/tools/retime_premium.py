"""One-off retime of scene lengths and entrances to the ElevenLabs narration's word timings
(transcribed from assets/voice/all-vo.wav). Run once from the promo folder."""
from pathlib import Path

def patch(path, pairs):
    p = Path(path)
    s = p.read_text(encoding='utf-8')
    for old, new in pairs:
        if s.count(old) != 1:
            raise SystemExit(f'{path}: expected one match for {old[:70]!r}, found {s.count(old)}')
        s = s.replace(old, new)
    p.write_text(s, encoding='utf-8')

patch('tools/motion.py', [
    # F2: "typed" at 2.78 s, "not filmed" at 3.9 s
    ("DRIFT.format(id='f2', d=4.1)", "DRIFT.format(id='f2', d=5.3)"),
    ("opacity: 1, duration: 0.5, ease: 'power4.out' }, 1.9);", "opacity: 1, duration: 0.5, ease: 'power4.out' }, 2.7);"),
    ("{ x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, 2.55);", "{ x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, 3.85);"),
    ("scale: 1.05, duration: 4.1, ease: 'sine.inOut' }, 0);", "scale: 1.05, duration: 5.3, ease: 'sine.inOut' }, 0);"),
    # F3: voices 2.88, times every word 3.76, picks every camera 5.36, renders 6.8
    ("DRIFT.format(id='f3', d=8.7)", "DRIFT.format(id='f3', d=8.6)"),
    ("[0.6, 2.6, 3.5, 4.5, 5.6].forEach", "[0.6, 2.85, 3.7, 5.3, 6.75].forEach"),
    ("stagger: 0.012 }, 2.85);", "stagger: 0.012 }, 3.0);"),
    ("stagger: 0.12 }, 3.75);", "stagger: 0.12 }, 3.9);"),
    ("stagger: 0.12 }, 4.75);", "stagger: 0.12 }, 5.5);"),
    ("stagger: 0.09 }, 5.85);", "stagger: 0.09 }, 7.0);"),
    # F4: computer 2.0, "Want premium" 3.78, "Plug in" 5.8
    ("DRIFT.format(id='f4', d=5.8)", "DRIFT.format(id='f4', d=8.3)"),
    ("tl.fromTo('#f4-note', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }, 1.2);",
     "tl.fromTo('#f4-premium', { y: 120, rotation: -3, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, 3.75);\n"
     "        tl.fromTo('#f4-premium small', { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }, 5.75);\n"
     "        tl.fromTo('#f4-note', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' }, 6.2);"),
    ("[2.85, 3.75, 4.3].forEach", "[2.0, 2.45, 2.9].forEach"),
    ("scale: 1.06, duration: 5.8, ease: 'sine.inOut' }, 0);", "scale: 1.06, duration: 8.3, ease: 'sine.inOut' }, 0);"),
    # F5: "24" at 1.88
    ("DRIFT.format(id='f5', d=4.6)", "DRIFT.format(id='f5', d=4.9)"),
    ("immediateRender: false, onUpdate: () => { n24.textContent = Math.round(c24.v); } }, 1.75);",
     "immediateRender: false, onUpdate: () => { n24.textContent = Math.round(c24.v); } }, 1.85);"),
    ("tl.fromTo(n24, { scale: 0.6 }, { scale: 1, duration: 0.8, ease: 'power2.out' }, 1.75);",
     "tl.fromTo(n24, { scale: 0.6 }, { scale: 1, duration: 0.8, ease: 'power2.out' }, 1.85);"),
    ("stagger: 0.08 }, 2.3);", "stagger: 0.08 }, 2.4);"),
    # F6: "No per-video fee" at 2.78
    ("DRIFT.format(id='f6', d=5.5)", "DRIFT.format(id='f6', d=5.1)"),
    ("ease: 'back.out(2.4)' }, 3.2);", "ease: 'back.out(2.4)' }, 2.75);"),
    ("ease: 'back.out(2.4)' }, 3.95);", "ease: 'back.out(2.4)' }, 3.4);"),
    # F7: engine 0.72, guide 1.6, episodes 2.32
    ("DRIFT.format(id='f7', d=5.2)", "DRIFT.format(id='f7', d=5.5)"),
    ("[0.8, 1.5, 2.2, 2.9].forEach", "[0.7, 1.6, 2.3, 3.0].forEach"),
    ("duration: 0.32, ease: 'power3.out' }, 3.6);", "duration: 0.32, ease: 'power3.out' }, 3.9);"),
    ("immediateRender: false }, 3.92);", "immediateRender: false }, 4.22);"),
    # F8: URL at 1.3
    ("DRIFT.format(id='f8', d=4.4)", "DRIFT.format(id='f8', d=4.8)"),
    ("duration: 0.5, ease: 'power4.out' }, 0.9);", "duration: 0.5, ease: 'power4.out' }, 1.25);"),
    ("{ x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, 1.25);", "{ x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, 1.55);"),
    ("ease: 'back.out(2)' }, 1.8);", "ease: 'back.out(2)' }, 2.1);"),
    ("scale: 1.03, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 2.2);",
     "scale: 1.03, duration: 1.15, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 2.5);"),
])

patch('tools/build_frames.py', [
    ("SCENES['02-typed'] = dict(dur=4.1,", "SCENES['02-typed'] = dict(dur=5.3,"),
    ("SCENES['03-steps'] = dict(dur=8.7,", "SCENES['03-steps'] = dict(dur=8.6,"),
    ("SCENES['04-free-voices'] = dict(dur=5.8,", "SCENES['04-free-voices'] = dict(dur=8.3,"),
    ("SCENES['05-craft'] = dict(dur=4.6,", "SCENES['05-craft'] = dict(dur=4.9,"),
    ('data-duration="4.6" data-media-start="4.5"', 'data-duration="4.9" data-media-start="4.5"'),
    ("SCENES['06-unlimited'] = dict(dur=5.5,", "SCENES['06-unlimited'] = dict(dur=5.1,"),
    ('data-duration="5.5" data-media-start="10"', 'data-duration="5.1" data-media-start="10"'),
    ('data-duration="5.5" data-media-start="7"', 'data-duration="5.1" data-media-start="7"'),
    ('data-duration="5.5" data-media-start="17"', 'data-duration="5.1" data-media-start="17"'),
    ("SCENES['07-offer'] = dict(dur=7.0,", "SCENES['07-offer'] = dict(dur=5.5,"),
    ("SCENES['08-cta'] = dict(dur=4.4,", "SCENES['08-cta'] = dict(dur=4.8,"),
    ('data-duration="4.4" data-media-start="42"', 'data-duration="4.8" data-media-start="41.4"'),
])

patch('tools/build_index.py', [
    ("SCENES = [('01-cold-open', 4.4), ('02-typed', 4.1), ('03-steps', 8.7), ('04-free-voices', 5.8),\n          ('05-craft', 4.6), ('06-unlimited', 5.5), ('07-offer', 5.2), ('08-cta', 4.4)]",
     "SCENES = [('01-cold-open', 4.4), ('02-typed', 5.3), ('03-steps', 8.6), ('04-free-voices', 8.3),\n          ('05-craft', 4.9), ('06-unlimited', 5.1), ('07-offer', 5.5), ('08-cta', 4.8)]"),
])
print('retimed')
