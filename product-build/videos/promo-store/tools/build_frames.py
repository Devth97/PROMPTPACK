"""Write the ten scenes of the whole-store promo (16:9, dark kinetic style) with their motion.

Run from the promo-store folder: python tools/build_frames.py
Every visual is a real PromptPack asset (pack showcase slides, covers, the 3D website clip, the
Juno & Pixel reel wall); the hosts are the engine render ad04.mp4. Narration (Pixel) starts
0.3 s into each scene; entrances sit on his transcribed words.
"""
from pathlib import Path

INK, CREAM, YELLOW, MINT, PINK, BLUE, CORAL = '#0b0b0f', '#fffbf2', '#ffe14d', '#a8f0c6', '#f598f2', '#9dcbff', '#ff9f8e'
SITE = '#141219'

BASE = f"""
#root {{ position: absolute; inset: 0; overflow: hidden; background: {SITE}; color: {CREAM}; font-family: 'Montserrat', sans-serif; }}
#root .dots {{ position: absolute; inset: -40px; opacity: 0.12; background-image: radial-gradient({CREAM} 2px, transparent 2.6px); background-size: 40px 40px; }}
#root .glow {{ position: absolute; width: 900px; height: 900px; border-radius: 50%; filter: blur(140px); opacity: 0.22; }}
#root .huge {{ font-weight: 900; font-size: 190px; line-height: 0.86; letter-spacing: -0.045em; text-transform: uppercase; }}
#root .big {{ font-weight: 900; font-size: 120px; line-height: 0.9; letter-spacing: -0.035em; text-transform: uppercase; }}
#root .chip {{ display: inline-block; border: 4px solid {CREAM}; color: {INK}; padding: 10px 22px; font-size: 34px; font-weight: 900; box-shadow: 6px 6px 0 {INK}; }}
#root .tile {{ display: block; border: 5px solid {CREAM}; box-shadow: 12px 12px 0 rgba(0,0,0,0.6); background: {INK}; object-fit: cover; }}
#root .left {{ position: absolute; left: 120px; top: 0; bottom: 0; width: 760px; display: flex; flex-direction: column; justify-content: center; gap: 30px; }}
#root .right {{ position: absolute; right: 110px; top: 0; bottom: 0; width: 900px; display: flex; align-items: center; justify-content: center; }}
#root .clipvid {{ position: absolute; left: 150px; top: 60px; width: 540px; height: 960px; object-fit: cover; border: 6px solid {CREAM}; box-shadow: 14px 14px 0 rgba(0,0,0,0.6); background: {INK}; }}
#root .clipside {{ position: absolute; left: 810px; right: 110px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; gap: 26px; }}
"""

SCENES, MOTION = {}, {}
SLAM = "        tl.fromTo('{s}', {{ scale: 1.6, filter: 'blur(16px)', opacity: 0 }}, {{ scale: 1, filter: 'blur(0px)', opacity: 1, duration: 0.45, ease: 'power4.out' }}, {t});\n"
SNAP = "        tl.fromTo('{s}', {{ x: {x}, opacity: 0 }}, {{ x: 0, opacity: 1, duration: 0.42, ease: 'expo.out' }}, {t});\n"
RISE = "        tl.fromTo('{s}', {{ y: 140, rotation: {r}, opacity: 0 }}, {{ y: 0, rotation: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }}, {t});\n"
POP = "        tl.fromTo('{s}', {{ scale: 0.3, rotation: -8, opacity: 0 }}, {{ scale: 1, rotation: 0, opacity: 1, duration: 0.4, ease: 'back.out(2.4)' }}, {t});\n"
DRIFT = "        tl.fromTo('#{c}-dots', {{ x: 0, y: 0 }}, {{ x: -40, y: -40, duration: {d}, ease: 'none' }}, 0);\n        tl.fromTo('#{c}-glow', {{ scale: 0.9 }}, {{ scale: 1.15, duration: {d}, ease: 'sine.inOut' }}, 0);\n"


def bg(c, colour, x, y):
    return f'<div id="{c}-dots" class="dots"></div><div id="{c}-glow" class="glow" style="background:{colour};left:{x}px;top:{y}px"></div>'


def clip(c, start, dur):
    return f'<video id="{c}-video" class="clip clipvid" src="assets/media/ad04.mp4" playsinline data-has-audio="true" data-start="0" data-duration="{dur:g}" data-media-start="{start:g}" data-volume="1"></video>'


