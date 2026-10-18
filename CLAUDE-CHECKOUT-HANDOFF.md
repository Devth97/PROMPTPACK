# Claude: finish Razorpay checkout and full-product delivery

User instruction: Claude owns coding. Codex owns generated assets and SEO/AEO/GEO research/content. Finish the existing platform with the smallest effective changes. Work in `D:\promptpack`. Read the user's AGENTS.md instructions, this handoff, `ASSET-HANDOFF.md` and `CLAUDE-HANDOFF.md`. This handoff supersedes older instructions that kept eleven products in preview. Preserve all unrelated and concurrent edits; do not reset or clean the workspace.

## Required outcome

All eleven new digital products need working Razorpay checkout pages and the correct complete ZIP download after verified payment. Replace obsolete preview/not-for-sale labels with real prices and purchase routes once validated. Keep samples available. Preserve the original Finance checkout, its old download tokens, and the Website Prompts Gumroad route. Use existing Razorpay credentials and delivery secrets; do not print secrets or rotate the existing Finance file key.

## Actual product files and prices

Eleven complete buyer ZIPs are in ignored `product-build/editions/`. `catalog/editions.json` records actual page counts, archive filenames and SHA-256 hashes. They total 164 PDF pages and 130 prompts. Each contains the guide, editable prompts, examples, worksheets, starter files and source/usage notes. Both motion MP4s are exported and included. Covers are generated and installed; preserve `catalog/visual-assets.json` and `assets/product-covers/`.

Use current catalog USD prices: Carousel Studio $12; Carousel Workflow Kit $15; 3D Website Lab $15; AI Video Direction Kit $12; UGC Ad Script Kit $12; Short Explainer Studio $12; Motion Briefs for Code $15; Lyric Visual Planner $9; Pixel Brand Prompt Kit $9; YouTube Production Planner $15; Video Shot Prompt Library $12. These are the catalog's existing prices, not new currency conversions. New checkout currently supports USD only. Preserve Finance's existing USD/INR plans. Do not invent an INR conversion.

## Partial implementation already written — review before extending

- `scripts/prepare-checkout.js` verifies local ZIP hashes, encrypts each using the existing `DOWNLOAD_FILE_KEY`, writes `private/products/*.enc` and `api/_products.json`, and marks edition metadata `checkout-configured`. It has run successfully. This is local configuration, not proof of production readiness.
- `api/_products.js` defines allowlisted Finance and new-pack identities, fixed prices, encrypted files, filenames and receipt routes.
- `api/_lib.js` now supports product-bound signed download tokens, old Finance tokens without a product claim, allowlisted file decryption with hash verification, and safer JSON parsing.
- `api/create-order.js` selects an allowlisted product, uses server-owned pricing, checks the encrypted pack can decrypt before creating a new-product order, and stores the product ID in Razorpay order notes. Missing product preserves Finance defaults.
- `api/verify.js` resolves the product from server-fetched order notes, checks requested product and new-product price, checks payment/order association and captured status, and returns a product-bound entitlement.
- `api/download.js` selects PDF or ZIP from signed claims, never from a requested filename. `api/receipt.js` validates the entitlement before returning display metadata.
- `api/razorpay-webhook.js` routes backup email delivery by product and uses an email idempotency key. Preserve shared-account isolation.
- `scripts/build-checkout.js` generates eleven `/checkout/<slug>/` pages plus `/checkout/thanks/`. `assets/checkout.js`, `assets/order-thanks.js`, `assets/checkout.css` implement the pending frontend flow. This has not been browser tested.
- Catalog/storefront/product generators were partly updated for buy links, prices and availability. `scripts/seo.js` was partly updated to match availability. Search for stale preview claims and malformed currency labels (one known `US${p.price}` label in `scripts/seo.js` needs the dollar sign restored).
- A previously missing `scripts/build-seo.js` referenced by the current catalog generator was added minimally to synchronize `llms.txt` and `llms-full.txt`. Preserve broader SEO work separately.
- `vercel.json` includes encrypted files in download and create-order functions and adds receipt-page privacy headers. Review actual Vercel packaging carefully.
- `tests/dev-server.js` now blocks private/source directories from static serving. It still uses MOCK Razorpay and MOCK email only.

## Validation state and remaining work

The eleven existing Finance/payment API tests passed after the initial multi-product API extension. Additional later changes (receipt API, decryption preflight, frontend, generators) have NOT had a complete test run. The generator's last attempted run failed on a text-replacement error that duplicated file tails. Those tails and malformed lines were repaired; `node --check` now passes for product-page.js, build-storefront.js and build-checkout.js. No successful full rebuild is claimed. The HTML currently on disk may still have old preview labels. Do not report completion based on existing screenshots or old test results. Do not rerun the one-off `product-build/enable-sales.cjs`; its edits are already applied.

