"""Builds the 75+ Website Prompts preview wall assets from the pack folder.

For every preview: a 560px WebP poster, plus a short silent MP4 for animated previews.
Writes catalog/website-previews.json, which scripts/build-storefront.js reads.

Usage: FFMPEG=path/to/ffmpeg python scripts/build-website-previews.py "D:/promptpack/75+3d website pack"
Needs Pillow. Re-running overwrites the outputs.
"""
import json, os, re, shutil, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets/product-previews/website-prompts'
FFMPEG = os.environ.get('FFMPEG') or shutil.which('ffmpeg')
WIDTH = 560
CLIP_SECONDS = 6
CATEGORY = {'Hero': ('hero', 'Hero section'), 'Landing_Page': ('landing', 'Landing page'), 'SaaS': ('saas', 'SaaS'),
            'Agency': ('more', 'Agency'), 'Portfolio': ('more', 'Portfolio'), '3D_Website': ('more', '3D website'),
            'Email_Marketing': ('more', 'Email marketing'), '404': ('more', '404 page'), 'AI': ('more', 'AI product'),
            'Travel': ('more', 'Travel'), 'Website': ('more', 'Website'), 'Contact_us': ('more', 'Contact page'),
            'Signup': ('more', 'Sign-up page'), 'Waitlist': ('more', 'Waitlist page')}
PREVIEW_EXT = ('.gif', '.webp', '.mp4', '.png')


def ffmpeg(*args):
    subprocess.run([FFMPEG, '-y', '-v', 'error', *args], check=True)


def encode(src, dst):
    ffmpeg('-t', str(CLIP_SECONDS), '-i', str(src), '-an', '-vf', f'fps=24,scale={WIDTH}:-2:flags=lanczos',
           '-c:v', 'libx264', '-preset', 'slow', '-crf', '31', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(dst))


def poster_from(src, dst):
    with tempfile.TemporaryDirectory() as tmp:
        frame = Path(tmp) / 'f.png'
        ffmpeg('-ss', '1', '-i', str(src), '-frames:v', '1', str(frame))
        save_poster(Image.open(frame), dst)


def save_poster(im, dst):
    im = im.convert('RGB')
    im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=74, method=6)
    return im.size


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def main(pack):
    if not FFMPEG:
        sys.exit('Set FFMPEG to an ffmpeg executable.')
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.iterdir():
        old.unlink()
    items, seen = [], set()
    for md in sorted(pack.rglob('*.md')):
        preview = next((md.with_suffix(e) for e in PREVIEW_EXT if md.with_suffix(e).exists()), None)
        if not preview:
            continue
        volume = int(re.search(r'Vol (\d+)', str(md)).group(1))
        folder = re.sub(r'^\d+_', '', md.parent.name)
        group, label = CATEGORY[folder]
        name = md.stem
        key = slug(name) if slug(name) not in seen else f'{slug(name)}-vol-{volume}'
        seen.add(key)
        clip = OUT / f'{key}.mp4'
        poster = OUT / f'{key}.webp'
        animated = preview.suffix == '.mp4'
        if not animated:
            try:
                animated = getattr(Image.open(preview), 'is_animated', False)
            except OSError:
                animated = True  # Pillow cannot open it (e.g. a truncated animated WebP); ffmpeg decodes what it can.
        if animated:
            encode(preview, clip)
            poster_from(clip, poster)
        else:
            save_poster(Image.open(preview), poster)
        w, h = Image.open(poster).size
        items.append({'name': name, 'volume': volume, 'group': group, 'category': label, 'width': w, 'height': h,
                      'poster': f'/assets/product-previews/website-prompts/{poster.name}',
                      'video': f'/assets/product-previews/website-prompts/{clip.name}' if animated else None})
        print(f'{len(items):2} {name} ({label}, Vol {volume}){" [animated]" if animated else ""}', flush=True)
    (ROOT / 'catalog/website-previews.json').write_text(json.dumps(items, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'{len(items)} previews, {sum(1 for i in items if i["video"])} animated')


if __name__ == '__main__':
    main(Path(sys.argv[1]))
