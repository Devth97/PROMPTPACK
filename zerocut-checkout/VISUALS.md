# ZeroCut visual update — 9 November 2026

The hero uses the requested headline verbatim. The ownership strip explains the one-time kit purchase, customisation and maintenance responsibility. Gateway, Shopify, SMS and hosting costs remain separate. Purchase actions remain disabled until an actual payment URL is configured; indexing remains `noindex, follow` while sales setup is incomplete.

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
