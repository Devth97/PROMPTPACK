"""Freeze public repository identities and license evidence for the product guides."""
import concurrent.futures
import hashlib
import json
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPOS = {
    'three': 'mrdoob/three.js',
    'hyperframes': 'heygen-com/hyperframes',
    'diffusers': 'huggingface/diffusers',
    'whisper': 'openai/whisper',
    'playwright': 'microsoft/playwright',
    'pillow': 'python-pillow/Pillow',
    'libresprite': 'LibreSprite/LibreSprite',
    'googleapis': 'googleapis/google-api-nodejs-client',
    'instagram-skills': 'Jakeschincariol/instagram-agent-skill',
    'instagram-mcp': 'postoncehq/instagram-mcp',
}

def request(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'PromptPack-source-review', 'Accept': 'application/vnd.github+json'})
    with urllib.request.urlopen(req, timeout=45) as response:
        return response.read()

def inspect(item):
    key, repo = item
    data = json.loads(request('https://api.github.com/repos/' + repo))
    branch = data['default_branch']
    commit = json.loads(request('https://api.github.com/repos/' + repo + '/commits/' + urllib.parse.quote(branch, safe='')))['sha']
    license_info = json.loads(request('https://api.github.com/repos/' + repo + '/license?ref=' + commit))
    license_bytes = request(license_info['download_url'])
    evidence = ROOT / 'product-build' / 'research' / key
    evidence.mkdir(parents=True, exist_ok=True)
    (evidence / 'LICENSE.txt').write_bytes(license_bytes)
    readme = json.loads(request('https://api.github.com/repos/' + repo + '/readme?ref=' + commit))
    (evidence / 'README.md').write_bytes(request(readme['download_url']))
    result = {'id': key, 'repository': repo, 'url': data['html_url'], 'revision': commit,
            'license': license_info['license']['spdx_id'], 'license_url': license_info['html_url'],
            'license_sha256': hashlib.sha256(license_bytes).hexdigest(),
            'readme_url': readme['html_url'], 'checked_at': datetime.now(timezone.utc).isoformat(),
            'usage': 'Referenced tool; upstream software is not sold or bundled with the guide.',
            'affiliation_with_reference_store': 'Not established'}
    if key == 'pillow' and b'MIT-CMU' in license_bytes:
        result['license_name'] = 'MIT-CMU (stated in upstream LICENSE; GitHub detected NOASSERTION)'
    return result

def main():
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        sources = list(pool.map(inspect, REPOS.items()))
    (ROOT / 'catalog' / 'sources.json').write_text(json.dumps(sources, indent=2) + '\n', encoding='utf-8')
    print(json.dumps([{'repo': s['repository'], 'license': s['license'], 'revision': s['revision'][:10]} for s in sources], indent=2))

if __name__ == '__main__':
    main()
