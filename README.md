# PROMPTPACK — landing page

Conversion-focused landing page for **75+ Premium AI Website Prompts**, a digital product
sold on Gumroad.

**Live product:** https://khalandarth.gumroad.com/l/PROMPTPACK

## What this is

A single-page, dependency-free static site (`index.html` + `assets/`) in a black /
Figtree / accent-pink aesthetic, featuring:

- Crossfading full-screen video hero (compressed, self-hosted in `assets/`)
- Live motion-preview gallery of real prompt outputs
- "What's inside" + compatible-tools sections
- Cover-art CTA that links straight to Gumroad checkout

## Structure

```
index.html        # the whole page (inline CSS, no build step)
assets/
  hero1.mp4        # crossfade video 1 (compressed ~1.2 MB)
  hero2.mp4        # crossfade video 2
  hero3.mp4        # crossfade video 3
  cover.png        # product cover art (final-CTA background + OG image)
```

## Local preview

Any static server works, e.g.:

```
npx serve .
```

## Deploy (Vercel)

Static site — no framework. Import this repo in Vercel (or `vercel --prod`);
no build command and the output directory is the repo root.

## Notes

- The gallery previews are hosted externally (motionsites.ai / r2.dev); the hero
  videos and cover are self-hosted here for speed and reliability.
- A separate variant of this page (`../landing.html` in the source project) targets
  Gumroad's **native custom landing page**, which uses `data-gumroad-action="buy"`
  and `data-gumroad-field` live bindings instead of external checkout links.
