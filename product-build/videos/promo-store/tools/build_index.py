"""Write index.html for the carousel promo: eleven scenes back to back, Pixel's lines, music bed.

Run with the Kokoro venv's Python (needs soundfile): python tools/build_index.py
Scenes 01, 06 and 11 are moments of the engine clip ad03.mp4 and carry their own dialogue.
Re-run ../character-reel/tools/music.py and the audio carve after this.
"""
import soundfile

SCENES = [('01-open', 8.6, None), ('02-question', 2.3, 's2'), ('03-reels', 4.9, 's3'), ('04-carousels', 7.1, 's4'), ('05-websites', 6.6, 's5'),
          ('06-video', 5.5, 's6'), ('07-more', 5.9, 's7'), ('08-inside', 6.1, 's8'), ('09-how', 6.5, 's9'), ('10-close', 8.0, None)]
VO_LEAD = 0.3

hosts, auds, start = '', '', 0.0
for name, dur, vo in SCENES:
    cid = 's' + name.split('-')[0].lstrip('0')
    hosts += (f'      <div id="{cid}" data-composition-id="{cid}" data-composition-src="compositions/frames/{name}.html" '
              f'data-start="{start:g}" data-duration="{dur:g}" data-track-index="0" data-width="1920" data-height="1080"></div>\n')
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
    <meta name="viewport" content="width=1920, height=1080" />
    <title>PromptPack | Store promo (16:9)</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #fffbf2; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: #fffbf2; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{total:g}" data-width="1920" data-height="1080">
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