# 01 Cold open: Juno asks, Pixel answers ("A shelf of AI kits" lands at ~3.8 s)
SCENES['01-open'] = (8.6, f"""{bg('s1', PINK, 900, 100)}{clip('s1', 0, 8.6)}
<div class="clipside"><div id="s1-k" class="chip" style="background:{MINT};align-self:flex-start">Hosted by Juno &amp; Pixel</div>
<div id="s1-h" class="big">13 AI kits.</div><div id="s1-h2" class="big" style="color:{YELLOW}">One shelf.</div></div>""")
MOTION['01-open'] = DRIFT.format(c='s1', d=8.6) + SNAP.format(s='#s1-k', x=-80, t=0.4) + SLAM.format(s='#s1-h', t=3.9) + SLAM.format(s='#s1-h2', t=4.6)

# 02 The question, word by word
words = ['What', 'do', 'you', 'want', 'to', 'make?']
SCENES['02-question'] = (2.3, bg('s2', YELLOW, 500, 100) + '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center"><div class="huge" style="max-width:1600px">'
                          + ' '.join(f'<span id="s2-w{i}" style="display:inline-block{";color:" + YELLOW if w == "make?" else ""}">{w}</span>' for i, w in enumerate(words)) + '</div></div>')
MOTION['02-question'] = DRIFT.format(c='s2', d=2.3) + ''.join(SLAM.format(s=f'#s2-w{i}', t=t) for i, t in enumerate([0.3, 0.6, 0.76, 0.92, 1.08, 1.3]))

# 03 Reels
SCENES['03-reels'] = (4.9, f"""{bg('s3', PINK, -200, 200)}
<div class="left"><div id="s3-h" class="huge" style="color:{PINK}">Reels</div><div id="s3-c" class="chip" style="background:{PINK};align-self:flex-start">Juno &amp; Pixel</div>
<div id="s3-s" style="font-size:40px;font-weight:700">100 words in. A voiced 3D reel out.</div></div>
<div class="right"><video id="s3-v" class="clip tile" src="assets/media/juno-pixel-banner.mp4" muted playsinline data-start="0" data-duration="4.9" data-media-start="0" style="width:900px;height:506px"></video></div>""")
MOTION['03-reels'] = DRIFT.format(c='s3', d=4.9) + SLAM.format(s='#s3-h', t=0.3) + RISE.format(s='#s3-v', r=3, t=0.5) + POP.format(s='#s3-c', t=1.4) + SNAP.format(s='#s3-s', x=-60, t=2.6)

# 04 Carousels: six real slides, then the daily system
slides = ''.join(f'<img id="s4-i{i}" class="tile" src="assets/media/carousel-studio-{i}.webp" alt="" style="width:240px;height:300px">' for i in range(1, 7))
SCENES['04-carousels'] = (7.1, f"""{bg('s4', YELLOW, -200, 300)}
<div class="left"><div id="s4-h" class="huge" style="color:{YELLOW};font-size:128px">Carousels</div>
<div id="s4-c1" class="chip" style="background:{YELLOW};align-self:flex-start">Carousel Studio</div>
<div id="s4-c2" class="chip" style="background:{MINT};align-self:flex-start">+ post daily: Carousel Workflow Kit</div></div>
<div class="right"><div style="display:grid;grid-template-columns:repeat(3,240px);gap:26px">{slides}</div></div>""")
MOTION['04-carousels'] = (DRIFT.format(c='s4', d=7.1) + SLAM.format(s='#s4-h', t=0.3) + POP.format(s='#s4-c1', t=1.8) + POP.format(s='#s4-c2', t=4.5)
                          + "        tl.fromTo('#s4-i1, #s4-i2, #s4-i3, #s4-i4, #s4-i5, #s4-i6', { y: 160, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'expo.out', stagger: 0.08 }, 1.8);\n")