1. Review connected payment code and finish/rebuild the frontend. Validate all checkout page routes, actual amounts/currencies, Razorpay popup failure/dismissal/retry states and success/download states. Don't trigger a real charge.
2. Add meaningful mock tests for all eleven products: server pricing despite client tampering, unknown products, underpaid/refunded/wrong-product/wrong-payment orders, expired/altered tokens, legacy Finance tokens, exact ZIP SHA-256 bytes and filenames, product-specific webhook emails, unavailable archive/key rejection before payment, and private-source access denial.
3. Update old catalog/storefront/edition tests that explicitly require preview-only statuses and no Offers. Keep useful navigation, search, payment and content checks. Tests currently expect old `includeFiles` and sitemap behavior too; update only to match intended final behavior.
4. Ensure rebuilding product bundles cannot silently leave stale encrypted files or delivery hashes. Make the required packaging/re-encryption order explicit. Keep unencrypted ZIP/PDF sources and build dependencies excluded from deployment. Server-side product metadata must remain available despite `catalog/` being excluded by `.vercelignore`.
5. Inspect the encrypted-file deployment and existing production key compatibility. Do not expose raw ZIPs or PDFs through static paths. Do not modify `.env.local` secrets unless necessary and authorized.
6. Reconcile README and old handoffs with the final state. Explain that live account configuration, deployment and a provider test-mode payment are separate from mock tests. Do not claim a production transaction was tested.
7. Use Ruflo pre-task guidance and diff-risk per the user's instructions, without swarm overhead. Finish with a short report: changed behavior, tests, local review URL and exact remaining external setup if any.

## Commands

```powershell
Set-Location D:\promptpack
node scripts/prepare-checkout.js
node scripts/build-catalog.js
node --test tests/catalog.test.js tests/storefront.test.js tests/product-editions.test.js tests/payments.test.js tests/checkout.test.js
git diff --check
node tests/dev-server.js
```

Mock API preview: http://localhost:4180/ . Static preview http://127.0.0.1:8000/ cannot execute serverless payments. Reuse running servers where possible. `npm.cmd` / `npx.cmd` avoid PowerShell shim policy issues.

Official integration reference reviewed: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/ . Use server-created orders, server signature verification and confirmed captured payment before granting delivery. Never trust only the browser's success callback.

Do not deploy, create real charges, send manual buyer emails or add unrelated features. The user wants coding finished efficiently; no framework migration or new payment provider is needed.

## Claude Code result (2026-10-17)

Done and verified locally with mock Razorpay/email only. No deployment, real charge or email was made.

- Fixes: webhook now acknowledges (200) incomplete or mispriced paid events instead of 400, so Razorpay will not retry them and eventually disable the shared webhook. `assets/checkout.js` tolerates non-JSON errors and offers "Retry payment confirmation", which re-verifies the same payment and never opens a second order. Checkout puts the order panel first on mobile. Restored the `$` in the two `US$` labels in `scripts/seo.js`.
- Packaging guards: `prepare-checkout.js` refuses ZIPs over 4 MB (single-response download; Vercel caps responses at 4.5 MB). `build-checkout.js` refuses a stale encrypted file (size must equal bytes + 28). Order: build-product-editions.py, then prepare-checkout.js, then build-catalog.js. The Python build resets `sale_status`, and the catalog build then stops until prepare-checkout runs.
- `vercel.json` redirects `/private/*`. The encrypted files deploy for `includeFiles` but are not served as static files.
- Tests: new `tests/checkout.test.js` (10 tests, covering every item in step 2) plus updated old preview-era assertions. 31/31 pass. Two injected regressions were caught.
- Browser (headless Chrome, stubbed Razorpay popup on :4180): dismiss, payment.failed, verification failure then retry (same order), success, thanks page, byte-exact ZIP download, refresh recovery, invalid and missing links.

Remaining external steps (owner): deploy; confirm production env vars (`RAZORPAY_KEY_ID/SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `DOWNLOAD_SIGNING_SECRET`, the existing `DOWNLOAD_FILE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`) and that the Razorpay account accepts USD (international payments); make one Razorpay test-mode payment for a new pack and for Finance, then check the download and backup email.

SEO note for Codex: the user asked (2026-10-17) for keywords and SEO tags optimized first for European, American and Middle East markets.

## Update (2026-10-18): INR/UPI for all packs

User chose lower India pricing: US$9 → ₹499, US$12 → ₹699, US$15 → ₹899 (`price_inr` in `catalog/products.json`, `amount_inr` in `api/_products.json`). Checkout pages offer "Pay ₹… (UPI, Indian cards, netbanking & wallets)" or "Pay US$… (international card)". The server validates either exact price via `priceFor`/`priceMatches` in `api/_products.js`. `prepare-checkout.js` now keeps existing encrypted files when they still hold the same archive. SEO note for Codex: product FAQ/llms text still quotes only the US$ price.

## Update (2026-10-18): Carousel Studio Visual Edition 2.0

The user supplied `PromptPack-Carousel-Studio-Visual-Edition-2.zip` (13-page guide, 12 prompts, editorial-news example). It is now the Carousel Studio buyer bundle (`product-build/editions/carousel-studio.zip`; the 1.1 bundle is kept as `carousel-studio-edition-1.1.zip`). To stay under the 4 MB single-response download limit, the six generated editorial slides were re-encoded from PNG to JPEG (quality 92, 4:4:4, 1080x1350; mean pixel difference about 1/255), noted in the bundle CHANGELOG. ZIP: 3.92 MB.
**Codex: `scripts/build-product-editions.py` still regenerates Carousel Studio 1.1. Do not let it overwrite this bundle or its `catalog/editions.json` entry.** A test now fails if the carousel edition is not 2.0. After any bundle change, run prepare-checkout.js, then build-catalog.js.
Website: new inside/example previews, plus a six-slide swipe gallery (`gallery` in editions.json, with the bundle's alt text) on the product page.
