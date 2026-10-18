"""Optional premium voices through ElevenLabs (paid, your own account). The free local Kokoro
voices stay the default; a cast member switches by setting "provider": "elevenlabs".

    "cast": { "pixel": { "name": "Pixel", "provider": "elevenlabs", "voice": "<ElevenLabs voice id>",
                         "model": "eleven_v3", "speed": 1.0 } }

The key is read from the ELEVENLABS_API_KEY environment variable, or from a `.env` or
`.env.elevenlabs` file in the project folder or any folder above it (one line:
ELEVENLABS_API_KEY=...). Never commit that file. Each generated line uses your ElevenLabs
characters; cached lines are not re-generated.

With eleven_v3 the line's emotion becomes an audio tag such as [deadpan] or [whispers];
a "say" text can carry its own tags, which are then used as written.
"""
import json
import os
import urllib.error
import urllib.request
from pathlib import Path

import numpy as np

RATE = 24000
TAGS = {
    'curious': 'curious', 'excited': 'excited', 'teasing': 'playfully', 'proud': 'proudly',
    'panicked': 'panicked', 'shocked': 'shocked', 'frustrated': 'frustrated', 'worried': 'nervously',
    'deadpan': 'deadpan', 'skeptical': 'skeptical', 'smug': 'smugly', 'sarcastic': 'sarcastic',
    'calm': 'calmly', 'realizing': 'thoughtfully', 'relieved': 'relieved', 'warm': 'warmly',
    'whisper': 'whispers',
}


def api_key():
    if os.environ.get('ELEVENLABS_API_KEY'):
        return os.environ['ELEVENLABS_API_KEY'].strip()
    here = Path.cwd().resolve()
    for folder in [here, *here.parents]:
        for name in ('.env', '.env.elevenlabs'):
            f = folder / name
            if f.is_file():
                for row in f.read_text(encoding='utf-8').splitlines():
                    if row.startswith('ELEVENLABS_API_KEY='):
                        return row.split('=', 1)[1].strip()
    raise SystemExit('ElevenLabs voice requested but no ELEVENLABS_API_KEY found (environment, .env or .env.elevenlabs).')


def spoken_text(line, model):
    text = line.get('say') or line['text']
    tag = TAGS.get(line.get('emotion') or '')
    if model == 'eleven_v3' and tag and not text.lstrip().startswith('['):
        text = f'[{tag}] {text}'
    return text


def perform(line, actor):
    """Voice one line with ElevenLabs. Returns (samples, rate, spoken text)."""
    model = actor.get('model', 'eleven_v3')
    text = spoken_text(line, model)
    body = {'text': text, 'model_id': model}
    if model != 'eleven_v3' and actor.get('speed'):
        body['voice_settings'] = {'speed': float(actor['speed'])}
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{actor['voice']}?output_format=pcm_{RATE}",
        data=json.dumps(body).encode(), method='POST',
        headers={'xi-api-key': api_key(), 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=120) as res:
            pcm = res.read()
    except urllib.error.HTTPError as err:
        raise SystemExit(f"ElevenLabs refused line {line['id']}: {err.code} {err.read()[:300].decode(errors='replace')}")
    samples = np.frombuffer(pcm, dtype='<i2').astype(np.float32) / 32768
    return samples, RATE, text
