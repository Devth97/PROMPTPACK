"""Voice every line of script.json with the local Kokoro-82M model (free, offline), or with
ElevenLabs for any cast member whose "provider" is "elevenlabs" (optional, paid; see
tools/elevenlabs.py).

Usage (from the project folder):
    python tools/voices.py

Needs: pip install kokoro-onnx soundfile
Model files: kokoro-v1.0.onnx and voices-v1.0.bin. By default they are read from the
HyperFrames cache (~/.cache/hyperframes/tts), which `npx hyperframes tts "hi"` fills once.
Set KOKORO_DIR to use another folder with models/kokoro-v1.0.onnx and voices/voices-v1.0.bin.

Each line is performed with its "emotion" (see tools/emotions.py: pace, pitch, voice blend,
energy and pauses) and may carry its own "say" text for hand-shaped delivery.
Lines whose text, emotion and actor have not changed are reused from assets/voice/, so
editing one line re-voices only that line. The model is loaded once for all lines.
"""
import hashlib
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from emotions import perform, preset

base = Path(os.environ.get('KOKORO_DIR', Path.home() / '.cache' / 'hyperframes' / 'tts'))
model, voices = base / 'models' / 'kokoro-v1.0.onnx', base / 'voices' / 'voices-v1.0.bin'
for f in (model, voices):
    if not f.exists():
        sys.exit(f'Missing {f}. Run `npx hyperframes tts "hi"` once to download the model, or set KOKORO_DIR.')

script = json.loads(Path('script.json').read_text(encoding='utf-8'))
out_dir = Path('assets/voice')
out_dir.mkdir(parents=True, exist_ok=True)
cache_path = out_dir / 'cache.json'
cache = json.loads(cache_path.read_text(encoding='utf-8')) if cache_path.exists() else {}

todo = []
for line in script['lines']:
    actor = script['cast'].get(line['speaker'])
    if not actor:
        sys.exit(f"Unknown speaker {line['speaker']!r} in {line['id']}")
    parts = [line['text'], line.get('say'), actor['voice'], actor['speed'], preset(line.get('emotion'))]
    if actor.get('provider'):
        # Premium voices: emotion is an audio tag, so the provider and model decide the take
        parts = [line['text'], line.get('say'), line.get('emotion'), actor['provider'], actor['voice'], actor.get('model')]
    key = hashlib.sha256(json.dumps(parts, sort_keys=True).encode()).hexdigest()[:16]
    target = out_dir / f"{line['id']}.wav"
    if cache.get(line['id']) == key and target.exists():
        print(f"{line['id']} cached")
    else:
        todo.append((line, actor, key, target))

if todo:
    import soundfile
    kokoro = None
    for line, actor, key, target in todo:
        if actor.get('provider') == 'elevenlabs':
            import elevenlabs
            samples, rate, spoken = elevenlabs.perform(line, actor)
        else:
            if kokoro is None:
                from kokoro_onnx import Kokoro
                kokoro = Kokoro(str(model), str(voices))
            samples, rate, spoken = perform(kokoro, line, actor)
        soundfile.write(str(target), samples, rate)
        cache[line['id']] = key
        cache_path.write_text(json.dumps(cache, indent=2) + '\n', encoding='utf-8')
        print(f"{line['id']} {actor['name']} ({line.get('emotion', 'neutral')}): {len(samples) / rate:.2f}s  {spoken}")
