# Planning products: first release

Authorized by the owner's 8 November 2026 request to validate and create two products for PromptPack and prepare Meta/Google advertising. Builds on the 8 November research brief. Proposed retail price: US$49 each. Research supports a pilot, not a sales guarantee.

## Capability map and build order

| Module | Responsibility | Depends on |
|---|---|---|
| wedding-kit | Quote comparison, commitments, payment register, guest list and handover | — |
| two-homes | Planned/actual parenting time, factual records, expense allocations, contacts | — |
| product-delivery | Private customer packages, verified encrypted delivery and checkout readiness | Both kits |
| storefront | Actual product previews, honest contents/requirements, USD checkout | Product delivery |
| acquisition | Reviewable Meta creatives, Google copy/keywords, tracking and bounded pilot | Storefront |

Build in that order. Preserve existing products, prices, download entitlements and unrelated work. Never publish plaintext paid files. Product download ZIPs are authorized deliverables; no deployment ZIP.

## Deliverables and acceptance

- Two original Excel workbooks, each supplied blank and with fictional filled examples. No macros, external workbook links, paid integrations or claims of Google Sheets compatibility without a verified import.
- Wedding: configurable budget/guest count/as-of date; itemized quote arithmetic with explicit fees/tax bases; stable quote IDs; selection register; payment ledger with refunds; clear remaining balances; guest and task trackers. Deposits reduce cash still owed, not agreed total. Missing inputs and duplicate IDs stay visible.
- Two Homes: user-entered date range/as-of date, planned/actual handovers, elapsed time only when actual start/end exist; factual communication/event notes with source references; expense splits/payment offsets based on the user's existing agreement, not legal calculations; school/medical contact register. No court outcomes, admissibility, tamper-proof or absolute privacy claims.
- A concise original PDF guide and practical printable forms per product, including setup, worked example, formula definitions, capacity, backup and support. Fillable pages remain interactive and field values/appearance are checked.
- Every worksheet visually reviewed. Formula behavior checked against independently computed examples, blank records, zero amounts, partial payments/refunds, duplicates and date boundaries. Artifact engine recalculation; report native-Excel/Google checks not performed.
- Sales pages show real fictional examples and exact file/tool requirements, no fake testimonials/countdowns/results. Existing refund policy applies, no invented unconditional guarantee.
- Server-owned US$49 prices. Checkout unavailable until valid encrypted files and required keys are present. Anonymous status endpoints disclose readiness only, no secrets or protected files. Existing signing/payment verification retained.
- Original paid data and launch archives stay ignored locally. Build scripts and public previews tracked. Add only encrypted fulfillment where secure deployment is possible.
- Prepare two product-focused Meta creative concepts and Google Search text/keywords each. Keep custody copy about the organizer's features and review personalized-advertising restrictions. No ad spend without the owner's total cap and intended accounts.

## Validation and release gates

Competitor ads, buyer reviews and keyword estimates are market evidence. Functional checks are product QA. Neither is proof of demand for PromptPack's version. No outreach to others without explicit authorization. Prepare a pilot feedback sheet; report no external testers/orders until actually observed.

Before spend: working deployed purchase, protected delivery, server-verified purchase events and no sensitive workbook contents in analytics. Owner approved a $150 total cap across both products/platforms. Start wedding first, evaluate usage/refunds/CPA, then test Two Homes; do not fragment a small budget over four simultaneous campaigns.

## Implementation

Static HTML/JS with the existing Node serverless checkout. Test with node --test. Workbook authoring uses the bundled @oai/artifact-tool; PDFs use bundled ReportLab. Development dependencies and plaintext output never ship. Rebuild only the new pages; avoid requiring unavailable private sources for existing paid products.

## Remaining inputs

Owner supplied a Meta screenshot: GROW+ account 1011645257952747 selected, separate PROMPTPACK portfolio present, seven existing unpublished changes. Inspect before launch and preserve those drafts. Google setup requested through MCP or CLI. Existing fulfillment keys and deployment access may need to be restored to this fresh checkout. Do not generate a replacement for an existing customer's key. Publish only after checking those prerequisites.
