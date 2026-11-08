# Planning-product launch readiness — 8 November 2026

## Latest currency decision - 8 November 2026

The owner chose separate INR and USD payment options. Existing native product prices/buttons remain intact. Both planning kits now offer INR 2,999 or US$49: fixed regional prices, not automatic exchange-rate equivalents. The abandoned single-INR patch was backed up outside the repository and reversed after reconstructing its exact 31-file changes (zero mismatches).

Both plans use server-owned prices and unchanged encrypted downloads/keys. Readiness verifies both prices before enabling either button. Wedding consent-aware Purchase measurement uses the verified currency/value; Two Homes still loads no advertising vendor. Existing USD entitlements remain valid.

Validation: generator completed, 27 focused checks and four local mock purchase-to-download flows (two kits x two currencies) passed, including exact download hashes and cross-product rejection. Review found no Required/Critical findings. Browser verification of this update is blocked because local browser use is disabled in Work settings. The prior deployed USD test was rejected by Razorpay for unsupported international cards; dual buttons do not resolve merchant eligibility. No successful deployed payment or production purchase is claimed.

Use the existing feature/planning-products / draft PR 6 workflow. Do not merge production or activate campaigns until deployed INR/USD processor flows, fulfillment, tracking and enforced spend controls are verified. Campaign holds remain in effect.

Status: **HOLD advertising.** No planning campaigns were created, enabled, published, or funded. Proposed media allocation remains $60 Meta, $45 Google Search, and $45 held reserve within the owner's $150 total cash cap. These are proposed allocations, not platform-enforced spending limits.

## Production and deployment

