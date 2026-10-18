"""Write index.html: mount the eight scenes back to back, place Pixel's lines, add the music bed.

Run with the Kokoro venv's Python (needs soundfile): python tools/build_index.py
Each scene's voice-over starts 0.3 s into the scene. Re-run tools/carve after this.
"""
import soundfile

SCENES = [('01-cold-open', 4.4), ('02-typed', 5.3), ('03-steps', 8.6), ('04-free-voices', 8.3),
          ('05-craft', 4.9), ('06-unlimited', 5.1), ('07-offer', 5.5), ('08-cta', 4.8)]
VO_LEAD = 0.3

hosts, auds, start = '', '', 0.0
for name, dur in SCENES:
    cid = 'f' + name.split('-')[0].lstrip('0')
    hosts += (f'      <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/frames/{name}.html" '
              f'data-start="{start:g}" data-duration="{dur:g}" data-track-index="0" data-width="1080" data-height="1920"></div>\n')
    if cid != 'f1':
        vo = soundfile.info(f'assets/voice/{cid}.wav').duration
        auds += (f'      <audio id="vo-{cid}" src="assets/voice/{cid}.wav" data-start="{round(start + VO_LEAD, 2):g}" '
                 f'data-duration="{vo:.2f}" data-track-index="2" data-volume="1"></audio>\n')
    start = round(start + dur, 2)
total = start
music_start = SCENES[0][1]

html = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>Motion Briefs for Code | Launch promo</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #fffbf2; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: #fffbf2; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total:g}" data-width="1080" data-height="1920">
{hosts}{auds}      <audio id="music" src="assets/music/bed.wav" data-start="{music_start:g}" data-duration="{round(total - music_start, 2):g}" data-track-index="3" data-volume="0.16"></audio>
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
