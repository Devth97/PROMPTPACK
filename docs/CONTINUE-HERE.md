# Continue PromptPack product launch

Owner is moving to a new chat in the SAME project to restore browser access. Do not restart research or rebuild everything. Working repository: D:\promptpack\promptpack-repo, remote Devth97/PROMPTPACK, branch feature/planning-products. Main before work was bc3491bd829bbf7e9d2b40a19ba2843f84ffb4c2. Spec checkpoint cc9130e.

## Next action: Google Ads MCP setup in browser

Owner explicitly asked to use their browser and authorized using an existing project when new-project creation hit the project limit. No project deletion or quota request was authorized/submitted. Existing chosen project is My First Project, ID arctic-plasma-468112-v5, under khalandarthameem97@gmail.com. Owner explicitly approved enabling Google Ads API and accepting its API terms. API was enabled successfully.

Resume at https://console.cloud.google.com/google/ads-apis/overview?project=arctic-plasma-468112-v5 . Last verified access level: Test, which cannot access production ad accounts. Clicked Apply for access for Explorer; page showed Processing. Browser control became disabled before observing result. FIRST verify whether Explorer is granted; do not submit duplicate applications or assume approval. Then configure OAuth/ADC securely and verify an actual read-only account query.

Official MCP installed locally using uv, pinned to googleads/google-ads-mcp commit 84aebf819eebc3d8dda6ee693c1bdb5fcf5d36d9, version 0.0.6. Executable C:\Users\KhalandarThameem\.local\bin\google-ads-mcp.exe . Requires GOOGLE_PROJECT_ID and OAuth/ADC. No credentials or MCP client registration yet. gcloud absent; uv available. scripts/planning-products/connect-google-ads.ps1 registers Codex after credentials exist outside repo. Official MCP is READ-ONLY: use API write tooling or authorized browser flows for paused campaign creation. Current official docs say developer tokens sunset September 2026; verify latest official guide, do not follow older token instructions blindly.

Google ad account owner chose: THAMANVI, customer ID 632-066-7331. Browser previously had tab ID1974114990. Cloud tab1974115003. Re-inventory in the new chat; don't assume these handles persist.

## Credit verified, not usable

Billing > Promotions showed spend INR20,000 to earn INR20,000, redeemed 30 June 2026, requirements due 29 August 2026, status EXPIRED, credits granted blank. Promotional offers expanded showed No offers available. No current usable credit observed. Screenshots in output/planning-products/google-promotion-status.png and google-cloud-project-limit.png. Do not spend to pursue this expired offer or create another account to bypass eligibility.

## Products created locally

The Wedding Decision Kit and Two Homes, One Organizer, $49 USD each. Files at output/planning-products/<slug>/: START-HERE.xlsx, EXAMPLE.xlsx, guides and README.txt, plus customer ZIP. These ZIPs are paid product downloads, not deployment archives. Blank/example Excel workbooks have six sheets each. Wedding guide five pages including one interactive worksheet; Two Homes guides six pages each in A4 and US Letter, each with two interactive worksheets.

54 independent cached-value assertions passed across examples, blank workbooks and nine scenarios. PDF field-tree/widget/value/appearance checks passed, including filled-form rendering after init_forms(). All sheets/pages visually inspected. Native desktop Excel and Google Sheets import NOT verified; sales pages disclose this. Need real-user usability validation before calling them market-validated or scale-ready.

New product pages and checkout pages built under products/<slug>/ and checkout/<slug>/; homepage shelf links added. Public images are actual fictional workbook previews. Purchase links remain hidden / buttons disabled unless /api/planning-status verifies deployment configuration and exact encrypted archive. New products use server-owned $49 USD only. Five new automated tests and both local mocked purchase-to-download flows passed. These are simulated payments, not real orders.

Legacy payment suite attempted: failures because this fresh sparse checkout lacks old private archives and fulfillment keys. Do NOT report whole suite green, replace old keys or fabricate legacy archives. Existing product entitlements preserved. Private original sources remain absent.

## Secrets and deployment

New customer ZIPs encrypted in private/products/<slug>.enc, metadata in api/_planning-products.json. Dedicated key PLANNING_FILE_KEY exists ONLY in ignored .env.planning. Do not print/paste/commit it. It must be securely configured on existing Vercel deployment before production checkout can open. Existing DOWNLOAD_FILE_KEY and other keys must remain intact. No Vercel credentials or local Vercel auth found. Existing deployment workflow is GitHub-connected; no deployment ZIP. Branch work is not yet a verified production release.

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

Finish browser API access/OAuth and read-only MCP query. Securely configure new fulfillment key and deploy through GitHub workflow when ready, verify production delivery and tracking. Do responsive browser QA on both pages/checkout (desktop wedding checked; mobile and second product pending). Recheck full-size sheets with long headers if editing. Native Excel compatibility and user usability testing still pending. Review and push branch / open reviewable PR; do not present push as production verification. Keep all campaigns paused until launch prerequisites and bounded spending controls are actually met.