# 05 Websites
SCENES['05-websites'] = (6.6, f"""{bg('s5', BLUE, -200, 200)}
<div class="left"><div id="s5-h" class="huge" style="color:{BLUE};font-size:134px">Websites</div>
<div id="s5-c1" class="chip" style="background:{BLUE};align-self:flex-start">75+ Website Prompts</div>
<div id="s5-c2" class="chip" style="background:{CREAM};align-self:flex-start">3D landing pages</div></div>
<div class="right"><video id="s5-v" class="clip tile" src="assets/media/hero1.mp4" muted playsinline data-start="0" data-duration="6.6" data-media-start="0" style="width:900px;height:506px"></video></div>""")
MOTION['05-websites'] = DRIFT.format(c='s5', d=6.6) + SLAM.format(s='#s5-h', t=0.3) + RISE.format(s='#s5-v', r=-3, t=0.5) + POP.format(s='#s5-c1', t=1.7) + POP.format(s='#s5-c2', t=3.4)

# 06 Video kits, one word each
vid = [('Video ads', CORAL, 'ugc-ad-scripts-1'), ('Explainers', MINT, 'short-explainer-studio-1'), ('B-roll', BLUE, 'video-prompt-vault-1'), ('Lyric videos', PINK, 'lyric-visuals-1'), ('Directed shots', YELLOW, 'ai-video-direction-1')]
SCENES['06-video'] = (5.5, bg('s6', CORAL, 900, 300) + '<div class="left" style="gap:6px">' + ''.join(f'<div id="s6-w{i}" class="big" style="font-size:96px;color:{c}">{w}</div>' for i, (w, c, _) in enumerate(vid))
                      + f'<div id="s6-c" class="chip" style="background:{CREAM};align-self:flex-start;margin-top:20px">A kit for each</div></div>'
                      + '<div class="right"><div style="display:grid;grid-template-columns:repeat(3,250px);gap:24px">' + ''.join(f'<img id="s6-i{i}" class="tile" src="assets/media/{img}.webp" alt="" style="width:250px;height:312px">' for i, (_, _, img) in enumerate(vid)) + '</div></div>')
MOTION['06-video'] = DRIFT.format(c='s6', d=5.5) + ''.join(SNAP.format(s=f'#s6-w{i}', x=-120, t=t) + RISE.format(s=f'#s6-i{i}', r=4 if i % 2 else -4, t=t + 0.05) for i, t in enumerate([0.3, 1.15, 1.8, 2.65, 3.2])) + POP.format(s='#s6-c', t=3.7)

# 07 And more: icons, YouTube, money
more = [('Pixel icons', YELLOW, 'pixel-brand-kit-1', 'width:250px;height:312px'), ('YouTube plans', CORAL, 'youtube-production-1', 'width:420px;height:236px'), ('Money', MINT, 'money-audit', 'width:420px;height:280px')]
SCENES['07-more'] = (5.9, bg('s7', MINT, -200, 300) + '<div class="left" style="gap:10px"><div id="s7-k" class="chip" style="background:' + CREAM + ';align-self:flex-start;margin-bottom:14px">And more</div>'
                     + ''.join(f'<div id="s7-w{i}" class="big" style="font-size:110px;color:{c}">{w}</div>' for i, (w, c, _, _) in enumerate(more))
                     + '<div id="s7-s" style="font-size:36px;font-weight:700;margin-top:16px">Find the subscriptions you forgot.</div></div>'
                     + '<div class="right" style="gap:30px;flex-wrap:wrap;align-content:center">' + ''.join(f'<img id="s7-i{i}" class="tile" src="assets/media/{img}.webp" alt="" style="{st}">' for i, (_, _, img, st) in enumerate(more)) + '</div>')
MOTION['07-more'] = DRIFT.format(c='s7', d=5.9) + POP.format(s='#s7-k', t=0.2) + ''.join(SNAP.format(s=f'#s7-w{i}', x=-120, t=t) + RISE.format(s=f'#s7-i{i}', r=-4 if i % 2 else 4, t=t + 0.05) for i, t in enumerate([0.5, 1.6, 3.1])) + SNAP.format(s='#s7-s', x=-60, t=3.6)

# 08 Inside every kit: real counts
stats = [('13', 'kits', YELLOW), ('186', 'guide pages', PINK), ('271', 'editable prompts', MINT)]
SCENES['08-inside'] = (6.1, bg('s8', YELLOW, 500, 200) + f'<div style="position:absolute;left:120px;right:120px;top:150px;display:flex;flex-direction:column;gap:30px"><div id="s8-k" class="chip" style="background:{CREAM};align-self:flex-start">Inside every kit</div>'
                       + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:20px">' + ''.join(f'<div id="s8-s{i}"><div id="s8-n{i}" style="font-size:230px;font-weight:900;line-height:0.85;letter-spacing:-0.05em;color:{c}">0</div><div style="font-size:44px;font-weight:900;text-transform:uppercase">{l}</div></div>' for i, (n, l, c) in enumerate(stats)) + '</div>'
                       + '<div id="s8-l" style="font-size:44px;font-weight:700;margin-top:30px">An illustrated guide · the exact prompts · real examples</div></div>')
