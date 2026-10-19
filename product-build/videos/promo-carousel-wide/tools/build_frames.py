"""Write the eleven scenes of the 16:9 carousel promo (website version of ../promo-carousel).

Same script, voices, music, timing and element ids as the vertical promo, so tools/motion.py is
shared; only the layouts change for a 1920x1080 frame: text on one side, slides or the Juno and
Pixel clip on the other. Run from the promo-carousel-wide folder: python tools/build_frames.py
"""
from pathlib import Path

from motion import MOTION

INK, CREAM, YELLOW, MINT, PINK, BLUE, CORAL = '#0b0b0f', '#fffbf2', '#ffe14d', '#a8f0c6', '#f598f2', '#9dcbff', '#ff9f8e'

BASE = f"""
#root {{ position: absolute; inset: 0; overflow: hidden; background: {CREAM}; color: {INK}; font-family: 'Montserrat', sans-serif; }}
#root .dots {{ position: absolute; inset: -40px; opacity: 0.16; background-image: radial-gradient({INK} 2.4px, transparent 3px); background-size: 40px 40px; }}
#root .safe {{ position: absolute; left: 110px; right: 110px; top: 90px; bottom: 90px; display: flex; gap: 80px; align-items: center; }}
#root .colL {{ flex: none; width: 720px; display: flex; flex-direction: column; }}
#root .colR {{ flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }}
#root .tag {{ align-self: flex-start; display: inline-block; border: 5px solid {INK}; background: {YELLOW}; box-shadow: 7px 7px 0 {INK};
  padding: 10px 24px; font-size: 28px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }}
#root .huge {{ font-weight: 900; font-size: 120px; line-height: 0.92; letter-spacing: -0.035em; text-transform: uppercase; margin-top: 34px; }}
#root .mark {{ display: inline-block; background: {YELLOW}; padding: 0 16px; border: 6px solid {INK}; box-shadow: 10px 10px 0 {INK}; }}
#root .card {{ border: 6px solid {INK}; background: #fff; box-shadow: 14px 14px 0 {INK}; }}
#root .chip {{ display: inline-block; border: 4px solid {INK}; background: #fff; padding: 10px 22px; font-size: 34px; font-weight: 800; box-shadow: 5px 5px 0 {INK}; }}
#root .shot {{ display: block; border: 5px solid {INK}; box-shadow: 9px 9px 0 {INK}; background: #fff; }}
#root .note {{ font-size: 24px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #2b2b33; margin-top: 30px; }}
#root .lede {{ font-size: 40px; font-weight: 700; line-height: 1.25; margin-top: 34px; max-width: 900px; }}
#root .clipvid {{ position: absolute; left: 160px; top: 60px; width: 540px; height: 960px; object-fit: cover; border: 6px solid {INK}; box-shadow: 14px 14px 0 {INK}; background: {INK}; }}
#root .clipside {{ position: absolute; left: 820px; right: 110px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; }}
"""

SCENES = {}


def clip_scene(cid, start, dur, side):
    return dict(css='', body=f"""
<div class="dots"></div>
<video id="{cid}-video" class="clip clipvid" src="assets/footage/ad03.mp4" playsinline data-has-audio="true"
  data-start="0" data-duration="{dur:g}" data-media-start="{start:g}" data-volume="1"></video>
<div class="clipside">{side}</div>""")


SCENES['01-cold-open'] = clip_scene('c1', 0, 6.0, """
  <div id="c1-tag" class="tag">Juno &amp; Pixel · made in code</div>
  <div class="huge">From one brief</div><div class="huge" style="margin-top:10px"><span class="mark">to six slides.</span></div>
  <div class="lede">Carousel Studio + Carousel Workflow Kit</div>""")

slides = ''.join(f'<img class="shot" src="assets/slides/studio-{i}.webp" alt="">' for i in range(1, 7))
SCENES['02-proof'] = dict(css=f"""
#c2-grid {{ display: grid; grid-template-columns: repeat(3, 250px); gap: 28px; justify-content: end; }}
#c2-grid img {{ width: 250px; height: 312px; object-fit: cover; }}
""", body=f"""
<div class="dots"></div>
<div class="safe">
  <div class="colL"><div class="tag">A real carousel</div>
    <div id="c2-head" class="huge">Six slides. <span class="mark">One system.</span></div>
    <div id="c2-note" class="note">Example included in Carousel Studio 2.0</div></div>
  <div class="colR"><div id="c2-grid">{slides}</div></div>
</div>""")

