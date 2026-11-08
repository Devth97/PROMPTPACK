# Planning-product pilot - 8 November 2026

## Decision

Build and pilot The Wedding Decision Kit first; keep Two Homes, One Organizer as the second offer. Each is $49 USD. These are original Excel/PDF products, not prompt bundles. Marketplace demand and competitor advertising support testing these categories; they do not validate PromptPack's $49 conversion rate or guarantee sales.

The earlier research observed US English Google Keyword Planner ranges of 1,000-10,000 monthly searches for wedding planner spreadsheet and 100-1,000 for co parenting planner. Ranges are not purchases. The wedding term's observed top-of-page bid range was INR128.39-529.35; acquisition at the proposed economics may be difficult. Etsy showed lower-priced wedding spreadsheet competition and item-specific reviews; shop-wide sales must not be counted as sales of an individual listing. Competitor landing-page customer counts and long-running ads remain unverified claims, not proof of profitable campaigns.

References: [Etsy wedding listing](https://www.etsy.com/listing/1865054904/wedding-planner-spreadsheet-wedding), [The Forever Planner](https://theforeverplanner.com/), [CustodyLogs](https://custodylogs.com/). The detailed 8 November evidence ledger and platform report remain in local output/research-2026-11-08/; no market data was fabricated to fill missing platform access.

## Created

- Wedding: blank and fictional-example .xlsx, six sheets, five-page PDF including a fillable vendor decision worksheet, README and personal-use licence.
- Two Homes: blank and fictional-example .xlsx, six sheets, six-page PDF in A4 and US Letter; each includes fillable handover and expense notes, plus README and personal-use licence.
- Two product pages, two USD checkout pages, homepage links, actual fictional preview images, four static ad concepts, Meta text and Google Search copy/keywords.
- Server-owned prices and authenticated encrypted archives with a dedicated PLANNING_FILE_KEY. Existing download/signing keys are preserved. Paid plaintext workbooks, PDFs and customer ZIPs stay in ignored output/. No deployment ZIP is created.

## Validation and limitations

The artifact spreadsheet engine produced the four workbooks. Independent OpenXML checks passed 54 cached-value assertions over worked examples, blank records and nine scenarios: zero overrides, duplicate selections, refunds in the last ledger row, future payments, 0%/100% splits, invalid date/percentage inputs, overpayments, report-window cutoffs and incomplete records. No formula error cells were found. Native desktop Excel and Google Sheets import are not yet verified; this limitation is visible before checkout.

PDF field-tree, widget, saved-value and appearance checks passed for all 25 interactive fields across the three guides. Rendered page/worksheet previews are available for visual review. Local mock-payment checks passed for both products: fixed USD price, captured-payment verification, exact ZIP hash and byte count, cross-product rejection and unsigned-download rejection. These are simulated purchases, not customer orders or production payment validation.

The legacy checkout/payment suites require original encrypted archives and fulfillment keys absent from this fresh checkout. Their attempted run failed for those missing fixtures/configuration; do not report the entire suite green. The new dedicated tests and mocked new-product flows are independently runnable. Never replace the old keys or archives to make local tests pass.

## Ad accounts and credits

Google account authorized by owner screenshot: THAMANVI, 632-066-7331. Browser inspection found an offer redeemed 30 June 2026: spend INR20,000 to get INR20,000 credit, with requirements due 29 August 2026. It is marked Expired, no credits granted; the Promotional offers panel says No offers available. Treat available promotional credit as zero. [Google's offer rules](https://support.google.com/google-ads/answer/6388096) distinguish qualification spending from future earned credit.

Meta screenshot: GROW+ account 1011645257952747 selected, separate PROMPTPACK portfolio listed and seven unpublished changes. Intended Meta account still needs verification; preserve the existing drafts.

Supermetrics is installed and its trial is valid through 22 November 2026. At the last check, Facebook Ads and Google Ads were NOT_AUTHENTICATED. No account query or campaign write has been represented as completed.

Google's official MCP was installed locally from googleads/google-ads-mcp commit 84aebf819eebc3d8dda6ee693c1bdb5fcf5d36d9. The current server is read-only. New Cloud project creation was blocked by the account project limit; the owner authorized using an existing project. Selected generic project: My First Project, arctic-plasma-468112-v5. API activation, API access approval and OAuth sign-in must be verified before calling it connected. [Google MCP guide](https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server).

## Spending and launch gates

Latest verified state (supersedes the historical setup paragraphs below): see docs/planning-launch-readiness.md and docs/CONTINUE-HERE.md. Google Ads read-only MCP is connected and a production-account query passed. Code is in draft PR #6 and a successful Vercel preview; a real processor test is blocked by Razorpay rejecting international cards. No production merge or campaign activation occurred.

Setup update: after explicit owner approval of Google's API terms, Google Ads API was enabled in arctic-plasma-468112-v5. The Overview page showed Test access only. Apply for access (Explorer) was clicked, but the resulting access state was not observed before browser control became disabled in Work settings. Do not assume production access was granted. Local OAuth credentials and the MCP client connection are not configured. Resume from the project's Google Ads API Overview and verify access before creating credentials. No quota-increase request was submitted, no projects deleted and no unrelated project resources changed.

Total owner-authorized cash cap: $150 across both products/platforms. Proposed stages: up to $60 wedding Meta, up to $45 wedding Search, $45 unallocated reserve. Do not spend extra to chase the expired credit. Account-currency amounts require exchange-rate headroom and explicit budget verification. Google daily budgets alone do not enforce a $45 test cap; do not activate without an appropriate verified total-spend control. Campaigns must initially be paused. These are local drafts, not platform-created campaigns.

Target CPA $20 is a planning threshold, not an observed result. At a hypothetical 2% purchase conversion rate it implies a $0.40 CPC ceiling, which may not win relevant traffic. At $20 with no checkout initiation, pause for diagnosis; at $40 with no verified sale, pause rather than automatically spend the reserve. One sale does not establish a winner. Record usage problems, refund requests, support burden and repeatable CPA.

Before any ads: configure the dedicated key securely on the existing deployment, deploy through GitHub, verify a real production purchase and protected download, validate purchase tracking and consent requirements, verify chosen accounts and spending controls, and review Two Homes contextual advertising eligibility. Do not use inferred divorce-status audiences, sensitive customer lists or relationship-hardship remarketing. No workbook records are sent to advertising platforms.

2,041 purchases at $49 would produce $100,009 gross revenue before fees, advertising, refunds, support and tax. No promise of this result is made.

## Rebuild

Use the bundled Node/Python runtime. Run build-workbooks.mjs, build-guides.py, verify-products.py, then package-products.mjs with PLANNING_PYTHON set to the bundled Python executable. Finally run node scripts/build-planning-products.js and build-ad-images.py. Artifact-tool is resolved from the bundled package directory, never committed node_modules. The dedicated key is stored only in ignored .env.planning; deploy it securely, never paste it into a PR. Rebuild archives and metadata together after changing paid files. Run node --test tests/planning-products.test.js and node scripts/planning-products/check-delivery.js.
