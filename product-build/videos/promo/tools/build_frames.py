"""Write the eight promo scenes as HyperFrames sub-compositions (shared brand CSS + per-scene body).

Run from the promo folder: python tools/build_frames.py
Scene motion lives in each scene's MOTION string; layouts are the confirmed storyboard stills.
"""
from pathlib import Path

INK, CREAM, YELLOW, MINT, PINK, BLUE, CORAL = '#0b0b0f', '#fffbf2', '#ffe14d', '#a8f0c6', '#f598f2', '#9dcbff', '#ff9f8e'
WAVE = [0.1, 0.29, 1.0, 0.43, 0.14, 0.28, 0.23, 0.42, 0.83, 0.64, 0.52, 0.33, 0.1, 0.01, 0.0, 0.01, 0.02, 0.83, 0.83, 0.25, 0.16, 0.64, 0.7, 0.79, 0.94, 0.91, 0.98, 0.88, 0.48, 0.44, 0.3, 0.41, 0.12, 0.39, 0.3, 0.19, 0.15, 0.16, 0.2, 0.17, 0.14, 0.02, 0.0, 0.0]

BASE = f"""
#root {{ position: absolute; inset: 0; overflow: hidden; background: {CREAM}; color: {INK};
  font-family: 'Montserrat', sans-serif; }}
#root .dots {{ position: absolute; inset: -40px; opacity: 0.16;
  background-image: radial-gradient({INK} 2.4px, transparent 3px); background-size: 40px 40px; }}
#root .ghost {{ position: absolute; font-weight: 900; line-height: 0.8; letter-spacing: -0.04em; white-space: nowrap; }}
#root .safe {{ position: absolute; left: 72px; right: 72px; top: 230px; bottom: 330px; display: flex; flex-direction: column; }}
#root .tag {{ align-self: flex-start; display: inline-block; border: 5px solid {INK}; background: {YELLOW};
  box-shadow: 7px 7px 0 {INK}; padding: 12px 26px; font-size: 32px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }}
#root .huge {{ font-weight: 900; font-size: 168px; line-height: 0.9; letter-spacing: -0.035em; text-transform: uppercase; }}
#root .mark {{ display: inline-block; background: {YELLOW}; padding: 0 18px; border: 6px solid {INK}; box-shadow: 10px 10px 0 {INK}; }}
#root .card {{ border: 6px solid {INK}; background: #fff; box-shadow: 14px 14px 0 {INK}; }}
#root .chip {{ display: inline-block; border: 4px solid {INK}; background: #fff; padding: 10px 22px; font-size: 34px; font-weight: 800;
  box-shadow: 5px 5px 0 {INK}; margin: 0 14px 18px 0; }}
#root .mono {{ font-family: 'JetBrains Mono', monospace; }}
#root .tile {{ border: 6px solid {INK}; box-shadow: 12px 12px 0 {INK}; background: {INK}; overflow: hidden; position: relative; }}
#root .tile video {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
"""

SCENES = {}

SCENES['01-cold-open'] = dict(dur=4.4, css=f"""
#f1-video {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
#f1-tag {{ position: absolute; left: 72px; top: 230px; }}
""", body="""
<video id="f1-video" class="clip" src="assets/footage/ep01-v2.mp4" playsinline data-has-audio="true"
  data-start="0" data-duration="4.4" data-media-start="0" data-volume="1"></video>
<div id="f1-tag" class="tag">Episode 01 · made in code</div>
""")

SCENES['02-typed'] = dict(dur=5.3, css=f"""
#f2-ghost {{ right: -60px; top: 1180px; font-size: 520px; color: {CORAL}; opacity: 0.22; }}
#f2-code {{ background: {INK}; color: {CREAM}; padding: 56px 56px; font-size: 46px; line-height: 1.55; margin-top: 56px; }}
#f2-code .c {{ color: #8b8796; }} #f2-code .k {{ color: {PINK}; }} #f2-code .s {{ color: {MINT}; }} #f2-code .y {{ color: {YELLOW}; }}
#f2-head {{ margin-top: auto; font-size: 210px; }}
#f2-head .line {{ display: block; }}
#f2-head .line + .line {{ margin-top: 26px; }}
""", body="""
<div class="dots"></div>
<div id="f2-ghost" class="ghost mono" aria-hidden="true" data-layout-allow-overlap>{ }</div>
<div class="safe">
  <div class="tag">What you just watched</div>
  <div id="f2-code" class="card mono">
    <div class="c">// assets/scene.js</div>
    <div><span class="k">const</span> juno = <span class="y">buildJuno</span>();</div>
    <div><span class="k">const</span> pixel = <span class="y">buildBlocBlock</span>({</div>
    <div>&nbsp;&nbsp;color: PALETTE.pixel,</div>
    <div>&nbsp;&nbsp;legs: <span class="s">4</span>, antenna: <span class="s">true</span>,</div>
    <div>});</div>
  </div>
  <div id="f2-head" class="huge"><span class="line"><span class="mark">Typed,</span></span><span class="line">not filmed.</span></div>
</div>
""")

