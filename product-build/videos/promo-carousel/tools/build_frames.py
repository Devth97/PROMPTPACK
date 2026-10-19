"""Write the eleven carousel-promo scenes as HyperFrames sub-compositions.

Run from the promo-carousel folder: python tools/build_frames.py
Shares the PromptPack brand treatment of the launch promo (../promo). Scene motion lives in
tools/motion.py. Every image is a real asset from the two packs (example slides, workflow
screens, product covers); the three character moments are the engine render ad03.mp4.
"""
from pathlib import Path

from motion import MOTION

INK, CREAM, YELLOW, MINT, PINK, BLUE, CORAL = '#0b0b0f', '#fffbf2', '#ffe14d', '#a8f0c6', '#f598f2', '#9dcbff', '#ff9f8e'

BASE = f"""
#root {{ position: absolute; inset: 0; overflow: hidden; background: {CREAM}; color: {INK}; font-family: 'Montserrat', sans-serif; }}
#root .dots {{ position: absolute; inset: -40px; opacity: 0.16;
  background-image: radial-gradient({INK} 2.4px, transparent 3px); background-size: 40px 40px; }}
#root .safe {{ position: absolute; left: 72px; right: 72px; top: 230px; bottom: 330px; display: flex; flex-direction: column; }}
#root .tag {{ align-self: flex-start; display: inline-block; border: 5px solid {INK}; background: {YELLOW};
  box-shadow: 7px 7px 0 {INK}; padding: 12px 26px; font-size: 32px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }}
#root .huge {{ font-weight: 900; font-size: 150px; line-height: 0.9; letter-spacing: -0.035em; text-transform: uppercase; }}
#root .mark {{ display: inline-block; background: {YELLOW}; padding: 0 18px; border: 6px solid {INK}; box-shadow: 10px 10px 0 {INK}; }}
#root .card {{ border: 6px solid {INK}; background: #fff; box-shadow: 14px 14px 0 {INK}; }}
#root .chip {{ display: inline-block; border: 4px solid {INK}; background: #fff; padding: 10px 22px; font-size: 34px; font-weight: 800; box-shadow: 5px 5px 0 {INK}; }}
#root .shot {{ display: block; border: 5px solid {INK}; box-shadow: 9px 9px 0 {INK}; background: #fff; }}
#root .note {{ font-size: 28px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #2b2b33; }}
#root .clipvid {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
"""

SCENES = {}

def clip_scene(cid, start, dur, tag):
    return dict(css=f"#{cid}-tag {{ position: absolute; left: 72px; top: 230px; }}", body=f"""
<video id="{cid}-video" class="clip clipvid" src="assets/footage/ad03.mp4" playsinline data-has-audio="true"
  data-start="0" data-duration="{dur:g}" data-media-start="{start:g}" data-volume="1"></video>
{f'<div id="{cid}-tag" class="tag">{tag}</div>' if tag else ''}""")

SCENES['01-cold-open'] = clip_scene('c1', 0, 6.0, 'Juno &amp; Pixel · made in code')

slides = ''.join(f'<img class="shot" src="assets/slides/studio-{i}.webp" alt="">' for i in range(1, 7))
SCENES['02-proof'] = dict(css=f"""
#c2-head {{ margin-top: 40px; font-size: 120px; }}
#c2-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; margin-top: 56px; }}
#c2-grid img {{ width: 100%; aspect-ratio: 4 / 5; object-fit: cover; }}
#c2-note {{ margin-top: auto; }}
""", body=f"""
<div class="dots"></div>
<div class="safe">
  <div class="tag">A real carousel</div>
  <div id="c2-head" class="huge">Six slides. <span class="mark">One system.</span></div>
  <div id="c2-grid">{slides}</div>
  <div id="c2-note" class="note">Example included in Carousel Studio 2.0</div>
</div>""")

