"""Write index.html for the carousel promo: eleven scenes back to back, Pixel's lines, music bed.

Run with the Kokoro venv's Python (needs soundfile): python tools/build_index.py
Scenes 01, 06 and 11 are moments of the engine clip ad03.mp4 and carry their own dialogue.
Re-run ../character-reel/tools/music.py and the audio carve after this.
"""
import soundfile

SCENES = [('01-cold-open', 6.0, None), ('02-proof', 4.0, 'f2'), ('03-how', 7.1, 'f3'), ('04-cover', 4.4, 'f4'),
          ('05-checks', 4.3, 'f5'), ('06-every-day', 2.5, None), ('07-daily', 9.9, 'f7'), ('08-comments', 4.8, 'f8'),
          ('09-loop', 3.8, 'f9'), ('10-offer', 4.7, 'f10'), ('11-cta', 5.0, None)]
VO_LEAD = 0.3

hosts, auds, start = '', '', 0.0
for name, dur, vo in SCENES:
    cid = 'c' + name.split('-')[0].lstrip('0')
    hosts += (f'      <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/frames/{name}.html" '
              f'data-start="{start:g}" data-duration="{dur:g}" data-track-index="0" data-width="1080" data-height="1920"></div>\n')
    if vo:
        length = soundfile.info(f'assets/voice/{vo}.wav').duration
        auds += (f'      <audio id="vo-{vo}" src="assets/voice/{vo}.wav" data-start="{round(start + VO_LEAD, 2):g}" '
                 f'data-duration="{length:.2f}" data-track-index="2" data-volume="1"></audio>\n')
    start = round(start + dur, 2)
total = start
music_start = SCENES[0][1]

html = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Carousel Studio + Workflow Kit | Promo</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #fffbf2; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: #fffbf2; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total:g}" data-width="1080" data-height="1920">
{hosts}{auds}      <audio id="music" src="assets/music/bed.wav" data-start="{music_start:g}" data-duration="{round(total - music_start, 2):g}" data-track-index="3" data-volume="0.15"></audio>
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
'''
open('index.html', 'w', encoding='utf-8').write(html)
open('timing.json', 'w', encoding='utf-8').write('{"duration": %g}\n' % total)
print(f'index.html: {len(SCENES)} scenes, {total:g}s')