SCENES['03-how'] = dict(css=f"""
#c3-list {{ display: flex; flex-direction: column; gap: 18px; }}
#c3-list .row {{ display: flex; align-items: center; gap: 24px; padding: 14px 24px; }}
#c3-list .num {{ flex: none; width: 76px; height: 76px; display: grid; place-items: center; border: 5px solid {INK}; font-size: 34px; font-weight: 900; }}
#c3-list .label {{ font-size: 36px; font-weight: 900; text-transform: uppercase; }}
#c3-list .sub {{ font-size: 26px; font-weight: 600; color: #2b2b33; margin-top: 4px; }}
""", body=f"""
<div class="dots"></div>
<div class="safe">
  <div class="colL"><div class="tag">12 staged prompts</div><div id="c3-head" class="huge">One brief in.</div>
    <div class="lede">Every step from the idea to six finished image prompts.</div></div>
  <div class="colR"><div id="c3-list">
    <div class="row card"><div class="num" style="background:{YELLOW}">01</div><div><div class="label">Brief</div><div class="sub">one reader, one job</div></div></div>
    <div class="row card"><div class="num" style="background:{MINT}">02</div><div><div class="label">References</div><div class="sub">studied like a designer</div></div></div>
    <div class="row card"><div class="num" style="background:{BLUE}">03</div><div><div class="label">Style lock</div><div class="sub">one system, not six layouts</div></div></div>
    <div class="row card"><div class="num" style="background:{PINK}">04</div><div><div class="label">Six image prompts</div><div class="sub">for your own image tool</div></div></div>
    <div class="row card"><div class="num" style="background:{CORAL}">05</div><div><div class="label">Review</div><div class="sub">the output, not the prompt</div></div></div>
  </div></div>
</div>""")

SCENES['04-cover'] = dict(css="""
#c4-cover { width: 600px; height: 750px; object-fit: cover; }
""", body="""
<div class="dots"></div>
<div class="safe">
  <div class="colL" style="width:640px;align-items:center"><img id="c4-cover" class="shot" src="assets/slides/studio-1.webp" alt=""></div>
  <div class="colR"><div class="tag">The cover's one job</div><div id="c4-head" class="huge"><span class="mark">Earn the swipe.</span></div>
    <div class="lede">The first slide gets its own lesson and prompt, because it decides whether anyone sees the other five.</div></div>
</div>""")

SCENES['05-checks'] = dict(css=f"""
#c5-card {{ padding: 30px 44px; }}
#c5-card li {{ list-style: none; display: flex; align-items: center; gap: 24px; font-size: 46px; font-weight: 800; padding: 18px 0; border-top: 4px solid {INK}; }}
#c5-card li:first-child {{ border-top: none; }}
#c5-card li b {{ flex: none; width: 56px; height: 56px; display: grid; place-items: center; border: 4px solid {INK}; background: {MINT}; font-size: 34px; }}
#c5-thumb {{ position: absolute; right: 120px; bottom: 90px; width: 240px; height: 300px; object-fit: cover; }}
""", body="""
<div class="dots"></div>
<div class="safe">
  <div class="colL"><div class="tag">Before it ships</div><div id="c5-head" class="huge">Then the checks.</div></div>
  <div class="colR" style="padding-right:200px"><ul id="c5-card" class="card"><li><b>✓</b>Quality checklist</li><li><b>✓</b>Caption</li><li><b>✓</b>Alt text</li><li><b>✓</b>Dated sources</li></ul></div>
</div>
<img id="c5-thumb" class="shot" src="assets/slides/studio-6.webp" alt="">""")

SCENES['06-every-day'] = clip_scene('c6', 6.5, 2.5, """
  <div class="huge">Every</div><div class="huge" style="margin-top:10px"><span class="mark">single day?</span></div>""")

SCENES['07-daily'] = dict(css=f"""
#c7-steps {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }}
#c7-steps .step {{ padding: 18px; }}
#c7-steps img {{ display: block; width: 100%; aspect-ratio: 4 / 5; object-fit: cover; border: 4px solid {INK}; }}
#c7-steps .label {{ font-size: 32px; font-weight: 900; text-transform: uppercase; line-height: 1.05; margin-top: 16px; }}
#c7-steps .sub {{ font-size: 22px; font-weight: 600; color: #2b2b33; margin-top: 6px; }}
""", body=f"""
<div class="dots"></div>
<div class="safe">
  <div class="colL" style="width:560px"><div class="tag">Carousel Workflow Kit</div><div id="c7-head" class="huge">Every day.</div>
    <div id="c7-note" class="note">Publishing needs your own Meta app and its review</div></div>
  <div class="colR"><div id="c7-steps">
    <div class="step card"><img src="assets/slides/flow-2.webp" alt=""><div class="label">Today's folder</div><div class="sub">brief, slides, caption</div></div>
    <div class="step card" style="background:{PINK}"><img src="assets/slides/flow-5.webp" alt=""><div class="label">You approve</div><div class="sub">nothing posts before that</div></div>
    <div class="step card"><img src="assets/slides/flow-6.webp" alt=""><div class="label">Official API</div><div class="sub">publishes to Instagram</div></div>
  </div></div>
</div>""")