wave_bars = ''.join(f'<i style="height:{max(6, round(a * 120))}px"></i>' for a in WAVE)
SCENES['03-steps'] = dict(dur=8.6, css=f"""
#f3-title {{ font-size: 108px; margin: 34px 0 34px; }}
#f3-list {{ display: flex; flex-direction: column; gap: 26px; flex: 1; }}
#f3-list .row {{ display: flex; align-items: center; gap: 28px; padding: 22px 28px; flex: 1; min-height: 0; }}
#f3-list .num {{ flex: none; width: 112px; height: 112px; display: grid; place-items: center; border: 5px solid {INK};
  font-size: 50px; font-weight: 900; }}
#f3-list .body {{ flex: 1; min-width: 0; }}
#f3-list .label {{ font-size: 42px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 10px; }}
#f3-list .snip {{ font-size: 28px; line-height: 1.35; color: #2b2b33; white-space: nowrap; }}
#f3-wave {{ display: flex; align-items: center; gap: 5px; height: 124px; }}
#f3-wave i {{ display: block; width: 9px; background: {INK}; border-radius: 2px; }}
#f3-words span {{ display: inline-block; border: 3px solid {INK}; padding: 4px 12px; margin-right: 8px; font-size: 26px; font-weight: 800; background: {BLUE}; }}
#f3-moves span {{ display: inline-block; border: 3px solid {INK}; padding: 4px 12px; margin-right: 8px; font-size: 26px; font-weight: 800; background: {PINK}; }}
#f3-strip {{ display: flex; gap: 10px; }}
#f3-strip img {{ width: 72px; height: 128px; object-fit: cover; border: 3px solid {INK}; display: block; }}
""", body=f"""
<div class="dots"></div>
<div class="safe">
  <div class="tag">How a reel is made</div>
  <div id="f3-title" class="huge">100 words in.</div>
  <div id="f3-list">
    <div class="row card"><div class="num" style="background:{YELLOW}">01</div><div class="body"><div class="label">Script</div>
      <div class="snip mono"><div>"emotion": "deadpan",</div><div>"text": "Nobody. We're code."</div></div></div></div>
    <div class="row card"><div class="num" style="background:{MINT}">02</div><div class="body"><div class="label">Voices</div>
      <div id="f3-wave">{wave_bars}</div></div></div>
    <div class="row card"><div class="num" style="background:{BLUE}">03</div><div class="body"><div class="label">Every word timed</div>
      <div id="f3-words"><span>Pixel 0.50s</span><span>Who 1.04s</span><span>animated 1.28s</span></div></div></div>
    <div class="row card"><div class="num" style="background:{PINK}">04</div><div class="body"><div class="label">A camera per line</div>
      <div id="f3-moves"><span>crashZoomIn</span><span>whipIn</span><span>pushSlow</span></div></div></div>
    <div class="row card"><div class="num" style="background:{CORAL}">05</div><div class="body"><div class="label">Rendered reel</div>
      <div id="f3-strip"><img src="assets/stills/strip-1.png" alt=""><img src="assets/stills/strip-2.png" alt=""><img src="assets/stills/strip-3.png" alt=""><img src="assets/stills/strip-4.png" alt=""><img src="assets/stills/strip-5.png" alt=""></div></div></div>
  </div>
</div>
""")

