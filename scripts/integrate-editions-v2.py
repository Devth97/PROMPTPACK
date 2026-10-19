"""Integrate Codex's Visual Edition 2.0 packs into the PromptPack catalog (same shape as carousel-studio 2.0)."""
import hashlib, json, os, shutil, struct, sys

ROOT = r'D:\promptpack'
V2 = os.path.join(ROOT, 'product-build', 'editions-v2')
ED = os.path.join(ROOT, 'product-build', 'editions')
PREV = os.path.join(ROOT, 'assets', 'product-previews')

NOTE = 'Six images from the worked example included in the pack, with the prompts and alt text behind them. Concept art, not a performance result.'
GALLERY = {
    'ugc-ad-scripts': 'See the six example ad boards',
    'short-explainer-studio': 'See the six example explainer frames',
    'ai-video-direction': 'See the six example shot frames',
    'video-prompt-vault': 'See six example shots from the library',
    'youtube-production': 'See the six example production boards',
    'lyric-visuals': 'See the six example lyric frames',
    '3d-website-lab': 'See the six example site screens',
    'pixel-brand-kit': 'See the six example pixel assets',
    'carousel-workflows': 'See the six example workflow screens',
    'motion-with-code': 'See six frames rendered by the engine',
}
NOTES = {
    'carousel-workflows': 'Six illustrated screens from the worked example, built from fictional sample data. They show the workflow, not real account results.',
    'motion-with-code': 'Six stills from real renders made with the included engine, with the script lines they come from. Characters, camera and captions are all drawn in code.',
}
# Pack-specific catalog changes decided by the owner (2026-10-18/19)
EXTRA = {
    'motion-with-code': {
        'product': {'price': 29, 'price_inr': 1499},
        'edition': {
            'video': '/assets/product-previews/motion-with-code-reel.mp4',
            'video_poster': '/assets/product-previews/motion-with-code-reel-poster.jpg',
            'video_width': 720, 'video_height': 1280,
            'video_title': 'Watch a reel made with this engine',
            'video_note': 'Episode 1, rendered with the included engine and its free built-in voices. The download contains the engine, scripts and guide, not this video file.',
        },
    },
}


def webp_size(path):
    b = open(path, 'rb').read(40)
    kind = b[12:16]
    if kind == b'VP8X':
        return 1 + int.from_bytes(b[24:27], 'little'), 1 + int.from_bytes(b[27:30], 'little')
    if kind == b'VP8 ':
        w, h = struct.unpack('<HH', b[26:30])
        return w & 0x3fff, h & 0x3fff
    if kind == b'VP8L':
        n = struct.unpack('<I', b[21:25])[0]
        return (n & 0x3fff) + 1, ((n >> 14) & 0x3fff) + 1
    raise ValueError(path)


slugs = sys.argv[1:] or list(GALLERY)
ed_path = os.path.join(ROOT, 'catalog', 'editions.json')
pr_path = os.path.join(ROOT, 'catalog', 'products.json')
editions = json.load(open(ed_path, encoding='utf-8'))
products_raw = open(pr_path, encoding='utf-8').read()
products = json.loads(products_raw)

for slug in slugs:
    j = json.load(open(os.path.join(V2, slug + '.json'), encoding='utf-8'))
    assert j['slug'] == slug and len(j['lessons']) == 6 and len(j['gallery_alt']) == 6
    src_zip = os.path.join(V2, slug + '.zip')
    dst_zip = os.path.join(ED, slug + '.zip')
    old_zip = os.path.join(ED, slug + '-edition-1.1.zip')
    if not os.path.exists(old_zip):
        shutil.copy2(dst_zip, old_zip)
    shutil.copy2(src_zip, dst_zip)
    data = open(dst_zip, 'rb').read()
    assert len(data) < 4_000_000, slug

    web = os.path.join(V2, slug + '.web')
    gallery = []
    for i in range(1, 7):
        name = f'{slug}-slide-0{i}.webp'
        shutil.copy2(os.path.join(web, f'slide-0{i}.webp'), os.path.join(PREV, name))
        w, h = webp_size(os.path.join(PREV, name))
        gallery.append({'src': '/assets/product-previews/' + name, 'alt': j['gallery_alt'][i - 1], 'width': w, 'height': h})
    shutil.copy2(os.path.join(web, 'inside.webp'), os.path.join(PREV, slug + '-inside.webp'))
    shutil.copy2(os.path.join(web, 'example.webp'), os.path.join(PREV, slug + '-example.webp'))

    e = next(x for x in editions if x['slug'] == slug)
    for k in ('edition', 'pdf_pages', 'prompt_count', 'subtitle', 'outcome', 'limits', 'first_run', 'lessons', 'includes'):
        e[k] = j[k]
    e['archive'] = slug + '.zip'
    e['archive_bytes'] = len(data)
    e['sha256'] = hashlib.sha256(data).hexdigest()
    e['gallery_title'] = GALLERY[slug]
    e['gallery_note'] = NOTES.get(slug, NOTE)
    e['gallery'] = gallery
    e.update(EXTRA.get(slug, {}).get('edition', {}))

    p = next(x for x in products if x['slug'] == slug)
    for k in ('summary', 'audience', 'needs', 'sample'):
        p[k] = j[k]
    p['count'] = j['prompt_count']
    p['includes'] = j['includes'][:3]
    p.update(EXTRA.get(slug, {}).get('product', {}))
    print(f'{slug}: {len(data):,} bytes, {j["prompt_count"]} prompts')

json.dump(editions, open(ed_path, 'w', encoding='utf-8', newline='\n'), indent=2, ensure_ascii=False)
open(ed_path, 'a', encoding='utf-8', newline='\n').write('\n')
# products.json keeps one compact object per line
lines = ['[' ] + ['  ' + json.dumps(p, ensure_ascii=False, separators=(',', ':')) + (',' if i < len(products) - 1 else '') for i, p in enumerate(products)] + [']']
open(pr_path, 'w', encoding='utf-8', newline='\n').write('\n'.join(lines) + '\n')
print('total prompts:', sum(p['count'] for p in products))
