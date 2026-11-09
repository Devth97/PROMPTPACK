# ZeroCut visual update — 9 November 2026

The hero uses the requested headline verbatim. The ownership strip explains the one-time kit purchase, customisation and maintenance responsibility. Gateway, Shopify, SMS and hosting costs remain separate. Buy Now actions use `/checkout/zerocut-checkout/` and the existing Razorpay order, verification and download APIs. Indexing remains `noindex, follow`.

## Photography

Generated with the built-in image generator, then cropped into 19 WebP files in `assets/products/`. These are fictional demo products, with illustrative packaging; the page discloses AI generation. The same asset follows each product through storefront, cart, upgrades, add-ons and post-purchase offers. Four actual browser captures replace the interface previews. The social cover is composed from the refreshed captures.

Generation prompt: Create one photorealistic ecommerce product catalog contact sheet, exact grid of five columns and four rows, equally sized square cells with no gaps or borders. Each product is centered on a warm ivory seamless studio background, with soft natural shadows, generous margins, realistic material textures and consistent lighting. No illustrations, icons, headings or cell numbers. Row one: orange masala chai pouch labelled KADAK CHAI with tea and cardamom; elaichi rusk box with rusks; four terracotta kulhads; steel tea strainer; green ginger lemon tea pouch. Row two: amber kumkumadi dropper bottle with teal NEEM & NILA label; green neem face wash; ivory SPF 50 sunscreen; rose lip balm jar; green aloe gel jar. Row three: black cast iron tawa with handle; loop-handled cast iron kadai; amber seasoning oil; three neem wood spatulas; rust quilted handle grip. Row four: purple and gold oud attar; green and gold mogra attar; purple gift box of five perfume sample vials; clear travel roller with silver cap; spare black tawa. The spare twentieth cell is unused.

## Verification

Isolated Chrome, driven through the DevTools protocol with native mouse and keyboard input:

- Widths 320, 360, 390, 768, 1024 and 1440: no horizontal page overflow; images loaded.
- All four flows: empty cart, product photo, size upgrade, simulated OTP, pincode city autofill, name/address, simulated payment, confirmation and post-purchase add-on.
- Payment paths cover UPI, card and COD. No real gateway charge is made.
- Calculator: default ₹10 lakh / 2% gives ₹2,39,001 estimated first-year savings; 0% gives ₹0 savings.
- Purchase link absent: demo CTA visible and purchase CTA hidden. Ephemeral configured-link test: purchase CTAs target the configured URL and preview CTAs hide.
- Zero browser console errors/warnings and zero failed resource requests.
- Screenshots of desktop, mobile, each checkout and the social cover visually inspected. JavaScript syntax and Git whitespace checks pass.

## Comparison wording

No named provider rate is used by the calculator. Its default is explicitly hypothetical. GoKwik's official pricing and Juspay's HyperCheckout page were checked on 9 November 2026; bundled services and pricing vary. The comparison avoids claims that other providers cannot customise their interfaces.

Sources: https://www.gokwik.co/pricing?tab=kwik-engage and https://juspay.io/in/hypercheckout/pricing

## Release and rollback

Deploy through the existing GitHub main → Vercel integration. Verify the deployment status and public `/zerocut-checkout/` page after merge. If a regression is found, revert the scoped ZeroCut merge on main and let the same workflow redeploy. No paid archive, payment secret or generated build output is included.

## Buy Now release

The user-supplied `ZeroCut-Checkout-v1.0.zip` is 52,306 bytes, SHA-256 `5e251f1ea16929e9e4bb9d38b000b09ef436893f82671a91f9d8912f7e2f156d`. Only its AES-256-GCM ciphertext is deployed. The product uses the existing deployed `PLANNING_FILE_KEY` through the existing `key_env` mechanism; no key or account setting changes are needed. This independently registered product avoids rebuilding unrelated catalog pages or buyer bundles. The checkout accepts the INR plan only, at 99,900 paise. The shared receipt page shows ZeroCut-specific starter instructions.

Validation: exact ZIP checksum; existing encrypted bundle/key compatibility; encryption roundtrip; server-owned price despite client tampering; unsupported plan refusal; unavailable-file refusal before contacting Razorpay; mocked captured-payment signature verification and byte-identical entitled download. Isolated Chrome verifies all four demos, visible Buy Now links, loaded Razorpay SDK and checkout layouts at 320, 390, 768 and 1440 pixels. No real payment was submitted during testing.
