# Codex brief: Visual Edition 2.0 for nine packs

Owner split: **Codex produces the pack content and assets** described here. **Claude Code integrates them** into the website, checkout and delivery. Claude is building the character-reel upgrade of `motion-with-code` at the same time. Do not touch that pack.

## Why

The user says the current packs are too plain and too basic. Carousel Studio Visual Edition 2.0 (`product-build/editions/carousel-studio.zip`, see `CLAUDE-CHECKOUT-HANDOFF.md`) is the bar: a reference-led method, a locked visual system, staged prompts, worksheets, a quality gate, and a striking, share-worthy example set with caption, alt text and dated sources. Match that depth and visual appeal for each pack below.

## Packs (one at a time, in this order)

1. `ugc-ad-scripts`: UGC Ad Script Kit
2. `short-explainer-studio`: Short Explainer Studio
3. `ai-video-direction`: AI Video Direction Kit
4. `video-prompt-vault`: Video Shot Prompt Library (keep 30 prompts or more)
5. `youtube-production`: YouTube Production Planner
6. `lyric-visuals`: Lyric Visual Planner
7. `3d-website-lab`: 3D Website Lab
8. `pixel-brand-kit`: Pixel Brand Prompt Kit
9. `carousel-workflows`: Carousel Workflow Kit

Do not change `carousel-studio`, `money-audit` or `website-prompts`. `motion-with-code` is now pack 10 (section below).

### Expanded scope for `carousel-workflows` (user request, 2026-10-18)

Carousel Studio 2.0 covers *making* a carousel. Turn the Carousel Workflow Kit into its companion: **the automation pipeline that runs it**, so that together the two packs cover reference → make → publish → measure → next brief. Teach and supply working, honest starter code and prompts for:

1. **Daily run**: one folder per day, one brief in. A scheduled job (local cron or Task Scheduler, or a serverless cron) plans the day's carousel, produces captions and files the finished slides with their metadata.
2. **What's performing**: rank candidate ideas and references by saves, shares and comments using **the user's own analytics exports or official APIs (Meta Graph API Insights)**, plus manually chosen reference posts. **No scraping of Instagram or other platforms**: it breaks their terms. Say so plainly in the guide.
3. **Publishing**: schedule and publish finished carousels through **official APIs only**, with a human approval gate before anything goes live: Instagram via the Meta Graph API (content publishing), LinkedIn and YouTube via their official APIs, or a reputable scheduler the buyer already uses. Keep the existing dry-run queue validator as the safety step before any real post.
4. **Comment-to-DM funnel**: reply to a keyword comment with a DM link, using only Meta's official messaging and comment APIs and their rules (24-hour window, user-initiated messages). No spam, no fake engagement, no automated follows or likes.
5. **Numbers → next brief**: log each post's results and feed the winners (hooks, formats, keywords) into the next day's brief prompt.

Constraints: credentials stay in the buyer's own `.env` (never bundled). Platform API access needs the buyer's own developer apps and account review. State this and any costs honestly. No promised follower, view or growth numbers. The showcase can be an illustrated flow diagram plus dashboard/queue screens built from fictional sample data clearly labelled "sample data".

### Pack 10: `motion-with-code` → Edition 2.0, the character-reel pack (user decisions, 2026-10-18)

Turn "Motion Briefs for Code" into the pack that teaches and ships the Juno and Pixel character-reel system: write about 100 words, get a voiced, lip-synced, captioned, camera-directed vertical reel. Keep the product name (live page); suggested subtitle "Two-character AI reels, made entirely in code". Price becomes ₹1,499 / US$29 (Claude changes the catalog and checkout).

**Zero-cost core (user requirement).** Every core deliverable must run free and locally, with no paid video model, no paid voice API and no on-camera talent: characters and set in code (three.js), voices with Kokoro-82M (local), word timing with NVIDIA Parakeet (local, via HyperFrames), music composed in code, render with HyperFrames. Paid or hosted tools (including NVIDIA's hosted models on build.nvidia.com, ElevenLabs, video generators) may appear only as clearly labelled optional upgrades, with their current terms, costs and commercial-use rules checked and dated. The engine now includes one such switch: per-character premium voices through ElevenLabs (`"provider": "elevenlabs"`, key in the buyer's own `.env`; see ENGINE.md). The guide must teach free voices first and present ElevenLabs as optional and paid (a paid plan for commercial use), never as required. The user's own ads use ElevenLabs voices Eric (Pixel) and Laura (Juno); the launch promo says so on screen.

