"""Lay the voiced lines on one timeline and write the timing the scene animates from.

Usage (from the project folder, after tools/voices.py):
    python tools/assemble.py

Writes:
  assets/voice/dialogue.wav  one track with every line at its start time
  timing.json                per line: start, end, speaker, screen and shot cues;
                             per speaker: a loudness curve at the video frame rate
                             (drives mouths and eyes); total duration
Word-level caption times are added afterwards by tools/words.py.
"""
import json
from pathlib import Path

import numpy as np
import soundfile

FPS = 30
LEAD_IN = 0.5   # seconds of room tone before the first line
TAIL = 0.0      # extra hold after the last line's pause

script = json.loads(Path('script.json').read_text(encoding='utf-8'))
clips, rate = [], None
for line in script['lines']:
    audio, sr = soundfile.read(f"assets/voice/{line['id']}.wav", dtype='float32')
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    if rate is None:
        rate = sr
    elif sr != rate:
        raise SystemExit(f"{line['id']}: sample rate {sr} differs from {rate}")
    clips.append((line, audio))

cursor, placed = LEAD_IN, []
for line, audio in clips:
    start = cursor
    end = start + len(audio) / rate
    placed.append((line, audio, start, end))
    cursor = end + float(line.get('pause', 0.3))
duration = round(cursor + TAIL, 3)

total = np.zeros(int(np.ceil(duration * rate)) + 1, dtype='float32')
per_speaker = {name: np.zeros_like(total) for name in script['cast']}
for line, audio, start, end in placed:
    i = int(round(start * rate))
    total[i:i + len(audio)] += audio
    per_speaker[line['speaker']][i:i + len(audio)] += audio
soundfile.write('assets/voice/dialogue.wav', np.clip(total, -1, 1), rate)

def envelope(signal):
    """RMS loudness per video frame, normalised to 0..1 with a soft knee."""
    hop = rate // FPS
    frames = int(np.ceil(duration * FPS)) + 1
    values = np.zeros(frames, dtype='float32')
    for f in range(frames):
        chunk = signal[f * hop:(f + 1) * hop]
        values[f] = float(np.sqrt(np.mean(chunk ** 2))) if len(chunk) else 0.0
    peak = np.percentile(values[values > 0], 95) if np.any(values > 0) else 1.0
    return [round(float(v), 3) for v in np.clip(values / max(peak, 1e-6), 0, 1) ** 0.7]

timing = {
    'fps': FPS,
    'duration': duration,
    'lines': [
        {k: v for k, v in {
            'id': line['id'], 'speaker': line['speaker'], 'emotion': line.get('emotion'),
            'text': line['text'], 'start': round(start, 3), 'end': round(end, 3),
            'screen': line.get('screen'), 'shot': line.get('shot'), 'camera': line.get('camera'), 'eyes': line.get('eyes'),
        }.items() if v is not None}
        for line, audio, start, end in placed
    ],
    'loudness': {name: envelope(sig) for name, sig in per_speaker.items()},
    # Per-episode screen panels and end card (see script.json); the scene reads them from timing.js
    'panels': script.get('panels', []),
    'endcard': script.get('endcard'),
}
Path('timing.json').write_text(json.dumps(timing) + '\n', encoding='utf-8')
print(f"dialogue.wav + timing.json: {len(placed)} lines, {duration}s")
