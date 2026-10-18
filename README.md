# PROMPTPACK — digital product storefront

A static storefront for PromptPack digital guides and creative toolkits. The home page
lists all 13 products under Finance, Websites, Social Media, Video and Design, with
category navigation and search. All 13 products can be bought; each new pack also has a free sample prompt.

**Live product:** https://khalandarth.gumroad.com/l/PROMPTPACK

## What this is

A dependency-free static site with a shared neo-brutalist cream, pink, mint, blue and
yellow palette matching the Finance page. It includes:

- A home page catalog with links to each product's details
- Sample prompts on upcoming product pages
- Gumroad checkout for the original website pack
- The existing Razorpay checkout and fulfillment for the Finance pack (USD and INR)
- Razorpay checkout and encrypted ZIP delivery for the eleven new packs at `/checkout/<slug>/`: INR (`price_inr` in `catalog/products.json`; UPI, Indian cards, netbanking, wallets) or USD (`price`; international cards)
- Matching navigation on product, guide, policy and support pages

## Structure

```
index.html                   # generated home page catalog
catalog/products.json        # upcoming product metadata and public samples
catalog/editions.json        # actual built contents and public preview paths
catalog/sources.json         # source revisions and license evidence
scripts/build-catalog.js     # rebuild home, catalog and product pages
scripts/build-storefront.js  # home layout and available product listings
scripts/site-shell.js        # shared category navigation and footer
scripts/build-product-editions.py # illustrated PDFs, examples and buyer ZIPs
assets/theme.css             # shared palette and navigation
assets/home.css              # home page composition
assets/catalog.css           # product details and samples
assets/effects.css|js         # optional motion + conversion layer (marquees, tickers, reveal, lightbox, sticky CTA)
scripts/live-products.js     # Finance and Website Prompts listing data (their original checkout routes)
scripts/prepare-checkout.js  # verifies buyer ZIP hashes, encrypts them to private/products/, writes api/_products.json
scripts/build-checkout.js    # generates /checkout/<slug>/ and /checkout/thanks/
api/_products.js|json        # server-owned product IDs, prices, encrypted files and SHA-256 (deployed with the API)
products/                    # generated detail pages; index forwards to home
finance/                     # existing Finance sales and fulfillment pages
blog/                        # existing guides
```

## Local preview

Any static server works, e.g.:

```
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. This static preview does not run serverless payment APIs.
Use `node tests/dev-server.js` for the existing mock-payment harness on port 4180.

After changing public product metadata, the shared shell or storefront generator, run:

```
node scripts/build-catalog.js
node --test tests/catalog.test.js tests/storefront.test.js tests/product-editions.test.js tests/payments.test.js tests/checkout.test.js
```

The generator also synchronizes shared navigation on Finance, blog and policy pages.
Edit generated layouts in their generator source so a rebuild preserves changes.

## Product editions

The eleven new editions have illustrated PDF guides, original prompt libraries,
worked examples, practical starter files and source registers. Each is sold through
Razorpay at its catalog INR or USD price; after server-side verification of a captured, unrefunded
payment for the right product and amount, `/api/download` returns that product's ZIP from
`private/products/<slug>.enc`. Plain ZIPs stay local under `product-build/editions/`.

After any change to a buyer bundle, run these in order. The catalog build refuses to run
while the encrypted files or `api/_products.json` are stale:

```
python scripts/build-product-editions.py
node scripts/prepare-checkout.js      # needs the existing DOWNLOAD_FILE_KEY; never rotate it
node scripts/build-catalog.js
```

Downloads are served in a single response, so each ZIP must stay under 4 MB (Vercel's
response limit is 4.5 MB); `prepare-checkout.js` enforces this.

Mock tests (`tests/checkout.test.js`, `tests/payments.test.js`) use a fake Razorpay and fake
email. They do not prove the live setup: deploying, confirming production environment
variables and making one Razorpay test-mode payment per route are separate steps.

Build-tool dependencies can be installed locally without changing system Python:

```
python -m pip install --target product-build/python -r scripts/product-editions-requirements.txt
python scripts/build-product-editions.py
node scripts/build-catalog.js
```

The two motion source projects and verified outputs must be present before rebuilding
the editions. Their portable commands and third-party notices are in the respective
`product-build/videos/` folders. `product-build/editions/PUBLISHING.md` describes the
upload and buyer-delivery handoff. Neither build directory is deployed.

The source audit is documented in `docs/product-source-audit.md`. Run
`python scripts/research-product-sources.py` only when refreshing upstream evidence;
it records new revisions and requires review of any changed requirements.

## Deploy (Vercel)

Static site — no framework. Import this repo in Vercel (or `vercel --prod`);
no build command and the output directory is the repo root.

## Scope

This redesign keeps existing checkout and fulfillment. The comprehensive SEO pass is
the next phase; existing page metadata and sitemap coverage are retained and updated
for the new website-pack detail page. Paid pack source files remain in private storage.