SCENES['04-free-voices'] = dict(dur=8.3, css=f"""
#f4-bg {{ position: absolute; inset: 0; background: {MINT}; }}
#f4-ghost {{ right: -30px; top: 1000px; font-size: 640px; color: #fff; opacity: 0.55; }}
#f4-head {{ margin-top: 80px; font-size: 220px; }}
#f4-head .line {{ display: block; }}
#f4-chips {{ margin-top: 90px; max-width: 760px; }}
#f4-chips .chip {{ position: relative; font-size: 44px; padding: 14px 28px; }}
#f4-premium {{ margin-top: 40px; padding: 34px 40px; background: {PINK}; font-size: 50px; font-weight: 900; line-height: 1.15; max-width: 900px; }}
#f4-premium small {{ display: block; font-size: 34px; font-weight: 700; margin-top: 10px; }}
#f4-note {{ margin-top: auto; font-size: 28px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #2b2b33; }}
""", body="""
<div id="f4-bg"></div>
<div class="dots"></div>
<div id="f4-ghost" class="ghost" aria-hidden="true" data-layout-allow-overlap>₹0</div>
<div class="safe">
  <div class="tag">Built in</div>
  <div id="f4-head" class="huge"><span class="line">Free</span><span class="line"><span class="mark">voices.</span></span></div>
  <div id="f4-chips"><span class="chip">✓ runs on your computer</span><span class="chip">✓ no API key</span><span class="chip">✓ no voice bill</span></div>
  <div id="f4-premium" class="card">Want premium voices?<small>Plug in your own ElevenLabs key.</small></div>
  <div id="f4-note">This narration: ElevenLabs premium voice</div>
</div>
""")

SCENES['05-craft'] = dict(dur=4.9, css=f"""
#f5-top, #f5-bottom {{ display: flex; gap: 36px; align-items: flex-start; }}
#f5-top {{ margin-top: 44px; }}
#f5-bottom {{ margin-top: 60px; flex: 1; min-height: 0; }}
#root .num5 {{ font-weight: 900; font-size: 250px; line-height: 0.82; letter-spacing: -0.05em; }}
#root .lbl5 {{ font-size: 50px; font-weight: 900; text-transform: uppercase; margin: 10px 0 22px; }}
#root .col5 {{ flex: 1; min-width: 0; }}
#root .chips5 .chip {{ font-size: 30px; padding: 8px 18px; }}
#f5-tile {{ flex: none; width: 360px; height: 640px; }}
""", body=f"""
<div class="dots"></div>
<div class="safe">
  <div class="tag">Directed, not dumped</div>
  <div id="f5-top"><div class="col5"><div class="num5">0</div><div class="lbl5">emotions</div>
    <div class="chips5"><span class="chip" style="background:{YELLOW}">panicked</span><span class="chip">deadpan</span><span class="chip" style="background:{PINK}">smug</span><span class="chip">whisper</span><span class="chip" style="background:{MINT}">shocked</span></div></div></div>
  <div id="f5-bottom"><div class="col5"><div class="num5">0</div><div class="lbl5">camera moves</div>
    <div class="chips5"><span class="chip" style="background:{BLUE}">crash zoom</span><span class="chip">whip pan</span><span class="chip" style="background:{CORAL}">orbit</span><span class="chip">handheld</span></div></div>
    <div id="f5-tile" class="tile"><video id="f5-video" class="clip" src="assets/footage/ep01-v2.mp4" muted playsinline data-start="0" data-duration="4.9" data-media-start="4.5"></video></div></div>
</div>
""")

SCENES['06-unlimited'] = dict(dur=5.1, css=f"""
#f6-head {{ margin-top: 40px; font-size: 140px; }}
#f6-grid {{ display: flex; gap: 26px; margin-top: 60px; }}
#f6-grid .tile {{ flex: 1; height: 720px; }}
#f6-stickers {{ margin-top: auto; }}
#f6-stickers .chip {{ font-size: 42px; background: {YELLOW}; }}
""", body="""
<div class="dots"></div>
<div class="safe">
  <div class="tag">Your computer, your reels</div>
  <div id="f6-head" class="huge">As many as you like.</div>
  <div id="f6-grid">
    <div class="tile"><video id="f6-v1" class="clip" src="assets/footage/ep01-v2.mp4" muted playsinline data-start="0" data-duration="5.1" data-media-start="10"></video></div>
    <div class="tile"><video id="f6-v2" class="clip" src="assets/footage/ad01.mp4" muted playsinline data-start="0" data-duration="5.1" data-media-start="7"></video></div>
    <div class="tile"><video id="f6-v3" class="clip" src="assets/footage/ad02.mp4" muted playsinline data-start="0" data-duration="5.1" data-media-start="17"></video></div>
  </div>
  <div id="f6-stickers"><span class="chip">no per-video fee</span><span class="chip">no watermark</span></div>
</div>
""")

