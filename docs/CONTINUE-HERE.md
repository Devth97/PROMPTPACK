# Continue PromptPack product launch

Owner is moving to a new chat in the SAME project to restore browser access. Do not restart research or rebuild everything. Working repository: D:\promptpack\promptpack-repo, remote Devth97/PROMPTPACK, branch feature/planning-products. Main before work was bc3491bd829bbf7e9d2b40a19ba2843f84ffb4c2. Spec checkpoint cc9130e.

## Launch verification checkpoint — 8 November 2026

Read docs/planning-launch-readiness.md before resuming. Local reviewed code is committed through 7a8d5a5; latest main changes through f824308 are preserved. Production planning URLs still returned 404. PLANNING_FILE_KEY is now securely saved in the existing Vercel project's Production and Preview environments; existing keys are intact, but a new deployment is needed. No plaintext paid assets or secrets were committed.

25 focused automated checks, both simulated purchase/download flows, independent review and responsive/failure-state browser QA passed. New planning pages now use scoped consent-aware measurement; Two Homes has no advertising tracking. See the detailed report for actual account IDs, pixel ownership and missing purchase conversion/hard-cap gates. All inspected Meta campaigns were off/drafts; Google had no non-removed campaigns. No new planning ads were created or activated.

Owner explicitly approved the branch upload and PR. Code commit 7a8d5a5 is pushed; draft PR https://github.com/Devth97/PROMPTPACK/pull/6 is open. Vercel preview FZmiLGr1UtoQtbKaMPPC1Pjtvyxj passed and is Ready at https://promptpack-site-dnzrm15ie-khalandar-s-projects.vercel.app. Both authenticated preview readiness APIs returned ready:true, $49 USD. A real Razorpay test-mode order/popup worked, but the published international test card was rejected with International cards are not supported. No successful payment, receipt, token or deployed download was produced. Resolve merchant international-card eligibility/test-live configuration before any production merge or deployment. Do not replace shared merchant credentials or infer live capability from this test. Preview requires normal Vercel authentication; protection was not bypassed. Keep all campaigns paused. See docs/planning-launch-readiness.md for the detailed test and remaining gates.

## Google Ads MCP setup completed 8 November 2026

Explorer access was verified in Google Cloud for My First Project, project arctic-plasma-468112-v5, under khalandarthameem97@gmail.com. Google Ads API is enabled. Do not submit another access application. No projects were deleted and no quota request was submitted.

OAuth branding PromptPack Google Ads MCP was created in External / Testing mode. Desktop OAuth client PromptPack local Google Ads MCP is designated for an AI-powered agent. Only the owner's Google account was added as a test user. The owner completed Google's OAuth consent. ADC uses the single adwords scope and the project as quota project; no cloud-platform scope was requested.

Credentials are outside the repository in C:\Users\KhalandarThameem\AppData\Local\PromptPack\GoogleAds\application_default_credentials.json; downloaded client configuration is oauth-client.json in the same owner/SYSTEM-restricted directory. Do not print, paste, or commit credential contents. The OAuth app is still Testing: Google documents a seven-day refresh-token lifetime for this scope in Testing. Reauthorization or an appropriate production OAuth setup will be needed later. No production publishing or brand verification was performed.

Official MCP googleads/google-ads-mcp commit 84aebf819eebc3d8dda6ee693c1bdb5fcf5d36d9, version 0.0.6, is installed at C:\Users\KhalandarThameem\.local\bin\google-ads-mcp.exe. IMPORTANT correction: this installed release has write tools by default. A private tools-readonly.yaml explicitly enables customers/search/metadata and disables labels/assets. It is supplied through GOOGLE_ADS_MCP_TOOLS_CONFIG, so a missing explicit file fails closed. Do not register using the older scripts/planning-products/connect-google-ads.ps1 unchanged; it omits this read-only configuration.

Registered global Codex MCP name google-ads-readonly with GOOGLE_PROJECT_ID and GOOGLE_CLOUD_PROJECT set to arctic-plasma-468112-v5, GOOGLE_APPLICATION_CREDENTIALS set to the private ADC path, and GOOGLE_ADS_MCP_TOOLS_CONFIG set to the private YAML path. Registration was read back and enabled. A Codex client reload/restart may be needed for tool discovery; the active chat's newly refreshed tool catalog has not been verified.

An actual stdio MCP handshake exposed EXACTLY customers_list_accessible_customers, metadata_get_resource_metadata, and search_search. Both read-only calls passed: list_accessible_customers returned only 6320667331; search of customer returned THAMANVI, ID 6320667331, currency INR, time zone Asia/Calcutta, test_account false. This was a real production-account API query, not a mock. No ads or account mutations were performed by the MCP. Sandbox verification could not read the deliberately owner-restricted credential folder; the same verification succeeded outside that sandbox without weakening permissions.

