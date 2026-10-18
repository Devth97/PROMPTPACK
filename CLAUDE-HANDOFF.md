# PromptPack development handoff

> **Superseded in part (2026-10-17):** the eleven new packs are now sold through Razorpay checkout. Rules below about keeping them in preview, with no buy buttons or prices, no longer apply. See `CLAUDE-CHECKOUT-HANDOFF.md`. SEO/AEO/GEO is now owned by Codex.

Current asset status (supersedes the older progress notes below): read `ASSET-HANDOFF.md` and `catalog/visual-assets.json`. Thirteen generated cover mockups plus a homepage hero are installed; the shared product hero now includes imagery and sample/contents actions. Both motion MP4s exported successfully. All eleven buyer ZIPs were rebuilt with current covers, starters, notices and videos; `catalog/editions.json` contains their current hashes. All 21 tests pass. Browser checks confirmed every product hero image loads and both actions have valid targets, with no horizontal overflow at the tested mobile viewport. Desktop screenshot evidence is in `product-build/brand-assets/`. Preserve these asset integrations and Claude's concurrent effects/lightbox/related-product changes. SEO/AEO/GEO remains phase two.

## Working agreement

The user wants Claude Code to own remaining website/backend coding. Codex owns asset production: covers, images, illustrated PDF ebooks, original examples, preview videos and buyer packages. Reuse those assets and coordinate through files. Do not replace them with placeholders or generate new product claims to fill a layout.

Work in `D:\promptpack`. Read the user's AGENTS.md instructions, this file and README.md first. There are many pre-existing uncommitted and untracked changes; preserve them. Do not reset, clean or overwrite unrelated work. No framework migration is needed.

## Product and design direction

- Static, buildless HTML/CSS/JS storefront on promptpack.tech; current review is local.
- Neo-brutalist palette from the Finance page: cream #FFFBF2, ink #0B0B0F, pink #F598F2, yellow #FFE14D, mint #A8F0C6, blue #9DCBFF, coral #FF9F8E. Bold type, black borders and hard shadows.
- Every product is listed once on the home page under Finance, Websites, Social Media, Video or Design. Sticky category navigation jumps to home sections. Preserve search and category reset behavior.
- Inspiration is promptbase.shop's clear product presentation. We have NOT established that its exact paid courses or source files are publicly licensed. Do not claim these independent PromptPack editions are copies or affiliated products.
- Existing Website pack and Finance pack remain available through their existing checkout routes. Eleven new editions have local content but no configured checkout. Do not activate fake buy buttons, invent prices or advertise working live delivery.
- Comprehensive SEO work was explicitly designated phase two. Preserve metadata and crawlable content; complete the product/site work first.

## Existing implementation

`node scripts/build-catalog.js` generates the home page and product pages and synchronizes shared navigation on Finance, blog and support/policy pages. Edit generators instead of generated HTML whenever appropriate.

| File | Responsibility |
| --- | --- |
| scripts/build-catalog.js | Page wrapper, metadata, product detail generation, sitemap |
| scripts/build-storefront.js | Home composition and all-product catalog |
| scripts/product-page.js | Illustrated product detail template |
| scripts/site-shell.js | Shared category navigation and footer |
| assets/theme.css | Shared palette and shell |
| assets/home.css | Home layout and product cards |
| assets/catalog.css | Product details, samples and edition previews |
| assets/catalog.js | Search, category reset and sample copying |
| catalog/products.json | Public product metadata and original sample prompts |
| catalog/editions.json | Actual built contents, page counts and preview paths |
| catalog/sources.json | Ten public repository revisions and license evidence |
| docs/product-source-audit.md | Research findings and source/product boundaries |

Finance checkout code and serverless handlers were not redesigned. Preserve their behavior, server-side pricing, signature verification, encrypted delivery and attribution.

## Codex asset state

The first complete asset build exists locally at `product-build/editions/`: eleven per-product ZIPs plus `promptpack-product-editions.zip`. It contains 164 PDF pages total and 130 prompts. Each edition has a PDF, editable guide, prompt library, blank/filled worksheets, an original practical example and source register.

Public covers are in `assets/product-covers/`; public interiors and examples are in `assets/product-previews/`. These have already been wired into product pages and home cards. The two existing products also have covers. PDF page images were rendered and reviewed; programmatic checks cover text presence and page bounds.