SCENES['03-how'] = dict(css=f"""
#c3-head {{ margin: 34px 0 34px; font-size: 112px; }}
#c3-list {{ display: flex; flex-direction: column; gap: 22px; flex: 1; }}
#c3-list .row {{ display: flex; align-items: center; gap: 26px; padding: 20px 26px; flex: 1; min-height: 0; }}
#c3-list .num {{ flex: none; width: 100px; height: 100px; display: grid; place-items: center; border: 5px solid {INK}; font-size: 44px; font-weight: 900; }}
#c3-list .label {{ font-size: 42px; font-weight: 900; text-transform: uppercase; }}
#c3-list .sub {{ font-size: 30px; font-weight: 600; color: #2b2b33; margin-top: 6px; }}
""", body=f"""
<div class="dots"></div>
<div class="safe">
  <div class="tag">12 staged prompts</div>
  <div id="c3-head" class="huge">One brief in.</div>
  <div id="c3-list">
    <div class="row card"><div class="num" style="background:{YELLOW}">01</div><div><div class="label">Brief</div><div class="sub">one reader, one job</div></div></div>
    <div class="row card"><div class="num" style="background:{MINT}">02</div><div><div class="label">References</div><div class="sub">studied like a designer</div></div></div>
    <div class="row card"><div class="num" style="background:{BLUE}">03</div><div><div class="label">Style lock</div><div class="sub">one system, not six layouts</div></div></div>
    <div class="row card"><div class="num" style="background:{PINK}">04</div><div><div class="label">Six image prompts</div><div class="sub">for your own image tool</div></div></div>
    <div class="row card"><div class="num" style="background:{CORAL}">05</div><div><div class="label">Review</div><div class="sub">the output, not the prompt</div></div></div>
  </div>
</div>""")

SCENES['04-cover'] = dict(css=f"""
#c4-cover {{ width: 600px; height: 750px; object-fit: cover; align-self: center; margin-top: 50px; }}
#c4-head {{ margin-top: auto; font-size: 150px; text-align: center; }}
""", body="""
<div class="dots"></div>
<div class="safe">
  <div class="tag">The cover's one job</div>
  <img id="c4-cover" class="shot" src="assets/slides/studio-1.webp" alt="">
  <div id="c4-head" class="huge"><span class="mark">Earn the swipe.</span></div>
</div>""")

SCENES['05-checks'] = dict(css=f"""
#c5-head {{ margin-top: 40px; font-size: 130px; }}
#c5-card {{ margin-top: 56px; padding: 40px 48px; }}
#c5-card li {{ list-style: none; display: flex; align-items: center; gap: 26px; font-size: 54px; font-weight: 800; padding: 22px 0; border-top: 4px solid {INK}; }}
#c5-card li:first-child {{ border-top: none; }}
#c5-card li b {{ flex: none; width: 64px; height: 64px; display: grid; place-items: center; border: 4px solid {INK}; background: {MINT}; font-size: 40px; }}
#c5-thumb {{ position: absolute; right: 70px; bottom: 360px; width: 280px; height: 350px; object-fit: cover; }}
""", body="""
<div class="dots"></div>
<div class="safe">
  <div class="tag">Before it ships</div>
  <div id="c5-head" class="huge">Then the checks.</div>
  <ul id="c5-card" class="card"><li><b>✓</b>Quality checklist</li><li><b>✓</b>Caption</li><li><b>✓</b>Alt text</li><li><b>✓</b>Dated sources</li></ul>
</div>
<img id="c5-thumb" class="shot" src="assets/slides/studio-6.webp" alt="">""")

SCENES['06-every-day'] = clip_scene('c6', 6.5, 2.5, '')

SCENES['07-daily'] = dict(css=f"""
#c7-head {{ margin-top: 40px; font-size: 140px; }}
#c7-steps {{ display: flex; flex-direction: column; gap: 30px; margin-top: 50px; }}
#c7-steps .step {{ display: flex; align-items: center; gap: 30px; padding: 22px 26px; }}
#c7-steps img {{ flex: none; width: 200px; height: 250px; object-fit: cover; border: 4px solid {INK}; }}
#c7-steps .label {{ font-size: 50px; font-weight: 900; text-transform: uppercase; line-height: 1.05; }}
#c7-steps .sub {{ font-size: 30px; font-weight: 600; color: #2b2b33; margin-top: 10px; }}
#c7-note {{ margin-top: auto; }}
""", body=f"""
<div class="dots"></div>
<div class="safe">
  <div class="tag">Carousel Workflow Kit</div>
  <div id="c7-head" class="huge">Every day.</div>
  <div id="c7-steps">
    <div class="step card"><img src="assets/slides/flow-2.webp" alt=""><div><div class="label">Today's folder</div><div class="sub">brief, slides, caption</div></div></div>
    <div class="step card" style="background:{PINK}"><img src="assets/slides/flow-5.webp" alt=""><div><div class="label">You approve</div><div class="sub">nothing posts before that</div></div></div>
    <div class="step card"><img src="assets/slides/flow-6.webp" alt=""><div><div class="label">Official API</div><div class="sub">publishes to Instagram</div></div></div>
  </div>
  <div id="c7-note" class="note">Publishing needs your own Meta app and its review</div>
</div>""")