Next launch work: securely configure the new fulfillment key and verify production delivery, tracking/consent, responsive QA, and bounded spend controls before any campaign launch. Keep campaigns paused. Review and push branch / open a reviewable PR when ready; do not present a push as a verified production deployment.

## Credit verified, not usable

Billing > Promotions showed spend INR20,000 to earn INR20,000, redeemed 30 June 2026, requirements due 29 August 2026, status EXPIRED, credits granted blank. Promotional offers expanded showed No offers available. No current usable credit observed. Screenshots in output/planning-products/google-promotion-status.png and google-cloud-project-limit.png. Do not spend to pursue this expired offer or create another account to bypass eligibility.

## Products created locally

The Wedding Decision Kit and Two Homes, One Organizer, $49 USD each. Files at output/planning-products/<slug>/: START-HERE.xlsx, EXAMPLE.xlsx, guides and README.txt, plus customer ZIP. These ZIPs are paid product downloads, not deployment archives. Blank/example Excel workbooks have six sheets each. Wedding guide five pages including one interactive worksheet; Two Homes guides six pages each in A4 and US Letter, each with two interactive worksheets.

54 independent cached-value assertions passed across examples, blank workbooks and nine scenarios. PDF field-tree/widget/value/appearance checks passed, including filled-form rendering after init_forms(). All sheets/pages visually inspected. Native desktop Excel and Google Sheets import NOT verified; sales pages disclose this. Need real-user usability validation before calling them market-validated or scale-ready.

New product pages and checkout pages built under products/<slug>/ and checkout/<slug>/; homepage shelf links added. Public images are actual fictional workbook previews. Purchase links remain hidden / buttons disabled unless /api/planning-status verifies deployment configuration and exact encrypted archive. New products use server-owned $49 USD only. Five new automated tests and both local mocked purchase-to-download flows passed. These are simulated payments, not real orders.

Legacy payment suite attempted: failures because this fresh sparse checkout lacks old private archives and fulfillment keys. Do NOT report whole suite green, replace old keys or fabricate legacy archives. Existing product entitlements preserved. Private original sources remain absent.

## Secrets and deployment

New customer ZIPs encrypted in private/products/<slug>.enc, metadata in api/_planning-products.json. Dedicated key PLANNING_FILE_KEY exists in ignored .env.planning and is now securely saved as Secret in the existing Vercel Production and Preview environments. Do not print/paste/commit it. A new verified deployment is required before production checkout can open. Existing DOWNLOAD_FILE_KEY and other keys must remain intact. No Vercel credentials or local Vercel auth found. Existing deployment workflow is GitHub-connected; no deployment ZIP. Branch work is not yet a verified production release.

## Advertising

$150 TOTAL cash cap approved across both platforms/products. Proposal: $60 wedding Meta, $45 wedding Google Search, $45 held reserve. Local drafts only in catalog/planning-ad-drafts.json and catalog/planning-ad-assets/. Four static images, two concepts/product, Search copy/keywords. Google headline checks passed. One description was 1 char too long and shortened afterward; recheck final descriptions via available utility. No ads created or launched, no spend incurred by agent. Need verify production checkout, tracking/consent, actual account and hard spend controls first. Google daily budget alone is NOT a $45 total cap.

Meta screenshot showed GROW+ account1011645257952747 selected and separate PROMPTPACK portfolio; SEVEN pre-existing unpublished changes. Preserve all, do not blanket publish/discard. Verify intended account. Supermetrics trial was valid through22Nov but Meta and Google data sources not authorized at last check; tools later disappeared when plugin set changed. Don't assume connected. User may prefer official MCP now.

Two Homes advertising: no inferred divorce-status targeting, sensitive customer lists or hardship remarketing. No legal/court-outcome promises. It is personal organization using an existing arrangement. Market evidence is not proof of profitable sales. 2,041 x $49 = $100,009 gross before costs; not a forecast.

## Useful commands / runtime

node --test tests/planning-products.test.js
node scripts/planning-products/check-delivery.js
node scripts/build-planning-products.js

Bundled Node: C:\Users\KhalandarThameem\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe
Bundled Python: C:\Users\KhalandarThameem\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe
Bundled artifact-tool resolved through ignored scripts/planning-products/node_modules junction. Do not commit dependencies. Rebuild instructions in docs/planning-products-launch.md. Plaintext paid files remain ignored in output/. Old GitHub auth active itadminprorack has WRITE access; Devth97 is also an authenticated inactive account. Never expose credentials.

## Remaining delivery work

Google Ads MCP setup and a real read-only account query are complete (see above). Securely configure new fulfillment key and deploy through GitHub workflow when ready, verify production delivery and tracking. Do responsive browser QA on both pages/checkout (desktop wedding checked; mobile and second product pending). Recheck full-size sheets with long headers if editing. Native Excel compatibility and user usability testing still pending. Review and push branch / open reviewable PR; do not present push as production verification. Keep all campaigns paused until launch prerequisites and bounded spending controls are actually met.