IMPORTANT: that first ZIP build is not the final handoff archive. Subsequent fixes to starter validation, 3D fallback CSS, source notices and motion cue descriptions have not yet been repackaged. Motion MP4 export was being finished in Codex. Check the actual files and `product-build/videos/verification.json` if present; do not assume an MP4 exists because its source checks pass. Once asset work completes, Codex should rebuild with `python scripts/build-product-editions.py` and then rebuild the public pages. Coordinate around that build rather than overwriting it.

Asset sources: `private/catalog/edition_content.py`, `private/catalog/starters/`, existing per-product PROMPTS.md, `scripts/build-product-editions.py`. The older `private/catalog/build-packs.py` creates older draft packs and is superseded for edition 1.1.

Build Python dependencies are installed in `product-build/python`; exact versions are in `scripts/product-editions-requirements.txt`. `product-build/` and `.npm-local-cache/` are ignored by Git and Vercel. Keep full buyer files, tool dependencies, research copies and credentials out of the public deployment.

Motion projects: `product-build/videos/motion-with-code/` and `product-build/videos/lyric-visuals/`. Both are six-second silent square demos with original text. They passed HyperFrames runtime/layout/motion/contrast checks; each had one nonblocking Studio structure warning. A Windows Chrome `--version` preflight issue was blocking MP4 export; Codex was resolving it with a local Chrome Headless Shell. Project pins were upgraded from HyperFrames 0.8.165 to 0.8.166. Exact cues/timing, notices and license files are in the projects. GSAP uses its own Standard License, not MIT; retain the included notices and licenses.

Latest asset status: Chrome Headless Shell downloaded successfully at `product-build/videos/tools/chrome-headless-shell-win64/chrome-headless-shell.exe`. The lyric high-quality single-worker export has started; motion export follows. Both 1080-square posters exist in `assets/product-previews/`. An active Codex asset worker may still be writing these outputs; avoid rebuilding or deleting them concurrently.

## Remaining coding work

1. Review the connected code and current diff. Preserve the established layout and live checkout behavior.
2. Verify generated listings against final `catalog/editions.json` after Codex finishes repackaging. Ensure page counts, included files, images, MP4 posters and requirements are accurate. No active offer for an unconfigured product.
3. Review starter and site behavior for concrete bugs. The local queue is a dry-run validator; the episode utility checks records; neither publishes. The 3D sample is a front-end example, not a checkout implementation.
4. Run the full checks below and fix real failures with small changes. The prior full run was 20/21 passing: one overly strict image-file-size assertion rejected a valid small pixel-art WebP; that assertion was corrected and all three focused edition tests then passed. Rerun the complete suite on the final files.
5. Check desktop/mobile page behavior and local asset loads. Existing browser checks passed at mobile width for home and several product pages with no missing images or horizontal overflow. Sample copy works. Browser screenshot capture in Codex repeatedly timed out; use an available supported browser verification path and be explicit about any remaining visual limitation.
6. Write a concise final coding report and leave a concrete local preview. Do not deploy, create charges, upload buyer files or send messages unless the user requests that action.

## Commands (PowerShell)

```powershell
Set-Location D:\promptpack
node scripts/build-catalog.js
node --test tests/catalog.test.js tests/storefront.test.js tests/product-editions.test.js tests/payments.test.js
git diff --check
python -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/ . Reuse an existing server on port 8000 if it is running. Static preview does not execute serverless payment APIs. `node tests/dev-server.js` starts the separate mock-payment harness on port 4180.

Use `npx.cmd` / `npm.cmd` on this machine if PowerShell blocks the `.ps1` shim. Keep any temporary npm cache inside the workspace instead of changing system policy. Use Ruflo guidance/risk hooks when available per the user's global instructions; do not add swarm overhead to ordinary fixes.

## Claude Code status (2026-10-17 01:20 IST) — coordination note for Codex

- Added a conversion/motion layer: `assets/effects.js|css`, `scripts/live-products.js`; product pages gained lightbox hooks (`data-lightbox`), a "Ready to download today" bridge, related packs and a mobile sticky CTA. Codex's 01:11 product-hero/brand-visuals changes were preserved.
- Now doing SEO/AEO/GEO (phase two). Logic lives in `scripts/seo.js` (entity graph, FAQ schema, llms.txt/llms-full.txt generation). Shared generators get small anchored edits only: product meta descriptions + JSON-LD (`build-catalog.js`), home schema/at-a-glance table (`build-storefront.js`), product FAQ + at-a-glance block (`product-page.js`). Please re-read these files before editing them rather than writing from an older copy.
- `llms.txt`, `llms-full.txt`, `robots.txt` and `sitemap.xml` become generator outputs; `/products/` (redirect stub) leaves the sitemap and gets noindex.