SCENES['08-comments'] = dict(css=f"""
#c8-head {{ margin-top: 40px; font-size: 128px; }}
#c8-thread {{ margin-top: 70px; display: flex; flex-direction: column; gap: 40px; }}
#c8-thread .bubble {{ max-width: 760px; padding: 30px 36px; font-size: 44px; font-weight: 700; line-height: 1.25; }}
#c8-thread .who {{ display: block; font-size: 28px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 10px; }}
#c8-reply {{ align-self: flex-end; background: {MINT}; }}
#c8-note {{ margin-top: auto; }}
""", body="""
<div class="dots"></div>
<div class="safe">
  <div class="tag">Comment to reply</div>
  <div id="c8-head" class="huge">Say the word.</div>
  <div id="c8-thread">
    <div id="c8-comment" class="bubble card"><span class="who">Comment · @reader</span>GUIDE</div>
    <div id="c8-reply" class="bubble card"><span class="who">Private reply · you</span>Here's the guide you asked for.</div>
  </div>
  <div id="c8-note" class="note">Official Instagram API · your own app · sample conversation</div>
</div>""")

SCENES['09-loop'] = dict(css=f"""
#c9-head {{ margin-top: 40px; font-size: 128px; }}
#c9-loop {{ margin: auto 0; display: flex; flex-direction: column; align-items: center; gap: 30px; }}
#c9-loop .chip {{ font-size: 64px; padding: 26px 46px; }}
#c9-arrow {{ font-size: 120px; font-weight: 900; line-height: 1; }}
#c9-shot {{ width: 420px; height: 525px; object-fit: cover; align-self: center; margin-top: auto; }}
""", body=f"""
<div class="dots"></div>
<div class="safe">
  <div class="tag">Close the loop</div>
  <div id="c9-head" class="huge">Results in. Brief out.</div>
  <div id="c9-loop">
    <span id="c9-a" class="chip" style="background:{BLUE}">Your own results</span>
    <div id="c9-arrow">↓</div>
    <span id="c9-b" class="chip" style="background:{YELLOW}">Tomorrow's brief</span>
  </div>
</div>""")

SCENES['10-offer'] = dict(css=f"""
#c10-cards {{ display: flex; flex-direction: column; gap: 46px; margin-top: 56px; }}
#c10-cards .pack {{ padding: 0; position: relative; }}
#c10-cards img {{ display: block; width: 100%; aspect-ratio: 2.15 / 1; object-fit: cover; object-position: center top; border-bottom: 6px solid {INK}; }}
#c10-cards .name {{ padding: 22px 30px; font-size: 46px; font-weight: 900; text-transform: uppercase; }}
#c10-buy {{ position: absolute; right: 40px; bottom: 640px; width: 300px; height: 300px; border-radius: 50%; background: {YELLOW};
  border: 6px solid {INK}; box-shadow: 10px 10px 0 {INK}; display: flex; flex-direction: column; align-items: center; justify-content: center; }}
#c10-buy div {{ font-size: 58px; font-weight: 900; line-height: 0.95; text-transform: uppercase; }}
""", body="""
<div class="dots"></div>
<div class="safe">
  <div class="tag">The two packs</div>
  <div id="c10-cards">
    <div id="c10-a" class="pack card"><img src="assets/slides/cover-studio.webp" alt=""><div class="name">Carousel Studio</div></div>
    <div id="c10-b" class="pack card"><img src="assets/slides/cover-flow.webp" alt=""><div class="name">Carousel Workflow Kit</div></div>
  </div>
</div>
<div id="c10-buy"><div>Buy it</div><div>now</div></div>""")

SCENES['11-cta'] = clip_scene('c11', 9.4, 5.0, '')
SCENES['11-cta']['body'] += '\n<div id="c11-buy" class="tag" style="position:absolute;left:72px;top:230px;background:#ff9f8e">Buy them now</div>'

PAGE = """<!doctype html>
<html>
  <head><meta charset="UTF-8" /></head>
  <body>
    <template>
      <style>{base}{css}</style>
      <div id="root" data-composition-id="{cid}" data-width="1080" data-height="1920">{body}</div>
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
        (out / f'{name}.html').write_text(PAGE.format(base=BASE, css=s['css'], cid=cid, body=body, motion=MOTION.get(name, '')), encoding='utf-8')
    print('wrote', len(SCENES), 'scenes')


if __name__ == '__main__':
    main()
