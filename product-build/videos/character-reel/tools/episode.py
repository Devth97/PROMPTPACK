"""Build (and optionally render) episodes of the Juno and Pixel reel with the shared engine.

Usage (from the project folder, with the Kokoro venv's Python):
    python tools/episode.py ep02              voice, time and score episodes/ep02
    python tools/episode.py ep02 ep03 --render   ...then render each to renders/epNN.mp4
    python tools/episode.py --all --render       every episodes/ep*/ that has a script.json

Each episode is one file you write: episodes/epNN/script.json, in the same format as the root
script.json (cast, lines with speaker / emotion / text, optional say, camera, shot, screen,
plus "panels" for the laptop screen and "endcard"). This tool copies the engine (index.html,
assets/*.js, three.js) next to it, so the episode folder is a complete HyperFrames project:
  voices.py -> assemble.py -> transcribe -> words.py -> music.py -> set data-duration -> render
Lines already voiced are reused, so re-running after a one-line edit is quick.

Render needs HYPERFRAMES_BROWSER_PATH (the bundled chrome-headless-shell); it is set
automatically when tools/chrome-headless-shell-win64 exists beside the project.
"""
import json
import math
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / 'tools'
ENGINE = ['index.html', 'hyperframes.json', 'package.json', 'assets/scene.js', 'assets/cast.js',
          'assets/camera-moves.js', 'assets/vendor']
HF = 'hyperframes@0.8.171'
NPX = 'npx.cmd' if os.name == 'nt' else 'npx'
CHROME = ROOT.parent / 'tools' / 'chrome-headless-shell-win64' / 'chrome-headless-shell.exe'


def run(cmd, cwd, env=None):
    print('  $', ' '.join(str(c) for c in cmd))
    subprocess.run([str(c) for c in cmd], cwd=cwd, env=env, check=True)


def install_engine(ep_dir, script):
    for rel in ENGINE:
        src, dst = ROOT / rel, ep_dir / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        if src.is_dir():
            shutil.copytree(src, dst, dirs_exist_ok=True)
        else:
            shutil.copy2(src, dst)
    (ep_dir / 'meta.json').write_text(json.dumps({'id': f'character-reel-{ep_dir.name}', 'name': f'character-reel-{ep_dir.name}'}, indent=2) + '\n', encoding='utf-8')
    page = ep_dir / 'index.html'
    html = page.read_text(encoding='utf-8')
    title = script.get('title', ep_dir.name).replace('<', '').replace('>', '')
    page.write_text(re.sub(r'<title>.*?</title>', f'<title>{title} | Juno and Pixel</title>', html, count=1), encoding='utf-8')


def set_duration(ep_dir):
    # Same rule as scene.js: dialogue length rounded up to the next 0.05 s, with a 0.05 s tail.
    timing = json.loads((ep_dir / 'timing.json').read_text(encoding='utf-8'))
    duration = math.ceil((timing['duration'] + 0.05) * 20) / 20
    page = ep_dir / 'index.html'
    page.write_text(re.sub(r'data-duration="[0-9.]+"', f'data-duration="{duration:g}"', page.read_text(encoding='utf-8')), encoding='utf-8')
    return duration


def build(ep_dir, render):
    script = json.loads((ep_dir / 'script.json').read_text(encoding='utf-8'))
    print(f'\n== {ep_dir.name}: {script.get("title", "")} ({len(script["lines"])} lines)')
    install_engine(ep_dir, script)
    py = sys.executable
    run([py, TOOLS / 'voices.py'], ep_dir)
    run([py, TOOLS / 'assemble.py'], ep_dir)
    run([NPX, '--yes', HF, 'transcribe', 'assets/voice/dialogue.wav', '--model', 'small.en'], ep_dir)
    run([py, TOOLS / 'words.py'], ep_dir)
    run([py, TOOLS / 'music.py'], ep_dir)
    duration = set_duration(ep_dir)
    print(f'  duration {duration:g}s')
    if not render:
        return None
    env = dict(os.environ)
    if CHROME.exists():
        env.setdefault('HYPERFRAMES_BROWSER_PATH', str(CHROME))
    out = ROOT / 'renders' / f'{ep_dir.name}.mp4'
    out.parent.mkdir(exist_ok=True)
    started = time.time()
    run([NPX, '--yes', HF, 'render', '--quality', 'high', '--workers', '1', '--output', out], ep_dir, env)
    took = time.time() - started
    with open(ROOT / 'renders' / 'batch-log.txt', 'a', encoding='utf-8') as log:
        log.write(f'{time.strftime("%Y-%m-%d %H:%M")}  {ep_dir.name}  {duration:g}s video  rendered in {took / 60:.1f} min  {out.name}\n')
    print(f'  rendered {out.name} in {took / 60:.1f} min')
    publish(ep_dir.name, script, out)
    return took


def publish(name, script, video):
    """Copy a finished render into the shared library folder (D:/promptpack/rendered-videos on the
    studio machine) under a readable name. Skipped when that folder does not exist."""
    library = ROOT.parents[2] / 'rendered-videos'
    if not library.is_dir():
        return
    kind = 'premium voices' if any(a.get('provider') for a in script['cast'].values()) else 'free voices'
    cast = ' and '.join(a['name'] for a in script['cast'].values())
    title = re.sub(r'[\\/:*?"<>|]', '', script.get('title', name)).strip()
    if name.startswith('ep'):
        folder, label = library / '3 - Episodes', f'Episode {name[2:]} - {title}'
    else:
        folder, label = library / '2 - Ads', f'Ad - {title}'
    folder.mkdir(exist_ok=True)
    target = folder / f'{label} - {cast} ({kind}).mp4'
    shutil.copy2(video, target)
    print(f'  copied to {target}')


def main(args):
    render = '--render' in args
    names = [a for a in args if not a.startswith('--')]
    if '--all' in args:
        names = sorted(p.parent.name for p in (ROOT / 'episodes').glob('ep*/script.json'))
    if not names:
        sys.exit(__doc__)
    for name in names:
        ep_dir = ROOT / 'episodes' / name
        if not (ep_dir / 'script.json').exists():
            sys.exit(f'Missing {ep_dir / "script.json"}')
    total = 0.0
    for name in names:
        total += build(ROOT / 'episodes' / name, render) or 0
    if render:
        print(f'\nRendered {len(names)} episode(s) in {total / 60:.1f} min')


if __name__ == '__main__':
    main(sys.argv[1:])
