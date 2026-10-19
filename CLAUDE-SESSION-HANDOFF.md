# Status 2026-10-19 (morning)

- carousel-workflows 2.0 and motion-with-code 2.0 (character-reel pack, US$29 / INR 1,499, reel video on the product page) integrated; catalog 196 prompts; 31/31 tests. motion-with-code.zip carries the current 23-file engine (Claude patched Codex's bundle; original kept as editions-v2/motion-with-code.codex-original.zip).
- Codex's plain-language copy overlays are still in `git stash` (stash@{0}), unreviewed; its entries for these two packs are stale. Ask the user before restoring or shipping.
- Owner decision 2026-10-19: keep the five promptbase.shop videos in assets/product-promos on the site (risk explained). Do not extend that pattern.
- Refund of the INR 699 test payment: done by the user.
- Carousel promo (Carousel Studio + Workflow Kit) built and rendered: `product-build/videos/promo-carousel/` (56.5 s, Juno & Pixel from engine episode ad03, premium voices), copied to rendered-videos/1 - Promos. Launch promo and both ads are postable now (packs live).
- Live-site gap to fix (Codex): the product cover images of the upgraded packs still say "GUIDE + 10 PROMPTS"; the packs now have 12 to 38 prompts. Covers need regenerating.

# Claude session handoff: 2026-10-18 (start here)

Read this first, then `CLAUDE-CHECKOUT-HANDOFF.md` (checkout and delivery state) and `CODEX-PACK-UPGRADE-BRIEF.md` (Codex's pack work). The older `CLAUDE-HANDOFF.md` is partly superseded. Work in `D:\promptpack`. Ownership: **Claude owns website code, checkout, integration and the character-reel engine. Codex produces pack content and assets** under `product-build/editions-v2/`.

## Live site state (promptpack.tech)

- Vercel project `promptpack-site` (team `khalandar-s-projects`) auto-deploys from GitHub `Devth97/PROMPTPACK` **main**. The repo is private. The local folder is linked (`.vercel/project.json`), and the Vercel CLI is logged in as `khalandarthameem97-1815`. Work on branch `feat/home-finance-nav`, then push the same commit to `main` (`git push origin HEAD:main`). Fast-forward only. No `gh` CLI on this machine.
- Last pushed commit: `8a6e45c` (Visual Edition 2.0 for eight more packs, 2026-10-18). Before it: `23727dc` Carousel Studio 2.0, then INR/UPI checkout, readability and the launch.
- All 13 products are live. The 11 new packs sell through Razorpay in **INR (UPI, Indian cards, netbanking, wallets)** or **USD (international cards)**: $9 → ₹499, $12 → ₹699, $15 → ₹899 (`price` and `price_inr` in `catalog/products.json`). Finance stays US$19 / ₹1,599. Website Prompts stays on Gumroad.
- Production uses **live** Razorpay keys. The user made one real ₹699 UPI test purchase (`pay_TpLDVv2tZ6dMzh`). A refund failed in the Razorpay dashboard: the instant refund costs ₹708.43, more than the ₹699 balance. Advice given: untick "Refund Instantly" and refund before the 21 Oct settlement. The user has not confirmed whether the download worked.
- Email: Zoho mailbox `contact@promptpack.tech` exists, and its MX records are live at Hostinger DNS. **Resend is not set up yet** (the user will do it). When it is: add `RESEND_API_KEY` (Sensitive, Production) and `EMAIL_FROM=PromptPack <contact@promptpack.tech>` in Vercel, then redeploy. `EMAIL_REPLY_TO` is optional (code supports it). DNS records go on `send` and `resend._domainkey` only. Keep a single SPF record on `@` (Zoho's).
- Tests: `node --test tests/catalog.test.js tests/storefront.test.js tests/product-editions.test.js tests/payments.test.js tests/checkout.test.js` (31 pass). The mock-payment preview is `node tests/dev-server.js` on :4180 (restart it after changing `api/_products.json`, because it caches modules).
- Bundle pipeline after any buyer ZIP change: `python scripts/build-product-editions.py` (old 1.1 generator: do **not** run it over Edition 2 packs), then `node scripts/prepare-checkout.js` (reuses unchanged encrypted files, needs the existing DOWNLOAD_FILE_KEY from `.env.local`), then `node scripts/build-catalog.js`. Buyer ZIPs must be under 4 MB (single-response download).

## Task A status (2026-10-18, later session)

DONE and live: ugc-ad-scripts, short-explainer-studio, ai-video-direction, video-prompt-vault, youtube-production, lyric-visuals, 3d-website-lab, pixel-brand-kit (commit `8a6e45c`, 180 prompts total, tests updated). Product-page gallery heading/note is now per pack (`gallery_title`, `gallery_note`) and each gallery item has width/height. Integration script: re-create from the commit if needed (copy ZIP/web files, update editions.json + products.json, then prepare-checkout, build-catalog, tests).
REMAINING: `carousel-workflows` (files exist in editions-v2 but Codex has not added its Progress line yet; integrate once it does, then bump test totals from 180 by its prompt delta: 16 - 10 = +6 → 186).

## Pending task A (original notes): integrate Codex's upgraded packs (Visual Edition 2.0)

Ready in `product-build/editions-v2/`: `ugc-ad-scripts`, `short-explainer-studio`, `ai-video-direction`, `video-prompt-vault`, `youtube-production`, `lyric-visuals` (and `3d-website-lab` in progress). Each has `<slug>.zip` (buyer bundle), `<slug>.json` (catalog fields), and `<slug>.web/` (`slide-01..06.webp`, `inside.webp`, `example.webp`). Format is defined in `CODEX-PACK-UPGRADE-BRIEF.md`.

Integrate them the way Carousel Studio 2.0 was done (commit `23727dc`):
1. Copy the ZIP to `product-build/editions/<slug>.zip` (keep the old one as `<slug>-edition-1.1.zip`).
2. Update the `catalog/editions.json` entry: edition, pdf_pages, prompt_count, archive_bytes, sha256, subtitle, outcome, limits, first_run, lessons (exactly 6), includes, and `gallery` as `[{src, alt}]` using the web slides copied to `assets/product-previews/<slug>-slide-0N.webp`. Replace `<slug>-inside.webp` and `<slug>-example.webp`.
3. Update `catalog/products.json` (summary, audience, needs, count, includes, sample; the sample must be verbatim in PROMPTS.md).
4. Run `prepare-checkout`, then `build-catalog`, then the tests. Update the prompt-total assertions in `tests/catalog.test.js` and `tests/product-editions.test.js` (currently 132). Run a browser sweep, then commit and push to main.
5. `carousel-workflows` is last in Codex's queue, with an **expanded automation scope** (daily run, official-API posting, comment→DM, analytics feedback loop; no scraping). See the brief.

## Pending task B: the character-reel system (flagship upgrade of "Motion Briefs for Code")

User decisions:
- `motion-with-code` becomes the code-animated character-reel pack, at **₹1,499 / US$29** (not yet changed in the catalog).
- Free local voices (Kokoro).
- Codex upgrades the other packs in parallel.
- Storyboard review before the final render.

Project: `product-build/videos/character-reel/` (HyperFrames 0.8.171, `BRIEF.md`, `STORYBOARD.md`, `script.json`).

**Characters (approved by the user):**
- **Juno**: a woman with a curly hair puff, yellow round glasses, a mint hoodie and pink headphones. Built by `buildJuno()` in `assets/cast.js`.
- **Pixel**: an orange (`PALETTE.pixel` 0xff6a2a) block creature with 4 stubby legs, nub arms, black rectangle eyes that change shape (`setBlockEyes`), and a small yellow antenna. Built by `buildBlocBlock({color: PALETTE.pixel, legs: 4, antenna: true, sneakers: false})`.
- Cast sheets: `boards/cast-pixel-orange.png`.
- **Hard line held (keep holding it):** the user repeatedly asked to make Pixel an exact copy of Anthropic's Claude Code mascot and to name it "Claude". Both were declined: an exact mascot replica or "Claude" as the character name would imply Anthropic endorsement in a paid product. "Claude" may appear only as the tool name in hooks (e.g. "Pixel, I asked Claude to clean up my project…"). Also declined: copying base.learn's scripts, and using a GitHub ripper to copy promptbase.shop's courses or assets. Offer original work instead.

**Pipeline (all working):**
- `tools/voices.py` voices `script.json` with Kokoro (run with `product-build/tts-venv/Scripts/python.exe`; model in `~/.cache/hyperframes/tts`). Voices: Juno `af_heart`, Pixel `am_michael`.
- `tools/assemble.py` writes `assets/voice/dialogue.wav` and `timing.json` (line times plus a per-speaker loudness curve).
- `npx hyperframes transcribe assets/voice/dialogue.wav --model small.en` (Parakeet), then `tools/words.py` writes word timings and `timing.js`.
- `tools/music.py` writes the code-composed bed `assets/music/bed.wav`.
- The scene is `index.html` (root `data-no-timeline`, 1080x1920, `data-duration` 45.3) plus `assets/scene.js` (three.js 0.181.2 vendored in `assets/vendor`; set, laptop app screen, shot plan, lip sync, captions, end card). Lint is clean.
- Snapshots and render need: `HYPERFRAMES_BROWSER_PATH=D:/promptpack/product-build/videos/tools/chrome-headless-shell-win64/chrome-headless-shell.exe` (run from PowerShell; Git Bash has a quoting bug with paths that contain spaces).

**Episode 1 ("Who animated us?", 45.2 s) state:** voiced, timed and music done. Sketch stills are in `boards/stills/` (8 frames at 1.42, 4.94, 10.84, 16.35, 22.74, 29.98, 33.1, 44.83 s). Juno's close-ups, the two-shots, the three-quarter shot and the end card look good. **Verify first:** frame 6, Pixel's extreme close-up at 29.98 s. Its camera was just re-aimed along Pixel's face axis (`SHOTS.pixelECU` in `scene.js`) and has not been checked yet.

**Next steps:**
1. Check the stills and write `boards/storyboard.html` (format: `hyperframes-creative/references/storyboard-recipe.md`). Show the user, opening images with `Invoke-Item`; the user can't see images otherwise. Get approval.
2. `npx hyperframes check`, then open the Studio preview, ask the user render-or-revise, then render: `npx hyperframes@0.8.171 render --quality high --workers 1 --output renders/ep01.mp4`. **Measure render time** (the user expects up to 30 videos today; estimated 5–15 min each).
3. **30 episodes**, using the hook list the user was shown (based on research into @base.learn's top reels: 5.3M "I deleted the database", 1.9M "pushed the API key to GitHub", 961K "how much context do you have left"; median 8.8K). The pattern: Juno panics about a developer disaster in 8 words or fewer, Pixel calmly fixes it, then a "Comment PIXEL" CTA. Write original scripts of about 100 words each in `episodes/epNN/script.json`, voice and render each with the same engine (make the scene accept a per-episode screen-panel config instead of the hard-coded `PANELS` in `scene.js`), and batch-render. The user has not yet replied "OK" to the final 30-hook list (in chat, 2026-10-18).
4. Write the pack's guide (PDF + MD), prompts and a CLAUDE.md for buyers. Package the engine under 4 MB (no rendered MP4 in the ZIP; show the reel on the product page instead). Change `motion-with-code` to Edition 2 at ₹1,499 / US$29, then integrate it on the website like the other packs.

## Character reel update (2026-10-18, later session)

- Storyboard approved by the user ("ok continue"): `boards/storyboard.html`, 9 frames (Pixel's "Nobody. We're code." got its own frame).
- Fixed `SHOTS.pixelCU` (was off-centre and too tight): now on Pixel's face axis like `pixelECU`.
- **Render time measured:** ep01 (45 s, 1080x1920, high, 1 worker) took 7m 28s render / 8m 20s wall. 30 episodes ≈ 4–4.5 hours sequential; try `--workers 2` to cut it.
- **Voice emotions** (user asked for more): `tools/emotions.py` turns each line's `emotion` into pace, pitch (numpy resample), Kokoro voice blend, gain and pauses; 17 emotions incl. panicked, shocked, frustrated, worried, sarcastic, relieved, whisper. Optional per-line `say` (spoken delivery; captions still use `text`). Old ep01 voices backed up in `assets/voice-v1/`. A/B file: `renders/qa/voices-before-then-after.wav`.
- **Camera moves** (user supplied a camera-movement reference; use only the standard vocabulary, do not copy its prompt text into a paid pack): `assets/camera-moves.js` with static, dollyIn/Out, pushSlow, zoomIn/Out, crashZoomIn, truck/slider L/R, pedestalUp/Down, arc/orbit L/R, tiltUp/Down, panLeft/Right, whipIn, craneUp, handheld; combine with "+". Per-line `camera` in script.json, otherwise picked by emotion/shot (`pickMove`). `DURATION` in scene.js now derives from timing.json; root `data-duration` must match (46.25 for ep01).
- ep01 v2 render: `renders/ep01-v2.mp4` (v1 kept as `renders/ep01.mp4`).

## Ads, batch engine and Codex pack 10 (2026-10-18, later still)

- Engine is now data-driven: per-episode `panels`, `endcard`, `shot` (incl. `junoCity` reverse angle with side skyline, `overhead`), `eyes` (Pixel: square/tall/slit/wide/angry/sad/bored/fond), Juno eye widening by emotion. `tools/episode.py <name> [--render]` / `--all` builds `episodes/<name>/` as a full project (copies engine) and renders to `renders/<name>.mp4`, logging times to `renders/batch-log.txt`. Reproduces ep01 exactly.
- `renders/ad01.mp4` "Nine packs, rebuilt" (47.5 s, true store facts). `renders/ad02.mp4` beat-for-beat "How we're made" ad (49 s): user asked to copy a promptbase.shop ad's script verbatim; declined (competitor's creative + false claims + "Claude" character); user approved the original beat-for-beat version. It sells the character-reel pack, so post it once that pack is live.
- Render speed: 2 workers ≈ 10% faster than 1 (≈ 9–10 s render per 1 s video on this laptop).
- `episodes/HOOKS.md`: rewritten 30 hooks (original list was never saved). **Awaiting user OK.**
- Codex brief now has "Pack 10: motion-with-code" (zero-cost local stack: code characters, Kokoro, NVIDIA Parakeet, code music, HyperFrames). Engine exported for Codex at `product-build/editions-v2/_engine/character-reel-engine/` (ENGINE.md, tools, 3 example episodes; no local paths). Re-export after any engine change.

## Promo video + premium voices (2026-10-19)

- Launch promo project: `product-build/videos/promo/` (BRIEF.md, STORYBOARD.md, boards/storyboard.html; scenes generated by `tools/build_frames.py` + `tools/motion.py`, page by `tools/build_index.py` (tts-venv Python), then re-run `music.py` and the audio carve). 46.9 s, PromptPack brand (cream/ink/yellow, Montserrat because Figtree is not embedded in the renderer). Output `renders/promo-launch.mp4`. User decisions: no price in the video; CTA "Buy it now from promptpack.tech"; post on the day the pack is live.
- ElevenLabs: user is on pay-as-you-go (paid, commercial OK). Key stored only in `product-build/.env.elevenlabs` (gitignored; never print it; user advised to rotate it since it was pasted in chat). Key lacks user_read/voices_read; TTS works with eleven_v3. Voices chosen: Pixel = Eric `cjVigY5qzO86Huf0OWal`, Juno = Laura `FGY2WhTYpPnrIDTdsKH5`.
- Engine: optional per-character `"provider": "elevenlabs"` (`tools/elevenlabs.py`; emotion → v3 audio tag). Free Kokoro stays default; caches unchanged. Exported to the Codex engine folder; ENGINE.md + Codex brief updated (premium is optional and paid, free first).
- Promo copy changed for honesty: beat 4 = free voices built in + "want premium? plug in ElevenLabs" + on-screen "This narration: ElevenLabs premium voice"; beat 6 dropped "no credits".
- `renders/ad02-premium.mp4` = "How we're made" with ElevenLabs voices (54.7 s). Free-voice version kept as `ad02.mp4`.

## Video library (2026-10-19)

All finished videos are copied to `D:/promptpack/rendered-videos/` (`1 - Promos`, `2 - Ads`, `3 - Episodes`, README.txt). Names: `<Episode NN | Ad> - <title> - <cast> (<free|premium> voices).mp4`. `tools/episode.py --render` copies new renders there automatically. The folder is in `.gitignore` (that .gitignore edit is not committed yet). Copy promo renders by hand.

## Ownership and rules recap

- Honest copy only: no invented views, followers or results. Respect platform terms (no scraping).
- Don't print secrets. `.env.local` holds the delivery key (must never change) and Razorpay test/live values. Never commit `.env*`, `product-build/`, `private/catalog/` or `output/`.
- The user is non-technical and wants fast visible progress. Show images (open them on screen), keep check-ins short, and batch the work.
