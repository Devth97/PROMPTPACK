"""Copy final customer/ad artifacts to a stable owner folder; back up paid sources privately."""
import argparse,json,shutil,zipfile
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--destination',required=True);args=p.parse_args()
root=Path(__file__).resolve().parents[1];build=root/'product-build/launch-wave2';dest=Path(args.destination).resolve();dest.mkdir(parents=True,exist_ok=True)
manifest=json.loads((build/'manifest.json').read_text(encoding='utf-8'))
for product in manifest:
    slug=product['slug'];shutil.copy2(build/(slug+'.zip'),dest/(slug+'.zip'))
    shutil.copy2(build/slug/'GUIDE.pdf',dest/(slug+'-guide.pdf'))
with zipfile.ZipFile(dest/'google-meta-ad-launch-kit.zip','w',zipfile.ZIP_DEFLATED) as z:
    for file in sorted((build/'ad-assets').iterdir()):z.write(file,file.name)
shutil.copy2(root/'docs/business-products-ad-plan.md',dest/'AD-LAUNCH-PLAN.md')
shutil.copy2(build/'manifest.json',dest/'buyer-manifest.json')
backup=dest.parent/'business-kits-private-source-backup.zip'
with zipfile.ZipFile(backup,'w',zipfile.ZIP_DEFLATED) as z:
    for file in sorted((root/'private/catalog/wave2').iterdir()):z.write(file,'private/catalog/wave2/'+file.name)
    for file in ['catalog/launch-products.json','scripts/build-business-kits.py','scripts/bakeprice-engine.js','scripts/prepare-business-kits.js','docs/business-products-ad-plan.md']:
        z.write(root/file,file)
(dest/'START-HERE.md').write_text('''# PromptPack business product release

The two individual product ZIPs are the customer downloads. Each contains START.html, its local tool files, a PDF guide, editable instructions and supporting material. Unzip the complete folder before use.

The ad launch ZIP and AD-LAUNCH-PLAN.md are owner materials, not customer downloads. They contain eight Meta PNG drafts, Google Search assets and the channel validation plan. No ads have been uploaded or activated and no budget has been spent by this release.

Local verification: 45 focused automated checks and four simulated payment-to-download flows passed. Offline browser workflows, printable customer quote, PDF layouts and desktop/mobile sales pages were reviewed. Mock payments are not real processor transactions.

The release is prepared on feature/business-toolkit-wave2 for review. Preserve the existing merchant, consent and campaign holds documented in the repository. Resolve the deployed processor test and verify Google purchase measurement and a separately authorized spending cap before launching paid traffic for these products.

Private source backup: ../business-kits-private-source-backup.zip. Keep it private and separate from customer uploads. It contains the original paid app/content sources needed to rebuild. No environment file or encryption key is included. The existing delivery key remains in its existing secure configuration.
''',encoding='utf-8')
print('Saved customer ZIPs, guides, ad launch kit, manifest and separate private source backup to '+str(dest))
