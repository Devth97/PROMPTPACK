"""Add word-level caption times to timing.json.

Usage (after tools/assemble.py):
    npx hyperframes transcribe assets/voice/dialogue.wav --model small.en
    python tools/words.py

Captions always use the script's own words and spelling. The transcript only supplies
timing: it is matched to the script word by word (difflib), so a misheard word such as
"Block" for "Bloc" still gets the right time. Script words the recogniser missed are
spread evenly between their matched neighbours. Every word is kept inside its own line.
"""
import difflib
import json
import re
from pathlib import Path

timing = json.loads(Path('timing.json').read_text(encoding='utf-8'))
heard = json.loads(Path('assets/voice/transcript.json').read_text(encoding='utf-8'))
heard = heard['words'] if isinstance(heard, dict) else heard

norm = lambda w: re.sub(r"[^a-z0-9']", '', w.lower())
script_words = [(i, w) for i, line in enumerate(timing['lines']) for w in line['text'].split()]
matcher = difflib.SequenceMatcher(a=[norm(w) for _, w in script_words], b=[norm(h['text']) for h in heard], autojunk=False)

times = [None] * len(script_words)
for tag, a0, a1, b0, b1 in matcher.get_opcodes():
    if tag == 'equal' or (tag == 'replace' and a1 - a0 == b1 - b0):
        for k in range(a1 - a0):
            times[a0 + k] = (heard[b0 + k]['start'], heard[b0 + k]['end'])

matched = sum(t is not None for t in times)
# Fill gaps evenly inside the surrounding known times (or the line window).
for i, line in enumerate(timing['lines']):
    idx = [k for k, (li, _) in enumerate(script_words) if li == i]
    lo, hi = line['start'], line['end']
    k = 0
    while k < len(idx):
        if times[idx[k]] is not None:
            k += 1
            continue
        j = k
        while j < len(idx) and times[idx[j]] is None:
            j += 1
        left = times[idx[k - 1]][1] if k > 0 else lo
        right = times[idx[j]][0] if j < len(idx) else hi
        step = max(right - left, 0.05) / (j - k)
        for n in range(k, j):
            times[idx[n]] = (left + (n - k) * step, left + (n - k + 1) * step)
        k = j
    words = []
    for k in idx:
        start, end = times[k]
        start = min(max(start, lo), hi)
        end = min(max(end, start + 0.04), hi + 0.15)
        words.append({'text': script_words[k][1], 'start': round(start, 3), 'end': round(end, 3)})
    line['words'] = words

Path('timing.json').write_text(json.dumps(timing) + '\n', encoding='utf-8')
# The scene imports timing as a module, so nothing is fetched at render time.
Path('timing.js').write_text('export default ' + json.dumps(timing) + ';\n', encoding='utf-8')
print(f'{matched}/{len(script_words)} script words matched to transcript timing; the rest interpolated')