- `https://promptpack.tech/` returned 200. Both planning product pages, both checkout pages, and both `/api/planning-status?product=...` URLs returned 404. A real production purchase or download cannot yet be verified.
- Existing Vercel project confirmed: `khalandar-s-projects/promptpack-site`, connected to `Devth97/PROMPTPACK`; production follows `main`.
- The owner signed in. The existing `PLANNING_FILE_KEY` from the ignored local file was saved as **Secret** separately for Production and Preview. Vercel confirmed success; a new deployment is required. Existing fulfillment/payment keys were preserved. No secret values were printed or committed.
- Latest production-source changes through `f824308` were merged into the planning branch, preserving the newer ProfitPulse launch copy and calculator validation.
- The owner explicitly approved branch push and PR after the initial automatic-review block. Reviewed code commit `7a8d5a5` was pushed on `feature/planning-products`; [draft PR #6](https://github.com/Devth97/PROMPTPACK/pull/6) is open. Vercel and Vercel Preview Comments checks passed. No main-branch merge or production deployment was performed.

## Deployed preview: processor blocker confirmed

- [Vercel deployment FZmiLGr1UtoQtbKaMPPC1Pjtvyxj](https://vercel.com/khalandar-s-projects/promptpack-site/FZmiLGr1UtoQtbKaMPPC1Pjtvyxj) is Ready for code commit `7a8d5a5`.
- Preview origin: `https://promptpack-site-dnzrm15ie-khalandar-s-projects.vercel.app`. It uses Vercel authentication; unauthenticated command-line requests redirect to login. Protection was not bypassed or disabled.
- Authenticated browser GETs for both planning readiness APIs returned `ready:true`, price 49, currency USD. This verifies both encrypted archives against the configured key on Vercel, not only locally. Both preview product pages loaded without broken images or advertising vendor scripts.
- Wedding checkout created a real Razorpay **test-mode** order and opened the provider popup showing **US$49** and **Test Mode**. Advertising cookies were rejected. Only fictional contact data and Razorpay's published international test-card details were used; no real payment credentials were entered or saved.
- The processor rejected the test with **International cards are not supported. Please contact our support team for help**. No successful captured payment, receipt, download token, download, webhook email, or platform Purchase event is claimed. The failed popup closed cleanly and the checkout button re-enabled.
- This is a payment-provider configuration/eligibility blocker requiring resolution and a successful repeat of the USD processor test before production. Do not change prices, substitute credentials, activate international processing on a shared merchant account, or merge/deploy to production without the applicable owner authorization. Production live-mode credentials and international-card eligibility have not been verified.

## Local verification completed

- 13 planning product/measurement tests and 12 shared conversion/ProfitPulse launch tests passed. This is 25 focused checks, **not a claim that the entire legacy payment suite passed**. Missing legacy local fulfillment keys remain outside this verification.
- Both simulated order → captured payment → verified receipt → protected ZIP flows passed, including server-owned $49 USD pricing, ZIP size/hash, cross-product denial, and unsigned-download denial. No real payment or email was sent.
- Independent review found and then verified a fix for checkout reintroducing URL campaign tags after consent withheld them. The canonical attribution helper is now authoritative; URL fallback applies only when no helper exists.
- A temporary mutation inverted the consent condition; the no-tracking-before-consent test failed as expected. Repository source was not mutated.
- Browser QA covered all four new pages at 320 and 1440 pixels, with additional 390-pixel inspection. No horizontal page overflow or broken preview images was observed. Product links and checkout enablement worked with locally verified archives. A separate missing-key server proved purchase links had `display:none` and checkout was disabled.
- Scoped CSS fixes keep the chat widget away from purchase controls and enforce `[hidden]` for purchase links.
- Git line-ending conversion broke restored armored ciphertext headers on Windows. `.gitattributes` now preserves `private/products/*.enc` byte-for-byte; restored files match their committed Git blob hashes and decryption/delivery checks pass. Product archives were not regenerated.
- Final Google headline/description lengths passed for both products.

## Measurement and privacy

- New planning pages use `assets/planning-measurement.js`, replacing their unconditional Meta/Clarity scripts.
- Wedding: existing Meta pixel `2116311975585050` loads only on production after explicit advertising-cookie consent, respecting Global Privacy Control. Rejection does not block checkout. Preferences can be changed later. Only allowlisted product fields are sent; verified $49 USD purchase events use order ID for deduplication. Tokens and buyer email are excluded.
- Consented, sanitized UTM attribution survives navigation in session storage and resets for newly tagged visits. Denied consent, GPC, and Two Homes withhold order attribution.
- Two Homes: no advertising vendor scripts or events. Clarity is not loaded on either new planning product. The delivery page remains tracker-free. Existing older storefront tracking is unchanged; site-wide consent compliance is not asserted.
- Google Ads returned **no non-removed conversion actions**. No Google purchase tag has been invented or reported verified. Real purchase receipt and platform event validation remain launch gates.

## Accounts and spending controls

- Google read-only MCP verified production account THAMANVI `6320667331`, INR, Asia/Calcutta. Query returned **no non-removed campaigns**. Two existing unused budgets are DAILY (INR1,000 and INR10) with zero total-budget amounts; neither is a $45 pilot hard cap. No account budget or unrelated campaign was changed.
- Google currently documents campaign total budgets for Search, including Manual CPC; actual account/UI eligibility and a fixed total budget plus dates must be verified on the intended new paused campaign before launch. Daily budgets or delayed pause rules alone are insufficient. [Google documentation](https://support.google.com/google-ads/answer/10486938)
- Meta GROW+ portfolio `2979896502217583`, account `1011645257952747`: refreshed campaign list showed all 10 campaigns off or in draft. Existing PROMPTPACK pixel `2116311975585050` is available here and has historical activity; that is not proof of new-product purchases. Seven pre-existing unpublished changes remain untouched.
- Separate PROMPTPACK portfolio `2438324489980771`, account `1498609515654790` (`promptpack pixel`): one unrelated unpublished campaign, off, $5 daily, three unpublished changes; no connected dataset was offered. No pixel sharing or permission changes were made.
- Intended Meta pilot account still requires a deliberate choice consistent with the existing pixel. Do not blanket publish/discard drafts or apply an account-wide limit affecting unrelated work. A new paused Meta pilot needs its own lifetime budget and end date, verified in the actual account.
- Before setting any INR budget, include verified exchange-rate/tax/fee headroom so total cash outlay stays inside the approved allocation. Reserve remains unspent. Expired Google promotional credit is excluded.

## Remaining sequence

1. Branch push, draft PR and initial Vercel preview deployment are complete. Resolve the Razorpay international-card rejection and verify the intended test/live merchant configuration. Preserve the shared account's existing credentials and other businesses.
2. Complete a successful USD processor test with captured verification, protected download and delivery checks. Preview measurement must remain disabled. Failed test recovery and deployed archive readiness have already been verified.
3. Deploy through the configured GitHub workflow only after the payment blocker, review and validation are resolved, preserving concurrent main changes and applicable production approval. Verify the production deployment SHA and live URLs; do not equate push success with deployment success.
4. Have the owner complete a real production purchase or an appropriately configured processor test. Verify captured receipt, exact protected download, webhook/email behavior, and a consented platform Purchase event with matching order ID/value/currency. Do not fabricate a transaction or event.
5. Configure/verify Google purchase conversion measurement, select the Meta pilot account, and verify isolated total/lifetime budgets, dates, and cash headroom. Keep both pilot campaigns paused. Launch only after the production delivery, measurement, privacy, and spend gates pass and the owner authorizes activation.

Native Excel/import compatibility and real-user usability validation remain outstanding; current product pages disclose the compatibility limitation. No profitability or scale claim is supported by these checks.