**Engine (Claude owns it).** Claude supplies the engine at `product-build/editions-v2/_engine/character-reel-engine/` (read its `ENGINE.md`). Bundle it unchanged as `motion-with-code/engine/`. Do not edit engine code. Report bugs or feature needs in the Progress line and Claude will fix them. Real stills rendered by the engine for the showcase are in `product-build/videos/character-reel/boards/stills/`, `.../episodes/ad01/boards/stills/` and `.../episodes/ad02/boards/stills/`. Rendered MP4s are in `.../renders/`: use them for reference only. **No MP4 in the ZIP** (size limit); Claude will show the reel on the product page.

Deliverables:

1. **GUIDE.pdf + GUIDE.md (14–16 pages):** why two-character "developer disaster → calm fix" reels hold attention (Juno panics in 8 words or fewer, Pixel fixes it calmly, one CTA); writing a 100-word two-hander; acting with `emotion`, `say` and Pixel's `eyes`; camera language (a when-to-use table for every move in `camera-moves.js`: crash zoom for punchlines, whip-in for comebacks, static for deadpan, slow push for realisations, pull-back to end); screen panels as visual proof; the end card and CTA; batch rendering and a posting routine; reading your own analytics honestly.
2. **PROMPTS.md (16 or more):** series bible; hook generator; episode writer that outputs a valid `script.json` for the engine; punch-up pass; shot and camera planner; screen-panel writer; CTA writer; caption, hashtags and alt text; pronunciation fixer for `say`; **character designer** (an AI coding assistant writes a new original `build<Name>()` in `assets/cast.js` from a character sheet); brand reskin (palette, end card, names); fact check for the fix being taught; QA review of a rendered episode; 30-day batch planner.
3. **Character generation kit:** a character sheet worksheet (silhouette, palette hex values, 3 signature shapes, eye or face rules, voice, personality) and one extra original example character specified on that sheet. Original designs only.
4. **Voice casting sheet:** the local Kokoro voices, the emotion presets table from `tools/emotions.py`, and `say` tricks (initials, pauses, emphasis).
5. **Ready-to-render episodes:** at least 10 `episodes/epNN/script.json` files that validate against the engine format in `ENGINE.md`, each about 100 words, teaching a true fix. Use the hook list in `product-build/videos/character-reel/episodes/HOOKS.md` only after the user has approved it (ask Claude). Until then, write your own original hooks on the same pattern.
6. **Format templates:** four script templates with one example each: disaster → fix, myth vs fact, product-launch ad, "how this video was made" meta ad (see `episodes/ad02/script.json` for the meta ad format).
7. **Posting and CTA kit:** platform specs and caption safe zones for Reels, Shorts and TikTok; cover-frame guide (`npx hyperframes snapshot --at <s>`); CTA library (link in bio, comment a keyword, save for later, follow for the series); comment-keyword replies sent manually or only through Meta's official APIs (point to the Carousel Workflow Kit for automation); 30-day calendar CSV.
8. **Worksheets and gates:** series planner CSV (30 rows), episode worksheet, QUALITY-CHECKLIST.md (lip sync, captions inside safe zone, eyes and camera fit the beat, end card holds at least 1.5 s, every claim true, no real brands or people), START-HERE.md, USAGE.txt, SOURCES.md and SOURCES.json, CHANGELOG.md.
9. **Showcase:** six 1080x1920 stills taken from the engine's real renders (not mock-ups), labelled "rendered with the included engine", with the script lines they come from. Web previews as for the other packs.

Licences for SOURCES.md (verify each and date it): three.js (MIT, licence file included in the engine), Kokoro-82M (Apache-2.0 at last check), NVIDIA Parakeet (check the current model licence and attribution terms), HyperFrames (installed by the buyer with npx, not bundled; check its licence).

Hard lines for this pack: Pixel must never be a replica of Anthropic's Claude Code mascot, and no character is named "Claude" ("Claude" may appear only as a tool name inside a script). No copying of other creators' scripts, jokes, characters or assets (for example base.learn or promptbase.shop). No invented view counts, comment counts or growth promises.

Size: the engine is about 2.1 MB uncompressed (about 0.6 MB zipped). Keep the buyer ZIP under 3.8 MB.

### Pack 10 update: `motion-with-code` Edition 2.1 (user request, 2026-10-19)

The pack is live as Edition 2.0 (US$29 / INR 1,499). Build Edition 2.1 from it, keeping everything that works:

