"""Emotion presets for Kokoro voices.

Kokoro has no emotion control, so each emotion is a small "performance" built from what it
does respond to:

  speed   delivery pace (1.0 = the actor's normal pace; the actor's own speed multiplies it)
  pitch   semitones up or down, applied after synthesis (tempo is kept)
  blend   (voice, weight): mixes another Kokoro voice into the actor's voice for that colour,
          e.g. af_bella adds brightness and energy, am_onyx adds weight
  gain    dB applied to the line
  pause   sentence and clause pauses inside the line, in seconds
  punct   'excite' turns full stops into exclamation marks; 'hesitate' turns the first
          comma into an ellipsis

A line can also carry its own "say" text in script.json (for example "So... I'm a function.")
to shape delivery by hand. Captions always show the line's "text"; "say" is only spoken.
"""
import numpy as np

NEUTRAL = {'speed': 1.0, 'pitch': 0.0, 'blend': None, 'gain': 0.0, 'pause': (0.25, 0.1), 'punct': None}

PRESETS = {
    # bright, rising
    'curious':    {'speed': 1.0,  'pitch': 0.8,  'blend': ('af_bella', 0.2)},
    'excited':    {'speed': 1.12, 'pitch': 1.6,  'blend': ('af_bella', 0.35), 'gain': 1.5, 'punct': 'excite', 'pause': (0.15, 0.06)},
    'teasing':    {'speed': 1.05, 'pitch': 1.0,  'blend': ('af_bella', 0.3)},
    'proud':      {'speed': 0.97, 'pitch': 0.5,  'blend': ('am_puck', 0.2), 'gain': 1.0},
    # high-stress, fast
    'panicked':   {'speed': 1.18, 'pitch': 2.2,  'blend': ('af_bella', 0.4), 'gain': 2.0, 'punct': 'excite', 'pause': (0.1, 0.04)},
    'shocked':    {'speed': 1.08, 'pitch': 2.0,  'blend': ('af_bella', 0.35), 'gain': 2.0, 'punct': 'excite', 'pause': (0.35, 0.12)},
    'frustrated': {'speed': 1.08, 'pitch': 0.6,  'blend': ('af_kore', 0.3), 'gain': 1.5, 'punct': 'excite'},
    'worried':    {'speed': 1.04, 'pitch': 1.0,  'blend': ('af_nicole', 0.25), 'gain': -1.0, 'punct': 'hesitate'},
    # slow, low
    'deadpan':    {'speed': 0.9,  'pitch': -1.0, 'blend': ('am_onyx', 0.25), 'pause': (0.4, 0.15)},
    'skeptical':  {'speed': 0.92, 'pitch': -0.4, 'pause': (0.35, 0.14)},
    'smug':       {'speed': 0.94, 'pitch': -0.5, 'blend': ('am_puck', 0.3), 'pause': (0.35, 0.12)},
    'sarcastic':  {'speed': 0.92, 'pitch': -0.6, 'blend': ('am_puck', 0.25), 'pause': (0.4, 0.15)},
    'calm':       {'speed': 0.95, 'pitch': -0.3, 'blend': ('am_echo', 0.15), 'pause': (0.3, 0.12)},
    'realizing':  {'speed': 0.9,  'pitch': -0.2, 'pause': (0.45, 0.2), 'punct': 'hesitate'},
    'relieved':   {'speed': 0.93, 'pitch': 0.2,  'blend': ('af_nicole', 0.15), 'pause': (0.35, 0.14)},
    'warm':       {'speed': 0.95, 'pitch': 0.3,  'blend': ('am_echo', 0.2)},
    'whisper':    {'speed': 0.95, 'pitch': 0.0,  'blend': ('af_nicole', 0.6), 'gain': -4.0},
    'explaining': {},
}


def preset(emotion):
    p = dict(NEUTRAL)
    p.update(PRESETS.get(emotion or '', {}))
    return p


def spoken_text(line, p):
    text = line.get('say') or line['text']
    if line.get('say'):
        return text
    if p['punct'] == 'excite':
        text = text.replace('. ', '! ')
        if text.endswith('.'):
            text = text[:-1] + '!'
    elif p['punct'] == 'hesitate' and ',' in text:
        text = text.replace(',', '...', 1)
    return text


def voice_style(kokoro, voice, p):
    if not p['blend']:
        return voice
    other, w = p['blend']
    return (kokoro.get_voice_style(voice) * (1 - w) + kokoro.get_voice_style(other) * w).astype(np.float32)


def resample(x, factor):
    """Play x back `factor` times faster by linear interpolation (raises pitch and tempo together)."""
    n = int(round(len(x) / factor))
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)


def perform(kokoro, line, actor):
    """Voice one line with its emotion. Returns (samples, rate, spoken text)."""
    p = preset(line.get('emotion'))
    text = spoken_text(line, p)
    # A pitch shift by resampling also speeds the line up by the same factor,
    # so synthesis runs that much slower to keep the preset's pace.
    factor = 2 ** (p['pitch'] / 12)
    speed = float(actor['speed']) * p['speed'] / factor
    speed = min(max(speed, 0.5), 2.0)
    samples, rate = kokoro.create(text, voice=voice_style(kokoro, actor['voice'], p), speed=speed, lang='en-us',
                                  sentence_pause=p['pause'][0], clause_pause=p['pause'][1])
    if abs(factor - 1) > 1e-3:
        samples = resample(samples, factor)
    samples = samples * (10 ** (p['gain'] / 20))
    return np.clip(samples, -1, 1), rate, text