SCENES['07-offer'] = dict(dur=5.5, css=f"""
#f7-card {{ margin-top: 56px; padding: 64px 56px 150px; position: relative; }}
#f7-card .kicker {{ font-size: 30px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; color: #2b2b33; }}
#f7-card .title {{ font-size: 138px; font-weight: 900; line-height: 0.9; letter-spacing: -0.03em; text-transform: uppercase; margin: 18px 0 44px; }}
#f7-card ul {{ list-style: none; }}
#f7-card li {{ display: flex; align-items: center; gap: 26px; font-size: 50px; font-weight: 800; padding: 26px 0; border-top: 4px solid {INK}; }}
#f7-card li b {{ flex: none; width: 56px; height: 56px; display: grid; place-items: center; border: 4px solid {INK}; background: {MINT}; font-size: 36px; }}
#f7-price {{ position: absolute; right: -30px; bottom: -120px; width: 330px; height: 330px; border-radius: 50%;
  background: {YELLOW}; border: 6px solid {INK}; box-shadow: 10px 10px 0 {INK}; display: flex; flex-direction: column;
  align-items: center; justify-content: center; }}
#f7-price .buy {{ font-size: 62px; font-weight: 900; line-height: 0.95; letter-spacing: -0.02em; text-transform: uppercase; text-align: center; }}
""", body="""
<div class="dots"></div>
<div class="safe">
  <div class="tag">The pack</div>
  <div id="f7-card" class="card">
    <div class="kicker">PromptPack · Edition 2</div>
    <div class="title">Motion Briefs for Code</div>
    <ul>
      <li><b>✓</b>The engine, ready to run</li>
      <li><b>✓</b>The step-by-step guide</li>
      <li><b>✓</b>Ready-to-render episodes</li>
      <li><b>✓</b>Character + voice kit</li>
    </ul>
    <div id="f7-price"><div class="buy">Buy it</div><div class="buy">now</div></div>
  </div>
</div>
""")

SCENES['08-cta'] = dict(dur=4.8, css=f"""
#f8-bg {{ position: absolute; inset: 0; background: {YELLOW}; }}
#f8-tile {{ width: 470px; height: 836px; align-self: center; margin-top: 10px; }}
#f8-buy {{ align-self: center; margin-top: auto; background: {CORAL}; font-size: 44px; }}
#f8-url {{ margin-top: 34px; font-weight: 900; font-size: 116px; line-height: 1; letter-spacing: -0.04em; text-transform: uppercase; text-align: center; }}
#f8-bio {{ align-self: center; margin-top: 30px; background: #fff; }}
""", body="""
<div id="f8-bg"></div>
<div class="dots"></div>
<div class="safe">
  <div id="f8-tile" class="tile"><video id="f8-video" class="clip" src="assets/footage/ep01-v2.mp4" muted playsinline data-start="0" data-duration="4.8" data-media-start="41.4"></video></div>
  <div id="f8-buy" class="tag">Buy it now</div>
  <div id="f8-url"><div>promptpack</div><div>.tech</div></div>
  <div id="f8-bio" class="tag">link in bio</div>
</div>
""")

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

from motion import MOTION


def main():
    out = Path('compositions/frames')
    out.mkdir(parents=True, exist_ok=True)
    for name, s in SCENES.items():
        cid = 'f' + name.split('-')[0].lstrip('0')
        # Each scene's dot grid gets its own id so its timeline drifts only that scene's dots
        body = s['body'].replace('<div class="dots"></div>', f'<div id="{cid}-dots" class="dots"></div>')
        (out / f'{name}.html').write_text(PAGE.format(base=BASE, css=s['css'], cid=cid, body=body, motion=MOTION.get(name, '')), encoding='utf-8')
    print('wrote', len(SCENES), 'scenes')


if __name__ == '__main__':
    main()