1. **Bundle the refreshed engine** from `product-build/editions-v2/_engine/character-reel-engine/` unchanged and regenerate `ENGINE-MANIFEST.json` (and the file-count test). New in the engine: captions anchored above the bottom 440 px app zone, long lines shown in chunks of up to 7 words, per-character word highlight (Juno yellow, Pixel mint), a `punch` field for the punchline pop, and automatic -14 LUFS loudness after each render (needs ffmpeg; add it to setup). Read its ENGINE.md.
2. **Route A: the complete workflow chapter** (the way the user now makes reels): hook pattern, ~70-90 word script with one deadpan joke and a callback, free voices first and optional premium ElevenLabs voices (paid plan for commercial use), engine, camera and eyes, safe-zone captions, loudness, batch render with `episode.py --all --render`, the finished-video folder, posting and a weekly series rhythm. Use the live episodes in `product-build/videos/character-reel/episodes/ep02`-`ep11` (the "Dev Disasters" series, script.json files) as worked examples of structure; you may quote one in full as an example, but keep the pack's own ten scripts as the buyer's starter set.
3. **Route B: an AI-generated version, new chapter, written originally.** Teach how to make a Juno and Pixel style two-character reel with generative tools instead of code: character sheets and a consistent world with an image model; one first frame per ~8-second clip; image-to-video for each clip with a fixed style lock and voice description repeated in every clip; then cutting, captioning and loudness (the engine's caption and loudness rules apply). Give honest trade-offs against Route A: per-clip credits and costs, character drift between clips, longer time per reel, and each tool's current commercial-use terms (check and date them; name tools generically or as examples, never as requirements). Include original prompt templates with [BRACKETED] fields. Do not reuse wording, prompts or structure from any other creator's guide (the user showed one from another creator; it is a reference for the idea only, not to copy). Characters must stay original: no Claude mascot look-alikes.
4. Update GUIDE.pdf/GUIDE.md (aim 20-24 pages), PROMPTS.md (add Route B prompts), START-HERE, QUALITY-CHECKLIST (safe zone, two-line captions, -14 LUFS, rights), CHANGELOG (2.1) and the JSON metadata (edition "2.1", page and prompt counts, includes, lessons still exactly 6). Keep the buyer ZIP under 3.8 MB.
5. Deliver as before (`motion-with-code.zip`, `.json`, `.web/`) and add a Progress line. Claude integrates and updates the website.

## What each pack needs

- An illustrated GUIDE.pdf (about 12–16 pages) and GUIDE.md, built around decisions and visual quality, not generic steps. Open with a visual idea, then cover references, a style or system lock, the hook or opening, structure, production route, a complete prompt anatomy, a review gate and a first production session.
- PROMPTS.md: staged prompts that carry a project from brief to export (aim for 12 or more), each with [BRACKETED] fields.
- A master brief, worksheets (blank and filled CSV), QUALITY-CHECKLIST.md, START-HERE.md, USAGE.txt, SOURCES.md and SOURCES.json, plus a CHANGELOG.md for edition 2.0.
- **A showcase example set with real visual appeal**: six images that would make a scroller stop, in the format that fits the pack (for example 1080x1350 slides, 1080x1920 storyboard frames, or 1600x1000 website hero states). Include the prompts, caption or script, alt text and dated sources used.
- Keep any existing starter code that still works, and label its limits honestly.

## Hard rules

- Original work only. No third-party logos, brand marks, real people's likenesses, celebrity styles named as prompts, or copied layouts. Don't reuse Promptbase's or anyone else's characters, scripts or designs.
- Truthful: no invented results, testimonials, view counts or guarantees. Label examples "concept art" or "process example". Date and source every factual claim.
- **Buyer ZIP must be under 3.8 MB** (the download is served as one response; Vercel's cap is 4.5 MB). Save photographic or generated images as JPEG (quality 90–92, 4:4:4). Keep PNG only for flat graphics.
- Keep the folder root `<slug>/` inside the ZIP. No absolute local paths, usernames, keys or `.env` content in any file.

## Delivery format (so Claude can integrate without guessing)

For each finished pack, write:

1. `product-build/editions-v2/<slug>.zip`: the buyer ZIP.
2. `product-build/editions-v2/<slug>.web/`: the six showcase images as WebP, 720px wide (quality 84), named `slide-01.webp` … `slide-06.webp`, plus `inside.webp` (one representative guide page, 834x1179) and `example.webp` (a 1200x800 composite of the showcase).
3. `product-build/editions-v2/<slug>.json`:

```json
{
  "slug": "<slug>",
  "edition": "2.0",
  "pdf_pages": 0,
  "prompt_count": 0,
  "subtitle": "under 90 characters",
  "outcome": "what the buyer makes, 1–2 sentences, from the guide's wording",
  "limits": "honest scope: tools, accounts and credits needed; what is not included",
  "first_run": ["4 steps"],
  "lessons": ["exactly 6 guide chapter titles"],
  "includes": ["5 short bullet lines"],
  "summary": "one sentence for the product card",
  "audience": "who it is for",
  "needs": "what the buyer needs",
  "sample": "one prompt copied verbatim from PROMPTS.md, over 200 characters, with [BRACKETED] fields",
  "gallery_alt": ["6 alt texts, one per showcase image"]
}
```

## Do not

- Edit website code, `catalog/*.json`, `api/*`, `private/*`, `scripts/*.js`, tests or generated HTML.
- Run `prepare-checkout.js` or `build-catalog.js`, commit, or push. Claude integrates and publishes each pack.
- Run `scripts/build-product-editions.py` over existing editions. It regenerates old 1.1 bundles.

When a pack is done, add one line to the "Progress" section below with the slug, ZIP size and anything Claude should know.

## Progress

- `motion-with-code` Edition 2.1 (2026-10-19): 2,026,505 bytes; 24-page guide, 28 prompts, six lessons, complete Route A and original Route B with dated optional-tool costs/terms, ten live structural examples, ten original starter scripts preserved, four formats and eight web previews. All 23 engine files and their archived copies are byte-identical to the refreshed export; manifest/file-count test refreshed, eight tests and archive/metadata/visual QA passed. Claude: integrate only the editions-v2 ZIP/JSON/web artifacts; the separate wrapper forces local Parakeet and now calls the supplied loudness function. Upstream observations: native runner still uses auto ASR with --model small.en; tools/episode.py retains a studio absolute path in a docstring, preserved under the unchanged-engine instruction (no runtime dependency; remove upstream for a strictly path-free export). Existing showcase stills are identified as earlier renders. No new full episode render, batch benchmark or paid generation was performed. Validation: product-build/editions-v2/_review/motion-with-code/validation.json.

- `ugc-ad-scripts`: 2,934,355 bytes (2.93 MB); 14-page guide, 14 prompts, six showcase JPEGs and eight web previews; schema, archive and visual QA passed. Claude: integrate only the editions-v2 ZIP/JSON/web files; legacy starter limits are documented.
- `short-explainer-studio`: 2,707,436 bytes (2.71 MB); 14-page guide, 16 prompts, six showcase JPEGs and eight web previews; schema, archive and visual QA passed. Claude: integrate only the editions-v2 ZIP/JSON/web files; legacy starter limits are documented.
- `ai-video-direction`: 2,109,067 bytes (2.11 MB); 14-page guide, 16 prompts, six showcase JPEGs and eight web previews; schema, archive and visual QA passed. Claude: integrate only the editions-v2 ZIP/JSON/web files; legacy starter limits are documented.
- `video-prompt-vault`: 2,044,453 bytes (2.04 MB); 14-page guide, 38 prompts, six showcase JPEGs and eight web previews; schema, archive and visual QA passed. Claude: integrate only the editions-v2 ZIP/JSON/web files; legacy starter limits are documented.
- `youtube-production`: 1,466,761 bytes (1.47 MB); 14-page guide, 16 prompts, six showcase JPEGs and eight web previews; schema, archive and visual QA passed. Claude: integrate only the editions-v2 ZIP/JSON/web files; legacy starter limits are documented.
- `lyric-visuals`: 3,516,995 bytes (3.52 MB); 14-page guide, 16 prompts, six showcase JPEGs and eight web previews; schema, archive and visual QA passed. Claude: integrate only the editions-v2 ZIP/JSON/web files; legacy starter limits are documented.
- `3d-website-lab`: 1,323,533 bytes (1.32 MB); 14-page guide, 16 prompts, six showcase JPEGs and eight web previews; schema, archive and visual QA passed. Claude: integrate only the editions-v2 ZIP/JSON/web files; legacy starter limits are documented.
- `pixel-brand-kit`: 791,705 bytes (0.79 MB); 14-page guide, 16 prompts, six showcase PNGs and eight web previews; schema, archive and visual QA passed. Claude: integrate only the editions-v2 ZIP/JSON/web files; legacy starter limits are documented.
- `carousel-workflows`: 988,872 bytes; 16-page guide, 16 prompts, six showcase images and eight web previews; expanded daily planner, own-export ranking, hash-bound approval, official Instagram publishing/private-reply starter and six mock tests passed. Claude: live account/app review still required; LinkedIn/YouTube routes documented separately, not implemented. No scraping or credentials bundled.
- `motion-with-code`: 2,025,688 bytes; 16-page illustrated guide, 20 prompts, 10 original validated episodes, 4 complete format examples, 30-day calendar, 6 real-engine stills and 8 web previews. All 21 engine files byte-identical; no MP4/models bundled; 6 tests and archive/schema/visual QA passed. Claude: integrate INR 1,499 / US$29 separately; wrapper explicitly requires local Parakeet (original runner uses auto with a Whisper-only --model flag). New scripts are validated, not batch-rendered; shared HOOKS.md remains unapproved and unused.