SCENES['08-comments'] = dict(css=f"""
#c8-thread {{ display: flex; flex-direction: column; gap: 40px; }}
#c8-thread .bubble {{ max-width: 760px; padding: 28px 34px; font-size: 42px; font-weight: 700; line-height: 1.25; }}
#c8-thread .who {{ display: block; font-size: 24px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }}
#c8-reply {{ align-self: flex-end; background: {MINT}; }}
""", body="""
<div class="dots"></div>
<div class="safe">
  <div class="colL"><div class="tag">Comment to reply</div><div id="c8-head" class="huge">Say the word.</div>
    <div id="c8-note" class="note">Official Instagram API · your own app · sample conversation</div></div>
  <div class="colR"><div id="c8-thread">
    <div id="c8-comment" class="bubble card"><span class="who">Comment · @reader</span>GUIDE</div>
    <div id="c8-reply" class="bubble card"><span class="who">Private reply · you</span>Here's the guide you asked for.</div>
  </div></div>
</div>""")

SCENES['09-loop'] = dict(css="""
#c9-loop { display: flex; align-items: center; gap: 40px; margin-top: 70px; }
#c9-loop .chip { font-size: 56px; padding: 24px 40px; }
#c9-arrow { font-size: 110px; font-weight: 900; line-height: 1; }
""", body=f"""
<div class="dots"></div>
<div class="safe" style="flex-direction:column;justify-content:center;align-items:flex-start">
  <div class="tag">Close the loop</div>
  <div id="c9-head" class="huge">Results in. Brief out.</div>
  <div id="c9-loop"><span id="c9-a" class="chip" style="background:{BLUE}">Your own results</span><div id="c9-arrow">→</div><span id="c9-b" class="chip" style="background:{YELLOW}">Tomorrow's brief</span></div>
</div>""")

SCENES['10-offer'] = dict(css=f"""
#c10-cards {{ display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 40px; }}
#c10-cards .pack {{ padding: 0; }}
#c10-cards img {{ display: block; width: 100%; aspect-ratio: 2.15 / 1; object-fit: cover; object-position: center top; border-bottom: 6px solid {INK}; }}
#c10-cards .name {{ padding: 20px 28px; font-size: 40px; font-weight: 900; text-transform: uppercase; }}
#c10-buy {{ position: absolute; right: 70px; top: 70px; width: 260px; height: 260px; border-radius: 50%; background: {YELLOW};
  border: 6px solid {INK}; box-shadow: 10px 10px 0 {INK}; display: flex; flex-direction: column; align-items: center; justify-content: center; }}
#c10-buy div {{ font-size: 50px; font-weight: 900; line-height: 0.95; text-transform: uppercase; }}
""", body="""
<div class="dots"></div>
<div class="safe" style="flex-direction:column;align-items:stretch;justify-content:center;gap:0">
  <div class="tag">The two packs</div>
  <div id="c10-cards">
    <div id="c10-a" class="pack card"><img src="assets/slides/cover-studio.webp" alt=""><div class="name">Carousel Studio</div></div>
    <div id="c10-b" class="pack card"><img src="assets/slides/cover-flow.webp" alt=""><div class="name">Carousel Workflow Kit</div></div>
  </div>
</div>
<div id="c10-buy"><div>Buy it</div><div>now</div></div>""")

SCENES['11-cta'] = clip_scene('c11', 9.4, 5.0, """
  <div id="c11-buy" class="tag" style="background:#ff9f8e">Buy them now</div>
  <div class="huge">promptpack</div><div class="huge" style="margin-top:6px"><span class="mark">.tech</span></div>
  <div class="lede">Carousel Studio and Carousel Workflow Kit</div>""")

PAGE = """<!doctype html>
<html>
  <head><meta charset="UTF-8" /></head>
  <body>
    <template>
      <style>{base}{css}</style>
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
    for name, s in SCENES.items():
        cid = 'c' + name.split('-')[0].lstrip('0')
        body = s['body'].replace('<div class="dots"></div>', f'<div id="{cid}-dots" class="dots"></div>')
        motion = MOTION.get(name, '')
        if name in ('01-cold-open', '06-every-day', '11-cta'):
            motion += f"        tl.fromTo('#{cid}-dots', {{ x: 0, y: 0 }}, {{ x: -40, y: -40, duration: 5, ease: 'none' }}, 0);\n"
        (out / f'{name}.html').write_text(PAGE.format(base=BASE, css=s['css'], cid=cid, body=body, motion=motion), encoding='utf-8')
    print('wrote', len(SCENES), 'scenes')


if __name__ == '__main__':
    main()
