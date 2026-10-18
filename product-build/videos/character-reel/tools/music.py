"""Write an original, licence-free music bed in code: a soft lo-fi chord loop with a light beat.

Usage (after tools/assemble.py, so the length matches the dialogue):
    python tools/music.py            -> assets/music/bed.wav

Deterministic: the same timing.json always produces the same file. Mix it quietly under the
voices (the composition plays it around 0.16 volume and ducks it further while anyone speaks).
"""
import json
from pathlib import Path

import numpy as np
import soundfile

RATE, BPM = 44100, 88
timing = json.loads(Path('timing.json').read_text(encoding='utf-8'))
length = timing['duration'] + 0.5
n = int(length * RATE)
t = np.arange(n) / RATE
beat = 60 / BPM
bar = beat * 4
rng = np.random.default_rng(7)  # seeded: the hats' noise is identical on every run

def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)

# Fmaj7 - Em7 - Dm7 - Cmaj7, one chord per bar
chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]
pad = np.zeros(n)
for b in range(int(length / bar) + 1):
    start, end = int(b * bar * RATE), min(n, int((b + 1) * bar * RATE))
    if start >= n:
        break
    seg = t[start:end] - b * bar
    env = np.minimum(1, seg / 0.35) * np.minimum(1, (bar - seg) / 0.5)
    for m in chords[b % 4]:
        f = midi(m)
        tone = np.sin(2 * np.pi * f * seg) + 0.35 * np.sin(2 * np.pi * 2 * f * seg + 0.3) + 0.12 * np.sin(2 * np.pi * 3 * f * seg)
        pad[start:end] += tone * env * 0.06
    # bass on the root, one octave down, on beats 1 and 3
    root = midi(chords[b % 4][0] - 12)
    for k in (0, 2):
        bs = start + int(k * beat * RATE)
        be = min(n, bs + int(beat * 0.9 * RATE))
        if bs < n:
            s = t[bs:be] - t[bs]
            pad[bs:be] += np.sin(2 * np.pi * root * s) * np.exp(-s * 4) * 0.22

drums = np.zeros(n)
steps = int(length / (beat / 2)) + 1
for i in range(steps):
    pos = int(i * beat / 2 * RATE)
    if pos >= n:
        break
    if i % 8 in (0, 5):  # kick
        s = np.arange(min(int(0.35 * RATE), n - pos)) / RATE
        drums[pos:pos + len(s)] += np.sin(2 * np.pi * (55 + 90 * np.exp(-s * 30)) * s) * np.exp(-s * 9) * 0.5
    if i % 8 == 4:  # soft snare/clap
        s = np.arange(min(int(0.2 * RATE), n - pos)) / RATE
        drums[pos:pos + len(s)] += rng.standard_normal(len(s)) * np.exp(-s * 22) * 0.12
    s = np.arange(min(int(0.05 * RATE), n - pos)) / RATE  # hat on every eighth
    drums[pos:pos + len(s)] += rng.standard_normal(len(s)) * np.exp(-s * 90) * (0.05 if i % 2 else 0.03)

# Gentle low-pass "warmth": one-pole filter over the drums
alpha = 0.35
for i in range(1, n):
    drums[i] = drums[i - 1] + alpha * (drums[i] - drums[i - 1])

mix = pad + drums
fade = np.minimum(1, t / 1.0) * np.minimum(1, (length - t) / 1.5)
mix = mix * fade
mix = mix / max(1e-6, np.max(np.abs(mix))) * 0.8
Path('assets/music').mkdir(parents=True, exist_ok=True)
soundfile.write('assets/music/bed.wav', np.stack([mix, mix], axis=1).astype('float32'), RATE)
print(f'assets/music/bed.wav: {length:.1f}s at {BPM} BPM')
