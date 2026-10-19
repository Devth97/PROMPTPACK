---
workflow: general-video
flow: automation
storyboard: yes
message: "Go from one brief to a finished, approved six-slide carousel every day, without a designer and without risky automation."
destination: instagram-reels
aspect: "9:16"
language: en
length: 56.5s
narration: Pixel (ElevenLabs Eric) + Juno (ElevenLabs Laura) via the engine clip ad03
---

## Intent

Promo for Carousel Studio 2.0 and Carousel Workflow Kit 2.0 (both live). User-approved storyboard on 2026-10-19. No prices in the video; CTA "Buy them now from promptpack.tech".

## Build

- Scenes: `python tools/build_frames.py` (motion in `tools/motion.py`).
- Page, voice placement and music window: `python tools/build_index.py` (tts-venv Python), then `../character-reel/tools/music.py` and the audio carve.
- Narration: `script.json` voiced with `../character-reel/tools/voices.py` (premium voices, key in product-build/.env.elevenlabs).
- Character moments: `../character-reel/episodes/ad03` rendered to `assets/footage/ad03.mp4` with its music muted.

## Honesty notes

- Every image is a real pack asset (example slides, workflow screens, product covers). Covers are cropped above their outdated "10 prompts" line.
- Publishing and private replies use Instagram's official API with the buyer's own Meta app and its review; the comment exchange is labelled as a sample.
- Reference for structure only: another creator's carousel-course promo frames (launch_frames_carasouls, local, git-ignored). No copy, colours or assets reused.
