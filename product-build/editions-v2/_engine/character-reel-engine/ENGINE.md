# Character Reel Engine

Write a short dialogue in one JSON file and get a finished vertical reel: two low-poly 3D
characters on a laptop keyboard, voiced, lip-synced, captioned, shot with named camera moves,
scored, and rendered to MP4. Everything runs on your own computer and costs nothing per video.

| Part | What does it | Cost |
|---|---|---|
| Characters and set | Code (three.js, MIT licence, included) | Free |
| Voices | Kokoro-82M text-to-speech, runs locally (Apache-2.0 model, downloaded on first use) | Free |
| Word timing for captions and lip sync | NVIDIA Parakeet speech recognition, runs locally through HyperFrames | Free |
| Music | Composed in code by `tools/music.py`, licence-free | Free |
| Render | HyperFrames (headless Chrome), on your machine | Free |

No camera, no animator, no video model and no paid API is involved.

### Premium voices (optional, paid)

Free voices are the default. To give a character a premium ElevenLabs voice instead, set its cast
entry to `"provider": "elevenlabs"`, `"voice": "<ElevenLabs voice id>"`, `"model": "eleven_v3"`, and
put `ELEVENLABS_API_KEY=...` in a `.env` file in the project folder (never commit it). With
`eleven_v3`, each line's `emotion` becomes an audio tag such as `[deadpan]` or `[whispers]`. Every
generated line uses characters from your own ElevenLabs account (a paid plan is needed for commercial
use); unchanged lines are cached and never re-generated. Free and premium characters can share an
episode.

## Install (once)

1. Node.js 20 or newer, and Python 3.10 or newer.
2. `python -m venv .venv`, activate it, then `pip install -r requirements.txt`.
3. `npx hyperframes@0.8.171 tts "hi"` downloads the Kokoro voice model into `~/.cache/hyperframes/tts`.
4. `npx hyperframes@0.8.171 browser ensure` downloads the Chrome used for rendering.

## Make an episode

1. Copy `episodes/ep01/` to `episodes/ep02/` and edit `episodes/ep02/script.json`.
2. With the virtual environment active: `python tools/episode.py ep02` (voice, time, score), then
   `python tools/episode.py ep02 --render` to write `renders/ep02.mp4`.
3. Batch: `python tools/episode.py --all --render` renders every `episodes/ep*/` folder in turn and
   logs each render time to `renders/batch-log.txt`.

Edit one line and run again: unchanged lines are reused, so only that line is re-voiced.

## script.json

```json
{
  "title": "Who animated us?",
  "cast": { "juno": { "name": "Juno", "voice": "af_heart", "speed": 1.0 },
            "pixel": { "name": "Pixel", "voice": "am_michael", "speed": 1.0 } },
  "lines": [
    { "id": "l01", "speaker": "juno", "emotion": "panicked", "text": "Pixel, the database is gone.",
      "say": "Pixel... the database is gone!", "camera": "crashZoomIn+handheld", "pause": 0.3 },
    { "id": "l02", "speaker": "pixel", "emotion": "calm", "text": "Breathe. We have backups.",
      "shot": "pixelECU", "eyes": "slit", "screen": "fix" }
  ],
  "panels": [ { "id": "fix", "title": "The fix", "rows": ["restore backup", "rotate keys"], "color": "#a8f0c6" } ],
  "endcard": { "kicker": "MADE ENTIRELY IN CODE", "title": "Your Show Name", "brand": "YOURSITE.COM" }
}
```

| Field | Meaning |
|---|---|
| `text` | What the captions show. About 100 words per episode in total keeps it under 50 seconds. |
| `say` | Optional spoken version: pauses (`...`), emphasis (`!`), spelled initials (`U P I`). Captions still show `text`. |
| `emotion` | Voice performance, eye shape and default camera move. `curious, excited, teasing, proud, panicked, shocked, frustrated, worried, deadpan, skeptical, smug, sarcastic, calm, realizing, relieved, warm, whisper, explaining`. |
| `camera` | Named move, combinable with `+`: `static, dollyIn, dollyOut, pushSlow, zoomIn, zoomOut, crashZoomIn, truckLeft, truckRight, sliderLeft, sliderRight, pedestalUp, pedestalDown, arcLeft, arcRight, orbitLeft, orbitRight, tiltUp, tiltDown, panLeft, panRight, whipIn, craneUp, handheld`. |
| `shot` | Base angle: `junoCU, pixelCU, pixelECU, junoCity, overhead, two, threeQ`, or `close-up-on:<word>` to cut to Pixel's extreme close-up on that word. The last line always pulls back to the wide end card. |
| `eyes` | Pixel's eyes for the line: `square, tall, slit, wide, angry, sad, bored, fond`. |
| `screen` | The id of a panel on the laptop screen to type out while the line is spoken (up to six panels). |
| `pause` | Seconds of silence after the line. Give the last line about 1.6 s so the end card can land. |

## Measured render time

On the machine this engine was built on (Windows 11 laptop, 1 worker, high quality), a 45-second
episode took 7 to 8 minutes to render, about ten seconds of rendering per second of video. Two
workers saved about 10 percent. Your times will differ with your hardware.

## Characters

`assets/cast.js` builds both characters from simple shapes: `buildJuno()` and
`buildBlocBlock({ color, legs, antenna })`. To make your own, copy one builder, change its shapes and
palette, and swap it in `assets/scene.js`. Keep characters original: no copies of existing mascots,
logos or real people.

## Files

- `index.html` page and captions; `assets/scene.js` set, shot plan, performance; `assets/camera-moves.js` camera vocabulary; `assets/cast.js` characters; `assets/vendor/` three.js.
- `tools/voices.py` + `tools/emotions.py` voice each line; `tools/assemble.py` builds the dialogue track and timing; `tools/words.py` word timing; `tools/music.py` music bed; `tools/episode.py` the whole pipeline per episode.