MOTION['08-inside'] = DRIFT.format(c='s8', d=6.1) + POP.format(s='#s8-k', t=0.2) + ''.join(
    f"        const c{i} = {{ v: 0 }}; tl.fromTo(c{i}, {{ v: 0 }}, {{ v: {n}, duration: 0.9, ease: 'power2.out', immediateRender: {'true' if i == 0 else 'false'}, onUpdate: () => {{ document.getElementById('s8-n{i}').textContent = Math.round(c{i}.v); }} }}, {t});\n" + RISE.format(s=f'#s8-s{i}', r=0, t=t)
    for i, ((n, _, _), t) in enumerate(zip(stats, [0.5, 1.5, 3.3]))) + SNAP.format(s='#s8-l', x=-60, t=4.2)

# 09 How it works
steps = [('Pick', YELLOW, 'one kit', 0.3), ('Pay once', PINK, 'UPI · cards · netbanking', 0.9), ('Make it', MINT, 'with your own AI tool', 3.4)]
SCENES['09-how'] = (6.5, bg('s9', PINK, 600, 300) + '<div style="position:absolute;left:120px;right:120px;top:0;bottom:0;display:grid;grid-template-columns:repeat(3,1fr);gap:50px;align-items:center">'
                    + ''.join(f'<div id="s9-s{i}"><div style="font-size:30px;font-weight:900;opacity:0.7">0{i + 1}</div><div class="big" style="color:{c};font-size:130px">{w}</div><div style="font-size:34px;font-weight:700;margin-top:18px">{sub}</div></div>' for i, (w, c, sub, _) in enumerate(steps))
                    + f'</div><div id="s9-d" class="chip" style="position:absolute;left:120px;bottom:120px;background:{CREAM}">Instant download</div>')
MOTION['09-how'] = DRIFT.format(c='s9', d=6.5) + ''.join(SLAM.format(s=f'#s9-s{i}', t=t) for i, (_, _, _, t) in enumerate(steps)) + POP.format(s='#s9-d', t=1.9)

# 10 Close: Juno and Pixel, then the URL
SCENES['10-close'] = (8.0, f"""{bg('s10', YELLOW, 900, 100)}{clip('s10', 9.1, 8.0)}
<div class="clipside"><div id="s10-k" class="chip" style="background:{PINK};align-self:flex-start">Find your kit</div>
<div id="s10-u" class="big" style="font-size:130px">promptpack</div><div id="s10-u2" class="big" style="font-size:130px;color:{YELLOW}">.tech</div>
<div id="s10-s" style="font-size:36px;font-weight:700">13 AI kits for reels, carousels, websites and more</div></div>""")
MOTION['10-close'] = DRIFT.format(c='s10', d=8.0) + POP.format(s='#s10-k', t=3.6) + SLAM.format(s='#s10-u', t=3.9) + SLAM.format(s='#s10-u2', t=4.3) + SNAP.format(s='#s10-s', x=-60, t=5.0)

PAGE = """<!doctype html>
<html>
  <head><meta charset="UTF-8" /></head>
  <body>
    <template>
      <style>{base}</style>
      <div id="root" data-composition-id="{cid}" data-width="1920" data-height="1080">{body}</div>
      <script>
        const tl = gsap.timeline({{ paused: true }});
{motion}
        window.__timelines["{cid}"] = tl;
      </script>
    </template>
  </body>
</html>
"""


def main():
    out = Path('compositions/frames')
    out.mkdir(parents=True, exist_ok=True)
    for name, (dur, body) in SCENES.items():
        cid = 's' + name.split('-')[0].lstrip('0')
        (out / f'{name}.html').write_text(PAGE.format(base=BASE, cid=cid, body=body, motion=MOTION.get(name, '')), encoding='utf-8')
    print('wrote', len(SCENES), 'scenes,', round(sum(d for d, _ in SCENES.values()), 2), 's')


if __name__ == '__main__':
    main()
